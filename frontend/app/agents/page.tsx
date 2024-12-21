"use client";

import { DeFiAgent } from "@/lib/types/agent";
import DeFiAgentCard from "@/components/agents/DeFiAgentCard";

const DEFI_AGENTS: DeFiAgent[] = [
    {
        id: "lending-1",
        name: "Lending Agent",
        type: "lending",
        avatar: "/agent_default.png",
        capabilities: ["Lend assets", "Monitor positions", "Auto-rebalance"],
        protocols: ["Meteora", "Solend"]
    },
    {
        id: "trading-1",
        name: "Trading Agent",
        type: "trading",
        avatar: "/agent_trader.png",
        capabilities: ["Perp trading", "Take profit/Stop loss", "Position sizing"],
        protocols: ["Jupiter", "Mango Markets"]
    },
    {
        id: "liquidity-1",
        name: "Liquidity Agent",
        type: "liquidity",
        avatar: "/agent_liquidity.png",
        capabilities: ["Launch tokens", "Manage liquidity", "Stake-to-earn"],
        protocols: ["Orca", "Raydium"]
    }
];

export default function AgentsPage() {
    const handleSelectAgent = (agent: DeFiAgent) => {
        // Handle agent selection
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">DeFi Agents</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEFI_AGENTS.map(agent => (
                    <DeFiAgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={handleSelectAgent}
                    />
                ))}
            </div>
        </div>
    );
} 