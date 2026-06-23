/**
 * ICICI Bank Credit Cards - Exclusive Privileges Slider Engine
 * Built with pure Vanilla JavaScript, HTML, and CSS (Zero Dependencies)
 * 
 * Replicates the exact 3D Coverflow effect, dynamic sizing, touch swiping, 
 * navigation buttons, autoplay, and responsive layout of Swiper.js.
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("exclusiveSlider");
  const wrapper = document.getElementById("sliderWrapper");
  const slides = Array.from(wrapper.querySelectorAll(".swiper-slide"));
  const prevBtn = document.getElementById("prevSlideButton");
  const nextBtn = document.getElementById("nextSlideButton");
  const paginationContainer = document.getElementById("sliderPagination");

  // Carousel State Variables
  let currentIndex = 0;
  let containerWidth = 0;
  let slideWidth = 0;
  let currentTranslate = 0;
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let autoplayTimer = null;
  let isHovered = false;

  // Active configurations based on breakpoints
  let config = {
    slidesPerView: 2.0,
    spaceBetween: 100,
    rotate: 25,
    stretch: 80,
    depth: 200
  };

  /**
   * Determine carousel configuration parameters based on screen width.
   * Matches the exact breakpoints and values extracted from the original website.
   */
  function updateConfig() {
    const width = window.innerWidth;
    if (width < 480) {
      // Mobile Small
      config.slidesPerView = 1.2;
      config.spaceBetween = 60;
      config.rotate = 25;
      config.stretch = 50;
      config.depth = 100;
    } else if (width < 768) {
      // Tablet Mobile
      config.slidesPerView = 1.3;
      config.spaceBetween = 30;
      config.rotate = 35;
      config.stretch = 30;
      config.depth = 180;
    } else if (width < 1200) {
      // Tablet
      config.slidesPerView = 1.7;
      config.spaceBetween = 100;
      config.rotate = 25;
      config.stretch = 70;
      config.depth = 200;
    } else {
      // Desktop
      config.slidesPerView = 2.0;
      config.spaceBetween = 100;
      config.rotate = 25;
      config.stretch = 80;
      config.depth = 200;
    }
  }

  /**
   * Recalculate container and slide widths based on active configurations.
   * Resets margins and updates offsets.
   */
  function updateLayout() {
    updateConfig();
    containerWidth = container.offsetWidth;

    // Standard formula: slideWidth = (containerWidth - gaps) / slidesVisible
    slideWidth = (containerWidth - (config.slidesPerView - 1) * config.spaceBetween) / config.slidesPerView;

    slides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
      slide.style.marginRight = `${config.spaceBetween}px`;
    });
  }

  /**
   * Calculate 3D transforms for all slides based on the wrapper's translation.
   * Replicates Swiper's 3D coverflow effect.
   */
  function updateSlideTransforms(translate) {
    const centerOffset = (containerWidth - slideWidth) / 2;

    slides.forEach((slide, index) => {
      // 1. Calculate the center position of this specific slide
      const slideCenter = index * (slideWidth + config.spaceBetween) + slideWidth / 2;
      
      // 2. Calculate the center point of the container relative to wrapper coordinates
      const containerCenter = -translate + containerWidth / 2;

      // 3. Compute normalized offset from center (-1 represents one slide width left, +1 represents one slide width right)
      const offset = (slideCenter - containerCenter) / (slideWidth + config.spaceBetween);

      // Clamp offset for rotation and stretch overlays to prevent excessive displacement
      const clampedOffset = Math.max(-1, Math.min(1, offset));

      // Calculate 3D rotations and depth translations
      const rotateY = -clampedOffset * config.rotate;
      const translateZ = -Math.abs(offset) * config.depth;
      const translateX = -clampedOffset * config.stretch;

      // Smooth opacity scale (center slide is 1.0, outer slides approach 0.6)
      const opacity = 1 - Math.min(0.4, Math.abs(offset) * 0.4);

      // Layer index: center slide is always on top (zIndex 100), outer slides layered underneath
      const zIndex = Math.round(100 - Math.abs(offset) * 10);

      // Apply styles to slide container
      slide.style.transform = `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg)`;
      slide.style.zIndex = zIndex;
      slide.style.opacity = opacity.toFixed(2);

      // Manage active class naming conventions
      if (Math.abs(offset) < 0.5) {
        slide.classList.add("swiper-slide-active");
      } else {
        slide.classList.remove("swiper-slide-active");
      }
    });
  }

  /**
   * Animate the carousel to a specific slide index.
   * @param {number} index - Index of target slide
   * @param {boolean} instant - Skip transitions (useful on resize)
   */
  function goToSlide(index, instant = false) {
    currentIndex = index;

    // Apply or disable transitions
    if (instant) {
      wrapper.style.transition = "none";
      slides.forEach(slide => slide.style.transition = "none");
    } else {
      wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      slides.forEach(slide => {
        slide.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease, z-index 0.5s ease";
      });
    }

    // Calculate translation required to center the active slide
    const centerOffset = (containerWidth - slideWidth) / 2;
    currentTranslate = centerOffset - currentIndex * (slideWidth + config.spaceBetween);

    // Apply translation to container wrapper
    wrapper.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

    // Update 3D card alignments
    updateSlideTransforms(currentTranslate);

    // Highlight active paginations
    updatePagination();
  }

  // --- PAGINATION INDICATORS ---

  /**
   * Render mobile slide indicator dots dynamically based on slide count.
   */
  function buildPagination() {
    paginationContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const bullet = document.createElement("span");
      bullet.classList.add("swiper-pagination-bullet");
      bullet.setAttribute("role", "button");
      bullet.setAttribute("aria-label", `Go to slide ${index + 1}`);
      bullet.addEventListener("click", () => {
        goToSlide(index);
        resetAutoplay();
      });
      paginationContainer.appendChild(bullet);
    });
  }

  /**
   * Highlight bullet matching the current slide index.
   */
  function updatePagination() {
    const bullets = Array.from(paginationContainer.querySelectorAll(".swiper-pagination-bullet"));
    bullets.forEach((bullet, index) => {
      if (index === currentIndex) {
        bullet.classList.add("swiper-pagination-bullet-active");
      } else {
        bullet.classList.remove("swiper-pagination-bullet-active");
      }
    });
  }

  // --- EVENT HANDLERS: DRAGGING & SWIPING ---

  function getClientX(event) {
    return event.touches ? event.touches[0].clientX : event.clientX;
  }

  function handleStart(event) {
    // Avoid executing triggers if dragging was initiated on child links or controls
    if (event.target.closest(".swiper-button-prev") || event.target.closest(".swiper-button-next") || event.target.closest(".swiper-pagination-bullet")) {
      return;
    }

    isDragging = true;
    startX = getClientX(event);
    startTranslate = currentTranslate;

    // Stop autoplay during interaction
    stopAutoplay();

    // Disable CSS animations for instantaneous drag feedback
    wrapper.style.transition = "none";
    slides.forEach(slide => slide.style.transition = "none");
  }

  function handleMove(event) {
    if (!isDragging) return;
    
    // Prevent default scroll behavior on mobile touchmoves
    if (event.cancelable) event.preventDefault();

    const currentX = getClientX(event);
    const diffX = currentX - startX;
    
    // Dampen drag offsets beyond boundaries (elastic stretch behavior)
    let dragTranslate = startTranslate + diffX;
    const centerOffset = (containerWidth - slideWidth) / 2;
    const minTranslate = centerOffset - (slides.length - 1) * (slideWidth + config.spaceBetween);
    const maxTranslate = centerOffset;

    if (dragTranslate > maxTranslate) {
      dragTranslate = maxTranslate + (dragTranslate - maxTranslate) * 0.3;
    } else if (dragTranslate < minTranslate) {
      dragTranslate = minTranslate + (dragTranslate - minTranslate) * 0.3;
    }

    currentTranslate = dragTranslate;
    wrapper.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

    // Update 3D card values dynamically during drag
    updateSlideTransforms(currentTranslate);
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Calculate nearest integer slide index relative to current displacement
    const centerOffset = (containerWidth - slideWidth) / 2;
    const rawIndex = (centerOffset - currentTranslate) / (slideWidth + config.spaceBetween);
    let targetIndex = Math.round(rawIndex);

    // Clamp index boundaries
    targetIndex = Math.max(0, Math.min(slides.length - 1, targetIndex));

    // Snap smoothly to closest slide
    goToSlide(targetIndex);

    // Restart autoplay loop
    if (!isHovered) {
      startAutoplay();
    }
  }

  // --- AUTOPLAY LOOP ---

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0; // Loop back
      }
      goToSlide(nextIndex);
    }, 2500);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    if (!isHovered) {
      startAutoplay();
    }
  }

  // --- BUTTON CLICKS ---

  prevBtn.addEventListener("click", () => {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = slides.length - 1; // Loop back to end
    }
    goToSlide(prevIndex);
    resetAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= slides.length) {
      nextIndex = 0; // Loop back to start
    }
    goToSlide(nextIndex);
    resetAutoplay();
  });

  // --- KEYBOARD ACCESSIBILITY ---

  container.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevBtn.click();
    } else if (e.key === "ArrowRight") {
      nextBtn.click();
    }
  });

  // --- DRAG / TOUCH EVENT LISTENERS ---

  // Touch triggers (Mobile/Tablet)
  container.addEventListener("touchstart", handleStart, { passive: false });
  container.addEventListener("touchmove", handleMove, { passive: false });
  container.addEventListener("touchend", handleEnd);

  // Mouse triggers (Desktop)
  container.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);

  // --- HOVER PAUSE CONTROLS ---

  container.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoplay();
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    startAutoplay();
  });

  // --- WINDOW RESIZING ---

  window.addEventListener("resize", () => {
    updateLayout();
    goToSlide(currentIndex, true); // Snap instantly during resize
  });

  // --- INITIALIZATION ---

  updateLayout();
  buildPagination();
  goToSlide(0, true); // Initialize first slide instantly
  startAutoplay();
});
