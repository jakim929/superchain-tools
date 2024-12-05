import { Chain, createPublicClient, http, PublicClient } from 'viem'

export type CreateContextParams = {
  chains: Chain[]
  rpcUrlOverrideByChainId: Record<number, string>
}

export type PerChainContext = {
  chain: Chain
  rpcUrlOverride?: string
}

export const createContext = ({
  chains,
  rpcUrlOverrideByChainId,
}: CreateContextParams) => {
  const publicClientByChainId = Object.fromEntries(
    chains.map((chain) => {
      const rpcOverride = rpcUrlOverrideByChainId[chain.id]
      return [
        chain.id,
        createPublicClient({
          chain,
          transport: rpcOverride ? http(rpcOverride) : http(),
        }),
      ]
    }),
  ) as Record<number, PublicClient>

  return {
    chains,
    publicClientByChainId,
  }
}

export type Context = ReturnType<typeof createContext>
