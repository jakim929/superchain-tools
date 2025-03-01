import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  interopAlphaNetwork,
  sepoliaNetwork,
  supersimNetwork,
} from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import { AvailableNetworks } from "@/components/AvailableNetworks";
import { MultisendBridgeCard } from "@/components/MultisendBridgeCard";

const supportedNetworks = [
  sepoliaNetwork,
  interopAlphaNetwork,
  supersimNetwork,
];

export const MultisendBridgePage = () => {
  const { networkName, setNetworkName } = useConfig();

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <AvailableNetworks requiredNetworks={supportedNetworks} />
      <Tabs defaultValue={networkName} value={networkName}>
        <TabsList className="w-full flex">
          {supportedNetworks.map((network) => (
            <TabsTrigger
              onClick={() => setNetworkName(network.name)}
              className="flex-1 relative"
              key={network.name}
              value={network.name}
            >
              {network.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {supportedNetworks.map((network) => {
          return (
            <TabsContent key={network.name} value={network.name}>
              <MultisendBridgeCard network={network} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
