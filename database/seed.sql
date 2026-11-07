-- PLACEHOLDER content only. Replace everything via /admin once the real
-- Red Club Wedding details are verified. Nothing here is a real business claim.

insert into public.site_content (key, value) values
  ('hero_title', 'Red Club Wedding'),
  ('hero_intro', 'Placeholder introduction — replace with verified copy.'),
  ('hero_image', ''),
  ('about_title', 'About'),
  ('about_intro', 'Placeholder — add the verified brand story in the admin dashboard.'),
  ('about_body', ''),
  ('about_image', ''),
  ('venues_intro', 'Placeholder — add verified venue information.'),
  ('enquiry_cta_title', 'Enquire'),
  ('enquiry_cta_text', 'Tell us about your day.'),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('contact_address', ''),
  ('instagram_url', ''),
  ('footer_note', '')
on conflict (key) do nothing;

insert into public.collections (slug, title, description, sort_order) values
  ('collection-one', 'Collection One (placeholder)', 'Placeholder description.', 1),
  ('collection-two', 'Collection Two (placeholder)', 'Placeholder description.', 2)
on conflict (slug) do nothing;

insert into public.services (slug, title, summary, body, sort_order) values
  ('service-one', 'Service One (placeholder)', 'Placeholder summary.', 'Placeholder detail.', 1),
  ('service-two', 'Service Two (placeholder)', 'Placeholder summary.', 'Placeholder detail.', 2)
on conflict (slug) do nothing;

insert into public.weddings (slug, title, collection_id, summary, story, featured, sort_order)
select 'wedding-one', 'Wedding One (placeholder)', c.id, 'Placeholder summary.', 'Placeholder story.', true, 1
from public.collections c where c.slug = 'collection-one'
on conflict (slug) do nothing;
