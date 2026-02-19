export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  PROJECTS: {
    SEARCH: "/projects/search",
    SEARCH_BY_ID: "/projects/search-by-id",
    CREATE: "/projects/create",
    UPDATE: "/projects/update",
    DELETE: "/projects/delete",
  },
} as const;
