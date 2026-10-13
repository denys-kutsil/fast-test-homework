import { useEffect, useState } from "react";
import { Services } from "../di/services";
import { useServices } from "../di/ServicesContext";

export interface Controller {
  init(): void;
  dispose(): void;
}

// Controllers are plain classes rather than subclasses of a shared base: MobX 6
// refuses makeAutoObservable on a class that has a superclass.
export type ControllerClass<T extends Controller> = new (services: Services) => T;

export const useController = <T extends Controller>(ControllerType: ControllerClass<T>): T => {
  const services = useServices();
  const [controller] = useState(() => new ControllerType(services));

  useEffect(() => {
    controller.init();
    return () => controller.dispose();
  }, [controller]);

  return controller;
};
