export function captureEvent(event: string, properties?: object) {
  // 기본 콘솔 로깅
  console.log('[Analytics]', event, properties)
  // Google Tag Manager 등 외부 연동 예시
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...properties })
  }
}
