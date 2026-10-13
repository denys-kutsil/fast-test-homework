import { aBook, makeTestServices } from "features/books/model/__fixtures__/FakeBooksRepository";
import { AddBookFormController } from "./AddBookForm.controller";

const makeController = () => {
  const { repository, store, services } = makeTestServices();
  return { repository, store, controller: new AddBookFormController(services) };
};

const fillIn = (controller: AddBookFormController) => {
  controller.setName("Dune");
  controller.setAuthor("Frank Herbert");
};

describe("AddBookFormController", () => {
  it("blocks submission while the form is empty", () => {
    const { controller } = makeController();

    expect(controller.isSubmitDisabled).toBe(true);
  });

  it("blocks submission when only one field is filled", () => {
    const { controller } = makeController();

    controller.setName("Dune");

    expect(controller.isSubmitDisabled).toBe(true);
  });

  it("treats whitespace as an empty field", () => {
    const { controller } = makeController();

    controller.setName("   ");
    controller.setAuthor("   ");

    expect(controller.isSubmitDisabled).toBe(true);
  });

  it("allows submission once both fields are filled", () => {
    const { controller } = makeController();

    fillIn(controller);

    expect(controller.isSubmitDisabled).toBe(false);
  });

  it("sends the trimmed values to the repository", async () => {
    const { repository, controller } = makeController();

    controller.setName("  Dune  ");
    controller.setAuthor("  Frank Herbert  ");
    controller.submit();
    await repository.confirmAdd();

    expect(repository.addCalls).toEqual([{ name: "Dune", author: "Frank Herbert" }]);
  });

  it("blocks a second submission while the first is in flight", () => {
    const { controller } = makeController();

    fillIn(controller);
    controller.submit();

    expect(controller.isSubmitDisabled).toBe(true);
    expect(controller.areFieldsDisabled).toBe(true);
  });

  it("reloads the lists from the api after a successful add", async () => {
    const { repository, store, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.confirmAdd();
    await repository.succeedReads([aBook("1"), aBook("2")]);

    expect(store.allBooks.length).toBe(2);
    expect(store.privateCount).toBe(2);
  });

  it("clears the form after a successful add", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.confirmAdd();
    await repository.succeedReads([aBook("1")]);

    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
    expect(controller.isSubmitDisabled).toBe(true);
  });

  it("reports an error and keeps the values when the api rejects the book", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.rejectAdd();

    expect(controller.isErrorHidden).toBe(false);
    expect(controller.name).toBe("Dune");
    expect(controller.areFieldsDisabled).toBe(false);
  });

  it("clears the form as soon as the book is saved, before the list refreshes", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.confirmAdd();

    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
  });

  it("says the book was saved when only the refresh fails", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.confirmAdd();
    await repository.failReads();

    expect(controller.isErrorHidden).toBe(false);
    expect(controller.error).toMatch(/added/i);
    expect(controller.error).not.toMatch(/try again/i);
  });

  it("distinguishes a failed save from a failed refresh", async () => {
    const failedSave = makeController();
    fillIn(failedSave.controller);
    failedSave.controller.submit();
    await failedSave.repository.rejectAdd();

    const failedRefresh = makeController();
    fillIn(failedRefresh.controller);
    failedRefresh.controller.submit();
    await failedRefresh.repository.confirmAdd();
    await failedRefresh.repository.failReads();

    expect(failedRefresh.controller.error).not.toBe(failedSave.controller.error);
  });

  it("leaves the form empty when the refresh fails, so the book cannot be sent twice", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.confirmAdd();
    await repository.failReads();

    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
    expect(controller.isSubmitDisabled).toBe(true);
    expect(controller.areFieldsDisabled).toBe(false);
  });

  it("still keeps the values when the save itself fails", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    await repository.rejectAdd();

    expect(controller.name).toBe("Dune");
    expect(controller.author).toBe("Frank Herbert");
    expect(controller.isSubmitDisabled).toBe(false);
  });

  it("aborts an in-flight submission on dispose", () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    controller.dispose();

    expect(repository.requests[0].signal!.aborted).toBe(true);
  });

  it("does not report an error for a submission aborted on dispose", async () => {
    const { repository, controller } = makeController();

    fillIn(controller);
    controller.submit();
    controller.dispose();
    await repository.rejectAdd();

    expect(controller.error).toBe("");
  });
});
