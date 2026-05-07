'use client';

import { useTransition, useState } from 'react';
import { motion } from 'framer-motion';

import { fadeUp } from '@engine-room/ui/motion';
import { ActionStatus, Field, SubmitButton, inputClass, textareaClass } from '@/components/FormControls';
import { saveHeroVariants } from '@/lib/actions';
import { percent } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { HeroVariant } from '@/lib/fallbacks';

export function HeroManager({ variants }: { variants: HeroVariant[] }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [a, b] = variants;

  function submit(formData: FormData) {
    startTransition(() => {
      void saveHeroVariants(formData).then(setResult);
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Hero A/B slot</h2>
        <p className="mt-1 text-body-sm text-fg-muted">Two variants remain locked at a 50/50 split.</p>
        <form action={submit} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-3">
              <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Variant A</p>
              <Field label="Label" className="mt-3">
                <input name="label_a" className={inputClass} defaultValue={a?.label ?? 'Variant A'} />
              </Field>
              <Field label="Hero copy" className="mt-3">
                <textarea name="copy_a" className={textareaClass} defaultValue={a?.copy ?? ''} />
              </Field>
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Variant B</p>
              <Field label="Label" className="mt-3">
                <input name="label_b" className={inputClass} defaultValue={b?.label ?? 'Variant B'} />
              </Field>
              <Field label="Hero copy" className="mt-3">
                <textarea name="copy_b" className={textareaClass} defaultValue={b?.copy ?? ''} />
              </Field>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SubmitButton pending={pending}>Save hero test</SubmitButton>
            <ActionStatus result={result} />
          </div>
        </form>
      </motion.section>

      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Results</h2>
        <div className="mt-4 grid gap-3">
          {variants.map((variant) => {
            const rate = variant.impressions > 0 ? variant.inquiries / variant.impressions : 0;
            return (
              <div key={variant.id} className="rounded-md border border-border bg-bg p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-body-sm font-medium text-fg">{variant.label}</p>
                  <span className="font-mono text-mono-sm text-fg-muted">{variant.allocation}%</span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-mono-sm">
                  <div>
                    <dt className="font-mono text-fg-muted">Views</dt>
                    <dd className="font-mono text-fg">{variant.impressions}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-fg-muted">Leads</dt>
                    <dd className="font-mono text-fg">{variant.inquiries}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-fg-muted">CVR</dt>
                    <dd className="font-mono text-fg">{percent(rate)}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
