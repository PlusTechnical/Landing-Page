// Global variables
let translations = {};
let currentLanguage = "en";

// Translation system
async function loadTranslations(lang) {
  try {
    const response = await fetch(`./locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang} translations`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading translations:", error);
    // Fallback to English if loading fails
    if (lang !== "en") {
      return await loadTranslations("en");
    }
    return {};
  }
}

// Update page content with translations
function updateContent(translations) {
  // Update elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      element.textContent = translation;
    }
  });

  // Update placeholders
  const placeholderElements = document.querySelectorAll(
    "[data-i18n-placeholder]"
  );
  placeholderElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      element.placeholder = translation;
    }
  });
}

// Get nested translation using dot notation (e.g., "nav.features")
function getNestedTranslation(obj, path) {
  return path.split(".").reduce((current, key) => {
    return current && current[key] ? current[key] : null;
  }, obj);
}

// Language switcher functionality
async function toggleLanguage() {
  const body = document.body;
  const langButton = document.querySelector(".lang-switcher");

  // Toggle language
  currentLanguage = currentLanguage === "en" ? "es" : "en";

  // Show loading state
  langButton.disabled = true;
  langButton.textContent = "...";

  try {
    // Load and apply translations
    translations = await loadTranslations(currentLanguage);
    updateContent(translations);

    // Update language button
    langButton.textContent = currentLanguage === "en" ? "ES" : "EN";

    // Update body data attribute
    body.setAttribute("data-lang", currentLanguage);

    // Store language preference
    localStorage.setItem("preferred-language", currentLanguage);
  } catch (error) {
    console.error("Failed to switch language:", error);
    // Revert on error
    currentLanguage = currentLanguage === "en" ? "es" : "en";
    langButton.textContent = currentLanguage === "en" ? "ES" : "EN";
  } finally {
    langButton.disabled = false;
  }
}

// Mobile menu functionality
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = document.querySelector(".mobile-menu");

  navLinks.classList.toggle("active");
  mobileMenu.classList.toggle("active");

  // Update hamburger icon
  if (navLinks.classList.contains("active")) {
    mobileMenu.innerHTML = "✕";
  } else {
    mobileMenu.innerHTML = "☰";
  }
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (window.innerWidth <= 768 && navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    mobileMenu.classList.remove("active");
    mobileMenu.innerHTML = "☰";
  }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Close mobile menu after clicking
        closeMobileMenu();
      }
    });
  });
}

// Form submission handler
function initializeForm() {
  const form = document.querySelector(".contact-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent =
      currentLanguage === "en" ? "Sending..." : "Enviando...";

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      const message =
        translations.contact?.form?.success || "Thank you for your message!";
      alert(message);
      form.reset();

      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }, 1500);
  });
}

// Header scroll effect
function initializeHeaderScroll() {
  let lastScrollY = 0;
  const header = document.querySelector("header");

  window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;

    // Change header background on scroll
    if (currentScrollY > 100) {
      header.style.background = "rgba(26, 35, 64, 0.98)";
      header.style.backdropFilter = "blur(15px)";
    } else {
      header.style.background = "rgba(26, 35, 64, 0.95)";
      header.style.backdropFilter = "blur(10px)";
    }

    // Hide/show header based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      header.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up
      header.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
  });
}

// Initialize animations with Intersection Observer
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe feature cards for animation
  const cards = document.querySelectorAll(".feature-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = `opacity 0.6s ease ${
      index * 0.1
    }s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe other elements
  const aboutText = document.querySelector(".about-text");
  const aboutVisual = document.querySelector(".about-visual");

  if (aboutText && aboutVisual) {
    [aboutText, aboutVisual].forEach((element, index) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = `opacity 0.8s ease ${
        index * 0.2
      }s, transform 0.8s ease ${index * 0.2}s`;
      observer.observe(element);
    });
  }
}

// Handle window resize
function handleResize() {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (window.innerWidth > 768) {
    navLinks.style.display = "flex";
    mobileMenu.innerHTML = "☰";
  } else {
    navLinks.style.display = "none";
  }
}

// Initialize preferred language
async function initializeLanguage() {
  // Check for stored language preference
  const storedLang = localStorage.getItem("preferred-language");

  // Check browser language if no stored preference
  const browserLang = navigator.language.split("-")[0];

  // Determine initial language
  if (storedLang && ["en", "es"].includes(storedLang)) {
    currentLanguage = storedLang;
  } else if (["es"].includes(browserLang)) {
    currentLanguage = browserLang;
  } else {
    currentLanguage = "en"; // Default to English
  }

  // Load and apply translations
  translations = await loadTranslations(currentLanguage);
  updateContent(translations);

  // Update language button
  const langButton = document.querySelector(".lang-switcher");
  langButton.textContent = currentLanguage === "en" ? "ES" : "EN";

  // Update body data attribute
  document.body.setAttribute("data-lang", currentLanguage);
}

// Error handling for failed resource loads
function handleResourceErrors() {
  window.addEventListener("error", function (e) {
    if (e.target.tagName === "IMG") {
      console.warn("Image failed to load:", e.target.src);
      e.target.style.display = "none";
    }
  });
}

// Performance optimization
function optimizePerformance() {
  // Lazy load images if any are added later
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Main initialization function
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Initialize language first
    await initializeLanguage();

    // Initialize all other functionality
    initializeSmoothScrolling();
    initializeForm();
    initializeHeaderScroll();
    initializeAnimations();
    handleResourceErrors();
    optimizePerformance();

    // Add event listeners
    window.addEventListener("resize", handleResize);

    console.log("WineSoft landing page initialized successfully");
  } catch (error) {
    console.error("Error initializing page:", error);
    // Fallback: ensure basic functionality works
    initializeSmoothScrolling();
    initializeForm();
  }
});

// Expose functions to global scope for inline event handlers
window.toggleLanguage = toggleLanguage;
window.toggleMobileMenu = toggleMobileMenu;