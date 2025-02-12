import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import { supersimL1 } from "@eth-optimism/viem/chains";
import { sepolia } from "viem/chains";
import { AvailableNetworks } from "@/components/AvailableNetworks";
import { MultisendBridgeCard } from "@/components/MultisendBridgeCard";

const supportedSourceChains = [sepolia, supersimL1];

export const MultisendBridgePage = () => {
  const { sourceChainId, setSourceChainId } = useConfig();

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <AvailableNetworks
        requiredSourceChainIds={supportedSourceChains.map((chain) => chain.id)}
      />
      <Tabs
        defaultValue={sourceChainId.toString()}
        value={sourceChainId.toString()}
      >
        <TabsList className="w-full flex">
          {supportedSourceChains.map((sourceChain) => (
            <TabsTrigger
              onClick={() => setSourceChainId(sourceChain.id)}
              className="flex-1 relative"
              key={sourceChain.name}
              value={sourceChain.id.toString()}
            >
              {sourceChain.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sourceChains.map((chain) => {
          return (
            <TabsContent key={chain.name} value={chain.id.toString()}>
              <MultisendBridgeCard l1Chain={chain} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
