const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

canvas.width = 960;
canvas.height = 540;

const ASSETS = {
    mapImage: "ASSETS/MAP.png",
    characterImage: "ASSETS/atas.png",
    canvasStand: "ASSETS/828a7dda-81c8-472e-8fb1-9f8fab7cfcb5-removebg-preview.png"
};

// 1. Load All Individual Walk Frames
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

const easels = [
    { x: 120, y: 290, w: 70, h: 70 }, 
    { x: 420, y: 330, w: 70, h: 70 }, 
    { x: 740, y: 280, w: 70, h: 70 },
    { x: 200, y: 410, w: 70, h: 70 },
    { x: 700, y: 410, w: 70, h: 70 }
];

const keys = { w: false, a: false, s: false, d: false };

let nearbyEasel = null;
let inspectModalOpen = false;

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
            document.getElementById("art-modal").style.display = "flex";
        }
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") keys.w = false;
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") keys.a = false;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") keys.s = false;
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") keys.d = false;
});

let charX = 450;
let charY = 150;
let charSpeed = 2.5;
let currentDirection = "down"; 

let animFrame = 0;         
let frameTimer = 0;     
const frameSpeed = 8;    
let isMoving = false;

let loadedImagesCount = 0;
const allImages = [bgMap, standImg, charSheetImg, ...downFrames, ...upFrames, ...rightFrames, ...leftFrames];
const totalImages = allImages.length;

function imageLoaded() {
    loadedImagesCount++;
    if (loadedImagesCount >= totalImages) {
        gameLoop();
    }
}

allImages.forEach(img => {
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
        h: 22
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

    isMoving = false;

    if (!inspectModalOpen) {
        let nextX = charX;
        let nextY = charY;

        if (keys.w) { nextY -= charSpeed; currentDirection = "up"; isMoving = true; }
        else if (keys.s) { nextY += charSpeed; currentDirection = "down"; isMoving = true; }
        
        if (!checkCollision(charX, nextY)) {
            charY = nextY;
        }

        if (keys.a) { nextX -= charSpeed; currentDirection = "left"; isMoving = true; }
        else if (keys.d) { nextX += charSpeed; currentDirection = "right"; isMoving = true; }

        if (!checkCollision(nextX, charY)) {
            charX = nextX;
        }

        if (!keys.w && !keys.s && !keys.a && !keys.d) {
            isMoving = false;
        }
    }

    if (isMoving) {
        frameTimer++;
        if (frameTimer >= frameSpeed) {
            frameTimer = 0;
            animFrame = (animFrame + 1) % 4; 
        }
    } else {
        animFrame = 0;
        frameTimer = 0;
    }

    nearbyEasel = null;
    easels.forEach(easel => {
        let dx = (charX + 36) - (easel.x + easel.w / 2);
        let dy = (charY + 36) - (easel.y + easel.h / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 65) {
            nearbyEasel = easel;
        }
    });

    easels.forEach(easel => {
        let shadowX = easel.x + (easel.w / 2);
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
        ctx.fillText("[ F TO INSPECT ]", nearbyEasel.x + (nearbyEasel.w / 2), nearbyEasel.y - 12);
    }

    let currentImg = downFrames[0]; 

    if (currentDirection === "down") {
        currentImg = downFrames[isMoving ? animFrame : 0];
    } 
    else if (currentDirection === "up") {
        currentImg = upFrames[isMoving ? animFrame : 0];
    } 
    else if (currentDirection === "left") {
        currentImg = leftFrames[isMoving ? animFrame : 0];
    }
    else if (currentDirection === "right") {
        currentImg = rightFrames[isMoving ? animFrame : 0];
    }

    let charShadowX = charX + 36; 
    let charShadowY = charY + 64; 

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(charShadowX, charShadowY, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(
        currentImg,
        Math.round(charX), Math.round(charY),
        72, 72
    );

    requestAnimationFrame(gameLoop);
}

//looppppppartwork

// --- 5 ARTWORK PLACEHOLDERS (EDIT THESE EASILY LATER) ---
const galleryArtworks = [
    { label: "PORTRAIT #1", title: "PENCIL STUDY I", meta: "GRAPHITE ON PAPER • 2026" },
    { label: "SKETCH #2", title: "SHADOW & LIGHT", meta: "CHARCOAL & B GRAPHITE • 2026" },
    { label: "STILL LIFE #3", title: "VALLEY OF SHADOWS", meta: "MECHANICAL PENCIL 0.5MM • 2026" },
    { label: "PORTRAIT #4", title: "PORTRAIT OF SILENCE", meta: "GRAPHITE & CHARCOAL • 2026" },
    { label: "SKETCH #5", title: "FROZEN MOMENT", meta: "FINE LINER & PENCIL • 2026" }
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

    // Function to generate card HTML with random Y-offsets and slight tilts
    const createCardsHTML = (set) => {
        return set.map(art => {
            // Random Y offset between -25px and +25px
            let randomY = Math.floor(Math.random() * 51) - 25;
            // Random subtle rotation between -3deg and +3deg for organic look
            let randomRot = (Math.random() * 6 - 3).toFixed(1);

            return `
                <div class="pixel-card" style="transform: translateY(${randomY}px) rotate(${randomRot}deg);">
                    <div class="art-frame"><span class="art-label">${art.label}</span></div>
                    <h3>${art.title}</h3>
                    <p class="art-meta">${art.meta}</p>
                </div>
            `;
        }).join('');
    };

    // Duplicate the randomized set back-to-back for seamless loop
    track.innerHTML = createCardsHTML(randomizedSet) + createCardsHTML(randomizedSet);
}

window.addEventListener("DOMContentLoaded", () => {
    buildCarousel();
});