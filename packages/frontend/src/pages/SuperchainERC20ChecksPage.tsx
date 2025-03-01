import { useState } from "react";

import {
  checkSupportsERC7802Interface,
  allowsSuperchainTokenBridgeToMint,
  emitsCrosschainMintEvent,
  CheckResult,
  checkIsContractDeployed,
  allowsSuperchainTokenBridgeToBurn,
  emitsCrosschainBurnEvent,
} from "@superchain-tools/superchainerc20-checks";
import {
  useQueries,
  QueryObserverResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Address as zodAddress } from "abitype/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Address, Chain } from "viem";
import { fromZodError } from "zod-validation-error";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronUp, Pencil } from "lucide-react";
import { chainById, chains, networkByName } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NetworkPicker } from "@/components/NetworkPicker";

const checkQueriesForChain = (
  chain: Chain,
  address: Address,
  rpcUrlOverride: string | undefined
) => [
  {
    queryKey: ["contract-is-deployed", chain.id, address],
    queryFn: () => checkIsContractDeployed({ chain, rpcUrlOverride }, address),
    meta: {
      queryKey: ["contract-is-deployed", chain.id, address],
      chainId: chain.id,
      title: "Contract is deployed",
      description: "Contract is deployed",
    },
  },

  {
    queryKey: ["erc7802-compatibility", chain.id, address],
    queryFn: () =>
      checkSupportsERC7802Interface({ chain, rpcUrlOverride }, address),
    meta: {
      queryKey: ["erc7802-compatibility", chain.id, address],
      chainId: chain.id,
      title: "ERC-7802 Compatibility",
      description: "ERC-7802 Compatibility",
    },
  },
  {
    queryKey: ["bridge-minting", chain.id, address],
    queryFn: async () => {
      return allowsSuperchainTokenBridgeToMint(
        { chain, rpcUrlOverride },
        address
      );
    },
    meta: {
      queryKey: ["bridge-minting", chain.id, address],
      chainId: chain.id,
      title: "SuperchainTokenBridge can mint",
      description: "SuperchainTokenBridge can mint",
    },
  },
  {
    queryKey: ["crosschain-mint-event", chain.id, address],
    queryFn: () => emitsCrosschainMintEvent({ chain, rpcUrlOverride }, address),
    meta: {
      queryKey: ["crosschain-mint-event", chain.id, address],
      chainId: chain.id,
      title: "Token emits correct CrosschainMint event",
      description: "Token emits correct CrosschainMint event",
    },
  },
  {
    queryKey: ["bridge-burning", chain.id, address],
    queryFn: async () => {
      return allowsSuperchainTokenBridgeToBurn(
        { chain, rpcUrlOverride },
        address
      );
    },
    meta: {
      queryKey: ["bridge-burning", chain.id, address],
      chainId: chain.id,
      title: "SuperchainTokenBridge can burn",
      description: "SuperchainTokenBridge can burn",
    },
  },

  {
    queryKey: ["crosschain-burn-event", chain.id, address],
    queryFn: () => emitsCrosschainBurnEvent({ chain, rpcUrlOverride }, address),
    meta: {
      queryKey: ["crosschain-burn-event", chain.id, address],
      chainId: chain.id,
      title: "Token emits correct CrosschainBurn event",
      description: "Token emits correct CrosschainBurn event",
    },
  },
];

const useChecks = (chains: Chain[], address: Address) => {
  const { rpcOverrideByChainId } = useConfig();
  const queryClient = useQueryClient();
  const queries = chains.flatMap((chain) =>
    checkQueriesForChain(chain, address, rpcOverrideByChainId[chain.id])
  );

  const queryCountPerChain = queries.length / chains.length;
  const queryResults = useQueries({
    queries: queries,
  });

  const zipped = queries.map((query, index) => ({
    ...queryResults[index],
    meta: query.meta,
  }));

  const resultsByChainId = chains.reduce(
    (acc, chain, chainIndex) => {
      const queriesForChain = zipped.slice(
        chainIndex * queryCountPerChain,
        (chainIndex + 1) * queryCountPerChain
      );
      acc[chain.id] = {
        success: queriesForChain.every((result) => result.data?.success),
        results: queriesForChain,
        isLoading: queriesForChain.some((result) => result.isLoading),
        isError: queriesForChain.some((result) => result.isError),
        refetch: () =>
          queriesForChain.forEach((result) => {
            queryClient.resetQueries({
              queryKey: result.meta.queryKey,
            });
          }),
      };
      return acc;
    },
    {} as Record<
      number,
      {
        success: boolean;
        results: QueryObserverResult<CheckResult>[];
        isLoading: boolean;
        isError: boolean;
        refetch: () => void;
      }
    >
  );

  return {
    refetch: () =>
      zipped.forEach((result) => {
        queryClient.resetQueries({
          queryKey: result.meta.queryKey,
        });
      }),
    isLoading: queryResults.some((result) => result.isLoading),
    isError: queryResults.some((result) => result.isError),
    resultsByChainId,
  };
};

const ChainChecks = ({
  chain,
  results,
}: {
  chain: Chain;
  results: {
    success: boolean;
    results: QueryObserverResult<CheckResult>[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
}) => {
  return (
    <AccordionItem value={chain.name}>
      <AccordionTrigger className="px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{chain.name}</span>
            <span className="text-sm text-muted-foreground">({chain.id})</span>
          </div>

          <div className="flex items-center gap-2">
            {results.isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Checking...
                </span>
              </div>
            ) : results.isError ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-600">Error</span>
              </div>
            ) : results.success ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">
                  All checks passed
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">Some checks failed</span>
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="px-6 pb-4 space-y-6 divide-y">
          {results.results.map((result, index) => (
            <div key={index} className={index === 0 ? "pt-2" : "pt-6"}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    {result.isLoading && (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    )}
                    {!result.isLoading &&
                      !result.error &&
                      result.data?.success && (
                        <CheckCircle2 className="text-green-600 h-5 w-5" />
                      )}
                    {!result.isLoading &&
                      !result.error &&
                      !result.data?.success && (
                        <XCircle className="text-red-600 h-5 w-5" />
                      )}
                    {!result.isLoading && result.error && (
                      <AlertCircle className="text-amber-600 h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-2 flex-grow min-w-0">
                    <h3 className="font-medium">{result.meta?.title}</h3>
                    <p className="text-sm text-slate-600">
                      {result.meta?.description}
                    </p>

                    {result.error && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-md p-3 break-all whitespace-normal overflow-hidden">
                        {result.error.message}
                      </p>
                    )}

                    {!result.error && result.data?.success && (
                      <p className="text-sm text-green-700 bg-green-50 rounded-md p-3 break-all whitespace-normal overflow-hidden">
                        {result.data.message}
                      </p>
                    )}

                    {!result.error && result.data && !result.data.success && (
                      <p className="text-sm text-red-700 bg-red-50 rounded-md p-3 break-all whitespace-normal overflow-hidden">
                        {result.data.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface CheckerParams {
  address: Address | null;
  networkName: string;
  chainIds: number[];
}

const useCheckerParams = (): CheckerParams => {
  const [searchParams] = useSearchParams();

  return {
    address: searchParams.get("address") as Address | null,
    networkName: searchParams.get("networkName") || "",
    chainIds: searchParams.get("chainIds")?.split(",").map(Number) || [],
  };
};

const Checks = () => {
  const { address, networkName, chainIds } = useCheckerParams();

  const chainsToCheck = chainIds.map((id) => chainById[id]);

  const checksResult = useChecks(chainsToCheck, address!);

  if (!address || !networkName || !chainIds.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-4">
          <CardTitle>Compatibility Results</CardTitle>
          <CardDescription>
            Expand each chain to see detailed results
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => checksResult.refetch()}
          disabled={checksResult.isLoading}
          variant="outline"
        >
          {checksResult.isLoading && (
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
          )}
          Recheck All
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {chainsToCheck.map((chain) => (
            <ChainChecks
              key={chain.id}
              chain={chain}
              results={checksResult.resultsByChainId[chain.id]}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export const SuperchainERC20ChecksPage = () => {
  const navigate = useNavigate();
  const { networkName } = useConfig();
  const network = networkByName[networkName];
  const {
    address: urlAddress,
    networkName: urlNetworkName,
    chainIds,
  } = useCheckerParams();

  const { rpcOverrideByChainId } = useConfig();

  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState(
    urlAddress || "0xAaA2b0D6295b91505500B7630e9E36a461ceAd1b"
  );
  const [selectedChainIds, setSelectedChainIds] = useState<number[]>(
    chainIds || []
  );
  const [isOpen, setIsOpen] = useState(!urlAddress);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChainIds.length === 0) {
      setError("Please select at least one chain");
      return;
    }

    const result = zodAddress.safeParse(address);
    if (result.success) {
      setError(null);

      navigate({
        pathname: "/superchainerc20-checks",
        search: createSearchParams({
          address: result.data,
          networkName: networkName,
          chainIds: selectedChainIds.join(","),
        }).toString(),
      });
    } else {
      setError(fromZodError(result.error).message);
    }
  };

  const hasParamsChanged = () => {
    const addressChanged = address !== urlAddress;
    const networkChanged = networkName !== urlNetworkName;
    const chainsChanged =
      selectedChainIds.length !== chainIds.length ||
      !selectedChainIds.every((id) => chainIds.includes(id));

    return addressChanged || networkChanged || chainsChanged;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6 px-6 hover:bg-slate-50 transition-colors cursor-pointer rounded-xl">
              <div className="space-y-1.5">
                <CardTitle>SuperchainERC20 Checker</CardTitle>
                <CardDescription>
                  Verify if your ERC20 token implementation is compatible with
                  the Superchain bridge
                </CardDescription>
              </div>
              {urlAddress && (
                <div className="shrink-0 ml-4 text-muted-foreground">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </div>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <CardContent className="px-6 pb-6">
              <div className="space-y-6">
                <NetworkPicker />

                {network && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Select Chains
                      </label>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedChainIds(
                              network.chains.map((chain) => chain.id)
                            )
                          }
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedChainIds([])}
                        >
                          Select None
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {network.chains.map((chain) => (
                        <div key={chain.id} className="relative">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    selectedChainIds.includes(chain.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-start"
                                  onClick={() => {
                                    setSelectedChainIds((prev) =>
                                      prev.includes(chain.id)
                                        ? prev.filter((id) => id !== chain.id)
                                        : [...prev, chain.id]
                                    );
                                  }}
                                >
                                  <span className="truncate">{chain.name}</span>
                                  {rpcOverrideByChainId[chain.id] && (
                                    <Wrench className="h-3 w-3 ml-1" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                RPC overriden:{" "}
                                {rpcOverrideByChainId[chain.id]?.length > 50
                                  ? `${rpcOverrideByChainId[chain.id].slice(
                                      0,
                                      25
                                    )}...${rpcOverrideByChainId[chain.id].slice(
                                      -25
                                    )}`
                                  : rpcOverrideByChainId[chain.id]}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleAddressSubmit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter contract address"
                      className="flex-grow"
                    />
                    <Button
                      type="submit"
                      disabled={
                        selectedChainIds.length === 0 || !hasParamsChanged()
                      }
                    >
                      Check
                    </Button>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </form>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Checks />
    </div>
  );
};
