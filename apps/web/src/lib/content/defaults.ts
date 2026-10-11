import type { ContentType } from './schemas';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Starting data for a new draft. Required facts that only the owner knows are
 * TODO: markers, so a fresh draft can be saved but not published until filled.
 */
export function defaultData(type: ContentType): Record<string, unknown> {
  switch (type) {
    case 'profile':
      return { name: 'Sahil Bhatti' };
    case 'project':
      return {
        title: 'Untitled project',
        summary: '',
        startMonth: 'TODO: start month (YYYY-MM)',
        projectStatus: 'ongoing',
      };
    case 'reproduction':
      return { paperTitle: 'Untitled reproduction', claim: '' };
    case 'note':
      return { title: 'Untitled note', date: today(), bodyMarkdown: '' };
    case 'log':
      return { date: today(), text: 'TODO: what happened' };
    case 'teaching':
      return {
        course: 'TODO: course',
        institution: 'TODO: institution',
        startMonth: 'TODO: start month (YYYY-MM)',
      };
    case 'education':
      return {
        degree: 'TODO: degree',
        institution: 'TODO: institution',
        startMonth: 'TODO: start month (YYYY-MM)',
      };
  }
}
