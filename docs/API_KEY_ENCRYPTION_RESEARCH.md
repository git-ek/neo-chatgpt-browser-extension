# API Key 암호화 저장 연구 보고서

## 배경
브라우저 확장 프로그램의 API Key는 현재 평문으로 저장되고 있습니다. 보안 강화를 위해 암호화 저장 방안을 조사하였습니다.

## 주요 방법
1. **Web Crypto API 활용**
   - 브라우저 내장 암호화 API(`window.crypto.subtle`)를 사용해 AES, RSA 등으로 암호화 가능
   - 단, 키 관리가 어려움(사용자 비밀번호, OS 인증 등 별도 입력 필요)
   - 확장 프로그램의 storage API와 연계 시, 복호화 키를 안전하게 관리하기 어려움

2. **사용자 입력 기반 암호화**
   - 사용자가 직접 비밀번호를 입력해 암호화/복호화 키로 사용
   - UX 복잡, 비밀번호 분실 시 복구 불가

3. **OS/브라우저 인증 연동**
   - Chrome/Firefox의 Native Messaging, OS Keychain 연동 등
   - 설치/운영 복잡, 크로스 브라우저 호환성 낮음

## 결론 및 권장 방안
- Web Crypto API로 암호화는 가능하나, 복호화 키 관리가 실질적으로 안전하지 않음
- 사용자 비밀번호 기반 암호화는 UX/복구 문제로 권장하지 않음
- OS/브라우저 인증 연동은 구현 난이도 및 호환성 문제로 실서비스에 적합하지 않음
- **가장 안전한 방법은 API Key를 최소한으로 저장하고, 필요 시마다 입력받는 방식**
- 향후 브라우저 확장 API가 안전한 암호화/키 관리 기능을 제공할 경우 도입 검토

## 참고 자료
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Chrome Native Messaging](https://developer.chrome.com/docs/apps/nativeMessaging/)
- [Firefox Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)

---

문의 및 제안은 GitHub 이슈로 남겨주세요.