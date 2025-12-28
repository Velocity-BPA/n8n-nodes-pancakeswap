/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import BigNumber from 'bignumber.js';

/**
 * Price calculation utilities for PancakeSwap
 */

// Configure BigNumber for precision
BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

/**
 * Calculate price from sqrtPriceX96 (V3 pools)
 * sqrtPriceX96 = sqrt(price) * 2^96
 */
export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint | string,
  token0Decimals: number,
  token1Decimals: number,
): BigNumber {
  const sqrtPrice = new BigNumber(sqrtPriceX96.toString());
  const Q96 = new BigNumber(2).pow(96);
  
  // price = (sqrtPriceX96 / 2^96)^2
  const price = sqrtPrice.dividedBy(Q96).pow(2);
  
  // Adjust for decimal difference
  const decimalAdjustment = new BigNumber(10).pow(token0Decimals - token1Decimals);
  
  return price.multipliedBy(decimalAdjustment);
}

/**
 * Calculate sqrtPriceX96 from price
 */
export function priceToSqrtPriceX96(
  price: number | string,
  token0Decimals: number,
  token1Decimals: number,
): bigint {
  const priceNum = new BigNumber(price);
  const Q96 = new BigNumber(2).pow(96);
  
  // Adjust for decimal difference
  const decimalAdjustment = new BigNumber(10).pow(token1Decimals - token0Decimals);
  const adjustedPrice = priceNum.multipliedBy(decimalAdjustment);
  
  // sqrtPriceX96 = sqrt(price) * 2^96
  const sqrtPrice = adjustedPrice.sqrt().multipliedBy(Q96);
  
  return BigInt(sqrtPrice.integerValue(BigNumber.ROUND_DOWN).toString());
}

/**
 * Calculate token amounts from V2 reserves
 */
export function getAmountOut(
  amountIn: bigint | string,
  reserveIn: bigint | string,
  reserveOut: bigint | string,
  fee: number = 25, // 0.25% fee for V2
): BigNumber {
  const amountInBN = new BigNumber(amountIn.toString());
  const reserveInBN = new BigNumber(reserveIn.toString());
  const reserveOutBN = new BigNumber(reserveOut.toString());
  
  const amountInWithFee = amountInBN.multipliedBy(10000 - fee);
  const numerator = amountInWithFee.multipliedBy(reserveOutBN);
  const denominator = reserveInBN.multipliedBy(10000).plus(amountInWithFee);
  
  return numerator.dividedBy(denominator);
}

/**
 * Calculate token amount needed for exact output (V2)
 */
export function getAmountIn(
  amountOut: bigint | string,
  reserveIn: bigint | string,
  reserveOut: bigint | string,
  fee: number = 25,
): BigNumber {
  const amountOutBN = new BigNumber(amountOut.toString());
  const reserveInBN = new BigNumber(reserveIn.toString());
  const reserveOutBN = new BigNumber(reserveOut.toString());
  
  const numerator = reserveInBN.multipliedBy(amountOutBN).multipliedBy(10000);
  const denominator = reserveOutBN.minus(amountOutBN).multipliedBy(10000 - fee);
  
  return numerator.dividedBy(denominator).plus(1);
}

/**
 * Calculate price impact for a swap
 */
export function calculatePriceImpact(
  amountIn: bigint | string,
  amountOut: bigint | string,
  reserveIn: bigint | string,
  reserveOut: bigint | string,
): number {
  const amountInBN = new BigNumber(amountIn.toString());
  const amountOutBN = new BigNumber(amountOut.toString());
  const reserveInBN = new BigNumber(reserveIn.toString());
  const reserveOutBN = new BigNumber(reserveOut.toString());
  
  // Spot price before swap
  const spotPrice = reserveOutBN.dividedBy(reserveInBN);
  
  // Execution price
  const executionPrice = amountOutBN.dividedBy(amountInBN);
  
  // Price impact = (spotPrice - executionPrice) / spotPrice * 100
  const priceImpact = spotPrice.minus(executionPrice).dividedBy(spotPrice).multipliedBy(100);
  
  return priceImpact.toNumber();
}

/**
 * Calculate minimum received amount with slippage
 */
export function calculateMinimumReceived(
  amountOut: bigint | string,
  slippageTolerance: number, // in basis points (e.g., 50 = 0.5%)
): BigNumber {
  const amount = new BigNumber(amountOut.toString());
  const slippageMultiplier = new BigNumber(10000 - slippageTolerance).dividedBy(10000);
  
  return amount.multipliedBy(slippageMultiplier);
}

/**
 * Calculate maximum input amount with slippage
 */
export function calculateMaximumInput(
  amountIn: bigint | string,
  slippageTolerance: number,
): BigNumber {
  const amount = new BigNumber(amountIn.toString());
  const slippageMultiplier = new BigNumber(10000 + slippageTolerance).dividedBy(10000);
  
  return amount.multipliedBy(slippageMultiplier);
}

/**
 * Format price with appropriate precision
 */
export function formatPrice(
  price: number | string | BigNumber,
  decimals: number = 6,
): string {
  const priceBN = new BigNumber(price);
  
  if (priceBN.isZero()) return '0';
  if (priceBN.isLessThan(0.000001)) {
    return priceBN.toExponential(4);
  }
  if (priceBN.isLessThan(1)) {
    return priceBN.toFixed(decimals);
  }
  if (priceBN.isLessThan(10000)) {
    return priceBN.toFixed(4);
  }
  
  return priceBN.toFixed(2);
}

/**
 * Parse token amount from string with decimals
 */
export function parseTokenAmount(
  amount: string,
  decimals: number,
): bigint {
  const amountBN = new BigNumber(amount);
  const multiplier = new BigNumber(10).pow(decimals);
  
  return BigInt(amountBN.multipliedBy(multiplier).integerValue(BigNumber.ROUND_DOWN).toString());
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number,
  displayDecimals: number = 6,
): string {
  const amountBN = new BigNumber(amount.toString());
  const divisor = new BigNumber(10).pow(decimals);
  
  return amountBN.dividedBy(divisor).toFixed(displayDecimals);
}

/**
 * Calculate StableSwap price using amplification coefficient
 */
export function calculateStableSwapPrice(
  balances: bigint[],
  _A: number, // Amplification coefficient - used in full StableSwap invariant
  tokenIndex: number,
): BigNumber {
  const n = balances.length;
  // Ann (A * n) is used in full StableSwap invariant calculations
  
  let D = new BigNumber(0);
  balances.forEach((b) => {
    D = D.plus(new BigNumber(b.toString()));
  });
  
  // Simplified - actual calculation is iterative using Ann
  const targetBalance = new BigNumber(balances[tokenIndex].toString());
  
  return D.dividedBy(n).dividedBy(targetBalance);
}
