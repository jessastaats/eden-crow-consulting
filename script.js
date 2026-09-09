(() => {
  'use strict';

  // Visual refinements: keep the full original logo visible and simplify service cards.
  const refinementStyles = document.createElement('style');
  refinementStyles.textContent = `
    .brand {
      width: 224px !important;
      height: 78px !important;
      display: flex !important;
      align-items: center !important;
      overflow: visible !important;
      padding: 5px 0 !important;
    }

    .brand img {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: contain !important;
      object-position: left center !important;
      filter: brightness(1.38) contrast(1.12) !important;
    }

    .logo-frame {
      overflow: visible !important;
      padding: 24px !important;
    }

    .logo-frame img {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      max-height: none !important;
      object-fit: contain !important;
      object-position: center !important;
      filter: brightness(1.24) contrast(1.08) !important;
    }

    .service-icon {
      display: none !important;
    }

    .service-card {
      min-height: 330px !important;
    }

    .service-card h3 {
      position: relative !important;
      min-height: 0 !important;
      padding-top: 24px !important;
      margin-top: 0 !important;
    }

    .service-card h3::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 48px !important;
      height: 1px !important;
      background: #b99554 !important;
    }

    @media (max-width: 900px) {
      .brand {
        width: 202px !important;
        height: 76px !important;
      }

      .nav-wrap {
        height: 88px !important;
      }

      .site-nav {
        top: 88px !important;
      }

      .service-grid {
        grid-template-columns: 1fr 1fr !important;
      }
    }

    @media (max-width: 640px) {
      .container {
        width: min(calc(100% - 28px), var(--container)) !important;
      }

      .brand {
        width: 190px !important;
        height: 76px !important;
        padding: 3px 0 !important;
      }

      .brand img {
        filter: brightness(1.45) contrast(1.12) !important;
      }

      .nav-wrap {
        height: 86px !important;
      }

      .site-nav {
        top: 86px !important;
      }

      .service-grid {
        grid-template-columns: 1fr !important;
      }

      .service-card {
        min-height: 0 !important;
        padding: 30px 24px !important;
      }

      .service-card h3 {
        font-size: 1.35rem !important;
        padding-top: 22px !important;
      }

      .service-card ul {
        margin-top: 18px !important;
      }

      .hero-mark,
      .logo-frame {
        overflow: visible !important;
      }

      .logo-frame {
        padding: 18px !important;
      }

      .hero-mark img {
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
      }
    }
  `;
  document.head.appendChild(refinementStyles);

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector('#project-form');
  const status = document.querySelector('#form-status');

  if (!form || !status) return;

  const fields = [...form.querySelectorAll('input, select, textarea')].filter(
    (field) => field.name !== 'company_fax' && field.type !== 'file'
  );

  const showFieldError = (field) => {
    const error = field.closest('.form-field')?.querySelector('.field-error');
    if (!error) return field.checkValidity();

    if (field.validity.valueMissing) {
      error.textContent = 'Please complete this field.';
    } else if (field.validity.typeMismatch) {
      error.textContent = field.type === 'email' ? 'Enter a valid email address.' : 'Enter a valid URL, including https://';
    } else {
      error.textContent = '';
    }

    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    return valid;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => showFieldError(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') showFieldError(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') showFieldError(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const honeypot = form.querySelector('[name="company_fax"]');
    if (honeypot && honeypot.value.trim() !== '') return;

    let valid = true;
    fields.forEach((field) => {
      if (!showFieldError(field)) valid = false;
    });

    if (!valid) {
      status.classList.add('error');
      status.textContent = 'Please review the highlighted fields and try again.';
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const endpoint = form.dataset.endpoint?.trim();

    if (!endpoint) {
      status.classList.add('error');
      status.textContent = 'The inquiry form is ready, but it still needs to be connected to the business email or form service before it can send submissions.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Submission failed');

      form.reset();
      fields.forEach((field) => {
        field.removeAttribute('aria-invalid');
        const error = field.closest('.form-field')?.querySelector('.field-error');
        if (error) error.textContent = '';
      });
      status.classList.add('success');
      status.textContent = 'Thank you. Your project inquiry has been received. We’ll review the details and follow up regarding next steps.';
    } catch (error) {
      status.classList.add('error');
      status.textContent = 'We could not send your inquiry. Please try again shortly.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
})();