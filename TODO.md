# TODO

This file lists the known issues and tasks that need to be addressed.

## Failing/Skipped Unit Tests

Some unit tests related to the options page are currently skipped due to a persistent and difficult-to-debug issue with the testing environment.

**Files affected:**
- `test/options/ProviderSelect.test.tsx` (all tests skipped)
- `test/options/GeminiConfig.test.tsx` (one test skipped)
- `test/options/OpenAIConfig.test.tsx` (one test skipped)

**The Problem:**

The issue seems to be a deep incompatibility between the `vitest` test environment, `preact`, and the `preact/compat` layer used to run the `@geist-ui/core` React component library.

When a test attempts to render a component that uses certain Geist UI components (like `Input` or any component that uses the `useTheme` hook), it fails with one of the following errors:
- `TypeError: Cannot read properties of undefined (reading '__H')`
- `TypeError: Cannot read properties of undefined (reading 'context')`

This indicates that Preact's internal hooks context is not being set up correctly when these components are rendered within the test environment.

**Attempts to fix:**
- Various adjustments to `test/setup.ts` (importing `preact/hooks`, `preact/debug`, `preact/compat`).
- Multiple different mocking strategies for the `@geist-ui/core` components.
- Using `act` and `waitFor` to handle async updates.

None of these attempts have been successful in creating a stable test environment for these specific components. The `onChange` handlers for the mocked `Input` components also fail to be called, which is likely related to the same underlying issue.

**Next Steps:**
- A deeper investigation into the interaction between `vitest`, `jsdom`, `preact`, and `@geist-ui/core` is needed.
- It might be worth creating a minimal reproduction case outside of this project to isolate the problem.
- Alternatively, the components could be tested using a full end-to-end testing framework like Playwright or Cypress, which would run them in a real browser environment.
