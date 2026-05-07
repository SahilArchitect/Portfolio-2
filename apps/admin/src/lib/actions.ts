'use server';

import { revalidatePath } from 'next/cache';

import { adminMutation, type ActionResult } from '@/lib/api';

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}

function stackFromForm(formData: FormData) {
  return text(formData, 'stack')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveProject(formData: FormData): Promise<ActionResult> {
  const id = text(formData, 'id');
  const payload = {
    title: text(formData, 'title'),
    slug: optionalText(formData, 'slug'),
    summary: text(formData, 'summary'),
    body_md: text(formData, 'body_md'),
    role: text(formData, 'role'),
    stack: stackFromForm(formData),
    repo_url: optionalText(formData, 'repo_url'),
    live_url: optionalText(formData, 'live_url'),
    cover_image_url: optionalText(formData, 'cover_image_url'),
    status: text(formData, 'status') || 'draft',
    shipped_on: optionalText(formData, 'shipped_on'),
    featured: bool(formData, 'featured'),
    display_order: Number(text(formData, 'display_order') || '0'),
  };

  const result = await adminMutation(id ? `/admin/projects/${id}` : '/admin/projects', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  }, 'Project saved.');
  revalidatePath('/content/projects');
  revalidatePath('/');
  return result;
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const result = await adminMutation(`/admin/projects/${id}`, { method: 'DELETE' }, 'Project deleted.');
  revalidatePath('/content/projects');
  revalidatePath('/');
  return result;
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const failures: string[] = [];
  for (const [index, id] of ids.entries()) {
    const result = await adminMutation(`/admin/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ display_order: index + 1 }),
    }, 'Project order updated.');
    if (!result.ok) failures.push(id);
  }
  revalidatePath('/content/projects');
  revalidatePath('/');
  return failures.length === 0
    ? { ok: true, message: 'Project order updated.' }
    : { ok: false, message: `Could not update ${failures.length} project order value(s).` };
}

export async function saveNowEntry(formData: FormData): Promise<ActionResult> {
  const id = text(formData, 'id');
  const payload = {
    headline: text(formData, 'headline'),
    body_md: text(formData, 'body_md'),
    mood: optionalText(formData, 'mood'),
    is_current: bool(formData, 'is_current'),
  };
  const result = await adminMutation(id ? `/admin/now-entries/${id}` : '/admin/now-entries', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  }, 'Now entry saved.');
  revalidatePath('/content/now');
  revalidatePath('/');
  return result;
}

export async function deleteNowEntry(id: string): Promise<ActionResult> {
  const result = await adminMutation(`/admin/now-entries/${id}`, { method: 'DELETE' }, 'Now entry deleted.');
  revalidatePath('/content/now');
  return result;
}

export async function saveHeroVariants(formData: FormData): Promise<ActionResult> {
  const payload = {
    variants: [
      {
        id: 'variant-a',
        label: text(formData, 'label_a'),
        copy: text(formData, 'copy_a'),
        allocation: 50,
      },
      {
        id: 'variant-b',
        label: text(formData, 'label_b'),
        copy: text(formData, 'copy_b'),
        allocation: 50,
      },
    ],
  };
  const result = await adminMutation('/admin/hero', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, 'Hero test saved.');
  revalidatePath('/content/hero');
  return result;
}

export async function saveResumeVariant(formData: FormData): Promise<ActionResult> {
  const id = text(formData, 'id');
  const payload = {
    label: text(formData, 'label'),
    slug: text(formData, 'slug'),
    body_md: text(formData, 'body_md'),
    pdf_url: optionalText(formData, 'pdf_url'),
    role_keywords: text(formData, 'role_keywords')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    is_default: bool(formData, 'is_default'),
  };
  const result = await adminMutation(id ? `/admin/resume-variants/${id}` : '/admin/resume-variants', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  }, 'Resume variant saved.');
  revalidatePath('/content/resumes');
  return result;
}

export async function deleteResumeVariant(id: string): Promise<ActionResult> {
  const result = await adminMutation(`/admin/resume-variants/${id}`, { method: 'DELETE' }, 'Resume variant deleted.');
  revalidatePath('/content/resumes');
  return result;
}

export async function triggerSubstackSync(): Promise<ActionResult> {
  const result = await adminMutation('/admin/worker/trigger/ingest_substack', { method: 'POST' }, 'Substack sync triggered.');
  revalidatePath('/substack');
  return result;
}

export async function saveSubstackSettings(formData: FormData): Promise<ActionResult> {
  const payload = {
    embedding_model: text(formData, 'embedding_model'),
    chunk_size: Number(text(formData, 'chunk_size') || '512'),
  };
  const result = await adminMutation('/admin/substack/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, 'Substack settings saved.');
  revalidatePath('/substack');
  return result;
}

export async function updateInquiryStatus(id: string, status: string): Promise<ActionResult> {
  const result = await adminMutation('/admin/inquiries', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  }, 'Inquiry updated.');
  revalidatePath('/inquiries');
  revalidatePath('/');
  return result;
}

export async function saveFeatureFlag(formData: FormData): Promise<ActionResult> {
  const name = text(formData, 'name');
  const payload = {
    name,
    enabled: bool(formData, 'enabled'),
    description: text(formData, 'description'),
  };
  const result = await adminMutation('/admin/flags', {
    method: name ? 'POST' : 'PATCH',
    body: JSON.stringify(payload),
  }, 'Feature flag saved.');
  revalidatePath('/flags');
  return result;
}

export async function toggleFeatureFlag(name: string, enabled: boolean): Promise<ActionResult> {
  const result = await adminMutation(`/admin/flags/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  }, 'Feature flag updated.');
  revalidatePath('/flags');
  return result;
}

export async function deleteFeatureFlag(name: string): Promise<ActionResult> {
  const result = await adminMutation(`/admin/flags/${encodeURIComponent(name)}`, { method: 'DELETE' }, 'Feature flag deleted.');
  revalidatePath('/flags');
  return result;
}
