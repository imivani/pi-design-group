// Facts shown on project pages. Only confirmed details belong here: a row
// appears only when its value is filled in. Years also come from the project
// record in practice.ts. A project led by a site photograph, with photographs in
// its gallery, is shown as Built; projects led by renderings show no status.
import { experience } from './practice';
import type { ProjectImage } from './project-details';

export type ProjectFacts = { year?: number | string; status?: string; size?: string; client?: string; role?: string };

// Add confirmed details by project id, e.g. 'darcy': { client: '…', size: '2.4 ha' }.
const confirmed: Record<string, ProjectFacts> = {};

export function projectFacts(id: string, imageKind: string, gallery: ProjectImage[]): [string, string][] {
  const given = confirmed[id] || {};
  const year = given.year ?? experience.find(item => item.project === id)?.year;
  const status = given.status ?? (imageKind === 'photograph' && gallery.some(image => image.medium === 'photograph') ? 'Built' : undefined);
  return ([
    ['Year', year], ['Status', status], ['Client', given.client], ['Size', given.size], ['Our role', given.role],
  ] as [string, string | number | undefined][])
    .filter((row): row is [string, string | number] => row[1] !== undefined && row[1] !== '')
    .map(([label, value]) => [label, String(value)]);
}
