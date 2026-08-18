import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(
  process.cwd(),
  "public",
  "sites",
  "developers-openai-com-56163ca2",
  "api-docs-models-gpt-5-6-luna-bc3abd42"
);

const assets = [
  ["OpenAI_Developers.svg", "https://developers.openai.com/OpenAI_Developers.svg"],
  ["gpt-5.6-luna.png", "https://developers.openai.com/images/api/models/icons/gpt-5.6-luna.png"],
];

await mkdir(root, { recursive: true });

for (const [filename, url] of assets) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(join(root, filename), body);
  console.log(`Downloaded ${filename} (${body.length} bytes)`);
}
