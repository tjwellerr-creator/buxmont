# Yeshua Drafting and Construction Management — Website

Website for Yeshua Drafting and Construction Management, a Pennsylvania
drafting, design-build, and construction management contractor
(PA HIC #PA235939).

Static site, no build step — deploys as-is on Vercel, Netlify, GitHub Pages,
or any static host.

## Structure

- `index.html` — Home
- `services.html` — Services (drafting, construction management, and six construction services)
- `contact.html` — Contact and estimate request form
- `privacy.html` — Privacy policy
- `404.html` — Not-found page (uses root-relative links so it works at any path)
- `css/styles.css` — all styles, shared by every page
- `js/site.js` — nav menu, scroll effects (every page)
- `js/estimate-form.js` — estimate form validation and sending
- `images/`, `fonts/` — photos, logo, favicon, share image, web fonts
- `robots.txt`, `sitemap.xml` — for search engines; both assume https://yeshuacm.com

When CSS or JS changes, bump the `?v=` number on its link in each page so
returning visitors get the new file.

## Launch checklist (closing call)

- [ ] Jimmy reviews all copy, especially the services lists and structural/engineering wording
- [ ] Deploy to a host and point yeshuacm.com at it (keep the domain's MX/email records unchanged)
- [ ] Confirm HTTPS works on yeshuacm.com and www.yeshuacm.com
- [ ] Google Search Console: verify the domain and submit `sitemap.xml`
- [ ] Activate the form: send a test request, Jimmy clicks *Activate Form* in the FormSubmit email
- [ ] Send one more test and confirm it reaches Jimmy's inbox
- [ ] Update the privacy policy's effective date to the launch date if it changed

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
