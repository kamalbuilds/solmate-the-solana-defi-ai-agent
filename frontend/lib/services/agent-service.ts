import { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import Decimal from "decimal.js";

export class DeFiAgentService {
    private agent: SolanaAgentKit;

    constructor(privateKey: string, rpcUrl?: string) {
        this.agent = new SolanaAgentKit(
            privateKey,
            rpcUrl || process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
            process.env["NEXT_PUBLIC_OPENAI_API_KEY"] as string
        );
    }

    // Lending operations
    async lendAssets(assetMint: string, amount: number) {
        return await this.agent.lendAssets(new PublicKey(assetMint), amount);
    }

    // Trading operations 
    async trade(outputMint: string, inputAmount: number, inputMint?: string, slippageBps?: number) {
        return await this.agent.trade(
            new PublicKey(outputMint),
            inputAmount,
            inputMint ? new PublicKey(inputMint) : undefined,
            slippageBps
        );
    }

    // Staking operations
    async stake(amount: number) {
        return await this.agent.stake(amount);
    }

    // Liquidity operations
    async createOrcaWhirlpool(
        depositTokenAmount: BN,
        tokenA: string,
        tokenB: string,
        initialPrice: Decimal,
        maxPrice: Decimal,
        feeTier: 1 | 0.01 | 0.02 | 0.04 | 0.05 | 0.16 | 0.3 | 0.65 | 2
    ) {
        return await this.agent.createOrcaSingleSidedWhirlpool(
            depositTokenAmount,
            new PublicKey(tokenA),
            new PublicKey(tokenB),
            initialPrice,
            maxPrice,
            feeTier
        );
    }
} 