/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Fee tier configurations for PancakeSwap V3
 * 
 * PancakeSwap V3 uses concentrated liquidity with multiple fee tiers.
 * Each fee tier has a corresponding tick spacing that determines
 * the granularity of price positions.
 */

export interface FeeTier {
  fee: number;
  tickSpacing: number;
  label: string;
  description: string;
}

/**
 * Available fee tiers in PancakeSwap V3
 * Fee is expressed in hundredths of a basis point (1/100 of 0.01%)
 * e.g., 100 = 0.01%, 500 = 0.05%, 2500 = 0.25%, 10000 = 1%
 */
export const FEE_TIERS: Record<number, FeeTier> = {
  100: {
    fee: 100,
    tickSpacing: 1,
    label: '0.01%',
    description: 'Best for very stable pairs (e.g., stablecoins)',
  },
  500: {
    fee: 500,
    tickSpacing: 10,
    label: '0.05%',
    description: 'Best for stable pairs with slight variance',
  },
  2500: {
    fee: 2500,
    tickSpacing: 50,
    label: '0.25%',
    description: 'Best for most pairs (default)',
  },
  10000: {
    fee: 10000,
    tickSpacing: 200,
    label: '1%',
    description: 'Best for exotic or volatile pairs',
  },
};

export const FEE_TIER_OPTIONS = [
  { value: 100, label: '0.01% - Very Stable Pairs' },
  { value: 500, label: '0.05% - Stable Pairs' },
  { value: 2500, label: '0.25% - Standard (Most Pairs)' },
  { value: 10000, label: '1% - Exotic/Volatile Pairs' },
];

/**
 * Get tick spacing for a given fee tier
 */
export function getTickSpacing(fee: number): number {
  const tier = FEE_TIERS[fee];
  if (!tier) {
    throw new Error(`Unknown fee tier: ${fee}`);
  }
  return tier.tickSpacing;
}

/**
 * Get fee tier info
 */
export function getFeeTier(fee: number): FeeTier {
  const tier = FEE_TIERS[fee];
  if (!tier) {
    throw new Error(`Unknown fee tier: ${fee}`);
  }
  return tier;
}

/**
 * Validate if a fee tier exists
 */
export function isValidFeeTier(fee: number): boolean {
  return fee in FEE_TIERS;
}

/**
 * Get all valid fee values
 */
export function getValidFees(): number[] {
  return Object.keys(FEE_TIERS).map(Number);
}

/**
 * Convert fee to percentage string
 */
export function feeToPercentage(fee: number): string {
  return `${(fee / 10000).toFixed(2)}%`;
}

/**
 * StableSwap fee configuration
 * StableSwap uses a different fee structure optimized for stable assets
 */
export const STABLESWAP_FEES = {
  tradeFee: 4, // 0.04% trade fee
  adminFee: 5000000000, // 50% of trade fee goes to admin (protocol)
};

/**
 * V2 AMM fee (constant product)
 */
export const V2_FEE = {
  totalFee: 25, // 0.25% total fee
  lpFee: 17, // 0.17% to LPs
  treasuryFee: 3, // 0.03% to treasury
  burnFee: 5, // 0.05% burned (CAKE buyback)
};

// Alias for V3 fee tiers
export const V3_FEE_TIERS = FEE_TIERS;
