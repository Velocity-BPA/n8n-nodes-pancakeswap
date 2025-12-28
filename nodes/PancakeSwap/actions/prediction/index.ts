/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const predictionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prediction'] } },
		options: [
			{ name: 'Get Current Round', value: 'getCurrentRound', action: 'Get current round' },
			{ name: 'Get Round by Epoch', value: 'getRoundByEpoch', action: 'Get round by epoch' },
			{ name: 'Enter Bull Position', value: 'enterBull', action: 'Enter bull position' },
			{ name: 'Enter Bear Position', value: 'enterBear', action: 'Enter bear position' },
			{ name: 'Claim Winning', value: 'claimWinning', action: 'Claim winning' },
			{ name: 'Get User History', value: 'getUserHistory', action: 'Get user history' },
			{ name: 'Get User Rounds', value: 'getUserRounds', action: 'Get user rounds' },
			{ name: 'Get User Stats', value: 'getUserStats', action: 'Get user stats' },
			{ name: 'Get Oracle Price', value: 'getOraclePrice', action: 'Get oracle price' },
			{ name: 'Get Prize Pool', value: 'getPrizePool', action: 'Get prize pool' },
		],
		default: 'getCurrentRound',
	},
	{ displayName: 'Epoch', name: 'epoch', type: 'number', displayOptions: { show: { resource: ['prediction'], operation: ['getRoundByEpoch', 'claimWinning'] } }, default: 0 },
	{ displayName: 'Amount (BNB)', name: 'amount', type: 'string', displayOptions: { show: { resource: ['prediction'], operation: ['enterBull', 'enterBear'] } }, default: '0.1' },
	{ displayName: 'Epochs', name: 'epochs', type: 'string', displayOptions: { show: { resource: ['prediction'], operation: ['claimWinning'] } }, default: '', description: 'Comma-separated epochs to claim' },
];

export async function executePrediction(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const prediction = client.getContractAddress('predictionBnb');

	switch (operation) {
		case 'getCurrentRound':
			return { prediction, note: 'Query currentEpoch and rounds(epoch)' };
		case 'getRoundByEpoch': {
			const epoch = this.getNodeParameter('epoch', index) as number;
			return { epoch, fields: ['startTimestamp', 'lockTimestamp', 'closeTimestamp', 'lockPrice', 'closePrice', 'totalAmount', 'bullAmount', 'bearAmount'] };
		}
		case 'enterBull':
		case 'enterBear': {
			const amount = this.getNodeParameter('amount', index) as string;
			const action = operation === 'enterBull' ? 'betBull' : 'betBear';
			return { action, amount, prediction, note: 'Send BNB with the bet' };
		}
		case 'claimWinning': {
			const epochs = (this.getNodeParameter('epochs', index) as string).split(',').map(e => parseInt(e.trim()));
			return { action: 'claim', epochs, prediction };
		}
		case 'getUserHistory':
		case 'getUserRounds':
		case 'getUserStats': {
			const wallet = await client.getAddress();
			return { wallet, note: 'Query ledger(epoch, user) for each round' };
		}
		case 'getOraclePrice':
			return { note: 'Query Chainlink price feed oracle' };
		case 'getPrizePool':
			return { note: 'Query rounds(currentEpoch).totalAmount' };
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
