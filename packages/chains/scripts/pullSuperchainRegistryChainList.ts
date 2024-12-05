import { fetchChainList } from "@/superchain-registry/fetchChainList";
import { writeFileSync } from "fs";
import { resolve } from "path";

const CHAIN_LIST_URL =
  "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/chainList.json";

const pullSuperchainRegistryChainList = async () => {
  const chainList = await fetchChainList(CHAIN_LIST_URL);
  const timestamp = new Date().toISOString();

  console.log(`Fetched ${chainList.length} chains from Superchain Registry`);

  const outputPath = resolve(__dirname, "../src/generated/chainList.ts");

  writeFileSync(
    outputPath,
    `import { ChainListItem } from "@/superchain-registry/fetchChainList";

export const chainListLastUpdated = "${timestamp}";
export const chainList = ${JSON.stringify(
      chainList,
      null,
      2
    )} as const satisfies ChainListItem[];`
  );

  console.log(`Chain list written to ${outputPath}`);
};

pullSuperchainRegistryChainList().catch(console.error);
