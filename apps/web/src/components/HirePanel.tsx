'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { cn } from '@engine-room/ui';

import type { InquiryFormState } from '@/app/hire/actions';
import type { ResumeVariantView } from '@/lib/view-models';
import { DownloadIcon, MailIcon, SparkIcon } from './Icons';

type HirePanelProps = {
  resumes: ResumeVariantView[];
  action: (state: InquiryFormState, formData: FormData) => Promise<InquiryFormState>;
  initialState: InquiryFormState;
};

const INTENTS = ['full-time role', 'contract', 'collaboration', 'other'] as const;

export function HirePanel({ resumes, action, initialState }: HirePanelProps) {
  const [state, formAction] = useFormState(action, initialState);
  const [selectedResume, setSelectedResume] = useState(resumes[0]?.slug ?? '');
  const activeResume = resumes.find((resume) => resume.slug === selectedResume) ?? resumes[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-xl border border-border bg-bg-elev p-5">
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Command surface</p>
        <div className="mt-5 space-y-3">
          <CommandLine icon={<MailIcon className="h-4 w-4" />} label="Copy email" value="sahil@sahilbhatti.dev" />
          <CommandLine icon={<SparkIcon className="h-4 w-4" />} label="Best fit" value="AI backend, RAG, observability" />
          <CommandLine icon={<DownloadIcon className="h-4 w-4" />} label="Resume" value={activeResume?.label ?? 'Default'} />
        </div>

        <div id="resume" className="mt-8">
          <h2 className="font-display text-display-sm font-medium text-fg">Resume variants</h2>
          <div className="mt-4 grid gap-3">
            {resumes.map((resume) => (
              <button
                key={resume.slug}
                type="button"
                onClick={() => setSelectedResume(resume.slug)}
                data-cursor="hover"
                className={cn(
                  'rounded-lg border p-4 text-left',
                  selectedResume === resume.slug ? 'border-border-strong bg-bg text-fg' : 'border-border text-fg-muted hover:text-fg',
                )}
              >
                <span className="font-display text-body-sm font-medium">{resume.label}</span>
                <span className="mt-2 block font-mono text-mono-sm">{resume.roleKeywords.join(' / ')}</span>
              </button>
            ))}
          </div>

          {activeResume && (
            <a
              href={activeResume.fileUrl}
              data-cursor="hover"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-border-strong bg-fg px-4 py-2 font-mono text-mono-sm text-bg"
            >
              <DownloadIcon className="h-4 w-4" />
              Download {activeResume.label}
            </a>
          )}
        </div>
      </aside>

      <div className="space-y-8">
        <div className="overflow-hidden rounded-xl border border-border bg-bg-elev">
          <div className="border-b border-border p-5">
            <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Calendar</p>
            <h2 className="mt-2 font-display text-display-sm font-medium text-fg">Book a focused conversation</h2>
          </div>
          <iframe
            title="Calendar booking embed"
            src="https://cal.com/sahilbhatti/intro?embed=true"
            className="h-96 w-full bg-bg"
            loading="lazy"
          />
        </div>

        <form action={formAction} className="rounded-xl border border-border bg-bg-elev p-5">
          <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Contact</p>
          <h2 className="mt-2 font-display text-display-sm font-medium text-fg">Send the useful details first</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Company" name="company" />
            <label className="block">
              <span className="font-mono text-mono-sm text-fg-muted">Intent</span>
              <select
                name="intent"
                className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-body-sm text-fg focus:border-border-strong focus:outline-none"
              >
                {INTENTS.map((intent) => (
                  <option key={intent} value={intent}>{intent}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-mono-sm text-fg-muted">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              placeholder="What are you building, what broke, or what role are you hiring for?"
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-3 text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong focus:outline-none"
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={cn('font-mono text-mono-sm', state.ok ? 'text-success' : 'text-fg-muted')}>
              {state.message || 'The API runs LLM priority scoring after submit.'}
            </p>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="font-mono text-mono-sm text-fg-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong focus:outline-none"
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
      className="rounded-md border border-border-strong bg-fg px-4 py-2 font-mono text-mono-sm text-bg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Sending' : 'Send inquiry'}
    </button>
  );
}

function CommandLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3">
      <span className="text-fg-muted">{icon}</span>
      <span className="min-w-24 font-mono text-mono-sm text-fg-muted">{label}</span>
      <span className="text-body-sm text-fg">{value}</span>
    </div>
  );
}
