/**
 * PancakeSwap Subgraph Client
 * Handles GraphQL queries to V2/V3/StableSwap subgraphs
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { NETWORKS } from '../constants';

export interface SubgraphConfig {
	v2: string;
	v3: string;
	stableSwap: string;
	masterChef: string;
	predictions: string;
	lottery: string;
	nftMarket: string;
}

export interface Pool {
	id: string;
	token0: Token;
	token1: Token;
	feeTier?: string;
	liquidity?: string;
	sqrtPrice?: string;
	tick?: string;
	volumeUSD: string;
	totalValueLockedUSD: string;
	txCount: string;
}

export interface Pair {
	id: string;
	token0: Token;
	token1: Token;
	reserve0: string;
	reserve1: string;
	reserveUSD: string;
	volumeUSD: string;
	txCount: string;
}

export interface Token {
	id: string;
	symbol: string;
	name: string;
	decimals: string;
	totalSupply?: string;
	volume?: string;
	volumeUSD?: string;
	totalValueLocked?: string;
	totalValueLockedUSD?: string;
}

export interface Position {
	id: string;
	owner: string;
	pool: Pool;
	token0: Token;
	token1: Token;
	tickLower: string;
	tickUpper: string;
	liquidity: string;
	depositedToken0: string;
	depositedToken1: string;
	withdrawnToken0: string;
	withdrawnToken1: string;
	collectedFeesToken0: string;
	collectedFeesToken1: string;
}

export interface Swap {
	id: string;
	transaction: { id: string; blockNumber: string; timestamp: string };
	pool?: Pool;
	pair?: Pair;
	sender: string;
	recipient?: string;
	origin?: string;
	amount0: string;
	amount1: string;
	amountUSD: string;
	sqrtPriceX96?: string;
	tick?: string;
}

export interface SubgraphResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}

export class SubgraphClient {
	private endpoints: SubgraphConfig;

	constructor(network: string, customEndpoints?: Partial<SubgraphConfig>) {
		const networkConfig = NETWORKS[network];

		if (!networkConfig) {
			throw new Error(`Unknown network: ${network}`);
		}

		// Default subgraph endpoints - access subgraphs property correctly
		this.endpoints = {
			v2: customEndpoints?.v2 || networkConfig.subgraphs?.v2 || `https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-${network}`,
			v3: customEndpoints?.v3 || networkConfig.subgraphs?.v3 || `https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-${network}`,
			stableSwap: customEndpoints?.stableSwap || networkConfig.subgraphs?.stableSwap || `https://api.thegraph.com/subgraphs/name/pancakeswap/stableswap-${network}`,
			masterChef: customEndpoints?.masterChef || `https://api.thegraph.com/subgraphs/name/pancakeswap/masterchef-v3-${network}`,
			predictions: customEndpoints?.predictions || `https://api.thegraph.com/subgraphs/name/pancakeswap/prediction-v2-${network}`,
			lottery: customEndpoints?.lottery || `https://api.thegraph.com/subgraphs/name/pancakeswap/lottery-${network}`,
			nftMarket: customEndpoints?.nftMarket || `https://api.thegraph.com/subgraphs/name/pancakeswap/nft-market-${network}`,
		};
	}

	/**
	 * Execute GraphQL query
	 */
	private async query<T>(
		endpoint: string,
		query: string,
		variables?: Record<string, any>,
	): Promise<T> {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query,
				variables,
			}),
		});

		if (!response.ok) {
			throw new Error(`Subgraph query failed: ${response.statusText}`);
		}

		const result = await response.json() as SubgraphResponse<T>;

		if (result.errors && result.errors.length > 0) {
			throw new Error(`Subgraph errors: ${result.errors.map(e => e.message).join(', ')}`);
		}

		return result.data;
	}

	// ==================== V3 Queries ====================

	/**
	 * Query V3 pools
	 */
	async queryV3Pools(
		first: number = 100,
		skip: number = 0,
		orderBy: string = 'totalValueLockedUSD',
		orderDirection: 'asc' | 'desc' = 'desc',
		where?: Record<string, any>,
	): Promise<Pool[]> {
		const query = `
			query pools($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!, $where: Pool_filter) {
				pools(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
					id
					token0 { id symbol name decimals }
					token1 { id symbol name decimals }
					feeTier
					liquidity
					sqrtPrice
					tick
					volumeUSD
					totalValueLockedUSD
					txCount
				}
			}
		`;

		const result = await this.query<{ pools: Pool[] }>(this.endpoints.v3, query, {
			first,
			skip,
			orderBy,
			orderDirection,
			where,
		});

		return result.pools;
	}

	/**
	 * Query V3 pool by address
	 */
	async queryV3Pool(address: string): Promise<Pool | null> {
		const query = `
			query pool($id: ID!) {
				pool(id: $id) {
					id
					token0 { id symbol name decimals }
					token1 { id symbol name decimals }
					feeTier
					liquidity
					sqrtPrice
					tick
					volumeUSD
					totalValueLockedUSD
					txCount
				}
			}
		`;

		const result = await this.query<{ pool: Pool | null }>(this.endpoints.v3, query, {
			id: address.toLowerCase(),
		});

		return result.pool;
	}

	/**
	 * Query V3 positions by owner
	 */
	async queryV3Positions(
		owner: string,
		first: number = 100,
		skip: number = 0,
	): Promise<Position[]> {
		const query = `
			query positions($owner: String!, $first: Int!, $skip: Int!) {
				positions(where: { owner: $owner }, first: $first, skip: $skip) {
					id
					owner
					pool {
						id
						token0 { id symbol name decimals }
						token1 { id symbol name decimals }
						feeTier
					}
					token0 { id symbol name decimals }
					token1 { id symbol name decimals }
					tickLower { tickIdx }
					tickUpper { tickIdx }
					liquidity
					depositedToken0
					depositedToken1
					withdrawnToken0
					withdrawnToken1
					collectedFeesToken0
					collectedFeesToken1
				}
			}
		`;

		const result = await this.query<{ positions: any[] }>(this.endpoints.v3, query, {
			owner: owner.toLowerCase(),
			first,
			skip,
		});

		return result.positions.map(p => ({
			...p,
			tickLower: p.tickLower?.tickIdx || '0',
			tickUpper: p.tickUpper?.tickIdx || '0',
		}));
	}

	/**
	 * Query V3 swaps
	 */
	async queryV3Swaps(
		first: number = 100,
		skip: number = 0,
		poolAddress?: string,
		userAddress?: string,
	): Promise<Swap[]> {
		let whereClause = '';
		const variables: Record<string, any> = { first, skip };

		if (poolAddress) {
			whereClause = ', where: { pool: $pool }';
			variables.pool = poolAddress.toLowerCase();
		} else if (userAddress) {
			whereClause = ', where: { origin: $user }';
			variables.user = userAddress.toLowerCase();
		}

		const query = `
			query swaps($first: Int!, $skip: Int!${poolAddress ? ', $pool: String!' : ''}${userAddress ? ', $user: String!' : ''}) {
				swaps(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc${whereClause}) {
					id
					transaction { id blockNumber timestamp }
					pool { id token0 { id symbol } token1 { id symbol } }
					sender
					recipient
					origin
					amount0
					amount1
					amountUSD
					sqrtPriceX96
					tick
				}
			}
		`;

		const result = await this.query<{ swaps: Swap[] }>(this.endpoints.v3, query, variables);
		return result.swaps;
	}

	// ==================== V2 Queries ====================

	/**
	 * Query V2 pairs
	 */
	async queryV2Pairs(
		first: number = 100,
		skip: number = 0,
		orderBy: string = 'reserveUSD',
		orderDirection: 'asc' | 'desc' = 'desc',
	): Promise<Pair[]> {
		const query = `
			query pairs($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
				pairs(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
					id
					token0 { id symbol name decimals }
					token1 { id symbol name decimals }
					reserve0
					reserve1
					reserveUSD
					volumeUSD
					txCount
				}
			}
		`;

		const result = await this.query<{ pairs: Pair[] }>(this.endpoints.v2, query, {
			first,
			skip,
			orderBy,
			orderDirection,
		});

		return result.pairs;
	}

	/**
	 * Query V2 pair by address
	 */
	async queryV2Pair(address: string): Promise<Pair | null> {
		const query = `
			query pair($id: ID!) {
				pair(id: $id) {
					id
					token0 { id symbol name decimals }
					token1 { id symbol name decimals }
					reserve0
					reserve1
					reserveUSD
					volumeUSD
					txCount
				}
			}
		`;

		const result = await this.query<{ pair: Pair | null }>(this.endpoints.v2, query, {
			id: address.toLowerCase(),
		});

		return result.pair;
	}

	/**
	 * Query V2 swaps
	 */
	async queryV2Swaps(
		first: number = 100,
		skip: number = 0,
		pairAddress?: string,
	): Promise<Swap[]> {
		const whereClause = pairAddress ? ', where: { pair: $pair }' : '';
		const variables: Record<string, any> = { first, skip };
		if (pairAddress) variables.pair = pairAddress.toLowerCase();

		const query = `
			query swaps($first: Int!, $skip: Int!${pairAddress ? ', $pair: String!' : ''}) {
				swaps(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc${whereClause}) {
					id
					transaction { id blockNumber timestamp }
					pair { id token0 { id symbol } token1 { id symbol } }
					sender
					amount0In
					amount0Out
					amount1In
					amount1Out
					amountUSD
					to
				}
			}
		`;

		const result = await this.query<{ swaps: any[] }>(this.endpoints.v2, query, variables);

		// Normalize V2 swap format
		return result.swaps.map(s => ({
			id: s.id,
			transaction: s.transaction,
			pair: s.pair,
			sender: s.sender,
			recipient: s.to,
			amount0: (BigInt(s.amount0In || '0') - BigInt(s.amount0Out || '0')).toString(),
			amount1: (BigInt(s.amount1In || '0') - BigInt(s.amount1Out || '0')).toString(),
			amountUSD: s.amountUSD,
		}));
	}

	// ==================== Token Queries ====================

	/**
	 * Query tokens
	 */
	async queryTokens(
		subgraph: 'v2' | 'v3' = 'v3',
		first: number = 100,
		skip: number = 0,
		orderBy: string = 'totalValueLockedUSD',
		orderDirection: 'asc' | 'desc' = 'desc',
		search?: string,
	): Promise<Token[]> {
		let whereClause = '';
		const variables: Record<string, any> = { first, skip, orderBy, orderDirection };

		if (search) {
			whereClause = ', where: { symbol_contains_nocase: $search }';
			variables.search = search;
		}

		const query = `
			query tokens($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!${search ? ', $search: String!' : ''}) {
				tokens(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection${whereClause}) {
					id
					symbol
					name
					decimals
					totalSupply
					volume
					volumeUSD
					totalValueLocked
					totalValueLockedUSD
				}
			}
		`;

		const endpoint = subgraph === 'v2' ? this.endpoints.v2 : this.endpoints.v3;
		const result = await this.query<{ tokens: Token[] }>(endpoint, query, variables);

		return result.tokens;
	}

	/**
	 * Query token by address
	 */
	async queryToken(address: string, subgraph: 'v2' | 'v3' = 'v3'): Promise<Token | null> {
		const query = `
			query token($id: ID!) {
				token(id: $id) {
					id
					symbol
					name
					decimals
					totalSupply
					volume
					volumeUSD
					totalValueLocked
					totalValueLockedUSD
				}
			}
		`;

		const endpoint = subgraph === 'v2' ? this.endpoints.v2 : this.endpoints.v3;
		const result = await this.query<{ token: Token | null }>(endpoint, query, {
			id: address.toLowerCase(),
		});

		return result.token;
	}

	// ==================== Farm Queries ====================

	/**
	 * Query farms from MasterChef subgraph
	 */
	async queryFarms(
		first: number = 100,
		skip: number = 0,
	): Promise<any[]> {
		const query = `
			query pools($first: Int!, $skip: Int!) {
				pools(first: $first, skip: $skip, orderBy: allocPoint, orderDirection: desc) {
					id
					pair
					allocPoint
					lastRewardBlock
					accCakePerShare
					totalBoostedShare
					isRegular
				}
			}
		`;

		const result = await this.query<{ pools: any[] }>(this.endpoints.masterChef, query, {
			first,
			skip,
		});

		return result.pools;
	}

	// ==================== Custom Query ====================

	/**
	 * Execute custom GraphQL query
	 */
	async customQuery<T>(
		subgraph: 'v2' | 'v3' | 'stableSwap' | 'masterChef' | 'predictions' | 'lottery' | 'nftMarket',
		query: string,
		variables?: Record<string, any>,
	): Promise<T> {
		const endpoint = this.endpoints[subgraph];
		if (!endpoint) {
			throw new Error(`Unknown subgraph: ${subgraph}`);
		}

		return await this.query<T>(endpoint, query, variables);
	}

	// ==================== Subgraph Status ====================

	/**
	 * Get subgraph indexing status
	 */
	async getSubgraphStatus(subgraph: 'v2' | 'v3' | 'stableSwap' | 'masterChef'): Promise<{
		synced: boolean;
		latestBlock: string;
		chainHeadBlock: string;
		health: string;
	}> {
		const endpoint = this.endpoints[subgraph];

		// Try to get the latest block from a simple query
		const query = `
			query {
				_meta {
					block { number }
					hasIndexingErrors
				}
			}
		`;

		try {
			const result = await this.query<{ _meta: { block: { number: string }; hasIndexingErrors: boolean } }>(
				endpoint,
				query,
			);

			return {
				synced: !result._meta.hasIndexingErrors,
				latestBlock: result._meta.block.number,
				chainHeadBlock: 'unknown', // Would need separate RPC call
				health: result._meta.hasIndexingErrors ? 'unhealthy' : 'healthy',
			};
		} catch (error) {
			return {
				synced: false,
				latestBlock: '0',
				chainHeadBlock: 'unknown',
				health: 'error',
			};
		}
	}

	/**
	 * Get all subgraph endpoints
	 */
	getEndpoints(): SubgraphConfig {
		return { ...this.endpoints };
	}

	/**
	 * Update subgraph endpoint
	 */
	setEndpoint(subgraph: keyof SubgraphConfig, url: string): void {
		this.endpoints[subgraph] = url;
	}
}

export function createSubgraphClient(
	network: string,
	customEndpoints?: Partial<SubgraphConfig>,
): SubgraphClient {
	return new SubgraphClient(network, customEndpoints);
}
