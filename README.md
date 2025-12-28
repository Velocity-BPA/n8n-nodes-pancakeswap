# n8n-nodes-pancakeswap

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for PancakeSwap DEX providing 27 resources and 300+ operations for swapping, liquidity provision, farming, staking, and DeFi automation across 8 blockchain networks.

![n8n Community Node](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Networks](https://img.shields.io/badge/networks-8-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **27 Resource Categories** - Complete PancakeSwap protocol coverage
- **300+ Operations** - Comprehensive DeFi operations
- **8 Networks** - BSC, Ethereum, Arbitrum, Base, zkSync, Linea, Polygon zkEVM, opBNB
- **V2 + V3 + StableSwap** - All AMM protocols supported
- **Smart Router** - Optimal routing across protocols
- **veCAKE Integration** - Vote-escrow governance and boost
- **Real-time Triggers** - 50+ event types for automation
- **Subgraph Queries** - GraphQL data access
- **Cross-chain Bridge** - Multi-network token transfers

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-pancakeswap`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or extract the package
git clone https://github.com/Velocity-BPA/n8n-nodes-pancakeswap.git

# Install dependencies and build
cd n8n-nodes-pancakeswap
npm install
npm run build

# Restart n8n
```

### Development Installation

```bash
# Extract the package
unzip n8n-nodes-pancakeswap.zip
cd n8n-nodes-pancakeswap

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-pancakeswap

# Restart n8n
n8n start
```

## Credentials Setup

### PancakeSwap Network Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Network | Blockchain network (BSC, Ethereum, etc.) | Yes |
| RPC URL | Custom RPC endpoint (optional) | No |
| Private Key | Wallet private key for transactions | For write operations |
| Chain ID | Auto-populated based on network | Auto |
| Subgraph URL | Custom subgraph endpoint | No |

### PancakeSwap API Credentials

| Field | Description | Required |
|-------|-------------|----------|
| API Endpoint | PancakeSwap API URL | No |
| V2 Subgraph | V2 Exchange subgraph URL | No |
| V3 Subgraph | V3 Exchange subgraph URL | No |
| StableSwap Subgraph | StableSwap subgraph URL | No |

## Resources & Operations

### Swap (17 operations)
Execute token swaps across V2, V3, and StableSwap protocols with smart routing.

- Get Quote (V2/V3/StableSwap/Smart Router)
- Execute Swap (Exact Input/Output)
- Get Swap Route
- Calculate Price Impact
- Compare Routes
- Get Swap Fees

### Quote (10 operations)
Get swap quotes with gas estimates and price impact analysis.

- Get Best Quote
- Get V2/V3/StableSwap Quote
- Get Multi-hop Quote
- Get Split Route Quote
- Compare All Quotes

### Route (11 operations)
Find optimal swap routes across protocols.

- Get Best Route
- Get All Routes
- Get Route Pools
- Calculate Route Efficiency
- Get Gas Estimate

### Pool V3 (15 operations)
Manage PancakeSwap V3 concentrated liquidity pools.

- Get Pool Info
- Get Pool Liquidity/TVL/Volume
- Get Pool Tick/Price
- Get Pool APR
- List/Search Pools

### Pool V2 (10 operations)
Manage PancakeSwap V2 constant product pools.

- Get Pair Info
- Get Reserves/Price
- Get TVL/Volume/APR
- List/Search Pairs

### StableSwap Pool (10 operations)
Manage stable asset swap pools with low slippage.

- Get Pool Balances
- Get Virtual Price
- Get Amplification Coefficient
- Get Pool APR

### Position (11 operations)
Manage V3 liquidity positions (NFTs).

- Get Position Info
- Get Position Liquidity/Fees
- Check In-Range Status
- Get Position Value/APR
- Get Position History

### Liquidity V3 (11 operations)
Add/remove concentrated liquidity with custom price ranges.

- Mint Position
- Increase/Decrease Liquidity
- Collect Fees
- Burn Position
- Get Optimal Ratio

### Liquidity V2 (11 operations)
Add/remove liquidity from V2 pools.

- Add/Remove Liquidity
- Add/Remove Liquidity BNB
- Zap In/Out
- Get LP Token Value

### StableSwap Liquidity (9 operations)
Manage stable pool liquidity with balanced/single-sided options.

- Add Liquidity (Balanced/Single)
- Remove Liquidity (Balanced/Single/Imbalanced)
- Calculate Amounts

### Token (12 operations)
Token information and validation.

- Get Token Info/Price
- Get Token Volume/Liquidity
- Validate Token
- Search Tokens
- Get Trending Tokens

### Price (10 operations)
Token and pool price data.

- Get Token Price (BNB/USD)
- Get Historical Prices
- Get Price Chart
- Get 24h High/Low

### CAKE (11 operations)
CAKE token operations and veCAKE.

- Get CAKE Balance/Price/Supply
- Get CAKE Burned/Emissions
- Lock CAKE for veCAKE
- Extend/Increase Lock
- Get Lock Info

### Staking (11 operations)
Syrup Pool CAKE staking.

- Get Syrup Pools
- Stake/Unstake CAKE
- Harvest Rewards
- Get Staked Balance
- Get Pool APR/TVL

### Farming (12 operations)
LP token farming with boost support.

- Get Farms
- Stake/Unstake LP
- Harvest CAKE
- Get Boosted APR
- Get Boost Multiplier

### IFO (8 operations)
Initial Farm Offering participation.

- Get Active/Past IFOs
- Commit CAKE
- Claim Tokens
- Get Participation Status

### Lottery (9 operations)
CAKE lottery participation.

- Get Current Lottery
- Buy Tickets
- Check Winning Numbers
- Claim Prize

### Prediction (10 operations)
Price prediction markets.

- Get Current Round
- Enter Bull/Bear Position
- Claim Winnings
- Get User Stats

### NFT Marketplace (12 operations)
Pancake Squad and Bunnies NFTs.

- Get Collections
- Buy/Sell/List NFTs
- Make/Accept Offers
- Get Floor Price

### Pottery (7 operations)
Prize savings with CAKE.

- Get Pottery Info
- Deposit CAKE
- Claim Prize
- Get Drawing Schedule

### Perpetuals (13 operations)
Perpetual futures trading (up to 150x leverage).

- Get Markets
- Open/Close Position
- Get Funding Rate
- Get Liquidation Price
- Add/Remove Margin

### veCAKE (11 operations)
Vote-escrow CAKE governance.

- Get veCAKE Balance
- Lock CAKE (1-208 weeks)
- Extend Lock
- Vote for Gauge
- Get Emission Rate

### Governance (7 operations)
DAO proposal voting.

- Get Proposals
- Vote on Proposal
- Get Voting Power
- Get Quorum

### Cross-Chain (6 operations)
Bridge tokens between networks.

- Get Bridge Quote
- Bridge Tokens
- Get Bridge Status
- Get Supported Chains/Tokens

### Analytics (10 operations)
Protocol-wide statistics.

- Get Protocol TVL/Volume
- Get Pool/Farm/Token Rankings
- Get Historical Data
- Export Data (CSV/JSON)

### Subgraph (8 operations)
GraphQL data queries.

- Query Pools/Pairs/Positions
- Query Swaps/Farms/Tokens
- Custom GraphQL Query
- Get Subgraph Status

### Utility (10 operations)
Helper utilities.

- Get Contract Addresses
- Calculate Price from Tick
- Encode/Decode Path
- Calculate Slippage
- Estimate Gas

## Trigger Node

Real-time event monitoring with 50+ event types:

### Swap Triggers
- Swap Executed
- Large Swap Alert (threshold-based)
- Price Impact Alert
- Swap on Pool
- Arbitrage Opportunity

### Pool Triggers
- Pool Created
- Liquidity Added/Removed
- TVL Changed
- APR Changed

### Position Triggers
- Position Minted/Changed/Burned
- Fees Collected
- Out of Range Alert

### Farm Triggers
- Farm Created/Updated
- LP Staked/Unstaked
- Rewards Harvested
- Boost Changed

### CAKE Triggers
- CAKE Staked/Unstaked
- veCAKE Locked/Extended
- Rewards Claimed

### IFO Triggers
- IFO Started/Ended
- CAKE Committed
- Tokens Claimed

### Lottery Triggers
- Round Started/Ended
- Ticket Purchased
- Prize Claimed

### Prediction Triggers
- Round Started/Ended
- Position Entered
- Winning Claimed
- Oracle Updated

### Perpetuals Triggers
- Position Opened/Closed
- Position Liquidated
- Funding Paid

### Price Triggers
- Price Changed
- Price Alert
- Significant Move

## Usage Examples

### Get Swap Quote

```javascript
// Get best quote for swapping BNB to CAKE
{
  "resource": "quote",
  "operation": "getBestQuote",
  "tokenIn": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  "tokenOut": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE
  "amountIn": "1000000000000000000", // 1 BNB
  "network": "bsc"
}
```

### Execute Swap

```javascript
// Swap BNB for CAKE with 0.5% slippage
{
  "resource": "swap",
  "operation": "executeSwap",
  "tokenIn": "WBNB",
  "tokenOut": "CAKE",
  "amountIn": "1000000000000000000",
  "slippage": 0.5,
  "network": "bsc"
}
```

### Add V3 Liquidity

```javascript
// Mint new V3 position with custom range
{
  "resource": "liquidityV3",
  "operation": "mintPosition",
  "token0": "WBNB",
  "token1": "CAKE",
  "fee": 2500, // 0.25%
  "tickLower": -10000,
  "tickUpper": 10000,
  "amount0Desired": "1000000000000000000",
  "amount1Desired": "5000000000000000000",
  "network": "bsc"
}
```

### Stake CAKE in Syrup Pool

```javascript
// Stake CAKE for reward tokens
{
  "resource": "staking",
  "operation": "stakeCake",
  "poolId": 0,
  "amount": "100000000000000000000", // 100 CAKE
  "network": "bsc"
}
```

### Lock CAKE for veCAKE

```javascript
// Lock CAKE for 52 weeks
{
  "resource": "veCake",
  "operation": "lockCake",
  "amount": "1000000000000000000000", // 1000 CAKE
  "weeks": 52,
  "network": "bsc"
}
```

### Get Farm APR with Boost

```javascript
// Get farm APR with veCAKE boost
{
  "resource": "farming",
  "operation": "getBoostedAPR",
  "farmId": 2,
  "userAddress": "0x...",
  "network": "bsc"
}
```

## PancakeSwap DeFi Concepts

### V2 AMM (Constant Product)
Traditional AMM using x*y=k formula. 0.25% fee split: 0.17% to LPs, 0.03% treasury, 0.05% CAKE burn.

### V3 Concentrated Liquidity
Tick-based liquidity with custom price ranges. Price = 1.0001^tick. Fee tiers: 0.01%, 0.05%, 0.25%, 1%.

### StableSwap
Curve-style AMM for stable assets with low slippage. Uses amplification coefficient for price stability. 0.04% fee.

### veCAKE (Vote-Escrow)
Lock CAKE for 1-208 weeks to receive veCAKE. Linear decay over lock period. Powers governance voting and farm boosts up to 2.5x.

### Farm Boost
veCAKE holders receive boosted farming rewards. Multiplier: 1x base up to 2.5x max based on veCAKE/LP ratio.

### Smart Router
Finds optimal route across V2, V3, and StableSwap. Supports multi-hop and split routes for best execution.

### Gauge Voting
veCAKE holders vote to direct CAKE emissions to farms. Weekly gauge weight determines reward allocation.

## Networks

| Network | Chain ID | Native Token | Explorer |
|---------|----------|--------------|----------|
| BNB Chain (BSC) | 56 | BNB | bscscan.com |
| Ethereum | 1 | ETH | etherscan.io |
| Arbitrum One | 42161 | ETH | arbiscan.io |
| Base | 8453 | ETH | basescan.org |
| zkSync Era | 324 | ETH | explorer.zksync.io |
| Linea | 59144 | ETH | lineascan.build |
| Polygon zkEVM | 1101 | ETH | zkevm.polygonscan.com |
| opBNB | 204 | BNB | opbnbscan.com |

## Error Handling

The node provides detailed error messages for common issues:

- **Insufficient Balance**: Check wallet balance before transactions
- **Price Impact Too High**: Reduce swap size or increase slippage
- **Pool Not Found**: Verify token addresses and fee tier
- **Slippage Exceeded**: Transaction reverted due to price movement
- **Position Out of Range**: V3 position no longer earning fees
- **Lock Expired**: veCAKE lock has ended

## Security Best Practices

1. **Never share private keys** - Use environment variables
2. **Set appropriate slippage** - Default 0.5%, max 5% for volatile pairs
3. **Verify token addresses** - Use official PancakeSwap token list
4. **Check price impact** - Avoid swaps with >5% impact
5. **Use deadlines** - Set transaction deadline to prevent stale trades
6. **Monitor positions** - V3 positions go out of range
7. **Verify farm addresses** - Only stake in official PancakeSwap farms

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [GitHub Wiki](https://github.com/Velocity-BPA/n8n-nodes-pancakeswap/wiki)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-pancakeswap/issues)
- **Discord**: [Velocity BPA Community](https://discord.gg/velocitybpa)

## Acknowledgments

- [PancakeSwap](https://pancakeswap.finance/) - DEX protocol
- [n8n](https://n8n.io/) - Workflow automation platform
- [ethers.js](https://docs.ethers.org/) - Ethereum library
- [The Graph](https://thegraph.com/) - Subgraph indexing
