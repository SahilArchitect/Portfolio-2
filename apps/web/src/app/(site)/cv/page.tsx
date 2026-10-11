import type { Metadata } from 'next';
import Link from 'next/link';

import { Markdown } from '@/components/content/Markdown';
import { ObfuscatedEmail } from '@/components/site/ObfuscatedEmail';
import { getCurrentCv, getProfile, listPublic } from '@/lib/content/public';
import { formatMonthRange } from '@/lib/dates';

export const metadata: Metadata = {
  title: 'CV',
  description: 'Education, research, teaching and contact details.',
  alternates: { canonical: '/cv' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 border-b border-rule pb-1 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ when, children }: { when: string; children: React.ReactNode }) {
  return (
    <li className="grid gap-x-4 sm:grid-cols-[10rem_1fr]">
      <span className="meta pt-[0.25em]">{when}</span>
      <div>{children}</div>
    </li>
  );
}

export default async function CvPage() {
  const [profile, cv, education, teaching, projects] = await Promise.all([
    getProfile(),
    getCurrentCv(),
    listPublic('education'),
    listPublic('teaching'),
    listPublic('project'),
  ]);
  const theses = education.filter((e) => e.data.thesisTitle);

  return (
    <div className="pt-6 sm:pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[1.6rem] font-semibold">Curriculum Vitae</h1>
        {cv && (
          <a href={cv.url} className="chip" download>
            Download PDF
          </a>
        )}
      </div>

      {education.length > 0 && (
        <Section title="Education">
          <ul className="space-y-3">
            {education.map(({ id, data }) => (
              <Row key={id} when={formatMonthRange(data.startMonth, data.endMonth)}>
                <p>
                  <span className="font-semibold">{data.degree}</span>
                  {data.field && <>, {data.field}</>}
                </p>
                <p className="text-muted">{data.institution}</p>
                {data.notes && (
                  <div className="text-[0.95em]">
                    <Markdown source={data.notes} />
                  </div>
                )}
              </Row>
            ))}
          </ul>
        </Section>
      )}

      {theses.length > 0 && (
        <Section title="Thesis">
          <ul className="space-y-2">
            {theses.map(({ id, data }) => (
              <li key={id}>
                <span className="italic">{data.thesisTitle}</span>
                <span className="text-muted">
                  {' '}
                  — {data.degree}, {data.institution}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Research">
          <ul className="space-y-3">
            {projects.map(({ id, slug, data }) => (
              <Row key={id} when={formatMonthRange(data.startMonth, data.endMonth)}>
                <Link href={`/research/${slug}`}>{data.title}</Link>
                <p className="text-[0.95em] text-muted">{data.summary}</p>
              </Row>
            ))}
          </ul>
        </Section>
      )}

      {teaching.length > 0 && (
        <Section title="Teaching">
          <ul className="space-y-3">
            {teaching.map(({ id, data }) => (
              <Row key={id} when={formatMonthRange(data.startMonth, data.endMonth)}>
                <p>
                  <span className="font-semibold">{data.course}</span> — {data.role}
                </p>
                <p className="text-muted">{data.institution}</p>
                {data.description && (
                  <div className="text-[0.95em]">
                    <Markdown source={data.description} />
                  </div>
                )}
              </Row>
            ))}
          </ul>
        </Section>
      )}

      {profile && profile.skills.length > 0 && (
        <Section title="Skills">
          <p>{profile.skills.join(', ')}</p>
        </Section>
      )}

      {profile && (
        <Section title="Contact">
          <ul className="space-y-1">
            {profile.email && (
              <li>
                <ObfuscatedEmail
                  reversed={profile.email.split('').reverse().join('')}
                  label="Email"
                />
              </li>
            )}
            {profile.githubUrl && (
              <li>
                <a href={profile.githubUrl}>GitHub</a>
              </li>
            )}
            {profile.linkedinUrl && (
              <li>
                <a href={profile.linkedinUrl}>LinkedIn</a>
              </li>
            )}
            {profile.location && <li className="text-muted">{profile.location}</li>}
          </ul>
        </Section>
      )}
    </div>
  );
}
