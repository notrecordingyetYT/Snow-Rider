const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Speler met spring-variabelen
let player = { 
    x: 400, 
    y: 430, 
    z: 0,          // Hoogte in de lucht tijdens het springen
    width: 45, 
    height: 18, 
    speed: 7,
    speedZ: 0,     // Spring-snelheid
    isJumping: false 
};

let obstacles = [];
let score = 0;
let gameOver = false;
let keys = {};
let gravity = 0.4;
let speedLinesY = 200; // Voor het bewegende grondeffect

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function spawnObstacle() {
    obstacles.push({
        x: 380 + (Math.random() - 0.5) * 40, 
        y: 200,                       
        scale: 0.02,                  
        speedX: (Math.random() - 0.5) * 12, 
        speedY: 2.5                     
    });
}

setInterval(() => { if (!gameOver) spawnObstacle(); }, 600);

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 52px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CRASH!", canvas.width/2, 210);
        ctx.fillStyle = "white";
        ctx.font = "24px sans-serif";
        ctx.fillText("Je eindscore is: " + score, canvas.width/2, 260);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "16px sans-serif";
        ctx.fillText("Druk op Ctrl+R om opnieuw te starten", canvas.width/2, 310);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Lucht en Horizon tekenen
    ctx.fillStyle = "#7dd3fc"; 
    ctx.fillRect(0, 0, canvas.width, 200);

    // 2. Bewegende sneeuwlijnen op de grond (voor snelheidsgevoel)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    speedLinesY += 4;
    if (speedLinesY > 500) speedLinesY = 200;
    
    for (let i = 0; i < 4; i++) {
        let lineY = speedLinesY + (i * 75);
        if (lineY > 500) lineY -= 300;
        if (lineY > 200) {
            let progress = (lineY - 200) / 300;
            let w = progress * 400;
            ctx.beginPath();
            ctx.moveTo(400 - w, lineY);
            ctx.lineTo(400 + w, lineY);
            ctx.stroke();
        }
    }

    // 3. Besturing (Sturen)
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
    if (player.x < 80) player.x = 80;
    if (player.x > 720) player.x = 720;

    // 4. Spring-logica (Spatiebalk of Pijl Omhoog)
    if ((keys[" "] || keys["ArrowUp"] || keys["w"]) && !player.isJumping) {
        player.speedZ = -7.5; // Kracht omhoog
        player.isJumping = true;
    }

    if (player.isJumping) {
        player.speedZ += gravity; // Zwaartekracht trekt je terug
        player.z += player.speedZ;
        
        if (player.z >= 0) { // Geland op de grond
            player.z = 0;
            player.speedZ = 0;
            player.isJumping = false;
        }
    }

    // 5. Obstakels (3D bomen) updaten en tekenen
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        
        o.y += o.speedY;
        o.x += o.speedX * (o.scale * 2.5);
        o.scale += 0.016;
        o.speedY += 0.14;

        let scaleW = o.scale * 85;
        let scaleH = o.scale * 130;

        // Boomstam tekenen
        ctx.fillStyle = "#78350f";
        ctx.fillRect(o.x - (scaleW * 0.15), o.y - (scaleH * 0.2), scaleW * 0.3, scaleH * 0.2);

        // Bladeren (3 lagen groen voor echt 3D gevoel)
        ctx.fillStyle = "#15803d"; // Laag 1 (groot)
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - scaleH);
        ctx.lineTo(o.x - scaleW/2, o.y - scaleH * 0.15);
        ctx.lineTo(o.x + scaleW/2, o.y - scaleH * 0.15);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = "#166534"; // Laag 2 (midden)
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - scaleH * 1.1);
        ctx.lineTo(o.x - scaleW/2.6, o.y - scaleH * 0.4);
        ctx.lineTo(o.x + scaleW/2.6, o.y - scaleH * 0.4);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = "#14532d"; // Laag 3 (top)
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - scaleH * 1.2);
        ctx.lineTo(o.x - scaleW/3.5, o.y - scaleH * 0.65);
        ctx.lineTo(o.x + scaleW/3.5, o.y - scaleH * 0.65);
        ctx.closePath(); ctx.fill();

        // Botsing detecteren (Inclusief check of je eroverheen springt!)
        if (o.y > 410 && o.y < 460) {
            let hitBoxX = Math.abs(o.x - player.x) < (scaleW/3 + player.width/2);
            let playerIsTooLow = (player.z > -45); // Als je sprong niet hoog genoeg is (< 45px in de lucht)
            
            if (hitBoxX && playerIsTooLow) {
                gameOver = true;
            }
        }

        if (o.y > 520) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    // 6. Schaduw van de speler (blijft altijd op de grond)
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + player.height, player.width/1.5, 6, 0, 0, 2 * Math.PI);
    ctx.fill();

    // 7. De Slee tekenen (verplaatst omhoog op basis van player.z)
    let currentY = player.y + player.z; // player.z is negatief in de lucht
    
    ctx.fillStyle = "#e11d48"; // Felrode slee body
    ctx.fillRect(player.x - player.width/2, currentY, player.width, player.height);
    
    ctx.fillStyle = "#94a3b8"; // IJzers onder de slee
    ctx.fillRect(player.x - player.width/2 - 3, currentY + player.height, player.width + 6, 3);

    // 8. Scorebord (Modern)
    ctx.textAlign = "left";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("SCORE: " + score, 25, 45);

    requestAnimationFrame(gameLoop);
}

gameLoop();
