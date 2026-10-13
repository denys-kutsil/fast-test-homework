import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import { makeTestServices } from "features/books/model/__fixtures__/FakeBooksRepository";
import { ServicesContext, useServices } from "./ServicesContext";

const render = (element: React.ReactElement) => {
  const container = document.createElement("div");
  act(() => {
    ReactDOM.render(element, container);
  });
  return container;
};

describe("useServices", () => {
  it("returns the services from the nearest provider", () => {
    const { services } = makeTestServices();
    let received: unknown = null;

    const Probe = () => {
      received = useServices();
      return null;
    };

    render(
      <ServicesContext.Provider value={services}>
        <Probe />
      </ServicesContext.Provider>
    );

    expect(received).toBe(services);
  });

  it("fails loudly when used outside a provider", () => {
    const Probe = () => {
      useServices();
      return null;
    };

    // React logs the error it re-throws; keep the test output readable.
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow(/ServicesContext/);

    consoleError.mockRestore();
  });
});
