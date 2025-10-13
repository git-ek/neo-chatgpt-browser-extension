// 공통 fetch 및 에러 핸들링 유틸

export async function safeFetchJson(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const resp = await fetch(url, options)
    if (!resp.ok) {
      const error = await resp.json().catch(() => ({}))
      throw new Error(!error || Object.keys(error).length === 0 ? `${resp.status} ${resp.statusText}` : JSON.stringify(error))
    }
    return await resp.json()
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err))
  }
}

export function handleProviderError(onEvent: (event: { type: 'error'; data: { error: string } }) => void, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  onEvent({ type: 'error', data: { error: msg } })
}
