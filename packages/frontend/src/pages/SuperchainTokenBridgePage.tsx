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
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { Address, parseUnits } from "viem";
import { contracts, supersimL1 } from "@eth-optimism/viem";
import {
  useAccount,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { superchainTokenBridgeAbi } from "@/constants/superchainTokenBridgeAbi";
import { chains, sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { AvailableNetworks } from "@/components/AvailableNetworks";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { NetworkPicker } from "@/components/NetworkPicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const supportedSourceChains = [supersimL1];

export const SuperchainTokenBridgePage = () => {
  const { address } = useAccount();
  const { sourceChainId, setSourceChainId } = useConfig();
  const [amount, setAmount] = useState("");

  // Filter available chains based on source network
  const filteredChains = sourceChainId
    ? chains.filter((chain) => chain.sourceId === sourceChainId)
    : [];

  const [fromChainId, setFromChain] = useState<number>(
    filteredChains[0]?.id || 0
  );

  const [toChainId, setToChain] = useState<number>(filteredChains[1]?.id || 0);
  const [tokenAddress, setTokenAddress] = useState<Address>(
    "0xAaA2b0D6295b91505500B7630e9E36a461ceAd1b"
  );

  const { addTransaction } = useTransactionStore();

  const {
    symbol,
    decimals = 18,
    name,
    isLoading: isTokenLoading,
  } = useTokenInfo({
    address: tokenAddress as Address,
    chainId: fromChainId,
  });

  const amountUnits = parseUnits(amount, decimals);

  const { switchChain } = useSwitchChain();

  const simulationResult = useSimulateContract({
    abi: superchainTokenBridgeAbi,
    address: contracts.superchainTokenBridge.address,
    functionName: "sendERC20",
    args: [tokenAddress, address!, amountUnits, BigInt(toChainId)],
    chainId: fromChainId,
    query: {
      enabled: Boolean(fromChainId && toChainId && address && amount),
    },
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
      const availableChains = chains.filter((chain) => chain.id !== numChainId);
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

  // Set default source chain if not set
  useEffect(() => {
    if (!sourceChainId && sourceChains.length > 0) {
      setSourceChainId(sourceChains[0].id);
    }
  }, [sourceChainId, setSourceChainId]);

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
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <AvailableNetworks
        requiredSourceChainIds={supportedSourceChains.map((chain) => chain.id)}
      />
      <Card className="">
        <CardHeader>
          <CardTitle>Bridge SuperchainERC20 between Superchain L2s</CardTitle>
          <CardDescription>Transfer assets between networks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <NetworkPicker />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Token Address</Label>
                {fromChainId !== 0 &&
                  (isTokenLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-right">
                      {name && `${name} • `}
                      {symbol && `${symbol} • `}
                      {decimals && `${decimals} decimals`}
                    </div>
                  ))}
              </div>
              <Input
                type="text"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Network</Label>
                <Select
                  onValueChange={handleFromChainChange}
                  value={fromChainId.toString()}
                  disabled={!sourceChainId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To Network</Label>
                <Select
                  onValueChange={(value) => setToChain(parseInt(value))}
                  disabled={!fromChainId}
                  value={toChainId.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredChains
                      .filter((chain) => chain.id !== fromChainId)
                      .map((chain) => (
                        <SelectItem key={chain.id} value={chain.id.toString()}>
                          {chain.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
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
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Transaction confirmed successfully!</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewRelayer}>
              View in Message Relayer
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
