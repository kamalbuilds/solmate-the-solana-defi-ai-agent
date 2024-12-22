

const ASSISTERR_BASE_URL = 'https://api.assisterr.ai';

interface AssisterrResponse {
    message: string;
    message_at: string;
    is_user: boolean;
}

export class AssisterrService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env['NEXT_PUBLIC_ASSISTER_API_KEY'] || '';
    }

    async createSession(handleName: string): Promise<string> {
        const response = await fetch(
            `${ASSISTERR_BASE_URL}/api/v1/slm/${handleName}/session/create/`,
            {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.json();
    }

    async chat(handleName: string, query: string): Promise<AssisterrResponse> {
        const response = await fetch(
            `${ASSISTERR_BASE_URL}/api/v1/slm/${handleName}/chat/`,
            {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            }
        );

        return response.json();
    }

    async chatWithSession(
        handleName: string,
        sessionId: string,
        query: string
    ): Promise<AssisterrResponse> {
        const response = await fetch(
            `${ASSISTERR_BASE_URL}/api/v1/slm/${handleName}/session/${sessionId}/chat/`,
            {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            }
        );

        return response.json();
    }
} 