import "dotenv/config";

type ModelsResponse = { data?: { id: string }[] };

async function main() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
  });
  const data = (await res.json()) as ModelsResponse;
  console.log(data.data?.map((m) => m.id).join("\n"));
}
main();