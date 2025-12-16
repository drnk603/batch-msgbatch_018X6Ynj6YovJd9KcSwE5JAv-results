(function() {
  'use strict';

  var app = window.__app = window.__app || {};

  var headerHeight = 80;
  var formSubmitting = false;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function getHeaderHeight() {
    var header = document.querySelector('.navbar, .l-header, header');
    if (header) {
      return header.offsetHeight || 80;
    }
    return 80;
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var toggle = document.querySelector('.navbar-toggler');
    var navbarNav = document.getElementById('navbarNav');
    var body = document.body;

    if (!toggle || !navbarNav) return;

    var isOpen = false;

    function open() {
      isOpen = true;
      navbarNav.classList.add('show');
      navbarNav.style.maxHeight = 'calc(100vh - var(--header-h))';
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function close() {
      isOpen = false;
      navbarNav.classList.remove('show');
      navbarNav.style.maxHeight = '0';
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        close();
      } else {
        open();
      }
    });

    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && isOpen) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !navbarNav.contains(e.target) && !toggle.contains(e.target)) {
        close();
      }
    });

    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen) {
          close();
        }
      });
    }

    window.addEventListener('resize', debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        close();
      }
    }, 150), { passive: true });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    var isHomepage = window.location.pathname === '/' || window.location.pathname.match(/\/index\.html?$/);
    var links = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < links.length; i++) {
      (function(link) {
        var href = link.getAttribute('href');
        if (href === '#' || href === '#!') return;

        if (!isHomepage && href.indexOf('#') === 0) {
          link.setAttribute('href', '/' + href);
        }

        link.addEventListener('click', function(e) {
          var targetHref = this.getAttribute('href');
          if (!targetHref || targetHref === '#' || targetHref === '#!') return;

          var hash = targetHref.indexOf('#') !== -1 ? targetHref.split('#')[1] : null;
          if (!hash) return;

          var isCurrentPage = targetHref.indexOf('/') === -1 || targetHref.indexOf('/#') === 0 || 
                              (isHomepage && targetHref.indexOf('#') === 0);

          if (isCurrentPage) {
            var target = document.getElementById(hash);
            if (target) {
              e.preventDefault();
              headerHeight = getHeaderHeight();
              var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          }
        });
      })(links[i]);
    }
  }

  function initScrollEffects() {
    if (app.scrollEffectsInit) return;
    app.scrollEffectsInit = true;

    var header = document.querySelector('.navbar, .l-header, header');

    var handleScroll = throttle(function() {
      if (window.pageYOffset > 50) {
        if (header) header.classList.add('is-scrolled');
      } else {
        if (header) header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    var sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (navLinks.length === 0) return;

    var handleScrollSpy = throttle(function() {
      var scrollPos = window.pageYOffset + headerHeight + 100;

      for (var i = sections.length - 1; i >= 0; i--) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          var sectionId = section.getAttribute('id');

          for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            var linkHref = link.getAttribute('href');
            
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            if (linkHref === '#' + sectionId) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          }
          break;
        }
      }
    }, 100);

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (linkPath && linkPath.indexOf('#') === -1) {
        link.removeAttribute('aria-current');
        link.classList.remove('active');

        if (linkPath === currentPath || 
            (currentPath === '/' && linkPath === '/index.html') ||
            (currentPath === '/index.html' && linkPath === '/')) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        } else if (linkPath && currentPath.indexOf(linkPath) === 0 && linkPath !== '/') {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      }
    }
  }

  function initIntersectionObserver() {
    if (app.intersectionInit) return;
    app.intersectionInit = true;

    if (!('IntersectionObserver' in window)) return;

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('u-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    var animateElements = document.querySelectorAll('.c-card, .c-feature, .c-value-card, .c-team-card, .c-testimonial-card, .c-contact-item, .card');
    
    for (var i = 0; i < animateElements.length; i++) {
      animateElements[i].style.opacity = '0';
      observer.observe(animateElements[i]);
    }
  }

  function initCountUp() {
    if (app.countUpInit) return;
    app.countUpInit = true;

    if (!('IntersectionObserver' in window)) return;

    var countElements = document.querySelectorAll('[data-count]');
    if (countElements.length === 0) return;

    function animateCount(element, target) {
      var current = 0;
      var increment = target / 100;
      var duration = 2000;
      var stepTime = duration / 100;

      var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current);
      }, stepTime);
    }

    var countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var element = entry.target;
          var targetValue = parseInt(element.getAttribute('data-count'), 10);
          animateCount(element, targetValue);
          countObserver.unobserve(element);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < countElements.length; i++) {
      countObserver.observe(countElements[i]);
    }
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      (function(img) {
        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        var hasLoading = img.hasAttribute('loading');
        var isCritical = img.hasAttribute('data-critical');
        var isLogo = img.classList.contains('c-logo__img') || img.closest('.navbar-brand') || img.closest('.c-logo');

        if (!hasLoading && !isCritical && !isLogo) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          var svg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EImage not available%3C/text%3E%3C/svg%3E';
          this.src = svg;
          this.style.objectFit = 'contain';

          if (this.classList.contains('c-logo__img') || this.closest('.navbar-brand')) {
            this.style.maxHeight = '40px';
          }
        });
      })(images[i]);
    }
  }

  function initHoverEffects() {
    if (app.hoverInit) return;
    app.hoverInit = true;

    var buttons = document.querySelectorAll('.btn, .c-button, a.nav-link');

    for (var i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.3s ease-in-out';
        });

        btn.addEventListener('mouseleave', function() {
          this.style.transition = 'all 0.3s ease-in-out';
        });
      })(buttons[i]);
    }

    var cards = document.querySelectorAll('.c-card, .card, .c-value-card, .c-team-card, .c-testimonial-card, .c-contact-item');

    for (var j = 0; j < cards.length; j++) {
      (function(card) {
        card.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.4s ease-in-out';
        });

        card.addEventListener('mouseleave', function() {
          this.style.transition = 'all 0.4s ease-in-out';
        });
      })(cards[j]);
    }
  }

  function initRippleEffect() {
    if (app.rippleInit) return;
    app.rippleInit = true;

    var rippleElements = document.querySelectorAll('.btn-primary, .btn-secondary, .c-button--primary, .c-button--secondary');

    for (var i = 0; i < rippleElements.length; i++) {
      (function(element) {
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        element.addEventListener('click', function(e) {
          var ripple = document.createElement('span');
          var rect = this.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          ripple.style.pointerEvents = 'none';
          ripple.style.animation = 'rippleEffect 0.6s ease-out';

          this.appendChild(ripple);

          setTimeout(function() {
            if (ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          }, 600);
        });
      })(rippleElements[i]);
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes rippleEffect { from { transform: scale(0); opacity: 1; } to { transform: scale(2); opacity: 0; } }';
    document.head.appendChild(style);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '$&');
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    var notificationContainer = document.createElement('div');
    notificationContainer.className = 'position-fixed top-0 end-0 p-3';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);

    app.notify = function(message, type) {
      type = type || 'info';
      var alertClass = 'alert-' + type;

      var alert = document.createElement('div');
      alert.className = 'alert ' + alertClass + ' alert-dismissible fade show';
      alert.setAttribute('role', 'alert');
      alert.style.minWidth = '300px';
      alert.style.animation = 'slideInRight 0.4s ease-out';
      alert.innerHTML = message + '<button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>';

      notificationContainer.appendChild(alert);

      setTimeout(function() {
        alert.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(function() {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }, 400);
      }, 5000);
    };

    var animationStyle = document.createElement('style');
    animationStyle.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
    document.head.appendChild(animationStyle);

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
    var namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

    function validateField(field) {
      var value = field.value.trim();
      var fieldType = field.type;
      var fieldName = field.name || field.id;
      var errorSpan = field.parentNode.querySelector('.c-form__error, .invalid-feedback, .text-danger');
      var isValid = true;
      var errorMessage = '';

      if (field.hasAttribute('required') && value === '') {
        isValid = false;
        errorMessage = 'Dieses Feld ist erforderlich.';
      } else if (value !== '') {
        if (fieldType === 'email' || fieldName === 'email') {
          if (!emailPattern.test(value)) {
            isValid = false;
            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          }
        } else if (fieldType === 'tel' || fieldName === 'phone') {
          if (!phonePattern.test(value)) {
            isValid = false;
            errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).';
          }
        } else if (fieldName === 'firstName' || fieldName === 'lastName' || fieldName === 'name') {
          if (!namePattern.test(value)) {
            isValid = false;
            errorMessage = 'Bitte geben Sie einen gültigen Namen ein (nur Buchstaben, Bindestriche und Apostrophe).';
          }
        } else if (field.tagName === 'TEXTAREA' && fieldName === 'message') {
          if (value.length < 10) {
            isValid = false;
            errorMessage = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
          isValid = false;
          errorMessage = 'Sie müssen dieser Option zustimmen.';
        }
      }

      if (!isValid) {
        field.classList.add('is-invalid');
        field.style.borderColor = '#d32f2f';
        if (errorSpan) {
          errorSpan.textContent = errorMessage;
          errorSpan.style.display = 'block';
        }
      } else {
        field.classList.remove('is-invalid');
        field.style.borderColor = '';
        if (errorSpan) {
          errorSpan.textContent = '';
          errorSpan.style.display = 'none';
        }
      }

      return isValid;
    }

    var forms = document.querySelectorAll('form.contact-form, form.c-form');

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        var fields = form.querySelectorAll('input, textarea, select');

        for (var j = 0; j < fields.length; j++) {
          (function(field) {
            field.addEventListener('blur', function() {
              validateField(field);
            });

            field.addEventListener('input', debounce(function() {
              if (field.classList.contains('is-invalid')) {
                validateField(field);
              }
            }, 300));
          })(fields[j]);
        }

        form.addEventListener('submit', function(event) {
          event.preventDefault();
          event.stopPropagation();

          if (formSubmitting) return;

          var allValid = true;

          for (var k = 0; k < fields.length; k++) {
            if (!validateField(fields[k])) {
              allValid = false;
            }
          }

          if (!allValid) {
            app.notify('Bitte korrigieren Sie die Fehler im Formular.', 'danger');
            return;
          }

          formSubmitting = true;

          var submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
            submitBtn.style.opacity = '0.7';
          }

          setTimeout(function() {
            app.notify('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
            
            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1500);

            formSubmitting = false;
          }, 1500);
        });
      })(forms[i]);
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'btn btn-primary';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.position = 'fixed';
    scrollBtn.style.bottom = '20px';
    scrollBtn.style.right = '20px';
    scrollBtn.style.width = '50px';
    scrollBtn.style.height = '50px';
    scrollBtn.style.borderRadius = '50%';
    scrollBtn.style.display = 'none';
    scrollBtn.style.zIndex = '1000';
    scrollBtn.style.fontSize = '24px';
    scrollBtn.style.padding = '0';
    scrollBtn.style.lineHeight = '1';
    scrollBtn.style.transition = 'all 0.3s ease-in-out';
    scrollBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

    document.body.appendChild(scrollBtn);

    var handleScrollBtn = throttle(function() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'flex';
        scrollBtn.style.alignItems = 'center';
        scrollBtn.style.justifyContent = 'center';
        scrollBtn.style.animation = 'fadeIn 0.3s ease-in-out';
      } else {
        scrollBtn.style.display = 'none';
      }
    }, 100);

    window.addEventListener('scroll', handleScrollBtn, { passive: true });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initModalPrivacy() {
    if (app.modalPrivacyInit) return;
    app.modalPrivacyInit = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

    for (var i = 0; i < privacyLinks.length; i++) {
      (function(link) {
        var href = link.getAttribute('href');
        if (href && (href === '#privacy' || href === '#!privacy')) {
          link.addEventListener('click', function(e) {
            e.preventDefault();

            var modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modal.style.zIndex = '1100';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.animation = 'fadeIn 0.3s ease-in-out';

            var modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#ffffff';
            modalContent.style.padding = '2rem';
            modalContent.style.borderRadius = '12px';
            modalContent.style.maxWidth = '600px';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.position = 'relative';
            modalContent.style.animation = 'slideUp 0.4s ease-out';

            modalContent.innerHTML = '<h2>Datenschutzerklärung</h2><p>Hier finden Sie unsere Datenschutzrichtlinien...</p><button class="btn btn-primary mt-4" onclick="this.closest(\'.modal-overlay\').remove()">Schließen</button>';

            modal.className = 'modal-overlay';
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            modal.addEventListener('click', function(e) {
              if (e.target === modal) {
                modal.remove();
              }
            });
          });
        }
      })(privacyLinks[i]);
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollEffects();
    initScrollSpy();
    initActiveMenu();
    initIntersectionObserver();
    initCountUp();
    initImages();
    initHoverEffects();
    initRippleEffect();
    initForms();
    initScrollToTop();
    initModalPrivacy();

    headerHeight = getHeaderHeight();
    window.addEventListener('resize', throttle(function() {
      headerHeight = getHeaderHeight();
    }, 200), { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();