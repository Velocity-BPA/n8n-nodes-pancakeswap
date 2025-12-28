/**
 * PancakeSwap Node Unit Tests
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import {
	sqrtPriceX96ToPrice,
	priceToSqrtPriceX96,
	calculatePriceImpact,
	calculateMinimumReceived,
	calculateMaximumInput,
} from '../../nodes/PancakeSwap/utils/priceUtils';

import {
	tickToPrice,
	priceToTick,
	tickToSqrtPriceX96,
	sqrtPriceX96ToTick,
	getTickAtSqrtRatio,
	getSqrtRatioAtTick,
} from '../../nodes/PancakeSwap/utils/tickUtils';

import {
	calculateFarmAPR,
	calculateBoostMultiplier,
	calculatePendingRewards,
} from '../../nodes/PancakeSwap/utils/farmUtils';

import {
	calculateVeCakeBalance,
	roundToWeek,
	getMaxLockWeeks,
	calculateVotingPower,
} from '../../nodes/PancakeSwap/utils/cakeUtils';

import {
	encodePath,
	decodePath,
	calculateRouteGasEstimate,
} from '../../nodes/PancakeSwap/utils/routeUtils';

describe('Price Utilities', () => {
	describe('sqrtPriceX96ToPrice', () => {
		it('should convert sqrtPriceX96 to price correctly', () => {
			// sqrtPriceX96 for price = 1 (with equal decimals)
			const sqrtPriceX96 = 79228162514264337593543950336n; // 2^96
			const price = sqrtPriceX96ToPrice(sqrtPriceX96, 18, 18);
			expect(price).toBeCloseTo(1, 5);
		});

		it('should handle different decimals', () => {
			const sqrtPriceX96 = 79228162514264337593543950336n;
			const price = sqrtPriceX96ToPrice(sqrtPriceX96, 18, 6);
			expect(price).toBeGreaterThan(0);
		});
	});

	describe('priceToSqrtPriceX96', () => {
		it('should convert price to sqrtPriceX96', () => {
			const sqrtPriceX96 = priceToSqrtPriceX96(1, 18, 18);
			expect(sqrtPriceX96).toBeDefined();
			expect(sqrtPriceX96).toBeGreaterThan(0n);
		});
	});

	describe('calculatePriceImpact', () => {
		it('should calculate price impact correctly', () => {
			const impact = calculatePriceImpact(
				1000000000000000000n, // 1 token
				990000000000000000n,  // 0.99 tokens (1% impact)
				1,
				1,
			);
			expect(impact).toBeCloseTo(1, 1);
		});

		it('should return 0 for equal values', () => {
			const impact = calculatePriceImpact(
				1000000000000000000n,
				1000000000000000000n,
				1,
				1,
			);
			expect(impact).toBe(0);
		});
	});

	describe('calculateMinimumReceived', () => {
		it('should apply slippage correctly', () => {
			const amount = 1000000000000000000n; // 1 token
			const minimum = calculateMinimumReceived(amount, 0.5); // 0.5% slippage
			expect(minimum).toBeLessThan(amount);
			expect(minimum).toBe(995000000000000000n);
		});
	});

	describe('calculateMaximumInput', () => {
		it('should apply slippage correctly', () => {
			const amount = 1000000000000000000n;
			const maximum = calculateMaximumInput(amount, 0.5);
			expect(maximum).toBeGreaterThan(amount);
			expect(maximum).toBe(1005000000000000000n);
		});
	});
});

describe('Tick Utilities', () => {
	describe('tickToPrice', () => {
		it('should convert tick 0 to price 1', () => {
			const price = tickToPrice(0);
			expect(price).toBeCloseTo(1, 10);
		});

		it('should handle positive ticks', () => {
			const price = tickToPrice(100);
			expect(price).toBeGreaterThan(1);
		});

		it('should handle negative ticks', () => {
			const price = tickToPrice(-100);
			expect(price).toBeLessThan(1);
		});
	});

	describe('priceToTick', () => {
		it('should convert price 1 to tick 0', () => {
			const tick = priceToTick(1);
			expect(tick).toBe(0);
		});

		it('should be inverse of tickToPrice', () => {
			const originalTick = 1000;
			const price = tickToPrice(originalTick);
			const recoveredTick = priceToTick(price);
			expect(recoveredTick).toBe(originalTick);
		});
	});

	describe('tickToSqrtPriceX96', () => {
		it('should convert tick to sqrtPriceX96', () => {
			const sqrtPriceX96 = tickToSqrtPriceX96(0);
			expect(sqrtPriceX96).toBeDefined();
			expect(sqrtPriceX96).toBeGreaterThan(0n);
		});
	});
});

describe('Farm Utilities', () => {
	describe('calculateFarmAPR', () => {
		it('should calculate APR correctly', () => {
			const apr = calculateFarmAPR(
				1000000n,          // allocPoint
				10000000n,         // totalAllocPoint
				1000000000000000000n, // cakePerBlock
				2,                 // cakePrice
				1000000,           // totalStakedUSD
			);
			expect(apr).toBeGreaterThan(0);
		});

		it('should return 0 for zero staked', () => {
			const apr = calculateFarmAPR(
				1000000n,
				10000000n,
				1000000000000000000n,
				2,
				0,
			);
			expect(apr).toBe(0);
		});
	});

	describe('calculateBoostMultiplier', () => {
		it('should return 1x for no veCAKE', () => {
			const boost = calculateBoostMultiplier(0n, 1000n, 10000n, 100000n);
			expect(boost).toBe(1);
		});

		it('should not exceed 2.5x', () => {
			const boost = calculateBoostMultiplier(
				1000000000000000000000n, // 1000 veCAKE
				1000n,
				10000n,
				100000n,
			);
			expect(boost).toBeLessThanOrEqual(2.5);
		});
	});

	describe('calculatePendingRewards', () => {
		it('should calculate pending rewards', () => {
			const rewards = calculatePendingRewards(
				1000000000000000000n, // userAmount
				100n,                  // lastRewardBlock
				200n,                  // currentBlock
				1000000000000000000n,  // rewardPerBlock
				10000000000000000000n, // totalStaked
			);
			expect(rewards).toBeGreaterThan(0n);
		});
	});
});

describe('CAKE Utilities', () => {
	describe('calculateVeCakeBalance', () => {
		it('should calculate veCAKE balance with decay', () => {
			const now = Math.floor(Date.now() / 1000);
			const lockEnd = now + (52 * 7 * 24 * 60 * 60); // 1 year from now
			const balance = calculateVeCakeBalance(
				1000000000000000000n, // 1 CAKE
				BigInt(lockEnd),
			);
			expect(balance).toBeGreaterThan(0n);
			expect(balance).toBeLessThanOrEqual(1000000000000000000n);
		});

		it('should return 0 for expired lock', () => {
			const balance = calculateVeCakeBalance(
				1000000000000000000n,
				BigInt(Math.floor(Date.now() / 1000) - 1000),
			);
			expect(balance).toBe(0n);
		});
	});

	describe('roundToWeek', () => {
		it('should round to Thursday 00:00 UTC', () => {
			const timestamp = 1700000000; // Some timestamp
			const rounded = roundToWeek(timestamp);
			expect(rounded % (7 * 24 * 60 * 60)).toBe(0);
		});
	});

	describe('getMaxLockWeeks', () => {
		it('should return 208 weeks max', () => {
			expect(getMaxLockWeeks()).toBe(208);
		});
	});
});

describe('Route Utilities', () => {
	describe('encodePath', () => {
		it('should encode path correctly', () => {
			const path = [
				'0x0000000000000000000000000000000000000001',
				'0x0000000000000000000000000000000000000002',
			];
			const fees = [500];
			const encoded = encodePath(path, fees);
			expect(encoded).toBeDefined();
			expect(encoded.startsWith('0x')).toBe(true);
		});

		it('should throw for mismatched lengths', () => {
			const path = ['0x1', '0x2', '0x3'];
			const fees = [500]; // Should be 2 fees
			expect(() => encodePath(path, fees)).toThrow();
		});
	});

	describe('decodePath', () => {
		it('should decode path correctly', () => {
			const path = [
				'0x0000000000000000000000000000000000000001',
				'0x0000000000000000000000000000000000000002',
			];
			const fees = [500];
			const encoded = encodePath(path, fees);
			const decoded = decodePath(encoded);
			expect(decoded.path.length).toBe(2);
			expect(decoded.fees.length).toBe(1);
			expect(decoded.fees[0]).toBe(500);
		});
	});

	describe('calculateRouteGasEstimate', () => {
		it('should estimate gas for single hop', () => {
			const gas = calculateRouteGasEstimate(1, 'v3');
			expect(gas).toBeGreaterThan(0n);
		});

		it('should increase gas for multi-hop', () => {
			const singleHop = calculateRouteGasEstimate(1, 'v3');
			const multiHop = calculateRouteGasEstimate(3, 'v3');
			expect(multiHop).toBeGreaterThan(singleHop);
		});
	});
});
