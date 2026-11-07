import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '../lib/api';

const EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Destination wedding', 'Other'] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().max(40).regex(/^$|^[0-9+()\-\s.]{6,40}$/, 'Invalid phone number'),
  wedding_date: z.string(),
  event_type: z.string(),
  location: z.string().trim().max(200),
  guest_count: z.string().regex(/^$|^[1-9]\d{0,3}$/, 'Enter a whole number'),
  message: z.string().trim().min(10, 'Please tell us a little more').max(4000),
  website: z.string().max(0), // honeypot
});
type FormValues = z.infer<typeof schema>;

export default function EnquiryForm() {
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', wedding_date: '', event_type: '', location: '', guest_count: '', message: '', website: '' },
  });

  const onSubmit = async (v: FormValues) => {
    setState('idle');
    try {
      await api('/enquiries', {
        method: 'POST',
        body: JSON.stringify({ ...v, startedAt: startedAt.current }),
      });
      reset();
      setState('sent');
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Could not send your enquiry. Please try again.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <div role="status" className="border border-black p-8">
        <p className="font-serif text-3xl">Thank you.</p>
        <p className="mt-3 text-sm text-neutral-600">Your enquiry has been received.</p>
        <button className="link-u mt-6" onClick={() => { startedAt.current = Date.now(); setState('idle'); }}>Send another enquiry</button>
      </div>
    );
  }

  const Err = ({ m }: { m?: string }) => (m ? <p role="alert" className="mt-1 text-xs text-red-700">{m}</p> : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 md:grid-cols-2" aria-label="Enquiry form">
      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" {...register('website')} /></label>
      </div>

      <div>
        <label className="label" htmlFor="name">Name *</label>
        <input id="name" className="field" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        <Err m={errors.name?.message} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email *</label>
        <input id="email" type="email" className="field" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        <Err m={errors.email?.message} />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" type="tel" className="field" autoComplete="tel" {...register('phone')} />
        <Err m={errors.phone?.message} />
      </div>
      <div>
        <label className="label" htmlFor="wedding_date">Wedding date</label>
        <input id="wedding_date" type="date" className="field" {...register('wedding_date')} />
      </div>
      <div>
        <label className="label" htmlFor="event_type">Event type</label>
        <select id="event_type" className="field" {...register('event_type')}>
          <option value="">Select…</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="location">Location</label>
        <input id="location" className="field" {...register('location')} />
      </div>
      <div>
        <label className="label" htmlFor="guest_count">Guest count</label>
        <input id="guest_count" inputMode="numeric" className="field" {...register('guest_count')} />
        <Err m={errors.guest_count?.message} />
      </div>
      <div className="md:col-span-2">
        <label className="label" htmlFor="message">Message *</label>
        <textarea id="message" rows={5} className="field resize-none" aria-invalid={!!errors.message} {...register('message')} />
        <Err m={errors.message?.message} />
      </div>

      <div className="md:col-span-2">
        {state === 'error' && <p role="alert" className="mb-4 text-sm text-red-700">{serverError}</p>}
        <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send enquiry'}</button>
      </div>
    </form>
  );
}
