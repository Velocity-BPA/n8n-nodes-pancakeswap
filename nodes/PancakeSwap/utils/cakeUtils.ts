/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import BigNumber from 'bignumber.js';

/**
 * CAKE token and veCAKE utility functions
 */

BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  DECIMAL_PLACES: 18,
});

// CAKE token decimals
export const CAKE_DECIMALS = 18;

// Maximum lock time for veCAKE (4 years in seconds)
export const MAX_LOCK_TIME = 4 * 365 * 24 * 60 * 60;

// Minimum lock time (1 week in seconds)
export const MIN_LOCK_TIME = 7 * 24 * 60 * 60;

// Week in seconds (for lock time alignment)
export const WEEK = 7 * 24 * 60 * 60;

/**
 * Calculate veCAKE balance from locked CAKE
 * veCAKE = CAKE * (remaining_lock_time / MAX_LOCK_TIME)
 */
export function calculateVeCakeBalance(
  lockedCake: bigint,
  lockEndTime: number,
  currentTime: number = Math.floor(Date.now() / 1000),
): BigNumber {
  if (lockEndTime <= currentTime) {
    return new BigNumber(0);
  }
  
  const lockedAmount = new BigNumber(lockedCake.toString());
  const remainingTime = lockEndTime - currentTime;
  const ratio = new BigNumber(remainingTime).dividedBy(MAX_LOCK_TIME);
  
  return lockedAmount.multipliedBy(ratio);
}

/**
 * Calculate how much veCAKE you'll get for a given lock
 */
export function estimateVeCake(
  cakeAmount: bigint | string,
  lockDurationSeconds: number,
): BigNumber {
  const amount = new BigNumber(cakeAmount.toString());
  const ratio = new BigNumber(lockDurationSeconds).dividedBy(MAX_LOCK_TIME);
  
  return amount.multipliedBy(ratio);
}

/**
 * Round lock end time to nearest week
 * veCAKE locks are always aligned to week boundaries
 */
export function roundToWeek(timestamp: number): number {
  return Math.floor(timestamp / WEEK) * WEEK;
}

/**
 * Calculate lock end time from duration
 */
export function calculateLockEndTime(
  durationWeeks: number,
  currentTime: number = Math.floor(Date.now() / 1000),
): number {
  const duration = durationWeeks * WEEK;
  const endTime = currentTime + duration;
  
  return roundToWeek(endTime);
}

/**
 * Calculate voting power decay
 * Voting power decreases linearly as lock time approaches
 */
export function calculateVotingPowerDecay(
  initialVeCake: bigint,
  lockEndTime: number,
  checkTime: number,
): BigNumber {
  if (checkTime >= lockEndTime) {
    return new BigNumber(0);
  }
  
  const initial = new BigNumber(initialVeCake.toString());
  const totalDuration = new BigNumber(MAX_LOCK_TIME);
  const remainingDuration = new BigNumber(lockEndTime - checkTime);
  
  return initial.multipliedBy(remainingDuration).dividedBy(totalDuration);
}

/**
 * Calculate gauge vote weight
 * Used for directing CAKE emissions to pools
 */
export function calculateGaugeVoteWeight(
  userVeCake: bigint,
  totalVeCake: bigint,
  votePercentage: number, // 0-100
): BigNumber {
  if (totalVeCake === 0n) {
    return new BigNumber(0);
  }
  
  const userBalance = new BigNumber(userVeCake.toString());
  const totalBalance = new BigNumber(totalVeCake.toString());
  const percentage = new BigNumber(votePercentage).dividedBy(100);
  
  return userBalance.multipliedBy(percentage).dividedBy(totalBalance);
}

/**
 * Calculate CAKE APR for IFO pool
 */
export function calculateIfoPoolApr(params: {
  cakePrice: number;
  totalCakeLocked: bigint;
  annualCakeRewards: number;
}): number {
  const { cakePrice, totalCakeLocked, annualCakeRewards } = params;
  
  const totalValueLocked = new BigNumber(totalCakeLocked.toString())
    .dividedBy(new BigNumber(10).pow(CAKE_DECIMALS))
    .multipliedBy(cakePrice);
  
  if (totalValueLocked.isZero()) return 0;
  
  const annualRewardsUsd = annualCakeRewards * cakePrice;
  
  return new BigNumber(annualRewardsUsd)
    .dividedBy(totalValueLocked)
    .multipliedBy(100)
    .toNumber();
}

/**
 * Calculate CAKE burn amount from trading fees
 * A portion of trading fees is used to buy and burn CAKE
 */
export function calculateCakeBurn(
  tradingVolume: number,
  feeRate: number = 0.0025, // 0.25% default fee
  burnRate: number = 0.2, // 20% of fees burned
): number {
  return tradingVolume * feeRate * burnRate;
}

/**
 * Calculate boost eligibility
 * Users need minimum veCAKE to be eligible for farm boosts
 */
export function isEligibleForBoost(
  veCakeBalance: bigint,
  minimumVeCake: bigint = BigInt(1e18), // 1 veCAKE minimum
): boolean {
  return veCakeBalance >= minimumVeCake;
}

/**
 * Format CAKE amount for display
 */
export function formatCakeAmount(
  amount: bigint | string,
  decimals: number = 4,
): string {
  const amountBN = new BigNumber(amount.toString());
  const formatted = amountBN.dividedBy(new BigNumber(10).pow(CAKE_DECIMALS));
  
  return formatted.toFixed(decimals);
}

/**
 * Parse CAKE amount from string
 */
export function parseCakeAmount(amount: string): bigint {
  const amountBN = new BigNumber(amount);
  const wei = amountBN.multipliedBy(new BigNumber(10).pow(CAKE_DECIMALS));
  
  return BigInt(wei.integerValue(BigNumber.ROUND_DOWN).toString());
}

/**
 * Calculate unlock date from weeks
 */
export function calculateUnlockDate(weeks: number): Date {
  const now = Math.floor(Date.now() / 1000);
  const endTime = calculateLockEndTime(weeks, now);
  
  return new Date(endTime * 1000);
}

/**
 * Get remaining lock time in human-readable format
 */
export function formatRemainingLockTime(
  lockEndTime: number,
  currentTime: number = Math.floor(Date.now() / 1000),
): string {
  if (lockEndTime <= currentTime) {
    return 'Expired';
  }
  
  const remaining = lockEndTime - currentTime;
  const weeks = Math.floor(remaining / WEEK);
  const days = Math.floor((remaining % WEEK) / (24 * 60 * 60));
  
  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''}`;
}
