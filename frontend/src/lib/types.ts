export interface Service { id: string; slug: string; title: string; summary: string | null; body: string | null; image_url: string | null; sort_order: number; published: boolean }
export interface Collection { id: string; slug: string; title: string; description: string | null; cover_image_url: string | null; sort_order: number; published: boolean }
export interface Wedding {
  id: string; slug: string; title: string; collection_id: string | null; location: string | null; event_date: string | null;
  summary: string | null; story: string | null; cover_image_url: string | null; featured: boolean; sort_order: number; published: boolean;
}
export interface GalleryImage { id: string; image_url: string; alt: string | null; aspect: 'portrait' | 'landscape' | 'square'; wedding_id: string | null; sort_order: number; published: boolean }
export type Content = Record<string, string>;
export interface Enquiry {
  id: string; name: string; email: string; phone: string | null; wedding_date: string | null; event_type: string | null;
  location: string | null; guest_count: number | null; message: string; status: 'new' | 'in_progress' | 'closed'; notes: string | null; created_at: string;
}
