"use client";

import React, { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // ensure that the client is instantiated once and retained across re-renders
  const [client] = useState(new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
