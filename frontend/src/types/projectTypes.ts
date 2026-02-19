// ── Core domain types ────────────────────────────────────────────────

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Get Projects (list) ──────────────────────────────────────────────

export interface GetProjectsRequest {
  page?: number;
  limit?: number;
  search?: Record<string, unknown>;
  sort?: Record<string, 1 | -1>;
}

export interface GetProjectsResponse {
  success: true;
  data: {
    projects: Project[];
    pagination: Pagination;
  };
}

// ── Get Project by ID ────────────────────────────────────────────────

export interface GetProjectByIdRequest {
  id: string;
}

export interface GetProjectByIdResponse {
  success: true;
  data: {
    project: Project;
  };
}

// ── Create Project ───────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  description: string;
  status?: "active" | "inactive" | "archived";
}

export interface CreateProjectResponse {
  success: true;
  data: {
    project: Project;
  };
}

// ── Update Project ───────────────────────────────────────────────────

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  status?: "active" | "inactive" | "archived";
}

export interface UpdateProjectResponse {
  success: true;
  data: {
    project: Project;
  };
}

// ── Delete Project ───────────────────────────────────────────────────

export interface DeleteProjectRequest {
  id: string;
  hardDelete?: boolean;
}

export interface DeleteProjectResponse {
  success: true;
  data: {
    message: string;
  };
}
