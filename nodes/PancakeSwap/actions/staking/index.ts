/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const stakingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['staking'] } },
		options: [
			{ name: 'Get Syrup Pools', value: 'getSyrupPools', action: 'Get syrup pools' },
			{ name: 'Get Syrup Pool', value: 'getSyrupPool', action: 'Get syrup pool' },
			{ name: 'Stake CAKE', value: 'stakeCake', action: 'Stake CAKE' },
			{ name: 'Unstake CAKE', value: 'unstakeCake', action: 'Unstake CAKE' },
			{ name: 'Harvest Rewards', value: 'harvestRewards', action: 'Harvest rewards' },
			{ name: 'Get Staked Balance', value: 'getStakedBalance', action: 'Get staked balance' },
			{ name: 'Get Pending Rewards', value: 'getPendingRewards', action: 'Get pending rewards' },
			{ name: 'Get Pool APR', value: 'getPoolAPR', action: 'Get pool APR' },
			{ name: 'Get Pool TVL', value: 'getPoolTVL', action: 'Get pool TVL' },
			{ name: 'Get Pool End Time', value: 'getPoolEndTime', action: 'Get pool end time' },
			{ name: 'Compound Rewards', value: 'compoundRewards', action: 'Compound rewards' },
		],
		default: 'getSyrupPools',
	},
	{ displayName: 'Pool ID', name: 'poolId', type: 'number', displayOptions: { show: { resource: ['staking'], operation: ['getSyrupPool', 'stakeCake', 'unstakeCake', 'harvestRewards', 'getStakedBalance', 'getPendingRewards', 'getPoolAPR', 'getPoolTVL', 'getPoolEndTime', 'compoundRewards'] } }, default: 0 },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['staking'], operation: ['stakeCake', 'unstakeCake'] } }, default: '' },
	{ displayName: 'Wallet Address', name: 'walletAddress', type: 'string', displayOptions: { show: { resource: ['staking'], operation: ['getStakedBalance', 'getPendingRewards'] } }, default: '' },
];

export async function executeStaking(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const masterChef = client.getContractAddress('masterChefV2');

	switch (operation) {
		case 'getSyrupPools':
			return { pools: [], masterChef, note: 'Query SmartChef contracts or API' };
		case 'getSyrupPool': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { poolId, masterChef, note: 'Query poolInfo from MasterChef' };
		}
		case 'stakeCake': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'deposit', poolId, amount, masterChef };
		}
		case 'unstakeCake': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'withdraw', poolId, amount, masterChef };
		}
		case 'harvestRewards': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { action: 'deposit', poolId, amount: '0', note: 'Deposit 0 to harvest', masterChef };
		}
		case 'getStakedBalance': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return { poolId, wallet: address, note: 'Query userInfo from MasterChef' };
		}
		case 'getPendingRewards': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return { poolId, wallet: address, note: 'Query pendingCake from MasterChef' };
		}
		case 'getPoolAPR':
		case 'getPoolTVL':
		case 'getPoolEndTime': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { poolId, note: 'Calculate from pool data' };
		}
		case 'compoundRewards': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { action: 'compound', poolId, steps: ['1. Harvest rewards', '2. Stake harvested CAKE'] };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
