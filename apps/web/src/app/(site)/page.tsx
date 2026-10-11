import Link from 'next/link';

import { Markdown } from '@/components/content/Markdown';
import { JsonLd } from '@/components/content/JsonLd';
import { ProjectCard } from '@/components/content/ProjectCard';
import { ObfuscatedEmail } from '@/components/site/ObfuscatedEmail';
import { getCurrentCv, getImageDims, getProfile, listPublic } from '@/lib/content/public';
import { SITE_URL } from '@/lib/site';

export default async function HomePage() {
  const [profile, projects, log, cv, dims] = await Promise.all([
    getProfile(),
    listPublic('project'),
    listPublic('log'),
    getCurrentCv(),
    getImageDims(),
  ]);
  const featured = projects
    .filter((p) => p.data.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const name = profile?.name ?? 'Sahil Bhatti';

  const links: { key: string; node: React.ReactNode }[] = [];
  if (profile?.email) {
    links.push({ key: 'email', node: <ObfuscatedEmail reversed={profile.email.split('').reverse().join('')} /> });
  }
  if (profile?.githubUrl) links.push({ key: 'github', node: <a href={profile.githubUrl}>GitHub</a> });
  if (cv) links.push({ key: 'cv', node: <a href={cv.url}>CV (PDF)</a> });
  if (profile?.scholarUrl) links.push({ key: 'scholar', node: <a href={profile.scholarUrl}>Google Scholar</a> });
  if (profile?.orcidUrl) links.push({ key: 'orcid', node: <a href={profile.orcidUrl}>ORCID</a> });

  const sameAs = [profile?.githubUrl, profile?.scholarUrl, profile?.orcidUrl, profile?.linkedinUrl].filter(Boolean);

  return (
    <div className="space-y-10 pt-6 sm:pt-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name,
          url: SITE_URL,
          ...(sameAs.length ? { sameAs } : {}),
        }}
      />
      <section className="space-y-4">
        <h1 className="text-[1.75rem] leading-tight font-semibold">{name}</h1>
        {profile?.researchStatement && <p className="text-[1.12em] leading-snug">{profile.researchStatement}</p>}
        {links.length > 0 && (
          <p className="meta flex flex-wrap gap-x-2 gap-y-1 text-[0.85rem]">
            {links.map((link, i) => (
              <span key={link.key} className="flex gap-x-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                {link.node}
              </span>
            ))}
          </p>
        )}
      </section>

      {profile?.bioMarkdown && (
        <section aria-label="Bio">
          <Markdown source={profile.bioMarkdown} />
        </section>
      )}

      {profile && profile.interests.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Research interests</h2>
          <ul className="list-disc space-y-1 pl-5 marker:text-muted">
            {profile.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Selected research</h2>
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} dims={dims} />
          ))}
        </section>
      )}

      {log.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Log</h2>
          <ul className="space-y-1.5">
            {log.slice(0, 5).map((item) => (
              <li key={item.id} className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                <time className="meta pt-[0.2em]" dateTime={item.data.date}>
                  {item.data.date}
                </time>
                <span>{item.data.url ? <a href={item.data.url}>{item.data.text}</a> : item.data.text}</span>
              </li>
            ))}
          </ul>
          {log.length > 0 && (
            <p className="mt-3">
              <Link href="/log">All entries →</Link>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
