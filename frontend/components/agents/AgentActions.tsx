import { useState } from "react";
import { DeFiAgentService } from "@/lib/services/agent-service";

interface Props {
    agentType: string;
    onAction: (action: string, params: any) => Promise<void>;
}

export default function AgentActions({ agentType, onAction }: Props) {
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState("");

    const handleAction = async (action: string) => {
        if (!amount || !token) return;

        try {
            await onAction(action, {
                amount: parseFloat(amount),
                token
            });
        } catch (err) {
            console.error("Agent action failed:", err);
        }
    };

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-4">Agent Actions</h3>

            <div className="space-y-4">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full p-2 border rounded"
                />

                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Token Address"
                    className="w-full p-2 border rounded"
                />

                {agentType === "lending" && (
                    <button
                        onClick={() => handleAction("lend")}
                        className="w-full py-2 bg-blue-500 text-white rounded"
                    >
                        Lend Assets
                    </button>
                )}

                {agentType === "trading" && (
                    <button
                        onClick={() => handleAction("trade")}
                        className="w-full py-2 bg-green-500 text-white rounded"
                    >
                        Execute Trade
                    </button>
                )}

                {agentType === "liquidity" && (
                    <button
                        onClick={() => handleAction("provide")}
                        className="w-full py-2 bg-purple-500 text-white rounded"
                    >
                        Provide Liquidity
                    </button>
                )}
            </div>
        </div>
    );
} 