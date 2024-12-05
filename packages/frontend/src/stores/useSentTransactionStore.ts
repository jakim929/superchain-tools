import { create } from "zustand";
import { Hash } from "viem";

type SentTransactionEntry = {
  chainId: number;
  hash: Hash;
};

type SentTransactionStore = {
  sentTransactions: SentTransactionEntry[];

  addSentTransaction: (entry: SentTransactionEntry) => void;
};

export const useSentTransactionStore = create<SentTransactionStore>(
  (set, get) => ({
    sentTransactions: [],

    addSentTransaction: (entry: SentTransactionEntry) => {
      set({
        sentTransactions: [...get().sentTransactions, entry],
      });
    },
  })
);
