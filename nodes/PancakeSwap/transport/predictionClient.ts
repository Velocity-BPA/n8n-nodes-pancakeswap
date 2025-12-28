/**
 * PancakeSwap Prediction Client
 * Handles prediction market rounds, positions, and oracle operations
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { ethers } from 'ethers';
import { getContractsByChainId, NETWORKS } from '../constants';

export interface PredictionRound {
	epoch: bigint;
	startTimestamp: bigint;
	lockTimestamp: bigint;
	closeTimestamp: bigint;
	lockPrice: bigint;
	closePrice: bigint;
	lockOracleId: bigint;
	closeOracleId: bigint;
	totalAmount: bigint;
	bullAmount: bigint;
	bearAmount: bigint;
	rewardBaseCalAmount: bigint;
	rewardAmount: bigint;
	oracleCalled: boolean;
}

export interface UserBet {
	position: 'Bull' | 'Bear';
	amount: bigint;
	claimed: boolean;
}

export interface UserStats {
	totalBets: number;
	totalBNB: bigint;
	netBNB: bigint;
	averageBNB: bigint;
	winRate: number;
	totalClaimed: bigint;
}

// Prediction ABI
const PREDICTION_ABI = [
	'function currentEpoch() external view returns (uint256)',
	'function rounds(uint256 epoch) external view returns (uint256 epoch, uint256 startTimestamp, uint256 lockTimestamp, uint256 closeTimestamp, int256 lockPrice, int256 closePrice, uint256 lockOracleId, uint256 closeOracleId, uint256 totalAmount, uint256 bullAmount, uint256 bearAmount, uint256 rewardBaseCalAmount, uint256 rewardAmount, bool oracleCalled)',
	'function ledger(uint256 epoch, address user) external view returns (uint8 position, uint256 amount, bool claimed)',
	'function userRounds(address user, uint256 cursor, uint256 size) external view returns (uint256[] memory, tuple(uint8 position, uint256 amount, bool claimed)[] memory, uint256)',
	'function claimable(uint256 epoch, address user) external view returns (bool)',
	'function refundable(uint256 epoch, address user) external view returns (bool)',
	'function betBull(uint256 epoch) external payable',
	'function betBear(uint256 epoch) external payable',
	'function claim(uint256[] calldata epochs) external',
	'function minBetAmount() external view returns (uint256)',
	'function treasuryFee() external view returns (uint256)',
	'function intervalSeconds() external view returns (uint256)',
	'function bufferSeconds() external view returns (uint256)',
	'function oracleLatestRoundId() external view returns (uint256)',
	'function genesisStartOnce() external view returns (bool)',
	'function genesisLockOnce() external view returns (bool)',
	'function paused() external view returns (bool)',
];

// Chainlink Aggregator ABI
const AGGREGATOR_ABI = [
	'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
	'function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
	'function decimals() external view returns (uint8)',
	'function description() external view returns (string memory)',
];

export class PredictionClient {
	private provider: ethers.JsonRpcProvider;
	private wallet: ethers.Wallet | null = null;
	private predictionBNBAddress: string;
	private predictionCAKEAddress: string;
	private bnbOracleAddress: string;
	private cakeOracleAddress: string;

	constructor(
		rpcUrl: string,
		chainId: number,
		privateKey?: string,
	) {
		this.provider = new ethers.JsonRpcProvider(rpcUrl);

		if (privateKey) {
			this.wallet = new ethers.Wallet(privateKey, this.provider);
		}

		const contracts = getContractsByChainId(chainId);
		this.predictionBNBAddress = contracts.predictionBnb || '';
		this.predictionCAKEAddress = contracts.predictionCake || '';
		this.bnbOracleAddress = contracts.chainlinkBnbUsd || '';
		this.cakeOracleAddress = contracts.chainlinkCakeUsd || '';
	}

	/**
	 * Get prediction contract based on market
	 */
	private getPredictionAddress(market: 'bnb' | 'cake'): string {
		return market === 'bnb' ? this.predictionBNBAddress : this.predictionCAKEAddress;
	}

	/**
	 * Get current epoch
	 */
	async getCurrentEpoch(market: 'bnb' | 'cake' = 'bnb'): Promise<bigint> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.currentEpoch();
	}

	/**
	 * Get round info by epoch
	 */
	async getRound(epoch: bigint, market: 'bnb' | 'cake' = 'bnb'): Promise<PredictionRound> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		const round = await prediction.rounds(epoch);

		return {
			epoch: round.epoch,
			startTimestamp: round.startTimestamp,
			lockTimestamp: round.lockTimestamp,
			closeTimestamp: round.closeTimestamp,
			lockPrice: round.lockPrice,
			closePrice: round.closePrice,
			lockOracleId: round.lockOracleId,
			closeOracleId: round.closeOracleId,
			totalAmount: round.totalAmount,
			bullAmount: round.bullAmount,
			bearAmount: round.bearAmount,
			rewardBaseCalAmount: round.rewardBaseCalAmount,
			rewardAmount: round.rewardAmount,
			oracleCalled: round.oracleCalled,
		};
	}

	/**
	 * Get current round
	 */
	async getCurrentRound(market: 'bnb' | 'cake' = 'bnb'): Promise<PredictionRound> {
		const epoch = await this.getCurrentEpoch(market);
		return await this.getRound(epoch, market);
	}

	/**
	 * Get user bet for specific round
	 */
	async getUserBet(epoch: bigint, userAddress: string, market: 'bnb' | 'cake' = 'bnb'): Promise<UserBet | null> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		const ledger = await prediction.ledger(epoch, userAddress);

		if (ledger.amount === 0n) {
			return null;
		}

		return {
			position: ledger.position === 0 ? 'Bull' : 'Bear',
			amount: ledger.amount,
			claimed: ledger.claimed,
		};
	}

	/**
	 * Get user rounds history
	 */
	async getUserRounds(
		userAddress: string,
		cursor: number = 0,
		size: number = 100,
		market: 'bnb' | 'cake' = 'bnb',
	): Promise<{
		epochs: bigint[];
		bets: UserBet[];
		nextCursor: bigint;
	}> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		const [epochs, betsRaw, nextCursor] = await prediction.userRounds(userAddress, cursor, size);

		const bets: UserBet[] = betsRaw.map((bet: any) => ({
			position: bet.position === 0 ? 'Bull' : 'Bear',
			amount: bet.amount,
			claimed: bet.claimed,
		}));

		return {
			epochs,
			bets,
			nextCursor,
		};
	}

	/**
	 * Check if round is claimable for user
	 */
	async isClaimable(epoch: bigint, userAddress: string, market: 'bnb' | 'cake' = 'bnb'): Promise<boolean> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.claimable(epoch, userAddress);
	}

	/**
	 * Check if round is refundable for user
	 */
	async isRefundable(epoch: bigint, userAddress: string, market: 'bnb' | 'cake' = 'bnb'): Promise<boolean> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.refundable(epoch, userAddress);
	}

	/**
	 * Enter Bull position
	 */
	async betBull(epoch: bigint, amount: bigint, market: 'bnb' | 'cake' = 'bnb'): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.wallet);
		return await prediction.betBull(epoch, { value: amount });
	}

	/**
	 * Enter Bear position
	 */
	async betBear(epoch: bigint, amount: bigint, market: 'bnb' | 'cake' = 'bnb'): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.wallet);
		return await prediction.betBear(epoch, { value: amount });
	}

	/**
	 * Claim winnings for multiple rounds
	 */
	async claim(epochs: bigint[], market: 'bnb' | 'cake' = 'bnb'): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.wallet);
		return await prediction.claim(epochs);
	}

	/**
	 * Get minimum bet amount
	 */
	async getMinBetAmount(market: 'bnb' | 'cake' = 'bnb'): Promise<bigint> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.minBetAmount();
	}

	/**
	 * Get treasury fee (in basis points)
	 */
	async getTreasuryFee(market: 'bnb' | 'cake' = 'bnb'): Promise<bigint> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.treasuryFee();
	}

	/**
	 * Get interval between rounds (seconds)
	 */
	async getIntervalSeconds(market: 'bnb' | 'cake' = 'bnb'): Promise<bigint> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.intervalSeconds();
	}

	/**
	 * Check if prediction is paused
	 */
	async isPaused(market: 'bnb' | 'cake' = 'bnb'): Promise<boolean> {
		const address = this.getPredictionAddress(market);
		const prediction = new ethers.Contract(address, PREDICTION_ABI, this.provider);
		return await prediction.paused();
	}

	/**
	 * Get latest oracle price
	 */
	async getOraclePrice(market: 'bnb' | 'cake' = 'bnb'): Promise<{
		price: bigint;
		roundId: bigint;
		timestamp: bigint;
		decimals: number;
	}> {
		const oracleAddress = market === 'bnb' ? this.bnbOracleAddress : this.cakeOracleAddress;
		if (!oracleAddress) {
			throw new Error(`No oracle configured for ${market} market`);
		}

		const oracle = new ethers.Contract(oracleAddress, AGGREGATOR_ABI, this.provider);
		const [latestData, decimals] = await Promise.all([
			oracle.latestRoundData(),
			oracle.decimals(),
		]);

		return {
			price: latestData.answer,
			roundId: latestData.roundId,
			timestamp: latestData.updatedAt,
			decimals: Number(decimals),
		};
	}

	/**
	 * Calculate potential payout for bet
	 */
	calculatePotentialPayout(
		betAmount: bigint,
		position: 'Bull' | 'Bear',
		bullAmount: bigint,
		bearAmount: bigint,
		treasuryFeeBps: bigint = 300n, // 3%
	): {
		payout: bigint;
		multiplier: number;
	} {
		const totalAmount = bullAmount + bearAmount;
		const positionAmount = position === 'Bull' ? bullAmount : bearAmount;

		if (positionAmount === 0n || totalAmount === 0n) {
			return { payout: 0n, multiplier: 0 };
		}

		// Calculate reward after treasury fee
		const rewardAmount = totalAmount - (totalAmount * treasuryFeeBps / 10000n);
		const payout = (betAmount * rewardAmount) / positionAmount;
		const multiplier = Number(rewardAmount) / Number(positionAmount);

		return { payout, multiplier };
	}

	/**
	 * Get user statistics
	 */
	async getUserStats(
		userAddress: string,
		market: 'bnb' | 'cake' = 'bnb',
	): Promise<UserStats> {
		const { epochs, bets } = await this.getUserRounds(userAddress, 0, 1000, market);

		let totalBets = 0;
		let totalBNB = 0n;
		let netBNB = 0n;
		let wins = 0;
		let totalClaimed = 0n;

		for (let i = 0; i < epochs.length; i++) {
			const bet = bets[i];
			if (bet.amount > 0n) {
				totalBets++;
				totalBNB += bet.amount;

				// Check if won
				const round = await this.getRound(epochs[i], market);
				const won = this.didWin(bet.position, round.lockPrice, round.closePrice);
				if (won) {
					wins++;
					if (bet.claimed) {
						const { payout } = this.calculatePotentialPayout(
							bet.amount,
							bet.position,
							round.bullAmount,
							round.bearAmount,
						);
						totalClaimed += payout;
						netBNB += payout - bet.amount;
					}
				} else {
					netBNB -= bet.amount;
				}
			}
		}

		return {
			totalBets,
			totalBNB,
			netBNB,
			averageBNB: totalBets > 0 ? totalBNB / BigInt(totalBets) : 0n,
			winRate: totalBets > 0 ? (wins / totalBets) * 100 : 0,
			totalClaimed,
		};
	}

	/**
	 * Check if position won
	 */
	private didWin(position: 'Bull' | 'Bear', lockPrice: bigint, closePrice: bigint): boolean {
		if (lockPrice === closePrice) return false; // House wins on tie
		if (position === 'Bull') {
			return closePrice > lockPrice;
		} else {
			return closePrice < lockPrice;
		}
	}

	/**
	 * Get claimable rounds for user
	 */
	async getClaimableRounds(
		userAddress: string,
		market: 'bnb' | 'cake' = 'bnb',
	): Promise<bigint[]> {
		const { epochs, bets } = await this.getUserRounds(userAddress, 0, 1000, market);
		const claimable: bigint[] = [];

		for (let i = 0; i < epochs.length; i++) {
			const bet = bets[i];
			if (!bet.claimed && bet.amount > 0n) {
				const isClaimable = await this.isClaimable(epochs[i], userAddress, market);
				if (isClaimable) {
					claimable.push(epochs[i]);
				}
			}
		}

		return claimable;
	}

	/**
	 * Get round countdown
	 */
	async getRoundCountdown(market: 'bnb' | 'cake' = 'bnb'): Promise<{
		secondsUntilLock: number;
		secondsUntilClose: number;
		phase: 'betting' | 'locked' | 'calculating';
	}> {
		const round = await this.getCurrentRound(market);
		const now = BigInt(Math.floor(Date.now() / 1000));

		const secondsUntilLock = Number(round.lockTimestamp - now);
		const secondsUntilClose = Number(round.closeTimestamp - now);

		let phase: 'betting' | 'locked' | 'calculating';
		if (now < round.lockTimestamp) {
			phase = 'betting';
		} else if (now < round.closeTimestamp) {
			phase = 'locked';
		} else {
			phase = 'calculating';
		}

		return {
			secondsUntilLock: Math.max(0, secondsUntilLock),
			secondsUntilClose: Math.max(0, secondsUntilClose),
			phase,
		};
	}
}

export function createPredictionClient(
	network: string,
	privateKey?: string,
): PredictionClient {
	const networkConfig = NETWORKS[network];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}

	return new PredictionClient(
		networkConfig.rpcUrl,
		networkConfig.chainId,
		privateKey,
	);
}
