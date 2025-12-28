/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const lotteryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['lottery'] } },
		options: [
			{ name: 'Get Current Lottery', value: 'getCurrentLottery', action: 'Get current lottery' },
			{ name: 'Get Lottery by ID', value: 'getLotteryById', action: 'Get lottery by ID' },
			{ name: 'Buy Tickets', value: 'buyTickets', action: 'Buy tickets' },
			{ name: 'Get My Tickets', value: 'getMyTickets', action: 'Get my tickets' },
			{ name: 'Claim Prize', value: 'claimPrize', action: 'Claim prize' },
			{ name: 'Get Winning Numbers', value: 'getWinningNumbers', action: 'Get winning numbers' },
			{ name: 'Get Prize Pool', value: 'getPrizePool', action: 'Get prize pool' },
			{ name: 'Get Ticket Price', value: 'getTicketPrice', action: 'Get ticket price' },
			{ name: 'Get Lottery History', value: 'getLotteryHistory', action: 'Get lottery history' },
		],
		default: 'getCurrentLottery',
	},
	{ displayName: 'Lottery ID', name: 'lotteryId', type: 'number', displayOptions: { show: { resource: ['lottery'], operation: ['getLotteryById', 'getMyTickets', 'claimPrize', 'getWinningNumbers'] } }, default: 0 },
	{ displayName: 'Ticket Count', name: 'ticketCount', type: 'number', displayOptions: { show: { resource: ['lottery'], operation: ['buyTickets'] } }, default: 1, typeOptions: { minValue: 1, maxValue: 100 } },
	{ displayName: 'Ticket Numbers', name: 'ticketNumbers', type: 'string', displayOptions: { show: { resource: ['lottery'], operation: ['buyTickets'] } }, default: '', description: 'Comma-separated 6-digit numbers (e.g., 123456,234567)' },
	{ displayName: 'Ticket IDs', name: 'ticketIds', type: 'string', displayOptions: { show: { resource: ['lottery'], operation: ['claimPrize'] } }, default: '', description: 'Comma-separated ticket IDs' },
	{ displayName: 'Bracket', name: 'bracket', type: 'number', displayOptions: { show: { resource: ['lottery'], operation: ['claimPrize'] } }, default: 0, description: 'Prize bracket (0-5)' },
];

export async function executeLottery(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const lottery = client.getContractAddress('lottery');

	switch (operation) {
		case 'getCurrentLottery':
			return { lottery, note: 'Query currentLotteryId and viewLottery' };
		case 'getLotteryById': {
			const lotteryId = this.getNodeParameter('lotteryId', index) as number;
			return { lotteryId, lottery, fields: ['status', 'startTime', 'endTime', 'priceTicketInCake', 'firstTicketId', 'amountCollectedInCake'] };
		}
		case 'buyTickets': {
			const ticketCount = this.getNodeParameter('ticketCount', index) as number;
			const ticketNumbers = this.getNodeParameter('ticketNumbers', index) as string;
			return { action: 'buyTickets', ticketCount, ticketNumbers: ticketNumbers.split(',').map(t => t.trim()), lottery };
		}
		case 'getMyTickets': {
			const lotteryId = this.getNodeParameter('lotteryId', index) as number;
			const wallet = await client.getAddress();
			return { lotteryId, wallet, note: 'Query viewUserInfoForLotteryId' };
		}
		case 'claimPrize': {
			const lotteryId = this.getNodeParameter('lotteryId', index) as number;
			const ticketIds = this.getNodeParameter('ticketIds', index) as string;
			const bracket = this.getNodeParameter('bracket', index) as number;
			return { action: 'claimTickets', lotteryId, ticketIds: ticketIds.split(','), bracket, lottery };
		}
		case 'getWinningNumbers': {
			const lotteryId = this.getNodeParameter('lotteryId', index) as number;
			return { lotteryId, note: 'Query viewLottery.finalNumber' };
		}
		case 'getPrizePool':
		case 'getTicketPrice':
			return { lottery, note: 'Query from current lottery data' };
		case 'getLotteryHistory':
			return { note: 'Query multiple lottery IDs' };
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
