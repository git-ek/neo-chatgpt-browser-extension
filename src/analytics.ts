export function captureEvent(event: string, properties?: object) {
  // 기본 콘솔 로깅
  console.log('[Analytics]', event, properties)
  // Google Tag Manager 등 외부 연동 예시
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...properties })
  }
}
