/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const cakeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['cake'] } },
		options: [
			{ name: 'Get CAKE Balance', value: 'getBalance', action: 'Get CAKE balance' },
			{ name: 'Get CAKE Price', value: 'getPrice', action: 'Get CAKE price' },
			{ name: 'Get CAKE Supply', value: 'getSupply', action: 'Get CAKE supply' },
			{ name: 'Get CAKE Burned', value: 'getBurned', action: 'Get CAKE burned' },
			{ name: 'Get CAKE Emissions', value: 'getEmissions', action: 'Get CAKE emissions' },
			{ name: 'Get veCAKE Balance', value: 'getVeCakeBalance', action: 'Get veCAKE balance' },
			{ name: 'Lock CAKE for veCAKE', value: 'lockCake', action: 'Lock CAKE' },
			{ name: 'Extend Lock', value: 'extendLock', action: 'Extend lock' },
			{ name: 'Increase Lock Amount', value: 'increaseLock', action: 'Increase lock' },
			{ name: 'Withdraw Locked CAKE', value: 'withdraw', action: 'Withdraw CAKE' },
			{ name: 'Get Lock Info', value: 'getLockInfo', action: 'Get lock info' },
		],
		default: 'getBalance',
	},
	{ displayName: 'Wallet Address', name: 'walletAddress', type: 'string', displayOptions: { show: { resource: ['cake'], operation: ['getBalance', 'getVeCakeBalance', 'getLockInfo'] } }, default: '', placeholder: 'Leave empty for connected wallet' },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['cake'], operation: ['lockCake', 'increaseLock'] } }, default: '' },
	{ displayName: 'Lock Duration (Weeks)', name: 'lockWeeks', type: 'number', displayOptions: { show: { resource: ['cake'], operation: ['lockCake', 'extendLock'] } }, default: 52, typeOptions: { minValue: 1, maxValue: 208 }, description: 'Lock duration in weeks (max 4 years = 208 weeks)' },
];

export async function executeCake(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const cakeAddress = client.getContractAddress('cake');

	switch (operation) {
		case 'getBalance': {
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			const balance = await client.getTokenBalance(cakeAddress, address);
			return { wallet: address, cakeBalance: client.formatTokenAmount(balance, 18) };
		}
		case 'getPrice': {
			const wbnb = client.getContractAddress('wrappedNative');
			try {
				const amounts = await client.getAmountsOut(client.parseTokenAmount('1', 18), [cakeAddress, wbnb]);
				return { cakeAddress, priceInBNB: client.formatTokenAmount(amounts[1], 18) };
			} catch {
				return { cakeAddress, error: 'Could not fetch price' };
			}
		}
		case 'getSupply': {
			const tokenInfo = await client.getTokenInfo(cakeAddress);
			return { cakeAddress, totalSupply: client.formatTokenAmount(tokenInfo.totalSupply, 18) };
		}
		case 'getBurned':
			return { note: 'Query burn address balance or emission events' };
		case 'getEmissions':
			return { currentEmission: '40 CAKE per block', note: 'Subject to governance changes' };
		case 'getVeCakeBalance': {
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return { wallet: address, note: 'Query veCAKE contract balanceOf' };
		}
		case 'lockCake': {
			const amount = this.getNodeParameter('amount', index) as string;
			const lockWeeks = this.getNodeParameter('lockWeeks', index) as number;
			const lockSeconds = lockWeeks * 7 * 24 * 60 * 60;
			const unlockTime = Math.floor(Date.now() / 1000) + lockSeconds;
			return {
				action: 'createLock',
				amount,
				lockWeeks,
				unlockTime: new Date(unlockTime * 1000).toISOString(),
				veCAKE: client.getContractAddress('veCake'),
			};
		}
		case 'extendLock': {
			const lockWeeks = this.getNodeParameter('lockWeeks', index) as number;
			return { action: 'extendLockTime', lockWeeks, veCAKE: client.getContractAddress('veCake') };
		}
		case 'increaseLock': {
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'increaseLockAmount', amount, veCAKE: client.getContractAddress('veCake') };
		}
		case 'withdraw':
			return { action: 'withdraw', note: 'Can only withdraw after lock expires', veCAKE: client.getContractAddress('veCake') };
		case 'getLockInfo': {
			const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
			const address = walletAddress || await client.getAddress();
			return { wallet: address, note: 'Query veCAKE.locked(address)' };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
