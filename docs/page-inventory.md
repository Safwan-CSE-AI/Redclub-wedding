# Page inventory

## Public
| Route | Page | Data |
|---|---|---|
| `/` | Home: hero, campaign sections, featured weddings, services, brand intro, gallery preview, enquiry CTA | content, collections, weddings, services, gallery |
| `/weddings` | All wedding projects | weddings |
| `/weddings/:slug` | Wedding detail: cover, details, story, photos, related | wedding, gallery_images |
| `/collections` | Collection index | collections |
| `/collections/:slug` | Collection page with its weddings | collection, weddings |
| `/services` | Services index | services |
| `/services/:slug` | Service detail | service |
| `/venues` | Venues / locations (from wedding locations + admin text) | weddings, content |
| `/gallery` | Gallery grid + lightbox | gallery_images |
| `/about` | About | content |
| `/contact` | Enquiry form + contact details | content |
| `*` | 404 | none |

## Admin (`/admin`, protected, noindex)
| Route | Purpose |
|---|---|
| `/admin/login` | Supabase Auth email + password, checked against `admin_users` |
| `/admin` | Dashboard statistics |
| `/admin/enquiries` | List, filter, change status, notes, delete |
| `/admin/services` | CRUD |
| `/admin/collections` | CRUD |
| `/admin/weddings` | CRUD |
| `/admin/gallery` | CRUD + image upload |
| `/admin/content` | Edit site text and images |

## API (`/api`)
Public: `GET /content, /services, /services/:slug, /collections, /collections/:slug, /weddings, /weddings/:slug, /gallery`, `POST /enquiries`, `GET /sitemap.xml` (root).
Admin (Bearer token): `POST /admin/login`, `GET /admin/stats`, enquiries, services, collections, weddings, gallery CRUD, `GET/PUT /admin/content`, `POST /admin/upload`.
