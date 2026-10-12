
/* ============================================================
   WEBSITE JAVASCRIPT
   Features:
   1. Dark and light theme toggle
   2. Contact form submission using Formspree
   3. Responsive mobile navigation
   4. Automatic footer year
   5. Animated particle background
   6. Hero typing animation
   7. Secondary typing animation
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     1. THEME TOGGLE
     Saves the user's preference and uses the system preference
     when no saved theme exists.
     ========================================================== */

  const themeToggleBtn = document.getElementById("themeToggle");

  const themeIcon = themeToggleBtn
    ? themeToggleBtn.querySelector(".material-icons")
    : null;

  // Read the saved theme safely.
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch (error) {
    console.warn("Theme preference could not be accessed.");
  }

  // Detect the operating system's preferred theme.
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Use the saved theme, or fall back to the system preference.
  let currentTheme =
    savedTheme || (systemPrefersDark ? "dark" : "light");

  /**
   * Applies the selected theme to the document.
   * Dark mode uses the default CSS variables.
   * Light mode uses the data-theme="light" attribute.
   */
  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");

      if (themeIcon) {
        themeIcon.textContent = "dark_mode";
      }

      if (themeToggleBtn) {
        themeToggleBtn.setAttribute(
          "aria-label",
          "Switch to dark mode"
        );
      }
    } else {
      document.documentElement.removeAttribute("data-theme");

      if (themeIcon) {
        themeIcon.textContent = "light_mode";
      }

      if (themeToggleBtn) {
        themeToggleBtn.setAttribute(
          "aria-label",
          "Switch to light mode"
        );
      }
    }

    // Redraw the canvas using the new theme colours.
    if (typeof window.redrawBackground === "function") {
      window.redrawBackground();
    }
  }

  // Apply the initial theme.
  applyTheme(currentTheme);

  // Toggle between light and dark themes.
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      currentTheme =
        currentTheme === "light" ? "dark" : "light";

      applyTheme(currentTheme);

      // Save the preference for future visits.
      try {
        localStorage.setItem("theme", currentTheme);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }


  /* ==========================================================
     2. CONTACT FORM
     Submits the contact form to Formspree using fetch().
     Displays success and error messages on the page.
     ========================================================== */

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    const successDiv = contactForm.querySelector("[data-fs-success]");
    const errorDiv = contactForm.querySelector("[data-fs-error]");

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    contactForm.addEventListener("submit", async (event) => {
      // Prevent the browser's default form submission.
      event.preventDefault();

      // Clear any messages from previous submissions.
      if (successDiv) successDiv.textContent = "";
      if (errorDiv) errorDiv.textContent = "";

      // Validate required fields before sending.
      if (!contactForm.reportValidity()) {
        return;
      }

      // Prevent repeated submissions while the request is running.
      const originalButtonText = submitButton
        ? submitButton.textContent
        : "Submit";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        // Send the form data to the Formspree endpoint.
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) {
          // Display the success message.
          if (successDiv) {
            successDiv.textContent =
              "Thank you! Your message has been sent.";
          }

          // Clear the form after successful submission.
          contactForm.reset();

        } else {
          // Prepare a useful error message.
          let errorMessage =
            "Unable to send your message. Please try again.";

          try {
            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
              errorMessage = data.errors
                .map((item) => item.message)
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
        // Handle network or connection errors.
        console.error("Contact form error:", error);

        if (errorDiv) {
          errorDiv.textContent =
            "Unable to send your message. Check your connection and try again.";
        }

      } finally {
        // Restore the button whether the request succeeds or fails.
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }


  /* ==========================================================
     3. RESPONSIVE MOBILE NAVIGATION
     Opens and closes the mobile menu.
     Closes the menu after a link is clicked, when Escape is
     pressed, or when the viewport returns to desktop size.
     ========================================================== */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {

    /**
     * Opens or closes the mobile navigation.
     */
    function setMenuOpen(isOpen) {
      navLinks.classList.toggle("open", isOpen);

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      // Update the menu icon.
      menuToggle.textContent = isOpen ? "✕" : "☰";

      // Prevent background scrolling while the drawer is open.
      document.body.classList.toggle("sidebar-open", isOpen);
    }

    // Toggle the menu when the button is clicked.
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("open");

      setMenuOpen(!isOpen);
    });

    // Close the menu after a navigation link is selected.
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    // Close the menu when the Escape key is pressed.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        navLinks.classList.contains("open")
      ) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    // Close the mobile menu when returning to desktop width.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 650) {
        setMenuOpen(false);
      }
    });
  }


  /* ==========================================================
     4. AUTOMATIC FOOTER YEAR
     Updates the copyright year automatically.
     ========================================================== */

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  /* ==========================================================
     5. ANIMATED PARTICLE BACKGROUND
     Draws moving particles and connecting lines on a canvas.
     Reads colours from the CSS variables:
       --particle-rgb
       --line-rgb

     Performance improvements:
     - Limits the number of particles.
     - Stops animation when the tab is hidden.
     - Respects the reduced-motion preference.
     - Limits the canvas pixel ratio.
     ========================================================== */

  const canvas = document.getElementById("background3d");

  if (canvas) {
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let width = 0;
      let height = 0;
      let particles = [];
      let animationFrameId = null;

      const pointer = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      };

      /**
       * Creates the particles and adjusts the canvas to
       * the current viewport size.
       */
      function resizeCanvas() {
        const dpr = Math.min(
          window.devicePixelRatio || 1,
          2
        );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Keep canvas drawing coordinates in CSS pixels.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Use fewer particles on smaller screens.
        const particleCount = Math.min(
          75,
          Math.max(
            30,
            Math.floor((width * height) / 18000)
          )
        );

        particles = Array.from(
          { length: particleCount },
          () => ({
            x: Math.random() * width,
            y: Math.random() * height,

            // Depth controls particle size and parallax.
            z: 0.35 + Math.random() * 0.65,

            // Slow particle movement.
            vx: (Math.random() - 0.5) * 0.24,
            vy: (Math.random() - 0.5) * 0.24,

            radius: 1.2 + Math.random() * 1.8
          })
        );

        drawBackground();
      }

      /**
       * Draws particles and connecting lines.
       */
      function drawBackground() {
        if (!width || !height) return;

        ctx.clearRect(0, 0, width, height);

        const offsetX = pointer.x * 12;
        const offsetY = pointer.y * 12;

        // Read the current CSS colours, including theme changes.
        const styles = getComputedStyle(
          document.documentElement
        );

        const particleRGB =
          styles.getPropertyValue("--particle-rgb").trim() ||
          "196, 255, 77";

        const lineRGB =
          styles.getPropertyValue("--line-rgb").trim() ||
          "160, 210, 112";

        // Precalculate particle positions for this frame.
        const positions = particles.map((particle) => ({
          x: particle.x + offsetX * particle.z,
          y: particle.y + offsetY * particle.z,
          z: particle.z,
          radius: particle.radius
        }));

        // Draw connecting lines between nearby particles.
        for (let i = 0; i < positions.length; i++) {
          const a = positions[i];

          for (let j = i + 1; j < positions.length; j++) {
            const b = positions[j];

            const dx = a.x - b.x;
            const dy = a.y - b.y;

            const distanceSquared = dx * dx + dy * dy;

            const maxDistance =
              125 * Math.min(a.z, b.z) + 25;

            // Avoid calculating square roots for distant particles.
            if (distanceSquared < maxDistance * maxDistance) {
              const distance = Math.sqrt(distanceSquared);

              const opacity =
                (1 - distance / maxDistance) * 0.4;

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);

              ctx.strokeStyle =
                `rgba(${lineRGB}, ${opacity})`;

              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw each particle with a subtle glow.
        positions.forEach((particle) => {
          const radius = particle.radius * particle.z;

          // Outer glow.
          ctx.beginPath();
          ctx.arc(
            particle.x,
            particle.y,
            radius * 3,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            `rgba(${particleRGB}, ${0.1 * particle.z})`;

          ctx.fill();

          // Main particle.
          ctx.beginPath();
          ctx.arc(
            particle.x,
            particle.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            `rgba(${particleRGB}, ${0.65 + particle.z * 0.3})`;

          ctx.fill();
        });
      }

      /**
       * Updates particle positions and renders the next frame.
       */
      function animateBackground() {
        // Do not animate when motion is disabled or the tab is hidden.
        if (
          reducedMotion ||
          document.hidden
        ) {
          animationFrameId = null;
          return;
        }

        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Wrap particles around the screen edges.
          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;

          if (particle.y < -10) particle.y = height + 10;
          if (particle.y > height + 10) particle.y = -10;
        });

        // Smoothly move the background in response to the pointer.
        pointer.x += (pointer.targetX - pointer.x) * 0.025;
        pointer.y += (pointer.targetY - pointer.y) * 0.025;

        drawBackground();

        animationFrameId =
          requestAnimationFrame(animateBackground);
      }

      /**
       * Starts animation only when it is needed.
       */
      function startAnimation() {
        if (
          reducedMotion ||
          document.hidden ||
          animationFrameId !== null
        ) {
          return;
        }

        animationFrameId =
          requestAnimationFrame(animateBackground);
      }

      /**
       * Stops the currently scheduled animation frame.
       */
      function stopAnimation() {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }

      // Update the pointer target when the mouse moves.
      window.addEventListener(
        "pointermove",
        (event) => {
          if (!width || !height) return;

          pointer.targetX =
            (event.clientX / width - 0.5) * 2;

          pointer.targetY =
            (event.clientY / height - 0.5) * 2;
        },
        { passive: true }
      );

      // Rebuild the canvas when the viewport changes.
      window.addEventListener("resize", resizeCanvas);

      // Pause animation when the browser tab is hidden.
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAnimation();
        } else {
          drawBackground();
          startAnimation();
        }
      });

      // Allow the theme toggle to redraw the background.
      window.redrawBackground = drawBackground;

      // Initialise the canvas.
      resizeCanvas();

      // Start movement unless the user prefers reduced motion.
      startAnimation();
    }
  }


  /* ==========================================================
     6. FIRST TYPING ANIMATION
     Rotates through the main hero messages.
     Requires an element with id="typingText".
     ========================================================== */

  const typingText = document.getElementById("typingText");

  if (typingText) {
    const messages = [
      "We build digital experiences...",
      "Modern responsive websites...",
      "Scalable web apps...",
      "We solve your problems..."
    ];

    let messageIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let typingTimer = null;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Display a complete message if reduced motion is preferred.
    if (reducedMotion) {
      typingText.textContent = messages[0];
    } else {
      function typeEffect() {
        const currentMessage = messages[messageIndex];

        if (!deleting) {
          // Add the next character.
          characterIndex++;

          typingText.textContent = currentMessage.substring(
            0,
            characterIndex
          );

          // Pause briefly when the complete message is visible.
          if (characterIndex >= currentMessage.length) {
            deleting = true;

            typingTimer = setTimeout(typeEffect, 1800);
            return;
          }

        } else {
          // Remove one character.
          characterIndex--;

          typingText.textContent = currentMessage.substring(
            0,
            characterIndex
          );

          // Move to the next message when the text is empty.
          if (characterIndex <= 0) {
            deleting = false;

            messageIndex =
              (messageIndex + 1) % messages.length;
          }
        }

        const speed = deleting ? 45 : 85;

        typingTimer = setTimeout(typeEffect, speed);
      }

      typeEffect();
    }
  }


  /* ==========================================================
     7. SECOND TYPING ANIMATION
     Rotates through supporting brand messages.
     Requires an element with id="typingTexts".
     ========================================================== */

  const typingTexts = document.getElementById("typingTexts");

  if (typingTexts) {
    const messages = [
      "Creative thinking",
      "Thoughtful technology."
    ];

    let messageIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Display a complete message if reduced motion is preferred.
    if (reducedMotion) {
      typingTexts.textContent = messages[0];
    } else {
      function typeSecondaryEffect() {
        const currentMessage = messages[messageIndex];

        if (!deleting) {
          // Add one character.
          characterIndex++;

          typingTexts.textContent = currentMessage.substring(
            0,
            characterIndex
          );

          // Pause when the complete message is displayed.
          if (characterIndex >= currentMessage.length) {
            deleting = true;

            setTimeout(typeSecondaryEffect, 2000);
            return;
          }

        } else {
          // Remove one character.
          characterIndex--;

          typingTexts.textContent = currentMessage.substring(
            0,
            characterIndex
          );

          // Switch messages when deletion is complete.
          if (characterIndex <= 0) {
            deleting = false;

            messageIndex =
              (messageIndex + 1) % messages.length;
          }
        }

        const speed = deleting ? 50 : 90;

        setTimeout(typeSecondaryEffect, speed);
      }

      typeSecondaryEffect();
    }
  }

}); // End DOMContentLoaded
