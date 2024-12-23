"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createBrianAgent } from "@brian-ai/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
import { BrianToolkit } from "@brian-ai/langchain";
import { AvalancheConfig } from "@brian-ai/langchain/chains";
import { initializeAgents } from "./agents";
import { SendHorizontal, Bot, User, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentCharacters } from "./agents/AgentCharacters";
import Image from 'next/image';

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface AgentState {
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  activeAgent: string | null;
  systemEvents: Array<{
    timestamp: string;
    event: string;
    agent?: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  message?: string;
  agent?: any;
  description?: string;
  capabilities?: string[];
  protocols?: string[];
}

// Add this interface for agent collaboration messages
interface CollaborationMessage extends Message {
  agentId?: string;
  agentName?: string;
  collaborationType?: 'question' | 'response' | 'suggestion' | 'decision';
}

// Add this near the top of the file with other constants
const EXAMPLE_RESPONSES = {
  "I have 100 SOL and want to optimize my yield across Solana DeFi protocols. What's the best strategy?": [
    // Initial Analysis
    {
      role: "assistant",
      content: "Analyzing optimal yield strategies for 100 SOL across Solana's DeFi ecosystem. Let me consult our specialized agents for a comprehensive analysis.",
      agentName: "Portfolio Manager",
      collaborationType: "analysis",
      timestamp: new Date().toLocaleTimeString()
    },
    // DeFi Analytics Agent Response
    {
      role: "assistant",
      content: "Current protocol metrics:\n- Marinade Finance stSOL APY: 6.8%\n- Solend USDC lending APY: 12.4%\n- Orca ORCA-SOL pool APR: 24.5%\n- Raydium RAY-SOL pool APR: 28.2%",
      agentName: "DeFi Analytics",
      collaborationType: "data",
      timestamp: new Date().toLocaleTimeString()
    },
    // Staking Agent Input
    {
      role: "assistant",
      content: "Liquid staking via Marinade offers the safest yield at 6.8% APY with instant liquidity through stSOL. This can be further utilized as collateral.",
      agentName: "Staking Agent",
      collaborationType: "suggestion",
      timestamp: new Date().toLocaleTimeString()
    },
    // Lending Agent Analysis
    {
      role: "assistant",
      content: "Solend's isolated lending pools show strong stability. Current optimal strategy: Supply stSOL as collateral to borrow USDC at 65% LTV, earning additional 5.2% on collateral.",
      agentName: "Lending Agent",
      collaborationType: "suggestion",
      timestamp: new Date().toLocaleTimeString()
    },
    // Liquidity Agent Input
    {
      role: "assistant",
      content: "Orca's concentrated liquidity pools for stSOL-SOL offer 15.3% APR with minimal IL risk. RAY-SOL provides higher APR but with increased volatility exposure.",
      agentName: "Liquidity Agent",
      collaborationType: "suggestion",
      timestamp: new Date().toLocaleTimeString()
    },
    // Final Portfolio Decision
    {
      role: "assistant",
      content: "Based on all inputs, here's the optimal allocation for your 100 SOL:\n\n1. 40 SOL → Marinade Finance (stSOL)\n2. Use stSOL as collateral on Solend to borrow USDC\n3. 30 SOL �� Orca stSOL-SOL concentrated liquidity pool\n4. 30 SOL → Split between Raydium RAY-SOL and ORCA-SOL pools\n\nEstimated total APY: 18.4%\nRisk Level: Moderate\n\nShall I proceed with this allocation?",
      agentName: "Portfolio Manager",
      collaborationType: "decision",
      timestamp: new Date().toLocaleTimeString()
    }
  ],
  "Ok proceed with this allocation but I have only 1 SOL to invest": [
    {
      role: "assistant",
      content: "I understand your concern. Let's adjust the allocation to fit your 1 SOL. I'll provide a new recommendation.",
      agentName: "Portfolio Manager",
      collaborationType: "suggestion",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      role: "assistant",
      content: "Based on your 1 SOL, I recommend the following:\n1. 1 SOL → Marinade Finance (stSOL)\n2. Use stSOL as collateral on Solend to borrow USDC\n3. 1 SOL → Orca stSOL-SOL concentrated liquidity pool\n4. 1 SOL → Split between Raydium RAY-SOL and ORCA-SOL pools\n\nEstimated total APY: 18.4%\nRisk Level: Moderate\n\nShall I proceed with this allocation?",
      agentName: "Portfolio Manager",
      collaborationType: "decision",
      timestamp: new Date().toLocaleTimeString()
    }

  ],
  "Find the best arbitrage opportunities between Jupiter and Orca for SOL-USDC pairs": [
    // Trading Agent Analysis
    {
      role: "assistant",
      content: "Analyzing price disparities and liquidity depths across Jupiter aggregator and Orca pools for SOL-USDC trading pairs.",
      agentName: "Trading Agent",
      collaborationType: "analysis",
      timestamp: new Date().toLocaleTimeString()
    },
    // DeFi Analytics Input
    {
      role: "assistant",
      content: "Current market data:\n- Jupiter best SOL/USDC: $101.25\n- Orca SOL/USDC CL pool: $101.45\n- 24h volume: $24.5M\n- Liquidity depth: 45,000 SOL",
      agentName: "DeFi Analytics",
      collaborationType: "data",
      timestamp: new Date().toLocaleTimeString()
    },
    // Research Agent Analysis
    {
      role: "assistant",
      content: "Historical spread analysis shows optimal execution during UTC 2-4AM. Average profitable spread: 0.15-0.3%. Current market volatility suggests increased opportunities.",
      agentName: "Research Agent",
      collaborationType: "analysis",
      timestamp: new Date().toLocaleTimeString()
    },
    // Portfolio Manager Decision
    {
      role: "assistant",
      content: "Arbitrage opportunity detected:\n1. Buy 10 SOL on Jupiter at $101.25\n2. Sell on Orca CL pool at $101.45\nPotential profit: 0.2% (minus fees)\n\nRecommendation: Set up automated arbitrage with 20 SOL capital, 0.15% minimum spread threshold. Shall I proceed?",
      agentName: "Portfolio Manager",
      collaborationType: "decision",
      timestamp: new Date().toLocaleTimeString()
    }
  ],

  "What's the safest way to earn yield on 1000 USDC on Solana?": [
    // Risk Analysis
    {
      role: "assistant",
      content: "Analyzing lowest-risk yield strategies for USDC on Solana. Prioritizing protocol security and stable returns.",
      agentName: "Portfolio Manager",
      collaborationType: "analysis",
      timestamp: new Date().toLocaleTimeString()
    },
    // DeFi Analytics Data
    {
      role: "assistant",
      content: "Current stable yields:\n- Solend Main Pool USDC: 5.8% APY\n- Mango Markets USDC: 6.2% APY\n- UXD Protocol USDC: 4.9% APY\nAll protocols audited and battle-tested.",
      agentName: "DeFi Analytics",
      collaborationType: "data",
      timestamp: new Date().toLocaleTimeString()
    },
    // Lending Agent Analysis
    {
      role: "assistant",
      content: "Solend's main pool offers the best security-to-yield ratio. Multiple audits, insurance fund, and consistent utilization rate of 80%. Recommend starting with their isolated lending pool.",
      agentName: "Lending Agent",
      collaborationType: "suggestion",
      timestamp: new Date().toLocaleTimeString()
    },
    // Research Agent Input
    {
      role: "assistant",
      content: "Protocol risk analysis:\n- Solend: 95/100 safety score\n- Mango: 92/100 safety score\n- UXD: 88/100 safety score\nBased on TVL, audit history, and track record.",
      agentName: "Research Agent",
      collaborationType: "analysis",
      timestamp: new Date().toLocaleTimeString()
    },
    // Final Recommendation
    {
      role: "assistant",
      content: "Recommended safe yield strategy:\n1. Deploy 700 USDC to Solend Main Pool (5.8% APY)\n2. 300 USDC to Mango Markets (6.2% APY)\n\nEstimated blended APY: 5.9%\nRisk Level: Low\nDiversification: 2 top protocols\n\nShall I proceed with this allocation?",
      agentName: "Portfolio Manager",
      collaborationType: "decision",
      timestamp: new Date().toLocaleTimeString()
    }
  ]
};

// Add a mapping for agent images
const agentImages = {
  trading: '/agent_trader.png',
  research: '/staking-agent.png',
  liquidity: '/agent_liquidity.png',
  portfolio: '/agent_analyst.png',
  'defi-analytics': '/agent_default.png',
  lending: '/agent_analyst.png',
  staking: '/staking-agent.png',
  'solana-assistant': '/solana-agent.png'
} as const;

export default function Home() {
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [input, setInput] = useState("");
  const [agentState, setAgentState] = useState<AgentState>({
    isInitialized: false,
    isProcessing: false,
    error: null,
    activeAgent: null,
    systemEvents: []
  });
  const [agents, setAgents] = useState<Agent[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const agentRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setupAgents = async () => {
      try {
        setAgentState(prev => ({
          ...prev,
          isProcessing: true,
          systemEvents: [...prev.systemEvents, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: 'Initializing AI agents...',
            type: 'info'
          }]
        }));

        const initializedAgents = await initializeAgents();
        setAgents(initializedAgents);

        setAgentState(prev => ({
          ...prev,
          isInitialized: true,
          systemEvents: [...prev.systemEvents, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: 'AI agents initialized successfully',
            type: 'success'
          }]
        }));

        setMessages([{
          role: "assistant",
          content: "Hello! I'm SolMate, your AI portfolio manager. I can help you manage your DeFi portfolio on Solana. What would you like to do?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch (error) {
        setAgentState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize agents',
          systemEvents: [...prev.systemEvents, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error'
          }]
        }));
      } finally {
        setAgentState(prev => ({ ...prev, isProcessing: false }));
      }
    };

    setupAgents();
  }, []);

  const handleMessage = async (message: string) => {
    try {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add user message
      setMessages(prev => [...prev, {
        role: "user",
        content: message,
        timestamp
      }]);

      // Check if this is an example query
      if (message in EXAMPLE_RESPONSES) {
        // Add system event for example response
        setAgentState(prev => ({
          ...prev,
          isProcessing: true,
          systemEvents: [...prev.systemEvents, {
            timestamp,
            event: 'Processing example scenario',
            type: 'info'
          }]
        }));

        // Simulate delay for realistic feel
        for (const response of EXAMPLE_RESPONSES[message]) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          setMessages(prev => [...prev, {
            ...response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

          // Add corresponding system event
          setAgentState(prev => ({
            ...prev,
            systemEvents: [...prev.systemEvents, {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              event: `${response.agentName} providing ${response.collaborationType}`,
              agent: response.agentName,
              type: 'info'
            }]
          }));
        }

        setAgentState(prev => ({
          ...prev,
          isProcessing: false,
          systemEvents: [...prev.systemEvents, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: 'Consensus reached',
            type: 'success'
          }]
        }));

        return;
      }

      // Existing dynamic response logic
      setAgentState(prev => ({
        ...prev,
        isProcessing: true,
        systemEvents: [...prev.systemEvents, {
          timestamp,
          event: 'Starting agent collaboration',
          type: 'info'
        }]
      }));

      // Initial analysis by Portfolio Agent
      const portfolioAgent = agents.find(agent => agent.id === 'portfolio');
      const initialAnalysis = await portfolioAgent?.agent?.invoke(
        { input: `Analyze this request and determine which other agents should be involved: ${message}` },
        { configurable: { sessionId: "user-1" } }
      );

      setMessages(prev => [...prev, {
        role: "assistant",
        content: initialAnalysis.output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentId: 'portfolio',
        agentName: 'Portfolio Manager',
        collaborationType: 'analysis'
      }]);

      // Determine relevant agents based on message content
      const relevantAgents = agents.filter(agent => {
        const messageContent = message.toLowerCase();
        return (
          (messageContent.includes('trade') && agent.id === 'trading') ||
          (messageContent.includes('liquidity') && agent.id === 'liquidity') ||
          (messageContent.includes('analytics') && agent.id === 'defi-analytics')
        );
      });

      console.log(relevantAgents, "relevantAgents selected are");

      // Get input from each relevant agent
      for (const agent of relevantAgents) {
        const agentResponse = await agent?.agent?.invoke(
          {
            input: `Given the user request "${message}" and portfolio analysis "${initialAnalysis.output}", what is your perspective and recommendation?`
          },
          { configurable: { sessionId: "user-1" } }
        );

        setMessages(prev => [...prev, {
          role: "assistant",
          content: agentResponse.output,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentId: agent.id,
          agentName: agent.name,
          collaborationType: 'suggestion'
        }]);
      }

      // Final consensus
      const finalConsensus = await portfolioAgent?.agent?.invoke(
        { input: `Based on all suggestions, provide a final recommendation for: ${message}` },
        { configurable: { sessionId: "user-1" } }
      );

      setMessages(prev => [...prev, {
        role: "assistant",
        content: finalConsensus.output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentId: 'portfolio',
        agentName: 'Portfolio Manager',
        collaborationType: 'decision'
      }]);

    } catch (error) {
      console.error('Error in collaboration:', error);
      setMessages(prev => [...prev, {
        role: "system",
        content: "An error occurred during agent collaboration. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAgentState(prev => ({ ...prev, isProcessing: false, activeAgent: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || isProcessing) return;

    const userMessage = {
        role: "user" as const,
        content: input,
        timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
        const response = await handleAgentInteraction(selectedAgent.id, input);
        
        setMessages(prev => [...prev, {
            role: "assistant",
            content: response,
            timestamp: new Date().toLocaleTimeString()
        }]);

    } catch (error) {
        console.error("Error processing message:", error);
        setMessages(prev => [...prev, {
            role: "assistant",
            content: "Sorry, I encountered an error processing your request. Please try again.",
            timestamp: new Date().toLocaleTimeString()
        }]);
    } finally {
        setIsProcessing(false);
    }
  };

  // Add this state for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const AGENTS_PER_PAGE = 4;

  // Add pagination controls
  const totalPages = Math.ceil(agents.length / AGENTS_PER_PAGE);
  const paginatedAgents = agents.slice(
    currentPage * AGENTS_PER_PAGE,
    (currentPage + 1) * AGENTS_PER_PAGE
  );

  return (
    <main className="flex  h-[calc(100vh-8rem)]">
      {/* Left Sidebar - Agent Details */}
      <div className="w-1/4 border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Available Agents</h2>
        
        {/* Agents Container with fixed height */}
        <div className="flex-1 overflow-y-auto mb-4">
          {paginatedAgents.map((agent) => {
            const imageSrc = agentImages[agent.id as keyof typeof agentImages] || '/agent_default.png';
            
            return (
              <div
                key={agent.id}
                className={`p-4 mb-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  agentState.activeAgent === agent.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className="relative w-12 h-12 mr-3">
                    <Image
                      src={imageSrc}
                      alt={agent.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-xs text-gray-500">AI Assistant</p>
                  </div>
                </div>

                {/* Add Capabilities Section */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Capabilities:</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities?.map((capability, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add Protocols Section */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Protocols:</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.protocols?.map((protocol, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
                {agentState.activeAgent === agent.id && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                    Active
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-white">
            Agents list {currentPage + 1} of {totalPages} total Agent List
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center - Chat Interface */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
              <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                {/* Agent/User Icon */}
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      {message.collaborationType && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {message.agentName && (
                    <span className="text-xs font-medium text-gray-500 mb-1">
                      {message.agentName}
                      {message.collaborationType && ` • ${message.collaborationType}`}
                    </span>
                  )}
                  <div className={`p-3 rounded-lg ${message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form - Now always visible */}
        <form onSubmit={handleSubmit} className="border-t p-4 ">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border p-2"
              placeholder="Type your message..."
            />
            <Button type="submit" disabled={agentState.isProcessing}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Right Sidebar - System Events */}
      <div className="w-1/4 border-l border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">System Events</h2>
        {agentState.systemEvents.map((event, index) => (
          <div
            key={index}
            className={`p-3 mb-2 rounded-lg ${event.type === 'error' ? 'bg-red-100' :
              event.type === 'success' ? 'bg-green-100' :
                event.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}
          >
            <div className="text-sm font-medium">
              {event.agent && <span className="text-gray-600">[{event.agent}] </span>}
              <span className="text-gray-900">{event.event}</span>
            </div>
            <div className="text-xs text-gray-500">{event.timestamp}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
