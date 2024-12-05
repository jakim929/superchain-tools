type Status = 'success' | 'failure'

export type CheckResult<T = undefined> =
  | (T extends undefined
      ? { success: true; message: string }
      : { success: true; data: T; message: string })
  | {
      success: false
      reason: string
    }
