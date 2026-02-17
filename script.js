(function () {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
  const scrollTopButton = document.getElementById('scroll-top');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastFocusedBeforeMenu = null;

  function readSiteConfig() {
    const configNode = document.getElementById('site-config');
    if (!configNode) return null;

    try {
      return JSON.parse(configNode.textContent || '{}');
    } catch (_error) {
      return null;
    }
  }

  function applySiteConfig(config) {
    if (!config) return;

    document.querySelectorAll('[data-site-text="studioName"]').forEach((node) => {
      node.textContent = config.studioName || node.textContent;
    });

    document.querySelectorAll('[data-site-text="phoneText"]').forEach((node) => {
      node.textContent = config.phoneText || node.textContent;
    });

    document.querySelectorAll('[data-site-text="email"]').forEach((node) => {
      node.textContent = config.email || node.textContent;
    });

    document.querySelectorAll('[data-site-text="streetAddress"]').forEach((node) => {
      node.textContent = config.streetAddress || node.textContent;
    });

    document.querySelectorAll('[data-site-text="cityLine"]').forEach((node) => {
      node.textContent = config.cityLine || node.textContent;
    });

    document.querySelectorAll('[data-site-text="addressInline"]').forEach((node) => {
      node.textContent = config.addressInline || node.textContent;
    });

    document.querySelectorAll('[data-site-href="tel"]').forEach((node) => {
      if (config.phoneHref) node.setAttribute('href', `tel:${config.phoneHref}`);
    });

    document.querySelectorAll('[data-site-href="mailto"]').forEach((node) => {
      if (config.email) node.setAttribute('href', `mailto:${config.email}`);
    });

    document.querySelectorAll('[data-social="instagram"]').forEach((node) => {
      if (config.instagramUrl) node.setAttribute('href', config.instagramUrl);
    });

    document.querySelectorAll('[data-social="whatsapp"]').forEach((node) => {
      if (config.whatsappUrl) node.setAttribute('href', config.whatsappUrl);
    });

    document.querySelectorAll('[data-social="facebook"]').forEach((node) => {
      if (config.facebookUrl) node.setAttribute('href', config.facebookUrl);
    });

    const mapContainer = document.getElementById('map-container');
    if (mapContainer && config.mapEmbedUrl) {
      mapContainer.dataset.mapSrc = config.mapEmbedUrl;
    }

    const schemaNode = document.getElementById('local-business-schema');
    if (schemaNode) {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: config.studioName,
        description: 'Dentalkosmetik und Zahnschmuck in privater, entspannter Atmosphäre.',
        telephone: config.phoneText,
        email: config.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: config.streetAddress,
          addressLocality: config.cityLine,
          addressCountry: 'DE'
        },
        sameAs: [config.instagramUrl, config.whatsappUrl, config.facebookUrl].filter(Boolean)
      };

      schemaNode.textContent = JSON.stringify(schema);
    }
  }

  const siteConfig = readSiteConfig();
  applySiteConfig(siteConfig);

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        lastFocusedBeforeMenu = document.activeElement;
        const firstLink = navMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else if (lastFocusedBeforeMenu instanceof HTMLElement) {
        lastFocusedBeforeMenu.focus();
      }
    });
  }

  function getHeaderOffset() {
    return header ? header.offsetHeight + 8 : 84;
  }

  function smoothJump(target) {
    const y = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({
      top: y,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      smoothJump(target);
      closeMenu();
    });
  });

  const sectionIds = ['home', 'about', 'offers', 'pricing', 'process', 'results', 'contact'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navById = new Map(
    navLinks.map((link) => [link.getAttribute('href')?.slice(1), link])
  );

  function setActiveLink(id) {
    navLinks.forEach((link) => link.classList.remove('active-link'));
    const link = navById.get(id);
    if (link) link.classList.add('active-link');
  }

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;
        setActiveLink(visible[0].target.id);
      },
      {
        rootMargin: `-${getHeaderOffset()}px 0px -45% 0px`,
        threshold: [0.2, 0.35, 0.55]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  function initReveal() {
    const revealItems = Array.from(document.querySelectorAll('.reveal'));
    if (!revealItems.length) return;

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.getAttribute('data-delay') || '0');
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  initReveal();

  const mapContainer = document.getElementById('map-container');
  const loadMapButton = document.getElementById('load-map');
  const mapFrame = document.getElementById('map-iframe');

  if (mapContainer && loadMapButton && mapFrame) {
    loadMapButton.addEventListener('click', () => {
      const mapSrc = mapContainer.dataset.mapSrc;
      if (!mapSrc) return;
      mapFrame.src = mapSrc;
      mapFrame.classList.add('is-loaded');
      loadMapButton.disabled = true;
      loadMapButton.textContent = 'Karte geladen';
    });
  }

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = String(form.querySelector('#name')?.value || '').trim();
      const phone = String(form.querySelector('#phone')?.value || '').trim();
      const email = String(form.querySelector('#email')?.value || '').trim();
      const message = String(form.querySelector('#message')?.value || '').trim();

      if (!name || !phone || !email || !message) {
        if (formStatus) formStatus.textContent = 'Bitte füllen Sie alle Felder aus.';
        return;
      }

      if (!validEmail(email)) {
        if (formStatus) formStatus.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        return;
      }

      const bodyLines = [
        `Name: ${name}`,
        `Telefon: ${phone}`,
        `E-Mail: ${email}`,
        '',
        'Nachricht:',
        message
      ];

      const recipient = siteConfig?.email || 'kontakt@zahnatelier-steinhausz.de';
      const subject = encodeURIComponent('Anfrage über Website');
      const body = encodeURIComponent(bodyLines.join('\n'));
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

      if (formStatus) {
        formStatus.textContent = 'Ihr E-Mail-Programm wurde mit einer vorbereiteten Anfrage geöffnet.';
      }
    });
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox-trigger]'));
  let lastFocusedBeforeLightbox = null;

  function focusableNodes(container) {
    return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  }

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    lastFocusedBeforeLightbox = document.activeElement;
    lightbox.hidden = false;
    lightboxImage.src = trigger.getAttribute('data-image') || '';
    lightboxImage.alt = trigger.getAttribute('data-alt') || '';
    lightboxCaption.textContent = trigger.getAttribute('data-caption') || '';

    if (lightboxClose) lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    lightbox.hidden = true;
    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxCaption.textContent = '';
    document.body.style.overflow = '';

    if (lastFocusedBeforeLightbox instanceof HTMLElement) {
      lastFocusedBeforeLightbox.focus();
    }
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  document.querySelectorAll('[data-close-lightbox]').forEach((node) => {
    node.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (event) => {
    const lightboxOpen = lightbox && !lightbox.hidden;

    if (event.key === 'Escape' && lightboxOpen) {
      closeLightbox();
      return;
    }

    if (event.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
      closeMenu();
      if (navToggle) navToggle.focus();
      return;
    }

    if (event.key === 'Tab' && lightboxOpen && lightbox) {
      const nodes = focusableNodes(lightbox);
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function syncScrollUI() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    if (scrollTopButton) {
      scrollTopButton.classList.toggle('show', window.scrollY > 500);
    }
  }

  window.addEventListener('scroll', syncScrollUI, { passive: true });
  syncScrollUI();

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }
})();
