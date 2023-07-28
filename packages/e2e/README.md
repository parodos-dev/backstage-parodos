## @parodos/e2e-tests

End to end tests using [playwright](https://github.com/microsoft/playwright).

### Project dependencies

The tests use playright [project dependencies](https://playwright.dev/docs/next/test-projects#dependencies) to ensure 1 login can be used across multiple tests.

Playwright has unfortunately no support for persisting `sessionStorage` across tests like it does for `localStorage` and `cookies`.

[auth.setup.ts](./tests/auth.setup.ts) is the login test which writes the results of `sessionStorage` to a hidden file in `./playwright/.auth/user.json`.

A [playwright fixture](https://playwright.dev/docs/next/test-fixtures) in [sessionStorage.ts](./tests/sessionStorage.ts) then rehydrates the session from `./playwright/.auth/user.json`.

### running

2 root level scrips `yarn e2e` and `yarn e2e:ui` can be run from the root.

### TODO:

This only runs locally and as yet does not run in CI. A new `app-config.test.yaml` could be created and an image from [quay.io](https://quay.io/organization/parodos-dev) could be configured to run in a github action.
