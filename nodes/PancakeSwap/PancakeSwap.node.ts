/**
 * PancakeSwap n8n Community Node
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { swapOperations, executeSwap } from './actions/swap';
import { quoteOperations, executeQuote } from './actions/quote';
import { routeOperations, executeRoute } from './actions/route';
import { poolV3Operations, executePoolV3 } from './actions/poolV3';
import { poolV2Operations, executePoolV2 } from './actions/poolV2';
import { stableSwapPoolOperations, executeStableSwapPool } from './actions/stableSwapPool';
import { positionOperations, executePosition } from './actions/position';
import { liquidityV3Operations, executeLiquidityV3 } from './actions/liquidityV3';
import { liquidityV2Operations, executeLiquidityV2 } from './actions/liquidityV2';
import { stableSwapLiquidityOperations, executeStableSwapLiquidity } from './actions/stableSwapLiquidity';
import { tokenOperations, executeToken } from './actions/token';
import { priceOperations, executePrice } from './actions/price';
import { cakeOperations, executeCake } from './actions/cake';
import { stakingOperations, executeStaking } from './actions/staking';
import { farmingOperations, executeFarming } from './actions/farming';
import { ifoOperations, executeIfo } from './actions/ifo';
import { lotteryOperations, executeLottery } from './actions/lottery';
import { predictionOperations, executePrediction } from './actions/prediction';
import { nftMarketplaceOperations, executeNftMarketplace } from './actions/nftMarketplace';
import { potteryOperations, executePottery } from './actions/pottery';
import { perpetualsOperations, executePerpetuals } from './actions/perpetuals';
import { veCakeOperations, executeVeCake } from './actions/veCake';
import { governanceOperations, executeGovernance } from './actions/governance';
import { crossChainOperations, executeCrossChain } from './actions/crossChain';
import { analyticsOperations, executeAnalytics } from './actions/analytics';
import { subgraphOperations, executeSubgraph } from './actions/subgraph';
import { utilityOperations, executeUtility } from './actions/utility';

export class PancakeSwap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PancakeSwap',
		name: 'pancakeSwap',
		icon: 'file:pancakeswap.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with PancakeSwap DEX - V2, V3, StableSwap, Farms, Staking, IFO, and more',
		defaults: {
			name: 'PancakeSwap',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pancakeSwapNetwork',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'swap',
							'liquidityV3',
							'liquidityV2',
							'stableSwapLiquidity',
							'cake',
							'staking',
							'farming',
							'ifo',
							'lottery',
							'prediction',
							'nftMarketplace',
							'pottery',
							'perpetuals',
							'veCake',
							'governance',
							'crossChain',
						],
					},
				},
			},
			{
				name: 'pancakeSwapApi',
				required: false,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Swap',
						value: 'swap',
						description: 'Execute token swaps across V2, V3, and StableSwap pools',
					},
					{
						name: 'Quote',
						value: 'quote',
						description: 'Get swap quotes from different protocols',
					},
					{
						name: 'Route',
						value: 'route',
						description: 'Find optimal swap routes',
					},
					{
						name: 'Pool (V3)',
						value: 'poolV3',
						description: 'Interact with V3 concentrated liquidity pools',
					},
					{
						name: 'Pool (V2)',
						value: 'poolV2',
						description: 'Interact with V2 AMM pairs',
					},
					{
						name: 'StableSwap Pool',
						value: 'stableSwapPool',
						description: 'Interact with StableSwap pools for stable assets',
					},
					{
						name: 'Position (V3)',
						value: 'position',
						description: 'Manage V3 liquidity positions',
					},
					{
						name: 'Liquidity (V3)',
						value: 'liquidityV3',
						description: 'Add/remove liquidity to V3 pools',
					},
					{
						name: 'Liquidity (V2)',
						value: 'liquidityV2',
						description: 'Add/remove liquidity to V2 pairs',
					},
					{
						name: 'StableSwap Liquidity',
						value: 'stableSwapLiquidity',
						description: 'Manage StableSwap pool liquidity',
					},
					{
						name: 'Token',
						value: 'token',
						description: 'Get token information and prices',
					},
					{
						name: 'Price',
						value: 'price',
						description: 'Get price data and charts',
					},
					{
						name: 'CAKE',
						value: 'cake',
						description: 'CAKE token operations and veCAKE locking',
					},
					{
						name: 'Staking (Syrup Pools)',
						value: 'staking',
						description: 'Stake CAKE in Syrup pools for rewards',
					},
					{
						name: 'Farming',
						value: 'farming',
						description: 'Stake LP tokens in farms for CAKE rewards',
					},
					{
						name: 'IFO',
						value: 'ifo',
						description: 'Participate in Initial Farm Offerings',
					},
					{
						name: 'Lottery',
						value: 'lottery',
						description: 'Participate in CAKE lottery',
					},
					{
						name: 'Prediction',
						value: 'prediction',
						description: 'Price prediction markets',
					},
					{
						name: 'NFT Marketplace',
						value: 'nftMarketplace',
						description: 'Buy and sell NFTs',
					},
					{
						name: 'Pottery',
						value: 'pottery',
						description: 'Prize savings game',
					},
					{
						name: 'Perpetuals',
						value: 'perpetuals',
						description: 'Perpetual futures trading',
					},
					{
						name: 'veCAKE',
						value: 'veCake',
						description: 'Vote-escrowed CAKE for governance and boosts',
					},
					{
						name: 'Governance',
						value: 'governance',
						description: 'Participate in protocol governance',
					},
					{
						name: 'Cross-Chain',
						value: 'crossChain',
						description: 'Bridge tokens between chains',
					},
					{
						name: 'Analytics',
						value: 'analytics',
						description: 'Protocol analytics and statistics',
					},
					{
						name: 'Subgraph',
						value: 'subgraph',
						description: 'Query The Graph subgraphs directly',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Helper functions and calculations',
					},
				],
				default: 'swap',
			},
			// All operations
			...swapOperations,
			...quoteOperations,
			...routeOperations,
			...poolV3Operations,
			...poolV2Operations,
			...stableSwapPoolOperations,
			...positionOperations,
			...liquidityV3Operations,
			...liquidityV2Operations,
			...stableSwapLiquidityOperations,
			...tokenOperations,
			...priceOperations,
			...cakeOperations,
			...stakingOperations,
			...farmingOperations,
			...ifoOperations,
			...lotteryOperations,
			...predictionOperations,
			...nftMarketplaceOperations,
			...potteryOperations,
			...perpetualsOperations,
			...veCakeOperations,
			...governanceOperations,
			...crossChainOperations,
			...analyticsOperations,
			...subgraphOperations,
			...utilityOperations,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any;

				switch (resource) {
					case 'swap':
						result = await executeSwap.call(this, i, operation);
						break;
					case 'quote':
						result = await executeQuote.call(this, i, operation);
						break;
					case 'route':
						result = await executeRoute.call(this, i, operation);
						break;
					case 'poolV3':
						result = await executePoolV3.call(this, i, operation);
						break;
					case 'poolV2':
						result = await executePoolV2.call(this, i, operation);
						break;
					case 'stableSwapPool':
						result = await executeStableSwapPool.call(this, i, operation);
						break;
					case 'position':
						result = await executePosition.call(this, i, operation);
						break;
					case 'liquidityV3':
						result = await executeLiquidityV3.call(this, i, operation);
						break;
					case 'liquidityV2':
						result = await executeLiquidityV2.call(this, i, operation);
						break;
					case 'stableSwapLiquidity':
						result = await executeStableSwapLiquidity.call(this, i, operation);
						break;
					case 'token':
						result = await executeToken.call(this, i, operation);
						break;
					case 'price':
						result = await executePrice.call(this, i, operation);
						break;
					case 'cake':
						result = await executeCake.call(this, i, operation);
						break;
					case 'staking':
						result = await executeStaking.call(this, i, operation);
						break;
					case 'farming':
						result = await executeFarming.call(this, i, operation);
						break;
					case 'ifo':
						result = await executeIfo.call(this, i, operation);
						break;
					case 'lottery':
						result = await executeLottery.call(this, i, operation);
						break;
					case 'prediction':
						result = await executePrediction.call(this, i, operation);
						break;
					case 'nftMarketplace':
						result = await executeNftMarketplace.call(this, i, operation);
						break;
					case 'pottery':
						result = await executePottery.call(this, i, operation);
						break;
					case 'perpetuals':
						result = await executePerpetuals.call(this, i, operation);
						break;
					case 'veCake':
						result = await executeVeCake.call(this, i, operation);
						break;
					case 'governance':
						result = await executeGovernance.call(this, i, operation);
						break;
					case 'crossChain':
						result = await executeCrossChain.call(this, i, operation);
						break;
					case 'analytics':
						result = await executeAnalytics.call(this, i, operation);
						break;
					case 'subgraph':
						result = await executeSubgraph.call(this, i, operation);
						break;
					case 'utility':
						result = await executeUtility.call(this, i, operation);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
							{ itemIndex: i },
						);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(result),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
