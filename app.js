const back = document.getElementById('back');
const options = document.getElementById('options');
const mainMenu = document.getElementById('mainMenu');
const levelMenu = document.getElementById('levelMenu');
const obstacleContainer = document.getElementById('obstacleContainer');
const speler = document.getElementById('speler');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');


let isJumping = false;
let velocityY = 0;
const gravity = 0.9;
const jumpForce = -16;


let playerX = 8;
let playerY = 150;
let currentFloor = 150;
const forwardSpeed = 6;
let activeLoop = null;
let gameRunning = false;
let currentLevel = 1;
let levelEndX = 2000;


const levelData = {};
for (let lvl = 1; lvl <= 10; lvl++) {
   levelData[lvl] = [];
   let currentX = 500;
   let obstacleCount = lvl * 6 + 6;


   for (let i = 0; i < obstacleCount; i++) {
       let rand = Math.random();
       if (rand < 0.3) {
           levelData[lvl].push({ type: 'spike', x: currentX, h: 150 });
           currentX += 300;
       } else if (rand < 0.6) {
           levelData[lvl].push({ type: 'block', x: currentX, h: 150 });
           levelData[lvl].push({ type: 'spike', x: currentX, h: 200 });
           currentX += 350;
       } else {
           levelData[lvl].push({ type: 'block', x: currentX, h: 150 });
           levelData[lvl].push({ type: 'block', x: currentX + 50, h: 150 });
           levelData[lvl].push({ type: 'block', x: currentX + 50, h: 200 });
           currentX += 400;
       }
   }
}


options.addEventListener('click', () => {
   mainMenu.style.display = 'none';
   levelMenu.style.display = 'block';
});


back.addEventListener('click', () => {
   levelMenu.style.display = 'none';
   mainMenu.style.display = 'block';
   progressContainer.style.display = 'none';
});


document.querySelectorAll('.lvl-btn').forEach(btn => {
   btn.addEventListener('click', (e) => {
       currentLevel = parseInt(e.target.getAttribute('data-lvl'));
       levelMenu.style.display = 'none';
       progressContainer.style.display = 'block';
       loadLevel(currentLevel);
   });
});


function loadLevel(lvlNum) {
   if (activeLoop) cancelAnimationFrame(activeLoop);
   obstacleContainer.innerHTML = '';
  
   const objects = levelData[lvlNum];
   let maxDistance = 1000;


   objects.forEach(obj => {
       const el = document.createElement('div');
       el.className = obj.type;
       el.style.left = obj.x + 'px';
       el.style.bottom = obj.h + 'px';
       obstacleContainer.appendChild(el);
       if (obj.x > maxDistance) {
           maxDistance = obj.x;
       }
   });
  
   levelEndX = maxDistance + 400;
  
   resetGame();
   gameRunning = true;
   gameLoop();
}


function gameLoop() {
   if (!gameRunning) return;


   playerX += forwardSpeed;
   speler.style.left = playerX + "px";
   window.scrollTo(playerX - 100, 0);


   velocityY += gravity;
   playerY -= velocityY;


   checkPlatforms();


   if (playerY <= currentFloor) {
       playerY = currentFloor;
       velocityY = 0;
       isJumping = false;
   }
   speler.style.bottom = playerY + "px";


   let currentPercent = Math.floor((playerX / levelEndX) * 100);
   if (currentPercent > 100) currentPercent = 100;
   progressBar.style.width = currentPercent + "%";
   progressText.innerText = currentPercent + "%";


   if (currentPercent >= 100) {
       gameRunning = false;
       alert("LEVEL COMPLETED!");
       back.click();
       return;
   }


   checkCollisions();


   activeLoop = requestAnimationFrame(gameLoop);
}


function checkPlatforms() {
   const playerRect = speler.getBoundingClientRect();
   const blocks = document.querySelectorAll('.block');
   let highestFloor = 150;


   blocks.forEach(block => {
       const blockRect = block.getBoundingClientRect();
       const insideHorizontal = (playerRect.right > blockRect.left + 5 && playerRect.left < blockRect.right - 5);
       const landingOnTop = (playerRect.bottom <= blockRect.top + 15 && playerY >= parseFloat(block.style.bottom));


       if (insideHorizontal && landingOnTop) {
           highestFloor = parseFloat(block.style.bottom) + 50;
       }
   });


   currentFloor = highestFloor;
}


function checkCollisions() {
   const playerRect = speler.getBoundingClientRect();
   const spikes = document.querySelectorAll('.spike');
   const blocks = document.querySelectorAll('.block');


   spikes.forEach(spike => {
       const spikeRect = spike.getBoundingClientRect();
       const adjustedSpike = {
           left: spikeRect.left + 12,
           right: spikeRect.right - 12,
           top: spikeRect.top + 10,
           bottom: spikeRect.bottom
       };


       if (isIntersecting(playerRect, adjustedSpike)) {
           resetGame();
       }
   });


   blocks.forEach(block => {
       const blockRect = block.getBoundingClientRect();
       const hittingWall = (
           playerRect.right > blockRect.left + 8 &&
           playerRect.left < blockRect.left &&
           playerRect.bottom > blockRect.top + 12
       );
      
       if (hittingWall) {
           resetGame();
       }
   });
}


function isIntersecting(r1, r2) {
   return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}


function resetGame() {
   playerX = 8;
   playerY = 150;
   currentFloor = 150;
   velocityY = 0;
   isJumping = false;
  
   speler.style.left = playerX + "px";
   speler.style.bottom = playerY + "px";
   window.scrollTo(0, 0);
}


function triggerJump() {
   if (!isJumping) {
       isJumping = true;
       velocityY = jumpForce;
   }
}


window.addEventListener('keydown', (e) => {
   if (e.code === 'Space' || e.code === 'ArrowUp') {
       e.preventDefault();
       triggerJump();
   }
});


window.addEventListener('touchstart', (e) => {
   if (e.target.tagName !== 'BUTTON') {
       triggerJump();
   }
});


window.addEventListener('mousedown', (e) => {
   if (e.target.tagName !== 'BUTTON') {
       triggerJump();
   }
});