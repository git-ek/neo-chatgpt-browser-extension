# Changelog

## v0.0.1 (2025-10-13)

### 주요 개선 (Major Improvements)
- **Provider 아키텍처 리팩토링:** 스트리밍 로직을 `BaseSseProvider`와 `BaseJsonStreamProvider`로 추상화하여 코드 중복을 제거하고 확장성을 높였습니다.
- **Gemini 스트리밍 지원:** Gemini Provider가 스트리밍 응답을 처리하도록 개선하여 다른 Provider와 일관된 사용자 경험을 제공하고, 관련 에러 처리 버그를 수정했습니다.
- **설정 관리 구조화:** 여러 키로 분산되어 있던 Provider 설정을 단일 객체로 통합하여 관리의 용이성과 안정성을 향상시켰습니다.
- **UI 컴포넌트 단순화:** `ChatGPTContainer`를 제거하고 관련 상태 관리 로직을 `ChatGPTCard`로 통합하여 컴포넌트 구조를 단순화하고 명확하게 만들었습니다.

### 보안 (Security)
- **API 키 난독화:** 브라우저 스토리지에 저장되는 API 키에 Base64 난독화를 적용하여 평문 저장을 방지하고 보안을 최소한으로 강화했습니다.

### 코드 정리 (Cleanup)
- **불필요한 코드 제거:** 리팩토링 과정에서 더 이상 사용되지 않는 `safeFetchJson` 함수를 제거했습니다.
- **불필요한 파일 식별:** `ChatGPTContainer.tsx` 파일이 이제 불필요해졌음을 확인했습니다 (사용자 직접 삭제 필요).

## 2025-10-13
- Provider fetch/error 타입 분리 및 공통 유틸 함수화
- 옵션 UI 에러 안내 및 예외 처리 강화
- API Key 저장 정책 및 보안 안내 추가
- Gemini/OpenAI 최신 모델 지원
- 외부 라이선스 명시 및 README 개선

## 2025-10-13
- Gemini API provider 및 모델 선택 UI 구현
- 전체 코드 리뷰 및 문제점 도출

## 2025-10-13
- 프로젝트 구조 및 빌드/설치/clean 문서화
- 법적 문제점 검토 및 외부 라이선스 안내

---

모든 변경 내역은 GitHub 커밋 및 이슈에서 확인 가능합니다.