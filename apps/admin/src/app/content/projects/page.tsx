import { AdminShell } from '@/components/AdminShell';
import { ProjectsManager } from '@/components/ProjectsManager';
import { adminCollection } from '@/lib/api';
import { fallbackProjects, type ProjectRow } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function ProjectsPage() {
  const admin = await requireAdmin();
  const projects = await adminCollection<ProjectRow>('/admin/projects', fallbackProjects);
  const normalized = projects.map((project, index) => ({
    ...project,
    display_order: project.display_order ?? index + 1,
    stack: Array.isArray(project.stack) ? project.stack : [],
  }));

  return (
    <AdminShell
      email={admin.email}
      title="Projects"
      eyebrow="Content"
      description="Create, edit, reorder, and preview project case studies before they appear on the public work pages."
    >
      <ProjectsManager projects={normalized} />
    </AdminShell>
  );
}
