import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

export const keys = {
  settings: ["settings"] as const,
  today: ["today"] as const,
  tasks: ["tasks"] as const,
  goals: ["goals"] as const,
  money: ["transactions"] as const,
  habits: ["habits"] as const,
  habitLogs: ["habitLogs"] as const,
  mood: ["mood"] as const,
  sleep: ["sleep"] as const,
};
