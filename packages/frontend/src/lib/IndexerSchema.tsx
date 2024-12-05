import { IndexedChainId } from "@superchain-tools/indexed-chains";
import { AddressSchema, HexSchema } from "@superchain-tools/common-ts";
import { z } from "zod";

export const OpStackChainSchema = z.object({
  id: z.number(),
  l1ChainId: z.number(),
  l2ChainId: z.number(),
});

export const StatusSchema = z.enum(["SENT", "RELAYED", "FAILED"] as const);

// TODO: consider changing to runtime validation as well
export const IndexedChainIdSchema = z
  .number()
  .transform((x) => x as IndexedChainId);

export const SentMessageEventSchema = z.object({
  id: z.string(),
  opStackChain: OpStackChainSchema,
  sourceChainId: IndexedChainIdSchema,
  targetChainId: IndexedChainIdSchema,
  target: AddressSchema,
  sender: AddressSchema,
  message: HexSchema,
  messageNonce: z.coerce.bigint(),
  gasLimit: z.coerce.bigint(),
  blockTimestamp: z.number(),
  transactionHash: HexSchema,
  logIndex: z.number(),
});

export const SentMessageExtension1EventSchema = z.object({
  id: z.string(),
  opStackChain: OpStackChainSchema,
  sourceChainId: IndexedChainIdSchema,
  targetChainId: IndexedChainIdSchema,
  sender: AddressSchema,
  value: z.coerce.bigint(),
  blockTimestamp: z.number(),
  transactionHash: HexSchema,
  logIndex: z.number(),
});

export const RelayedMessageEventSchema = z.object({
  id: z.string(),
  opStackChain: OpStackChainSchema,
  sourceChainId: IndexedChainIdSchema,
  targetChainId: IndexedChainIdSchema,
  sender: AddressSchema,
  value: z.coerce.bigint(),
  blockTimestamp: z.number(),
  transactionHash: HexSchema,
  logIndex: z.number(),
});

export const FailedRelayedMessageEventSchema = RelayedMessageEventSchema;

export const CrossDomainMessageSchema = z.object({
  id: z.string(),
  opStackChain: OpStackChainSchema,
  status: StatusSchema,
  msgHash: HexSchema,
  sourceChainId: IndexedChainIdSchema,
  targetChainId: IndexedChainIdSchema,
  target: AddressSchema,
  sender: AddressSchema,
  message: HexSchema,
  messageNonce: z.coerce.bigint(),
  gasLimit: z.coerce.bigint(),
  value: z.coerce.bigint(),
  lastUpdatedAtBlockTimestamp: z.number(),
  transactionHashes: z.array(HexSchema),
  sentMessageEvent: SentMessageEventSchema,
  sentMessageExtension1Event: SentMessageExtension1EventSchema,
  relayedMessageEvent: RelayedMessageEventSchema.nullable(),
  failedRelayedMessageEvent: RelayedMessageEventSchema.nullable(),
});

export type CrossDomainMessage = z.infer<typeof CrossDomainMessageSchema>;
