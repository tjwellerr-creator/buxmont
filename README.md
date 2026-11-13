# Yeshua Drafting and Construction Management — Website

A three-page website mockup for Yeshua Drafting and Construction Management, a Bucks/Montgomery County, PA
design-build residential contractor. Built from the brochure the client provided
(services, process, capabilities, and photos are sourced directly from it).

Static site, no build step — deploys as-is on Vercel or any static host.

## Structure

- `index.html` — Home
- `services.html` — Services (full detail on all six offerings)
- `contact.html` — Contact / book an estimate
- `images/` — project photography (JPEG) and social icons (PNG)
- `fonts/` — Roboto Slab, IBM Plex Sans, IBM Plex Mono (woff2)

Pages link to each other with plain relative paths (`index.html`,
`services.html`, `contact.html`), and images/fonts are real files referenced
by relative path — nothing is base64-inlined, so assets are cached by the
browser across all three pages instead of being re-downloaded per page.

## Image quality note

Every photo on the site was extracted directly from the client's brochure
PDF — there was no other source available. The PDF's embedded images cap out
at 648×1404px (and some as low as 324×702px), which is a hard ceiling: that
resolution was baked into the file when it was made, and no amount of
recompression recovers detail beyond it. Each image here was re-exported at
the highest quality the source supports (minimal upscaling, quality-95
progressive JPEG, no chroma subsampling) to get as close to "high quality" as
that ceiling allows.

If the client can provide the original, uncompressed photos (e.g. straight
from the phone/camera that took them), swapping those in would be the single
biggest visual upgrade available — originals are typically 3000px+ wide,
several times the resolution of what's embedded in the brochure.

## Design system

Roboto Slab (headlines) + IBM Plex Sans (body) + IBM Plex Mono (phone number
only), a restrained ink/paper/sand palette with a single brick-red accent, no
gradients or rounded cards, and real project photography from the client's
brochure.

## Estimate form → FormSubmit

The estimate form on `contact.html` emails each request to Jimmy through
[FormSubmit](https://formsubmit.co), a free form-to-email service with no
account. The address lives in `FORMSUBMIT_TO` at the top of
`js/estimate-form.js`.

- **Activation:** the first submission sends an activation email to
  Jimmy@yeshuacm.com. Nothing is delivered until he clicks *Activate Form*.
- **After activation:** FormSubmit's confirmation gives a random alias
  string. Putting that alias in `FORMSUBMIT_TO` instead of the raw address
  keeps the email out of the page source.
- **Each email:** subject "Estimate request: <type> – <name>", a table of the
  answers, and Reply-To set to the customer's email.
- **Customer auto-reply:** the customer gets a short thank-you
  (`_autoresponse` in the script).
- **Fallback:** if `FORMSUBMIT_TO` is empty, the form opens the visitor's
  email app with the request filled in.

File uploads are not sent; the form asks visitors to text or email photos
and plans instead.
