/**
 * Idempotent seed: inserts entries that do not exist yet (matched by type +
 * slug) and never overwrites anything already edited in the admin.
 *
 * Only facts already stated by the owner are filled in. Everything else is a
 * `TODO:` marker, which keeps the entry unpublishable until it is completed.
 */
import 'dotenv/config';

import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { legacyPosts, legacyProjects } from '../src/db/legacy-content';
import * as schema from '../src/db/schema';
import { titleFor, validateData, type ContentType, type Status } from '../src/lib/content/schemas';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');
const client = postgres(url, { max: 1, prepare: false });
const db = drizzle(client, { schema });

type Seed = {
  type: ContentType;
  slug: string;
  status: Status;
  data: Record<string, unknown>;
  sortOrder?: number;
  publishedAt?: Date;
};

const BIO = `I hold an M.Tech in Data Science from IIT Jammu (2022), where my thesis applied CNN, LSTM and ensemble models to classify encrypted network traffic without decryption. I'm now working on the security of AI systems — side-channel and fault-injection attacks on neural networks, model extraction, and defenses that are robust and cheap enough to deploy. I have served as a teaching assistant for Machine Learning, Probability & Statistics, Information Theory and Discrete Mathematics.`;

const seeds: Seed[] = [
  {
    type: 'profile',
    slug: 'profile',
    status: 'published',
    data: {
      name: 'Sahil Bhatti',
      researchStatement:
        'I study how AI systems leak and break — from learning algorithms down to the hardware they run on.',
      bioMarkdown: BIO,
      // Draft until reviewed: the bio is hidden publicly while this is false.
      bioReviewed: false,
      interests: [
        'TODO: review wording — Side-channel and fault-injection attacks on neural networks',
        'TODO: review wording — Model extraction',
        'TODO: review wording — Hardware-aware defenses that are robust and cheap enough to deploy',
      ],
      skills: [],
      email: 'sahil@bysahil.dev',
      githubUrl: 'https://github.com/SahilArchitect',
      scholarUrl: '',
      orcidUrl: '',
      linkedinUrl: 'https://www.linkedin.com/in/sahilarchitect/',
      showLocation: false,
    },
  },
  {
    type: 'education',
    slug: 'mtech-data-science-iit-jammu',
    status: 'draft',
    sortOrder: 0,
    data: {
      degree: 'M.Tech',
      field: 'Data Science',
      institution: 'Indian Institute of Technology Jammu',
      startMonth: 'TODO: start month in 2020 (YYYY-MM)',
      endMonth: 'TODO: end month in 2022 (YYYY-MM)',
      thesisTitle: 'TODO: exact thesis title (topic: encrypted network traffic classification)',
    },
  },
  {
    type: 'education',
    slug: 'btech-cse-gndu-amritsar',
    status: 'draft',
    sortOrder: 1,
    data: {
      degree: 'B.Tech',
      field: 'Computer Science and Engineering',
      institution: 'Guru Nanak Dev University, Amritsar',
      startMonth: 'TODO: start month in 2015 (YYYY-MM)',
      endMonth: 'TODO: end month in 2019 (YYYY-MM)',
    },
  },
  ...['Machine Learning', 'Probability & Statistics', 'Information Theory', 'Discrete Mathematics'].map(
    (course, index): Seed => ({
      type: 'teaching',
      slug: course.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-'),
      status: 'draft',
      sortOrder: index,
      data: {
        course,
        institution: 'TODO: institution',
        role: 'Teaching Assistant',
        startMonth: 'TODO: start month (YYYY-MM)',
        endMonth: 'TODO: end month (YYYY-MM)',
      },
    }),
  ),
  {
    type: 'project',
    slug: 'encrypted-traffic-classification',
    status: 'draft',
    data: {
      title: 'Encrypted Network Traffic Classification',
      summary:
        'M.Tech thesis at IIT Jammu (2022). Applied CNN, LSTM and ensemble models to classify encrypted network traffic without decrypting payloads.',
      startMonth: 'TODO: start month (YYYY-MM)',
      endMonth: 'TODO: end month in 2022 (YYYY-MM)',
      projectStatus: 'completed',
      tags: ['network traffic', 'encrypted traffic', 'deep learning'],
      featured: true,
      sections: {
        threatModel: 'TODO: who observes the traffic, what they can see (sizes, timings, directions), and what they want to infer.',
        method: 'TODO: dataset, features, CNN/LSTM/ensemble architectures, training and evaluation protocol.',
        results: 'TODO: measured results with figures/tables from the thesis.',
        limitations: 'TODO: limitations.',
        nextSteps: '',
        reproduce: 'TODO: commands, environment and seeds, or say the code is not public.',
      },
      links: { code: '', writeup: '', data: '' },
    },
  },
  // The previous site's projects, archived: hidden publicly, recoverable in the admin.
  ...legacyProjects
    .filter((project) => project.slug !== 'encrypted-network-traffic-classification')
    .map(
      (project): Seed => ({
        type: 'project',
        slug: project.slug,
        status: 'archived',
        data: {
          title: project.title,
          summary: project.summary,
          startMonth: 'TODO: start month (YYYY-MM)',
          projectStatus: 'completed',
          tags: project.stack,
          featured: false,
          sections: {
            threatModel: '',
            method: project.body,
            results: '',
            limitations: '',
            nextSteps: '',
            reproduce: '',
          },
          links: { code: project.repoUrl ?? '', writeup: '', data: '' },
        },
      }),
    ),
  ...legacyPosts.map(
    (post): Seed => ({
      type: 'note',
      slug: post.slug,
      status: 'archived',
      publishedAt: new Date(post.publishedAt),
      data: {
        title: post.title,
        date: post.publishedAt.slice(0, 10),
        tags: post.tags,
        summary: post.summary,
        bodyMarkdown: post.body,
      },
    }),
  ),
];

let inserted = 0;
for (const seed of seeds) {
  const [existing] = await db
    .select({ id: schema.entries.id })
    .from(schema.entries)
    .where(and(eq(schema.entries.type, seed.type), eq(schema.entries.slug, seed.slug)))
    .limit(1);
  if (existing) continue;
  const valid = validateData(seed.type, seed.data);
  if (!valid.ok) throw new Error(`Seed ${seed.type}/${seed.slug} is invalid: ${JSON.stringify(valid.errors)}`);
  const [row] = await db
    .insert(schema.entries)
    .values({
      type: seed.type,
      slug: seed.slug,
      title: titleFor(seed.type, valid.data),
      status: seed.status,
      data: valid.data,
      sortOrder: seed.sortOrder ?? 0,
      publishedAt: seed.status === 'published' ? new Date() : (seed.publishedAt ?? null),
    })
    .returning();
  if (row) {
    await db.insert(schema.revisions).values({
      entryId: row.id,
      kind: 'seed',
      snapshot: { title: row.title, slug: row.slug, status: row.status, data: row.data, publishAt: null },
    });
    inserted += 1;
  }
}

await client.end();
console.log(`seed complete: ${inserted} new entries, ${seeds.length - inserted} already present`);
