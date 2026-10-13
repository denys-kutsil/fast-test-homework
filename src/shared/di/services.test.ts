import { createServices } from "./services";

describe("createServices", () => {
  it("builds both services", () => {
    const services = createServices();

    expect(services.booksRepository).toBeDefined();
    expect(services.booksStore).toBeDefined();
  });

  it("gives the store the same repository it exposes", async () => {
    const services = createServices();
    const calls: string[] = [];
    services.booksRepository.getAll = async () => {
      calls.push("getAll");
      return [];
    };
    services.booksRepository.getPrivate = async () => {
      calls.push("getPrivate");
      return [];
    };

    await services.booksStore.reload();

    expect(calls.sort()).toEqual(["getAll", "getPrivate"]);
  });
});
