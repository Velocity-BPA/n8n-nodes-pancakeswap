/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
// PancakeSwapClient available for API integration
// import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const stableSwapPoolOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['stableSwapPool'] } },
		options: [
			{ name: 'Get StableSwap Pool', value: 'getPool', description: 'Get StableSwap pool info', action: 'Get pool' },
			{ name: 'Get Pool by Address', value: 'getPoolByAddress', description: 'Get pool by contract address', action: 'Get pool by address' },
			{ name: 'Get Pool Balances', value: 'getPoolBalances', description: 'Get token balances in pool', action: 'Get pool balances' },
			{ name: 'Get Virtual Price', value: 'getVirtualPrice', description: 'Get LP token virtual price', action: 'Get virtual price' },
			{ name: 'Get Pool A', value: 'getPoolA', description: 'Get amplification coefficient', action: 'Get pool A' },
			{ name: 'Get Pool Fee', value: 'getPoolFee', description: 'Get pool swap fee', action: 'Get pool fee' },
			{ name: 'Get Pool TVL', value: 'getPoolTVL', description: 'Get total value locked', action: 'Get pool TVL' },
			{ name: 'Get Pool APR', value: 'getPoolAPR', description: 'Get estimated APR', action: 'Get pool APR' },
			{ name: 'List StableSwap Pools', value: 'listPools', description: 'List all StableSwap pools', action: 'List pools' },
			{ name: 'Get Supported Stables', value: 'getSupportedStables', description: 'Get supported stablecoins', action: 'Get supported stables' },
		],
		default: 'getPool',
	},
	{
		displayName: 'Pool Address',
		name: 'poolAddress',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['stableSwapPool'], operation: ['getPool', 'getPoolByAddress', 'getPoolBalances', 'getVirtualPrice', 'getPoolA', 'getPoolFee', 'getPoolTVL', 'getPoolAPR'] } },
		default: '',
		placeholder: '0x...',
	},
];

export async function executeStableSwapPool(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	// Client available for future API integration
	// const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapApi');

	switch (operation) {
		case 'getPool':
		case 'getPoolByAddress': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				protocol: 'StableSwap',
				description: 'StableSwap pools use Curve-style AMM for minimal slippage on stable pairs',
				fee: '0.04%',
				adminFee: '50%',
				note: 'Query pool contract for token list and balances',
			};
		}

		case 'getPoolBalances': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				balances: 'Query from pool contract balances()',
				note: 'StableSwap pools can have 2-4 tokens',
			};
		}

		case 'getVirtualPrice': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				virtualPrice: 'Query from pool contract get_virtual_price()',
				description: 'Virtual price represents LP token value, should always increase',
			};
		}

		case 'getPoolA': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				amplificationCoefficient: 'Query from pool contract A()',
				description: 'Higher A = more stable pricing, lower slippage near 1:1',
				typicalRange: '100-1000',
			};
		}

		case 'getPoolFee': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				swapFee: '0.04%',
				swapFeeBps: 4,
				adminFee: '50%',
				adminFeeBps: 5000,
				description: 'StableSwap uses lower fees due to stable asset nature',
			};
		}

		case 'getPoolTVL':
		case 'getPoolAPR': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				address: poolAddress,
				[operation.replace('getPool', '').toLowerCase()]: 'Query from API or subgraph',
			};
		}

		case 'listPools':
			return {
				pools: [
					{ name: 'USDT-BUSD', tokens: ['USDT', 'BUSD'], note: 'Example pool' },
					{ name: 'USDC-USDT-BUSD', tokens: ['USDC', 'USDT', 'BUSD'], note: 'Example pool' },
				],
				note: 'Query StableSwap Factory for complete list',
			};

		case 'getSupportedStables':
			return {
				stables: [
					{ symbol: 'USDT', name: 'Tether USD' },
					{ symbol: 'USDC', name: 'USD Coin' },
					{ symbol: 'BUSD', name: 'Binance USD' },
					{ symbol: 'DAI', name: 'Dai Stablecoin' },
					{ symbol: 'FRAX', name: 'Frax' },
				],
				note: 'Common stablecoins supported in StableSwap pools',
			};

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
