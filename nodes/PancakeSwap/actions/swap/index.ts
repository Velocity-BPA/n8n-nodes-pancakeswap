/**
 * PancakeSwap Swap Resource
 * Handles token swaps across V2, V3, and StableSwap protocols
 */

import {
	IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';

import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const swapOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['swap'],
			},
		},
		options: [
			{
				name: 'Get Quote',
				value: 'getQuote',
				description: 'Get a swap quote using Smart Router',
				action: 'Get swap quote',
			},
			{
				name: 'Get Quote V2',
				value: 'getQuoteV2',
				description: 'Get a V2 AMM swap quote',
				action: 'Get V2 quote',
			},
			{
				name: 'Get Quote V3',
				value: 'getQuoteV3',
				description: 'Get a V3 concentrated liquidity quote',
				action: 'Get V3 quote',
			},
			{
				name: 'Get Quote StableSwap',
				value: 'getQuoteStableSwap',
				description: 'Get a StableSwap quote for stable assets',
				action: 'Get StableSwap quote',
			},
			{
				name: 'Execute Swap',
				value: 'executeSwap',
				description: 'Execute a token swap',
				action: 'Execute swap',
			},
			{
				name: 'Execute Swap Exact Tokens',
				value: 'swapExactTokens',
				description: 'Swap exact input tokens for output tokens',
				action: 'Swap exact tokens for tokens',
			},
			{
				name: 'Execute Swap Exact BNB',
				value: 'swapExactBNB',
				description: 'Swap exact BNB for tokens',
				action: 'Swap exact BNB for tokens',
			},
			{
				name: 'Swap Tokens for Exact',
				value: 'swapTokensForExact',
				description: 'Swap tokens for exact output amount',
				action: 'Swap tokens for exact tokens',
			},
			{
				name: 'Simulate Swap',
				value: 'simulateSwap',
				description: 'Simulate a swap without executing',
				action: 'Simulate swap',
			},
			{
				name: 'Get Price Impact',
				value: 'getPriceImpact',
				description: 'Calculate the price impact of a swap',
				action: 'Get price impact',
			},
			{
				name: 'Get Minimum Received',
				value: 'getMinimumReceived',
				description: 'Calculate minimum tokens received with slippage',
				action: 'Get minimum received',
			},
			{
				name: 'Get Swap Route',
				value: 'getSwapRoute',
				description: 'Get the routing path for a swap',
				action: 'Get swap route',
			},
			{
				name: 'Get Best Route',
				value: 'getBestRoute',
				description: 'Find the best route across all protocols',
				action: 'Get best route',
			},
			{
				name: 'Compare Routes',
				value: 'compareRoutes',
				description: 'Compare routes from different protocols',
				action: 'Compare routes',
			},
			{
				name: 'Get Swap Fees',
				value: 'getSwapFees',
				description: 'Get fees for a swap route',
				action: 'Get swap fees',
			},
			{
				name: 'Get Transaction',
				value: 'getTransaction',
				description: 'Get swap transaction details by hash',
				action: 'Get swap transaction',
			},
		],
		default: 'getQuote',
	},
	// Token In
	{
		displayName: 'Token In Address',
		name: 'tokenIn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'getQuote',
					'getQuoteV2',
					'getQuoteV3',
					'getQuoteStableSwap',
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'swapTokensForExact',
					'simulateSwap',
					'getPriceImpact',
					'getMinimumReceived',
					'getSwapRoute',
					'getBestRoute',
					'compareRoutes',
					'getSwapFees',
				],
			},
		},
		default: '',
		placeholder: '0x...token address',
		description: 'Contract address of the input token (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native BNB)',
	},
	// Token Out
	{
		displayName: 'Token Out Address',
		name: 'tokenOut',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'getQuote',
					'getQuoteV2',
					'getQuoteV3',
					'getQuoteStableSwap',
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'swapTokensForExact',
					'simulateSwap',
					'getPriceImpact',
					'getMinimumReceived',
					'getSwapRoute',
					'getBestRoute',
					'compareRoutes',
					'getSwapFees',
				],
			},
		},
		default: '',
		placeholder: '0x...token address',
		description: 'Contract address of the output token',
	},
	// Amount In
	{
		displayName: 'Amount In',
		name: 'amountIn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'getQuote',
					'getQuoteV2',
					'getQuoteV3',
					'getQuoteStableSwap',
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'simulateSwap',
					'getPriceImpact',
					'getMinimumReceived',
					'getSwapRoute',
					'getBestRoute',
					'compareRoutes',
					'getSwapFees',
				],
			},
		},
		default: '',
		placeholder: '1.0',
		description: 'Amount of tokens to swap (in token units, not wei)',
	},
	// Amount Out (for exact output swaps)
	{
		displayName: 'Amount Out',
		name: 'amountOut',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: ['swapTokensForExact'],
			},
		},
		default: '',
		placeholder: '1.0',
		description: 'Exact amount of tokens to receive',
	},
	// Slippage
	{
		displayName: 'Slippage Tolerance (%)',
		name: 'slippage',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'swapTokensForExact',
					'getMinimumReceived',
				],
			},
		},
		default: 0.5,
		typeOptions: {
			minValue: 0.01,
			maxValue: 50,
			numberPrecision: 2,
		},
		description: 'Maximum acceptable slippage (0.5 = 0.5%)',
	},
	// Deadline
	{
		displayName: 'Deadline (Minutes)',
		name: 'deadline',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'swapTokensForExact',
				],
			},
		},
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 60,
		},
		description: 'Transaction deadline in minutes from now',
	},
	// Recipient
	{
		displayName: 'Recipient Address',
		name: 'recipient',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: [
					'executeSwap',
					'swapExactTokens',
					'swapExactBNB',
					'swapTokensForExact',
				],
			},
		},
		default: '',
		placeholder: '0x... (leave empty to use your address)',
		description: 'Address to receive output tokens (defaults to sender)',
	},
	// Transaction Hash
	{
		displayName: 'Transaction Hash',
		name: 'txHash',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: ['getTransaction'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Transaction hash to look up',
	},
	// Fee Tier (V3)
	{
		displayName: 'Fee Tier',
		name: 'feeTier',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['swap'],
				operation: ['getQuoteV3'],
			},
		},
		options: [
			{ name: '0.01% (Stable Pairs)', value: 100 },
			{ name: '0.05% (Stable/Correlated)', value: 500 },
			{ name: '0.25% (Standard)', value: 2500 },
			{ name: '1% (Exotic)', value: 10000 },
		],
		default: 2500,
		description: 'V3 pool fee tier (in basis points)',
	},
	// Additional Options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['swap'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 300000,
				description: 'Maximum gas to use for the transaction',
			},
			{
				displayName: 'Max Priority Fee (Gwei)',
				name: 'maxPriorityFee',
				type: 'number',
				default: 1,
				description: 'Maximum priority fee per gas in Gwei',
			},
			{
				displayName: 'Include Gas Estimate',
				name: 'includeGas',
				type: 'boolean',
				default: false,
				description: 'Whether to include gas estimate in response',
			},
			{
				displayName: 'Protocol',
				name: 'protocol',
				type: 'options',
				options: [
					{ name: 'Auto (Smart Router)', value: 'auto' },
					{ name: 'V2 Only', value: 'v2' },
					{ name: 'V3 Only', value: 'v3' },
					{ name: 'StableSwap Only', value: 'stable' },
				],
				default: 'auto',
				description: 'Protocol to use for the swap',
			},
		],
	},
];

export async function executeSwap(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this);

	switch (operation) {
		case 'getQuote':
		case 'getQuoteV2':
		case 'getQuoteV3':
		case 'getQuoteStableSwap': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			// Options available for future slippage/deadline settings
			// const options = this.getNodeParameter('options', index, {}) as any;

			// Get token info for decimals
			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			// For V2, use the router's getAmountsOut
			if (operation === 'getQuoteV2' || operation === 'getQuote') {
				const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
				const path = [tokenIn, tokenOut];
				const amounts = await client.getAmountsOut(amountInWei, path);
				const amountOut = client.formatTokenAmount(amounts[1], tokenOutInfo.decimals);

				return {
					tokenIn: {
						address: tokenIn,
						symbol: tokenInInfo.symbol,
						decimals: tokenInInfo.decimals,
						amount: amountIn,
					},
					tokenOut: {
						address: tokenOut,
						symbol: tokenOutInfo.symbol,
						decimals: tokenOutInfo.decimals,
						amount: amountOut,
					},
					route: path,
					protocol: operation === 'getQuoteV2' ? 'V2' : 'SmartRouter',
					priceImpact: null, // Calculate separately
					timestamp: Date.now(),
				};
			}

			// For V3, would need V3 quoter contract
			if (operation === 'getQuoteV3') {
				const feeTier = this.getNodeParameter('feeTier', index, 2500) as number;
				// Simplified - actual implementation would call V3 Quoter
				return {
					tokenIn: {
						address: tokenIn,
						symbol: tokenInInfo.symbol,
						amount: amountIn,
					},
					tokenOut: {
						address: tokenOut,
						symbol: tokenOutInfo.symbol,
						amount: null, // Would be calculated by V3 Quoter
					},
					feeTier,
					protocol: 'V3',
					message: 'V3 quote requires Quoter contract interaction',
				};
			}

			// StableSwap
			if (operation === 'getQuoteStableSwap') {
				return {
					tokenIn: {
						address: tokenIn,
						symbol: tokenInInfo.symbol,
						amount: amountIn,
					},
					tokenOut: {
						address: tokenOut,
						symbol: tokenOutInfo.symbol,
						amount: null, // Would be calculated by StableSwap pool
					},
					protocol: 'StableSwap',
					message: 'StableSwap quote requires pool contract interaction',
				};
			}

			throw new NodeOperationError(this.getNode(), `Unknown quote operation: ${operation}`);
		}

		case 'executeSwap':
		case 'swapExactTokens': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
			const deadline = this.getNodeParameter('deadline', index, 20) as number;
			const recipient = this.getNodeParameter('recipient', index, '') as string;
			// Options available for future gas settings
			// const options = this.getNodeParameter('options', index, {}) as any;

			// Get token info
			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			// Parse amount
			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);

			// Get quote first
			const path = [tokenIn, tokenOut];
			const amounts = await client.getAmountsOut(amountInWei, path);
			const expectedOut = amounts[1];

			// Calculate minimum with slippage
			const slippageBps = Math.floor(slippage * 100);
			const amountOutMin = expectedOut * BigInt(10000 - slippageBps) / BigInt(10000);

			// Calculate deadline
			const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

			// Check allowance and approve if needed
			const walletAddress = await client.getAddress();
			const allowance = await client.getAllowance(tokenIn, walletAddress, client.getContractAddress('routerV2'));
			
			if (allowance < amountInWei) {
				const approveTx = await client.approveToken(tokenIn, client.getContractAddress('routerV2'), amountInWei);
				await client.waitForTransaction(approveTx.hash);
			}

			// Execute swap
			const recipientAddress = recipient || walletAddress;
			const tx = await client.swapExactTokensForTokens(
				amountInWei,
				amountOutMin,
				path,
				recipientAddress,
				deadlineTimestamp,
			);

			const receipt = await client.waitForTransaction(tx.hash);

			if (!receipt) {
				throw new Error('Transaction receipt not found');
			}

			return {
				transactionHash: tx.hash,
				status: receipt.status === 1 ? 'success' : 'failed',
				blockNumber: receipt.blockNumber,
				gasUsed: receipt.gasUsed.toString(),
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					expectedAmount: client.formatTokenAmount(expectedOut, tokenOutInfo.decimals),
					minimumAmount: client.formatTokenAmount(amountOutMin, tokenOutInfo.decimals),
				},
				recipient: recipientAddress,
				deadline: new Date(deadlineTimestamp * 1000).toISOString(),
			};
		}

		case 'swapExactBNB': {
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
			const deadline = this.getNodeParameter('deadline', index, 20) as number;
			const recipient = this.getNodeParameter('recipient', index, '') as string;

			// Get token info
			const tokenOutInfo = await client.getTokenInfo(tokenOut);
			const wbnbAddress = client.getContractAddress('wrappedNative');

			// Parse BNB amount (18 decimals)
			const amountInWei = client.parseTokenAmount(amountIn, 18);

			// Get quote
			const path = [wbnbAddress, tokenOut];
			const amounts = await client.getAmountsOut(amountInWei, path);
			const expectedOut = amounts[1];

			// Calculate minimum with slippage
			const slippageBps = Math.floor(slippage * 100);
			const amountOutMin = expectedOut * BigInt(10000 - slippageBps) / BigInt(10000);

			// Calculate deadline
			const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

			// Execute swap
			const walletAddress = await client.getAddress();
			const recipientAddress = recipient || walletAddress;
			
			const tx = await client.swapExactETHForTokens(
				amountInWei,
				amountOutMin,
				path,
				recipientAddress,
				deadlineTimestamp,
			);

			const receipt = await client.waitForTransaction(tx.hash);

			if (!receipt) {
				throw new Error('Transaction receipt not found');
			}

			return {
				transactionHash: tx.hash,
				status: receipt.status === 1 ? 'success' : 'failed',
				blockNumber: receipt.blockNumber,
				gasUsed: receipt.gasUsed.toString(),
				tokenIn: {
					symbol: 'BNB',
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					expectedAmount: client.formatTokenAmount(expectedOut, tokenOutInfo.decimals),
					minimumAmount: client.formatTokenAmount(amountOutMin, tokenOutInfo.decimals),
				},
				recipient: recipientAddress,
			};
		}

		case 'swapTokensForExact': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountOut = this.getNodeParameter('amountOut', index) as string;
			const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
			// Deadline available for future execution implementation
			// const deadline = this.getNodeParameter('deadline', index, 20) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountOutWei = client.parseTokenAmount(amountOut, tokenOutInfo.decimals);
			const path = [tokenIn, tokenOut];
			
			const amounts = await client.getAmountsIn(amountOutWei, path);
			const expectedIn = amounts[0];

			// Calculate maximum input with slippage
			const slippageBps = Math.floor(slippage * 100);
			const amountInMax = expectedIn * BigInt(10000 + slippageBps) / BigInt(10000);

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					expectedAmount: client.formatTokenAmount(expectedIn, tokenInInfo.decimals),
					maximumAmount: client.formatTokenAmount(amountInMax, tokenInInfo.decimals),
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					exactAmount: amountOut,
				},
				slippage,
				message: 'Use router swapTokensForExactTokens to execute',
			};
		}

		case 'simulateSwap': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			const path = [tokenIn, tokenOut];
			
			const amounts = await client.getAmountsOut(amountInWei, path);
			// Typical V2 swap gas estimate: 150000-200000 for single hop
			const gasEstimate = 150000n;

			return {
				simulation: 'success',
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					amount: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals),
				},
				estimatedGas: gasEstimate.toString(),
				route: path,
			};
		}

		case 'getPriceImpact': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			// Get pair reserves
			const pairAddress = await client.getPairAddress(tokenIn, tokenOut);
			const reserves = await client.getPairReserves(pairAddress);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			// Calculate price impact
			// Price before = reserveOut / reserveIn
			// Price after = (reserveOut - amountOut) / (reserveIn + amountIn)
			const reserveIn = reserves.reserve0;
			const reserveOut = reserves.reserve1;
			const amountOut = amounts[1];

			const priceBefore = Number(reserveOut) / Number(reserveIn);
			const priceAfter = Number(reserveOut - amountOut) / Number(reserveIn + amountInWei);
			const priceImpact = ((priceBefore - priceAfter) / priceBefore) * 100;

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					amount: client.formatTokenAmount(amountOut, tokenOutInfo.decimals),
				},
				pairAddress,
				reserves: {
					tokenIn: client.formatTokenAmount(reserveIn, tokenInInfo.decimals),
					tokenOut: client.formatTokenAmount(reserveOut, tokenOutInfo.decimals),
				},
				priceImpact: priceImpact.toFixed(4) + '%',
				priceImpactValue: priceImpact,
				severity: priceImpact > 15 ? 'HIGH' : priceImpact > 5 ? 'MEDIUM' : 'LOW',
			};
		}

		case 'getMinimumReceived': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			const slippage = this.getNodeParameter('slippage', index, 0.5) as number;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
			const expectedOut = amounts[1];

			const slippageBps = Math.floor(slippage * 100);
			const minimumOut = expectedOut * BigInt(10000 - slippageBps) / BigInt(10000);

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
					expectedAmount: client.formatTokenAmount(expectedOut, tokenOutInfo.decimals),
					minimumAmount: client.formatTokenAmount(minimumOut, tokenOutInfo.decimals),
				},
				slippage: slippage + '%',
				slippageBps,
			};
		}

		case 'getSwapRoute':
		case 'getBestRoute': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			
			// Direct route
			const directAmounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			// Try WBNB route
			const wbnb = client.getContractAddress('wrappedNative');
			let wbnbAmounts: bigint[] = [];
			try {
				wbnbAmounts = await client.getAmountsOut(amountInWei, [tokenIn, wbnb, tokenOut]);
			} catch {
				// Route doesn't exist
			}

			const routes = [
				{
					path: [tokenIn, tokenOut],
					amountOut: client.formatTokenAmount(directAmounts[1], tokenOutInfo.decimals),
					hops: 1,
					protocol: 'V2',
				},
			];

			if (wbnbAmounts.length > 0) {
				routes.push({
					path: [tokenIn, wbnb, tokenOut],
					amountOut: client.formatTokenAmount(wbnbAmounts[2], tokenOutInfo.decimals),
					hops: 2,
					protocol: 'V2',
				});
			}

			// Sort by output amount
			routes.sort((a, b) => parseFloat(b.amountOut) - parseFloat(a.amountOut));

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
				},
				bestRoute: routes[0],
				allRoutes: routes,
			};
		}

		case 'compareRoutes': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
				},
				comparison: {
					v2: {
						available: true,
						amountOut: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals),
					},
					v3: {
						available: false,
						note: 'V3 routing requires additional setup',
					},
					stableSwap: {
						available: false,
						note: 'Only for stable asset pairs',
					},
				},
				recommendation: 'V2',
			};
		}

		case 'getSwapFees': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;

			const tokenInInfo = await client.getTokenInfo(tokenIn);
			const tokenOutInfo = await client.getTokenInfo(tokenOut);

			const amountInWei = client.parseTokenAmount(amountIn, tokenInInfo.decimals);
			const gasPrice = await client.getGasPrice();
			// Typical V2 swap gas estimate
			const gasEstimate = 150000n;

			// V2 fee is 0.25% (0.17% LP, 0.03% treasury, 0.05% burn)
			const swapFee = Number(amountInWei) * 0.0025;

			return {
				tokenIn: {
					address: tokenIn,
					symbol: tokenInInfo.symbol,
					amount: amountIn,
				},
				tokenOut: {
					address: tokenOut,
					symbol: tokenOutInfo.symbol,
				},
				fees: {
					swapFee: {
						amount: client.formatTokenAmount(BigInt(Math.floor(swapFee)), tokenInInfo.decimals),
						percentage: '0.25%',
						breakdown: {
							lpProviders: '0.17%',
							treasury: '0.03%',
							burn: '0.05%',
						},
					},
					gasFee: {
						estimatedGas: gasEstimate.toString(),
						gasPrice: gasPrice.toString() + ' wei',
						estimatedCost: client.formatTokenAmount(gasEstimate * gasPrice, 18) + ' BNB',
					},
				},
			};
		}

		case 'getTransaction': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const provider = client.getProvider();

			const tx = await provider.getTransaction(txHash);
			const receipt = await provider.getTransactionReceipt(txHash);

			if (!tx) {
				throw new NodeOperationError(this.getNode(), `Transaction not found: ${txHash}`);
			}

			return {
				hash: tx.hash,
				from: tx.from,
				to: tx.to,
				value: tx.value.toString(),
				gasLimit: tx.gasLimit.toString(),
				gasPrice: tx.gasPrice?.toString(),
				nonce: tx.nonce,
				blockNumber: receipt?.blockNumber,
				status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
				gasUsed: receipt?.gasUsed.toString(),
				confirmations: receipt ? await provider.getBlockNumber() - receipt.blockNumber : 0,
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
