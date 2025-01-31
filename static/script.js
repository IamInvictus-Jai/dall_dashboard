// Configuration
let ITEMS_PER_PAGE = 15;
let TOTAL_IMAGES = 0; // Total number of images updated after fetching the images
let TEMP_TOTAL_IMAGES = 0; // Used for changes in total images upon switching festivals

// State
let currentPage = 0;

// DOM Elements
const imageGrid = document.getElementById("imageGrid");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const checkBox = document.querySelector('.filter-checkbox');

// Theme Management
const themeSelect = document.getElementById('themeSelect');
const themeIcon = document.querySelector('.theme-icon');

// System theme detection
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

// Theme management functions
function getSystemTheme() {
    return systemThemeMedia.matches ? 'dark' : 'light';
}

function updateThemeIcon(theme) {
    themeIcon.classList.add('rotating');
    
    setTimeout(() => {
        if (theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark')) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        themeIcon.classList.remove('rotating');
    }, 200);
}

function setTheme(theme) {
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    updateThemeIcon(theme);
}

// Initialize theme
const savedTheme = localStorage.getItem('theme-preference') || 'system';
themeSelect.value = savedTheme;
setTheme(savedTheme);

// Event Listeners for theme changes
themeSelect.addEventListener('change', (e) => {
    const newTheme = e.target.value;
    localStorage.setItem('theme-preference', newTheme);
    setTheme(newTheme);
});

// Listen for system theme changes
systemThemeMedia.addEventListener('change', (e) => {
    if (themeSelect.value === 'system') {
        setTheme('system');
    }
});

// Create a debounced wrapper for theme changes to prevent rapid switching
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced theme setter to prevent flickering
const debouncedSetTheme = debounce(setTheme, 150);

// Add theme transition complete listener
document.documentElement.addEventListener('transitionend', (e) => {
    if (e.target === document.documentElement) {
        document.documentElement.classList.remove('theme-transitioning');
    }
});



// Generate image data
// const images = Array.from({ length: TOTAL_IMAGES }, (_, i) => ({
//   id: i,
//   src: `https://picsum.photos/300/200?random=${i}`, // Using Lorem Picsum for demo images
//   alt: `Image ${i + 1}`,
// }));
let images = {};
let filteredImages = [];
let festivals = ["All Festivals"];

function filter_templates(selectedFestival) {
  const showPreferedImages = checkBox.checked;

  links_list = [];
  if (selectedFestival === "All Festivals") {
    let collections = Object.values(images);

    collections.forEach((collection) => {
      collection.forEach((document) => {

        if (showPreferedImages) {
          document["preferred_engine"].forEach((preferred_engine) => {
            links_list = links_list.concat(document["links"][preferred_engine]);
          });
        }
        else {
          Object.values(document["links"]).forEach(link => {
            links_list = links_list.concat(link);
          });
        }

      });
    });
  } else {
    let collection = images[selectedFestival];
    collection.forEach((document) => {

      if (showPreferedImages) {
        document["preferred_engine"].forEach((preferred_engine) => {
          links_list = links_list.concat(document["links"][preferred_engine]);
        });
      } else {
        Object.values(document["links"]).forEach((link) => {
          links_list = links_list.concat(link);
        });
      }

    });
  }
  filteredImages = links_list;
}

// Fetch images from server
async function fetchImages() {
  try {
    const response = await fetch("/api/images/");
    const data = await response.json();

    let festives = Object.keys(data.images);
    festivals = festivals.concat(Array.from(festives));

    images = data.images;
    filter_templates("All Festivals");
    TOTAL_IMAGES = filteredImages.length;
    TEMP_TOTAL_IMAGES = filteredImages.length;

  } catch (error) {
    console.error('Error fetching images:', error);
  }
  finally {
    loadContainer = document.querySelector(".loading-container");
    loadContainer.removeChild(loadContainer.children[0]);
    loadContainer.removeChild(loadContainer.children[0]);
    nextBtn.disabled = false;
  }
}

function update_filter_box() {
  const sort = document.getElementById('sort');

  for (const festival of festivals) {
    const option = document.createElement('option');
    option.value = festival;
    option.textContent = festival;
    sort.appendChild(option);
  }

  sort.addEventListener('change', () => {
    const selectedFestival = sort.value;
    currentPage = 0;

    filter_templates(selectedFestival);
    TEMP_TOTAL_IMAGES = filteredImages.length;
    displayImages(currentPage);
  });
}

// Functions
function displayImages(page) {
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageImages = filteredImages.slice(start, end);

  // Clear current images
  imageGrid.innerHTML = "";

  // Add new images with fade-in animation
  pageImages.forEach((image, index) => {
    const card = document.createElement("div");
    card.className = "image-card";
    card.style.opacity = "0";
    card.style.animation = `fadeIn 0.2s ease forwards ${index * 0.1}s`;

    const img = document.createElement("img");
    img.src = `${image}`;
    // img.alt = image.alt;
    img.loading = "lazy"; // Lazy loading for better performance

    card.appendChild(img);
    imageGrid.appendChild(card);
  });

  // Update button states
  updatePaginationButtons();
}

function add_navigationBtn() {
  btnElement = `
    <button id="prevBtn" class="page-btn" disabled>
        <i class="fas fa-chevron-left"></i>
        Previous
    </button>
    <button id="nextBtn" class="page-btn">
        Next
        <i class="fas fa-chevron-right"></i>
    </button>
  `;
  let paginationDiv = document.querySelector('.pagination');
  paginationDiv.innerHTML = btnElement;
}

function updatePaginationButtons() {
  const totalPages = Math.ceil(TEMP_TOTAL_IMAGES / ITEMS_PER_PAGE);
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === totalPages - 1;
}

// Event Listeners
prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    window.scrollTo(0, 0);
    displayImages(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(TEMP_TOTAL_IMAGES / ITEMS_PER_PAGE);
  if (currentPage < totalPages - 1) {
    currentPage++;
    window.scrollTo(0, 0);
    displayImages(currentPage);
  }
});

checkBox.addEventListener('change', () => {
  currentPage = 0;
  
  const sort = document.getElementById("sort");
  filter_templates(sort.value);
  TEMP_TOTAL_IMAGES = filteredImages.length;
  displayImages(currentPage);
});

// Add keydown event listeners for keyboard navigation
document.addEventListener("keydown", (e) => {
  
  if (e.key === "ArrowLeft" && !prevBtn.disabled) {
    prevBtn.click();
  } else if (e.key === "ArrowRight" && !nextBtn.disabled) {
    nextBtn.click();
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await fetchImages();
  update_filter_box();
  displayImages(currentPage);
  // add_navigationBtn();

  // Add hover animation to nav items
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-2px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)";
    });
  });
});
