'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { cn } from '@engine-room/ui';

import type { InquiryFormState } from '@/app/hire/actions';
import { CalEmbed } from '@/components/CalEmbed';
import { CONTACT_EMAIL } from '@/lib/site';
import type { ResumeVariantView } from '@/lib/view-models';
import { DownloadIcon, MailIcon, SparkIcon } from './Icons';

type HirePanelProps = {
  resumes: ResumeVariantView[];
  calLink: string;
  action: (state: InquiryFormState, formData: FormData) => Promise<InquiryFormState>;
  initialState: InquiryFormState;
};

const INTENTS = ['full-time role', 'contract', 'collaboration', 'other'] as const;

export function HirePanel({ resumes, calLink, action, initialState }: HirePanelProps) {
  const [state, formAction] = useFormState(action, initialState);
  const [selectedResume, setSelectedResume] = useState(resumes[0]?.slug ?? '');
  const activeResume = resumes.find((resume) => resume.slug === selectedResume) ?? resumes[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="cyber-panel p-5">
        <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
          Command surface
        </p>
        <div className="border-border bg-bg mt-5 grid grid-cols-[72px_1fr] items-center gap-4 border p-3">
          <Image
            src="/sahil-profile.jpeg"
            alt="Sahil Bhatti"
            width={72}
            height={72}
            className="border-border-strong h-[72px] w-[72px] border object-cover"
          />
          <div>
            <p className="font-display text-fg text-[13px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
              Sahil Bhatti
            </p>
            <p className="text-fg-muted mt-1 font-mono text-[10px] uppercase tracking-[2px]">
              AI backend systems operator
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <CommandLine
            icon={<MailIcon className="h-4 w-4" />}
            label="Copy email"
            value={CONTACT_EMAIL}
          />
          <CommandLine
            icon={<SparkIcon className="h-4 w-4" />}
            label="Best fit"
            value="AI backend, RAG, observability"
          />
          <CommandLine
            icon={<DownloadIcon className="h-4 w-4" />}
            label="Resume"
            value={activeResume?.label ?? 'Default'}
          />
        </div>

        <div id="resume" className="mt-8">
          <h2 className="font-display text-fg text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
            Resume variants
          </h2>
          <div className="mt-4 grid gap-3">
            {resumes.map((resume) => (
              <button
                key={resume.slug}
                type="button"
                onClick={() => setSelectedResume(resume.slug)}
                data-cursor="hover"
                className={cn(
                  'min-h-11 border p-4 text-left transition',
                  selectedResume === resume.slug
                    ? 'border-border-strong bg-accent-muted text-fg'
                    : 'border-border text-fg-muted hover:text-accent',
                )}
              >
                <span className="font-mono text-[12px] uppercase tracking-[2px]">
                  {resume.label}
                </span>
                <span className="text-mono-sm mt-2 block font-mono">
                  {resume.roleKeywords.join(' / ')}
                </span>
              </button>
            ))}
          </div>

          {activeResume && (
            <a
              href={activeResume.fileUrl}
              data-cursor="hover"
              className="cyber-button mt-4 px-4 py-2"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download {activeResume.label}</span>
            </a>
          )}
        </div>
      </aside>

      <div className="space-y-8">
        <div className="cyber-panel">
          <div className="border-border border-b p-5">
            <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">Calendar</p>
            <h2 className="font-display text-fg mt-2 text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
              Book a focused conversation
            </h2>
          </div>
          <CalEmbed calLink={calLink} />
        </div>

        <form action={formAction} className="cyber-panel p-5">
          <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">Contact</p>
          <h2 className="font-display text-fg mt-2 text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
            Send the useful details first
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Company" name="company" />
            <label className="block">
              <span className="text-mono-sm text-fg-muted font-mono">Intent</span>
              <select
                name="intent"
                className="border-border bg-bg text-body-sm text-fg focus:border-border-strong mt-2 h-11 w-full border px-3 font-mono focus:outline-none"
              >
                {INTENTS.map((intent) => (
                  <option key={intent} value={intent}>
                    {intent}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-mono-sm text-fg-muted font-mono">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              placeholder="What are you building, what broke, or what role are you hiring for?"
              className="border-border bg-bg text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong mt-2 w-full border px-3 py-3 font-mono focus:outline-none"
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={cn('text-mono-sm font-mono', state.ok ? 'text-success' : 'text-fg-muted')}
            >
              {state.message || 'The API runs LLM priority scoring after submit.'}
            </p>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-mono-sm text-fg-muted font-mono">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="border-border bg-bg text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong mt-2 h-11 w-full border px-3 font-mono focus:outline-none"
      />
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-cursor="hover"
      className="cyber-button px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>{pending ? 'Sending' : 'Send inquiry'}</span>
    </button>
  );
}

function CommandLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-bg flex items-center gap-3 border p-3">
      <span className="text-accent">{icon}</span>
      <span className="text-fg-muted min-w-24 font-mono text-[10px] uppercase tracking-[2px]">
        {label}
      </span>
      <span className="text-body-sm text-fg font-mono">{value}</span>
    </div>
  );
}
