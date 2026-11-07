# Research notes

Date: 2026-11-07

## Red Club Wedding (https://redclubwedding.com/)

**Status: could not be accessed.** The site did not appear in any web search result, and direct fetches are only permitted for URLs that surface in search results. Several searches for "Red Club Wedding" returned unrelated businesses (Red Wedding and Event Management NYC, Red Velvet Collective, Red Canyon Events, Red Rock Country Club). None of these were assumed to be the client, so **nothing from them was used**.

### Missing information to verify with the client
- Exact business name styling and tagline
- Real service list and descriptions
- Venues / locations served
- Portfolio of real weddings (titles, dates, locations, stories)
- Photography (all images are placeholders until supplied)
- Contact details (email, phone, address, social links)
- About / brand story copy

All of the above are stored in the database (`site_content`, `services`, `collections`, `weddings`, `gallery_images`) and can be filled in from `/admin`. `database/seed.sql` contains only clearly labelled placeholder rows. No testimonials were created.

## ZARA (https://www.zara.com/)

Direct fetch was not possible; the design direction below comes from published UX write-ups found via search:
- Minimal, neutral palette with lots of whitespace; the homepage shows large editorial campaign imagery rather than a product grid.
- Full-bleed hero and campaign imagery, often a vertical sequence of immersive sections.
- Collection pages use images of mixed sizes rather than a uniform grid.
- Hamburger-driven navigation with a full-screen menu.
- High-contrast typographic style (serif wordmark, small uppercase sans labels).

Implemented as an original identity: serif wordmark "RED CLUB WEDDING", black/white palette, small uppercase captions, mix-blend header over imagery. No ZARA logo, code or assets are used.
