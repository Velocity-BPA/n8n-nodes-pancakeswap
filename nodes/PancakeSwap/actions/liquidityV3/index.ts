/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const liquidityV3Operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['liquidityV3'] } },
		options: [
			{ name: 'Mint Position', value: 'mintPosition', description: 'Create new V3 liquidity position', action: 'Mint position' },
			{ name: 'Increase Liquidity', value: 'increaseLiquidity', description: 'Add liquidity to existing position', action: 'Increase liquidity' },
			{ name: 'Decrease Liquidity', value: 'decreaseLiquidity', description: 'Remove liquidity from position', action: 'Decrease liquidity' },
			{ name: 'Collect Fees', value: 'collectFees', description: 'Collect earned trading fees', action: 'Collect fees' },
			{ name: 'Burn Position', value: 'burnPosition', description: 'Close and burn position NFT', action: 'Burn position' },
			{ name: 'Get Mint Quote', value: 'getMintQuote', description: 'Quote for minting position', action: 'Get mint quote' },
			{ name: 'Get Increase Quote', value: 'getIncreaseQuote', description: 'Quote for adding liquidity', action: 'Get increase quote' },
			{ name: 'Get Decrease Quote', value: 'getDecreaseQuote', description: 'Quote for removing liquidity', action: 'Get decrease quote' },
			{ name: 'Calculate Amounts', value: 'calculateAmounts', description: 'Calculate token amounts for liquidity', action: 'Calculate amounts' },
			{ name: 'Get Optimal Ratio', value: 'getOptimalRatio', description: 'Get optimal token ratio for range', action: 'Get optimal ratio' },
			{ name: 'Get Price Range', value: 'getPriceRange', description: 'Convert ticks to price range', action: 'Get price range' },
		],
		default: 'mintPosition',
	},
	{
		displayName: 'Token A Address',
		name: 'tokenA',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'getMintQuote', 'calculateAmounts', 'getOptimalRatio', 'getPriceRange'] } },
		default: '',
	},
	{
		displayName: 'Token B Address',
		name: 'tokenB',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'getMintQuote', 'calculateAmounts', 'getOptimalRatio', 'getPriceRange'] } },
		default: '',
	},
	{
		displayName: 'Fee Tier',
		name: 'feeTier',
		type: 'options',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'getMintQuote'] } },
		options: [
			{ name: '0.01%', value: 100 },
			{ name: '0.05%', value: 500 },
			{ name: '0.25%', value: 2500 },
			{ name: '1%', value: 10000 },
		],
		default: 2500,
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['increaseLiquidity', 'decreaseLiquidity', 'collectFees', 'burnPosition', 'getIncreaseQuote', 'getDecreaseQuote'] } },
		default: '',
	},
	{
		displayName: 'Amount A',
		name: 'amountA',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'increaseLiquidity', 'getMintQuote', 'getIncreaseQuote', 'calculateAmounts'] } },
		default: '',
	},
	{
		displayName: 'Amount B',
		name: 'amountB',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'increaseLiquidity', 'getMintQuote', 'getIncreaseQuote', 'calculateAmounts'] } },
		default: '',
	},
	{
		displayName: 'Tick Lower',
		name: 'tickLower',
		type: 'number',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'getMintQuote', 'calculateAmounts', 'getPriceRange'] } },
		default: -887220,
	},
	{
		displayName: 'Tick Upper',
		name: 'tickUpper',
		type: 'number',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'getMintQuote', 'calculateAmounts', 'getPriceRange'] } },
		default: 887220,
	},
	{
		displayName: 'Liquidity Percentage',
		name: 'liquidityPercentage',
		type: 'number',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['decreaseLiquidity', 'getDecreaseQuote'] } },
		default: 100,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Percentage of liquidity to remove',
	},
	{
		displayName: 'Slippage (%)',
		name: 'slippage',
		type: 'number',
		displayOptions: { show: { resource: ['liquidityV3'], operation: ['mintPosition', 'increaseLiquidity', 'decreaseLiquidity'] } },
		default: 0.5,
		typeOptions: { minValue: 0.01, maxValue: 50 },
	},
];

export async function executeLiquidityV3(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'mintPosition': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const feeTier = this.getNodeParameter('feeTier', index) as number;
			const tickLower = this.getNodeParameter('tickLower', index) as number;
			const tickUpper = this.getNodeParameter('tickUpper', index) as number;
			const amountA = this.getNodeParameter('amountA', index) as string;
			const amountB = this.getNodeParameter('amountB', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);

			return {
				action: 'mintPosition',
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol, amount: amountA },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol, amount: amountB },
				feeTier,
				tickLower,
				tickUpper,
				slippage,
				nftManager: client.getContractAddress('nonfungiblePositionManager'),
				note: 'Call NonfungiblePositionManager.mint()',
			};
		}

		case 'increaseLiquidity': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const amountA = this.getNodeParameter('amountA', index) as string;
			const amountB = this.getNodeParameter('amountB', index) as string;

			return {
				action: 'increaseLiquidity',
				tokenId,
				amountA,
				amountB,
				note: 'Call NonfungiblePositionManager.increaseLiquidity()',
			};
		}

		case 'decreaseLiquidity': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const liquidityPercentage = this.getNodeParameter('liquidityPercentage', index) as number;

			return {
				action: 'decreaseLiquidity',
				tokenId,
				liquidityPercentage,
				note: 'Call NonfungiblePositionManager.decreaseLiquidity()',
			};
		}

		case 'collectFees': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const recipient = await client.getAddress();

			return {
				action: 'collectFees',
				tokenId,
				recipient,
				note: 'Call NonfungiblePositionManager.collect()',
			};
		}

		case 'burnPosition': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;

			return {
				action: 'burnPosition',
				tokenId,
				steps: [
					'1. decreaseLiquidity to 0',
					'2. collect all tokens and fees',
					'3. burn the NFT',
				],
				note: 'Position must have 0 liquidity and 0 fees to burn',
			};
		}

		case 'getMintQuote':
		case 'getIncreaseQuote':
		case 'getDecreaseQuote': {
			return {
				operation,
				note: 'Calculate expected amounts based on current price and tick range',
			};
		}

		case 'calculateAmounts': {
			const tickLower = this.getNodeParameter('tickLower', index) as number;
			const tickUpper = this.getNodeParameter('tickUpper', index) as number;

			return {
				tickLower,
				tickUpper,
				note: 'Use getLiquidityForAmounts() or getAmountsForLiquidity()',
				description: 'Token ratio depends on current price relative to range',
			};
		}

		case 'getOptimalRatio': {
			return {
				note: 'Optimal ratio depends on current price and selected range',
				formula: 'If price in range: need both tokens. If below range: only token1. If above: only token0',
			};
		}

		case 'getPriceRange': {
			const tickLower = this.getNodeParameter('tickLower', index) as number;
			const tickUpper = this.getNodeParameter('tickUpper', index) as number;

			const priceLower = Math.pow(1.0001, tickLower);
			const priceUpper = Math.pow(1.0001, tickUpper);

			return {
				tickLower,
				tickUpper,
				priceLower: priceLower.toFixed(8),
				priceUpper: priceUpper.toFixed(8),
				formula: 'price = 1.0001^tick',
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
