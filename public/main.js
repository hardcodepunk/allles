import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

const womanUrl = new URL('/woman.glb', import.meta.url);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

const container = document.getElementById('mesh');

if (container) {
  container.appendChild(renderer.domElement);
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 1, 2);

// Lights
const mainLight = new THREE.PointLight('white', 1);
mainLight.position.set(10, 5, 0);
const secondLight = new THREE.PointLight('#fde58b', 0.2);
secondLight.position.set(-5, 5, 0);
const ambientLight = new THREE.AmbientLight('white', 0.1);
scene.add(mainLight, secondLight, ambientLight);

// Model Loader
const assetLoader = new GLTFLoader();
let mixer, animationAction, model;

assetLoader.load(womanUrl.href, function (gltf) {
    model = gltf.scene;
    scene.add(model);
    model.rotation.y = 0; // Start with no rotation
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'Action');
    animationAction = mixer.clipAction(clip);
    animationAction.play();
}, undefined, function (error) {
    console.error("Error loading model:", error);
});

// Create Sphere
// const sphereGeometry = new THREE.IcosahedronGeometry(4, 30);
// const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphere.position.set(0, 1, 0.5); // Move forward in front of the background
// sphere.scale.set(0.1, 0.1, 0.1); // Make it larger
// sphere.visible = false; // Force visibility

// scene.add(sphere);

async function loadShader(url) {
  const response = await fetch(url);
  return response.text();
}

async function createCustomMaterial() {
  // Fetch vertex and fragment shaders from public folder
  const vertexShader = await loadShader('./shaders/vertexShader.vert');
  const fragmentShader = await loadShader('./shaders/fragmentShader.frag');

  return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
          u_time: { value: 0.0 }
      }
  });
}

createCustomMaterial().then(material => {
  const geo = new THREE.IcosahedronGeometry(4, 30);
  const sphere = new THREE.Mesh(geo, mat);
  sphere.customDepthMaterial = new THREE.MeshDepthMaterial();
  scene.add(sphere);
});

// Scroll event listener (Animate and Swap at 1/3 Scroll)
window.addEventListener('scroll', () => {
    if (mixer && animationAction && model) {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const animationEndPoint = 1 / 3;

        if (scrollPercent <= animationEndPoint) {
            // Model is visible and animating
            const adjustedScrollPercent = scrollPercent / animationEndPoint;
            const duration = animationAction.getClip().duration;
            
            mixer.setTime(adjustedScrollPercent * duration); // Only update animation on scroll
            model.rotation.y = adjustedScrollPercent * -Math.PI / 3;
            
            // Ensure model is visible and sphere is hidden
            model.visible = true;
            sphere.visible = false;
        } else {
            // Hide model and show sphere at 1/3 scroll
            model.visible = false;
            sphere.visible = true;
        }
    }
});

// Resize Handling
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }, 200);
});

// Animation loop (No continuous mixer update)
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

/*
 * Toggle on hover
 */

const hoverToToggleElements = document.getElementsByClassName("js-hover-to-toggle");
const whatInfoPopup = document.getElementById("home__what__anchor__info-pop-up");

const hoverToToggle = (e) => {
  e.addEventListener("mouseover", () => {
    if (window.innerWidth >= 1200) {
      e.classList.add("is-hovered");
      checkHoverClass();
    }
  });

  e.addEventListener("mouseleave", () => {
    if (window.innerWidth >= 1200) {
      e.classList.remove("is-hovered");
      checkHoverClass();
    }
  });
};

for (let i = 0; i < hoverToToggleElements.length; i++) {
  hoverToToggle(hoverToToggleElements[i]);
}

const checkHoverClass = () => {
  if (window.innerWidth < 1200) {
    whatInfoPopup.classList.remove("js-is-displayed");
    return;
  }

  let isHovered = false;
  for (let i = 0; i < hoverToToggleElements.length; i++) {
    if (hoverToToggleElements[i].classList.contains("is-hovered")) {
      isHovered = true;
      if (hoverToToggleElements[i].nextElementSibling) {
        const copyAnchorInfo = hoverToToggleElements[i].nextElementSibling.innerHTML;
        whatInfoPopup.innerHTML = copyAnchorInfo;
      }
      break;
    }
  }

  if (isHovered) {
    whatInfoPopup.classList.add("js-is-displayed");
  } else {
    whatInfoPopup.classList.remove("js-is-displayed");
  }
};

document.getElementById('menu-toggle')
  .addEventListener('click', function(){
    document.body.classList.toggle('nav-open');
});

const aboutLink = document.getElementById("about-link");

if (aboutLink) {
  console.log('about link found');

  aboutLink.addEventListener("click", function (event) {
    // Prevent default action only if on the homepage
    if (window.location.pathname === "/") {
      event.preventDefault();
      console.log("Prevented default action on the homepage");
    }

    console.log('about clicked');
    document.body.classList.toggle('nav-open');

    // Scroll to the "about" section
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      console.log('about section found');

      // Calculate the position to scroll to
      const yOffset = aboutSection.getBoundingClientRect().top + window.pageYOffset;

      // Smooth scroll to the "about" section
      window.scrollTo({
        top: yOffset,
        behavior: "smooth"
      });

      // Update the URL to include "/about"
      history.pushState(null, null, "/about");
    } else {
      console.error('about section not found');
    }
  });
}


// Function to add fade-in effect with dynamic delay
function addFadeInEffect() {
  const visibleSquares = document.querySelectorAll(".square:not(.hidden)");

  visibleSquares.forEach(square => {
    square.classList.remove("fade-in");
    square.style.animationDelay = "";
  });

  setTimeout(() => {
    visibleSquares.forEach((square, index) => {
      square.classList.add("fade-in");
      square.style.animationDelay = `${index * 0.1}s`;
    });
  }, 10);
}

const filterDescriptions = {
  personal: "Together, we create a personalized plan that’s not only effective but also easy to integrate into your everyday life.",
  group: "Work on flexibility, endurance, and strength by joining high-quality group movement classes. With four main categories, each class type offers unique benefits and experiences. Try different options to find your favorites.",
  corporate: "Invest in a healthier, more productive workplace with our tailored wellness programs. Designed to reduce stress, boost focus, and promote physical and mental wellbeing, these services offer a flexible range of options to meet the unique needs of your organization.",
  events: "Attend rituals that immerse you in authentic knowledge of using movement, meditation, sound, touch, and cuisine as medicine."
};

// Function to apply filter and fade-in effect
function applyFilter(filter, clickedElement = null, updateUrl = false) {
  const allSquares = document.querySelectorAll(".square");
  const allButtons = document.querySelectorAll(".filter-button");

  // Remove active class from all buttons
  allButtons.forEach(button => button.classList.remove("active"));
  
  // Check if the filter exists in filterDescriptions
  if (filter in filterDescriptions) {
    // Set the element's innerText to the corresponding string
    document.getElementById("filter__description").innerText = filterDescriptions[filter];
  } else {
    document.getElementById("filter__description").innerText = "";
  }

  // Add active class to clicked button
  if (clickedElement) {
    clickedElement.classList.add("active");
  } else {
    const filterButton = document.querySelector(`.filter-button[data-filter="${filter}"]`);
    if (filterButton) {
      filterButton.classList.add("active");
    }
  }

  // Show all squares by default and remove fade-in classes
  allSquares.forEach(square => {
    square.classList.remove("hidden", "fade-in");
    square.style.animationDelay = "";
  });

  // Hide squares that do not match the selected filter
  // if (filter !== "all") { // Assuming "all" shows all items
    allSquares.forEach(square => {
      if (!square.classList.contains(filter)) {
        square.classList.add("hidden");
      }
    });

  

  // Apply fade-in effect
  addFadeInEffect();

  // Update URL if required
  if (updateUrl) {
    const url = new URL(window.location);
    url.searchParams.set('filter', filter);
    window.history.replaceState({}, '', url);
  }
}

// Add click event listener to each filter button
document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", function() {
    const filter = this.getAttribute("data-filter"); // Uses data-filter attribute on buttons
    applyFilter(filter, this, true); // Pass 'true' to update the URL
  });
});

// Check URL for "filter" parameter and apply corresponding filter on page load
window.addEventListener("DOMContentLoaded", () => {

   // Check if the current path is "/about"
   if (window.location.pathname === "/about") {
    // Get the section with the ID "about"
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      // Scroll to the "about" section
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  let filter = urlParams.get("filter");

  // Default to 'all' if filter is empty or nonexistent
  if (!filter) {
    filter = "all";
  }

  applyFilter(filter);
});

window.onload = function() {
  addFadeInEffect();     // Adds fade-in effect
  animate();
  
};

const sentences = [
  "Drop a line if you have burning questions. No sage needed, just an email will do.",
  "Tight shoulders? Tighter deadlines? Shoot us a message for instant inbox relief.",
  "Feeling out of alignment? Our inbox is like a free-flowing Qi highway. Hop on.",
  "Drop a line if you want to harmonize your inbox. Our replies come with good vibes and zero spam.",
  "Need some inbox Zen? Contact us. We’re the digital essential oil you never knew you needed.",
  "Feel a cosmic urge to connect? Follow it. We’re ready for all your mystical queries.",
  "Drop us a line if you’ve got mind-body questions. We’re here to channel answers—no incense required.",
  "Got stress? Drop a line. We’re basically inbox aromatherapy.",
  "Drop a line if you’re ready for wellness enlightenment or just need info on our workshops.",
  "Feeling out of balance? Reach out, we’re like email acupuncture—without the needles.",
  "Seeking calm in a chaotic world? Hit us up. Our reply emails are basically guided meditations.",
  "Trying to reach inner peace… or just us? Start typing, we’re listening.",
  "Ready to harmonize your workplace? Reach out. We’re basically corporate wellness ninjas."
];

const typewriterElement = document.getElementById("typewriter");
let charIndex = 0;
let isDeleting = false;
let shuffledSentences = shuffleArray([...sentences]); // Shuffle the sentences at the start
let sentenceIndex = 0;
let currentSentence = shuffledSentences[sentenceIndex];

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function type() {
  // Adjust the display text based on typing or deleting
  typewriterElement.textContent = currentSentence.substring(0, charIndex);

  // If typing and reaching the end of the sentence
  if (!isDeleting && charIndex === currentSentence.length) {
    isDeleting = true;
    setTimeout(type, 2500); // Pause at the end of each sentence

    // If deleting and fully erased the text
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    sentenceIndex++;
    if (sentenceIndex >= shuffledSentences.length) {
      // Reshuffle when all sentences are shown
      shuffledSentences = shuffleArray([...sentences]);
      sentenceIndex = 0;
    }
    currentSentence = shuffledSentences[sentenceIndex];
    setTimeout(type, 1000); // Pause before starting the next sentence

    // Continue typing or deleting
  } else {
    charIndex += isDeleting ? -1 : 1; // Increment or decrement charIndex
    setTimeout(type, isDeleting ? 15 : 30); // Adjust speed for typing and deleting
  }
}

// Start the typewriter animation
if (typewriterElement) {
  type();
}
