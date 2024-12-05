import { Prettify } from 'viem'

type CheckEvent = Prettify<
  (
    | {
        event: 'started'
      }
    | {
        event: 'progress'
        newProgress: string
      }
    | {
        event: 'failed'
        reason: string
      }
    | {
        event: 'success'
      }
    | {
        event: 'error'
        error: string
      }
  ) & {
    chainId: number
  }
>

export type CheckEventHandler = (event: CheckEvent) => void
