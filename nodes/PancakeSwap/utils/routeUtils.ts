/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import BigNumber from 'bignumber.js';

/**
 * Route utilities for PancakeSwap Smart Router
 */

BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  DECIMAL_PLACES: 18,
});

/**
 * Route types supported by PancakeSwap
 */
export enum RouteType {
  V2 = 'V2',
  V3 = 'V3',
  STABLE = 'STABLE',
  MIXED = 'MIXED',
}

/**
 * Route hop interface
 */
export interface RouteHop {
  tokenIn: string;
  tokenOut: string;
  pool: string;
  poolType: RouteType;
  fee?: number; // For V3 pools
}

/**
 * Complete route interface
 */
export interface SwapRoute {
  inputToken: string;
  outputToken: string;
  hops: RouteHop[];
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  gasEstimate: number;
  routeType: RouteType;
}

/**
 * Encode V3 path for swap
 * Path format: token0, fee, token1, fee, token2, ...
 */
export function encodeV3Path(
  tokens: string[],
  fees: number[],
  exactOutput: boolean = false,
): string {
  if (tokens.length < 2) {
    throw new Error('Path must have at least 2 tokens');
  }
  if (fees.length !== tokens.length - 1) {
    throw new Error('Fees array must have length equal to tokens.length - 1');
  }
  
  // For exact output swaps, reverse the path
  const orderedTokens = exactOutput ? [...tokens].reverse() : tokens;
  const orderedFees = exactOutput ? [...fees].reverse() : fees;
  
  let path = orderedTokens[0].toLowerCase().replace('0x', '');
  
  for (let i = 0; i < orderedFees.length; i++) {
    // Fee is encoded as 3 bytes (24 bits)
    const feeHex = orderedFees[i].toString(16).padStart(6, '0');
    const tokenHex = orderedTokens[i + 1].toLowerCase().replace('0x', '');
    path += feeHex + tokenHex;
  }
  
  return '0x' + path;
}

/**
 * Decode V3 path
 */
export function decodeV3Path(path: string): { tokens: string[]; fees: number[] } {
  const cleanPath = path.replace('0x', '');
  const tokens: string[] = [];
  const fees: number[] = [];
  
  // First token (20 bytes = 40 hex chars)
  tokens.push('0x' + cleanPath.slice(0, 40));
  
  let offset = 40;
  while (offset < cleanPath.length) {
    // Fee (3 bytes = 6 hex chars)
    const feeHex = cleanPath.slice(offset, offset + 6);
    fees.push(parseInt(feeHex, 16));
    offset += 6;
    
    // Token (20 bytes = 40 hex chars)
    tokens.push('0x' + cleanPath.slice(offset, offset + 40));
    offset += 40;
  }
  
  return { tokens, fees };
}

/**
 * Calculate total gas estimate for a route
 */
export function calculateRouteGasEstimate(route: SwapRoute): number {
  const baseGas = 21000; // Base transaction gas
  let hopGas = 0;
  
  for (const hop of route.hops) {
    switch (hop.poolType) {
      case RouteType.V2:
        hopGas += 100000; // V2 swap gas
        break;
      case RouteType.V3:
        hopGas += 150000; // V3 swap gas
        break;
      case RouteType.STABLE:
        hopGas += 200000; // StableSwap gas
        break;
      default:
        hopGas += 120000;
    }
  }
  
  return baseGas + hopGas;
}

/**
 * Compare routes and find the best one
 */
export function findBestRoute(
  routes: SwapRoute[],
  prioritize: 'output' | 'gas' | 'impact' = 'output',
): SwapRoute | null {
  if (routes.length === 0) return null;
  if (routes.length === 1) return routes[0];
  
  return routes.reduce((best, current) => {
    switch (prioritize) {
      case 'output':
        return new BigNumber(current.outputAmount).isGreaterThan(best.outputAmount)
          ? current
          : best;
      case 'gas':
        return current.gasEstimate < best.gasEstimate ? current : best;
      case 'impact':
        return current.priceImpact < best.priceImpact ? current : best;
      default:
        return best;
    }
  });
}

/**
 * Calculate effective price including gas
 */
export function calculateEffectivePrice(
  route: SwapRoute,
  gasPrice: number, // in gwei
  nativeTokenPriceUsd: number,
  outputTokenPriceUsd: number,
): number {
  const outputAmount = new BigNumber(route.outputAmount);
  const gasCostWei = new BigNumber(route.gasEstimate).multipliedBy(gasPrice * 1e9);
  const gasCostNative = gasCostWei.dividedBy(1e18);
  const gasCostUsd = gasCostNative.multipliedBy(nativeTokenPriceUsd);
  const gasCostInOutput = gasCostUsd.dividedBy(outputTokenPriceUsd);
  
  const effectiveOutput = outputAmount.minus(gasCostInOutput);
  
  return effectiveOutput.toNumber();
}

/**
 * Split route for large swaps
 * Returns multiple routes that can be executed in parallel
 */
export function splitRoute(
  route: SwapRoute,
  inputAmount: string,
  splits: number = 2,
): SwapRoute[] {
  const splitRoutes: SwapRoute[] = [];
  const inputBN = new BigNumber(inputAmount);
  const splitAmount = inputBN.dividedBy(splits);
  
  for (let i = 0; i < splits; i++) {
    splitRoutes.push({
      ...route,
      inputAmount: splitAmount.toString(),
      outputAmount: new BigNumber(route.outputAmount).dividedBy(splits).toString(),
    });
  }
  
  return splitRoutes;
}

/**
 * Format route for display
 */
export function formatRoute(route: SwapRoute): string {
  const tokens = [route.inputToken];
  
  for (const hop of route.hops) {
    tokens.push(hop.tokenOut);
  }
  
  const path = tokens.map((t) => t.slice(0, 6) + '...').join(' → ');
  
  return `${path} (${route.routeType})`;
}

/**
 * Validate route before execution
 */
export function validateRoute(route: SwapRoute): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (route.hops.length === 0) {
    errors.push('Route has no hops');
  }
  
  if (route.priceImpact > 15) {
    errors.push(`High price impact: ${route.priceImpact.toFixed(2)}%`);
  }
  
  if (new BigNumber(route.outputAmount).isZero()) {
    errors.push('Output amount is zero');
  }
  
  // Validate hop continuity
  let currentToken = route.inputToken.toLowerCase();
  for (const hop of route.hops) {
    if (hop.tokenIn.toLowerCase() !== currentToken) {
      errors.push('Route hops are not continuous');
      break;
    }
    currentToken = hop.tokenOut.toLowerCase();
  }
  
  if (currentToken !== route.outputToken.toLowerCase()) {
    errors.push('Route does not end at output token');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate deadline timestamp
 */
export function calculateDeadline(minutesFromNow: number = 20): number {
  return Math.floor(Date.now() / 1000) + minutesFromNow * 60;
}
