/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const liquidityV2Operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['liquidityV2'] } },
		options: [
			{ name: 'Add Liquidity', value: 'addLiquidity', description: 'Add liquidity to V2 pair', action: 'Add liquidity' },
			{ name: 'Add Liquidity BNB', value: 'addLiquidityBNB', description: 'Add liquidity with BNB', action: 'Add liquidity BNB' },
			{ name: 'Remove Liquidity', value: 'removeLiquidity', description: 'Remove liquidity from V2 pair', action: 'Remove liquidity' },
			{ name: 'Remove Liquidity BNB', value: 'removeLiquidityBNB', description: 'Remove liquidity to BNB', action: 'Remove liquidity BNB' },
			{ name: 'Remove Liquidity With Permit', value: 'removeLiquidityWithPermit', description: 'Remove using permit signature', action: 'Remove with permit' },
			{ name: 'Get Add Quote', value: 'getAddQuote', description: 'Quote for adding liquidity', action: 'Get add quote' },
			{ name: 'Get Remove Quote', value: 'getRemoveQuote', description: 'Quote for removing liquidity', action: 'Get remove quote' },
			{ name: 'Get LP Token Balance', value: 'getLPBalance', description: 'Get LP token balance', action: 'Get LP balance' },
			{ name: 'Get LP Token Value', value: 'getLPValue', description: 'Get LP token USD value', action: 'Get LP value' },
			{ name: 'Get Pool Share', value: 'getPoolShare', description: 'Get share of pool', action: 'Get pool share' },
			{ name: 'Zap In', value: 'zapIn', description: 'Single-sided liquidity add', action: 'Zap in' },
			{ name: 'Zap Out', value: 'zapOut', description: 'Remove to single token', action: 'Zap out' },
		],
		default: 'addLiquidity',
	},
	{
		displayName: 'Token A Address',
		name: 'tokenA',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidity', 'removeLiquidity', 'getAddQuote', 'getRemoveQuote', 'getLPBalance', 'getLPValue', 'getPoolShare'] } },
		default: '',
	},
	{
		displayName: 'Token B Address',
		name: 'tokenB',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidity', 'removeLiquidity', 'getAddQuote', 'getRemoveQuote', 'getLPBalance', 'getLPValue', 'getPoolShare'] } },
		default: '',
	},
	{
		displayName: 'Token Address',
		name: 'token',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidityBNB', 'removeLiquidityBNB'] } },
		default: '',
	},
	{
		displayName: 'Amount A',
		name: 'amountA',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidity', 'getAddQuote'] } },
		default: '',
	},
	{
		displayName: 'Amount B',
		name: 'amountB',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidity', 'getAddQuote'] } },
		default: '',
	},
	{
		displayName: 'Token Amount',
		name: 'tokenAmount',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidityBNB'] } },
		default: '',
	},
	{
		displayName: 'BNB Amount',
		name: 'bnbAmount',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidityBNB'] } },
		default: '',
	},
	{
		displayName: 'LP Token Amount',
		name: 'lpAmount',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['removeLiquidity', 'removeLiquidityBNB', 'removeLiquidityWithPermit', 'getRemoveQuote'] } },
		default: '',
	},
	{
		displayName: 'Slippage (%)',
		name: 'slippage',
		type: 'number',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['addLiquidity', 'addLiquidityBNB', 'removeLiquidity', 'removeLiquidityBNB'] } },
		default: 0.5,
		typeOptions: { minValue: 0.01, maxValue: 50 },
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['getLPBalance', 'getLPValue', 'getPoolShare'] } },
		default: '',
		placeholder: 'Leave empty for connected wallet',
	},
	{
		displayName: 'Zap Token Address',
		name: 'zapToken',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['zapIn', 'zapOut'] } },
		default: '',
	},
	{
		displayName: 'Zap Amount',
		name: 'zapAmount',
		type: 'string',
		displayOptions: { show: { resource: ['liquidityV2'], operation: ['zapIn', 'zapOut'] } },
		default: '',
	},
];

export async function executeLiquidityV2(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'addLiquidity': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const amountA = this.getNodeParameter('amountA', index) as string;
			const amountB = this.getNodeParameter('amountB', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);

			const amountAWei = client.parseTokenAmount(amountA, tokenAInfo.decimals);
			const amountBWei = client.parseTokenAmount(amountB, tokenBInfo.decimals);

			const slippageBps = Math.floor(slippage * 100);
			const amountAMin = amountAWei * BigInt(10000 - slippageBps) / BigInt(10000);
			const amountBMin = amountBWei * BigInt(10000 - slippageBps) / BigInt(10000);

			const deadline = Math.floor(Date.now() / 1000) + 1200;

			return {
				action: 'addLiquidity',
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol, amount: amountA, min: client.formatTokenAmount(amountAMin, tokenAInfo.decimals) },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol, amount: amountB, min: client.formatTokenAmount(amountBMin, tokenBInfo.decimals) },
				slippage,
				deadline: new Date(deadline * 1000).toISOString(),
				router: client.getContractAddress('routerV2'),
			};
		}

		case 'addLiquidityBNB': {
			const token = this.getNodeParameter('token', index) as string;
			const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
			const bnbAmount = this.getNodeParameter('bnbAmount', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			const tokenInfo = await client.getTokenInfo(token);

			return {
				action: 'addLiquidityETH',
				token: { address: token, symbol: tokenInfo.symbol, amount: tokenAmount },
				bnbAmount,
				slippage,
				router: client.getContractAddress('routerV2'),
			};
		}

		case 'removeLiquidity': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);
			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);

			return {
				action: 'removeLiquidity',
				pairAddress,
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol },
				lpAmount,
				slippage,
				router: client.getContractAddress('routerV2'),
			};
		}

		case 'removeLiquidityBNB': {
			const token = this.getNodeParameter('token', index) as string;
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			const tokenInfo = await client.getTokenInfo(token);

			return {
				action: 'removeLiquidityETH',
				token: { address: token, symbol: tokenInfo.symbol },
				lpAmount,
				slippage,
				router: client.getContractAddress('routerV2'),
			};
		}

		case 'removeLiquidityWithPermit': {
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;

			return {
				action: 'removeLiquidityWithPermit',
				lpAmount,
				note: 'Requires EIP-2612 permit signature to avoid approval tx',
			};
		}

		case 'getAddQuote': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const amountA = this.getNodeParameter('amountA', index) as string;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);
			const reserves = await client.getPairReserves(pairAddress);
			const tokenAInfo = await client.getTokenInfo(tokenA);
			const tokenBInfo = await client.getTokenInfo(tokenB);

			const amountAWei = client.parseTokenAmount(amountA, tokenAInfo.decimals);
			const amountBOptimal = amountAWei * reserves.reserve1 / reserves.reserve0;

			return {
				tokenA: { address: tokenA, symbol: tokenAInfo.symbol, amount: amountA },
				tokenB: { address: tokenB, symbol: tokenBInfo.symbol, optimalAmount: client.formatTokenAmount(amountBOptimal, tokenBInfo.decimals) },
				reserves: {
					reserve0: client.formatTokenAmount(reserves.reserve0, tokenAInfo.decimals),
					reserve1: client.formatTokenAmount(reserves.reserve1, tokenBInfo.decimals),
				},
			};
		}

		case 'getRemoveQuote': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const lpAmount = this.getNodeParameter('lpAmount', index) as string;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);

			return {
				pairAddress,
				lpAmount,
				note: 'Calculate tokenA and tokenB amounts based on LP share of reserves',
			};
		}

		case 'getLPBalance': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);
			const address = walletAddress || await client.getAddress();
			const balance = await client.getTokenBalance(pairAddress, address);

			return {
				pairAddress,
				wallet: address,
				lpBalance: client.formatTokenAmount(balance, 18),
			};
		}

		case 'getLPValue':
		case 'getPoolShare': {
			const tokenA = this.getNodeParameter('tokenA', index) as string;
			const tokenB = this.getNodeParameter('tokenB', index) as string;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;

			const pairAddress = await client.getPairAddress(tokenA, tokenB);
			const address = walletAddress || await client.getAddress();

			return {
				pairAddress,
				wallet: address,
				note: 'Calculate value/share based on LP balance vs total supply',
			};
		}

		case 'zapIn':
		case 'zapOut': {
			const zapToken = this.getNodeParameter('zapToken', index) as string;
			const zapAmount = this.getNodeParameter('zapAmount', index) as string;

			return {
				action: operation,
				token: zapToken,
				amount: zapAmount,
				note: 'Zap contracts swap half to other token then add/remove liquidity',
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
