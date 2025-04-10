import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Function to determine if we're in production (Netlify) environment
const isProduction = (): boolean => {
  return window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit');
};

// Function to get the base API URL
export const getApiBaseUrl = (): string => {
  return isProduction() ? '/.netlify/functions' : '';
};

// Fixes API paths for Netlify vs local development
export const getAdjustedApiPath = (path: string): string => {
  // If already starts with /.netlify, don't modify
  if (path.startsWith('/.netlify/')) {
    return path;
  }
  
  // If it's an API path and we're in production, adjust it
  if (path.startsWith('/api/') && isProduction()) {
    // Remove the leading '/api' and prepend the Netlify functions path
    return `/.netlify/functions/api${path.substring(4)}`;
  }
  
  return path;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Adjust the URL for Netlify Functions if needed
  const adjustedUrl = getAdjustedApiPath(url);

  const res = await fetch(adjustedUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    // Adjust the URL for Netlify Functions if needed
    const adjustedPath = getAdjustedApiPath(path);

    const res = await fetch(adjustedPath, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
