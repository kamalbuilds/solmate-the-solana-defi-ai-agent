import { AssisterrService } from '../services/assisterr-service';

export class TradingAgent {
    private assisterr: AssisterrService;
    private sessionId?: string;
    private readonly HANDLE_NAME = 'trading_assistant';

    constructor() {
        this.assisterr = new AssisterrService();
    }

    async initialize() {
        this.sessionId = await this.assisterr.createSession(this.HANDLE_NAME);
    }

    async analyze(query: string) {
        if (!this.sessionId) {
            await this.initialize();
        }

        const response = await this.assisterr.chatWithSession(
            this.HANDLE_NAME,
            this.sessionId!,
            query
        );

        return response.message;
    }
} 