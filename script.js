document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.forEach((link) => link.addEventListener('click', () => {
      menuButton.classList.remove('open');
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 40 ? 'rgba(7, 9, 9, .96)' : '';
      header.style.position = window.scrollY > 40 ? 'fixed' : 'absolute';
      const fromTop = window.scrollY + 120;
      document.querySelectorAll('main section[id]').forEach((section) => {
        if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`));
        }
      });
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
  } else {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  }

  const bmiForm = document.querySelector('#bmi-form');
  if (bmiForm) bmiForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const height = Number(document.querySelector('#height').value) / 100;
    const weight = Number(document.querySelector('#weight').value);
    const bmi = weight / (height * height);
    let category = 'Healthy weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obesity range';
    document.querySelector('#bmi-result').innerHTML = `<span>Your BMI result</span><strong>${bmi.toFixed(1)}</strong><small>${category} — talk to a coach for personalized guidance.</small>`;
  });

  const lightbox = document.querySelector('#lightbox');
  if (lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); };
    document.querySelectorAll('.gallery-item').forEach((item) => item.addEventListener('click', () => {
      const image = item.querySelector('img');
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }));
    lightbox.querySelector('button').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => event.target === lightbox && closeLightbox());
    document.addEventListener('keydown', (event) => event.key === 'Escape' && closeLightbox());
  }

  const toast = document.querySelector('#toast');
  const contactForm = document.querySelector('#contact-form');
  if (contactForm && toast) contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    toast.classList.add('show');
    contactForm.reset();
    setTimeout(() => toast.classList.remove('show'), 3500);
  });

  const billingSwitch = document.querySelector('.billing-switch');
  if (billingSwitch) billingSwitch.addEventListener('click', () => {
    const yearly = billingSwitch.classList.toggle('yearly');
    billingSwitch.setAttribute('aria-pressed', String(yearly));
    billingSwitch.setAttribute('aria-label', `Switch to ${yearly ? 'monthly' : 'yearly'} pricing`);
    document.querySelectorAll('[data-billing-label]').forEach((label) => label.classList.toggle('active', label.dataset.billingLabel === (yearly ? 'yearly' : 'monthly')));
    document.querySelectorAll('.price strong[data-monthly]').forEach((price) => { price.textContent = yearly ? price.dataset.yearly : price.dataset.monthly; });
    document.querySelectorAll('.annual-note').forEach((note) => { note.textContent = yearly ? 'Ask us for current yearly pricing' : 'Ask us for current monthly pricing'; });
  });

  const registrationForm = document.querySelector('#registration-form');
  if (registrationForm) {
    const requestedPlan = new URLSearchParams(window.location.search).get('plan');
    const planSelect = document.querySelector('#member-plan');
    const successPanel = document.querySelector('#registration-success');
    const sheetStatus = document.querySelector('#registration-sheet-status');
    const whatsAppLink = document.querySelector('#registration-whatsapp-link');
    const sheetsWebhookUrl = window.IRON_MAN_REGISTRATION_CONFIG?.googleSheetsWebhookUrl?.trim();
    if (requestedPlan && [...planSelect.options].some((option) => option.value === requestedPlan)) planSelect.value = requestedPlan;

    registrationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const registration = {
        name: document.querySelector('#member-name').value.trim(),
        phone: document.querySelector('#member-phone').value.trim(),
        email: document.querySelector('#member-email').value.trim(),
        plan: planSelect.options[planSelect.selectedIndex].text,
        source: 'Iron Man Fitness Gym website'
      };
      const whatsAppMessage = [
        'Hello Iron Man Fitness Gym,',
        '',
        'I would like to register for a membership.',
        `Name: ${registration.name}`,
        `Phone: ${registration.phone}`,
        `Email: ${registration.email}`,
        `Plan: ${registration.plan}`,
        '',
        'Please share the next steps. Thank you.'
      ].join('\n');
      const whatsAppUrl = `https://wa.me/916265219497?text=${encodeURIComponent(whatsAppMessage)}`;
      whatsAppLink.href = whatsAppUrl;
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');

      successPanel.classList.add('show');
      sheetStatus.textContent = sheetsWebhookUrl
        ? 'Saving your registration details…'
        : 'WhatsApp enquiry prepared. Tap send in WhatsApp to complete your enquiry.';

      if (sheetsWebhookUrl) {
        try {
          await fetch(sheetsWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(registration)
          });
          sheetStatus.textContent = 'Registration details saved. Tap send in WhatsApp to complete your enquiry.';
        } catch (error) {
          console.error('Unable to save registration to Google Sheets:', error);
          sheetStatus.textContent = 'WhatsApp enquiry prepared. Tap send in WhatsApp to complete your enquiry.';
        }
      }
      registrationForm.reset();
    });
  }
});
