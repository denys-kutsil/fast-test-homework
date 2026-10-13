import { aBook, makeTestServices } from "./__fixtures__/FakeBooksRepository";

describe("BooksStore", () => {
  it("starts empty with a zero counter", () => {
    const { store } = makeTestServices();

    expect(store.allBooks).toEqual([]);
    expect(store.privateBooks).toEqual([]);
    expect(store.privateCount).toBe(0);
  });

  it("fills both lists on reload", async () => {
    const { repository, store } = makeTestServices();

    const reloading = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2"), aBook("3")], [aBook("3")]);
    await reloading;

    expect(store.allBooks.map((book) => book.id)).toEqual(["1", "2", "3"]);
    expect(store.privateBooks.map((book) => book.id)).toEqual(["3"]);
  });

  it("counts the private books, not every book it holds", async () => {
    const { repository, store } = makeTestServices();

    const reloading = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2"), aBook("3")], [aBook("3")]);
    await reloading;

    expect(store.privateCount).toBe(1);
  });

  it("passes the request options through to both reads", async () => {
    const { repository, store } = makeTestServices();
    const options = { signal: {} as AbortSignal };

    const reloading = store.reload(options);
    await repository.succeedReads([]);
    await reloading;

    expect(repository.requests).toEqual([options, options]);
  });

  it("lets a failed reload surface to the caller", async () => {
    const { repository, store } = makeTestServices();

    const settled = store.reload().then(() => "resolved", () => "rejected");
    await repository.failReads();

    expect(await settled).toBe("rejected");
  });
});
