import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { FullContextProps } from "./utils";
import { getBookData } from "./getBookData";

// Create the context with a default value
const MyContext = createContext<FullContextProps | null>(null);

// Create the provider component
export function DataContextProvider({
  children,
  selectedBook,
  series,
}: {
  children: ReactNode;
  selectedBook: number;
  series: string;
}) {
  const [value, setValue] = useState<FullContextProps | null>({});

  useEffect(() => {
    getBookData({ selectedBook, series }).then((data) => {
      setValue(data);
    });
  }, [selectedBook, series]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// Custom hook to use the context
export function useDataContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
}
