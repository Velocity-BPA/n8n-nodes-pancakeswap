/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { PancakeSwapClient } from '../../transport/pancakeSwapClient';

export const nftMarketplaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nftMarketplace'] } },
		options: [
			{ name: 'Get NFT Collections', value: 'getCollections', action: 'Get collections' },
			{ name: 'Get Collection', value: 'getCollection', action: 'Get collection' },
			{ name: 'Get Collection NFTs', value: 'getCollectionNFTs', action: 'Get collection NFTs' },
			{ name: 'Get NFT', value: 'getNFT', action: 'Get NFT' },
			{ name: 'Get NFT Listings', value: 'getNFTListings', action: 'Get NFT listings' },
			{ name: 'Buy NFT', value: 'buyNFT', action: 'Buy NFT' },
			{ name: 'List NFT', value: 'listNFT', action: 'List NFT' },
			{ name: 'Delist NFT', value: 'delistNFT', action: 'Delist NFT' },
			{ name: 'Make Offer', value: 'makeOffer', action: 'Make offer' },
			{ name: 'Accept Offer', value: 'acceptOffer', action: 'Accept offer' },
			{ name: 'Get Floor Price', value: 'getFloorPrice', action: 'Get floor price' },
			{ name: 'Get User NFTs', value: 'getUserNFTs', action: 'Get user NFTs' },
		],
		default: 'getCollections',
	},
	{ displayName: 'Collection Address', name: 'collectionAddress', type: 'string', displayOptions: { show: { resource: ['nftMarketplace'], operation: ['getCollection', 'getCollectionNFTs', 'getNFT', 'buyNFT', 'listNFT', 'delistNFT', 'makeOffer', 'getFloorPrice'] } }, default: '' },
	{ displayName: 'Token ID', name: 'tokenId', type: 'string', displayOptions: { show: { resource: ['nftMarketplace'], operation: ['getNFT', 'buyNFT', 'listNFT', 'delistNFT', 'makeOffer', 'acceptOffer'] } }, default: '' },
	{ displayName: 'Price (BNB)', name: 'price', type: 'string', displayOptions: { show: { resource: ['nftMarketplace'], operation: ['listNFT', 'makeOffer'] } }, default: '' },
];

export async function executeNftMarketplace(this: IExecuteFunctions, index: number, operation: string): Promise<any> {
	const client = await PancakeSwapClient.fromCredentials(this, 'pancakeSwapNetwork');
	const nftMarket = client.getContractAddress('nftMarket');

	switch (operation) {
		case 'getCollections':
			return { collections: ['Pancake Squad', 'Pancake Bunnies'], nftMarket };
		case 'getCollection':
		case 'getCollectionNFTs':
		case 'getFloorPrice': {
			const collectionAddress = this.getNodeParameter('collectionAddress', index) as string;
			return { collectionAddress, nftMarket };
		}
		case 'getNFT':
		case 'getNFTListings': {
			const collectionAddress = this.getNodeParameter('collectionAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return { collectionAddress, tokenId };
		}
		case 'buyNFT': {
			const collectionAddress = this.getNodeParameter('collectionAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return { action: 'buyTokenUsingBNB', collectionAddress, tokenId, nftMarket };
		}
		case 'listNFT': {
			const collectionAddress = this.getNodeParameter('collectionAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const price = this.getNodeParameter('price', index) as string;
			return { action: 'createAskOrder', collectionAddress, tokenId, price, nftMarket };
		}
		case 'delistNFT': {
			const collectionAddress = this.getNodeParameter('collectionAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return { action: 'cancelAskOrder', collectionAddress, tokenId, nftMarket };
		}
		case 'makeOffer':
		case 'acceptOffer': {
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return { tokenId, nftMarket };
		}
		case 'getUserNFTs': {
			const wallet = await client.getAddress();
			return { wallet, note: 'Query NFT balances for user' };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
