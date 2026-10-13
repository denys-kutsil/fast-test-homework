# Fast-Test Homework — Books

A refactor of the sample books app into a fast-test architecture: the views render and
nothing else, every piece of logic lives in a controller or in the domain model, and all
of that logic is covered by unit tests that never render React.

## Running it

Requires **Node 17 or newer** (developed on Node 22). The `start` and `build` scripts pass
`--openssl-legacy-provider`, and that flag does not exist before Node 17 — older versions
refuse to start rather than ignore it.

```bash
npm install
npm start          # http://localhost:3000
```

### Accept the API certificate first

The demo API serves a **self-signed certificate**. Until the browser is told to trust it,
every request from the app fails silently with a network error and the page just shows
"Could not load the books".

Open this URL once, accept the warning, then reload the app:

```
https://tdd.demo.reaktivate.com/v1/books/denys-kutsil-dev/
```

### Using your own data set

Books are namespaced per nickname. To run against your own, create `.env.local`:

```
REACT_APP_API_USER=your-nickname
```

Remember to accept the certificate for your own URL as well.

## Other commands

| Command | What it does |
| --- | --- |
| `npm test` | unit tests in watch mode (`CI=true npm test` for a single run) |
| `npm run typecheck` | `tsc --noEmit` — also checks the test files, which the build does not |
| `npm run build` | production build into `build/` |

`start` and `build` set `NODE_OPTIONS=--openssl-legacy-provider`. Webpack 4, which
`react-scripts` 3 depends on, hashes with md4, and modern Node refuses it with
`ERR_OSSL_EVP_UNSUPPORTED`. `cross-env` keeps that working on Windows too.

## Architecture

The layers follow the diagram from the task: **View → Controller → Repository → Gateway**.

```
src/
  app/                  application shell: layout and the sticky header
  components/           reusable UI, knows nothing about books
  features/books/       everything that does know about books
    model/              repository, store and domain types
    BooksPage/          each component sits next to its own controller and tests
    AddBookForm/
    BooksList/
  shared/
    api/                http gateway, errors, configuration
    di/                 service container and its React context
    lib/                useController, MobX configuration
```

**Views contain no logic at all.** Not a single `if`, `&&`, ternary or `!` appears in any
`.tsx` file. Visibility is driven by the native `hidden` attribute, and the controllers
expose booleans already in the shape the attribute needs — `isLoaderHidden` rather than
`isLoading`, so that negating anything in JSX is never necessary.

**Controllers** are plain classes with `makeAutoObservable`. They receive their
dependencies through the constructor, which is what lets a test build one with fakes and
no React in sight. `useController` creates a controller once, calls `init()` on mount and
`dispose()` on unmount; both are required by the `Controller` interface so no controller
can quietly skip cleaning up after itself. Every in-flight request is tied to an
`AbortController` that `dispose()` cancels.

**MobX** runs with `enforceActions: "always"`, so mutating an observable outside an action
throws. Mutations after an `await` are grouped into a single `runInAction`, so the loading
flag and the data land in one transaction rather than two renders.

**Dependencies** are built in one place, `shared/di/services.ts`, and reach components
through React context. The context value holds instances that never change, so it causes
no re-renders of its own — granular updates stay the job of `observer`.

## Testing

```bash
CI=true npm test
```

71 tests, in a few seconds. There is no React Testing Library, no enzyme and no
`jest.mock` on modules: controllers, the store and the repository are tested as ordinary
classes with hand-written fakes. Jest itself comes bundled inside `react-scripts`, so
nothing had to be installed to make this work.

Two suites do mount React, because they test the React seams themselves: `useController`,
which has to observe mount and unmount, and `useServices`, which has to fail outside a
provider. Both use `act()` with `react-dom/test-utils` rather than pulling in another
dependency.

## Notes on the API

- `POST /v1/books/{user}/` answers `{"status":"ok"}` and the created book comes back from
  later reads **without an `id`**. The repository therefore derives a stable key from
  `ownerId`, `name`, `author` and position. Position has to be part of it, because the
  data genuinely contains several books with identical name and author.
- After a book is created both lists are re-read from the API instead of being appended to
  locally. Since the response carries no id, anything added by hand would be invented data,
  and the header counter would drift away from the server.
- The sample code posted to `/v1/books/{user}/books`, which is not a real endpoint, so
  creating a book could never have worked as shipped.
- `PUT /v1/books/{user}/reset` clears your data if the test set gets messy.
