import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { Property, ShowingAppointment } from "../utils/domainSchemas";
import { testProperties } from "../utils/testData";

const DomainDataContext = createContext({
  properties: [] as Property[],
  setProperties: undefined as unknown as Dispatch<SetStateAction<Property[]>>,
  showingAppointments: [] as ShowingAppointment[],
  setShowingAppointments: undefined as unknown as Dispatch<
    SetStateAction<ShowingAppointment[]>
  >,
});

/* eslint-disable-next-line react-refresh/only-export-components */
export const useDomainData = () => {
  return useContext(DomainDataContext);
};

export interface DomainDataProviderProps {
  children: ReactNode;
}

export default function DomainDataProvider({
  children,
}: DomainDataProviderProps) {
  const [properties, setProperties] = useState([] as Property[]);
  const [showingAppointments, setShowingAppointments] = useState(
    [] as ShowingAppointment[]
  );

  useEffect(() => {
    setProperties(testProperties);
  }, [setProperties]);

  return (
    <DomainDataContext.Provider
      value={{
        properties,
        setProperties,
        showingAppointments,
        setShowingAppointments,
      }}
    >
      {children}
    </DomainDataContext.Provider>
  );
}
