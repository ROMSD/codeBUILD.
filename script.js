
/* =========================================================
   codeBUILD. TECHNOLOGIES — MAIN JAVASCRIPT
   Includes:
   1. Light/dark theme
   2. Mobile navigation drawer
   3. Formspree contact form
   4. Automatic footer year
   5. Animated particle background
   6. Two independent typing animations
   ========================================================= */


/* =========================================================
   1. THEME TOGGLE
   Saves the theme preference and respects the system theme
   when the visitor has not previously selected a preference.
   ========================================================= */

(() => {
    const themeToggleBtn = document.getElementById("themeToggle");
    const themeIcon = themeToggleBtn?.querySelector(".material-icons");

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("theme");
    } catch (error) {
        // Continue without saved preferences if storage is unavailable.
    }

    const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    let currentTheme =
        savedTheme === "light" || savedTheme === "dark"
            ? savedTheme
            : systemPrefersDark
                ? "dark"
                : "light";

    function applyTheme(theme) {
        currentTheme = theme;

        if (theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }

        if (themeIcon) {
            themeIcon.textContent =
                theme === "light" ? "dark_mode" : "light_mode";
        }

        if (themeToggleBtn) {
            themeToggleBtn.setAttribute(
                "aria-label",
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            );
        }

        // Redraw the background using the new theme colours.
        window.dispatchEvent(new Event("themechange"));
    }

    applyTheme(currentTheme);

    themeToggleBtn?.addEventListener("click", () => {
        const nextTheme =
            currentTheme === "light" ? "dark" : "light";

        try {
            localStorage.setItem("theme", nextTheme);
        } catch (error) {
            // The theme still works for the current page session.
        }

        applyTheme(nextTheme);
    });
})();


/* =========================================================
   2. MOBILE NAVIGATION
   Opens and closes the mobile drawer, updates accessibility
   attributes, and closes the menu when a link is selected.
   ========================================================= */

(() => {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (!menuToggle || !navLinks) return;

    function setMenuState(isOpen) {
        navLinks.classList.toggle("open", isOpen);

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        menuToggle.textContent = isOpen ? "×" : "☰";

        // Prevent the page behind the drawer from scrolling.
        document.body.classList.toggle("menu-open", isOpen);
    }

    menuToggle.setAttribute("aria-controls", "navLinks");

    // Start with the menu closed.
    setMenuState(false);

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");
        setMenuState(!isOpen);
    });

    // Close the menu after selecting a navigation link.
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });

    // Close the menu when the Escape key is pressed.
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            navLinks.classList.contains("open")
        ) {
            setMenuState(false);
            menuToggle.focus();
        }
    });

    // Reset mobile navigation when returning to desktop width.
    const desktopMedia = window.matchMedia("(min-width: 769px)");

    desktopMedia.addEventListener("change", (event) => {
        if (event.matches) {
            setMenuState(false);
        }
    });
})();


/* =========================================================
   3. CONTACT FORM — FORMSPREE
   Uses one submit listener only.
   Displays success/error messages and prevents repeated
   submissions while a request is in progress.
   ========================================================= */

(() => {
    const form = document.getElementById("contactForm");

    if (!form) return;

    const successDiv = form.querySelector("[data-fs-success]");
    const errorDiv = form.querySelector("[data-fs-error]");
    const submitButton = form.querySelector('button[type="submit"]');

    let isSubmitting = false;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSubmitting || !form.reportValidity()) return;

        if (successDiv) successDiv.textContent = "";
        if (errorDiv) errorDiv.textContent = "";

        const originalButtonText = submitButton?.textContent || "Submit";

        isSubmitting = true;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.ok) {
                if (successDiv) {
                    successDiv.textContent =
                        "Thank you! Your message has been sent.";
                }

                form.reset();
            } else {
                let message =
                    "Unable to send your message. Please try again.";

                try {
                    const data = await response.json();

                    if (Array.isArray(data.errors) && data.errors.length) {
                        message = data.errors
                            .map((item) => item.message)
                            .join(", ");
                    }
                } catch (error) {
                    // Use the default message if no JSON response exists.
                }

                if (errorDiv) {
                    errorDiv.textContent = message;
                } else {
                    console.error(message);
                }
            }
        } catch (error) {
            console.error("Contact form error:", error);

            if (errorDiv) {
                errorDiv.textContent =
                    "Connection error. Please check your internet and try again.";
            }
        } finally {
            isSubmitting = false;

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
})();


/* =========================================================
   4. AUTOMATIC FOOTER YEAR
   ========================================================= */

(() => {
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
})();


/* =========================================================
   5. ANIMATED PARTICLE BACKGROUND
   Uses Canvas without an external library.
   Limits particle count and pixel density for mobile devices.
   ========================================================= */

(() => {
    const canvas = document.getElementById("background3d");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const mobileDevice = window.matchMedia(
        "(max-width: 768px)"
    ).matches;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = null;

    const pointer = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Fewer particles on narrow screens to reduce CPU usage.
        const particleCount = Math.min(
            mobileDevice ? 42 : 75,
            Math.max(
                mobileDevice ? 18 : 30,
                Math.floor((width * height) / (mobileDevice ? 22000 : 16000))
            )
        );

        particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            z: 0.35 + Math.random() * 0.65,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            radius: 1 + Math.random() * 1.5
        }));

        drawBackground();
    }

    function drawBackground() {
        ctx.clearRect(0, 0, width, height);

        const styles = getComputedStyle(document.documentElement);

        const particleRGB =
            styles.getPropertyValue("--particle-rgb").trim() ||
            "196, 255, 77";

        const lineRGB =
            styles.getPropertyValue("--line-rgb").trim() ||
            "160, 210, 112";

        const offsetX = pointer.x * 10;
        const offsetY = pointer.y * 10;

        // Draw connecting lines between nearby particles.
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            const ax = a.x + offsetX * a.z;
            const ay = a.y + offsetY * a.z;

            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];

                const bx = b.x + offsetX * b.z;
                const by = b.y + offsetY * b.z;

                const dx = ax - bx;
                const dy = ay - by;
                const distance = Math.hypot(dx, dy);

                const maxDistance = 115 * Math.min(a.z, b.z) + 20;

                if (distance < maxDistance) {
                    const opacity =
                        (1 - distance / maxDistance) * 0.35;

                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(bx, by);
                    ctx.strokeStyle = `rgba(${lineRGB}, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw the particles.
        particles.forEach((particle) => {
            const x = particle.x + offsetX * particle.z;
            const y = particle.y + offsetY * particle.z;
            const radius = particle.radius * particle.z;

            ctx.beginPath();
            ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleRGB}, ${0.12 * particle.z})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleRGB}, 0.8)`;
            ctx.fill();
        });
    }

    function animateBackground() {
        particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < -10) particle.x = width + 10;
            if (particle.x > width + 10) particle.x = -10;
            if (particle.y < -10) particle.y = height + 10;
            if (particle.y > height + 10) particle.y = -10;
        });

        pointer.x += (pointer.targetX - pointer.x) * 0.025;
        pointer.y += (pointer.targetY - pointer.y) * 0.025;

        drawBackground();

        animationFrame = requestAnimationFrame(animateBackground);
    }

    window.addEventListener(
        "pointermove",
        (event) => {
            pointer.targetX = (event.clientX / width - 0.5) * 2;
            pointer.targetY = (event.clientY / height - 0.5) * 2;
        },
        { passive: true }
    );

    window.addEventListener("resize", resizeCanvas);

    // Update the canvas colours when the theme changes.
    window.addEventListener("themechange", drawBackground);

    resizeCanvas();

    if (!reducedMotion) {
        animationFrame = requestAnimationFrame(animateBackground);
    }

    // Pause animation when the tab is hidden to save resources.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        } else if (!reducedMotion && animationFrame === null) {
            animationFrame = requestAnimationFrame(animateBackground);
        }
    });
})();


/* =========================================================
   6. REUSABLE TYPING ANIMATION
   Supports both typing elements without duplicate functions.
   ========================================================= */

function createTypingAnimation(elementId, messages, options = {}) {
    const element = document.getElementById(elementId);

    // Safely skip animation if the HTML element is absent.
    if (!element || !messages.length) return;

    const typingSpeed = options.typingSpeed ?? 100;
    const deletingSpeed = options.deletingSpeed ?? 50;
    const pauseAfterTyping = options.pauseAfterTyping ?? 2000;
    const pauseAfterDeleting = options.pauseAfterDeleting ?? 350;

    // Respect reduced-motion preferences.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        element.textContent = messages[0];
        return;
    }

    let messageIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeoutId;

    function type() {
        const currentMessage = messages[messageIndex];

        if (!deleting) {
            characterIndex++;

            element.textContent = currentMessage.substring(
                0,
                characterIndex
            );

            if (characterIndex >= currentMessage.length) {
                deleting = true;
                timeoutId = setTimeout(type, pauseAfterTyping);
                return;
            }
        } else {
            characterIndex--;

            element.textContent = currentMessage.substring(
                0,
                characterIndex
            );

            if (characterIndex <= 0) {
                deleting = false;
                messageIndex = (messageIndex + 1) % messages.length;

                timeoutId = setTimeout(type, pauseAfterDeleting);
                return;
            }
        }

        timeoutId = setTimeout(
            type,
            deleting ? deletingSpeed : typingSpeed
        );
    }

    type();

    // Return a cleanup function in case the animation needs to stop.
    return () => clearTimeout(timeoutId);
}


// Hero typing animation.
createTypingAnimation(
    "typingText",
    [
        "We build digital experiences...",
        "Modern responsive websites...",
        "Scalable web apps...",
        "We solve your problems..."
    ],
    {
        typingSpeed: 90,
        deletingSpeed: 45,
        pauseAfterTyping: 2200,
        pauseAfterDeleting: 350
    }
);


// Footer typing animation.
createTypingAnimation(
    "typingTexts",
    [
        "Creative thinking",
        "Thoughtful technology."
    ],
    {
        typingSpeed: 90,
        deletingSpeed: 50,
        pauseAfterTyping: 2000,
        pauseAfterDeleting: 350
    }
);
