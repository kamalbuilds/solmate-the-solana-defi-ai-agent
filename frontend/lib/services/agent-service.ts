import { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

export class DeFiAgentService {
    private agent: SolanaAgentKit;

    constructor(privateKey: string, rpcUrl?: string) {
        this.agent = new SolanaAgentKit(
            privateKey,
            rpcUrl || process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
            process.env["OPENAI_API_KEY"] as string
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
    async createOrcaWhirlpool(tokenA: string, tokenB: string, feeTier: number) {
        return await this.agent.createOrcaSingleSidedWhirlpool({
            tokenMintA: new PublicKey(tokenA),
            tokenMintB: new PublicKey(tokenB),
            feeTier
        });
    }
} 