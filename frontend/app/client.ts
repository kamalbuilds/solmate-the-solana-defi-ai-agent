"use client";
import { ThirdwebClient } from '@thirdweb-dev/sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { ValidationResult, PortfolioAnalysis } from './contracts/abis';
import { SolanaAgentKit } from "solana-agent-kit";

export interface SolanaClient {
    connection: Connection;
    getBalance(address: string): Promise<number>;
    getTokenBalance(tokenMint: string, ownerAddress: string): Promise<number>;
    swapTokens(params: {
        inputMint: string;
        outputMint: string;
        amount: number;
        slippage?: number;
    }): Promise<string>;
}

export interface AIClient extends ThirdwebClient {
    solana: SolanaClient;
    analyzePortfolioValidations(validations: ValidationResult[]): Promise<PortfolioAnalysis>;
}

export const client = new ThirdwebClient({
    clientId: process.env["NEXT_PUBLIC_THIRDWEB_CLIENT_ID"] as string,
}) as AIClient;

// Initialize Solana client
client.solana = {
    connection: new Connection(
        process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] || "https://api.mainnet-beta.solana.com"
    ),

    async getBalance(address: string) {
        const pubkey = new PublicKey(address);
        return await this.connection.getBalance(pubkey);
    },

    async getTokenBalance(tokenMint: string, ownerAddress: string) {
        // Implementation for getting SPL token balance
        return 0; // TODO: Implement
    },

    async swapTokens(params) {
        // Implementation for Jupiter DEX integration
        return "tx_signature"; // TODO: Implement
    }
};

// Implement the analyze method
client.analyzePortfolioValidations = async (validations: ValidationResult[]): Promise<PortfolioAnalysis> => {
    const analysis = await fetch('/api/analyze-portfolio', {
        method: 'POST',
        body: JSON.stringify({ validations })
    }).then(res => res.json());

    return analysis;
};

export const agentKit = new SolanaAgentKit(
    process.env["NEXT_PUBLIC_SOLANA_PRIVATE_KEY"] as string,
    process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
    process.env["NEXT_PUBLIC_OPENAI_API_KEY"] as string
);