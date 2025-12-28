/**
 * PancakeSwap MasterChef Client
 * Handles V2/V3 farming operations and boost calculations
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { ethers } from 'ethers';
import { getContractsByChainId, NETWORKS } from '../constants';

export interface FarmInfo {
	pid: number;
	lpToken: string;
	allocPoint: bigint;
	lastRewardBlock: bigint;
	accCakePerShare: bigint;
	isV3: boolean;
	totalLiquidity: bigint;
	totalBoostedShare: bigint;
}

export interface UserFarmInfo {
	amount: bigint;
	rewardDebt: bigint;
	boostMultiplier: bigint;
	pendingCake: bigint;
}

export interface BoostInfo {
	multiplier: number;
	veCakeBalance: bigint;
	userLpBalance: bigint;
	totalLpSupply: bigint;
	maxBoost: number;
}

// MasterChef V2 ABI
const MASTERCHEF_V2_ABI = [
	'function poolLength() external view returns (uint256)',
	'function poolInfo(uint256 pid) external view returns (uint256 accCakePerShare, uint256 lastRewardBlock, uint256 allocPoint, uint256 totalBoostedShare, bool isRegular)',
	'function lpToken(uint256 pid) external view returns (address)',
	'function userInfo(uint256 pid, address user) external view returns (uint256 amount, uint256 rewardDebt, uint256 boostMultiplier)',
	'function pendingCake(uint256 pid, address user) external view returns (uint256)',
	'function deposit(uint256 pid, uint256 amount) external',
	'function withdraw(uint256 pid, uint256 amount) external',
	'function emergencyWithdraw(uint256 pid) external',
	'function harvestFromMasterChef() external',
	'function totalAllocPoint() external view returns (uint256)',
	'function cakePerBlock() external view returns (uint256)',
	'function CAKE() external view returns (address)',
	'function getBoostMultiplier(address user, uint256 pid) external view returns (uint256)',
	'function updateBoostMultiplier(address user, uint256 pid, uint256 newMultiplier) external',
];

// MasterChef V3 ABI
const MASTERCHEF_V3_ABI = [
	'function poolLength() external view returns (uint256)',
	'function poolInfo(uint256 pid) external view returns (uint256 allocPoint, address v3Pool, address token0, address token1, uint24 fee, uint256 totalLiquidity, uint256 totalBoostLiquidity)',
	'function userPositionInfos(uint256 tokenId) external view returns (uint128 liquidity, uint128 boostLiquidity, int24 tickLower, int24 tickUpper, uint256 rewardGrowthInside, uint256 reward, address user, uint256 pid, uint256 boostMultiplier)',
	'function pendingCake(uint256 tokenId) external view returns (uint256)',
	'function harvest(uint256 tokenId, address to) external returns (uint256 reward)',
	'function withdraw(uint256 tokenId, address to) external returns (uint256 reward)',
	'function increaseLiquidity(tuple(uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1)',
	'function decreaseLiquidity(tuple(uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external returns (uint256 amount0, uint256 amount1)',
	'function collect(tuple(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external returns (uint256 amount0, uint256 amount1)',
	'function updateLiquidity(uint256 tokenId) external',
	'function CAKE() external view returns (address)',
	'function latestPeriodCakePerSecond() external view returns (uint256)',
];

// veCAKE ABI for boost calculations
const VECAKE_ABI = [
	'function balanceOf(address account) external view returns (uint256)',
	'function totalSupply() external view returns (uint256)',
	'function userPointEpoch(address addr) external view returns (uint256)',
	'function userPointHistory(address addr, uint256 epoch) external view returns (int128 bias, int128 slope, uint256 ts, uint256 blk)',
	'function locked(address addr) external view returns (int128 amount, uint256 end)',
];

export class MasterChefClient {
	private provider: ethers.JsonRpcProvider;
	private wallet: ethers.Wallet | null = null;
	private masterChefV2Address: string;
	private masterChefV3Address: string;
	private veCakeAddress: string;

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
		this.masterChefV2Address = contracts.masterChefV2 || '';
		this.masterChefV3Address = contracts.masterChefV3 || '';
		this.veCakeAddress = contracts.veCake || '';
	}

	// ==================== V2 Farm Operations ====================

	/**
	 * Get total number of V2 farms
	 */
	async getV2PoolLength(): Promise<number> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);
		return Number(await masterChef.poolLength());
	}

	/**
	 * Get V2 farm info by pool ID
	 */
	async getV2PoolInfo(pid: number): Promise<FarmInfo> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);

		const [poolInfo, lpToken] = await Promise.all([
			masterChef.poolInfo(pid),
			masterChef.lpToken(pid),
		]);

		return {
			pid,
			lpToken,
			allocPoint: poolInfo.allocPoint,
			lastRewardBlock: poolInfo.lastRewardBlock,
			accCakePerShare: poolInfo.accCakePerShare,
			isV3: false,
			totalLiquidity: 0n, // V2 doesn't have this directly
			totalBoostedShare: poolInfo.totalBoostedShare,
		};
	}

	/**
	 * Get user info for V2 farm
	 */
	async getV2UserInfo(pid: number, userAddress: string): Promise<UserFarmInfo> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);

		const [userInfo, pendingCake] = await Promise.all([
			masterChef.userInfo(pid, userAddress),
			masterChef.pendingCake(pid, userAddress),
		]);

		return {
			amount: userInfo.amount,
			rewardDebt: userInfo.rewardDebt,
			boostMultiplier: userInfo.boostMultiplier,
			pendingCake,
		};
	}

	/**
	 * Get pending CAKE rewards for V2 farm
	 */
	async getV2PendingCake(pid: number, userAddress: string): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);
		return await masterChef.pendingCake(pid, userAddress);
	}

	/**
	 * Deposit LP tokens to V2 farm
	 */
	async depositV2(pid: number, amount: bigint): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.wallet);
		return await masterChef.deposit(pid, amount);
	}

	/**
	 * Withdraw LP tokens from V2 farm
	 */
	async withdrawV2(pid: number, amount: bigint): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.wallet);
		return await masterChef.withdraw(pid, amount);
	}

	/**
	 * Emergency withdraw from V2 farm (forfeits rewards)
	 */
	async emergencyWithdrawV2(pid: number): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.wallet);
		return await masterChef.emergencyWithdraw(pid);
	}

	/**
	 * Get V2 boost multiplier for user
	 */
	async getV2BoostMultiplier(userAddress: string, pid: number): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);
		return await masterChef.getBoostMultiplier(userAddress, pid);
	}

	/**
	 * Get CAKE per block for V2
	 */
	async getV2CakePerBlock(): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);
		return await masterChef.cakePerBlock();
	}

	/**
	 * Get total allocation points for V2
	 */
	async getV2TotalAllocPoint(): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);
		return await masterChef.totalAllocPoint();
	}

	// ==================== V3 Farm Operations ====================

	/**
	 * Get total number of V3 farms
	 */
	async getV3PoolLength(): Promise<number> {
		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.provider);
		return Number(await masterChef.poolLength());
	}

	/**
	 * Get V3 farm info by pool ID
	 */
	async getV3PoolInfo(pid: number): Promise<{
		allocPoint: bigint;
		v3Pool: string;
		token0: string;
		token1: string;
		fee: number;
		totalLiquidity: bigint;
		totalBoostLiquidity: bigint;
	}> {
		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.provider);
		const info = await masterChef.poolInfo(pid);

		return {
			allocPoint: info.allocPoint,
			v3Pool: info.v3Pool,
			token0: info.token0,
			token1: info.token1,
			fee: Number(info.fee),
			totalLiquidity: info.totalLiquidity,
			totalBoostLiquidity: info.totalBoostLiquidity,
		};
	}

	/**
	 * Get user position info for V3 farm
	 */
	async getV3PositionInfo(tokenId: bigint): Promise<{
		liquidity: bigint;
		boostLiquidity: bigint;
		tickLower: number;
		tickUpper: number;
		rewardGrowthInside: bigint;
		reward: bigint;
		user: string;
		pid: bigint;
		boostMultiplier: bigint;
	}> {
		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.provider);
		const info = await masterChef.userPositionInfos(tokenId);

		return {
			liquidity: info.liquidity,
			boostLiquidity: info.boostLiquidity,
			tickLower: Number(info.tickLower),
			tickUpper: Number(info.tickUpper),
			rewardGrowthInside: info.rewardGrowthInside,
			reward: info.reward,
			user: info.user,
			pid: info.pid,
			boostMultiplier: info.boostMultiplier,
		};
	}

	/**
	 * Get pending CAKE rewards for V3 position
	 */
	async getV3PendingCake(tokenId: bigint): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.provider);
		return await masterChef.pendingCake(tokenId);
	}

	/**
	 * Harvest CAKE from V3 position
	 */
	async harvestV3(tokenId: bigint, recipient?: string): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.wallet);
		const to = recipient || await this.wallet.getAddress();
		return await masterChef.harvest(tokenId, to);
	}

	/**
	 * Withdraw V3 position from farm
	 */
	async withdrawV3(tokenId: bigint, recipient?: string): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required');
		}

		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.wallet);
		const to = recipient || await this.wallet.getAddress();
		return await masterChef.withdraw(tokenId, to);
	}

	/**
	 * Get CAKE per second for V3
	 */
	async getV3CakePerSecond(): Promise<bigint> {
		const masterChef = new ethers.Contract(this.masterChefV3Address, MASTERCHEF_V3_ABI, this.provider);
		return await masterChef.latestPeriodCakePerSecond();
	}

	// ==================== Boost Calculations ====================

	/**
	 * Calculate boost info for user
	 */
	async calculateBoostInfo(userAddress: string, pid: number): Promise<BoostInfo> {
		const veCake = new ethers.Contract(this.veCakeAddress, VECAKE_ABI, this.provider);
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);

		const [veCakeBalance, userInfo, poolInfo] = await Promise.all([
			veCake.balanceOf(userAddress),
			masterChef.userInfo(pid, userAddress),
			masterChef.poolInfo(pid),
		]);

		// Calculate boost multiplier
		// Formula: boost = min(userLp + (totalLp * userVeCake / totalVeCake) * 0.4, 2.5 * userLp) / userLp
		const userLpBalance = userInfo.amount;
		const totalBoostedShare = poolInfo.totalBoostedShare;

		// Simplified boost calculation
		const boost = this.calculateBoostMultiplier(
			veCakeBalance,
			userLpBalance,
			totalBoostedShare,
		);

		return {
			multiplier: boost,
			veCakeBalance,
			userLpBalance,
			totalLpSupply: totalBoostedShare,
			maxBoost: 2.5,
		};
	}

	/**
	 * Calculate boost multiplier
	 * Based on PancakeSwap boost formula
	 */
	private calculateBoostMultiplier(
		veCakeBalance: bigint,
		userLpBalance: bigint,
		totalLpSupply: bigint,
	): number {
		if (userLpBalance === 0n) return 1.0;
		if (veCakeBalance === 0n) return 1.0;

		// Simplified formula: boost = 1 + (veCake / totalVeCake) * 1.5
		// Max boost is 2.5x
		const baseBoost = 1.0;
		const maxBoost = 2.5;
		
		// This is a simplified calculation
		// Actual formula depends on pool-specific parameters
		const veCakeRatio = Number(veCakeBalance) / 1e18;
		const lpRatio = Number(userLpBalance) / Number(totalLpSupply || 1n);
		
		const calculatedBoost = baseBoost + Math.min(veCakeRatio * lpRatio * 1.5, 1.5);
		
		return Math.min(calculatedBoost, maxBoost);
	}

	/**
	 * Calculate APR for farm
	 */
	async calculateFarmAPR(
		pid: number,
		cakePriceUSD: number,
		lpPriceUSD: number,
	): Promise<{
		baseAPR: number;
		boostedAPR: number;
		maxBoostedAPR: number;
	}> {
		const masterChef = new ethers.Contract(this.masterChefV2Address, MASTERCHEF_V2_ABI, this.provider);

		const [poolInfo, totalAllocPoint, cakePerBlock] = await Promise.all([
			masterChef.poolInfo(pid),
			masterChef.totalAllocPoint(),
			masterChef.cakePerBlock(),
		]);

		const allocPoint = poolInfo.allocPoint;
		const totalBoostedShare = poolInfo.totalBoostedShare;

		// Calculate base APR
		// APR = (cakePerBlock * blocksPerYear * allocPoint / totalAllocPoint * cakePrice) / (totalStaked * lpPrice)
		const blocksPerYear = 10512000n; // ~3 seconds per block on BSC
		const yearlyRewards = cakePerBlock * blocksPerYear * allocPoint / totalAllocPoint;
		const yearlyRewardsUSD = Number(yearlyRewards) / 1e18 * cakePriceUSD;
		const totalStakedUSD = Number(totalBoostedShare) / 1e18 * lpPriceUSD;

		const baseAPR = totalStakedUSD > 0 ? (yearlyRewardsUSD / totalStakedUSD) * 100 : 0;
		const boostedAPR = baseAPR * 1.5; // Average boost
		const maxBoostedAPR = baseAPR * 2.5; // Max 2.5x boost

		return {
			baseAPR,
			boostedAPR,
			maxBoostedAPR,
		};
	}

	/**
	 * Get all farms with non-zero allocation
	 */
	async getActiveFarms(): Promise<FarmInfo[]> {
		const poolLength = await this.getV2PoolLength();
		const farms: FarmInfo[] = [];

		for (let pid = 0; pid < poolLength; pid++) {
			try {
				const farmInfo = await this.getV2PoolInfo(pid);
				if (farmInfo.allocPoint > 0n) {
					farms.push(farmInfo);
				}
			} catch {
				continue;
			}
		}

		return farms;
	}

	// ==================== veCAKE Operations ====================

	/**
	 * Get veCAKE balance
	 */
	async getVeCakeBalance(userAddress: string): Promise<bigint> {
		const veCake = new ethers.Contract(this.veCakeAddress, VECAKE_ABI, this.provider);
		return await veCake.balanceOf(userAddress);
	}

	/**
	 * Get veCAKE lock info
	 */
	async getVeCakeLockInfo(userAddress: string): Promise<{
		amount: bigint;
		end: bigint;
	}> {
		const veCake = new ethers.Contract(this.veCakeAddress, VECAKE_ABI, this.provider);
		const locked = await veCake.locked(userAddress);

		return {
			amount: locked.amount,
			end: locked.end,
		};
	}

	/**
	 * Get total veCAKE supply
	 */
	async getVeCakeTotalSupply(): Promise<bigint> {
		const veCake = new ethers.Contract(this.veCakeAddress, VECAKE_ABI, this.provider);
		return await veCake.totalSupply();
	}
}

export function createMasterChefClient(
	network: string,
	privateKey?: string,
): MasterChefClient {
	const networkConfig = NETWORKS[network];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}

	return new MasterChefClient(
		networkConfig.rpcUrl,
		networkConfig.chainId,
		privateKey,
	);
}
