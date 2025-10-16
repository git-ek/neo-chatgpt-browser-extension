# GEMINI 준수 규칙 및 지침 (Machine-Readable Version)

## Level 1: 핵심 원칙 (Core Principles) - 최우선 순위

### L1-01 사실 기반 (Fact-Based)
- IF 응답을 생성할 때 THEN 반드시 `<CONTEXT>` 또는 `<INPUT>`에 명시적으로 포함된 정보만 사용한다.
- MUST NOT 사용자의 요청에 없는 정보, 내부 지식, 이전 대화, 추측, 가정, 예상 등을 포함한다.
- MUST 정확한 파일 경로, 함수명, 규칙 번호만 사용한다.

### L1-02 내용 무결성 (Content Integrity)
- IF 문서를 업데이트할 때 THEN 변경 요청이 없는 기존 내용은 삭제하거나 변경해서는 안 된다.
- MUST 최종 diff에서 의도하지 않은 생략/변경이 없어야 한다.

### L1-03 임의 수정 금지 (No Arbitrary Modification)
- MUST NOT 파일/코드/문서 내용을 사용자의 명시적인 허락 없이 임의로 수정, 추가, 삭제, 변경하지 않는다.
- IF "더 나은" 코드/구조를 제안할 경우 THEN 반드시 별도로 제안하고, 사용자의 확인을 받아야 한다.

### L1-04 모호성 처리 (Ambiguity Handling)
- IF 사용자 요청이 불명확하거나 규칙과 충돌한다면 THEN 추측하여 진행하지 않는다.
- MUST 사용자에게 명확한 지시/설명을 요청하고, 어떤 규칙과 충돌하는지 알린다.

---

## Level 2: 프로젝트 제약 (Project Constraints)

### L2-01 아키텍처 준수 (Adherence to Architecture)
- MUST 프로젝트에 이미 정의된 아키텍처(예: OS 독립적 PAL 구조)와 설계 원칙을 반드시 준수한다.

### L2-02 플랫폼 및 환경 존중 (Respect for Platforms & Environments)
- MUST 프로젝트가 대상으로 하는 특정 플랫폼(예: Linux, FreeRTOS)과 환경의 제약 조건을 존중하고 완벽하게 지원하는 코드를 작성한다.

### L2-03 라이브러리 및 프레임워크 일관성 (Library & Framework Consistency)
- IF 새로운 기능을 구현할 때 THEN 프로젝트에서 이미 사용 중인 라이브러리 및 프레임워크(예: openssl, mbedtls)를 우선적으로 일관성 있게 사용한다.
- MUST 임의로 새로운 외부 종속성을 추가하지 않는다.

### L2-04 기존 구현 패턴 준수 (Compliance with Existing Patterns)
- MUST 기존 코드의 설계 패턴(예: L2 이더넷 프레임 처리)과 구현 방식을 분석하고 이를 따른다.

### L2-05 코드 표준 준수 절차 (Procedure for Code Standard Compliance)
- MUST 프로젝트에서 지정한 코드 표준(예: C99, MISRA C)을 엄격히 준수한다.
- 코드 리뷰 및 생성 시, 프로젝트 내에 존재하는 관련 코딩 규칙 및 스타일 가이드 문서를 참조하고 그 우선순위를 따른다.

### L2-06 데이터 타입 및 초기화 (Data Types and Initialization)
- MUST 프로젝트에서 정의한 표준 데이터 타입(예: AUTOSAR 표준 타입)을 사용한다.
- MUST 모든 변수는 선언 시 즉시 초기화한다.

### L2-07 상용화 수준 품질 (Commercial-Grade Quality)
- MUST 프로젝트의 개발 수명 주기(예: V-모델), 설계 원칙, 단위 테스트 가이드라인을 준수하여 상용화 수준의 품질을 보장한다.
- MUST 단위 테스트 작성 시 100% 코드 커버리지를 목표로 한다.

### L2-08 핵심 프로젝트 문서 (Core Project Documents)
- MUST 프로젝트 규모를 확인 한 후, 다음 핵심 프로젝트 문서를 숙지하고 준수한다.

#### 중급 프로젝트 가이드라인 (Medium Project Guidelines)
- `~/work/test_work/github/doc/medium_project_guidelines/safety/00_MISRA_C_2012_AI.md`
- `~/work/test_work/github/doc/medium_project_guidelines/safety/01_SSRS_guidance.md`
- `~/work/test_work/github/doc/medium_project_guidelines/safety/02_SADS_guidance.md`
- `~/work/test_work/github/doc/medium_project_guidelines/safety/03_SUDS_guidance.md`
- `~/work/test_work/github/doc/medium_project_guidelines/01_Common_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/02_Project_Lifecycle_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/03_Software_Design_Principles.md`
- `~/work/test_work/github/doc/medium_project_guidelines/04_Project_Structure_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/05_Coding_Rules_AI.md`
- `~/work/test_work/github/doc/medium_project_guidelines/05_Coding_Rules.md`
- `~/work/test_work/github/doc/medium_project_guidelines/06_Application_Development_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/07_Unit_Testing_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/08_Advanced_Unit_Testing_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/09_Memory_Management_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/10_Changelog_Guide.md`
- `~/work/test_work/github/doc/medium_project_guidelines/11_TODO.md`
- `~/work/test_work/github/doc/medium_project_guidelines/12_Build_Guide.md`

#### 소규모 프로젝트 가이드라인 (Small Project Guidelines)
- `~/work/test_work/github/doc/small_project_guidelines/01_Common_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/02_Project_Lifecycle_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/03_Software_Design_Principles.md`
- `~/work/test_work/github/doc/small_project_guidelines/04_Changelog_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/05_TODO_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/10_C_Project_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/11_C_Project_Structure_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/12_C_Coding_Rules.md`
- `~/work/test_work/github/doc/small_project_guidelines/13_C_Unit_Testing_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/20_Python_Project_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/21_Python_Project_Structure_Guide.md`
- `~/work/test_work/github/doc/small_project_guidelines/22_Python_Coding_Rules.md`
- `~/work/test_work/github/doc/small_project_guidelines/23_Python_Unit_Testing_Guide.md`

#### PAL 프로젝트 문서 (PAL Project Documents)
- `~/work/test_work/github/project_t1s/PAL/doc/project/Changelog.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/Development_Plan.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/integration_test_guide.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/PAL_Architecture_Design.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/PAL_Build_Guide.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/PAL_Project_Structure_Guide.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/Phase1_Deliverables.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/Phase2_Deliverables.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/requirements.md`
- `~/work/test_work/github/project_t1s/PAL/doc/project/TODO.md`
- `~/work/test_work/github/project_t1s/PAL/doc/safety/01_SSRS_for_PAL.md`
- `~/work/test_work/github/project_t1s/PAL/doc/safety/02_SADS_for_PAL.md`
- `~/work/test_work/github/project_t1s/PAL/doc/safety/03_SUDS_for_PAL.md`

#### 핵심 헤더 파일 (Core Header Files)
- `~/work/test_work/github/project_t1s/PAL/include/pal_common.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_config.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_crypto.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_dbg.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_lin.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_macsec.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_msgq.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_mutex.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_net.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_slab.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_thread.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_time.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_timer.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_types.h`
- `~/work/test_work/github/project_t1s/PAL/include/pal_utils.h`
- `~/work/test_work/github/project_t1s/MIDDLE/net_stack/include/net_stack.h`

---

## Level 3: 스타일 및 프로세스 (Style & Process)

### L3-01 문서 계층 구조 (Documentation Hierarchy)
- IF 상위 가이드라인(예: `~/work/test_work/github/doc/medium_project_guidelines`)이 존재한다면 THEN 하위 프로젝트별 문서는 반드시 상위 가이드라인을 따르는 하위 문서로 작성한다.

### L3-02 상세함과 명확성 (Detail and Clarity)
- MUST 모든 문서는 프로젝트를 처음 접하는 개발자도 즉시 이해하고 구현할 수 있도록 상세하고 명확하게 작성한다.
- IF 관련 템플릿(`templates/`)이 존재한다면 THEN 문서 생성/수정 시 반드시 사용한다.
- 설계 문서 작성 시, 주요 결정사항별로 반드시 '근거(Rationale)'를 포함한다.

### L3-03 문체 통일 (Consistent Tone and Style)
- MUST 모든 문서의 문장 종결 어미는 '...한다' 스타일로 통일한다.
- 미사어구(불필요한 수식어)는 최소화하여 간결하고 명확하게 작성한다.

### L3-04 마크다운 형식
- MUST 모든 마크다운 문서는 채팅창에 4개의 백틱 블록으로 감싸서 출력한다.

---

## 최종 자가 검증 (Final Self-Verification)

### S-01 규칙 준수 확인 (Rule Compliance Check)
- IF 응답을 생성하기 전 THEN 아래 체크리스트를 반드시 수행한다:
    - [ ] S-02 준수: 세션의 첫 상호작용인 경우, S-02 절차를 따랐는지 확인했는가?
    - [ ] Level 1 핵심 원칙 모두 준수
    - [ ] Level 2 프로젝트 제약과 충돌 시 경고 및 사용자 확인 요청 포함
    - [ ] Level 3 형식 및 스타일 준수
    - [ ] 응답이 오직 `<CONTEXT>`와 `<INPUT>` 기반이며, 이전 대화에 의존하지 않음

### S-02 세션 시작 절차 준수 (Adherence to Session Start Procedure)
- IF 세션이 시작되고 첫 응답을 생성할 때 THEN 반드시 '중급' 또는 '소규모' 가이드라인 선택 질문을 포함한다.
- MUST NOT 단순 확인 응답(예: '알겠습니다', 'Got it')만으로 첫 상호작용을 종결하지 않는다.
---

## 용어 정의 (Terminology)

- `<CONTEXT>`: 현재 작업에 대해 명시적으로 제공된 문서/코드/입력 정보
- `<INPUT>`: 사용자 요청, 명시적 입력, 지시사항

## Gemini Added Memories
- 파일 수정 시 `replace` 도구를 우선 사용하고, `write_file` 사용 시에는 '읽기-수정-쓰기' 절차를 반드시 준수한다.
