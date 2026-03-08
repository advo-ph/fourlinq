import { useQuery } from "@tanstack/react-query";
import { projects as staticProjects } from "@/data/projects";

export interface Project {
  id: string;
  name: string;
  location: string;
  image: string;
}

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  } catch {
    return staticProjects;
  }
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });
}
