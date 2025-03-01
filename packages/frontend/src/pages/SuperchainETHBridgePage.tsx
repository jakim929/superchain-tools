import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseUnits } from "viem";
import { contracts, superchainWETHAbi } from "@eth-optimism/viem";
import {
  useAccount,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { interopAlphaNetwork, supersimNetwork } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { NetworkPicker } from "@/components/NetworkPicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { networkByName, networks } from "@superchain-tools/chains";
import { AvailableNetworks } from "@/components/AvailableNetworks";

const supportedNetworks = [interopAlphaNetwork, supersimNetwork];

export const SuperchainETHBridgePage = () => {
  const { address } = useAccount();
  const { networkName, setNetworkName } = useConfig();
  const [amount, setAmount] = useState("");

  const filteredChains = networkByName[networkName].chains;

  const [fromChainId, setFromChain] = useState<number>(
    filteredChains[0]?.id || 0
  );

  const [toChainId, setToChain] = useState<number>(filteredChains[1]?.id || 0);

  const { addTransaction } = useTransactionStore();

  const amountUnits = parseUnits(amount, 18);

  const { switchChain } = useSwitchChain();

  const simulationResult = useSimulateContract({
    abi: superchainWETHAbi,
    address: contracts.superchainWETH.address,
    functionName: "sendETH",
    args: [address!, BigInt(toChainId)],
    chainId: fromChainId,
    query: {
      enabled: Boolean(fromChainId && toChainId && address && amount),
    },
    value: amountUnits,
  });

  const {
    data: hash,
    isPending: isSendPending,
    writeContract,
    reset,
  } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addTransaction({
          hash,
          chainId: fromChainId,
        });
      },
    },
  });

  const handleFromChainChange = async (chainId: string) => {
    const numChainId = parseInt(chainId);
    setFromChain(numChainId);
    if (numChainId === toChainId) {
      const availableChains = networkByName[networkName].chains.filter(
        (chain) => chain.id !== numChainId
      );
      setToChain(availableChains[0]?.id || 0);
    }
    reset();
  };

  const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const isLoading =
    isSendPending || isReceiptLoading || !simulationResult.data?.request;

  const isButtonDisabled =
    !address ||
    !amount ||
    !fromChainId ||
    !toChainId ||
    isLoading ||
    !simulationResult.data?.request;

  // Set default network if not set
  useEffect(() => {
    if (!networkName && networks.length > 0) {
      setNetworkName(networks[0].name);
    }
  }, [networkName, setNetworkName]);

  const getButtonContent = () => {
    if (isSendPending) {
      return (
        <>
          <span className="mr-2">Sending transaction...</span>
          <Send className="h-4 w-4 animate-pulse" />
        </>
      );
    }
    if (isReceiptLoading) {
      return (
        <>
          <span className="mr-2">Waiting for confirmation...</span>
          <Loader2 className="h-4 w-4 animate-spin" />
        </>
      );
    }
    return "Bridge";
  };

  const navigate = useNavigate();

  // Add handler for navigation
  const handleViewRelayer = () => {
    navigate(
      `/superchain-message-relayer?chainId=${fromChainId}&txHash=${hash}`
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <AvailableNetworks requiredNetworks={supportedNetworks} />
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">
            Bridge ETH between Superchain L2s
          </CardTitle>
          <CardDescription className="text-sm">
            Transfer ETH between networks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <NetworkPicker
              allowedNetworkNames={supportedNetworks.map(
                (network) => network.name
              )}
            />

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Chain</Label>
                <Select
                  onValueChange={handleFromChainChange}
                  value={fromChainId.toString()}
                  disabled={!networkName}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredChains.map((chain) => (
                      <SelectItem
                        key={chain.id}
                        value={chain.id.toString()}
                        className="text-sm"
                      >
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To Chain</Label>
                <Select
                  onValueChange={(value) => setToChain(parseInt(value))}
                  disabled={!fromChainId}
                  value={toChainId.toString()}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredChains
                      .filter((chain) => chain.id !== fromChainId)
                      .map((chain) => (
                        <SelectItem
                          key={chain.id}
                          value={chain.id.toString()}
                          className="text-sm"
                        >
                          {chain.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            className="w-full text-sm"
            size="lg"
            disabled={isButtonDisabled}
            onClick={async () => {
              await switchChain({ chainId: fromChainId });
              writeContract(simulationResult.data!.request);
            }}
          >
            {getButtonContent()}
          </Button>
        </CardContent>
      </Card>
      {isReceiptSuccess && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Transaction confirmed successfully!
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewRelayer}
              className="w-full sm:w-auto text-sm"
            >
              View in Message Relayer
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
