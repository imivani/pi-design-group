import type { Project } from './projects';

// Architecture firms come from the existing portfolio; unnamed firms stay unnamed.
export function renderingCredit(project: Project, plural = false): string {
  const architect = project.credit?.replace(/^Architecture by /, '').trim();
  return `${plural ? 'Renderings' : 'Rendering'} by ${architect || 'project architect'}`;
}

export function imageLabel(image: { medium: string; attribution?: string }): string {
  return image.medium === 'rendering' ? image.attribution || 'Rendering by project architect' : image.medium === 'drawing' ? 'Drawing' : '';
}
