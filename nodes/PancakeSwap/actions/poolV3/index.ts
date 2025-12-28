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
import { V3_FEE_TIERS } from '../../constants/feeTiers';

export const poolV3Operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['poolV3'] } },
		options: [
			{ name: 'Get Pool', value: 'getPool', description: 'Get V3 pool by address', action: 'Get pool' },
			{ name: 'Get Pool by Tokens', value: 'getPoolByTokens', description: 'Get V3 pool by token pair', action: 'Get pool by tokens' },
			{ name: 'Get Pool Liquidity', value: 'getPoolLiquidity', description: 'Get total liquidity in pool', action: 'Get pool liquidity' },
			{ name: 'Get Pool Price', value: 'getPoolPrice', description: 'Get current pool price', action: 'Get pool price' },
			{ name: 'Get Pool Tick', value: 'getPoolTick', description: 'Get current tick', action: 'Get pool tick' },
			{ name: 'Get Pool Fee Tier', value: 'getPoolFeeTier', description: 'Get pool fee tier', action: 'Get pool fee tier' },
			{ name: 'Get Pool TVL', value: 'getPoolTVL', description: 'Get total value locked', action: 'Get pool TVL' },
			{ name: 'Get Pool Volume', value: 'getPoolVolume', description: 'Get trading volume', action: 'Get pool volume' },
			{ name: 'Get Pool APR', value: 'getPoolAPR', description: 'Get estimated APR', action: 'Get pool APR' },
			{ name: 'Get Pool Ticks', value: 'getPoolTicks', description: 'Get tick data', action: 'Get pool ticks' },
			{ name: 'Get Active Tick', value: 'getActiveTick', description: 'Get currently active tick', action: 'Get active tick' },
			{ name: 'List Pools', value: 'listPools', description: 'List V3 pools', action: 'List pools' },
			{ name: 'Search Pools', value: 'searchPools', description: 'Search for pools', action: 'Search pools' },
			{ name: 'Get Top Pools', value: 'getTopPools', description: 'Get top pools by TVL', action: 'Get top pools' },
			{ name: 'Get Pool History', value: 'getPoolHistory', description: 'Get historical data', action: 'Get pool history' },
		],
		default: 'getPool',
	},
	{
		displayName: 'Pool Address',
		name: 'poolAddress',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV3'], operation: ['getPool', 'getPoolLiquidity', 'getPoolPrice', 'getPoolTick', 'getPoolFeeTier', 'getPoolTVL', 'getPoolVolume', 'getPoolAPR', 'getPoolTicks', 'getActiveTick', 'getPoolHistory'] } },
		default: '',
		placeholder: '0x...',
		description: 'V3 pool contract address',
	},
	{
		displayName: 'Token A Address',
		name: 'tokenA',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV3'], operation: ['getPoolByTokens'] } },
		default: '',
		placeholder: '0x...',
	},
	{
		displayName: 'Token B Address',
		name: 'tokenB',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['poolV3'], operation: ['getPoolByTokens'] } },
		default: '',
		placeholder: '0x...',
	},
	{
		displayName: 'Fee Tier',
		name: 'feeTier',
		type: 'options',
		displayOptions: { show: { resource: ['poolV3'], operation: ['getPoolByTokens'] } },
		options: [
			{ name: '0.01%', value: 100 },
			{ name: '0.05%', value: 500 },
			{ name: '0.25%', value: 2500 },
			{ name: '1%', value: 10000 },
		],
		default: 2500,
	},
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		displayOptions: { show: { resource: ['poolV3'], operation: ['searchPools'] } },
		default: '',
		placeholder: 'CAKE, BNB, etc.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: { show: { resource: ['poolV3'], operation: ['listPools', 'searchPools', 'getTopPools'] } },
		default: 10,
		typeOptions: { minValue: 1, maxValue: 100 },
	},
];

export async function executePoolV3(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapApi');

	switch (operation) {
		case 'getPool': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				protocol: 'V3',
				note: 'V3 pool data requires subgraph query',
				feeTiers: V3_FEE_TIERS,
			};
		}

		case 'getPoolByTokens': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const feeTier = this.getNodeParameter('feeTier', index) as number;

			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);

			return {
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol },
				feeTier,
				feePercent: (feeTier / 10000).toFixed(2) + '%',
				note: 'Use V3 Factory getPool to find address',
			};
		}

		case 'getPoolLiquidity': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				liquidity: 'Query from subgraph',
				note: 'V3 liquidity is concentrated in active range',
			};
		}

		case 'getPoolPrice': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				sqrtPriceX96: 'Query from pool slot0',
				price: 'Calculated from sqrtPriceX96',
			};
		}

		case 'getPoolTick': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				currentTick: 'Query from pool slot0',
				tickSpacing: 'Depends on fee tier',
			};
		}

		case 'getPoolFeeTier': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				feeTiers: Object.values(V3_FEE_TIERS).map(t => ({
					fee: t.fee,
					label: t.label,
					tickSpacing: t.tickSpacing,
				})),
			};
		}

		case 'getPoolTVL':
		case 'getPoolVolume':
		case 'getPoolAPR': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				[operation.replace('getPool', '').toLowerCase()]: 'Query from subgraph',
				note: 'Requires V3 subgraph integration',
			};
		}

		case 'getPoolTicks':
		case 'getActiveTick': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				ticks: 'Query from subgraph or pool contract',
				tickSpacing: 'Depends on fee tier',
			};
		}

		case 'listPools':
		case 'searchPools':
		case 'getTopPools': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			return {
				pools: [],
				limit,
				note: 'Requires V3 subgraph query',
				subgraphUrl: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
			};
		}

		case 'getPoolHistory': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				history: 'Query from subgraph',
				note: 'Use poolDayDatas or poolHourDatas entity',
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
