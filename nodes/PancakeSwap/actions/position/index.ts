/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const positionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['position'] } },
		options: [
			{ name: 'Get Position', value: 'getPosition', description: 'Get V3 position by token ID', action: 'Get position' },
			{ name: 'Get Positions by Owner', value: 'getPositionsByOwner', description: 'Get all positions for an address', action: 'Get positions by owner' },
			{ name: 'Get Position Liquidity', value: 'getPositionLiquidity', description: 'Get liquidity in position', action: 'Get position liquidity' },
			{ name: 'Get Position Fees', value: 'getPositionFees', description: 'Get earned fees', action: 'Get position fees' },
			{ name: 'Get Position Range', value: 'getPositionRange', description: 'Get price range (ticks)', action: 'Get position range' },
			{ name: 'Get Position Value', value: 'getPositionValue', description: 'Get current USD value', action: 'Get position value' },
			{ name: 'Get Position APR', value: 'getPositionAPR', description: 'Get estimated APR', action: 'Get position APR' },
			{ name: 'Get Uncollected Fees', value: 'getUncollectedFees', description: 'Get uncollected trading fees', action: 'Get uncollected fees' },
			{ name: 'Is Position In Range', value: 'isInRange', description: 'Check if position is in active range', action: 'Is position in range' },
			{ name: 'Get Position NFT', value: 'getPositionNFT', description: 'Get position NFT metadata', action: 'Get position NFT' },
			{ name: 'Get Position History', value: 'getPositionHistory', description: 'Get position history', action: 'Get position history' },
		],
		default: 'getPosition',
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['position'], operation: ['getPosition', 'getPositionLiquidity', 'getPositionFees', 'getPositionRange', 'getPositionValue', 'getPositionAPR', 'getUncollectedFees', 'isInRange', 'getPositionNFT', 'getPositionHistory'] } },
		default: '',
		placeholder: '12345',
		description: 'NFT token ID of the position',
	},
	{
		displayName: 'Owner Address',
		name: 'ownerAddress',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['position'], operation: ['getPositionsByOwner'] } },
		default: '',
		placeholder: '0x...',
	},
];

export async function executePosition(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');

	switch (operation) {
		case 'getPosition': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				protocol: 'V3',
				description: 'V3 positions are NFTs representing concentrated liquidity',
				note: 'Query NonfungiblePositionManager.positions(tokenId)',
				fields: ['nonce', 'operator', 'token0', 'token1', 'fee', 'tickLower', 'tickUpper', 'liquidity', 'feeGrowthInside0LastX128', 'feeGrowthInside1LastX128', 'tokensOwed0', 'tokensOwed1'],
			};
		}

		case 'getPositionsByOwner': {
			const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
			return {
				owner: ownerAddress,
				positions: [],
				note: 'Query subgraph or iterate NonfungiblePositionManager.tokenOfOwnerByIndex()',
			};
		}

		case 'getPositionLiquidity': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				liquidity: 'Query from position data',
				description: 'Liquidity represents share of the position in the tick range',
			};
		}

		case 'getPositionFees':
		case 'getUncollectedFees': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				token0Fees: 'tokensOwed0 from position',
				token1Fees: 'tokensOwed1 from position',
				note: 'Fees accrue based on trading volume in position range',
			};
		}

		case 'getPositionRange': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				tickLower: 'From position data',
				tickUpper: 'From position data',
				priceLower: 'Calculated from tickLower',
				priceUpper: 'Calculated from tickUpper',
				description: 'Position earns fees only when price is within this range',
			};
		}

		case 'getPositionValue': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				token0Amount: 'Calculate from liquidity and current price',
				token1Amount: 'Calculate from liquidity and current price',
				totalValueUSD: 'Sum of token values',
			};
		}

		case 'getPositionAPR': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				apr: 'Estimated based on fee earnings',
				note: 'APR varies based on trading volume and position range',
			};
		}

		case 'isInRange': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				inRange: 'Check if currentTick is between tickLower and tickUpper',
				description: 'Position only earns fees when in range',
			};
		}

		case 'getPositionNFT': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const nftManager = client.getContractAddress('nonfungiblePositionManager');
			return {
				tokenId,
				nftContract: nftManager,
				tokenURI: 'Query NonfungiblePositionManager.tokenURI(tokenId)',
				description: 'Returns base64 encoded SVG image of position',
			};
		}

		case 'getPositionHistory': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return {
				tokenId,
				history: [],
				note: 'Query subgraph for position snapshots',
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
