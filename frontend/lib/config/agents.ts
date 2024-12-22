export interface DeFiAgent {
    id: string;
    name: string;
    type: string;
    avatar: string;
    capabilities: string[];
    protocols: string[];
    description: string;
}

export const DEFI_AGENTS: DeFiAgent[] = [
    {
        id: "trading",
        name: "Trading Agent",
        type: "trading",
        avatar: "/agent_trader.png",
        capabilities: ["Perp trading", "Take profit/Stop loss", "Position sizing"],
        protocols: ["Jupiter", "Mango Markets"],
        description: "Specialized in analyzing market conditions and executing optimal trading strategies"
    },
    {
        id: "lending",
        name: "Lending Agent",
        type: "lending",
        avatar: "/agent_analyst.png",
        capabilities: ["Lend assets", "Monitor positions", "Auto-rebalance"],
        protocols: ["Meteora", "Solend"],
        description: "Manages lending positions and optimizes lending strategies on Solana protocols"
    },
    {
        id: "staking",
        name: "Staking Agent",
        type: "staking",
        avatar: "/agent_researcher.png",
        capabilities: ["Stake SOL", "Monitor rewards", "Auto-compound"],
        protocols: ["Marinade", "Lido"],
        description: "Handles Solana staking operations and maximizes staking yields"
    },
    {
        id: "liquidity",
        name: "Liquidity Agent",
        type: "liquidity",
        avatar: "/agent_liquidity.png",
        capabilities: ["Launch tokens", "Manage liquidity", "Stake-to-earn"],
        protocols: ["Orca", "Raydium"],
        description: "Expert in managing liquidity pools and optimizing yield strategies"
    },
    {
        id: "research",
        name: "Research Agent",
        type: "research",
        avatar: "/agent_researcher.png",
        capabilities: ["Market analysis", "Protocol research", "Risk assessment"],
        protocols: ["DeFi Llama", "Token Terminal"],
        description: "Provides in-depth analysis and research on DeFi protocols and market trends"
    },
    {
        id: "portfolio",
        name: "Portfolio Manager",
        type: "portfolio",
        avatar: "/agent_analyst.png",
        capabilities: ["Portfolio optimization", "Risk management", "Asset allocation"],
        protocols: ["All supported protocols"],
        description: "Manages and optimizes your DeFi portfolio across multiple protocols"
    },
    {
        id: "defi-analytics",
        name: "DeFi Analytics",
        type: "analytics",
        avatar: "/agent_default.png",
        capabilities: ["TVL tracking", "Yield analysis", "Protocol comparison"],
        protocols: ["DeFi Llama"],
        description: "Provides comprehensive DeFi market analysis using DeFiLlama data"
    }
]; 