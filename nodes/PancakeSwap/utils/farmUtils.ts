/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import BigNumber from 'bignumber.js';

/**
 * Farm utility functions for PancakeSwap
 */

BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  DECIMAL_PLACES: 18,
});

/**
 * Calculate APR for a farm based on pool info
 */
export function calculateFarmApr(params: {
  cakePrice: number;
  poolWeight: number;
  tvlUsd: number;
  cakePerBlock: number;
  blocksPerYear: number;
}): number {
  const { cakePrice, poolWeight, tvlUsd, cakePerBlock, blocksPerYear } = params;
  
  if (tvlUsd === 0 || poolWeight === 0) return 0;
  
  const yearlyCakeReward = cakePerBlock * blocksPerYear * poolWeight;
  const yearlyRewardUsd = yearlyCakeReward * cakePrice;
  
  return (yearlyRewardUsd / tvlUsd) * 100;
}

/**
 * Calculate boosted APR with veCAKE
 */
export function calculateBoostedApr(params: {
  baseApr: number;
  boostMultiplier: number;
  maxBoost: number;
}): number {
  const { baseApr, boostMultiplier, maxBoost } = params;
  
  const effectiveMultiplier = Math.min(boostMultiplier, maxBoost);
  
  return baseApr * effectiveMultiplier;
}

/**
 * Calculate boost multiplier from veCAKE
 * Based on PancakeSwap's boost formula
 */
export function calculateBoostMultiplier(params: {
  userLpBalance: bigint;
  totalLpSupply: bigint;
  userVeCakeBalance: bigint;
  totalVeCakeSupply: bigint;
}): number {
  const { userLpBalance, totalLpSupply, userVeCakeBalance, totalVeCakeSupply } = params;
  
  if (userLpBalance === 0n || totalVeCakeSupply === 0n) {
    return 1;
  }
  
  const userLp = new BigNumber(userLpBalance.toString());
  const totalLp = new BigNumber(totalLpSupply.toString());
  const userVeCake = new BigNumber(userVeCakeBalance.toString());
  const totalVeCake = new BigNumber(totalVeCakeSupply.toString());
  
  // Boost formula: 1 + (0.4 * userVeCake / totalVeCake) * (totalLp / userLp)
  // Capped at 2.5x
  const boostRatio = userVeCake.dividedBy(totalVeCake);
  const lpRatio = totalLp.dividedBy(userLp);
  
  const boost = new BigNumber(1).plus(
    new BigNumber(0.4).multipliedBy(boostRatio).multipliedBy(lpRatio)
  );
  
  return Math.min(boost.toNumber(), 2.5);
}

/**
 * Calculate pending rewards
 */
export function calculatePendingRewards(params: {
  userAmount: bigint;
  accRewardPerShare: bigint;
  rewardDebt: bigint;
  precision: bigint;
}): BigNumber {
  const { userAmount, accRewardPerShare, rewardDebt, precision } = params;
  
  const userAmountBN = new BigNumber(userAmount.toString());
  const accRewardBN = new BigNumber(accRewardPerShare.toString());
  const rewardDebtBN = new BigNumber(rewardDebt.toString());
  const precisionBN = new BigNumber(precision.toString());
  
  const pending = userAmountBN
    .multipliedBy(accRewardBN)
    .dividedBy(precisionBN)
    .minus(rewardDebtBN);
  
  return pending.isGreaterThan(0) ? pending : new BigNumber(0);
}

/**
 * Calculate LP token value in USD
 */
export function calculateLpValue(params: {
  lpBalance: bigint;
  totalLpSupply: bigint;
  reserve0: bigint;
  reserve1: bigint;
  token0Price: number;
  token1Price: number;
  token0Decimals: number;
  token1Decimals: number;
}): number {
  const {
    lpBalance,
    totalLpSupply,
    reserve0,
    reserve1,
    token0Price,
    token1Price,
    token0Decimals,
    token1Decimals,
  } = params;
  
  if (totalLpSupply === 0n) return 0;
  
  const lpBalanceBN = new BigNumber(lpBalance.toString());
  const totalSupplyBN = new BigNumber(totalLpSupply.toString());
  const lpShare = lpBalanceBN.dividedBy(totalSupplyBN);
  
  const reserve0Value = new BigNumber(reserve0.toString())
    .dividedBy(new BigNumber(10).pow(token0Decimals))
    .multipliedBy(token0Price);
  
  const reserve1Value = new BigNumber(reserve1.toString())
    .dividedBy(new BigNumber(10).pow(token1Decimals))
    .multipliedBy(token1Price);
  
  const totalValue = reserve0Value.plus(reserve1Value);
  
  return lpShare.multipliedBy(totalValue).toNumber();
}

/**
 * Calculate pool share percentage
 */
export function calculatePoolShare(
  userLpBalance: bigint,
  totalLpSupply: bigint,
): number {
  if (totalLpSupply === 0n) return 0;
  
  const userBalance = new BigNumber(userLpBalance.toString());
  const totalSupply = new BigNumber(totalLpSupply.toString());
  
  return userBalance.dividedBy(totalSupply).multipliedBy(100).toNumber();
}

/**
 * Calculate estimated daily earnings
 */
export function calculateDailyEarnings(params: {
  stakedValueUsd: number;
  apr: number;
}): number {
  const { stakedValueUsd, apr } = params;
  
  return (stakedValueUsd * apr) / 100 / 365;
}

/**
 * Calculate time until next harvest is optimal
 * Based on gas costs vs reward value
 */
export function calculateOptimalHarvestTime(params: {
  pendingRewards: number;
  rewardPriceUsd: number;
  gasCostUsd: number;
  dailyRewardsUsd: number;
}): number {
  const { pendingRewards, rewardPriceUsd, gasCostUsd, dailyRewardsUsd } = params;
  
  const pendingValueUsd = pendingRewards * rewardPriceUsd;
  
  // Wait until rewards are at least 10x gas cost
  const targetRewardValue = gasCostUsd * 10;
  
  if (pendingValueUsd >= targetRewardValue) {
    return 0; // Harvest now
  }
  
  const remainingValue = targetRewardValue - pendingValueUsd;
  const daysToWait = remainingValue / dailyRewardsUsd;
  
  return daysToWait;
}

/**
 * Format multiplier string
 */
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}X`;
}

/**
 * Parse multiplier from string
 */
export function parseMultiplier(multiplierStr: string): number {
  const value = parseFloat(multiplierStr.replace('X', ''));
  return isNaN(value) ? 1 : value;
}
