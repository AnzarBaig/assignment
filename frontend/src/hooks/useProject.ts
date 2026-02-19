import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/api/services/projectService";
import { queryKeys } from "@/utils/queryKeys";
import type {
  GetProjectsRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  DeleteProjectRequest,
} from "@/types/projectTypes";

// ── Queries ──────────────────────────────────────────────────────────

export const useProjects = (params: GetProjectsRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectService.getProjects(params),
  });
};

export const useProjectById = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectService.getProjectById({ id: projectId }),
    enabled: !!projectId && enabled,
  });
};

// ── Mutations ────────────────────────────────────────────────────────

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      projectService.updateProject(data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteProjectRequest) =>
      projectService.deleteProject(data),
    onSuccess: (_response, variables) => {
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};
