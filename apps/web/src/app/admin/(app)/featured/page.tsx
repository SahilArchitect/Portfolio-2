import { FeaturedOrder } from '@/components/admin/FeaturedOrder';
import { listEntries } from '@/lib/content/repository';
import { requireOwnerPage } from '@/lib/server/owner';

export const metadata = { title: 'Featured order' };

export default async function FeaturedPage() {
  await requireOwnerPage();
  const projects = (await listEntries('project')).filter(
    (p) => p.status !== 'archived' && (p.data as { featured?: boolean }).featured,
  );
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Featured projects</h1>
      <p className="mt-1 text-sm text-muted">
        Order on the home page. Drag, or use the arrows. Mark a project as featured in its editor. Research interests are
        reordered in the profile.
      </p>
      <div className="mt-4">
        {projects.length ? (
          <FeaturedOrder items={projects.map((p) => ({ id: p.id, title: p.title, status: p.status }))} />
        ) : (
          <p className="text-sm text-muted">No featured projects.</p>
        )}
      </div>
    </div>
  );
}
