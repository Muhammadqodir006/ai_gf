export type AiReply = {
    reply: string;
    mood?: string;
    affection?: number;
    anger?: number;
    jealousy?: number;
    new_facts?: unknown;
};

export type HistoryItem = { role: "user" | "assistant"; content: string};