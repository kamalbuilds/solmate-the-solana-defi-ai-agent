interface AgentAvatarProps {
    name: string;
    className?: string;
}

export function AgentAvatar({ name, className = '' }: AgentAvatarProps) {
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={`w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium ${className}`}
        >
            {initials}
        </div>
    );
} 