// Carousel viedo data
const videoCarouselData = [
  {
    id: "RJTCAL1DRro",
    title: "In That Quiet Earth - Hennur | Total Environment",
    chapters: [
      { time: 0, title: "Project Introduction & Design Concept" },
      { time: 75, title: "Location Advantages Off Hennur Road" },
      { time: 180, title: "L21 Villa Layout Walkthrough" },
      { time: 320, title: "Terrace Gardens & Earthy Textures" },
      { time: 460, title: "Amenities & Community Clubhouse" },
      { time: 580, title: "Pricing & Customization Summary" }
    ]
  },
  {
    id: "jj_aUFX8SV8",
    title: "After the Rain - Yelahanka | Total Environment",
    chapters: [
      { time: 0, title: "Introduction to Earth-Sheltered Villas" },
      { time: 130, title: "Green Roofs & Thermal Insulation Features" },
      { time: 330, title: "4 BHK Villa Internal Layout Walkthrough" },
      { time: 525, title: "Central Courtyard & Natural Ventilation" },
      { time: 740, title: "Sustainable Building Materials & Finishes" },
      { time: 940, title: "Homeowner Testimonials & Community Life" }
    ]
  },
  {
    id: "xmmxkmVSiq0",
    title: "Pursuit of a Radical Rhapsody - Whitefield | Total Environment",
    chapters: [
      { time: 0, title: "Project Overview & Lake-Facing Concept" },
      { time: 110, title: "V40 Courtyard Home Layout Walkthrough" },
      { time: 270, title: "Double-Height Living Spaces & Landscaping" },
      { time: 435, title: "Lake Boardwalk & Community Amenities" },
      { time: 585, title: "Construction Standards & Interior Details" },
      { time: 730, title: "Summary, Location Benefits & Contact Info" }
    ]
  }
];

// Slider state
let activeVideosList = [...videoCarouselData];
let currentVideoIndex = 0;
let ytPlayer = null;
let playbackTimer = null;
let generatedChapterData = null;


// Load YouTube Player IFrame API script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Initialize player when IFrame API is cued
window.onYouTubeIframeAPIReady = function() {
  initPlayer(activeVideosList[currentVideoIndex].id);
};

function initPlayer(videoId) {
  ytPlayer = new YT.Player('youtube-player', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: {
      'playsinline': 1,
      'rel': 0,
      'modestbranding': 1,
      'controls': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  renderChapters(activeVideosList[currentVideoIndex]);
  renderCarouselIndicators();
  startTimeMonitoring();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    startTimeMonitoring();
  } else {
    stopTimeMonitoring();
  }
}

// Chapters Displays & Monitoring

function renderChapters(videoData) {
  const container = document.getElementById("chaptersList");
  container.innerHTML = "";
  
  document.getElementById("videoTitleBadge").textContent = videoData.title;

  videoData.chapters.forEach((chapter, index) => {
    const item = document.createElement("div");
    item.className = "chapter-item";
    item.setAttribute("role", "listitem");
    item.dataset.time = chapter.time;
    item.dataset.index = index;

    const timeSpan = document.createElement("span");
    timeSpan.className = "chapter-time";
    timeSpan.textContent = formatTime(chapter.time);

    const titleSpan = document.createElement("span");
    titleSpan.className = "chapter-title";
    titleSpan.textContent = chapter.title;

    item.appendChild(timeSpan);
    item.appendChild(titleSpan);

    // Jump player timeline to coordinate offset
    item.addEventListener("click", () => {
      if (ytPlayer && typeof ytPlayer.seekTo === "function") {
        ytPlayer.seekTo(chapter.time, true);
        ytPlayer.playVideo();
      }
    });

    container.appendChild(item);
  });
}

function startTimeMonitoring() {
  stopTimeMonitoring();
  playbackTimer = setInterval(() => {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === "function") {
      const currentTime = Math.floor(ytPlayer.getCurrentTime());
      highlightActiveChapter(currentTime);
    }
  }, 250);
}

function stopTimeMonitoring() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function highlightActiveChapter(time) {
  const currentVideo = activeVideosList[currentVideoIndex];
  const chapters = currentVideo.chapters;
  let activeIndex = -1;

  for (let i = 0; i < chapters.length; i++) {
    const start = chapters[i].time;
    const end = (i + 1 < chapters.length) ? chapters[i + 1].time : Infinity;

    if (time >= start && time < end) {
      activeIndex = i;
      break;
    }
  }

  const items = document.querySelectorAll("#chaptersList .chapter-item");
  items.forEach((item, index) => {
    if (index === activeIndex) {
      if (!item.classList.contains("active")) {
        item.classList.add("active");
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      item.classList.remove("active");
    }
  });
}

// Carousel Navigation

function renderCarouselIndicators() {
  const container = document.getElementById("carouselIndicators");
  container.innerHTML = "";
  activeVideosList.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `indicator ${index === currentVideoIndex ? 'active' : ''}`;
    dot.addEventListener("click", () => navigateToVideo(index));
    container.appendChild(dot);
  });
}

function navigateToVideo(index) {
  currentVideoIndex = index;
  renderCarouselIndicators();
  
  const video = activeVideosList[currentVideoIndex];
  renderChapters(video);

  if (ytPlayer && typeof ytPlayer.cueVideoById === "function") {
    ytPlayer.cueVideoById(video.id);
  }
}

document.getElementById("prevBtn").addEventListener("click", () => {
  let index = currentVideoIndex - 1;
  if (index < 0) index = activeVideosList.length - 1;
  navigateToVideo(index);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  let index = currentVideoIndex + 1;
  if (index >= activeVideosList.length) index = 0;
  navigateToVideo(index);
});

// Automatic Chapter Generator 

const generateBtn = document.getElementById("generateBtn");
const ytUrlInput = document.getElementById("ytUrlInput");
const loader = document.getElementById("generatorLoader");
const loaderStatus = document.getElementById("loaderStatus");
const progressBar = document.getElementById("progressBar");
const outputPanel = document.getElementById("generatorOutput");
const codeSnippet = document.getElementById("codeSnippet");
const generatedChaptersList = document.getElementById("generatedChaptersList");

generateBtn.addEventListener("click", () => {
  const url = ytUrlInput.value.trim();
  if (!url) return;

  const videoId = extractVideoId(url);
  if (!videoId) {
    alert("Invalid YouTube URL. Please verify and try again.");
    return;
  }

  simulateChapterGeneration(videoId);
});

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Simulates speech structure timeline segment analysis in UI

function simulateChapterGeneration(videoId) {
  loader.classList.remove("idhidden");
  outputPanel.classList.add("idhidden");
  progressBar.style.width = "0%";
  
  const steps = [
  { progress: 20, text: "Processing video URL..." },
  { progress: 50, text: "Generating suggested chapters..." },
  { progress: 80, text: "Building chapter timeline..." },
  { progress: 95, text: "Preparing chapter data..." },
  { progress: 100, text: "Success!" }
];

  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      loaderStatus.textContent = steps[currentStep].text;
      progressBar.style.width = `${steps[currentStep].progress}%`;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add("idhidden");
        showGeneratedChapters(videoId);
      }, 300);
    }
  }, 600);
}

//  Render preview of generated chapter details
function showGeneratedChapters(videoId) {
  const mockTitles = [
    "Introduction & High-level Goals",
    "Detailed Walkthrough of Features",
    "Underlying Architecture & Layout Setup",
    "Implementation & Code Demo",
    "Common Edge Cases & Performance Tuning",
    "Summary, Best Practices & Final Review"
  ];
  const mockOffsets = [0, 95, 220, 395, 530, 680];

  generatedChapterData = {
    id: videoId,
    title: `Suggested Chapters (${videoId})`,
    chapters: mockOffsets.map((time, idx) => ({
      time: time,
      title: mockTitles[idx]
    }))
  };

  generatedChaptersList.innerHTML = "";
  generatedChapterData.chapters.forEach((chapter) => {
    const item = document.createElement("div");
    item.className = "chapter-item";
    
    const timeSpan = document.createElement("span");
    timeSpan.className = "chapter-time";
    timeSpan.textContent = formatTime(chapter.time);

    const titleSpan = document.createElement("span");
    titleSpan.className = "chapter-title";
    titleSpan.textContent = chapter.title;

    item.appendChild(timeSpan);
    item.appendChild(titleSpan);
    generatedChaptersList.appendChild(item);
  });

  // Output formatting
  const codeString = `const chapters = [\n` + 
    generatedChapterData.chapters.map(c => `  { time: ${c.time}, title: "${c.title}" }`).join(",\n") +
    `\n];`;
  
  codeSnippet.textContent = codeString;
  outputPanel.classList.remove("idhidden");
  outputPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load generated items to active carousel player
document.getElementById("loadVideoBtn").addEventListener("click", () => {
  if (!generatedChapterData) return;

  const existingIndex = activeVideosList.findIndex(v => v.id === generatedChapterData.id);
  if (existingIndex !== -1) {
    currentVideoIndex = existingIndex;
  } else {
    activeVideosList.push(generatedChapterData);
    currentVideoIndex = activeVideosList.length - 1;
  }

  navigateToVideo(currentVideoIndex);
});

// Copy code clip
document.getElementById("copyBtn").addEventListener("click", () => {
  const code = codeSnippet.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy Code";
    }, 2000);
  });
});

// Helper Utilities

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- TASK 1: EXCLUSIVE PRIVILEGES SLIDER ---
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

  function updateConfig() {
    const width = window.innerWidth;
    if (width < 480) {
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

 
  function updateSlideTransforms(translate) {
    const centerOffset = (containerWidth - slideWidth) / 2;

    slides.forEach((slide, index) => {
      // 1. Calculate the center position of this specific slide
      const slideCenter = index * (slideWidth + config.spaceBetween) + slideWidth / 2;
      
      // 2. Calculate the center point of the container relative to wrapper coordinates
      const containerCenter = -translate + containerWidth / 2;

      // 3. Compute normalized offset from center 
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
   * @param {number} index 
   * @param {boolean} instant 
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



  // Render mobile slide indicator dots dynamically based on slide count.

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
      prevIndex = slides.length - 1;
    }
    goToSlide(prevIndex);
    resetAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= slides.length) {
      nextIndex = 0;
    }
    goToSlide(nextIndex);
    resetAutoplay();
  });


  container.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevBtn.click();
    } else if (e.key === "ArrowRight") {
      nextBtn.click();
    }
  });


  // Touch triggers (Mobile/Tablet)
  container.addEventListener("touchstart", handleStart, { passive: false });
  container.addEventListener("touchmove", handleMove, { passive: false });
  container.addEventListener("touchend", handleEnd);

  // Mouse triggers (Desktop)
  container.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);


  container.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoplay();
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    startAutoplay();
  });


  window.addEventListener("resize", () => {
    updateLayout();
    goToSlide(currentIndex, true); 
  });


  updateLayout();
  buildPagination();
  goToSlide(0, true);
  startAutoplay();
});
