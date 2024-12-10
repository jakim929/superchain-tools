import { create } from "zustand";
import { Hash } from "viem";
import { persist } from "zustand/middleware";

type TransactionEntry = {
  chainId: number;
  hash: Hash;
};

type TransactionStore = {
  transactionEntryByHash: Record<Hash, TransactionEntry>;

  addTransaction: (entry: TransactionEntry) => void;
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactionEntryByHash: {},

      addTransaction: (entry: TransactionEntry) => {
        set((state) => ({
          transactionEntryByHash: {
            [entry.hash]: entry,
            ...state.transactionEntryByHash,
          },
        }));
      },
    }),
    {
      name: "superchain-tools-transaction-store",
    }
  )
);
