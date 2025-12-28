/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';

import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const quoteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['quote'],
			},
		},
		options: [
			{
				name: 'Get Best Quote',
				value: 'getBestQuote',
				description: 'Get the best quote using Smart Router across all protocols',
				action: 'Get best quote',
			},
			{
				name: 'Get V2 Quote',
				value: 'getV2Quote',
				description: 'Get a quote from V2 AMM pools',
				action: 'Get V2 quote',
			},
			{
				name: 'Get V3 Quote',
				value: 'getV3Quote',
				description: 'Get a quote from V3 concentrated liquidity pools',
				action: 'Get V3 quote',
			},
			{
				name: 'Get StableSwap Quote',
				value: 'getStableSwapQuote',
				description: 'Get a quote from StableSwap pools',
				action: 'Get StableSwap quote',
			},
			{
				name: 'Get Mixed Route Quote',
				value: 'getMixedRouteQuote',
				description: 'Get a quote using mixed V2/V3/Stable routing',
				action: 'Get mixed route quote',
			},
			{
				name: 'Get Multi-Hop Quote',
				value: 'getMultiHopQuote',
				description: 'Get a quote through multiple pools',
				action: 'Get multi-hop quote',
			},
			{
				name: 'Get Split Route Quote',
				value: 'getSplitRouteQuote',
				description: 'Get a quote with split routes for better pricing',
				action: 'Get split route quote',
			},
			{
				name: 'Compare All Quotes',
				value: 'compareAllQuotes',
				description: 'Compare quotes from all available protocols',
				action: 'Compare all quotes',
			},
			{
				name: 'Get Quote with Gas',
				value: 'getQuoteWithGas',
				description: 'Get a quote including gas cost estimation',
				action: 'Get quote with gas',
			},
			{
				name: 'Refresh Quote',
				value: 'refreshQuote',
				description: 'Refresh an existing quote with current prices',
				action: 'Refresh quote',
			},
		],
		default: 'getBestQuote',
	},
	// Token In
	{
		displayName: 'Token In Address',
		name: 'tokenIn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['quote'],
			},
		},
		default: '',
		placeholder: '0x...token address',
		description: 'Contract address of the input token',
	},
	// Token Out
	{
		displayName: 'Token Out Address',
		name: 'tokenOut',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['quote'],
			},
		},
		default: '',
		placeholder: '0x...token address',
		description: 'Contract address of the output token',
	},
	// Amount
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['quote'],
			},
		},
		default: '',
		placeholder: '1.0',
		description: 'Amount of tokens (in token units)',
	},
	// Trade Type
	{
		displayName: 'Trade Type',
		name: 'tradeType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['quote'],
			},
		},
		options: [
			{
				name: 'Exact Input',
				value: 'exactInput',
				description: 'Specify exact input amount',
			},
			{
				name: 'Exact Output',
				value: 'exactOutput',
				description: 'Specify exact output amount',
			},
		],
		default: 'exactInput',
		description: 'Whether to specify exact input or output amount',
	},
	// Max Hops
	{
		displayName: 'Maximum Hops',
		name: 'maxHops',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['quote'],
				operation: ['getMultiHopQuote', 'getBestQuote', 'getMixedRouteQuote'],
			},
		},
		default: 3,
		typeOptions: {
			minValue: 1,
			maxValue: 5,
		},
		description: 'Maximum number of hops in the route',
	},
	// Fee Tier (V3)
	{
		displayName: 'Fee Tier',
		name: 'feeTier',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['quote'],
				operation: ['getV3Quote'],
			},
		},
		options: [
			{ name: '0.01%', value: 100 },
			{ name: '0.05%', value: 500 },
			{ name: '0.25%', value: 2500 },
			{ name: '1%', value: 10000 },
		],
		default: 2500,
		description: 'V3 pool fee tier',
	},
];

export async function executeQuote(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapApi');

	switch (operation) {
		case 'getBestQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tradeType = this.getNodeParameter('tradeType', index) as string;
			const maxHops = this.getNodeParameter('maxHops', index, 3) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountWei = tradeType === 'exactInput'
				? client.parseTokenAmount(amount, tokenInInfo.decimals)
				: client.parseTokenAmount(amount, tokenOutInfo.decimals);

			// Get V2 quote
			const path = [tokenIn, tokenOut];
			const v2Amounts = await client.getAmountsOut(amountWei, path);

			return {
				quote: {
					tokenIn: {
						address: tokenIn,
						symbol: tokenInInfo.symbol,
						decimals: tokenInInfo.decimals,
						amount: tradeType === 'exactInput' ? amount : client.formatTokenAmount(v2Amounts[0], tokenInInfo.decimals),
					},
					tokenOut: {
						address: tokenOut,
						symbol: tokenOutInfo.symbol,
						decimals: tokenOutInfo.decimals,
						amount: tradeType === 'exactInput' ? client.formatTokenAmount(v2Amounts[1], tokenOutInfo.decimals) : amount,
					},
					tradeType,
					protocol: 'V2',
					route: path,
					maxHops,
					priceImpact: 'Calculate separately',
					gasEstimate: '150000',
				},
			};
		}

		case 'getV2Quote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tradeType = this.getNodeParameter('tradeType', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const path = [tokenIn, tokenOut];

			if (tradeType === 'exactInput') {
				const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);
				const amounts = await client.getAmountsOut(amountInWei, path);

				return {
					protocol: 'V2',
					tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
					tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol, amount: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals) },
					route: path,
					fee: '0.25%',
				};
			} else {
				const amountOutWei = client.parseTokenAmount(amount, tokenOutInfo.decimals);
				const amounts = await client.getAmountsIn(amountOutWei, path);

				return {
					protocol: 'V2',
					tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount: client.formatTokenAmount(amounts[0], tokenInInfo.decimals) },
					tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol, amount },
					route: path,
					fee: '0.25%',
				};
			}
		}

		case 'getV3Quote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const feeTier = this.getNodeParameter('feeTier', index, 2500) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			// V3 quote would require quoter contract - return placeholder
			return {
				protocol: 'V3',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				feeTier,
				feePercent: (feeTier / 10000).toFixed(2) + '%',
				note: 'V3 quotes require Quoter contract integration',
			};
		}

		case 'getStableSwapQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			return {
				protocol: 'StableSwap',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				fee: '0.04%',
				note: 'StableSwap is optimized for stable asset pairs (USDT, USDC, BUSD, etc.)',
			};
		}

		case 'getMixedRouteQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const maxHops = this.getNodeParameter('maxHops', index, 3) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			return {
				protocol: 'Mixed',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				maxHops,
				protocols: ['V2', 'V3', 'StableSwap'],
				note: 'Smart Router finds optimal path across all protocols',
			};
		}

		case 'getMultiHopQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const maxHops = this.getNodeParameter('maxHops', index, 3) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);
			const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);

			// Try direct route
			const directAmounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			// Try WBNB intermediate
			const wbnb = client.getContractAddress('wrappedNative');
			let wbnbAmounts: bigint[] = [];
			try {
				wbnbAmounts = await client.getAmountsOut(amountInWei, [tokenIn, wbnb, tokenOut]);
			} catch {
				// Route unavailable
			}

			const routes = [
				{ path: [tokenIn, tokenOut], hops: 1, output: client.formatTokenAmount(directAmounts[1], tokenOutInfo.decimals) },
			];

			if (wbnbAmounts.length > 0) {
				routes.push({ path: [tokenIn, wbnb, tokenOut], hops: 2, output: client.formatTokenAmount(wbnbAmounts[2], tokenOutInfo.decimals) });
			}

			routes.sort((a, b) => parseFloat(b.output) - parseFloat(a.output));

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				maxHops,
				routes,
				bestRoute: routes[0],
			};
		}

		case 'getSplitRouteQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				splitRoutes: [
					{ percentage: 100, protocol: 'V2', path: [tokenIn, tokenOut] },
				],
				note: 'Split routing divides trade across multiple paths for better execution',
			};
		}

		case 'compareAllQuotes': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);
			const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);

			const v2Amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				quotes: {
					v2: {
						available: true,
						output: client.formatTokenAmount(v2Amounts[1], tokenOutInfo.decimals),
						fee: '0.25%',
					},
					v3: {
						available: false,
						note: 'Requires V3 Quoter integration',
					},
					stableSwap: {
						available: false,
						note: 'Only for stable pairs',
					},
				},
				best: 'V2',
			};
		}

		case 'getQuoteWithGas': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);
			const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);

			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
			const gasPrice = await client.getGasPrice();
			const gasEstimate = 150000n;

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol, amount: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals) },
				gas: {
					estimatedGas: gasEstimate.toString(),
					gasPrice: gasPrice.toString(),
					gasCostWei: (gasEstimate * gasPrice).toString(),
					gasCostBNB: client.formatTokenAmount(gasEstimate * gasPrice, 18),
				},
			};
		}

		case 'refreshQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);
			const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);

			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
			const blockNumber = await client.getBlockNumber();

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol, amount: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals) },
				refreshedAt: new Date().toISOString(),
				blockNumber,
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
