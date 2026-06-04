const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Speler (Jij op de slee onderin het scherm)
let player = { x: 400, y: 430, width: 40, height: 20, speed: 8 };

// Lijst om alle 3D bomen in op te slaan
let obstacles = [];
let score = 0;
let gameOver = false;
let keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Functie om een nieuwe boom in de verte (aan de horizon) te maken
function spawnObstacle() {
    obstacles.push({
        x: 350 + Math.random() * 100, // Begint in het midden in de verte
        y: 200,                       // De horizonlijn
        scale: 0.05,                  // Begint super klein (ver weg)
        speedX: (Math.random() - 0.5) * 6, // Waaierd uit naar links of rechts
        speedY: 3                     // Komt naar voren gevlogen
    });
}

// Start direct met bomen maken
setInterval(() => { if (!gameOver) spawnObstacle(); }, 800);

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff3333";
        ctx.font = "bold 50px sans-serif";
        ctx.fillText("CRASH! GAME OVER", 180, 230);
        ctx.fillStyle = "white";
        ctx.font = "20px sans-serif";
        ctx.fillText("Score: " + score + " | Ververs de pagina om te herstarten", 200, 280);
        return;
    }

    // 1. Scherm leegmaken (achtergrond verloop is geregeld in HTML/CSS)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Teken de horizon en de skibaan (3D perspectief lijnen)
    ctx.fillStyle = "#7ec0ee"; // Lucht
    ctx.fillRect(0, 0, canvas.width, 200);
    
    ctx.strokeStyle = "#d0e0f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 200); ctx.lineTo(0, 500);   // Linker rand van de berg
    ctx.moveTo(450, 200); ctx.lineTo(800, 500); // Rechter rand van de berg
    ctx.stroke();

    // 3. Besturing van de slee (Speler)
    if (keys["ArrowLeft"] || keys["a"]) { player.x -= player.speed; }
    if (keys["ArrowRight"] || keys["d"]) { player.x += player.speed; }

    // Zorg dat de speler niet van het scherm afstuurt
    if (player.x < 50) player.x = 50;
    if (player.x > 750) player.x = 750;

    // 4. Update en teken alle 3D bomen
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        
        // Boom beweegt naar voren en wordt groter (3D effect!)
        o.y += o.speedY;
        o.x += o.speedX * (o.scale * 2); 
        o.scale += 0.018; 
        o.speedY += 0.15; // Versnelt naarmate hij dichterbij komt

        // Teken de 3D boom (een groene driehoek die groeit)
        let treeWidth = 60 * o.scale;
        let treeHeight = 100 * o.scale;
        
        ctx.fillStyle = "#1b5e20"; // Donkergroen dennenboom
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - treeHeight);
        ctx.lineTo(o.x - treeWidth/2, o.y);
        ctx.lineTo(o.x + treeWidth/2, o.y);
        ctx.closePath();
        ctx.fill();

        // Check voor botsing als de boom heel dichtbij is (onderin het scherm)
        if (o.y > 400 && o.y < 460) {
            if (Math.abs(o.x - player.x) < (treeWidth/2 + player.width/2)) {
                gameOver = true;
            }
        }

        // Als de boom achter de speler verdwijnt, krijg je een punt
        if (o.y > 520) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    // 5. Teken de rode Slee (als een 3D blok op de voorgrond)
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(player.x - player.width/2, player.y, player.width, player.height);
    // Onderkant van de slee (ijzers)
    ctx.fillStyle = "#333";
    ctx.fillRect(player.x - player.width/2 - 2, player.y + player.height, player.width + 4, 4);

    // 6. Scorebord
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Gifts ontweken: " + score, 30, 40);

    requestAnimationFrame(gameLoop);
}

gameLoop();
