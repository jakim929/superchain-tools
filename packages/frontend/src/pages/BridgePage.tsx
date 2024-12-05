import { BridgeCard } from "@/components/BridgeCard";
import { Chain } from "viem/chains";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";

export const BridgePage = () => {
  const { sourceChainId, setSourceChainId } = useConfig();

  return (
    <div className="flex justify-center ">
      <Tabs
        defaultValue={sourceChainId.toString()}
        value={sourceChainId.toString()}
        className="w-[400px]"
      >
        <TabsList className="w-full flex">
          {sourceChains.map((sourceChain) => (
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
              <BridgeCard l1Chain={chain} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
