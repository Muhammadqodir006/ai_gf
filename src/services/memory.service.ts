import { prisma } from "../lib/prisma";

export type NewFact = { category: string; key: string; value: string };

export async function getFacts() {
  return prisma.userFact.findMany({ orderBy: { updatedAt: "desc" } });
}

// AI qaytargan new_facts ni tozalab, UPSERT qiladi
export async function saveFacts(raw: unknown) {
  if (!Array.isArray(raw)) return;

  const facts = raw
    .filter(
      (f): f is NewFact =>
        f &&
        typeof f.category === "string" &&
        typeof f.key === "string" &&
        typeof f.value === "string"
    )
    .map((f) => ({
      category: f.category.trim().toLowerCase().slice(0, 30),
      key: f.key.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 50),
      value: f.value.trim().slice(0, 200),
    }))
    .filter((f) => f.key && f.value)
    .slice(0, 5); 

  await prisma.$transaction(
    facts.map((f) =>
      prisma.userFact.upsert({
        where: { key: f.key },
        update: { value: f.value, category: f.category },
        create: f,
      })
    )
  );
}