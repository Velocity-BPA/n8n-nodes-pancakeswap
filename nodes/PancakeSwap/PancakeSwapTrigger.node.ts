/**
 * PancakeSwap Trigger Node
 * Real-time event monitoring for PancakeSwap DEX
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';
import { ethers } from 'ethers';
import { NETWORKS, CONTRACTS } from './constants';

export class PancakeSwapTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PancakeSwap Trigger',
		name: 'pancakeSwapTrigger',
		icon: 'file:pancakeswap.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerCategory"] + ": " + $parameter["event"]}}',
		description: 'Monitor PancakeSwap events in real-time across multiple chains',
		defaults: {
			name: 'PancakeSwap Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'pancakeSwapNetwork',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				options: [
					{ name: 'BNB Chain (BSC)', value: 'bsc' },
					{ name: 'Ethereum', value: 'ethereum' },
					{ name: 'Arbitrum One', value: 'arbitrum' },
					{ name: 'Base', value: 'base' },
					{ name: 'zkSync Era', value: 'zksync' },
					{ name: 'Linea', value: 'linea' },
					{ name: 'Polygon zkEVM', value: 'polygonZkEvm' },
					{ name: 'opBNB', value: 'opbnb' },
				],
				default: 'bsc',
				description: 'The network to monitor for events',
			},
			{
				displayName: 'Trigger Category',
				name: 'triggerCategory',
				type: 'options',
				options: [
					{ name: 'Swap', value: 'swap' },
					{ name: 'Pool', value: 'pool' },
					{ name: 'Position', value: 'position' },
					{ name: 'Farm', value: 'farm' },
					{ name: 'CAKE', value: 'cake' },
					{ name: 'IFO', value: 'ifo' },
					{ name: 'Lottery', value: 'lottery' },
					{ name: 'Prediction', value: 'prediction' },
					{ name: 'Perpetuals', value: 'perpetuals' },
					{ name: 'Price', value: 'price' },
				],
				default: 'swap',
				description: 'The category of events to monitor',
			},

			// Swap Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['swap'],
					},
				},
				options: [
					{ name: 'Swap Executed', value: 'swapExecuted', description: 'Any swap is executed' },
					{ name: 'Large Swap Alert', value: 'largeSwap', description: 'Swap exceeds threshold amount' },
					{ name: 'Price Impact Alert', value: 'priceImpact', description: 'Swap has high price impact' },
					{ name: 'Swap on Pool', value: 'swapOnPool', description: 'Swap on specific pool' },
					{ name: 'Arbitrage Opportunity', value: 'arbitrage', description: 'Price discrepancy detected' },
				],
				default: 'swapExecuted',
				description: 'The swap event to monitor',
			},
			{
				displayName: 'Pool Address',
				name: 'swapPoolAddress',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['swap'],
						event: ['swapOnPool'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'The pool address to monitor for swaps',
			},
			{
				displayName: 'Minimum Amount (USD)',
				name: 'minSwapAmount',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['swap'],
						event: ['largeSwap'],
					},
				},
				default: 10000,
				description: 'Minimum swap amount in USD to trigger',
			},
			{
				displayName: 'Price Impact Threshold (%)',
				name: 'priceImpactThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['swap'],
						event: ['priceImpact'],
					},
				},
				default: 5,
				description: 'Minimum price impact percentage to trigger',
			},

			// Pool Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['pool'],
					},
				},
				options: [
					{ name: 'Pool Created', value: 'poolCreated', description: 'New pool is created' },
					{ name: 'Liquidity Added', value: 'liquidityAdded', description: 'Liquidity added to pool' },
					{ name: 'Liquidity Removed', value: 'liquidityRemoved', description: 'Liquidity removed from pool' },
					{ name: 'TVL Changed', value: 'tvlChanged', description: 'Pool TVL changes significantly' },
					{ name: 'APR Changed', value: 'aprChanged', description: 'Pool APR changes significantly' },
				],
				default: 'poolCreated',
				description: 'The pool event to monitor',
			},
			{
				displayName: 'Pool Address',
				name: 'poolAddress',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['pool'],
						event: ['liquidityAdded', 'liquidityRemoved', 'tvlChanged', 'aprChanged'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'The pool address to monitor (leave empty for all pools)',
			},
			{
				displayName: 'TVL Change Threshold (%)',
				name: 'tvlChangeThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['pool'],
						event: ['tvlChanged'],
					},
				},
				default: 10,
				description: 'Minimum TVL change percentage to trigger',
			},

			// Position Events (V3)
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['position'],
					},
				},
				options: [
					{ name: 'Position Minted', value: 'positionMinted', description: 'New V3 position created' },
					{ name: 'Position Changed', value: 'positionChanged', description: 'Position liquidity modified' },
					{ name: 'Position Burned', value: 'positionBurned', description: 'Position closed/burned' },
					{ name: 'Fees Collected', value: 'feesCollected', description: 'Fees collected from position' },
					{ name: 'Out of Range Alert', value: 'outOfRange', description: 'Position goes out of range' },
				],
				default: 'positionMinted',
				description: 'The position event to monitor',
			},
			{
				displayName: 'Owner Address',
				name: 'positionOwner',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['position'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Filter by position owner address (leave empty for all)',
			},
			{
				displayName: 'Position Token ID',
				name: 'positionTokenId',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['position'],
						event: ['positionChanged', 'feesCollected', 'outOfRange'],
					},
				},
				default: '',
				description: 'Specific position NFT ID to monitor',
			},

			// Farm Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['farm'],
					},
				},
				options: [
					{ name: 'Farm Created', value: 'farmCreated', description: 'New farm is created' },
					{ name: 'Farm Updated', value: 'farmUpdated', description: 'Farm parameters updated' },
					{ name: 'LP Staked', value: 'lpStaked', description: 'LP tokens staked in farm' },
					{ name: 'LP Unstaked', value: 'lpUnstaked', description: 'LP tokens unstaked from farm' },
					{ name: 'Rewards Harvested', value: 'rewardsHarvested', description: 'CAKE rewards harvested' },
					{ name: 'Boost Changed', value: 'boostChanged', description: 'veCAKE boost multiplier changed' },
				],
				default: 'lpStaked',
				description: 'The farm event to monitor',
			},
			{
				displayName: 'Farm Pool ID',
				name: 'farmPoolId',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['farm'],
					},
				},
				default: 0,
				description: 'Specific farm pool ID to monitor (0 for all)',
			},

			// CAKE Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['cake'],
					},
				},
				options: [
					{ name: 'CAKE Staked', value: 'cakeStaked', description: 'CAKE staked in Syrup Pool' },
					{ name: 'CAKE Unstaked', value: 'cakeUnstaked', description: 'CAKE unstaked from Syrup Pool' },
					{ name: 'veCAKE Locked', value: 'veCakeLocked', description: 'CAKE locked for veCAKE' },
					{ name: 'veCAKE Extended', value: 'veCakeExtended', description: 'veCAKE lock extended' },
					{ name: 'Rewards Claimed', value: 'rewardsClaimed', description: 'Staking rewards claimed' },
				],
				default: 'veCakeLocked',
				description: 'The CAKE event to monitor',
			},
			{
				displayName: 'User Address',
				name: 'cakeUserAddress',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['cake'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Filter by user address (leave empty for all)',
			},

			// IFO Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['ifo'],
					},
				},
				options: [
					{ name: 'IFO Started', value: 'ifoStarted', description: 'New IFO begins' },
					{ name: 'IFO Ended', value: 'ifoEnded', description: 'IFO ends' },
					{ name: 'CAKE Committed', value: 'cakeCommitted', description: 'CAKE committed to IFO' },
					{ name: 'Tokens Claimed', value: 'tokensClaimed', description: 'IFO tokens claimed' },
				],
				default: 'ifoStarted',
				description: 'The IFO event to monitor',
			},

			// Lottery Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['lottery'],
					},
				},
				options: [
					{ name: 'Round Started', value: 'roundStarted', description: 'New lottery round begins' },
					{ name: 'Round Ended', value: 'roundEnded', description: 'Lottery round ends' },
					{ name: 'Ticket Purchased', value: 'ticketPurchased', description: 'Lottery ticket bought' },
					{ name: 'Prize Claimed', value: 'prizeClaimed', description: 'Lottery prize claimed' },
				],
				default: 'roundStarted',
				description: 'The lottery event to monitor',
			},

			// Prediction Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['prediction'],
					},
				},
				options: [
					{ name: 'Round Started', value: 'predictionRoundStarted', description: 'New prediction round begins' },
					{ name: 'Round Ended', value: 'predictionRoundEnded', description: 'Prediction round ends' },
					{ name: 'Position Entered', value: 'positionEntered', description: 'Bull/Bear position entered' },
					{ name: 'Winning Claimed', value: 'winningClaimed', description: 'Prediction winnings claimed' },
					{ name: 'Oracle Updated', value: 'oracleUpdated', description: 'Chainlink oracle price updated' },
				],
				default: 'predictionRoundStarted',
				description: 'The prediction event to monitor',
			},
			{
				displayName: 'Prediction Market',
				name: 'predictionMarket',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['prediction'],
					},
				},
				options: [
					{ name: 'BNB/USD', value: 'bnb' },
					{ name: 'CAKE/USD', value: 'cake' },
				],
				default: 'bnb',
				description: 'The prediction market to monitor',
			},

			// Perpetuals Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['perpetuals'],
					},
				},
				options: [
					{ name: 'Position Opened', value: 'perpPositionOpened', description: 'Perpetual position opened' },
					{ name: 'Position Closed', value: 'perpPositionClosed', description: 'Perpetual position closed' },
					{ name: 'Position Liquidated', value: 'perpLiquidated', description: 'Position was liquidated' },
					{ name: 'Funding Paid', value: 'fundingPaid', description: 'Funding payment processed' },
				],
				default: 'perpPositionOpened',
				description: 'The perpetuals event to monitor',
			},
			{
				displayName: 'Market',
				name: 'perpMarket',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['perpetuals'],
					},
				},
				default: '',
				placeholder: 'BTC/USD',
				description: 'Filter by market (leave empty for all)',
			},

			// Price Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['price'],
					},
				},
				options: [
					{ name: 'Price Changed', value: 'priceChanged', description: 'Token price changed' },
					{ name: 'Price Alert', value: 'priceAlert', description: 'Price crosses threshold' },
					{ name: 'Significant Move', value: 'significantMove', description: 'Large price movement detected' },
				],
				default: 'priceAlert',
				description: 'The price event to monitor',
			},
			{
				displayName: 'Token Address',
				name: 'priceTokenAddress',
				type: 'string',
				displayOptions: {
					show: {
						triggerCategory: ['price'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'The token address to monitor price',
			},
			{
				displayName: 'Alert Price (USD)',
				name: 'alertPrice',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['price'],
						event: ['priceAlert'],
					},
				},
				default: 0,
				description: 'Price threshold to trigger alert',
			},
			{
				displayName: 'Alert Direction',
				name: 'alertDirection',
				type: 'options',
				displayOptions: {
					show: {
						triggerCategory: ['price'],
						event: ['priceAlert'],
					},
				},
				options: [
					{ name: 'Above', value: 'above' },
					{ name: 'Below', value: 'below' },
					{ name: 'Cross', value: 'cross' },
				],
				default: 'above',
				description: 'Direction of price alert',
			},
			{
				displayName: 'Move Threshold (%)',
				name: 'moveThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerCategory: ['price'],
						event: ['significantMove'],
					},
				},
				default: 5,
				description: 'Percentage move to trigger alert',
			},

			// Polling interval
			{
				displayName: 'Poll Interval',
				name: 'pollInterval',
				type: 'number',
				default: 60,
				description: 'How often to poll for events (in seconds)',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const network = this.getNodeParameter('network', 'bsc') as string;
		const triggerCategory = this.getNodeParameter('triggerCategory', 'swap') as string;
		const event = this.getNodeParameter('event', '') as string;
		const pollIntervalMs = (this.getNodeParameter('pollInterval', 60) as number) * 1000;

		const credentials = await this.getCredentials('pancakeSwapNetwork');
		const rpcUrl = credentials.rpcUrl as string || NETWORKS[network]?.rpcUrl;

		if (!rpcUrl) {
			throw new Error(`No RPC URL configured for network: ${network}`);
		}

		const provider = new ethers.JsonRpcProvider(rpcUrl);
		const networkConfig = NETWORKS[network];

		if (!networkConfig) {
			throw new Error(`Unknown network: ${network}`);
		}

		// Store last processed block for polling
		let lastProcessedBlock = await provider.getBlockNumber();

		// Helper function to poll for events
		const pollForEvents = async (
			fromBlock: number,
			toBlock: number,
		): Promise<any[]> => {
			const events: any[] = [];

			switch (triggerCategory) {
				case 'swap':
					return pollSwapEvents(provider, network, event, fromBlock, toBlock);
				case 'pool':
					return pollPoolEvents(provider, network, event, fromBlock, toBlock);
				case 'position':
					return pollPositionEvents(provider, network, event, fromBlock, toBlock);
				case 'farm':
					return pollFarmEvents(provider, network, event, fromBlock, toBlock);
				case 'cake':
					return pollCakeEvents(provider, network, event, fromBlock, toBlock);
				case 'ifo':
					return pollIfoEvents(provider, network, event, fromBlock, toBlock);
				case 'lottery':
					return pollLotteryEvents(provider, network, event, fromBlock, toBlock);
				case 'prediction':
					return pollPredictionEvents(provider, network, event, fromBlock, toBlock);
				case 'perpetuals':
					return pollPerpetualsEvents(provider, network, event, fromBlock, toBlock);
				case 'price':
					return pollPriceEvents(provider, network, event, fromBlock, toBlock);
				default:
					return events;
			}
		};

		const executePoll = async (): Promise<void> => {
			try {
				const currentBlock = await provider.getBlockNumber();

				if (currentBlock <= lastProcessedBlock) {
					return;
				}

				const events = await pollForEvents(lastProcessedBlock, currentBlock);

				for (const eventData of events) {
					this.emit([this.helpers.returnJsonArray([eventData])]);
				}

				lastProcessedBlock = currentBlock;
			} catch (error) {
				console.error('PancakeSwap Trigger polling error:', error);
			}
		};

		// Set up interval for polling
		const intervalId = setInterval(executePoll, pollIntervalMs);

		return {
			closeFunction: async () => {
				clearInterval(intervalId);
			},
			manualTriggerFunction: async () => {
				await executePoll();
			},
		};
	}
}

// Helper functions for polling events
async function pollSwapEvents(
	provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	fromBlock: number,
	toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;

	const swapTopic = ethers.id('Swap(address,address,int256,int256,uint160,uint128,int24)');

	try {
		const contracts = CONTRACTS[network];
		const factoryAddress = contracts?.factoryV3;
		if (factoryAddress) {
			const logs = await provider.getLogs({
				fromBlock,
				toBlock,
				topics: [swapTopic],
			});

			for (const log of logs) {
				events.push({
					type: 'swap',
					event: _event,
					version: 'v3',
					pool: log.address,
					transactionHash: log.transactionHash,
					blockNumber: log.blockNumber,
					timestamp: new Date().toISOString(),
					network: networkConfig.name,
					chainId: networkConfig.chainId,
				});
			}
		}
	} catch (error) {
		console.error('Error polling swap events:', error);
	}

	return events;
}

async function pollPoolEvents(
	provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	fromBlock: number,
	toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;

	try {
		const mintTopic = ethers.id('Mint(address,address,int24,int24,uint128,uint256,uint256)');
		const logs = await provider.getLogs({
			fromBlock,
			toBlock,
			topics: [mintTopic],
		});

		for (const log of logs) {
			events.push({
				type: 'pool',
				event: _event,
				pool: log.address,
				transactionHash: log.transactionHash,
				blockNumber: log.blockNumber,
				timestamp: new Date().toISOString(),
				network: networkConfig.name,
				chainId: networkConfig.chainId,
			});
		}
	} catch (error) {
		console.error('Error polling pool events:', error);
	}

	return events;
}

async function pollPositionEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Position events handled by pool events
	return events;
}

async function pollFarmEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Farm staking events
	return events;
}

async function pollCakeEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// CAKE/veCAKE events
	return events;
}

async function pollIfoEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// IFO events
	return events;
}

async function pollLotteryEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Lottery events
	return events;
}

async function pollPredictionEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Prediction market events
	return events;
}

async function pollPerpetualsEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Perpetuals trading events
	return events;
}

async function pollPriceEvents(
	_provider: ethers.JsonRpcProvider,
	network: string,
	_event: string,
	_fromBlock: number,
	_toBlock: number,
): Promise<any[]> {
	const events: any[] = [];
	const networkConfig = NETWORKS[network];
	if (!networkConfig) return events;
	// Price change events
	return events;
}
