/**
 * Avrora Tech — Frontend Logic v2
 * - Header scroll state
 * - Mobile navigation
 * - Smooth anchor scrolling
 * - Intersection Observer reveals
 * - Animated counters
 * - Canvas particle system (hero)
 * - Dynamic footer year
 * - Easter egg: Modo Kaleid Blood
 */

(() => {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    /* ─── Dynamic Year ─── */
    $$('#footer-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    /* ─── Header Scroll State ─── */
    const header = $('#main-header');
    if (header) {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 40);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ─── Mobile Navigation ─── */
    const toggle = $('#mobile-toggle');
    const mobileNav = $('#mobile-nav');

    if (toggle && mobileNav) {
        const open = () => {
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('is-open');
        };
        const close = () => {
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('is-open');
        };

        toggle.addEventListener('click', () => {
            mobileNav.classList.contains('is-open') ? close() : open();
        });
        $$('a', mobileNav).forEach(link => link.addEventListener('click', close));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    /* ─── Smooth Anchor Scrolling ─── */
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = $(targetId);
            if (!target) return;
            e.preventDefault();
            const headerH = header ? header.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ─── Intersection Observer Reveals ─── */
    const revealElements = $$('.reveal');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    /* ─── Animated Counters ─── */
    const counterEls = $$('[data-target]');

    if (counterEls.length > 0 && 'IntersectionObserver' in window) {
        const animateCounter = (el) => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1400;
            const steps = 50;
            const increment = target / steps;
            let current = 0;
            let step = 0;

            // Easing: easeOutQuart
            const easeOut = (t) => 1 - Math.pow(1 - t, 4);

            const update = () => {
                step++;
                const progress = easeOut(step / steps);
                current = Math.round(progress * target);
                el.textContent = current + suffix;
                if (step < steps) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target + suffix;
                }
            };

            requestAnimationFrame(update);
        };

        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counterEls.forEach(el => counterObserver.observe(el));
    }

    /* ─── Canvas Particle System (Hero - Ultra Optimized) ─── */
    const canvas = $('#particles-canvas');

    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d', { alpha: true });
        let W, H, particles = [], animFrame = null, isScrolling = false, scrollTimeout = null;

        const PARTICLE_COUNT = 24;
        const CYAN  = [0, 242, 255];
        const VIOLET = [123, 97, 255];

        const lerpColor = (c1, c2, t) =>
            c1.map((v, i) => Math.round(v + (c2[i] - v) * t));

        class Particle {
            constructor() { this.reset(true); }

            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : H + 10;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = -(Math.random() * 0.4 + 0.15);
                this.life = 0;
                this.maxLife = Math.random() * 200 + 120;
                this.colorT = Math.random();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life++;
                if (this.life > this.maxLife || this.y < -10) this.reset();
            }

            draw() {
                const progress = this.life / this.maxLife;
                const alpha = progress < 0.15
                    ? progress / 0.15
                    : progress > 0.75
                        ? 1 - (progress - 0.75) / 0.25
                        : 1;

                const isLight = document.body.classList.contains('light-theme');
                const [r, g, b] = lerpColor(CYAN, VIOLET, this.colorT);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = isLight
                    ? `rgba(0, 155, 185, ${alpha * 0.4})`
                    : `rgba(${r},${g},${b},${alpha * 0.5})`;
                ctx.fill();
            }
        }

        const resize = () => {
            W = canvas.width = canvas.offsetWidth || window.innerWidth;
            H = canvas.height = canvas.offsetHeight || window.innerHeight;
        };

        const init = () => {
            resize();
            particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        };

        const connectParticles = () => {
            const isLight = document.body.classList.contains('light-theme');
            const maxDist = isLight ? 100 : 85;
            const maxDistSq = maxDist * maxDist;

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    if (Math.abs(dx) > maxDist) continue;
                    const dy = p1.y - p2.y;
                    if (Math.abs(dy) > maxDist) continue;
                    
                    const distSq = dx * dx + dy * dy;
                    if (distSq < maxDistSq) {
                        const alpha = (1 - Math.sqrt(distSq) / maxDist) * (isLight ? 0.2 : 0.15);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isLight
                            ? `rgba(0, 160, 210, ${alpha})`
                            : `rgba(0, 242, 255, ${alpha})`;
                        ctx.lineWidth = 0.75;
                        ctx.stroke();
                    }
                }
            }
        };

        const loop = () => {
            if (!isScrolling) {
                ctx.clearRect(0, 0, W, H);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();
                }
                connectParticles();
            }
            animFrame = requestAnimationFrame(loop);
        };

        window.addEventListener('resize', resize, { passive: true });

        window.addEventListener('scroll', () => {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 100);
        }, { passive: true });

        // Only run particles when hero is visible
        if ('IntersectionObserver' in window) {
            const heroObs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        if (!animFrame) loop();
                    } else {
                        cancelAnimationFrame(animFrame);
                        animFrame = null;
                    }
                });
            }, { threshold: 0 });

            const hero = $('#inicio') || $('section');
            if (hero) heroObs.observe(hero);
        }

        init();
        loop();
    }

    /* ─── FAQ Accordion ─── */
    $$('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const isOpen = item.classList.contains('is-open');
            
            // Close other open items for accordion behavior
            $$('.faq-item').forEach(other => {
                if (other !== item) {
                    other.classList.remove('is-open');
                    const otherBtn = $('.faq-question', other);
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('is-open', !isOpen);
            btn.setAttribute('aria-expanded', (!isOpen).toString());
        });
    });

    /* ─── Legal Privacy Modal (Habeas Data) ─── */
    const modal = $('#privacy-modal');
    const openTriggers = [$('#trigger-privacy-modal'), $('#footer-privacy-link')].filter(Boolean);
    const closeBtn = $('#close-privacy-modal');

    if (modal) {
        const openModal = (e) => {
            if (e) e.preventDefault();
            modal.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        openTriggers.forEach(trigger => trigger.addEventListener('click', openModal));
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) closeModal();
        });
    }

    /* ─── Analytics & Google Ads Conversion Event Tracker ─── */
    window.trackConversion = (eventName, params = {}) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: eventName,
            ...params,
            timestamp: new Date().toISOString()
        });

        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params);
        }
    };

    // Auto-bind elements with data-track attributes
    document.addEventListener('click', (e) => {
        const trackEl = e.target.closest('[data-track]');
        if (trackEl) {
            const eventName = trackEl.getAttribute('data-track') || 'cta_click';
            const eventLabel = trackEl.getAttribute('data-track-label') || trackEl.textContent.trim().slice(0, 40);
            window.trackConversion(eventName, { label: eventLabel });
        }
    });

    /* ─── B2B Lead Contact Form ─── */
    const leadForm = $('#lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedback = $('#form-feedback', leadForm);
            
            const name = $('#form-name', leadForm)?.value.trim() || '';
            const company = $('#form-company', leadForm)?.value.trim() || 'No especificada';
            const phone = $('#form-contact', leadForm)?.value.trim() || '';
            const service = $('#form-service', leadForm)?.value || '';
            const message = $('#form-message', leadForm)?.value.trim() || '';
            const habeas = $('#form-habeas', leadForm)?.checked || false;

            if (!name || !phone || !service || !message || !habeas) {
                if (feedback) {
                    feedback.className = 'form-feedback is-error';
                    feedback.textContent = 'Por favor completa todos los campos requeridos (*) y acepta la política de datos.';
                }
                return;
            }

            // Track conversion event for Google Ads & Analytics
            window.trackConversion('generate_lead', {
                service_requested: service,
                has_company: company !== 'No especificada'
            });

            // Construct formatted WhatsApp message
            const waMessage = `Hola Avrora Tech 👋🏼\n\n` +
                `*Solicitud de Consulta Técnica*\n` +
                `👤 *Nombre:* ${name}\n` +
                `🏢 *Empresa:* ${company}\n` +
                `📱 *Contacto:* ${phone}\n` +
                `🎯 *Área:* ${service}\n` +
                `📝 *Detalles:* ${message}`;

            const encodedMsg = encodeURIComponent(waMessage);
            const waUrl = `https://wa.me/573004002881?text=${encodedMsg}`;

            if (feedback) {
                feedback.className = 'form-feedback is-success';
                feedback.innerHTML = `✓ Solicitud enviada. Conectando con ingeniería en WhatsApp...`;
            }

            setTimeout(() => {
                window.open(waUrl, '_blank');
                leadForm.reset();
                if (feedback) feedback.className = 'form-feedback';
            }, 900);
        });
    }

    /* ─── Easter Egg: Modo Kaleid Blood ─── */
    const toggleKaleidMode = () => {
        document.body.classList.toggle('kaleid-blood-mode');
    };

    $$('#kaleid-trigger').forEach(trigger => {
        trigger.addEventListener('click', toggleKaleidMode);
    });

    let keyBuffer = [];
    const secretCode = 'avrora';
    document.addEventListener('keydown', (e) => {
        if (!e.key) return;
        keyBuffer.push(e.key.toLowerCase());
        keyBuffer = keyBuffer.slice(-secretCode.length);
        if (keyBuffer.join('') === secretCode) {
            toggleKaleidMode();
            keyBuffer = [];
        }
    });

    /* ─── Toast Notification Utility ─── */
    const showToast = (message) => {
        let toast = $('#toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-container';
            toast.innerHTML = `<div class="toast" role="status"><span class="toast-icon">✓</span><span class="toast-text"></span></div>`;
            document.body.appendChild(toast);
        }
        const textEl = $('.toast-text', toast);
        const toastInner = $('.toast', toast);
        if (textEl) textEl.textContent = message;
        toastInner.classList.add('is-show');
        setTimeout(() => {
            toastInner.classList.remove('is-show');
        }, 3200);
    };

    /* ─── Copy Email to Clipboard ─── */
    $$('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', () => {
            const email = link.getAttribute('href').replace('mailto:', '');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    showToast(`¡Correo ${email} copiado al portapapeles!`);
                }).catch(() => {});
            }
        });
    });

    /* ─── Scroll to Top Button ─── */
    const scrollTopBtn = $('#scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('is-visible', window.scrollY > 350);
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ─── Cotizador Interactivo de Proyectos ─── */
    const estimatorContainer = $('#project-estimator');
    if (estimatorContainer) {
        const typeOptions = $$('.estimator-option', estimatorContainer);
        const addonCards = $$('.estimator-checkbox-card', estimatorContainer);
        const priceDisplay = $('#estimator-total-price');
        const submitBtn = $('#estimator-submit');

        const formatCOP = (num) => {
            return '$ ' + num.toLocaleString('es-CO');
        };

        const updateEstimate = () => {
            let basePrice = 0;
            let baseName = '';
            
            typeOptions.forEach(opt => {
                if (opt.classList.contains('is-selected')) {
                    basePrice = parseInt(opt.dataset.price, 10) || 0;
                    baseName = opt.dataset.name || '';
                }
            });

            let addonTotal = 0;
            const selectedAddons = [];
            addonCards.forEach(card => {
                const chk = $('input[type="checkbox"]', card);
                if (chk && chk.checked) {
                    card.classList.add('is-selected');
                    const addonPrice = parseInt(card.dataset.price, 10) || 0;
                    addonTotal += addonPrice;
                    selectedAddons.push(card.dataset.name || '');
                } else {
                    card.classList.remove('is-selected');
                }
            });

            const total = basePrice + addonTotal;
            if (priceDisplay) {
                priceDisplay.textContent = basePrice > 0 ? formatCOP(total) + ' COP' : 'Cotización a medida';
            }

            if (submitBtn) {
                let msg = `Hola Avrora Tech 👋🏼\n\n*Cotización estimada desde el portal web*\n` +
                    `📦 *Proyecto Base:* ${baseName}\n`;
                if (selectedAddons.length > 0) {
                    msg += `🧩 *Módulos extra:* ${selectedAddons.join(', ')}\n`;
                }
                msg += `💰 *Presupuesto estimado:* ${basePrice > 0 ? formatCOP(total) + ' COP' : 'A medida'}\n\n` +
                    `Quiero revisar los detalles técnicos y disponibilidad con ingeniería.`;
                
                submitBtn.href = `https://wa.me/573004002881?text=${encodeURIComponent(msg)}`;
            }
        };

        typeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                typeOptions.forEach(o => o.classList.remove('is-selected'));
                opt.classList.add('is-selected');
                updateEstimate();
            });
        });

        addonCards.forEach(card => {
            const chk = $('input[type="checkbox"]', card);
            card.addEventListener('click', (e) => {
                if (e.target !== chk) {
                    chk.checked = !chk.checked;
                }
                updateEstimate();
            });
        });

        updateEstimate();
    }

    /* ─── Theme Switcher (Dark / Light Mode) ─── */
    const THEME_STORAGE_KEY = 'avrora-theme';

    const getStoredTheme = () => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            return null;
        }
    };

    const setStoredTheme = (theme) => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {}
    };

    const getPreferredTheme = () => {
        const stored = getStoredTheme();
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const updateToggleUI = (theme) => {
        const isLight = theme === 'light';
        $$('.theme-toggle-btn').forEach(btn => {
            btn.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
            btn.setAttribute('title', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
        });
    };

    const applyTheme = (theme, save = false) => {
        const isLight = theme === 'light';
        document.documentElement.classList.toggle('light-theme', isLight);
        document.body.classList.toggle('light-theme', isLight);
        updateToggleUI(theme);
        if (save) {
            setStoredTheme(theme);
        }
    };

    // Initialize theme on script load
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme, false);

    // Global listener for theme toggle buttons
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.theme-toggle-btn');
        if (toggleBtn) {
            const isCurrentlyLight = document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme');
            const newTheme = isCurrentlyLight ? 'dark' : 'light';
            applyTheme(newTheme, true);
        }
    });

    // Listen for system color scheme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!getStoredTheme()) {
                applyTheme(e.matches ? 'light' : 'dark', false);
            }
        });
    }

})();

