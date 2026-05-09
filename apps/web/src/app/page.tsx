import Link from 'next/link';

import { Hero } from '@/components/Hero';
import { GitHubContributions } from '@/components/GitHubContributions';
import { DownloadIcon, GitHubIcon, GlobeIcon, MailIcon } from '@/components/Icons';
import { ProjectCard } from '@/components/ProjectCard';
import { fetchProjects, fetchResumeVariants } from '@/lib/api';
import { CONTACT_EMAIL, GITHUB_DISPLAY, GITHUB_URL, SITE_DOMAIN, SITE_URL } from '@/lib/site';

const SKILLS = [
  {
    category: 'Languages',
    items: [
      ['Python', 95],
      ['C', 78],
      ['C++', 80],
      ['SQL', 86],
    ],
  },
  {
    category: 'Frameworks',
    items: [
      ['FastAPI', 92],
      ['Pydantic v2', 90],
      ['SQLAlchemy 2.0', 86],
      ['REST API Design', 88],
    ],
  },
  {
    category: 'AI / ML',
    items: [
      ['LLM Integration', 90],
      ['RAG Pipeline Design', 88],
      ['Vector Search', 86],
      ['Embeddings', 84],
    ],
  },
  {
    category: 'Infra & Tools',
    items: [
      ['PostgreSQL + pgvector', 88],
      ['Docker', 86],
      ['Git', 84],
      ['Claude / Codex / Gemini CLI', 82],
    ],
  },
];

const EXPERIENCE = [
  {
    date: '2024 - Present',
    role: 'AI Backend Engineer',
    company: 'Independent',
    desc: 'Building LLM infrastructure projects: self-hosted gateway APIs, RAG pipelines, vector search workflows, and agentic development systems.',
  },
  {
    date: '2020 - 2022',
    role: 'M.Tech Data Science',
    company: 'IIT Jammu',
    desc: 'Completed M.Tech in Data Science in 2022 with CGPA 7.93. Thesis: Encrypted Network Traffic Classification.',
  },
  {
    date: 'During B.Tech',
    role: 'Industrial Training',
    company: 'Software Cell, GNDU',
    desc: 'Industrial training through Guru Nanak Dev University, focused on practical software development workflows.',
  },
  {
    date: '2015 - 2019',
    role: 'B.Tech Computer Science',
    company: 'GNDU Amritsar',
    desc: 'Completed B.Tech in Computer Science and Engineering in 2019.',
  },
];

const EDUCATION = [
  ['M.Tech Data Science', 'IIT Jammu', '2022', 'CGPA 7.93'],
  ['B.Tech Computer Science and Engineering', 'GNDU Amritsar', '2019', ''],
];

const ROLE_TARGETS = [
  ['Role type', 'AI Backend Engineer / LLM Infrastructure Engineer'],
  ['Engagement', 'Full-time remote'],
  ['Company stage', 'Early-stage to Series B startups'],
  ['Geography', 'EU / US remote, async across timezones'],
  ['Not looking for', 'On-site roles, pure frontend roles, non-technical PM roles'],
];

const CREDIBILITY = [
  ['IIT Jammu', 'M.Tech Data Science, 2022, CGPA 7.93'],
  ['GNDU Amritsar', 'B.Tech CSE, 2019 + Software Cell industrial training'],
  [
    'GitHub',
    `${GITHUB_DISPLAY} shows public repositories, contribution activity, and project history.`,
  ],
  [
    'Measured outcomes',
    'Add latency, throughput, accuracy, or cost numbers only after they are measured.',
  ],
];

export default async function HomePage() {
  const [projects, resumes] = await Promise.all([fetchProjects(), fetchResumeVariants()]);
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 6);
  const defaultResume = resumes.find((resume) => resume.isDefault) ?? resumes[0];

  return (
    <main id="content" className="cyber-page">
      <Hero />
      <Divider />

      <CyberSection id="about" number="01" title="System Profile">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="text-fg/80 space-y-5 font-mono text-[14px] leading-8">
            <p>
              I am a{' '}
              <strong className="text-accent font-normal">28-year-old AI backend engineer</strong>{' '}
              based in <strong className="text-accent font-normal">Nangal, Punjab, India</strong>. I
              work remote-first from IST, communicate asynchronously, and prefer high-focus,
              low-noise execution.
            </p>
            <p>
              My technical base is{' '}
              <strong className="text-accent font-normal">
                M.Tech Data Science from IIT Jammu
              </strong>{' '}
              (2022, CGPA 7.93) and{' '}
              <strong className="text-accent font-normal">B.Tech CSE from GNDU Amritsar</strong>{' '}
              (2019), with industrial training at Software Cell, GNDU.
            </p>
            <p>
              Current focus: <strong className="text-accent font-normal">LLM infrastructure</strong>
              , RAG systems, inference APIs, vector search, and backend surfaces that technical
              founders can deploy, inspect, and trust. Long-term trajectory: systems-level AI
              engineering into deep-tech founder work.
            </p>
          </div>

          <Terminal />
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="skills" number="02" title="Tech Stack">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {SKILLS.map((group) => (
            <div
              key={group.category}
              className="cyber-panel hover:border-border-strong p-6 transition hover:shadow-[0_0_30px_rgba(0,255,242,0.07)]"
            >
              <p className="text-warning mb-4 font-mono text-[9px] uppercase tracking-[4px]">
                &gt; {group.category}
              </p>
              <div className="space-y-3">
                {group.items.map(([name, pct]) => (
                  <div key={name} className="grid grid-cols-[1fr_120px_34px] items-center gap-3">
                    <span className="text-fg font-mono text-[12px] tracking-[1px]">{name}</span>
                    <span className="bg-accent/10 h-[3px]">
                      <span
                        className="cyber-skill-bar from-success to-accent block h-full bg-gradient-to-r shadow-[0_0_8px_var(--accent)]"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="text-fg-muted text-right font-mono text-[9px]">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="projects" number="03" title="Mission Logs">
        <div className="grid gap-7 md:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              className={index === 0 ? 'md:col-span-2' : undefined}
            />
          ))}
        </div>
        <Link href="/work" data-cursor="hover" className="cyber-button mt-8">
          <span>Explore All Systems</span>
        </Link>
      </CyberSection>
      <Divider />

      <CyberSection id="experience" number="04" title="Timeline">
        <div className="cyber-timeline">
          {EXPERIENCE.map((item) => (
            <div key={item.role} className="relative mb-12 last:mb-0">
              <span className="cyber-timeline-dot" />
              <p className="text-warning mb-2 font-mono text-[10px] uppercase tracking-[3px]">
                {item.date}
              </p>
              <h3 className="font-display text-fg text-[15px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
                {item.role}
              </h3>
              <p className="text-accent mb-3 mt-1 font-mono text-[11px] uppercase tracking-[2px]">
                {item.company}
              </p>
              <p className="text-fg/65 max-w-3xl font-mono text-[12px] leading-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="education" number="05" title="Education">
        <div className="grid gap-4 md:grid-cols-2">
          {EDUCATION.map(([degree, school, year, detail]) => (
            <div key={degree} className="cyber-panel p-6">
              <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">{year}</p>
              <h3 className="font-display text-fg mt-3 text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
                {degree}
              </h3>
              <p className="text-accent mt-2 font-mono text-[12px] uppercase tracking-[2px]">
                {school}
              </p>
              {detail ? (
                <p className="text-fg/65 mt-4 font-mono text-[12px] leading-7">{detail}</p>
              ) : null}
            </div>
          ))}
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="target-role" number="06" title="What I Am Looking For">
        <div className="cyber-panel divide-border divide-y">
          {ROLE_TARGETS.map(([label, value]) => (
            <div key={label} className="grid gap-2 p-5 md:grid-cols-[220px_1fr]">
              <p className="text-warning font-mono text-[10px] uppercase tracking-[3px]">{label}</p>
              <p className="text-fg/75 font-mono text-[13px] leading-7">{value}</p>
            </div>
          ))}
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="credibility" number="07" title="Credibility Signals">
        <div className="grid gap-4 md:grid-cols-2">
          {CREDIBILITY.map(([label, value]) => (
            <div key={label} className="cyber-panel p-5">
              <p className="font-display text-accent text-[15px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
                {label}
              </p>
              <p className="text-fg/65 mt-3 font-mono text-[12px] leading-7">{value}</p>
            </div>
          ))}
        </div>
      </CyberSection>
      <Divider />

      <CyberSection id="github" number="08" title="Contribution Trace">
        <GitHubContributions />
      </CyberSection>
      <Divider />

      <CyberSection id="contact" number="09" title="Open Comms" centered>
        <div className="mx-auto max-w-2xl">
          <p className="text-fg/70 mb-10 font-mono text-[13px] leading-8">
            Available for{' '}
            <strong className="text-accent font-normal">full-time remote AI backend</strong> and{' '}
            <strong className="text-accent font-normal">LLM infrastructure</strong> roles with
            early-stage to Series B teams.
          </p>
          <div className="grid gap-4">
            <ContactLink
              href={SITE_URL}
              label="Website"
              value={SITE_DOMAIN}
              icon={<GlobeIcon className="h-4 w-4" />}
            />
            <ContactLink
              href={`mailto:${CONTACT_EMAIL}`}
              label="Electronic Mail"
              value={CONTACT_EMAIL}
              icon={<MailIcon className="h-4 w-4" />}
            />
            <ContactLink
              href="https://www.linkedin.com/in/sahilarchitect/"
              label="LinkedIn"
              value="linkedin.com/in/sahilarchitect"
            />
            <ContactLink
              href={GITHUB_URL}
              label="GitHub"
              value={GITHUB_DISPLAY}
              icon={<GitHubIcon className="h-4 w-4" />}
            />
            {defaultResume && (
              <ContactLink
                href={defaultResume.fileUrl}
                label="Resume / CV"
                value={`Download ${defaultResume.label}`}
                icon={<DownloadIcon className="h-4 w-4" />}
              />
            )}
          </div>
        </div>
      </CyberSection>

      <footer className="border-border/60 text-fg-muted relative z-[1] border-t px-6 py-8 text-center font-mono text-[10px] uppercase tracking-[3px]">
        SAHIL <span className="text-accent">{'//'}</span> AI.ML.SYSTEMS{' '}
        <span className="text-accent">{'//'}</span> ALL SYSTEMS OPERATIONAL
      </footer>
    </main>
  );
}

function CyberSection({
  id,
  number,
  title,
  children,
  centered = false,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <section id={id} className={centered ? 'cyber-section text-center' : 'cyber-section'}>
      <div className={centered ? 'cyber-section-header justify-center' : 'cyber-section-header'}>
        <div className="cyber-section-number">
          {'//'} {number}
        </div>
        <h2 className="cyber-section-title">{title}</h2>
        <div
          className={
            centered
              ? 'from-accent h-px w-20 bg-gradient-to-r to-transparent opacity-30'
              : 'cyber-section-line'
          }
        />
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="cyber-divider" />;
}

function Terminal() {
  return (
    <div className="cyber-panel">
      <div className="cyber-terminal-bar">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="text-fg-muted ml-auto font-mono text-[10px] uppercase tracking-[2px]">
          system_info.sh
        </span>
      </div>
      <div className="space-y-1 p-7 font-mono text-[13px] leading-8">
        <TerminalLine prompt cmd="cat /etc/engineer.conf" />
        <TerminalOut label="NAME" value="Sahil Bhatti" />
        <TerminalOut label="ROLE" value="AI Backend / LLM Infrastructure Engineer" />
        <TerminalOut label="LOCATION" value="Nangal, Punjab, IN" />
        <TerminalOut label="WEBSITE" value={SITE_DOMAIN} />
        <TerminalOut label="EMAIL" value={CONTACT_EMAIL} />
        <TerminalOut label="TIMEZONE" value="IST / ASYNC_READY" />
        <TerminalOut label="AVAILABILITY" value="FULL_TIME_REMOTE" />
        <div className="h-3" />
        <TerminalLine prompt cmd="cat ./education.json" />
        <TerminalOut label="MTECH" value="IIT Jammu / Data Science / 2022 / CGPA 7.93" />
        <TerminalOut label="BTECH" value="GNDU Amritsar / CSE / 2019" />
        <div className="h-3" />
        <TerminalLine prompt cmd="ls ./focus/" />
        <p className="text-fg-muted pl-5 text-[11px]">
          RAG_Pipelines/ LLM_Gateway/ Vector_Search/ Legacy_Modernization/
        </p>
      </div>
    </div>
  );
}

function TerminalLine({ prompt, cmd }: { prompt?: boolean; cmd: string }) {
  return (
    <p className="flex gap-3">
      {prompt && <span className="text-success shrink-0">$</span>}
      <span className="text-accent">{cmd}</span>
    </p>
  );
}

function TerminalOut({ label, value }: { label: string; value: string }) {
  return (
    <p className="pl-5">
      <span className="text-warning">{label}</span>=
      <span className="text-[#a8ff78]">&quot;{value}&quot;</span>
    </p>
  );
}

function ContactLink({
  href,
  label,
  value,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      data-cursor="hover"
      className="border-border bg-bg-elev text-fg hover:border-border-strong hover:bg-accent-muted flex items-center gap-4 border px-6 py-4 text-left transition hover:translate-x-1 hover:shadow-[0_0_20px_rgba(0,255,242,0.08)]"
    >
      <span className="text-accent flex h-5 w-5 items-center justify-center">
        {icon ?? <span className="text-sm">#</span>}
      </span>
      <span className="text-fg-muted font-mono text-[10px] uppercase tracking-[3px]">{label}</span>
      <span className="text-fg ml-auto break-all font-mono text-[13px]">{value}</span>
    </a>
  );
}
