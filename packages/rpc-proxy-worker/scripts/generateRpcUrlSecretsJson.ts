import {
  superchainRegistryChains,
  superchainRegistrySourceChains,
} from "@superchain-tools/chains";
import fs from "fs";
import path from "path";
import { getRpcUrlId } from "../src/getRpcUrlId";

// Define the type for our secrets object
type RpcUrlSecrets = Record<string, string>;

// Define the JSON schema
const rpcUrlSecretsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  additionalProperties: false,
  required: [
    ...superchainRegistrySourceChains,
    ...superchainRegistryChains,
  ].map((chain) => getRpcUrlId(chain)),
  properties: {
    $schema: { type: "string" },
    ...Object.fromEntries(
      [...superchainRegistrySourceChains, ...superchainRegistryChains].map(
        (chain) => [getRpcUrlId(chain), { type: "string", minLength: 1 }]
      )
    ),
  },
} as const;

const generateSecretsJson = () => {
  const outputPath = path.resolve(__dirname, "../rpc-url-secrets.json");

  // Read existing secrets if file exists
  let existingSecrets = {};
  try {
    existingSecrets = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch (error) {
    // File doesn't exist or is invalid JSON, start fresh
  }

  // Generate secrets object using the same keys as ChainRpcUrlBindings
  const secrets: RpcUrlSecrets & { $schema: string } = {
    $schema: "./rpc-url-secrets.schema.json",
  };
  [...superchainRegistrySourceChains, ...superchainRegistryChains].forEach(
    (chain) => {
      const key = getRpcUrlId(chain);
      secrets[key] = existingSecrets[key] || chain.rpcUrls.default.http[0];
    }
  );

  // Write merged secrets and schema to files
  fs.writeFileSync(outputPath, JSON.stringify(secrets, null, 2), "utf-8");
  fs.writeFileSync(
    path.resolve(__dirname, "../rpc-url-secrets.schema.json"),
    JSON.stringify(rpcUrlSecretsSchema, null, 2),
    "utf-8"
  );
};

generateSecretsJson();
