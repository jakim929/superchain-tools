import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  ChevronDown,
  History,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { L2ChainPicker } from "@/components/L2ChainPicker";
import { AvailableNetworks } from "@/components/AvailableNetworks";
import { DecodedMessageData } from "@/components/DecodedMessageData";
import { useTransactionStore } from "@/stores/useTransactionStore";

import { Address, Hash, Hex, isHash, Log, parseEventLogs } from "viem";

import {
  useBlock,
  useSimulateContract,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSwitchChain,
  useAccount,
  useReadContract,
} from "wagmi";

import { supersimL1, supersimL2A, contracts } from "@eth-optimism/viem";
import { l2ToL2CrossDomainMessengerABI } from "@eth-optimism/viem";
import { chainById } from "@superchain-tools/chains";
import { predeployByContractAddress } from "@/constants/predeployByContractAddress";
import { getL2ToL2CrossDomainMessageHash } from "@/lib/getL2ToL2CrossDomainMessageHash";
import { encodeL2ToL2CrossDomainSentMessageEvent } from "@/lib/encodeL2ToL2CrossDomainSentMessageEvent";
import { L2ToL2CrossDomainMessage } from "@/types/L2ToL2CrossDomainMessage";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const SuperchainMessageRelayer = () => {
  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Superchain Message Relayer</h1>
        <p className="text-muted-foreground text-sm max-w-prose">
          Inspect L2 transactions and relay cross-chain messages within the
          Superchain. Begin by choosing a source L2 chain and entering a
          transaction hash.
        </p>
      </div>

      <AvailableNetworks requiredSourceChainIds={[supersimL1.id]} />

      <Relayer />
    </div>
  );
};

const Relayer = () => {
  const [selectedL2ChainId, setSelectedL2ChainId] = useState<
    number | undefined
  >(supersimL2A.id);
  const [txHashInputValue, setTxHashInputValue] = useState("");
  const transactionEntryByHash = useTransactionStore(
    (state) => state.transactionEntryByHash
  );

  const isValidTxHash = isHash(txHashInputValue);
  const txHash = isValidTxHash ? txHashInputValue : undefined;

  const recentTransactions = Object.values(transactionEntryByHash);
  const hasRecentTransactions = recentTransactions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* STEP 1: SELECT CHAIN AND TRANSACTION */}
      <Card className="border rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Select L2 Chain & Transaction
          </CardTitle>
          <CardDescription className="text-sm">
            Provide the transaction hash for the selected L2 chain. You can also
            pick from your recent transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <L2ChainPicker
              label="Select L2 Chain"
              chainId={selectedL2ChainId}
              onChange={(chainId) => {
                setSelectedL2ChainId(chainId);
                setTxHashInputValue("");
              }}
            />
          </div>

          <TransactionHashInput
            txHashInputValue={txHashInputValue}
            setTxHashInputValue={setTxHashInputValue}
            selectedL2ChainId={selectedL2ChainId}
            setSelectedL2ChainId={setSelectedL2ChainId}
            recentTransactions={recentTransactions}
            hasRecentTransactions={hasRecentTransactions}
          />
        </CardContent>
      </Card>

      {/* STEP 2 & 3: SHOW RESULTS IF TX IS VALID */}
      {txHash && selectedL2ChainId && (
        <>
          <Separator className="my-6" />
          <TransactionDetails
            txHash={txHash}
            selectedL2ChainId={selectedL2ChainId}
          />
        </>
      )}
    </div>
  );
};

const TransactionHashInput = ({
  txHashInputValue,
  setTxHashInputValue,
  selectedL2ChainId,
  setSelectedL2ChainId,
  recentTransactions,
  hasRecentTransactions,
}: {
  txHashInputValue: string;
  setTxHashInputValue: (val: string) => void;
  selectedL2ChainId?: number;
  setSelectedL2ChainId: (val: number) => void;
  recentTransactions: any[];
  hasRecentTransactions: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isValidTxHash = isHash(txHashInputValue);

  return (
    <div className="grid w-full items-center gap-2">
      <Label htmlFor="txHash" className="text-sm font-medium">
        Transaction Hash
      </Label>
      <div className="relative">
        <Input
          id="txHash"
          placeholder="0x..."
          value={txHashInputValue}
          onChange={(e) => setTxHashInputValue(e.target.value)}
          className="font-mono"
        />
        {txHashInputValue && !isValidTxHash && (
          <p className="text-sm text-destructive mt-1.5">
            Invalid transaction hash. Please enter a valid hash.
          </p>
        )}
      </div>

      {hasRecentTransactions && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full justify-between"
            >
              <div className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                View Recent Transactions
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 border rounded-lg overflow-hidden bg-card">
              <RecentTransactionsList
                recentTransactions={recentTransactions}
                selectedL2ChainId={selectedL2ChainId}
                setSelectedL2ChainId={setSelectedL2ChainId}
                txHashInputValue={txHashInputValue}
                setTxHashInputValue={setTxHashInputValue}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

const RecentTransactionsList = ({
  recentTransactions,
  selectedL2ChainId,
  setSelectedL2ChainId,
  txHashInputValue,
  setTxHashInputValue,
}: {
  recentTransactions: any[];
  selectedL2ChainId?: number;
  setSelectedL2ChainId: (val: number) => void;
  txHashInputValue: string;
  setTxHashInputValue: (val: string) => void;
}) => {
  const filtered = recentTransactions.slice(0, 5);

  if (filtered.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground">
        No recent transactions for this chain.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {filtered.map((tx) => (
        <button
          type="button"
          key={tx.hash}
          onClick={() => {
            setTxHashInputValue(tx.hash);
            setSelectedL2ChainId(tx.chainId);
          }}
          className={cn(
            "group w-full flex items-center justify-between px-3 py-2 gap-2 text-left hover:bg-accent/60",
            tx.hash === txHashInputValue
              ? "bg-accent text-accent-foreground"
              : ""
          )}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
            <code className="text-sm break-all">
              {`${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`}
            </code>
          </div>
          <div className="text-xs font-medium text-muted-foreground group-hover:text-accent-foreground">
            {chainById[tx.chainId]?.name ?? "Unknown"} ({tx.chainId})
          </div>
        </button>
      ))}
    </div>
  );
};

const TransactionDetails = ({
  txHash,
  selectedL2ChainId,
}: {
  txHash: Hash;
  selectedL2ChainId: number;
}) => {
  const { data: receipt, isLoading: isReceiptLoading } = useTransactionReceipt({
    hash: txHash,
    chainId: selectedL2ChainId,
  });

  if (isReceiptLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-4 w-4" />
        <span>Loading transaction details...</span>
      </div>
    );
  }

  if (!receipt) {
    return (
      <Alert variant="default" className="border rounded-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Transaction Receipt Found</AlertTitle>
        <AlertDescription>
          We couldn’t find a receipt for this transaction hash. Please verify
          the hash and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const logs = parseEventLogs({
    abi: l2ToL2CrossDomainMessengerABI,
    logs: receipt.logs,
    eventName: "SentMessage",
  });

  const messageCount = logs.length;
  const messageText =
    messageCount === 0
      ? "No cross-chain messages"
      : `${messageCount} cross-chain message${messageCount !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      {/* STEP 2: TRANSACTION SUMMARY */}
      <TransactionSummaryCard
        txHash={txHash}
        receipt={receipt}
        isReceiptExpandedDefault={false}
        selectedL2ChainId={selectedL2ChainId}
        messageText={messageText}
      />

      {/* STEP 3: CROSS-CHAIN MESSAGES (if any) */}
      {logs.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cross-Chain Messages</h2>
          {logs.map((log, index) => (
            <SingleMessageDetails
              key={index}
              log={log}
              selectedL2ChainId={selectedL2ChainId}
              index={index}
              totalCount={logs.length}
            />
          ))}
        </div>
      ) : (
        <Alert variant="default" className="border rounded-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Cross-Chain Messages</AlertTitle>
          <AlertDescription>
            This transaction did not contain any cross-chain messages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const TransactionSummaryCard = ({
  txHash,
  receipt,
  selectedL2ChainId,
  messageText,
  isReceiptExpandedDefault = false,
}: {
  txHash: Hash;
  receipt: any;
  selectedL2ChainId: number;
  messageText: string;
  isReceiptExpandedDefault?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(isReceiptExpandedDefault);

  return (
    <Card className="border rounded-lg">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg text-left">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-medium text-base">
                Transaction
                <code className="text-sm font-normal text-muted-foreground">
                  {`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}
                </code>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{messageText}</span>
                <span>•</span>
                <span>{chainById[selectedL2ChainId]?.name}</span>
                <span>•</span>
                <span>Block #{receipt.blockNumber.toString()}</span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t space-y-4 pt-4">
            <DetailRow label="Status">
              <StatusBadge status={receipt.status} />
            </DetailRow>
            <DetailRow label="Block Number">
              <code className="block rounded bg-muted p-2 text-sm">
                {receipt.blockNumber.toString()}
              </code>
            </DetailRow>
            <DetailRow label="Gas Used">
              <code className="block rounded bg-muted p-2 text-sm">
                {receipt.gasUsed.toString()} wei
              </code>
            </DetailRow>
            <DetailRow label="From">
              <code className="block rounded bg-muted p-2 text-sm break-all">
                {receipt.from}
              </code>
            </DetailRow>
            <DetailRow label="To">
              <code className="block rounded bg-muted p-2 text-sm break-all">
                {receipt.to}
              </code>
            </DetailRow>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: "success" | "reverted" }) => {
  const isSuccess = status === "success";
  return (
    <div
      className={`ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        isSuccess
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isSuccess ? "Success" : "Failed"}
    </div>
  );
};

const SingleMessageDetails = ({
  log,
  selectedL2ChainId,
  index,
  totalCount,
}: {
  log: Log;
  selectedL2ChainId: number;
  index: number;
  totalCount: number;
}) => {
  const l2ToL2CrossDomainMessage = log.args as L2ToL2CrossDomainMessage;
  const { destination, message, messageNonce, sender, target } =
    l2ToL2CrossDomainMessage;

  const messageHash = getL2ToL2CrossDomainMessageHash(
    l2ToL2CrossDomainMessage,
    BigInt(selectedL2ChainId)
  );
  const targetKnownContract = predeployByContractAddress[target];
  const sourceKnownContract = predeployByContractAddress[sender];

  const {
    data: isMessageAlreadyRelayed,
    isLoading: isMessageAlreadyRelayedLoading,
    refetch: refetchIsRelayed,
  } = useReadContract({
    address: contracts.l2ToL2CrossDomainMessenger.address,
    chainId: Number(destination),
    abi: l2ToL2CrossDomainMessengerABI,
    functionName: "successfulMessages",
    args: [messageHash],
  });

  const isRelayed =
    !isMessageAlreadyRelayedLoading && isMessageAlreadyRelayed === true;

  return (
    <Card className="border rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          Cross-Chain Message {index + 1}/{totalCount}
        </CardTitle>
        <CardDescription className="text-sm flex flex-col gap-1 mt-1">
          {isMessageAlreadyRelayedLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking message status...
            </div>
          ) : isRelayed ? (
            <div className="flex items-center gap-2 text-green-500 font-medium">
              <CheckCircle className="h-4 w-4" />
              Message Relayed
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-yellow-600 font-medium">
              <AlertCircle className="h-4 w-4" />
              Pending Relay
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-xs text-muted-foreground">
                {chainById[selectedL2ChainId]?.name ?? "Unknown"} →{" "}
                {chainById[Number(destination)]?.name ?? "Unknown"}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 mt-2">
        <MessageField label="Message Nonce" value={messageNonce.toString()} />
        <MessageField label="Message Hash" value={messageHash} />

        <MessageField
          label="Sender"
          value={sender}
          chainInfo={chainById[selectedL2ChainId]?.name}
          contractInfo={sourceKnownContract?.name}
          chainId={selectedL2ChainId}
        />
        <MessageField
          label="Target"
          value={target}
          chainInfo={chainById[Number(destination)]?.name}
          contractInfo={targetKnownContract?.name}
          chainId={Number(destination)}
        />

        <MessageField label="Message Data" value={message} />

        {targetKnownContract && (
          <DecodedMessageData
            message={message as Hex}
            abi={targetKnownContract.abi}
          />
        )}

        {!isRelayed && !isMessageAlreadyRelayedLoading && (
          <MessageRelayer
            l2ToL2CrossDomainMessage={l2ToL2CrossDomainMessage}
            log={log}
            senderChainId={selectedL2ChainId}
            onSuccess={() => refetchIsRelayed()}
          />
        )}
      </CardContent>
    </Card>
  );
};

const MessageField = ({
  label,
  value,
  chainInfo,
  contractInfo,
  chainId,
}: {
  label: string;
  value: string;
  chainInfo?: string;
  contractInfo?: string;
  chainId?: number;
}) => {
  return (
    <div className="space-y-1 text-sm">
      <Label className="font-medium">{label}</Label>
      <div className="bg-muted rounded p-2 text-xs break-all">
        {chainInfo && chainId !== undefined && (
          <div className="text-xs text-muted-foreground mb-1">
            {chainInfo} ({chainId}) {contractInfo ? `• ${contractInfo}` : ""}
          </div>
        )}
        <code className="break-all">{value}</code>
      </div>
    </div>
  );
};

const MessageRelayer = ({
  l2ToL2CrossDomainMessage,
  log,
  senderChainId,
  onSuccess,
}: {
  l2ToL2CrossDomainMessage: L2ToL2CrossDomainMessage;
  log: Log;
  senderChainId: number;
  onSuccess: () => void;
}) => {
  const { chain } = useAccount();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  const destinationChainId = Number(l2ToL2CrossDomainMessage.destination);
  const isOnCorrectChain = chain?.id === destinationChainId;

  const { data: identifier, isLoading: isIdentifierLoading } = useBlock({
    chainId: senderChainId,
    blockHash: log.blockHash!,
    query: {
      select: (block) => ({
        origin: log.address,
        blockNumber: block.number,
        logIndex: BigInt(log.logIndex!),
        timestamp: block.timestamp,
        chainId: BigInt(senderChainId),
      }),
    },
  });

  const { data: simulatedData, error: simulateContractError } =
    useSimulateContract({
      abi: l2ToL2CrossDomainMessengerABI,
      functionName: "relayMessage",
      address: contracts.l2ToL2CrossDomainMessenger.address,
      args: [
        identifier!,
        encodeL2ToL2CrossDomainSentMessageEvent(l2ToL2CrossDomainMessage),
      ],
      query: {
        enabled: !!identifier,
      },
    });

  const {
    data: txHash,
    writeContract,
    isPending: isWriteContractPending,
  } = useWriteContract({
    mutation: {
      onSuccess: async () => {
        await sleep(2500);
        onSuccess();
      },
    },
  });

  const {
    data: receipt,
    isLoading: isReceiptLoading,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: destinationChainId,
  });

  const isLoading =
    isIdentifierLoading ||
    isWriteContractPending ||
    isReceiptLoading ||
    isSwitchPending;
  const isSimulationError = !!simulateContractError;
  const isTxError = !!txError;
  const isSuccess = !!receipt;
  const isDisabled =
    isLoading ||
    isSimulationError ||
    isSuccess ||
    !identifier ||
    !simulatedData;

  if (!isOnCorrectChain) {
    return (
      <Button
        onClick={() => switchChain?.({ chainId: destinationChainId })}
        disabled={isSwitchPending}
        className="w-full"
      >
        {isSwitchPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowUpRight className="mr-2 h-4 w-4" />
        )}
        Switch to {chainById[destinationChainId]?.name}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          if (!identifier || !simulatedData) return;
          writeContract(simulatedData.request);
        }}
        disabled={isDisabled}
        variant={isSuccess ? "secondary" : "default"}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSuccess && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
        {(isSimulationError || isTxError) && (
          <XCircle className="mr-2 h-4 w-4 text-destructive" />
        )}
        {isSuccess
          ? "Message Relayed"
          : isSimulationError
          ? "Simulation Failed"
          : isTxError
          ? "Transaction Failed"
          : isLoading
          ? "Relaying Message..."
          : "Relay Message"}
      </Button>

      {isSimulationError && (
        <Alert variant="destructive" className="border rounded-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Simulation Error</AlertTitle>
          <AlertDescription>
            Cannot execute the transaction. Possibly already relayed or invalid
            data.
            <code className="block text-xs break-all bg-muted rounded p-2 mt-2">
              {simulateContractError?.message || "Unknown simulation error"}
            </code>
          </AlertDescription>
        </Alert>
      )}

      {isTxError && (
        <Alert variant="destructive" className="border rounded-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Transaction Failed</AlertTitle>
          <AlertDescription>
            Transaction was submitted but failed.
            <code className="block text-xs break-all bg-muted rounded p-2 mt-2">
              {txError?.message || "Unknown transaction error"}
            </code>
          </AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert variant="default" className="border rounded-md">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your message has been successfully relayed!</p>
            <code className="block text-xs break-all bg-muted rounded p-2">
              Transaction: {txHash}
            </code>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
