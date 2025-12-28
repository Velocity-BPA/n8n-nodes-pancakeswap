/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const priceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['price'] } },
		options: [
			{ name: 'Get Token Price (BNB)', value: 'getTokenPriceBNB', action: 'Get token price in BNB' },
			{ name: 'Get Token Price (USD)', value: 'getTokenPriceUSD', action: 'Get token price in USD' },
			{ name: 'Get Pair Price', value: 'getPairPrice', action: 'Get pair price' },
			{ name: 'Get Pool Price', value: 'getPoolPrice', action: 'Get pool price' },
			{ name: 'Get Historical Prices', value: 'getHistoricalPrices', action: 'Get historical prices' },
			{ name: 'Get Price Chart', value: 'getPriceChart', action: 'Get price chart data' },
			{ name: 'Get Price Change', value: 'getPriceChange', action: 'Get price change' },
			{ name: 'Get 24h High/Low', value: 'get24hHighLow', action: 'Get 24h high low' },
			{ name: 'Compare Prices', value: 'comparePrices', action: 'Compare prices' },
			{ name: 'Get Price by Block', value: 'getPriceByBlock', action: 'Get price by block' },
		],
		default: 'getTokenPriceUSD',
	},
	{ displayName: 'Token Address', name: 'tokenAddress', type: 'string', required: true, displayOptions: { show: { resource: ['price'], operation: ['getTokenPriceBNB', 'getTokenPriceUSD', 'getHistoricalPrices', 'getPriceChart', 'getPriceChange', 'get24hHighLow', 'getPriceByBlock'] } }, default: '' },
	{ displayName: 'Pair/Pool Address', name: 'poolAddress', type: 'string', required: true, displayOptions: { show: { resource: ['price'], operation: ['getPairPrice', 'getPoolPrice'] } }, default: '' },
	{ displayName: 'Token Addresses', name: 'tokenAddresses', type: 'string', displayOptions: { show: { resource: ['price'], operation: ['comparePrices'] } }, default: '', description: 'Comma-separated addresses' },
	{ displayName: 'Block Number', name: 'blockNumber', type: 'number', displayOptions: { show: { resource: ['price'], operation: ['getPriceByBlock'] } }, default: 0 },
	{ displayName: 'Period', name: 'period', type: 'options', displayOptions: { show: { resource: ['price'], operation: ['getHistoricalPrices', 'getPriceChart'] } }, options: [{ name: '1 Hour', value: '1h' }, { name: '24 Hours', value: '24h' }, { name: '7 Days', value: '7d' }, { name: '30 Days', value: '30d' }], default: '24h' },
];

export async function executePrice(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'getTokenPriceBNB':
		case 'getTokenPriceUSD': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const tokenInfo = await client.getTokenInfo(tokenAddress);
			const wbnb = client.getContractAddress('wrappedNative');
			
			try {
				const amounts = await client.getAmountsOut(client.parseTokenAmount('1', tokenInfo.decimals), [tokenAddress, wbnb]);
				const priceInBNB = client.formatTokenAmount(amounts[1], 18);
				return {
					token: { address: tokenAddress, symbol: tokenInfo.symbol },
					priceInBNB,
					priceInUSD: operation === 'getTokenPriceUSD' ? 'BNB price * priceInBNB' : undefined,
				};
			} catch {
				return { token: { address: tokenAddress, symbol: tokenInfo.symbol }, error: 'No direct pair with WBNB' };
			}
		}
		case 'getPairPrice': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			const reserves = await client.getPairReserves(poolAddress);
			const pair = client.getPairContract(poolAddress);
			const [token0, token1] = await Promise.all([pair.token0(), pair.token1()]);
			const [info0, info1] = await Promise.all([client.getTokenInfo(token0), client.getTokenInfo(token1)]);
			
			const price0 = Number(reserves.reserve1) / Number(reserves.reserve0);
			return {
				pair: poolAddress,
				token0: { address: token0, symbol: info0.symbol },
				token1: { address: token1, symbol: info1.symbol },
				price: price0.toString(),
			};
		}
		case 'getPoolPrice': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return { pool: poolAddress, note: 'Query sqrtPriceX96 from V3 pool slot0' };
		}
		case 'getHistoricalPrices':
		case 'getPriceChart': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const period = this.getNodeParameter('period', index) as string;
			return { token: tokenAddress, period, data: [], note: 'Query from subgraph tokenDayDatas' };
		}
		case 'getPriceChange':
		case 'get24hHighLow': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			return { token: tokenAddress, note: 'Calculate from historical data' };
		}
		case 'comparePrices': {
			const addresses = (this.getNodeParameter('tokenAddresses', index) as string).split(',').map(a => a.trim());
			return { tokens: addresses, prices: [], note: 'Batch price query' };
		}
		case 'getPriceByBlock': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const blockNumber = this.getNodeParameter('blockNumber', index) as number;
			return { token: tokenAddress, block: blockNumber, note: 'Query subgraph with block filter' };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
