import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRecentAddressStore } from "@/stores/useRecentAddressStore";
import { Address, isAddress } from "viem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConstructionAlert } from "@/components/ConstructionAlert";

export const SuperchainContractPage = () => {
  const { recentAddresses, addAddress } = useRecentAddressStore((state) => {
    return {
      recentAddresses: Object.values(state.addressEntryByAddress),
      addAddress: state.addAddress,
    };
  });

  const [contractAddressInputValue, setContractAddressInputValue] =
    useState<string>("");
  const [contractAddress, setContractAddress] = useState<Address | null>(null);

  return (
    <div className="flex flex-col gap-4 p-4">
      <ConstructionAlert />
      <Input
        placeholder="Enter contract address"
        className="w-full"
        value={contractAddressInputValue}
        onChange={(e) => {
          if (isAddress(e.target.value)) {
            setContractAddress(e.target.value);
            addAddress(e.target.value);
          } else {
            setContractAddress(null);
          }
          setContractAddressInputValue(e.target.value);
        }}
      />

      {recentAddresses.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">Recent addresses:</div>
          <div className="flex flex-wrap gap-2">
            {recentAddresses.slice(0, 5).map((entry) => (
              <Button
                key={entry.address}
                variant="outline"
                onClick={() => setContractAddressInputValue(entry.address)}
                className={cn(
                  "h-auto py-1",
                  contractAddressInputValue === entry.address && "bg-muted"
                )}
                title={entry.address}
              >
                <div className="truncate max-w-[200px]">
                  {`${entry.address.slice(0, 10)}...${entry.address.slice(-6)}`}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
