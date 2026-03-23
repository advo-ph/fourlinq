import { projects as staticProjects } from "@/data/projects";

export interface Project {
  id: string;
  name: string;
  location: string;
  image: string;
}

export function useProjects() {
  return { data: staticProjects, isLoading: false, error: null };
}
