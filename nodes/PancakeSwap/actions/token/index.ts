/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const tokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['token'] } },
		options: [
			{ name: 'Get Token', value: 'getToken', action: 'Get token info' },
			{ name: 'Get Token by Address', value: 'getTokenByAddress', action: 'Get token by address' },
			{ name: 'Get Token Price', value: 'getTokenPrice', action: 'Get token price' },
			{ name: 'Get Token Price USD', value: 'getTokenPriceUSD', action: 'Get token price USD' },
			{ name: 'Get Token Volume', value: 'getTokenVolume', action: 'Get token volume' },
			{ name: 'Get Token Liquidity', value: 'getTokenLiquidity', action: 'Get token liquidity' },
			{ name: 'Get Token Markets', value: 'getTokenMarkets', action: 'Get token markets' },
			{ name: 'Search Tokens', value: 'searchTokens', action: 'Search tokens' },
			{ name: 'Get Token List', value: 'getTokenList', action: 'Get token list' },
			{ name: 'Get Trending Tokens', value: 'getTrendingTokens', action: 'Get trending tokens' },
			{ name: 'Validate Token', value: 'validateToken', action: 'Validate token' },
			{ name: 'Get Token Logo', value: 'getTokenLogo', action: 'Get token logo' },
		],
		default: 'getToken',
	},
	{ displayName: 'Token Address', name: 'tokenAddress', type: 'string', required: true, displayOptions: { show: { resource: ['token'], operation: ['getToken', 'getTokenByAddress', 'getTokenPrice', 'getTokenPriceUSD', 'getTokenVolume', 'getTokenLiquidity', 'getTokenMarkets', 'validateToken', 'getTokenLogo'] } }, default: '' },
	{ displayName: 'Search Query', name: 'searchQuery', type: 'string', displayOptions: { show: { resource: ['token'], operation: ['searchTokens'] } }, default: '' },
	{ displayName: 'Limit', name: 'limit', type: 'number', displayOptions: { show: { resource: ['token'], operation: ['searchTokens', 'getTokenList', 'getTrendingTokens'] } }, default: 20, typeOptions: { minValue: 1, maxValue: 100 } },
];

export async function executeToken(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'getToken':
		case 'getTokenByAddress': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const tokenInfo = await client.getTokenInfo(tokenAddress);
			return {
				address: tokenAddress,
				name: tokenInfo.name,
				symbol: tokenInfo.symbol,
				decimals: tokenInfo.decimals,
				totalSupply: tokenInfo.totalSupply.toString(),
			};
		}
		case 'getTokenPrice':
		case 'getTokenPriceUSD': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const tokenInfo = await client.getTokenInfo(tokenAddress);
			return {
				address: tokenAddress,
				symbol: tokenInfo.symbol,
				price: 'Query from API or calculate from pairs',
				note: 'Use PancakeSwap API /v1/tokens/prices endpoint',
			};
		}
		case 'getTokenVolume':
		case 'getTokenLiquidity':
		case 'getTokenMarkets': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			return { address: tokenAddress, [operation.replace('getToken', '').toLowerCase()]: 'Query from subgraph' };
		}
		case 'searchTokens': {
			const query = this.getNodeParameter('searchQuery', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			return { query, limit, results: [], note: 'Query token list or subgraph' };
		}
		case 'getTokenList':
		case 'getTrendingTokens': {
			const limit = this.getNodeParameter('limit', index) as number;
			return { limit, tokens: [], note: 'Query PancakeSwap token list' };
		}
		case 'validateToken': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			try {
				const tokenInfo = await client.getTokenInfo(tokenAddress);
				return { address: tokenAddress, valid: true, name: tokenInfo.name, symbol: tokenInfo.symbol };
			} catch {
				return { address: tokenAddress, valid: false, error: 'Invalid token contract' };
			}
		}
		case 'getTokenLogo': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			return {
				address: tokenAddress,
				logoUrl: `https://tokens.pancakeswap.finance/images/${tokenAddress}.png`,
				note: 'Logo may not exist for all tokens',
			};
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
