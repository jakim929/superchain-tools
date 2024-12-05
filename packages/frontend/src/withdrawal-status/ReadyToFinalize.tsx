import { config } from "@/lib/wagmi";
import { useWithdrawalMessage } from "@/hooks/useWithdrawalMessage";
import { useMutation } from "@tanstack/react-query";
import { getWalletClient, switchChain } from "@wagmi/core";
import { Chain, Hash } from "viem";
import { walletActionsL1, GetWithdrawalsReturnType } from "viem/op-stack";
import { useTransactionReceipt, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

const useWriteFinalizeWithdrawal = () => {
  return useMutation({
    mutationFn: async ({
      l2Chain,
      withdrawal,
    }: {
      l2Chain: Chain;
      withdrawal: GetWithdrawalsReturnType[number];
    }) => {
      if (!withdrawal) {
        return;
      }

      await switchChain(config, {
        chainId: l2Chain.sourceId!,
      });

      const walletClient = await getWalletClient(config, {
        chainId: l2Chain.sourceId!,
      });

      // @ts-ignore TODO fix types for expected chains
      return await walletClient.extend(walletActionsL1()).finalizeWithdrawal({
        withdrawal,
        targetChain: l2Chain,
      });
    },
  });
};

export const ReadyToFinalize = ({
  transactionHash,
  l2Chain,
}: {
  transactionHash: Hash;
  l2Chain: Chain;
}) => {
  const { data: receipt, isLoading } = useTransactionReceipt({
    hash: transactionHash,
    chainId: l2Chain.id,
  });

  const withdrawal = useWithdrawalMessage(receipt);

  const {
    mutate,
    isPending,
    error,
    data: txHash,
  } = useWriteFinalizeWithdrawal();

  const { isLoading: isWaitingForTx, data: finalizeReceipt } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: l2Chain.sourceId,
    });

  if (finalizeReceipt) {
    return (
      <div>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  const isButtonDisabled =
    !withdrawal || isLoading || isPending || isWaitingForTx;

  return (
    <div>
      <Button
        disabled={isButtonDisabled}
        onClick={() => {
          if (!withdrawal) {
            return;
          }
          mutate({ l2Chain, withdrawal });
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending transaction...
          </>
        ) : isWaitingForTx ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for confirmation...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Finalize
          </>
        )}
      </Button>
    </div>
  );
};
