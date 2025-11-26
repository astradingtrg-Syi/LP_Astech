(function () {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach((btn) => {
    btn.addEventListener('pointermove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--btn-x', `${x}%`);
      btn.style.setProperty('--btn-y', `${y}%`);
      btn.classList.add('btn--active');
    });

    btn.addEventListener('pointerleave', () => {
      btn.classList.remove('btn--active');
    });
  });

  const header = document.querySelector('header');
  if (!header) return;

  const hero = document.querySelector('.hero');
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      });
    },
    {
      rootMargin: '-80px 0px 0px 0px',
      threshold: 0
    }
  );

  if (hero) {
    headerObserver.observe(hero);
  } else {
    header.classList.add('header-scrolled');
  }

  const headerToggle = document.querySelector('.header-toggle');
  if (headerToggle) {
    headerToggle.addEventListener('click', () => {
      header.classList.toggle('header-menu-open');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        header.classList.remove('header-menu-open');
      }
    });

    const headerNavLinks = header.querySelectorAll('nav a');
    headerNavLinks.forEach((link) =>
      link.addEventListener('click', () => header.classList.remove('header-menu-open'))
    );
  }

  const navLinks = Array.from(document.querySelectorAll('header nav a'));
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const sectionLinks = [];
  const sectionMap = new Map();

  navLinks.forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const normalizedPath = url.pathname.replace(/\/+$/, '');
    if (normalizedPath === currentPath && url.hash) {
      const id = decodeURIComponent(url.hash.substring(1));
      const section = document.getElementById(id);
      if (section) {
        sectionLinks.push(link);
        sectionMap.set(section, link);
      }
    }
  });

  if (sectionMap.size > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = sectionMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            sectionLinks.forEach((navLink) => navLink.classList.remove('section-active'));
            link.classList.add('section-active');
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionMap.forEach((_, section) => sectionObserver.observe(section));
  }

  const galleryFigures = Array.from(document.querySelectorAll('.gallery-page .gallery-grid figure'));
  const lightbox = document.getElementById('gallery-lightbox');

  if (galleryFigures.length > 0 && lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('figcaption');
    const closeButtons = lightbox.querySelectorAll('[data-lightbox-close]');
    const prevButton = lightbox.querySelector('[data-lightbox-prev]');
    const nextButton = lightbox.querySelector('[data-lightbox-next]');
    let previousOverflow = '';
    let currentGalleryIndex = -1;

    const setLightboxContent = (index) => {
      const figure = galleryFigures[index];
      if (!figure || !lightboxImg || !lightboxCaption) return false;
      const image = figure.querySelector('img');
      if (!image) return false;
      const caption = figure.querySelector('figcaption');
      const captionText = caption ? caption.textContent.trim() : '';
      lightboxImg.src = image.currentSrc || image.src;
      lightboxImg.alt = image.alt || captionText;
      lightboxCaption.textContent = captionText;
      currentGalleryIndex = index;
      return true;
    };

    const openLightbox = (index) => {
      if (!setLightboxContent(index)) return;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.classList.add('is-visible');
      lightbox.setAttribute('aria-hidden', 'false');
    };

    const closeLightbox = () => {
      if (!lightboxImg || !lightboxCaption) return;
      lightbox.classList.remove('is-visible');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = '';
      lightboxCaption.textContent = '';
      document.body.style.overflow = previousOverflow;
      currentGalleryIndex = -1;
    };

    const showNextImage = () => {
      if (currentGalleryIndex < 0) return;
      const nextIndex = (currentGalleryIndex + 1) % galleryFigures.length;
      setLightboxContent(nextIndex);
    };

    const showPrevImage = () => {
      if (currentGalleryIndex < 0) return;
      const prevIndex = (currentGalleryIndex - 1 + galleryFigures.length) % galleryFigures.length;
      setLightboxContent(prevIndex);
    };

    galleryFigures.forEach((figure, index) => {
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('role', 'button');
      const caption = figure.querySelector('figcaption');
      if (caption && caption.textContent.trim()) {
        figure.setAttribute('aria-label', `View ${caption.textContent.trim()} photo`);
      }
      figure.addEventListener('click', () => openLightbox(index));
      figure.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', showPrevImage);
    }

    if (nextButton) {
      nextButton.addEventListener('click', showNextImage);
    }

    closeButtons.forEach((btn) => btn.addEventListener('click', closeLightbox));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-visible')) return;
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNextImage();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevImage();
      }
    });
  }

  const yearSpans = document.querySelectorAll('[data-current-year]');
  if (yearSpans.length > 0) {
    const currentYear = new Date().getFullYear();
    yearSpans.forEach((span) => {
      span.textContent = currentYear;
    });
  }
})();
