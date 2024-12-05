import { useQuery } from "@tanstack/react-query";
import { Chain } from "viem";
import {
  GetL2OutputReturnType,
  GetWithdrawalsReturnType,
  publicActionsL2,
} from "viem/op-stack";
import { usePublicClient } from "wagmi";

export const useBuildProveWithdrawal = ({
  withdrawal,
  output,
  l2Chain,
}: {
  withdrawal?: GetWithdrawalsReturnType[number];
  output?: GetL2OutputReturnType;
  l2Chain: Chain;
}) => {
  const publicClientL2 = usePublicClient({ chainId: l2Chain.id });
  return useQuery({
    enabled: !!publicClientL2 && !!withdrawal && !!output,
    queryKey: [
      "build-prove-withdrawal",
      l2Chain.id,
      withdrawal?.withdrawalHash,
      output?.l2BlockNumber.toString(),
    ],
    queryFn: async () => {
      if (!publicClientL2 || !withdrawal || !output) {
        return;
      }
      return await publicClientL2
        .extend(publicActionsL2())
        .buildProveWithdrawal({
          output,
          withdrawal,
        });
    },
  });
};
