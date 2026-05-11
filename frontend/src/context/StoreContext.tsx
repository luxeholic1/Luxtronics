// src/context/StoreContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { storeConfig, StoreConfig } from '../config/storeConfig';

const StoreContext = createContext<StoreConfig>(storeConfig);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <StoreContext.Provider value={storeConfig}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
