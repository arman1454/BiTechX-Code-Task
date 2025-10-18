"use client";

import React, { createContext, useContext, useState } from "react";
import { Spinner } from "@heroui/spinner";

const LoadingContext = createContext({
  show: () => {},
  hide: () => {},
  loading: false,
});

export function useLoading() {
  return useContext(LoadingContext) as {
    show: () => void;
    hide: () => void;
    loading: boolean;
  };
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const show = () => setLoading(true);
  const hide = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ show, hide, loading }}>
      {children}

      {loading && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            backdrop-blur-lg bg-white/10
            transition-all duration-200
          "
        >
          <Spinner size="lg" className="text-secondary" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}
