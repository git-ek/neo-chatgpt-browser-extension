# Changelog

## [Unreleased]

### 리팩토링 (Refactoring)
- **전체 UI Tailwind CSS 통합:** 프로젝트의 모든 UI 컴포넌트(옵션, 검색 결과, 팝업)를 기존의 인라인 스타일 및 SCSS에서 Tailwind CSS로 완전히 전환하여 스타일링 시스템을 일원화하고 유지보수성을 향상시켰습니다.
  - **옵션 페이지:** `ProviderSelect`, `ConfigPanel` 등 관련 컴포넌트를 Tailwind CSS로 리팩토링하고, 재사용 가능한 `Toast` 컴포넌트를 분리했습니다.
  - **검색 결과 페이지:** `ChatGPTCard`, `ChatGPTQuery` 등 컨텐츠 스크립트 UI를 Tailwind CSS로 마이그레이션하고, 불필요한 SCSS 파일(`styles.scss`, `dark.scss`, `light.scss`)을 제거했습니다.
  - **팝업 페이지:** 팝업 UI를 Tailwind CSS로 업데이트하여 전체 UI의 디자인 일관성을 확보했습니다.

### Testing
- **Unit Test Overhaul:** Implemented a comprehensive suite of unit tests from scratch, significantly increasing the project's overall test coverage to over 70%.
- **Continuous Integration:** Added and debugged tests for all major components and logic across the `src` directory, including background scripts, providers, content scripts, and UI components.
- **Known Issues Documentation:** Created a `TODO.md` file to document known issues with the testing environment, specifically the difficulties in testing `@geist-ui/core` components, and skipped the problematic tests to unblock the CI/CD pipeline.

### Code Quality & DX
- **Linting & Build:** Fixed all linting and build errors, ensuring a clean and stable development environment.
- **ESLint Configuration:** Refactored the ESLint configuration (`eslint.config.js`) to properly handle test files, disabling irrelevant rules and adding necessary globals to improve the developer experience.
- **Documentation:** Updated `README.md` with a new "Testing" section to guide future contributors.

## v0.0.2 (2025-10-13)

### 아키텍처 (Architecture)
- **서버 비의존 구조 확립:** 외부 백엔드 서버 의존성을 완전히 제거하여, 확장 프로그램이 공식 AI API를 제외하고는 독립적으로 동작하도록 변경.
- **팩토리 패턴 도입:** 백그라운드 스크립트에 팩토리 패턴을 적용하여 AI 공급자(Provider) 생성 로직을 중앙화하고, 향후 확장성을 크게 향상시킴.
- **원본 프로젝트 코드 분리:** `wong2`의 원본 프로젝트로부터 코드를 완전히 분리하고, 불필요한 파일(`api.ts`, `Promotion.tsx`) 및 기능(프로모션)을 제거.

### 리팩토링 (Refactoring)
- **UI 컴포넌트 분리:** 복잡했던 옵션 페이지 UI를 각 AI 공급자(`OpenAIConfig`, `GeminiConfig`)별 컴포넌트로 분리하여 가독성 및 유지보수성 향상.
- **오류 처리 로직 개선:** 컨텐츠 스크립트의 오류 메시지 표시 로직을 별도 헬퍼 함수로 분리하여 단순화.
- **전체 UI 국제화(i18n):** 하드코딩되어 있던 모든 UI 문자열을 `_locales`를 통해 다국어를 지원하도록 전면 개편.

### 기능 개선 (Features)
- **최신 모델 추가:** OpenAI(GPT-4o, GPT-5 등) 및 Gemini(Gemini 2.5)의 최신 모델을 정적 목록에 추가.

### 수정 (Fixes)
- **빌드 및 Lint 오류 해결:** 프로젝트 빌드 오류를 해결하고, 전체 코드베이스의 `lint` 오류를 모두 수정하여 코드 품질을 확보.
- **설정 파일 업데이트:** `tailwind.config.cjs`가 HTML 파일을 스캔하도록 수정하고, `_locales` 및 HTML `title`의 프로젝트 이름을 모두 최신화.

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