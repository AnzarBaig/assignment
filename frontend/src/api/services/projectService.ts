import apiClient from "@/api/client";
import { API_ENDPOINTS } from "@/constant/apiEndpoints";
import type {
  GetProjectsRequest,
  GetProjectsResponse,
  GetProjectByIdRequest,
  GetProjectByIdResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectRequest,
  DeleteProjectResponse,
} from "@/types/projectTypes";

export const projectService = {
  getProjects: async (
    params: GetProjectsRequest = {}
  ): Promise<GetProjectsResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.SEARCH,
      params
    );
    return response.data;
  },

  getProjectById: async (
    params: GetProjectByIdRequest
  ): Promise<GetProjectByIdResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.SEARCH_BY_ID,
      params
    );
    return response.data;
  },

  createProject: async (
    params: CreateProjectRequest
  ): Promise<CreateProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.CREATE,
      params
    );
    return response.data;
  },

  updateProject: async (
    params: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.UPDATE,
      params
    );
    return response.data;
  },

  deleteProject: async (
    params: DeleteProjectRequest
  ): Promise<DeleteProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.DELETE,
      params
    );
    return response.data;
  },
};
