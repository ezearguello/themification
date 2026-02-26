import type {
  FigmaTeamProjectsResponse,
  FigmaProjectFilesResponse,
  FigmaVariablesLocalResponse,
} from '@/types/figma';

// Route all requests through the local Next.js proxy to avoid CORS issues
function figmaFetch<T>(path: string, token: string): Promise<T> {
  const url = `/api/figma?path=${encodeURIComponent(path)}`;
  return fetch(url, {
    headers: { 'X-Figma-Token': token },
    cache: 'no-store',
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Figma API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  });
}

export async function getTeamProjects(
  teamId: string,
  token: string,
): Promise<FigmaTeamProjectsResponse> {
  return figmaFetch<FigmaTeamProjectsResponse>(
    `/v1/teams/${teamId}/projects`,
    token,
  );
}

export async function getProjectFiles(
  projectId: string,
  token: string,
): Promise<FigmaProjectFilesResponse> {
  return figmaFetch<FigmaProjectFilesResponse>(
    `/v1/projects/${projectId}/files`,
    token,
  );
}

export async function getLocalVariables(
  fileKey: string,
  token: string,
): Promise<FigmaVariablesLocalResponse> {
  return figmaFetch<FigmaVariablesLocalResponse>(
    `/v1/files/${fileKey}/variables/local`,
    token,
  );
}

/** Fetch all projects and their files for a team */
export async function getAllTeamFiles(
  teamId: string,
  token: string,
): Promise<
  Array<{
    projectId: string;
    projectName: string;
    files: Array<{ key: string; name: string }>;
  }>
> {
  const { projects } = await getTeamProjects(teamId, token);

  const results = [];
  for (const project of projects) {
    await delay(100); // rate limit safety
    const { files } = await getProjectFiles(project.id, token);
    results.push({
      projectId: project.id,
      projectName: project.name,
      files: files.map((f) => ({ key: f.key, name: f.name })),
    });
  }
  return results;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
