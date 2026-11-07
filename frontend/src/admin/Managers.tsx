import ResourceManager, { type FieldDef } from './ResourceManager';

const SERVICE_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'summary', label: 'Summary', type: 'textarea' },
  { name: 'body', label: 'Details', type: 'textarea' },
  { name: 'image_url', label: 'Image', type: 'image' },
];
const COLLECTION_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'cover_image_url', label: 'Cover image', type: 'image' },
];
const WEDDING_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'collection_id', label: 'Collection', type: 'select', relation: { endpoint: 'collections', labelKey: 'title', optional: true } },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'event_date', label: 'Event date', type: 'date' },
  { name: 'summary', label: 'Summary', type: 'textarea' },
  { name: 'story', label: 'Story', type: 'textarea' },
  { name: 'cover_image_url', label: 'Cover image', type: 'image' },
  { name: 'featured', label: 'Featured on homepage', type: 'checkbox' },
];
const GALLERY_FIELDS: FieldDef[] = [
  { name: 'image_url', label: 'Image', type: 'image' },
  { name: 'alt', label: 'Alt text (describe the photo)', type: 'text' },
  { name: 'aspect', label: 'Shape', type: 'select', options: [
    { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }, { value: 'square', label: 'Square' } ] },
  { name: 'wedding_id', label: 'Belongs to wedding (optional)', type: 'select', relation: { endpoint: 'weddings', labelKey: 'title', optional: true } },
];

export const ServicesAdmin = () => <ResourceManager title="Service" endpoint="services" fields={SERVICE_FIELDS} titleKey="title" slugFrom="title" />;
export const CollectionsAdmin = () => <ResourceManager title="Collection" endpoint="collections" fields={COLLECTION_FIELDS} titleKey="title" slugFrom="title" />;
export const WeddingsAdmin = () => <ResourceManager title="Wedding" endpoint="weddings" fields={WEDDING_FIELDS} titleKey="title" slugFrom="title" defaults={{ featured: false }} />;
export const GalleryAdmin = () => <ResourceManager title="Gallery image" endpoint="gallery" fields={GALLERY_FIELDS} titleKey="alt" defaults={{ aspect: 'portrait' }} />;
