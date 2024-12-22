import { DeFiAgent } from "@/lib/types/agent";
import Image from "next/image";

interface Props {
    agent: DeFiAgent;
    onSelect: (agent: DeFiAgent) => void;
}

export default function DeFiAgentCard({ agent, onSelect }: Props) {
    return (
        <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => onSelect(agent)}>
            <div className="flex items-center gap-3">
                <Image
                    src={agent.avatar}
                    alt={agent.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                />
                <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-black">{agent.type}</p>
                </div>
            </div>
            <div className="mt-3">
                <p className="text-sm">Protocols: {agent.protocols?.join(", ")}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {agent.capabilities?.map(cap => (
                        <span key={cap} className="px-2 py-1 text-xs text-black bg-gray-100 rounded">
                            {cap}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
} 