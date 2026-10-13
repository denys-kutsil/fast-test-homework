import { createContext, useContext } from "react";
import { Services } from "./services";

export const ServicesContext = createContext<Services | null>(null);

export const useServices = (): Services => {
  const services = useContext(ServicesContext);

  if (services === null) {
    throw new Error("useServices was called outside of a ServicesContext.Provider");
  }

  return services;
};
