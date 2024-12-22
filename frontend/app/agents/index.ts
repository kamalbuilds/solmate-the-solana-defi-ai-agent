import {
    type BrianAgentOptions,
    BrianToolkit,
    XMTPCallbackHandler,
} from "@brian-ai/langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { ChatXAI } from "@langchain/xai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatMessageHistory } from "langchain/memory";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { FunctorService } from '../services/functorService';
import { KestraService } from '../services/kestraService';
import { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";
import { SolanaAssistant } from "@/lib/agents/research-agent";
// Initialize Kestra service
const kestraService = new KestraService();

// Message history store
const store: Record<string, ChatMessageHistory> = {};

function getMessageHistory(sessionId: string) {
    if (!(sessionId in store)) {
        store[sessionId] = new ChatMessageHistory();
    }
    return store[sessionId];
}

// DeFiLlama Tools Definition
const defiLlamaToolkit = {
    getTVLTool: new DynamicStructuredTool({
        name: "get_protocol_tvl",
        description: "Get current and historical TVL data for a protocol",
        schema: z.object({
            protocol: z.string().describe("Protocol name/slug"),
        }),
        func: async ({ protocol }) => {
            const response = await fetch(`https://api.llama.fi/protocol/${protocol}`);

            console.log(response, "response from the api");
            const data = await response.json();
            return JSON.stringify({
                name: data.name,
                tvl: data.tvl,
                chainTvls: data.chainTvls,
                currentChainTvls: data.currentChainTvls,
            });
        },
    }),

    getYieldsTool: new DynamicStructuredTool({
        name: "get_yield_pools",
        description: "Get yield/APY data for DeFi pools",
        schema: z.object({
            chain: z.string().optional().describe("Optional chain filter"),
        }),
        func: async ({ chain }) => {
            const response = await fetch("https://yields.llama.fi/pools");
            const data = await response.json();
            const pools = data.data
                .filter((pool: any) => !chain || pool.chain === chain)
                .slice(0, 10)
                .map((pool: any) => ({
                    chain: pool.chain,
                    project: pool.project,
                    symbol: pool.symbol,
                    tvlUsd: pool.tvlUsd,
                    apy: pool.apy,
                }));
            return JSON.stringify(pools);
        },
    }),

    getDexVolumesTool: new DynamicStructuredTool({
        name: "get_dex_volumes",
        description: "Get DEX trading volume data",
        schema: z.object({
            chain: z.string().optional().describe("Optional chain filter"),
        }),
        func: async ({ chain }) => {
            const endpoint = chain ?
                `https://api.llama.fi/overview/dexs/${chain}` :
                'https://api.llama.fi/overview/dexs';
            const response = await fetch(endpoint);
            const data = await response.json();
            const volumes = data.protocols
                .slice(0, 10)
                .map((dex: any) => ({
                    name: dex.name,
                    chain: dex.chain,
                    dailyVolume: dex.dailyVolume,
                    totalVolume: dex.totalVolume,
                }));
            return JSON.stringify(volumes);
        },
    }),
};

// Tools Definition
const coingeckoTool = new DynamicStructuredTool({
    name: "get_token_price",
    description: "Get the current price of any cryptocurrency token",
    schema: z.object({
        tokenId: z.string().describe("The token ID from CoinGecko"),
    }),
    func: async ({ tokenId }) => {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${tokenId}`,
                {
                    headers: {
                        "x-cg-demo-api-key": process.env["NEXT_PUBLIC_COINGECKO_API_KEY"]!,
                    },
                }
            );
            const data = await response.json();
            return `${tokenId.toUpperCase()} price: $${data.market_data.current_price.usd}`;
        } catch (error) {
            return `Error fetching ${tokenId} price`;
        }
    },
});


// Add Solana tools
const solanaTools = {
    lendingTool: new DynamicStructuredTool({
        name: "solana_lend_assets",
        description: "Lend assets on Solana protocols like Meteora",
        schema: z.object({
            assetMint: z.string().describe("Token mint address"),
            amount: z.number().describe("Amount to lend"),
            protocol: z.enum(["meteora", "solend"]).describe("Lending protocol to use")
        }),
        func: async ({ assetMint, amount, protocol }) => {
            const solanaAgent = new SolanaAgentKit(
                process.env["NEXT_PUBLIC_SOLANA_PRIVATE_KEY"] as string,
                process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
                process.env["NEXT_PUBLIC_OPENAI_API_KEY"] as string
            );
            return await solanaAgent.lendAssets(new PublicKey(assetMint), amount);
        }
    }),

    tradingTool: new DynamicStructuredTool({
        name: "solana_trade_tokens",
        description: "Execute token swaps on Jupiter Exchange",
        schema: z.object({
            outputMint: z.string().describe("Output token mint address"),
            inputAmount: z.number().describe("Input amount"),
            inputMint: z.string().optional().describe("Input token mint address"),
            slippageBps: z.number().optional().describe("Slippage in basis points")
        }),

        func: async ({ outputMint, inputAmount, inputMint, slippageBps }) => {
            const solanaAgent = new SolanaAgentKit(
                process.env["NEXT_PUBLIC_SOLANA_PRIVATE_KEY"] as string,
                process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
                process.env["NEXT_PUBLIC_OPENAI_API_KEY"] as string
            );
            return await solanaAgent.trade(
                new PublicKey(outputMint),
                inputAmount,
                inputMint ? new PublicKey(inputMint) : undefined,
                slippageBps
            );
        }
    }),

    stakingTool: new DynamicStructuredTool({
        name: "solana_stake",
        description: "Stake SOL tokens",
        schema: z.object({
            amount: z.number().describe("Amount of SOL to stake")
        }),
        func: async ({ amount }) => {
            const solanaAgent = new SolanaAgentKit(
                process.env["NEXT_PUBLIC_SOLANA_PRIVATE_KEY"] as string,
                process.env["NEXT_PUBLIC_SOLANA_RPC_URL"] as string,
                process.env["NEXT_PUBLIC_OPENAI_API_KEY"] as string
            );
            return await solanaAgent.stake(amount);
        }
    })
};

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    description: string;
    capabilities: string[];
    protocols: string[];
    agent: RunnableWithMessageHistory<Record<string, any>, ChainValues>;
}

export const createSpecializedAgents = async (baseOptions: BrianAgentOptions): Promise<Agent[]> => {
    // Trading Agent
    const tradingAgent = await createAgent({
        ...baseOptions,
        tools: [
            coingeckoTool,
            solanaTools.tradingTool,
            defiLlamaToolkit.getTVLTool
        ],
        instructions: "You are a trading specialist with Solana DeFi capabilities. Help users execute trades and analyze opportunities.",
    });

    // Research Agent
    const researchAgent = await createAgent({
        ...baseOptions,
        tools: [
            coingeckoTool,
            defiLlamaToolkit.getTVLTool,
            defiLlamaToolkit.getYieldsTool
        ],
        instructions: "You are a DeFi research specialist. Provide in-depth analysis of protocols, markets, and trends.",
    });

    // Liquidity Agent
    const liquidityAgent = await createAgent({
        ...baseOptions,
        tools: [
            solanaTools.lendingTool,
            defiLlamaToolkit.getYieldsTool
        ],
        instructions: "You are a liquidity management specialist. Help users manage liquidity pools and optimize yield strategies.",
    });

    // Portfolio Agent
    const portfolioAgent = await createAgent({
        ...baseOptions,
        tools: [
            coingeckoTool,
            defiLlamaToolkit.getTVLTool,
            new DynamicStructuredTool({
                name: "execute_cross_chain_rebalance",
                description: "Execute portfolio rebalancing across multiple chains",
                schema: z.object({
                    operations: z.array(z.object({
                        sourceChain: z.string(),
                        targetChain: z.string(),
                        amount: z.string(),
                        denom: z.string(),
                        targetAddress: z.string()
                    }))
                }),
            })
        ],
        instructions: "You are a portfolio management specialist with cross-chain orchestration capabilities. Help users optimize their portfolio allocation.",
    });

    // DeFi Analytics Agent
    const defiAnalyticsAgent = await createAgent({
        ...baseOptions,
        tools: Object.values(defiLlamaToolkit),
        instructions: `You are a DeFi analytics specialist powered by DeFiLlama data.
            You can:
            - Track TVL across protocols and chains
            - Analyze yield opportunities and APY trends
            - Monitor DEX volumes and trading activity
            - Compare different protocols and chains
            Always provide data-driven insights and recommendations.`,
    });

    const solanaLendingAgent = await createAgent({
        ...baseOptions,
        tools: [solanaTools.lendingTool, defiLlamaToolkit.getYieldsTool],
        instructions: "You are a lending specialist on Solana. Help users find and execute lending opportunities.",
    });

    const solanaStakingAgent = await createAgent({
        ...baseOptions,
        tools: [solanaTools.stakingTool, defiLlamaToolkit.getTVLTool],
        instructions: "You are a staking specialist on Solana. Help users find and execute staking opportunities.",
    });


    return [
        {
            id: "trading",
            name: "Trading Agent",
            type: "trading",
            status: "active",
            description: "Specialized in analyzing market conditions and executing optimal trading strategies",
            capabilities: ["Perp trading", "Take profit/Stop loss", "Position sizing"],
            protocols: ["Jupiter", "Mango Markets"],
            agent: tradingAgent
        },
        {
            id: "research",
            name: "Research Agent",
            type: "research",
            status: "active",
            description: "Provides in-depth analysis and research on DeFi protocols and market trends",
            capabilities: ["Market analysis", "Protocol research", "Risk assessment"],
            protocols: ["DeFi Llama", "Token Terminal"],
            agent: researchAgent
        },
        {
            id: "liquidity",
            name: "Liquidity Agent",
            type: "liquidity",
            status: "active",
            description: "Expert in managing liquidity pools and optimizing yield strategies on solana",
            capabilities: ["Launch tokens", "Manage liquidity", "Stake-to-earn"],
            protocols: ["Orca", "Raydium"],
            agent: liquidityAgent
        },
        {
            id: "portfolio",
            name: "Portfolio Manager",
            type: "portfolio",
            status: "active",
            description: "Manages and optimizes your DeFi portfolio across multiple protocols on solana",
            capabilities: ["Portfolio optimization", "Risk management", "Asset allocation"],
            protocols: ["All supported protocols"],
            agent: portfolioAgent
        },
        {
            id: "defi-analytics",
            name: "DeFi Analytics",
            type: "analytics",
            status: "active",
            description: "Provides comprehensive DeFi market analysis using DeFiLlama data",
            capabilities: ["TVL tracking", "Yield analysis", "Protocol comparison"],
            protocols: ["DeFi Llama"],
            agent: defiAnalyticsAgent
        },
        {
            id: "lending",
            name: "Lending Agent",
            type: "lending",
            status: "active",
            description: "Manages lending positions and optimizes lending strategies on Solana protocols",
            capabilities: ["Lend assets", "Monitor positions", "Auto-rebalance"],
            protocols: ["Meteora", "Solend"],
            agent: solanaLendingAgent
        },
        {
            id: "staking",
            name: "Staking Agent",
            type: "staking",
            status: "active",
            description: "Handles Solana staking operations and maximizes staking yields",
            capabilities: ["Stake SOL", "Monitor rewards", "Auto-compound"],
            protocols: ["Marinade", "Lido"],
            agent: solanaStakingAgent
        },
        {
            id: "solana-assistant",
            name: "Solana Assistant",
            type: "solana",
            status: "active",
            description: "General-purpose Solana blockchain assistant",
            capabilities: ["Chain analysis", "Transaction help", "Protocol guidance"],
            protocols: ["Solana"],
            agent: SolanaAssistant
        }
    ];
};

// Base Agent Creation Function
const createAgent = async ({
    apiKey,
    privateKeyOrAccount,
    llm,
    tools = [],
    instructions,
    apiUrl,
    xmtpHandler,
    xmtpHandlerOptions,
}: BrianAgentOptions & { tools?: DynamicStructuredTool[] }) => {

    const brianToolkit = new BrianToolkit({
        apiKey,
        apiUrl,
        privateKeyOrAccount,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", instructions],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]);

    // Initialize Functor Network integration
    const functorTools = [
        new DynamicStructuredTool({
            name: "create_smart_account",
            description: "Create a smart account using Functor Network",
            schema: z.object({
                owner: z.string(),
                recoveryMechanism: z.array(z.string()),
                paymaster: z.string()
            }),
            func: async ({ owner, recoveryMechanism, paymaster }) => {
                return await FunctorService.createSmartAccount({
                    owner,
                    recoveryMechanism,
                    paymaster
                });
            }
        }),
        // Add more Functor-specific tools as needed
    ];

    const agent = createToolCallingAgent({
        llm,
        tools: [...tools, ...functorTools, ...brianToolkit.tools],
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools: [...tools, ...functorTools, ...brianToolkit.tools],
        callbacks: xmtpHandler
            ? [new XMTPCallbackHandler(xmtpHandler, llm, instructions!, xmtpHandlerOptions)]
            : [],
    });

    return new RunnableWithMessageHistory({
        runnable: agentExecutor,
        getMessageHistory,
        inputMessagesKey: "input",
        historyMessagesKey: "chat_history",
    });
};

// Usage Example
export const initializeAgents = async () => {
    const baseOptions = {
        apiKey: process.env["NEXT_PUBLIC_BRIAN_API_KEY"]!,
        privateKeyOrAccount: process.env["NEXT_PUBLIC_PRIVATE_KEY"] as `0x${string}`,
        llm: new ChatOpenAI({
            apiKey: process.env["NEXT_PUBLIC_OPENAI_API_KEY"]!,
        }),
    };

    const agents = await createSpecializedAgents(baseOptions);
    return agents;
}; 