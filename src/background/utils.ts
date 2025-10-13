// 공통 fetch 및 에러 핸들링 유틸

export function handleProviderError(onEvent: (event: { type: 'error'; data: { error: string } }) => void, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  onEvent({ type: 'error', data: { error: msg } })
}
