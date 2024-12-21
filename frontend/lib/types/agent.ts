import { PublicKey } from "@solana/web3.js";

export interface DeFiAgent {
    id: string;
    name: string;
    type: "lending" | "trading" | "staking" | "liquidity";
    avatar: string;
    capabilities: string[];
    protocols: string[];
}

export interface AgentPosition {
    protocol: string;
    type: string;
    tokenMint: PublicKey;
    amount: number;
    value: number;
    apy?: number;
    leverage?: number;
} 