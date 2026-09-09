(() => {
  'use strict';

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
