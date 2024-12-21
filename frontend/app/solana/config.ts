import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";

export const initializeSolanaAgent = async (config: {
    privateKey: string;
    openAiKey: string;
    rpcUrl?: string;
}) => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const agent = new SolanaAgentKit(
            config.privateKey,
            config.rpcUrl || "https://api.mainnet-beta.solana.com",
            config.openAiKey
        );

        const tools = createSolanaTools(agent);

        return {
            agent,
            tools,
            llm: new ChatOpenAI({
                apiKey: config.openAiKey,
                modelName: "gpt-4-turbo-preview",
                temperature: 0.2
            })
        };
    } catch (error) {
        console.error("Solana agent initialization failed:", error);
        return null;
    }
}; 