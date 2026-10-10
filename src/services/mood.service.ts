import {prisma} from "../lib/prisma";
import {Mood} from "../generated/prisma/client";

const HOUR = 60 * 60 * 1000;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export async function getCurrentMood() {
    const mood = await prisma.moodState.upsert({
        where: { id: 1},
        update: {},
        create: { id: 1},
    });

    const hours = (Date.now() - mood.updatedAt.getTime()) / HOUR;
    const anger = clamp(mood.anger - hours * 5);
    const jealousy = clamp(mood.jealousy - hours * 3);

    const calmedDown = 
    (mood.mood === Mood.ANGRY && anger < 15) || 
    (mood.mood === Mood.JEALOUS && jealousy < 15);

    return {
        ...mood,
        anger,
        jealousy,
        mood: calmedDown ? Mood.NEUTRAL : mood.mood,
    };
}

export async function saveMood(ai: {
    mood?: string;
    affection?: number;
    anger?: number;
    jealousy?: number;
}) {
    const key = String(ai.mood ?? "").toUpperCase();
    const mood = key in Mood ? (key as Mood) : undefined;

    const data = {
        ...(mood && {mood}),
        ...(typeof ai.affection === "number" && { affection: clamp(ai.affection)}),
        ...(typeof ai.anger === "number" && {anger: clamp(ai.anger)}),
        ...(typeof ai.jealousy === "number" && {jealousy: clamp(ai.jealousy)}),
    };

    return prisma.moodState.upsert({
        where: { id: 1},
        update: data,
        create: { id: 1, ...data},
    });
}

export async function applyAbsence(gapMs: number) {
    const current = await getCurrentMood();
    const hours = gapMs / HOUR;

    return saveMood({
        mood: hours > 5 ? "JEALOUS" : current.mood,
        jealousy: current.jealousy + Math.min(hours * 4, 40),
        anger: current.anger + Math.min(hours * 2, 20),
    });
}