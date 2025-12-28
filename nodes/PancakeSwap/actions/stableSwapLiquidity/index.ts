/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';

export const stableSwapLiquidityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['stableSwapLiquidity'] } },
		options: [
			{ name: 'Add Liquidity (Balanced)', value: 'addLiquidityBalanced', action: 'Add balanced liquidity' },
			{ name: 'Add Liquidity (Single Asset)', value: 'addLiquiditySingle', action: 'Add single asset' },
			{ name: 'Remove Liquidity (Balanced)', value: 'removeLiquidityBalanced', action: 'Remove balanced' },
			{ name: 'Remove Liquidity (Single Asset)', value: 'removeLiquiditySingle', action: 'Remove single asset' },
			{ name: 'Remove Liquidity Imbalanced', value: 'removeLiquidityImbalanced', action: 'Remove imbalanced' },
			{ name: 'Get LP Token Balance', value: 'getLPBalance', action: 'Get LP balance' },
			{ name: 'Get LP Token Value', value: 'getLPValue', action: 'Get LP value' },
			{ name: 'Calculate Add Amounts', value: 'calculateAddAmounts', action: 'Calculate add amounts' },
			{ name: 'Calculate Remove Amounts', value: 'calculateRemoveAmounts', action: 'Calculate remove amounts' },
		],
		default: 'addLiquidityBalanced',
	},
	{ displayName: 'Pool Address', name: 'poolAddress', type: 'string', required: true, displayOptions: { show: { resource: ['stableSwapLiquidity'] } }, default: '' },
	{ displayName: 'Amounts', name: 'amounts', type: 'string', displayOptions: { show: { resource: ['stableSwapLiquidity'], operation: ['addLiquidityBalanced', 'addLiquiditySingle', 'removeLiquidityImbalanced', 'calculateAddAmounts'] } }, default: '', description: 'Comma-separated amounts for each token' },
	{ displayName: 'LP Amount', name: 'lpAmount', type: 'string', displayOptions: { show: { resource: ['stableSwapLiquidity'], operation: ['removeLiquidityBalanced', 'removeLiquiditySingle', 'calculateRemoveAmounts'] } }, default: '' },
	{ displayName: 'Token Index', name: 'tokenIndex', type: 'number', displayOptions: { show: { resource: ['stableSwapLiquidity'], operation: ['addLiquiditySingle', 'removeLiquiditySingle'] } }, default: 0 },
	{ displayName: 'Slippage (%)', name: 'slippage', type: 'number', displayOptions: { show: { resource: ['stableSwapLiquidity'] } }, default: 0.1, typeOptions: { minValue: 0.01, maxValue: 5 } },
];

export async function executeStableSwapLiquidity(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const poolAddress = this.getNodeParameter('poolAddress', index) as string;
	
	switch (operation) {
		case 'addLiquidityBalanced': {
			const amounts = (this.getNodeParameter('amounts', index) as string).split(',').map(a => a.trim());
			const slippage = this.getNodeParameter('slippage', index) as number;
			return { action: 'add_liquidity', poolAddress, amounts, slippage, note: 'Call pool.add_liquidity(amounts, min_mint_amount)' };
		}
		case 'addLiquiditySingle': {
			const amounts = (this.getNodeParameter('amounts', index) as string).split(',').map(a => a.trim());
			const tokenIndex = this.getNodeParameter('tokenIndex', index) as number;
			return { action: 'add_liquidity_one_coin', poolAddress, amounts, tokenIndex, note: 'Single-sided add with higher slippage' };
		}
		case 'removeLiquidityBalanced': {
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;
			return { action: 'remove_liquidity', poolAddress, lpAmount, note: 'Call pool.remove_liquidity(lp_amount, min_amounts)' };
		}
		case 'removeLiquiditySingle': {
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;
			const tokenIndex = this.getNodeParameter('tokenIndex', index) as number;
			return { action: 'remove_liquidity_one_coin', poolAddress, lpAmount, tokenIndex };
		}
		case 'removeLiquidityImbalanced': {
			const amounts = (this.getNodeParameter('amounts', index) as string).split(',').map(a => a.trim());
			return { action: 'remove_liquidity_imbalance', poolAddress, amounts };
		}
		case 'getLPBalance':
		case 'getLPValue':
		case 'calculateAddAmounts':
		case 'calculateRemoveAmounts':
			return { poolAddress, operation, note: 'Query pool contract or calculate locally' };
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
