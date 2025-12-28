/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const ifoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['ifo'] } },
		options: [
			{ name: 'Get Active IFOs', value: 'getActiveIFOs', action: 'Get active IFOs' },
			{ name: 'Get IFO', value: 'getIFO', action: 'Get IFO details' },
			{ name: 'Get Past IFOs', value: 'getPastIFOs', action: 'Get past IFOs' },
			{ name: 'Commit CAKE', value: 'commitCake', action: 'Commit CAKE' },
			{ name: 'Claim Tokens', value: 'claimTokens', action: 'Claim tokens' },
			{ name: 'Get Committed Amount', value: 'getCommittedAmount', action: 'Get committed amount' },
			{ name: 'Get Claimable Amount', value: 'getClaimableAmount', action: 'Get claimable amount' },
			{ name: 'Get IFO Stats', value: 'getIFOStats', action: 'Get IFO stats' },
		],
		default: 'getActiveIFOs',
	},
	{ displayName: 'IFO Address', name: 'ifoAddress', type: 'string', displayOptions: { show: { resource: ['ifo'], operation: ['getIFO', 'commitCake', 'claimTokens', 'getCommittedAmount', 'getClaimableAmount', 'getIFOStats'] } }, default: '' },
	{ displayName: 'Pool ID', name: 'poolId', type: 'options', displayOptions: { show: { resource: ['ifo'], operation: ['commitCake', 'claimTokens', 'getCommittedAmount', 'getClaimableAmount'] } }, options: [{ name: 'Basic Pool', value: 0 }, { name: 'Unlimited Pool', value: 1 }], default: 0 },
	{ displayName: 'Amount', name: 'amount', type: 'string', displayOptions: { show: { resource: ['ifo'], operation: ['commitCake'] } }, default: '' },
];

export async function executeIfo(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const ifoContract = client.getContractAddress('ifo');

	switch (operation) {
		case 'getActiveIFOs':
			return { ifos: [], ifoContract, note: 'Query active IFO contracts from API' };
		case 'getIFO': {
			const ifoAddress = this.getNodeParameter('ifoAddress', index) as string;
			return { ifoAddress, fields: ['offeringToken', 'raisingToken', 'startTime', 'endTime', 'totalAmount'] };
		}
		case 'getPastIFOs':
			return { ifos: [], note: 'Query historical IFO data' };
		case 'commitCake': {
			const ifoAddress = this.getNodeParameter('ifoAddress', index) as string;
			const poolId = this.getNodeParameter('poolId', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			return { action: 'depositPool', ifoAddress, poolId, amount };
		}
		case 'claimTokens': {
			const ifoAddress = this.getNodeParameter('ifoAddress', index) as string;
			const poolId = this.getNodeParameter('poolId', index) as number;
			return { action: 'harvestPool', ifoAddress, poolId };
		}
		case 'getCommittedAmount':
		case 'getClaimableAmount': {
			const ifoAddress = this.getNodeParameter('ifoAddress', index) as string;
			const poolId = this.getNodeParameter('poolId', index) as number;
			const wallet = await client.getAddress();
			return { ifoAddress, poolId, wallet, note: 'Query viewUserAllocationPools' };
		}
		case 'getIFOStats': {
			const ifoAddress = this.getNodeParameter('ifoAddress', index) as string;
			return { ifoAddress, stats: ['totalRaised', 'participants', 'oversubscription'] };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
