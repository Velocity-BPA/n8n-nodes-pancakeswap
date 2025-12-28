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

export const poolV2Operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['poolV2'] } },
		options: [
			{ name: 'Get Pair', value: 'getPair', description: 'Get V2 pair by address', action: 'Get pair' },
			{ name: 'Get Pair by Tokens', value: 'getPairByTokens', description: 'Get V2 pair by token addresses', action: 'Get pair by tokens' },
			{ name: 'Get Pair Reserves', value: 'getPairReserves', description: 'Get pair reserves', action: 'Get pair reserves' },
			{ name: 'Get Pair Price', value: 'getPairPrice', description: 'Get current pair price', action: 'Get pair price' },
			{ name: 'Get Pair TVL', value: 'getPairTVL', description: 'Get total value locked', action: 'Get pair TVL' },
			{ name: 'Get Pair Volume', value: 'getPairVolume', description: 'Get 24h volume', action: 'Get pair volume' },
			{ name: 'Get Pair APR', value: 'getPairAPR', description: 'Get estimated APR', action: 'Get pair APR' },
			{ name: 'List Pairs', value: 'listPairs', description: 'List V2 pairs', action: 'List pairs' },
			{ name: 'Search Pairs', value: 'searchPairs', description: 'Search for pairs', action: 'Search pairs' },
			{ name: 'Get Top Pairs', value: 'getTopPairs', description: 'Get top pairs by TVL', action: 'Get top pairs' },
		],
		default: 'getPair',
	},
	{
		displayName: 'Pair Address',
		name: 'pairAddress',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV2'], operation: ['getPair', 'getPairReserves', 'getPairPrice', 'getPairTVL', 'getPairVolume', 'getPairAPR'] } },
		default: '',
		placeholder: '0x...',
	},
	{
		displayName: 'Token A Address',
		name: 'tokenA',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV2'], operation: ['getPairByTokens'] } },
		default: '',
	},
	{
		displayName: 'Token B Address',
		name: 'tokenB',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV2'], operation: ['getPairByTokens'] } },
		default: '',
	},
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		displayOptions: { show: { resource: ['poolV2'], operation: ['searchPairs'] } },
		default: '',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: { show: { resource: ['poolV2'], operation: ['listPairs', 'searchPairs', 'getTopPairs'] } },
		default: 10,
		typeOptions: { minValue: 1, maxValue: 100 },
	},
];

export async function executePoolV2(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'getPair': {
			const pairAddress = this.getNodeParameter('pairAddress', index) as string;
			const pair = client.getPairContract(pairAddress);
			
			const [token0, token1, reserves] = await Promise.all([
				pair.token0(),
				pair.token1(),
				client.getPairReserves(pairAddress),
			]);

			const token0Info = await client.getTokenInfo(token0);
			const token1Info = await client.getTokenInfo(token1);

			return {
				address: pairAddress,
				protocol: 'V2',
				token0: { address: token0, symbol: token0Info.symbol, decimals: token0Info.decimals },
				token1: { address: token1, symbol: token1Info.symbol, decimals: token1Info.decimals },
				reserves: {
					reserve0: client.formatTokenAmount(reserves.reserve0, token0Info.decimals),
					reserve1: client.formatTokenAmount(reserves.reserve1, token1Info.decimals),
				},
				fee: '0.25%',
			};
		}

		case 'getPairByTokens': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);
			
			if (pairAddress === '0x0000000000000000000000000000000000000000') {
				return { exists: false, tokenA, tokenB, message: 'Pair does not exist' };
			}

			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);
			const reserves = await client.getPairReserves(pairAddress);

			return {
				exists: true,
				address: pairAddress,
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol },
				reserves: {
					reserveA: client.formatTokenAmount(reserves.reserve0, tokenAInfo.decimals),
					reserveB: client.formatTokenAmount(reserves.reserve1, tokenBInfo.decimals),
				},
			};
		}

		case 'getPairReserves': {
			const pairAddress = this.getNodeParameter('pairAddress', index) as string;
			const pair = client.getPairContract(pairAddress);
			
			const [token0, token1, reserves] = await Promise.all([
				pair.token0(),
				pair.token1(),
				client.getPairReserves(pairAddress),
			]);

			const token0Info = await client.getTokenInfo(token0);
			const token1Info = await client.getTokenInfo(token1);

			return {
				address: pairAddress,
				token0: { address: token0, symbol: token0Info.symbol },
				token1: { address: token1, symbol: token1Info.symbol },
				reserve0: client.formatTokenAmount(reserves.reserve0, token0Info.decimals),
				reserve1: client.formatTokenAmount(reserves.reserve1, token1Info.decimals),
				blockTimestamp: reserves.blockTimestamp,
			};
		}

		case 'getPairPrice': {
			const pairAddress = this.getNodeParameter('pairAddress', index) as string;
			const pair = client.getPairContract(pairAddress);
			
			const [token0, token1, reserves] = await Promise.all([
				pair.token0(),
				pair.token1(),
				client.getPairReserves(pairAddress),
			]);

			const token0Info = await client.getTokenInfo(token0);
			const token1Info = await client.getTokenInfo(token1);

			const price0 = Number(reserves.reserve1) / Number(reserves.reserve0);
			const price1 = Number(reserves.reserve0) / Number(reserves.reserve1);

			return {
				address: pairAddress,
				token0: { address: token0, symbol: token0Info.symbol },
				token1: { address: token1, symbol: token1Info.symbol },
				price0in1: price0.toString(),
				price1in0: price1.toString(),
				description: `1 ${token0Info.symbol} = ${price0.toFixed(8)} ${token1Info.symbol}`,
			};
		}

		case 'getPairTVL':
		case 'getPairVolume':
		case 'getPairAPR': {
			const pairAddress = this.getNodeParameter('pairAddress', index) as string;
			return {
				address: pairAddress,
				[operation.replace('getPair', '').toLowerCase()]: 'Query from subgraph',
				note: 'Requires V2 subgraph integration',
			};
		}

		case 'listPairs':
		case 'searchPairs':
		case 'getTopPairs': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			return {
				pairs: [],
				limit,
				note: 'Requires V2 subgraph query',
				subgraphUrl: 'https://api.thegraph.com/subgraphs/name/pancakeswap/pairs',
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
