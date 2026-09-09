# Eden & Crow Consulting

Production static website for **Eden & Crow Consulting**.

**Domain:** edencrowconsulting.com  
**Tagline:** Where your projects take flight.

## Deployment

This repository is designed for GitHub Pages. Publish from the `main` branch at the repository root.

## Logo

The website expects the approved full logo at:

`assets/eden-crow-logo.png`

Upload the approved Eden & Crow Consulting PNG to that exact path. The site already references it in the header, hero, footer, Open Graph metadata, and structured data.

## Contact form

The inquiry form includes client-side validation, accessible errors, a honeypot field, success/error states, and optional file input. It intentionally does not send submissions until a form endpoint is selected.

To connect it, edit `index.html` and set the `data-endpoint` attribute on `#project-form` to the HTTPS endpoint supplied by your chosen form provider or backend.

Example:

```html
<form id="project-form" data-endpoint="YOUR_FORM_ENDPOINT" novalidate>
```

Confirm the selected provider supports multipart file uploads before relying on the optional attachment field.

## Legal pages

`privacy.html` and `terms.html` are clearly marked draft placeholders. They should be replaced or reviewed to match the company's actual policies and vendors before launch.
