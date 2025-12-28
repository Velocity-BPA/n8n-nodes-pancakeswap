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

export const routeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['route'],
			},
		},
		options: [
			{ name: 'Get Best Route', value: 'getBestRoute', description: 'Find the best route across all protocols', action: 'Get best route' },
			{ name: 'Get All Routes', value: 'getAllRoutes', description: 'Get all available routes', action: 'Get all routes' },
			{ name: 'Get V2 Route', value: 'getV2Route', description: 'Get route through V2 pools', action: 'Get V2 route' },
			{ name: 'Get V3 Route', value: 'getV3Route', description: 'Get route through V3 pools', action: 'Get V3 route' },
			{ name: 'Get StableSwap Route', value: 'getStableSwapRoute', description: 'Get route through StableSwap pools', action: 'Get StableSwap route' },
			{ name: 'Get Mixed Route', value: 'getMixedRoute', description: 'Get route using multiple protocols', action: 'Get mixed route' },
			{ name: 'Get Route Pools', value: 'getRoutePools', description: 'Get pools used in a route', action: 'Get route pools' },
			{ name: 'Get Route Hops', value: 'getRouteHops', description: 'Get individual hops in a route', action: 'Get route hops' },
			{ name: 'Calculate Route Price Impact', value: 'calculatePriceImpact', description: 'Calculate price impact for a route', action: 'Calculate route price impact' },
			{ name: 'Get Route Gas Estimate', value: 'getGasEstimate', description: 'Estimate gas for a route', action: 'Get route gas estimate' },
			{ name: 'Compare Route Efficiency', value: 'compareEfficiency', description: 'Compare efficiency of different routes', action: 'Compare route efficiency' },
		],
		default: 'getBestRoute',
	},
	{
		displayName: 'Token In Address',
		name: 'tokenIn',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['route'] } },
		default: '',
		placeholder: '0x...',
		description: 'Input token contract address',
	},
	{
		displayName: 'Token Out Address',
		name: 'tokenOut',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['route'] } },
		default: '',
		placeholder: '0x...',
		description: 'Output token contract address',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['route'] } },
		default: '',
		placeholder: '1.0',
		description: 'Amount of tokens',
	},
	{
		displayName: 'Max Hops',
		name: 'maxHops',
		type: 'number',
		displayOptions: { show: { resource: ['route'] } },
		default: 3,
		typeOptions: { minValue: 1, maxValue: 5 },
		description: 'Maximum number of hops',
	},
];

export async function executeRoute(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapApi');
	const tokenIn = this.getNodeParameter('tokenIn', index) as string;
	const tokenOut = this.getNodeParameter('tokenOut', index) as string;
	const amount = this.getNodeParameter('amount', index) as string;
	const maxHops = this.getNodeParameter('maxHops', index, 3) as number;

	const tokenInInfo = await client.getTokenInfo(tokenIn);
	const tokenOutInfo = await client.getTokenInfo(tokenOut);
	const amountInWei = client.parseTokenAmount(amount, tokenInInfo.decimals);

	switch (operation) {
		case 'getBestRoute':
		case 'getAllRoutes': {
			const wbnb = client.getContractAddress('wrappedNative');
			const routes: any[] = [];

			// Direct route
			try {
				const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
				routes.push({
					path: [tokenIn, tokenOut],
					output: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals),
					hops: 1,
					protocol: 'V2',
				});
			} catch { /* No direct route */ }

			// WBNB route
			if (tokenIn !== wbnb && tokenOut !== wbnb) {
				try {
					const amounts = await client.getAmountsOut(amountInWei, [tokenIn, wbnb, tokenOut]);
					routes.push({
						path: [tokenIn, wbnb, tokenOut],
						output: client.formatTokenAmount(amounts[2], tokenOutInfo.decimals),
						hops: 2,
						protocol: 'V2',
					});
				} catch { /* Route unavailable */ }
			}

			routes.sort((a, b) => parseFloat(b.output) - parseFloat(a.output));

			return {
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol, amount },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				bestRoute: routes[0] || null,
				allRoutes: routes,
				maxHops,
			};
		}

		case 'getV2Route': {
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
			return {
				protocol: 'V2',
				path: [tokenIn, tokenOut],
				amountIn: amount,
				amountOut: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals),
				fee: '0.25%',
			};
		}

		case 'getV3Route':
			return {
				protocol: 'V3',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				feeTiers: [100, 500, 2500, 10000],
				note: 'V3 routing requires quoter contract',
			};

		case 'getStableSwapRoute':
			return {
				protocol: 'StableSwap',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				fee: '0.04%',
				note: 'StableSwap only for stable pairs',
			};

		case 'getMixedRoute':
			return {
				protocol: 'Mixed',
				tokenIn: { address: tokenIn, symbol: tokenInInfo.symbol },
				tokenOut: { address: tokenOut, symbol: tokenOutInfo.symbol },
				protocols: ['V2', 'V3', 'StableSwap'],
				maxHops,
			};

		case 'getRoutePools': {
			const pairAddress = await client.getPairAddress(tokenIn, tokenOut);
			return {
				route: [tokenIn, tokenOut],
				pools: [{
					address: pairAddress,
					protocol: 'V2',
					token0: tokenIn,
					token1: tokenOut,
				}],
			};
		}

		case 'getRouteHops': {
			return {
				route: [tokenIn, tokenOut],
				hops: [{
					from: tokenIn,
					to: tokenOut,
					pool: await client.getPairAddress(tokenIn, tokenOut),
					protocol: 'V2',
				}],
			};
		}

		case 'calculatePriceImpact': {
			const pairAddress = await client.getPairAddress(tokenIn, tokenOut);
			const reserves = await client.getPairReserves(pairAddress);
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);

			const reserveIn = reserves.reserve0;
			const reserveOut = reserves.reserve1;
			const amountOut = amounts[1];

			const priceBefore = Number(reserveOut) / Number(reserveIn);
			const priceAfter = Number(reserveOut - amountOut) / Number(reserveIn + amountInWei);
			const priceImpact = ((priceBefore - priceAfter) / priceBefore) * 100;

			return {
				route: [tokenIn, tokenOut],
				priceImpact: priceImpact.toFixed(4) + '%',
				severity: priceImpact > 15 ? 'HIGH' : priceImpact > 5 ? 'MEDIUM' : 'LOW',
			};
		}

		case 'getGasEstimate': {
			const gasPrice = await client.getGasPrice();
			const baseGas = 150000n;
			const hopGas = 50000n;
			const totalGas = baseGas + hopGas * BigInt(1);

			return {
				route: [tokenIn, tokenOut],
				estimatedGas: totalGas.toString(),
				gasPrice: gasPrice.toString(),
				gasCostWei: (totalGas * gasPrice).toString(),
				gasCostBNB: client.formatTokenAmount(totalGas * gasPrice, 18),
			};
		}

		case 'compareEfficiency': {
			const amounts = await client.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
			const gasPrice = await client.getGasPrice();

			return {
				routes: [{
					path: [tokenIn, tokenOut],
					protocol: 'V2',
					output: client.formatTokenAmount(amounts[1], tokenOutInfo.decimals),
					gasEstimate: '150000',
					gasCost: client.formatTokenAmount(150000n * gasPrice, 18) + ' BNB',
					netOutput: 'Calculate based on output token price',
				}],
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
