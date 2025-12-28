/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import BigNumber from 'bignumber.js';

/**
 * Tick math utilities for PancakeSwap V3
 * 
 * In V3, prices are represented as "ticks" which are the logarithm
 * base 1.0001 of the price. This allows for efficient storage and
 * computation of concentrated liquidity positions.
 */

// Configure BigNumber
BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  DECIMAL_PLACES: 40,
});

/**
 * Minimum and maximum tick values
 */
export const MIN_TICK = -887272;
export const MAX_TICK = 887272;

/**
 * Q96 constant (2^96)
 */
export const Q96 = new BigNumber(2).pow(96);

/**
 * Q128 constant (2^128)
 */
export const Q128 = new BigNumber(2).pow(128);

/**
 * Calculate sqrtPriceX96 from tick
 * sqrtRatioX96 = sqrt(1.0001^tick) * 2^96
 */
export function tickToSqrtPriceX96(tick: number): bigint {
  const absTickBN = new BigNumber(Math.abs(tick));
  
  // Calculate 1.0001^tick using logarithms for precision
  const base = new BigNumber('1.0001');
  const ratio = base.pow(absTickBN.toNumber());
  const sqrtRatio = ratio.sqrt();
  
  let sqrtPriceX96 = sqrtRatio.multipliedBy(Q96);
  
  if (tick < 0) {
    // For negative ticks, we need to invert
    sqrtPriceX96 = Q96.multipliedBy(Q96).dividedBy(sqrtPriceX96);
  }
  
  return BigInt(sqrtPriceX96.integerValue(BigNumber.ROUND_DOWN).toString());
}

/**
 * Calculate tick from sqrtPriceX96
 * tick = floor(log_1.0001(sqrtPriceX96 / 2^96)^2)
 */
export function sqrtPriceX96ToTick(sqrtPriceX96: bigint | string): number {
  const sqrtPrice = new BigNumber(sqrtPriceX96.toString()).dividedBy(Q96);
  const price = sqrtPrice.pow(2);
  
  // tick = log_1.0001(price) = ln(price) / ln(1.0001)
  const logBase = Math.log(1.0001);
  const tick = Math.floor(Math.log(price.toNumber()) / logBase);
  
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick));
}

/**
 * Calculate price from tick
 * price = 1.0001^tick
 */
export function tickToPrice(
  tick: number,
  token0Decimals: number,
  token1Decimals: number,
): BigNumber {
  const base = new BigNumber('1.0001');
  const price = base.pow(tick);
  
  // Adjust for decimal difference
  const decimalAdjustment = new BigNumber(10).pow(token0Decimals - token1Decimals);
  
  return price.multipliedBy(decimalAdjustment);
}

/**
 * Calculate tick from price
 * tick = floor(log_1.0001(price))
 */
export function priceToTick(
  price: number | string,
  token0Decimals: number,
  token1Decimals: number,
): number {
  const priceBN = new BigNumber(price);
  
  // Adjust for decimal difference
  const decimalAdjustment = new BigNumber(10).pow(token1Decimals - token0Decimals);
  const adjustedPrice = priceBN.multipliedBy(decimalAdjustment);
  
  // tick = log_1.0001(price)
  const logBase = Math.log(1.0001);
  const tick = Math.floor(Math.log(adjustedPrice.toNumber()) / logBase);
  
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick));
}

/**
 * Round tick down to nearest tick spacing
 */
export function nearestUsableTick(tick: number, tickSpacing: number): number {
  const rounded = Math.round(tick / tickSpacing) * tickSpacing;
  
  if (rounded < MIN_TICK) return MIN_TICK + tickSpacing;
  if (rounded > MAX_TICK) return MAX_TICK - tickSpacing;
  
  return rounded;
}

/**
 * Get tick at sqrt price for token0 price of 1
 * (useful for determining position boundaries)
 */
export function getTickAtSqrtRatio(sqrtRatioX96: bigint): number {
  return sqrtPriceX96ToTick(sqrtRatioX96);
}

/**
 * Calculate liquidity from token amounts and price range
 * Used when adding liquidity to a V3 position
 */
export function getLiquidityForAmounts(
  sqrtPriceX96: bigint,
  sqrtPriceAX96: bigint,
  sqrtPriceBX96: bigint,
  amount0: bigint,
  amount1: bigint,
): bigint {
  const sqrtPrice = new BigNumber(sqrtPriceX96.toString());
  const sqrtPriceA = new BigNumber(sqrtPriceAX96.toString());
  const sqrtPriceB = new BigNumber(sqrtPriceBX96.toString());
  const amt0 = new BigNumber(amount0.toString());
  const amt1 = new BigNumber(amount1.toString());
  
  // Ensure sqrtPriceA < sqrtPriceB
  const lower = BigNumber.min(sqrtPriceA, sqrtPriceB);
  const upper = BigNumber.max(sqrtPriceA, sqrtPriceB);
  
  let liquidity: BigNumber;
  
  if (sqrtPrice.isLessThanOrEqualTo(lower)) {
    // Current price below range - all token0
    liquidity = amt0.multipliedBy(lower).multipliedBy(upper).dividedBy(
      Q96.multipliedBy(upper.minus(lower))
    );
  } else if (sqrtPrice.isGreaterThanOrEqualTo(upper)) {
    // Current price above range - all token1
    liquidity = amt1.multipliedBy(Q96).dividedBy(upper.minus(lower));
  } else {
    // Current price in range
    const liquidity0 = amt0.multipliedBy(sqrtPrice).multipliedBy(upper).dividedBy(
      Q96.multipliedBy(upper.minus(sqrtPrice))
    );
    const liquidity1 = amt1.multipliedBy(Q96).dividedBy(sqrtPrice.minus(lower));
    liquidity = BigNumber.min(liquidity0, liquidity1);
  }
  
  return BigInt(liquidity.integerValue(BigNumber.ROUND_DOWN).toString());
}

/**
 * Calculate token amounts from liquidity and price range
 * Used when removing liquidity from a V3 position
 */
export function getAmountsForLiquidity(
  sqrtPriceX96: bigint,
  sqrtPriceAX96: bigint,
  sqrtPriceBX96: bigint,
  liquidity: bigint,
): { amount0: bigint; amount1: bigint } {
  const sqrtPrice = new BigNumber(sqrtPriceX96.toString());
  const sqrtPriceA = new BigNumber(sqrtPriceAX96.toString());
  const sqrtPriceB = new BigNumber(sqrtPriceBX96.toString());
  const liq = new BigNumber(liquidity.toString());
  
  const lower = BigNumber.min(sqrtPriceA, sqrtPriceB);
  const upper = BigNumber.max(sqrtPriceA, sqrtPriceB);
  
  let amount0 = new BigNumber(0);
  let amount1 = new BigNumber(0);
  
  if (sqrtPrice.isLessThanOrEqualTo(lower)) {
    // Current price below range
    amount0 = liq.multipliedBy(Q96).multipliedBy(upper.minus(lower)).dividedBy(
      lower.multipliedBy(upper)
    );
  } else if (sqrtPrice.isGreaterThanOrEqualTo(upper)) {
    // Current price above range
    amount1 = liq.multipliedBy(upper.minus(lower)).dividedBy(Q96);
  } else {
    // Current price in range
    amount0 = liq.multipliedBy(Q96).multipliedBy(upper.minus(sqrtPrice)).dividedBy(
      sqrtPrice.multipliedBy(upper)
    );
    amount1 = liq.multipliedBy(sqrtPrice.minus(lower)).dividedBy(Q96);
  }
  
  return {
    amount0: BigInt(amount0.integerValue(BigNumber.ROUND_DOWN).toString()),
    amount1: BigInt(amount1.integerValue(BigNumber.ROUND_DOWN).toString()),
  };
}

/**
 * Check if a tick is within a valid range
 */
export function isValidTick(tick: number): boolean {
  return tick >= MIN_TICK && tick <= MAX_TICK;
}

/**
 * Check if a tick is initialized (at a tick spacing boundary)
 */
export function isTickInitializable(tick: number, tickSpacing: number): boolean {
  return tick % tickSpacing === 0;
}

/**
 * Calculate the tick spacing for a fee tier
 */
export function feeToTickSpacing(fee: number): number {
  const feeToSpacing: Record<number, number> = {
    100: 1,
    500: 10,
    2500: 50,
    10000: 200,
  };
  
  return feeToSpacing[fee] || 60; // Default to 60 if unknown
}
