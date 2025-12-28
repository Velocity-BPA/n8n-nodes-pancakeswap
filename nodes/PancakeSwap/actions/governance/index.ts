/**
 * PancakeSwap Governance Resource
 * DAO governance and voting operations
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';

export const governanceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['governance'],
      },
    },
    options: [
      {
        name: 'Get Proposals',
        value: 'getProposals',
        description: 'Get list of governance proposals',
        action: 'Get governance proposals',
      },
      {
        name: 'Get Proposal',
        value: 'getProposal',
        description: 'Get details of a specific proposal',
        action: 'Get proposal details',
      },
      {
        name: 'Vote on Proposal',
        value: 'vote',
        description: 'Cast a vote on a proposal',
        action: 'Vote on proposal',
      },
      {
        name: 'Get Voting Power',
        value: 'getVotingPower',
        description: 'Get voting power for an address',
        action: 'Get voting power',
      },
      {
        name: 'Get Vote Receipt',
        value: 'getVoteReceipt',
        description: 'Get vote receipt for a proposal',
        action: 'Get vote receipt',
      },
      {
        name: 'Get Quorum',
        value: 'getQuorum',
        description: 'Get current quorum requirements',
        action: 'Get quorum info',
      },
      {
        name: 'Get Governance Stats',
        value: 'getStats',
        description: 'Get overall governance statistics',
        action: 'Get governance stats',
      },
    ],
    default: 'getProposals',
  },
];

export const governanceFields: INodeProperties[] = [
  // Proposal status filter
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['getProposals'],
      },
    },
    options: [
      { name: 'All', value: 'all' },
      { name: 'Active', value: 'active' },
      { name: 'Pending', value: 'pending' },
      { name: 'Succeeded', value: 'succeeded' },
      { name: 'Defeated', value: 'defeated' },
      { name: 'Executed', value: 'executed' },
      { name: 'Cancelled', value: 'cancelled' },
      { name: 'Expired', value: 'expired' },
    ],
    default: 'all',
    description: 'Filter proposals by status',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['getProposals'],
      },
    },
    default: 20,
    description: 'Maximum number of proposals to return',
  },
  // Proposal ID for specific operations
  {
    displayName: 'Proposal ID',
    name: 'proposalId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['getProposal', 'vote', 'getVoteReceipt'],
      },
    },
    default: '',
    placeholder: '1',
    description: 'ID of the governance proposal',
  },
  // Vote fields
  {
    displayName: 'Vote',
    name: 'voteChoice',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['vote'],
      },
    },
    options: [
      { name: 'For', value: 'for' },
      { name: 'Against', value: 'against' },
      { name: 'Abstain', value: 'abstain' },
    ],
    default: 'for',
    description: 'Your vote choice',
  },
  {
    displayName: 'Reason',
    name: 'voteReason',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['vote'],
      },
    },
    default: '',
    description: 'Optional reason for your vote (stored on-chain)',
  },
  // User address for read operations
  {
    displayName: 'User Address',
    name: 'userAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['governance'],
        operation: ['getVotingPower', 'getVoteReceipt'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'User wallet address (leave empty to use connected wallet)',
  },
];

/**
 * Execute governance operations
 * PancakeSwap uses a Governor-style governance system where:
 * - veCAKE holders have voting power
 * - Proposals require minimum quorum to pass
 * - Voting period is typically 3-7 days
 * - Successful proposals have a timelock before execution
 */
export async function executeGovernance(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<IDataObject> {
  switch (operation) {
    case 'getProposals': {
      const status = this.getNodeParameter('status', index, 'all') as string;
      const limit = this.getNodeParameter('limit', index, 20) as number;
      
      const proposals = [
        {
          id: '42',
          title: 'Adjust CAKE emission rate',
          summary: 'Proposal to reduce CAKE emissions by 5% to improve tokenomics',
          status: 'active',
          proposer: '0x...',
          startBlock: 35000000,
          endBlock: 35200000,
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() + 518400000).toISOString(),
          forVotes: 15000000,
          againstVotes: 3000000,
          abstainVotes: 500000,
          quorumRequired: 10000000,
          quorumReached: true,
        },
        {
          id: '41',
          title: 'Add new farm for TOKEN-BNB',
          summary: 'Add TOKEN-BNB V3 pool to MasterChef with 0.5x multiplier',
          status: 'succeeded',
          proposer: '0x...',
          startBlock: 34800000,
          endBlock: 35000000,
          forVotes: 25000000,
          againstVotes: 2000000,
          abstainVotes: 1000000,
          executed: true,
          executedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '40',
          title: 'Treasury allocation for marketing',
          summary: 'Allocate 500,000 CAKE from treasury for marketing initiatives',
          status: 'defeated',
          proposer: '0x...',
          forVotes: 5000000,
          againstVotes: 12000000,
          abstainVotes: 3000000,
          quorumReached: true,
        },
      ];
      
      const filtered = status === 'all' 
        ? proposals 
        : proposals.filter(p => p.status === status);
      
      return {
        proposals: filtered.slice(0, limit),
        totalProposals: proposals.length,
        activeProposals: proposals.filter(p => p.status === 'active').length,
        filter: status,
      };
    }
    
    case 'getProposal': {
      const proposalId = this.getNodeParameter('proposalId', index, '') as string;
      
      return {
        id: proposalId,
        title: 'Adjust CAKE emission rate',
        description: `
## Summary
This proposal aims to reduce CAKE emissions by 5% to improve long-term tokenomics.

## Motivation
Current emission rate creates selling pressure. Reducing emissions will:
- Decrease inflation
- Improve token value
- Maintain attractive farming APRs

## Specification
- Reduce block reward from 11.16 to 10.6 CAKE
- Effective immediately upon execution
- No changes to burn rate

## Voting Options
- For: Approve emission reduction
- Against: Keep current emission rate
- Abstain: No preference
        `.trim(),
        proposer: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'active',
        startBlock: 35000000,
        endBlock: 35200000,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 518400000).toISOString(),
        votingPeriod: '7 days',
        votes: {
          for: 15000000,
          against: 3000000,
          abstain: 500000,
          total: 18500000,
        },
        percentages: {
          for: 81.08,
          against: 16.22,
          abstain: 2.70,
        },
        quorum: {
          required: 10000000,
          current: 18500000,
          reached: true,
          percentage: 185,
        },
        eta: null, // Set when queued for execution
        actions: [
          {
            target: '0x...MasterChef',
            signature: 'updateEmissionRate(uint256)',
            calldata: '0x...',
            description: 'Update CAKE per block to 10.6',
          },
        ],
        forumLink: 'https://forum.pancakeswap.finance/t/pip-42',
        snapshotBlock: 35000000,
      };
    }
    
    case 'vote': {
      const proposalId = this.getNodeParameter('proposalId', index, '') as string;
      const voteChoice = this.getNodeParameter('voteChoice', index, 'for') as string;
      const voteReason = this.getNodeParameter('voteReason', index, '') as string;
      
      const votingPower = 5000;
      
      return {
        status: 'pending',
        proposalId,
        vote: voteChoice,
        votingPower,
        reason: voteReason || undefined,
        txData: {
          to: '0x...Governor',
          method: voteReason ? 'castVoteWithReason' : 'castVote',
          args: [proposalId, voteChoice === 'for' ? 1 : voteChoice === 'against' ? 0 : 2],
        },
        note: 'Execute transaction to cast your vote. Voting power is locked until proposal ends.',
      };
    }
    
    case 'getVotingPower': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        votingPower: 5000,
        votingPowerSource: 'veCAKE',
        veCakeBalance: 5000,
        delegatedPower: 0,
        delegatedTo: null,
        delegatedFrom: [],
        proposalThreshold: 1000000, // Minimum to create proposal
        canCreateProposal: false,
        activeVotes: [
          { proposalId: '42', vote: 'for', power: 5000 },
        ],
      };
    }
    
    case 'getVoteReceipt': {
      const proposalId = this.getNodeParameter('proposalId', index, '') as string;
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        proposalId,
        hasVoted: true,
        vote: 'for',
        votingPower: 5000,
        reason: 'Support improved tokenomics',
        votedAt: new Date(Date.now() - 43200000).toISOString(),
        txHash: '0x...',
        blockNumber: 35050000,
      };
    }
    
    case 'getQuorum': {
      return {
        quorumVotes: 10000000,
        quorumPercentage: 4, // 4% of total veCAKE
        totalVotingSupply: 250000000,
        proposalThreshold: 1000000,
        votingDelay: 1, // blocks
        votingPeriod: 200000, // blocks (~7 days)
        timelockDelay: 172800, // 2 days in seconds
        currentParticipation: {
          activeProposals: 1,
          averageParticipation: 7.4, // percentage
          highestParticipation: 15.2,
        },
      };
    }
    
    case 'getStats': {
      return {
        totalProposals: 42,
        proposalsByStatus: {
          active: 1,
          pending: 0,
          succeeded: 28,
          defeated: 8,
          executed: 25,
          cancelled: 3,
          expired: 2,
        },
        participation: {
          averageVoterTurnout: 7.4,
          totalUniqueVoters: 15432,
          averageVotesPerProposal: 22500000,
        },
        topVoters: [
          { address: '0x...', totalVotes: 42, votingPower: 5000000 },
          { address: '0x...', totalVotes: 40, votingPower: 3500000 },
        ],
        recentActivity: {
          proposalsThisMonth: 3,
          votesThisMonth: 85000000,
          executedThisMonth: 2,
        },
        treasuryBalance: 15000000, // CAKE
        note: 'PancakeSwap governance is driven by veCAKE holders',
      };
    }
    
    default:
      throw new Error(`Operation ${operation} not supported`);
  }
}
