import {prisma} from "../lib/prisma";
import { Role } from "../generated/prisma/enums";
import type { HistoryItem } from "../types/ai.types";

export async function getRecentHistory(limit = 20): Promise<HistoryItem[]> {
    const rows = await prisma.message.findMany({
        orderBy: { createdAt: "desc"},
        take: limit,
    });
    return rows.reverse().map((m) => ({
        role: m.role === Role.USER ? "user" : "assistant",
        content: m.content,
    }));
}

export function getLastTwo() {
    return prisma.message.findMany({
        orderBy: { createdAt: "desc"},
        take: 2,
    });
}

export function saveMessage(role: Role, content: string, createdAt?: Date) {
    return prisma.message.create({data: { role, content, createdAt}});
}

export async function listMessages(limit = 50) {
    const rows = await prisma.message.findMany({
        orderBy: { createdAt: "desc"},
        take: limit,
    });
    return rows.reverse();
}