"use client";

import { useState, useRef, useEffect } from 'react';
import { DeFiAgent } from "@/lib/config/agents";
import DeFiAgentCard from "@/components/agents/DeFiAgentCard";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { initializeAgents } from "./index";
import { TradingAgent } from '@/lib/agents/trading-agent';
import { SolanaAssistant } from '@/lib/agents/research-agent';
import Image from 'next/image';

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

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

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<DeFiAgent | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const setupAgents = async () => {
            const initializedAgents = await initializeAgents();
            setAgents(initializedAgents);
        };
        setupAgents();
    }, []);

    const handleSelectAgent = (agent: DeFiAgent) => {
        setSelectedAgent(agent);
        setMessages([{
            role: "assistant",
            content: `Hi! I'm the ${agent.name}. I can help you with ${agent.capabilities.join(", ")}. What would you like to know?`,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const [tradingAgent] = useState(() => new TradingAgent());
    const [researchAgent] = useState(() => new SolanaAssistant());

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
            let response;
            switch (selectedAgent.id) {
                case 'trading':
                    response = await tradingAgent.analyze(input);
                    break;
                case 'research':
                    response = await researchAgent.research(input);
                    break;
                default:
                    // response = "The Defi Action was executed successfully 🍀";
                response = `${selectedAgent.name} is not yet implemented`;
            }

            setMessages(prev => [...prev, {
                role: "assistant",
                content: response,
                timestamp: new Date().toLocaleTimeString()
            }]);

        } catch (error) {
            console.error("Error processing message:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error processing your request.",
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Agent Selection */}
                <div className="lg:col-span-1">
                    <h1 className="text-3xl font-bold mb-6">DeFi Agents</h1>
                    <div className="space-y-4">
                        {agents.map(agent => (
                            <DeFiAgentCard
                                key={agent.id}
                                agent={agent}
                                onSelect={handleSelectAgent}
                            />
                        ))}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-2">
                    {selectedAgent ? (
                        <div className="h-[800px] flex flex-col border rounded-lg">
                            {/* Chat Header */}
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src={agentImages[selectedAgent.id as keyof typeof agentImages] || '/agent_default.png'}
                                            alt={selectedAgent.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                            priority
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">{selectedAgent.name}</h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedAgent?.protocols.join(" • ")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-black'
                                                }`}
                                        >
                                            <p>{message.content}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {message.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form */}
                            <div className="border-t p-4">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        <SendHorizontal className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[800px] flex items-center justify-center border rounded-lg">
                            <p className="text-gray-500">Select an agent to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 