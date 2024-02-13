import React, { createContext, useEffect, useState, ReactNode } from "react";
import axios, { AxiosResponse } from "axios";

export interface Reports {
  monoPrints: number;
  monoCopies: number;
  colourPrints: number;
  colourCopies: number;
  month: string;
}

export interface Printer {
  address: string;
  name: string;
  serial: string;
  location: string;
  year: string;
  cyan: number;
  magenta: number;
  yellow: number;
  black: number;
  monoPrints: number;
  monoCopies: number;
  colourPrints: number;
  colourCopies: number;
  k1: number;
  k2: number;
  Reports: Reports[];
}

export interface GeneratedSchema {
  [year: string]: Printer[];
}

export interface PrinterData {
  [year: string]: Printer[];
}

const PRINTER_REST_API_URL = "http://10.214.200.39:8080/GetReport";

const Context = createContext<PrinterData | undefined>(undefined);

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider: React.FC<ContextProviderProps> = ({
  children,
}) => {
  const [printerList, setPrinterList] = useState<PrinterData | undefined>();

  useEffect(() => {
    if (!printerList) {
      axios
        .get<GeneratedSchema>(PRINTER_REST_API_URL)
        .then((response: AxiosResponse<GeneratedSchema>) => {
          const transformedData: PrinterData = Object.keys(
            response.data
          ).reduce((acc, key) => ({ ...acc, [key]: response.data[key] }), {});
          setPrinterList(transformedData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, []);

  return <Context.Provider value={printerList}>{children}</Context.Provider>;
};

export default Context;
