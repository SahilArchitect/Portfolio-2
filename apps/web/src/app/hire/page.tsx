import type { Metadata } from 'next';

import { HirePanel } from '@/components/HirePanel';
import { Section } from '@/components/Section';
import { fetchResumeVariants } from '@/lib/api';
import { getCalLink } from '@/lib/cal';
import { submitInquiryAction } from './actions';

export const metadata: Metadata = {
  title: 'Hire',
  description: 'Contact Sahil Bhatti for AI backend and infrastructure work.',
};

export default async function HirePage() {
  const resumes = await fetchResumeVariants();
  const calLink = getCalLink();

  return (
    <main id="content">
      <Section
        eyebrow="Hire"
        title="Use the command surface or send a direct inquiry."
        intro="The form posts to the API inquiry endpoint and lets the backend score priority inline. Resume variants are tagged by role so recruiters can pick the closest proof packet."
      >
        <HirePanel
          resumes={resumes}
          calLink={calLink}
          action={submitInquiryAction}
          initialState={{ ok: false, message: '' }}
        />
      </Section>
    </main>
  );
}
