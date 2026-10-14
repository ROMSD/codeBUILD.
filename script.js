// ============================================================
// THEME TOGGLE
// Toggles between light and dark themes, saves preference to localStorage,
// and respects system default settings.
// ============================================================

const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.material-icons') : null;

// Determine current initial theme
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.textContent = 'dark_mode';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) themeIcon.textContent = 'light_mode';
  }
}

// Set theme on initial load
applyTheme(currentTheme);

// Handle toggle click
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
  });
}
//...............................form...
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const successDiv = form.querySelector("[data-fs-success]");
  const errorDiv = form.querySelector("[data-fs-error]");

  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous messages
    if (successDiv) successDiv.textContent = "";
    if (errorDiv) errorDiv.textContent = "";

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "Submit";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        if (successDiv) {
          successDiv.textContent = "Thank you! Your submission has been received.";
        }
        form.reset();
      } else {
        const data = await response.json().catch(() => null);
        const errorMessage = (data && data.errors) 
          ? data.errors.map(err => err.message).join(", ")
          : "Oops! There was a problem submitting your form.";
          
        if (errorDiv) {
          errorDiv.textContent = errorMessage;
        }
      }
    } catch (error) {
      if (errorDiv) {
        errorDiv.textContent = "Oops! There was a problem submitting your form.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});
//=========================================================
// MOBILE NAVIGATION
// Opens and closes the navigation menu on smaller screens.
// ============================================================

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}


// ============================================================
// AUTOMATIC FOOTER YEAR
// Keeps the copyright year current without manual editing.
// ============================================================

const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ============================================================
// CONTACT FORM
// Validates the form and prepares an email using mailto:.
// ============================================================


/* ==========================================
   CONTACT FORM
   Handles form submission using Formspree.
   Displays success and error messages on-page.
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");

    // Stop if this page does not contain the form.
    if (!form) return;

    const successDiv = form.querySelector("[data-fs-success]");
    const errorDiv = form.querySelector("[data-fs-error]");
    const submitButton = form.querySelector('button[type="submit"]');

    // Handle form submission only once.
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear previous messages.
        if (successDiv) successDiv.textContent = "";
        if (errorDiv) errorDiv.textContent = "";

        if (!form.reportValidity()) return;

        const originalButtonText = submitButton
            ? submitButton.textContent
            : "Submit";

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
                let errorMessage =
                    "Unable to submit your form. Please try again.";

                try {
                    const data = await response.json();

                    if (data.errors && data.errors.length > 0) {
                        errorMessage = data.errors
                            .map(error => error.message)
                            .join(", ");
                    }
                } catch (error) {
                    // Keep the default error message.
                }

                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                } else {
                    console.error(errorMessage);
                }
            }
        } catch (error) {
            console.error("Contact form error:", error);

            if (errorDiv) {
                errorDiv.textContent =
                    "Unable to send your message. Check your connection and try again.";
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
});

// ============================================================
// ANIMATED 3D-STYLE BACKGROUND
// Uses the HTML Canvas API to draw moving particles and lines.
// Dynamically reads theme colors via CSS variable helpers.
// ============================================================

const canvas = document.getElementById('background3d');

if (canvas) {
  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let particles = [];

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particleCount = Math.min(
      110,
      Math.max(35, Math.floor((width * height) / 12500))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.35 + Math.random() * 0.65,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      radius: 1.8 + Math.random() * 2.5
    }));

    drawBackground();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    const offsetX = pointer.x * 12;
    const offsetY = pointer.y * 12;

    const styles = getComputedStyle(document.documentElement);
    const particleRGB = styles.getPropertyValue('--particle-rgb').trim() || '196, 255, 77';
    const lineRGB = styles.getPropertyValue('--line-rgb').trim() || '160, 210, 112';

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
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 125 * Math.min(a.z, b.z) + 25;

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.45;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(${lineRGB}, ${opacity})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach((particle) => {
      const x = particle.x + offsetX * particle.z;
      const y = particle.y + offsetY * particle.z;

      const radius = particle.radius * particle.z;

      ctx.beginPath();
      ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleRGB}, ${0.12 * particle.z})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleRGB}, ${0.7 + particle.z * 0.3})`;
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
    requestAnimationFrame(animateBackground);
  }

  window.addEventListener('pointermove', (event) => {
    pointer.targetX = (event.clientX / width - 0.5) * 2;
    pointer.targetY = (event.clientY / height - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();

  if (!reducedMotion) {
    animateBackground();
  }
}

/* =================================
   TYPING ANIMATION
================================= */

const typingText =
    document.getElementById("typingText");


const messages = [

    "We build digital experiences........",

    "Modern responsive websites........",

    "Scalable web apps........",

    "We solve your problems........"

];


let messageIndex = 0;

let characterIndex = 0;

let deleting = false;


function typeEffect() {

    const currentMessage =
        messages[messageIndex];


    if (!deleting) {

        typingText.textContent =
            currentMessage.substring(
                0,
                characterIndex + 1
            );

        characterIndex++;


        if (characterIndex === currentMessage.length) {

            deleting = true;

            setTimeout(typeEffect, 4000);

            return;

        }

    } else {

        typingText.textContent =
            currentMessage.substring(
                0,
                characterIndex - 1
            );

        characterIndex--;


        if (characterIndex === 0) {

            deleting = false;

            messageIndex++;

            if (messageIndex === messages.length) {

                messageIndex = 0;

            }

        }

    }


    const speed = deleting ? 100 : 120;

    setTimeout(typeEffect, speed);

}


typeEffect();



/* =================================
   TYPING ANIMATION 2s
================================= */

const typingTextss = document.getElementById("typingTexts");


const messge = [

    "Creative thinking",

    "Thoughtful technology."

];


let messgeIndex = 0;

let charcterIndex = 0;

let delleting = false;


function typeEffects() {

    const currentMessge = messge[messgeIndex];


    if (!delleting) {

        typingTextss.textContent = currentMessge.substring(
                0,
                charcterIndex + 1
            );

        charcterIndex++;


        if (charcterIndex === currentMessge.length) {

            delleting = true;

            setTimeout(typeEffects, 2000);

            return;

        }

    } else {

        typingTextss.textContent =
            currentMessge.substring(
                0,
                charcterIndex - 1
            );

        charcterIndex--;


        if (charcterIndex === 0) {

            delleting = false;

            messgeIndex++;

            if (messgeIndex === messge.length) {

                messgeIndex = 0;

            }

        }

    }


    const speed = delleting ? 50 : 90;

    setTimeout(typeEffects, speed);

}


typeEffects();




