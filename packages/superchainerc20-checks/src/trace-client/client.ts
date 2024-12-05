import { traceActions } from './actions'
import { createPublicClient, PublicClientConfig } from 'viem'

export const createDebugClient = (config: PublicClientConfig) =>
  createPublicClient({
    ...config,
  }).extend(traceActions)
