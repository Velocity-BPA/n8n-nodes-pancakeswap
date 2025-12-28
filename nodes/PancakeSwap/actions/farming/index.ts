/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const farmingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['farming'] } },
		options: [
			{ name: 'Get Farms', value: 'getFarms', action: 'Get farms' },
			{ name: 'Get Farm', value: 'getFarm', action: 'Get farm' },
			{ name: 'Get Farm by LP', value: 'getFarmByLP', action: 'Get farm by LP' },
			{ name: 'Stake LP Tokens', value: 'stakeLPTokens', action: 'Stake LP tokens' },
			{ name: 'Unstake LP Tokens', value: 'unstakeLPTokens', action: 'Unstake LP tokens' },
			{ name: 'Harvest CAKE', value: 'harvestCake', action: 'Harvest CAKE' },
			{ name: 'Get Staked LP Balance', value: 'getStakedLPBalance', action: 'Get staked LP balance' },
			{ name: 'Get Pending CAKE', value: 'getPendingCake', action: 'Get pending CAKE' },
			{ name: 'Get Farm APR', value: 'getFarmAPR', action: 'Get farm APR' },
			{ name: 'Get Farm TVL', value: 'getFarmTVL', action: 'Get farm TVL' },
			{ name: 'Get Farm Multiplier', value: 'getFarmMultiplier', action: 'Get farm multiplier' },
			{ name: 'Get Boosted APR', value: 'getBoostedAPR', action: 'Get boosted APR' },
		],
		default: 'getFarms',
	},
	{ displayName: 'Pool ID', name: 'poolId', type: 'number', displayOptions: { show: { resource: ['farming'], operation: ['getFarm', 'stakeLPTokens', 'unstakeLPTokens', 'harvestCake', 'getStakedLPBalance', 'getPendingCake', 'getFarmAPR', 'getFarmTVL', 'getFarmMultiplier', 'getBoostedAPR'] } }, default: 0 },
	{ displayName: 'LP Token Address', name: 'lpAddress', type: 'string', displayOptions: { show: { resource: ['farming'], operation: ['getFarmByLP'] } }, default: '' },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['farming'], operation: ['stakeLPTokens', 'unstakeLPTokens'] } }, default: '' },
	{ displayName: 'Wallet Address', name: 'walletAddress', type: 'string', displayOptions: { show: { resource: ['farming'], operation: ['getStakedLPBalance', 'getPendingCake', 'getBoostedAPR'] } }, default: '' },
];

export async function executeFarming(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const masterChef = client.getContractAddress('masterChefV2');

	switch (operation) {
		case 'getFarms':
			return { farms: [], masterChef, note: 'Query poolLength and iterate poolInfo' };
		case 'getFarm': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { poolId, masterChef, fields: ['lpToken', 'allocPoint', 'lastRewardBlock', 'accCakePerShare'] };
		}
		case 'getFarmByLP': {
			const lpAddress = this.getNodeParameter('lpAddress', index) as string;
			return { lpAddress, note: 'Search farms for matching lpToken address' };
		}
		case 'stakeLPTokens': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'deposit', poolId, amount, masterChef };
		}
		case 'unstakeLPTokens': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'withdraw', poolId, amount, masterChef };
		}
		case 'harvestCake': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { action: 'deposit', poolId, amount: '0', note: 'Deposit 0 to harvest', masterChef };
		}
		case 'getStakedLPBalance':
		case 'getPendingCake': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return { poolId, wallet: address, masterChef };
		}
		case 'getFarmAPR':
		case 'getFarmTVL':
		case 'getFarmMultiplier': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { poolId, note: 'Calculate from pool data and CAKE price' };
		}
		case 'getBoostedAPR': {
			const poolId = this.getNodeParameter('poolId', index) as number;
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return {
				poolId,
				wallet: address,
				note: 'APR boosted up to 2.5x based on veCAKE balance',
				formula: 'boostedAPR = baseAPR * min(2.5, 1 + veCAKE_factor)',
			};
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
