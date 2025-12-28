/**
 * PancakeSwap Smart Router Client
 * Handles V3 routing, multi-hop swaps, and split routes
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { ethers } from 'ethers';
import { getContractsByChainId, NETWORKS } from '../constants';

export interface RouteHop {
	tokenIn: string;
	tokenOut: string;
	fee: number;
	poolAddress: string;
	protocol: 'v2' | 'v3' | 'stableswap';
}

export interface SwapRoute {
	hops: RouteHop[];
	path: string[];
	fees: number[];
	protocols: string[];
	estimatedGas: bigint;
	priceImpact: number;
	amountIn: bigint;
	amountOut: bigint;
}

export interface QuoteResult {
	amountIn: bigint;
	amountOut: bigint;
	route: SwapRoute;
	priceImpact: number;
	gasEstimate: bigint;
	executionPrice: number;
}

// V3 Quoter ABI
const QUOTER_V2_ABI = [
	'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
	'function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)',
	'function quoteExactOutputSingle(tuple(address tokenIn, address tokenOut, uint256 amount, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
	'function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)',
];

// V3 SwapRouter ABI
const SWAP_ROUTER_ABI = [
	'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
	'function exactInput(tuple(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)',
	'function exactOutputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)',
	'function exactOutput(tuple(bytes path, address recipient, uint256 amountOut, uint256 amountInMaximum)) external payable returns (uint256 amountIn)',
	'function multicall(uint256 deadline, bytes[] data) external payable returns (bytes[] results)',
];

// V3 Factory ABI
const FACTORY_V3_ABI = [
	'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)',
	'function feeAmountTickSpacing(uint24 fee) external view returns (int24)',
];

// V3 Pool ABI
const POOL_V3_ABI = [
	'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
	'function liquidity() external view returns (uint128)',
	'function token0() external view returns (address)',
	'function token1() external view returns (address)',
	'function fee() external view returns (uint24)',
];

export class SmartRouterClient {
	private provider: ethers.JsonRpcProvider;
	private wallet: ethers.Wallet | null = null;
	private quoterAddress: string;
	private swapRouterAddress: string;
	private factoryV3Address: string;

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
		this.quoterAddress = contracts.quoterV2 || '';
		this.swapRouterAddress = contracts.smartRouter || '';
		this.factoryV3Address = contracts.factoryV3 || '';
	}

	/**
	 * Get quote for exact input swap (single hop)
	 */
	async quoteExactInputSingle(
		tokenIn: string,
		tokenOut: string,
		amountIn: bigint,
		fee: number = 2500,
	): Promise<QuoteResult> {
		const quoter = new ethers.Contract(this.quoterAddress, QUOTER_V2_ABI, this.provider);

		const params = {
			tokenIn,
			tokenOut,
			amountIn,
			fee,
			sqrtPriceLimitX96: 0n,
		};

		try {
			const result = await quoter.quoteExactInputSingle.staticCall(params);

			const route: SwapRoute = {
				hops: [{
					tokenIn,
					tokenOut,
					fee,
					poolAddress: await this.getPoolAddress(tokenIn, tokenOut, fee),
					protocol: 'v3',
				}],
				path: [tokenIn, tokenOut],
				fees: [fee],
				protocols: ['v3'],
				estimatedGas: result.gasEstimate,
				priceImpact: this.calculatePriceImpact(amountIn, result.amountOut, tokenIn, tokenOut),
				amountIn,
				amountOut: result.amountOut,
			};

			return {
				amountIn,
				amountOut: result.amountOut,
				route,
				priceImpact: route.priceImpact,
				gasEstimate: result.gasEstimate,
				executionPrice: Number(result.amountOut) / Number(amountIn),
			};
		} catch (error) {
			throw new Error(`Quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Get quote for exact input swap (multi-hop)
	 */
	async quoteExactInput(
		path: string[],
		fees: number[],
		amountIn: bigint,
	): Promise<QuoteResult> {
		if (path.length !== fees.length + 1) {
			throw new Error('Path length must be fees length + 1');
		}

		const quoter = new ethers.Contract(this.quoterAddress, QUOTER_V2_ABI, this.provider);
		const encodedPath = this.encodePath(path, fees);

		try {
			const result = await quoter.quoteExactInput.staticCall(encodedPath, amountIn);

			const hops: RouteHop[] = [];
			for (let i = 0; i < fees.length; i++) {
				hops.push({
					tokenIn: path[i],
					tokenOut: path[i + 1],
					fee: fees[i],
					poolAddress: await this.getPoolAddress(path[i], path[i + 1], fees[i]),
					protocol: 'v3',
				});
			}

			const route: SwapRoute = {
				hops,
				path,
				fees,
				protocols: fees.map(() => 'v3'),
				estimatedGas: result.gasEstimate,
				priceImpact: this.calculatePriceImpact(amountIn, result.amountOut, path[0], path[path.length - 1]),
				amountIn,
				amountOut: result.amountOut,
			};

			return {
				amountIn,
				amountOut: result.amountOut,
				route,
				priceImpact: route.priceImpact,
				gasEstimate: result.gasEstimate,
				executionPrice: Number(result.amountOut) / Number(amountIn),
			};
		} catch (error) {
			throw new Error(`Multi-hop quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Get quote for exact output swap
	 */
	async quoteExactOutputSingle(
		tokenIn: string,
		tokenOut: string,
		amountOut: bigint,
		fee: number = 2500,
	): Promise<QuoteResult> {
		const quoter = new ethers.Contract(this.quoterAddress, QUOTER_V2_ABI, this.provider);

		const params = {
			tokenIn,
			tokenOut,
			amount: amountOut,
			fee,
			sqrtPriceLimitX96: 0n,
		};

		try {
			const result = await quoter.quoteExactOutputSingle.staticCall(params);

			const route: SwapRoute = {
				hops: [{
					tokenIn,
					tokenOut,
					fee,
					poolAddress: await this.getPoolAddress(tokenIn, tokenOut, fee),
					protocol: 'v3',
				}],
				path: [tokenIn, tokenOut],
				fees: [fee],
				protocols: ['v3'],
				estimatedGas: result.gasEstimate,
				priceImpact: this.calculatePriceImpact(result.amountIn, amountOut, tokenIn, tokenOut),
				amountIn: result.amountIn,
				amountOut,
			};

			return {
				amountIn: result.amountIn,
				amountOut,
				route,
				priceImpact: route.priceImpact,
				gasEstimate: result.gasEstimate,
				executionPrice: Number(amountOut) / Number(result.amountIn),
			};
		} catch (error) {
			throw new Error(`Exact output quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Find best route across all fee tiers
	 */
	async findBestRoute(
		tokenIn: string,
		tokenOut: string,
		amountIn: bigint,
	): Promise<QuoteResult> {
		const feeTiers = [100, 500, 2500, 10000]; // 0.01%, 0.05%, 0.25%, 1%
		let bestQuote: QuoteResult | null = null;

		for (const fee of feeTiers) {
			try {
				const quote = await this.quoteExactInputSingle(tokenIn, tokenOut, amountIn, fee);
				if (!bestQuote || quote.amountOut > bestQuote.amountOut) {
					bestQuote = quote;
				}
			} catch {
				// Skip fee tiers where pool doesn't exist
				continue;
			}
		}

		if (!bestQuote) {
			throw new Error('No valid route found for swap');
		}

		return bestQuote;
	}

	/**
	 * Find all possible routes including multi-hop
	 */
	async findAllRoutes(
		tokenIn: string,
		tokenOut: string,
		amountIn: bigint,
		intermediateTokens: string[] = [],
	): Promise<QuoteResult[]> {
		const routes: QuoteResult[] = [];

		// Direct routes
		const feeTiers = [100, 500, 2500, 10000];
		for (const fee of feeTiers) {
			try {
				const quote = await this.quoteExactInputSingle(tokenIn, tokenOut, amountIn, fee);
				routes.push(quote);
			} catch {
				continue;
			}
		}

		// Multi-hop routes through intermediate tokens
		for (const intermediate of intermediateTokens) {
			if (intermediate.toLowerCase() === tokenIn.toLowerCase() ||
				intermediate.toLowerCase() === tokenOut.toLowerCase()) {
				continue;
			}

			for (const fee1 of feeTiers) {
				for (const fee2 of feeTiers) {
					try {
						const quote = await this.quoteExactInput(
							[tokenIn, intermediate, tokenOut],
							[fee1, fee2],
							amountIn,
						);
						routes.push(quote);
					} catch {
						continue;
					}
				}
			}
		}

		// Sort by best output
		routes.sort((a, b) => Number(b.amountOut - a.amountOut));

		return routes;
	}

	/**
	 * Execute exact input swap (single hop)
	 */
	async executeSwapExactInputSingle(
		tokenIn: string,
		tokenOut: string,
		amountIn: bigint,
		amountOutMinimum: bigint,
		fee: number = 2500,
		recipient?: string,
		_deadline?: number,
	): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required for swaps');
		}

		const router = new ethers.Contract(this.swapRouterAddress, SWAP_ROUTER_ABI, this.wallet);

		const params = {
			tokenIn,
			tokenOut,
			fee,
			recipient: recipient || await this.wallet.getAddress(),
			amountIn,
			amountOutMinimum,
			sqrtPriceLimitX96: 0n,
		};

		const tx = await router.exactInputSingle(params, {
			value: tokenIn === ethers.ZeroAddress ? amountIn : 0n,
		});

		return tx;
	}

	/**
	 * Execute exact input swap (multi-hop)
	 */
	async executeSwapExactInput(
		path: string[],
		fees: number[],
		amountIn: bigint,
		amountOutMinimum: bigint,
		recipient?: string,
		_deadline?: number,
	): Promise<ethers.TransactionResponse> {
		if (!this.wallet) {
			throw new Error('Wallet not configured - private key required for swaps');
		}

		const router = new ethers.Contract(this.swapRouterAddress, SWAP_ROUTER_ABI, this.wallet);
		const encodedPath = this.encodePath(path, fees);

		const params = {
			path: encodedPath,
			recipient: recipient || await this.wallet.getAddress(),
			amountIn,
			amountOutMinimum,
		};

		const tx = await router.exactInput(params, {
			value: path[0] === ethers.ZeroAddress ? amountIn : 0n,
		});

		return tx;
	}

	/**
	 * Get pool address for token pair and fee
	 */
	async getPoolAddress(tokenA: string, tokenB: string, fee: number): Promise<string> {
		const factory = new ethers.Contract(this.factoryV3Address, FACTORY_V3_ABI, this.provider);
		return await factory.getPool(tokenA, tokenB, fee);
	}

	/**
	 * Get pool info
	 */
	async getPoolInfo(poolAddress: string): Promise<{
		token0: string;
		token1: string;
		fee: number;
		sqrtPriceX96: bigint;
		tick: number;
		liquidity: bigint;
	}> {
		const pool = new ethers.Contract(poolAddress, POOL_V3_ABI, this.provider);

		const [slot0, liquidity, token0, token1, fee] = await Promise.all([
			pool.slot0(),
			pool.liquidity(),
			pool.token0(),
			pool.token1(),
			pool.fee(),
		]);

		return {
			token0,
			token1,
			fee: Number(fee),
			sqrtPriceX96: slot0.sqrtPriceX96,
			tick: Number(slot0.tick),
			liquidity,
		};
	}

	/**
	 * Encode path for multi-hop swaps
	 */
	encodePath(path: string[], fees: number[]): string {
		if (path.length !== fees.length + 1) {
			throw new Error('Path length must be fees length + 1');
		}

		let encoded = '0x';
		for (let i = 0; i < fees.length; i++) {
			encoded += path[i].slice(2); // Remove 0x prefix
			encoded += fees[i].toString(16).padStart(6, '0'); // 3 bytes for fee
		}
		encoded += path[path.length - 1].slice(2);

		return encoded;
	}

	/**
	 * Decode path from encoded bytes
	 */
	decodePath(encodedPath: string): { path: string[]; fees: number[] } {
		const path: string[] = [];
		const fees: number[] = [];

		// Remove 0x prefix
		let data = encodedPath.startsWith('0x') ? encodedPath.slice(2) : encodedPath;

		// Each hop is 20 bytes (address) + 3 bytes (fee)
		// Last element is just 20 bytes (address)
		while (data.length >= 40) {
			// Extract address (20 bytes = 40 hex chars)
			path.push('0x' + data.slice(0, 40));
			data = data.slice(40);

			if (data.length >= 6) {
				// Extract fee (3 bytes = 6 hex chars)
				fees.push(parseInt(data.slice(0, 6), 16));
				data = data.slice(6);
			}
		}

		// Last address if remaining
		if (data.length === 40) {
			path.push('0x' + data);
		}

		return { path, fees };
	}

	/**
	 * Calculate price impact (simplified)
	 */
	private calculatePriceImpact(
		_amountIn: bigint,
		_amountOut: bigint,
		_tokenIn: string,
		_tokenOut: string,
	): number {
		// This is a simplified calculation
		// In production, compare against spot price from pool
		return 0;
	}

	/**
	 * Calculate minimum amount out with slippage
	 */
	calculateMinimumAmountOut(amountOut: bigint, slippagePercent: number): bigint {
		const slippageBps = BigInt(Math.floor(slippagePercent * 100));
		return amountOut - (amountOut * slippageBps / 10000n);
	}

	/**
	 * Calculate maximum amount in with slippage
	 */
	calculateMaximumAmountIn(amountIn: bigint, slippagePercent: number): bigint {
		const slippageBps = BigInt(Math.floor(slippagePercent * 100));
		return amountIn + (amountIn * slippageBps / 10000n);
	}

	/**
	 * Get deadline timestamp
	 */
	getDeadline(minutes: number = 20): number {
		return Math.floor(Date.now() / 1000) + minutes * 60;
	}
}

export function createSmartRouterClient(
	network: string,
	privateKey?: string,
): SmartRouterClient {
	const networkConfig = NETWORKS[network];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}

	return new SmartRouterClient(
		networkConfig.rpcUrl,
		networkConfig.chainId,
		privateKey,
	);
}
