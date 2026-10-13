import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import { ServicesContext } from "shared/di/ServicesContext";
import { Services } from "shared/di/services";
import { Controller, useController } from "./useController";

let created: SpyController[] = [];

class SpyController implements Controller {
  initCalls = 0;
  disposeCalls = 0;
  readonly services: Services;

  constructor(services: Services) {
    this.services = services;
    created.push(this);
  }

  init = () => {
    this.initCalls += 1;
  };

  dispose = () => {
    this.disposeCalls += 1;
  };
}

const Probe = () => {
  useController(SpyController);
  return null;
};

const services = ({ booksRepository: {} } as unknown) as Services;

const render = (container: HTMLDivElement) => {
  act(() => {
    ReactDOM.render(
      <ServicesContext.Provider value={services}>
        <Probe />
      </ServicesContext.Provider>,
      container
    );
  });
};

describe("useController", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    created = [];
    container = document.createElement("div");
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  });

  it("initialises the controller once on mount", () => {
    render(container);

    expect(created.length).toBe(1);
    expect(created[0].initCalls).toBe(1);
  });

  it("hands the controller the services from the context", () => {
    render(container);

    expect(created[0].services).toBe(services);
  });

  it("keeps the same controller across re-renders", () => {
    render(container);
    render(container);

    expect(created.length).toBe(1);
    expect(created[0].initCalls).toBe(1);
  });

  it("disposes the controller on unmount", () => {
    render(container);
    const controller = created[0];

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    expect(controller.disposeCalls).toBe(1);
  });
});
