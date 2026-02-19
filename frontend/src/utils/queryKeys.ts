import type { GetProjectsRequest } from "@/types/projectTypes";

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params?: GetProjectsRequest) =>
      ["projects", "list", params] as const,
    detail: (projectId: string) =>
      ["projects", "detail", projectId] as const,
  },
};
