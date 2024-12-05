import { useState } from "react";
import { Chain, Hash } from "viem";
import { optimismSepolia } from "viem/op-stack";
import { useTransactionReceipt } from "wagmi";
import { extractWithdrawalMessageLogs } from "viem/op-stack";
import { useGetWithdrawalStatus } from "@/hooks/useGetWithdrawalStatus";
import { ReadyToProve } from "@/withdrawal-status/ReadyToProve";
import { WaitingToProve } from "@/withdrawal-status/WaitingToProve";
import { ReadyToFinalize } from "@/withdrawal-status/ReadyToFinalize";
import { WaitingToFinalize } from "@/withdrawal-status/WaitingToFinalize";
import { Finalized } from "@/withdrawal-status/Finalized";
import { supersimL1 } from "@eth-optimism/viem";

import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chainById, chains, sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import { AvailableNetworks } from "@/components/AvailableNetworks";
import { Label } from "@/components/ui/label";

// supersim doesn't support L2 to L1 withdrawals
const supportedSourceChains = sourceChains.filter(
  (chain) => chain.id !== supersimL1.id
);

export const L2ToL1RelayerPage = () => {
  const { sourceChainId, setSourceChainId } = useConfig();
  const [selectedL2ChainId, setSelectedL2ChainId] = useState<number | null>(
    optimismSepolia.id
  );
  const [withdrawalTransactionHashText, setWithdrawalTransactionHashText] =
    useState<string>("");

  const [selectedTransactionHash, setSelectedTransactionHash] = useState<
    Hash | undefined
  >();

  const filteredL2Chains = sourceChainId
    ? chains.filter((chain) => chain.sourceId === sourceChainId)
    : [];

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <AvailableNetworks
        requiredSourceChainIds={supportedSourceChains.map((chain) => chain.id)}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            L2 to L1 Withdrawal Relayer
          </CardTitle>
          <CardDescription>
            Search for your L2 transaction to execute a manual withdrawal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="space-y-4">
              <Label>Select L1 Chain</Label>
              <Select
                value={sourceChainId?.toString()}
                onValueChange={(value) => {
                  setSourceChainId(Number(value));
                  setSelectedL2ChainId(null); // Reset L2 chain selection
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Source Chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedSourceChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceChainId && (
              <div className="space-y-4">
                <Label>Select L2 Chain</Label>
                <Select
                  value={selectedL2ChainId?.toString()}
                  onValueChange={(value) => {
                    setSelectedL2ChainId(Number(value));
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select L2 Chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredL2Chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-1 gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="txHash">Transaction Hash</Label>
              <Input
                id="txHash"
                placeholder="0xabcdbeef..."
                value={withdrawalTransactionHashText}
                onChange={(e) =>
                  setWithdrawalTransactionHashText(e.target.value)
                }
                className="font-mono"
              />
            </div>
            <Button
              onClick={() =>
                setSelectedTransactionHash(
                  withdrawalTransactionHashText as Hash
                )
              }
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {selectedTransactionHash && selectedL2ChainId && (
            <WithdrawalTransactionStatus
              transactionHash={selectedTransactionHash}
              l2Chain={chainById[selectedL2ChainId]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const WithdrawalTransactionStatus = ({
  transactionHash,
  l2Chain,
}: {
  transactionHash: Hash;
  l2Chain: Chain;
}) => {
  const { data: transactionReceipt, isLoading: isTransactionReceiptLoading } =
    useTransactionReceipt({
      hash: transactionHash,
      chainId: l2Chain.id,
    });

  const logs = transactionReceipt
    ? extractWithdrawalMessageLogs(transactionReceipt)
    : [];

  const { data: withdrawalStatus, isLoading: isWithdrawalStatusLoading } =
    useGetWithdrawalStatus({
      transactionReceipt,
      l2Chain: l2Chain,
    });

  if (isTransactionReceiptLoading) {
    return (
      <Alert>
        <AlertDescription>Loading transaction...</AlertDescription>
      </Alert>
    );
  }

  if (!transactionReceipt) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Transaction not found</AlertDescription>
      </Alert>
    );
  }

  if (logs.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No withdrawal messages found in transaction
        </AlertDescription>
      </Alert>
    );
  }

  if (isWithdrawalStatusLoading || !withdrawalStatus) {
    return (
      <Alert>
        <AlertDescription>Loading withdrawal status...</AlertDescription>
      </Alert>
    );
  }

  if (withdrawalStatus === "waiting-to-prove") {
    return (
      <WaitingToProve transactionHash={transactionHash} l2Chain={l2Chain} />
    );
  }
  if (withdrawalStatus === "ready-to-prove") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to Prove</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadyToProve transactionHash={transactionHash} l2Chain={l2Chain} />
        </CardContent>
      </Card>
    );
  }

  if (withdrawalStatus === "waiting-to-finalize") {
    return (
      <WaitingToFinalize transactionHash={transactionHash} l2Chain={l2Chain} />
    );
  }

  if (withdrawalStatus === "ready-to-finalize") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to Finalize</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadyToFinalize
            transactionHash={transactionHash}
            l2Chain={l2Chain}
          />
        </CardContent>
      </Card>
    );
  }

  return <Finalized />;
};
