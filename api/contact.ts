// Vercel Function: POST /api/contact sends a website inquiry to Peter through Resend.
// Environment (Vercel project settings, never in the browser):
//   RESEND_API_KEY  required; without it the form falls back to an email draft
//   CONTACT_TO      optional, defaults to peter@pidesigngroup.ca
//   CONTACT_FROM    optional, a sender on a domain verified in Resend; when set,
//                   the sender also gets a short receipt
//                   (Resend's onboarding@resend.dev only delivers to the Resend account owner)

declare const process: { env: Record<string, string | undefined> };

const limits = { projectType: 80, name: 120, organization: 160, email: 254, location: 160, stage: 80, timeline: 80, message: 4000 } as const;
type Field = keyof typeof limits;
const required: Field[] = ['projectType', 'name', 'email', 'location', 'message'];
const projectTypes = ['Multifamily Communities', 'Commercial Plazas', 'Play & Open Spaces', 'Something Else'];
// Optional choices, kept in step with src/data/inquiry.ts (the function stays self-contained).
const stages = ['Early planning', 'Concept design', 'Development permit', 'Construction drawings', 'Under construction'];
const timelines = ['As soon as possible', 'Within 3 months', '3 to 6 months', '6 to 12 months', 'Not sure yet'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reply = (status: number, body: Record<string, unknown>) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
// Header values must stay on one line.
const line = (value: string) => value.replace(/[\r\n]+/g, ' ');

export function validate(input: unknown) {
  if (!input || typeof input !== 'object') return { error: 'invalid' as const };
  const raw = input as Record<string, unknown>;
  const fields = {} as Record<Field, string>;
  for (const key of Object.keys(limits) as Field[]) {
    const value = typeof raw[key] === 'string' ? (raw[key] as string).trim() : '';
    if (value.length > limits[key]) return { error: 'invalid' as const, field: key };
    fields[key] = value;
  }
  const missing = required.find(key => !fields[key]);
  if (missing) return { error: 'invalid' as const, field: missing };
  if (!emailPattern.test(fields.email)) return { error: 'invalid' as const, field: 'email' as Field };
  if (!projectTypes.includes(fields.projectType)) return { error: 'invalid' as const, field: 'projectType' as Field };
  if (fields.stage && !stages.includes(fields.stage)) return { error: 'invalid' as const, field: 'stage' as Field };
  if (fields.timeline && !timelines.includes(fields.timeline)) return { error: 'invalid' as const, field: 'timeline' as Field };
  return { fields };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return reply(400, { error: 'invalid' }); }
  // Hidden field that people never see; automated spam tends to fill it in.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) return reply(200, { ok: true });

  const result = validate(body);
  if (!result.fields) return reply(400, result);
  const key = process.env.RESEND_API_KEY;
  if (!key) return reply(503, { error: 'not_configured' });

  const f = result.fields;
  const text = [
    f.message, '',
    `Project type: ${f.projectType}`, `Project location: ${f.location}`,
    ...(f.stage ? [`Project stage: ${f.stage}`] : []), ...(f.timeline ? [`Timeline: ${f.timeline}`] : []), '',
    `Name: ${f.name}`, `Organization: ${f.organization || 'Not provided'}`, `Email: ${f.email}`, '',
    'Sent from the Pi Design Group website contact form. Reply to this email to answer the sender directly.',
  ].join('\n');

  const from = process.env.CONTACT_FROM || 'Pi Design Group Website <onboarding@resend.dev>';
  const sent = await send(key, {
    from, to: [process.env.CONTACT_TO || 'peter@pidesigngroup.ca'], reply_to: f.email,
    subject: line(`Landscape inquiry: ${f.projectType} in ${f.location}`), text,
  });
  if (!sent) return reply(502, { error: 'delivery_failed' });
  // A short receipt to the sender, only from a verified sender address. It repeats
  // nothing they typed, so the form can't be used to send other text to strangers.
  if (process.env.CONTACT_FROM) {
    await send(key, {
      from, to: [f.email], reply_to: process.env.CONTACT_TO || 'peter@pidesigngroup.ca',
      subject: 'We received your message',
      text: 'Thank you for contacting Pi Design Group. Your message has reached Peter, who will reply to this email address.\n\nPi Design Group\nCalgary, Alberta\n403-510-4071',
    });
  }
  return reply(200, { ok: true });
}

async function send(key: string, email: Record<string, unknown>) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    if (!response.ok) console.error('Resend rejected an email', response.status);
    return response.ok;
  } catch {
    console.error('Resend could not be reached');
    return false;
  }
}
