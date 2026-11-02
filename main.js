const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

canvas.width = 960;
canvas.height = 540;

const ASSETS = {
  mapImage: "ASSETS/MAP-V2.png",
  characterImage: "ASSETS/atas.png",
  canvasStand:
    "ASSETS/828a7dda-81c8-472e-8fb1-9f8fab7cfcb5-removebg-preview.png",
};

// 5 UNIQUE EASELS WITH INDIVIDUAL ARTWORK DETAILS
const easels = [
  {
    x: 120,
    y: 290,
    w: 70,
    h: 70,
    title: "Regal",
    medium: "Graphite",
    size: "1.5ft x 1.5ft",
    desc: "A cat portrait.",
    img: "ARTWORK/art1.jpg",
  },
  {
    x: 420,
    y: 330,
    w: 70,
    h: 70,
    title: "Metallic Lego Figure",
    medium: "Graphite",
    size: "A4 paper",
    desc: "Metallic texture and reflection application using graphite.",
    img: "ARTWORK/art2.jpg",
  },
  {
    x: 740,
    y: 280,
    w: 70,
    h: 70,
    title: "VALLEY OF SHADOWS",
    medium: "Mechanical Pencil 0.5mm",
    size: "8 x 10 in",
    desc: "Intricate mechanical pencil composition exploring architectural lines.",
    img: "ARTWORK/art3.jpg",
  },
  {
    x: 200,
    y: 410,
    w: 70,
    h: 70,
    title: "FROZEN MOMENT",
    medium: "Fine Liner & Pencil",
    size: "10 x 12 in",
    desc: "Detailed graphite sketch capturing organic light reflections.",
    img: "ARTWORK/art4.jpg",
  },
  {
    x: 700,
    y: 410,
    w: 70,
    h: 70,
    title: "ECHOES OF THE PAST",
    medium: "Pure Graphite on Paper",
    size: "12 x 16 in",
    desc: "Deep atmospheric exploration of retro nostalgic textures.",
    img: "ARTWORK/art5.jpg",
  },
];

// Keydown listener to open modal with the correct easel's data and images
window.addEventListener("keydown", (e) => {
  if (inspectModalOpen) {
    if (e.key === "Escape" || e.key === "esc" || e.key === "ESC") {
      inspectModalOpen = false;
      document.getElementById("art-modal").style.display = "none";
    }
    return;
  }

  if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") keys.w = true;
  if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") keys.a = true;
  if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") keys.s = true;
  if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") keys.d = true;

  if (e.key === "f" || e.key === "F") {
    if (nearbyEasel) {
      inspectModalOpen = true;

      // Populate modal text fields with the active easel's unique data
      document.getElementById("modalTitle").textContent = nearbyEasel.title;
      document.getElementById("modalMedium").textContent = nearbyEasel.medium;
      document.getElementById("modalSize").textContent = nearbyEasel.size;
      document.getElementById("modalDesc").textContent = nearbyEasel.desc;

      // Populate the artwork preview image dynamically
      const modalImg = document.getElementById("modalArtImg");
      if (modalImg && nearbyEasel.img) {
        modalImg.src = nearbyEasel.img;
      }

      // Display the modal box
      document.getElementById("art-modal").style.display = "flex";
    }
  }
});

const downFrames = [new Image(), new Image(), new Image(), new Image()];
downFrames[0].src = "ASSETS/Dwalk1.png";
downFrames[1].src = "ASSETS/Dwalk2.png";
downFrames[2].src = "ASSETS/Dwalk3.png";
downFrames[3].src = "ASSETS/Dwalk4.png";

const upFrames = [new Image(), new Image(), new Image(), new Image()];
upFrames[0].src = "ASSETS/Uwalk1.png";
upFrames[1].src = "ASSETS/Uwalk2.png";
upFrames[2].src = "ASSETS/Uwalk3.png";
upFrames[3].src = "ASSETS/Uwalk4.png";

const leftFrames = [new Image(), new Image(), new Image(), new Image()];
leftFrames[0].src = "ASSETS/Lwalk1.png";
leftFrames[1].src = "ASSETS/Lwalk2.png";
leftFrames[2].src = "ASSETS/Lwalk3.png";
leftFrames[3].src = "ASSETS/Lwalk4.png";

const rightFrames = [new Image(), new Image(), new Image(), new Image()];
rightFrames[0].src = "ASSETS/Rwalk1.png";
rightFrames[1].src = "ASSETS/Rwalk2.png";
rightFrames[2].src = "ASSETS/Rwalk3.png";
rightFrames[3].src = "ASSETS/Rwalk4.png";

const bgMap = new Image();
bgMap.src = ASSETS.mapImage;

const standImg = new Image();
standImg.src = ASSETS.canvasStand;

const charSheetImg = new Image();
charSheetImg.src = ASSETS.characterImage;

const keys = { w: false, a: false, s: false, d: false };

let nearbyEasel = null;
let inspectModalOpen = false;

window.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") keys.w = false;
  if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") keys.a = false;
  if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") keys.s = false;
  if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") keys.d = false;
});

let charX = 440;
let charY = 150;
let charSpeed = 2.5;
let currentDirection = "down";

let animFrame = 0;
let frameTimer = 0;
const frameSpeed = 8;
let isMoving = false;
let stepTimer = 0;

let loadedImagesCount = 0;
const allImages = [
  bgMap,
  standImg,
  charSheetImg,
  ...downFrames,
  ...upFrames,
  ...rightFrames,
  ...leftFrames,
];
const totalImages = allImages.length;

function imageLoaded() {
  loadedImagesCount++;
  if (loadedImagesCount >= totalImages) {
    gameLoop();
  }
}

allImages.forEach((img) => {
  img.onload = imageLoaded;
  img.onerror = () => {
    console.error("Failed to load image: " + img.src);
    imageLoaded();
  };
});

function checkCollision(x, y) {
  let playerBox = {
    x: x + 20,
    y: y + 45,
    w: 32,
    h: 22,
  };

  for (let easel of easels) {
    if (
      playerBox.x < easel.x + easel.w &&
      playerBox.x + playerBox.w > easel.x &&
      playerBox.y < easel.y + easel.h &&
      playerBox.y + playerBox.h > easel.y
    ) {
      return true;
    }
  }
  return false;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgMap, 0, 0, canvas.width, canvas.height);

  isMoving = (keys.w || keys.s || keys.a || keys.d) && !inspectModalOpen;

  if (isMoving) {
    let nextX = charX;
    let nextY = charY;

    if (keys.w) {
      nextY -= charSpeed;
      currentDirection = "up";
    } else if (keys.s) {
      nextY += charSpeed;
      currentDirection = "down";
    }

    if (!checkCollision(charX, nextY)) {
      charY = nextY;
    }

    if (keys.a) {
      nextX -= charSpeed;
      currentDirection = "left";
    } else if (keys.d) {
      nextX += charSpeed;
      currentDirection = "right";
    }

    if (!checkCollision(nextX, charY)) {
      charX = nextX;
    }

    frameTimer++;
    if (frameTimer >= frameSpeed) {
      frameTimer = 0;
      animFrame = (animFrame + 1) % 4;
    }

    stepTimer++;
    if (stepTimer % 16 === 0) {
      playStepSound();
    }
  } else {
    animFrame = 0;
    frameTimer = 0;
    stepTimer = 0;
  }

  nearbyEasel = null;
  easels.forEach((easel) => {
    let dx = charX + 36 - (easel.x + easel.w / 2);
    let dy = charY + 36 - (easel.y + easel.h / 2);
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 65) {
      nearbyEasel = easel;
    }
  });

  easels.forEach((easel) => {
    let shadowX = easel.x + easel.w / 2;
    let shadowY = easel.y + easel.h - 9;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, easel.w / 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(standImg, easel.x, easel.y, easel.w, easel.h);
  });

  if (nearbyEasel && !inspectModalOpen) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      "[ F TO INSPECT ]",
      nearbyEasel.x + nearbyEasel.w / 2,
      nearbyEasel.y - 12,
    );
  }

  let currentImg = downFrames[0];

  if (currentDirection === "down") {
    currentImg = downFrames[isMoving ? animFrame : 0];
  } else if (currentDirection === "up") {
    currentImg = upFrames[isMoving ? animFrame : 0];
  } else if (currentDirection === "left") {
    currentImg = leftFrames[isMoving ? animFrame : 0];
  } else if (currentDirection === "right") {
    currentImg = rightFrames[isMoving ? animFrame : 0];
  }

  let charShadowX = charX + 36;
  let charShadowY = charY + 64;

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(charShadowX, charShadowY, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(currentImg, Math.round(charX), Math.round(charY), 72, 72);

  requestAnimationFrame(gameLoop);
}

const galleryArtworks = [
  {
    label: "PORTRAIT #1",
    title: "PENCIL STUDY I",
    meta: "GRAPHITE ON PAPER • 2026",
  },
  {
    label: "SKETCH #2",
    title: "SHADOW & LIGHT",
    meta: "CHARCOAL & B GRAPHITE • 2026",
  },
  {
    label: "STILL LIFE #3",
    title: "VALLEY OF SHADOWS",
    meta: "MECHANICAL PENCIL 0.5MM • 2026",
  },
  {
    label: "PORTRAIT #4",
    title: "PORTRAIT OF SILENCE",
    meta: "GRAPHITE & CHARCOAL • 2026",
  },
  {
    label: "SKETCH #5",
    title: "FROZEN MOMENT",
    meta: "FINE LINER & PENCIL • 2026",
  },
];

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCarousel() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  const randomizedSet = shuffleArray(galleryArtworks);

  const createCardsHTML = (set) => {
    return set
      .map((art) => {
        let randomY = Math.floor(Math.random() * 51) - 25;
        let randomRot = (Math.random() * 6 - 3).toFixed(1);

        return `
                <div class="pixel-card" style="transform: translateY(${randomY}px) rotate(${randomRot}deg);">
                    <div class="art-frame"><span class="art-label">${art.label}</span></div>
                    <h3>${art.title}</h3>
                    <p class="art-meta">${art.meta}</p>
                </div>
            `;
      })
      .join("");
  };

  track.innerHTML =
    createCardsHTML(randomizedSet) + createCardsHTML(randomizedSet);
}

window.addEventListener("DOMContentLoaded", () => {
  buildCarousel();
});

// --- TEXTURED GRAINY GRAPHITE SKETCH PAD ---
let sketchCanvas, sketchCtx;
let strokes = [];
let isDrawing = false;
let lastX = 0,
  lastY = 0;

function initSketchPad() {
  sketchCanvas = document.createElement("canvas");
  sketchCanvas.id = "sketchCanvas";
  sketchCanvas.style.position = "fixed";
  sketchCanvas.style.top = "0";
  sketchCanvas.style.left = "0";
  sketchCanvas.style.width = "100vw";
  sketchCanvas.style.height = "100vh";
  sketchCanvas.style.pointerEvents = "none";
  sketchCanvas.style.zIndex = "9998";
  document.body.appendChild(sketchCanvas);

  sketchCtx = sketchCanvas.getContext("2d");
  resizeSketchCanvas();

  window.addEventListener("resize", resizeSketchCanvas);

  window.addEventListener("pointerdown", (e) => {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDrawing) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    strokes.push({
      x1: lastX,
      y1: lastY,
      x2: currentX,
      y2: currentY,
      time: Date.now(),
      life: 3500,
    });

    lastX = currentX;
    lastY = currentY;
  });

  window.addEventListener("pointerup", () => {
    isDrawing = false;
  });

  requestAnimationFrame(renderSketch);
}

function resizeSketchCanvas() {
  sketchCanvas.width = window.innerWidth;
  sketchCanvas.height = window.innerHeight;
}

function renderSketch() {
  sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
  const now = Date.now();

  strokes = strokes.filter((stroke) => {
    const age = now - stroke.time;
    if (age >= stroke.life) return false;

    const opacity = 1 - age / stroke.life;
    const dx = stroke.x2 - stroke.x1;
    const dy = stroke.y2 - stroke.y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(Math.floor(dist / 2), 1);

    sketchCtx.fillStyle = `rgba(220, 220, 220, ${opacity * 0.85})`;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = stroke.x1 + dx * t;
      const py = stroke.y1 + dy * t;

      for (let j = 0; j < 4; j++) {
        const offsetX = (Math.random() - 0.5) * 8;
        const offsetY = (Math.random() - 0.5) * 8;
        const size = Math.random() * 2.2 + 1;

        sketchCtx.fillRect(px + offsetX, py + offsetY, size, size);
      }
    }

    return true;
  });

  requestAnimationFrame(renderSketch);
}

window.addEventListener("DOMContentLoaded", initSketchPad);

// RETRO HOVER TOOLTIP LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("artTooltip");
  const tooltipTitle = document.getElementById("tooltipTitle");
  const tooltipMedium = document.getElementById("tooltipMedium");
  const tooltipDim = document.getElementById("tooltipDim");
  const tooltipYear = document.getElementById("tooltipYear");
  const tooltipDesc = document.getElementById("tooltipDesc");

  const polaroids = document.querySelectorAll(
    ".album-polaroid:not(.placeholder-card)",
  );

  polaroids.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const title = card.getAttribute("data-title") || "TITLE PLACEHOLDER";
      const medium = card.getAttribute("data-medium") || "MEDIUM PLACEHOLDER";
      const dim = card.getAttribute("data-dim") || "DIMENSIONS PLACEHOLDER";
      const year = card.getAttribute("data-year") || "2026";
      const desc = card.getAttribute("data-desc") || "DESCRIPTION PLACEHOLDER";

      tooltipTitle.textContent = title;
      tooltipMedium.textContent = medium;
      tooltipDim.textContent = dim;
      tooltipYear.textContent = year;
      tooltipDesc.textContent = desc;

      tooltip.classList.add("active");
    });

    card.addEventListener("mousemove", (e) => {
      let x = e.clientX + 16;
      let y = e.clientY + 16;

      if (x + 250 > window.innerWidth) x = e.clientX - 250;
      if (y + 180 > window.innerHeight) y = e.clientY - 180;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    card.addEventListener("mouseleave", () => {
      tooltip.classList.remove("active");
    });
  });
});

// PHOTO ALBUM MODAL TOGGLE LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const openAlbumBtn = document.getElementById("openAlbumBtn");
  const albumModal = document.getElementById("albumModal");
  const closeAlbumBtn = document.getElementById("closeAlbumBtn");

  if (openAlbumBtn && albumModal && closeAlbumBtn) {
    openAlbumBtn.addEventListener("click", (e) => {
      e.preventDefault();
      albumModal.style.display = "flex";
    });

    closeAlbumBtn.addEventListener("click", () => {
      albumModal.style.display = "none";
    });

    albumModal.addEventListener("click", (e) => {
      if (e.target === albumModal) {
        albumModal.style.display = "none";
      }
    });
  }
});

// RETRO GAME INTRO SEQUENCE
document.addEventListener("DOMContentLoaded", () => {
  const introOverlay = document.getElementById("gameIntroOverlay");
  const blackCover = document.getElementById("introBlackCover");
  const titleScreen = document.getElementById("introTitleScreen");
  const spotlightMask = document.getElementById("introSpotlightMask");
  const spotlightSound = document.getElementById("spotlightSound");
  const bgmAudio = document.getElementById("bgmAudio");

  let introStarted = false;
  document.body.classList.add("intro-active");

  function startGallerySequence() {
    if (introStarted) return;
    introStarted = true;

    playClickSound();

    if (titleScreen) titleScreen.style.opacity = "0";
    blackCover.classList.add("dim-phase");

    setTimeout(() => {
      if (spotlightSound) {
        spotlightSound.currentTime = 0;
        spotlightSound.volume = 0.6;
        spotlightSound.play().catch(() => {});
      }
    }, 1000);

    setTimeout(() => {
      spotlightMask.classList.add("active");
      blackCover.style.opacity = "0";

      setTimeout(() => {
        blackCover.style.display = "none";

        setTimeout(() => {
          spotlightMask.classList.add("expand");

          setTimeout(() => {
            introOverlay.style.transition = "opacity 0.6s ease";
            introOverlay.style.opacity = "0";

            if (bgmAudio) {
              bgmAudio.volume = 0.1;
              bgmAudio.loop = true;
              bgmAudio.play().catch(() => {});
            }

            setTimeout(() => {
              introOverlay.style.display = "none";
              document.body.classList.remove("intro-active");
            }, 600);
          }, 1600);
        }, 1400);
      }, 300);
    }, 3000);
  }

  introOverlay.addEventListener("click", startGallerySequence);

  window.addEventListener("keydown", (e) => {
    if (
      e.code === "Space" ||
      e.code === "Enter" ||
      e.key === " " ||
      e.key === "Enter"
    ) {
      e.preventDefault();
      startGallerySequence();
    }
  });
});

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("DOMContentLoaded", () => {
  window.location.hash = "#hero-section";
  const hero = document.getElementById("hero-section");
  if (hero) {
    hero.scrollIntoView({ behavior: "instant", block: "start" });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const bgmAudio = document.getElementById("bgmAudio");

  if (bgmAudio) {
    bgmAudio.volume = 0;
    bgmAudio.loop = true;
  }

  function startAudioSystem() {
    initAudio();
    if (bgmAudio && bgmAudio.paused) {
      bgmAudio.play().catch(() => {});
    }
  }

  window.addEventListener("keydown", startAudioSystem, { once: true });
  window.addEventListener("click", startAudioSystem, { once: true });

  const clickableElements = document.querySelectorAll(
    "a, button, .pixel-card, .album-polaroid, .nav-link",
  );

  clickableElements.forEach((el) => {
    el.addEventListener("pointerenter", () => {
      playHoverSound();
    });

    el.addEventListener("click", () => {
      playClickSound();
    });
  });
});

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playClickSound() {
  initAudio();
  if (!audioCtx) return;

  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
  osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.06);

  gain.gain.setValueAtTime(0.19, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

function playHoverSound() {
  initAudio();
  if (!audioCtx) return;

  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
}

function playStepSound() {
  initAudio();
  if (!audioCtx) return;

  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.06);

  gain.gain.setValueAtTime(0.55, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.06);
}
