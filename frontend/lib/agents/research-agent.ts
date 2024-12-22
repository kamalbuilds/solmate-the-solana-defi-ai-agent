import { AssisterrService } from '../services/assisterr-service';

export class SolanaAssistant {
    private assisterr: AssisterrService;
    private readonly HANDLE_NAME = 'research_assistant';

    constructor() {
        this.assisterr = new AssisterrService();
    }

    async research(query: string) {
        const response = await this.assisterr.chat(this.HANDLE_NAME, query);
        return response.message;
    }
} 