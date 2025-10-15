# 멀티 OS 빌드/실행 테스트 결과

## 테스트 환경
- Windows 10/11 (Chrome, Firefox)
- macOS Ventura (Chrome, Firefox)
- Ubuntu 22.04 (Chrome, Firefox)

## 빌드 테스트
- `npm install` 및 `npm run build` 모두 정상 동작
- Chromium/Firefox용 번들 및 manifest 파일 정상 생성
- Tailwind, esbuild, autoprefixer 등 빌드 도구 OS별 문제 없음

## 실행 테스트
- Chrome/Firefox에서 확장 프로그램 정상 설치 및 동작 확인
- API Key 입력, 모델 선택, 응답 표시, 에러 안내 등 모든 기능 정상 작동
- 옵션/설정 UI, 다국어 지원, 테마 변경 등 호환성 문제 없음

## 발견된 이슈
- 일부 Linux 환경(특히 Wayland)에서 Chrome 확장 UI가 간헐적으로 깨지는 현상(브라우저 버그)
- macOS에서 시스템 다크모드 감지 지연(일부 환경)
- Windows에서 한글 입력 시 IME 버그(Chrome 고유 문제)

## 권장 사항
- 최신 브라우저 사용 권장
- 브라우저별 버그는 공식 이슈 트래커 참고
- OS별 특이점은 README FAQ에 추가 예정

---

상세 테스트 로그 및 추가 호환성 이슈는 <a href="https://github.com/git-ek/neo-chatgpt-browser-extension/issues">GitHub 이슈</a>에서 관리합니다.