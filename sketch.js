let currentScreen = "MENU"; // 遊戲狀態: "MENU" 或 "GAME_A" 至 "GAME_Z"
let currentLetter = "";     // 當前正在挑戰的字母 (A-Z)
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let levelPositions = [];    // 儲存 26 個關卡燈泡的位置

// 紀錄哪些關卡已經被點亮
let unlockedLevels = {}; 

// 關卡挑戰控制變數
let isLevelCompleted = false;
let objectX; // 動畫 X 座標
let objectAlpha = 0; 

// 右側 Apple Pencil 單字檢查與慶祝動畫變數
let isPencilChecked = false;
let praiseTimer = 0;

// --- 新增：當前畫筆工具狀態模式 ("PEN" 或 "ERASER") ---
let currentTool = "PEN"; 

// 離屏畫布：分開儲存左右兩邊的畫筆，避免互相干擾
let scribbleLayer; // 左邊摸黑塗鴉層
let pencilLayer;   // 右邊 Apple Pencil 寫字層

// 煙火特效粒子系統變數
let fireworks = [];

// --- 適合幼兒的單字 + 中文翻譯資料庫 ---
const wordData = {
  'A': { word: "Ant", ch: "螞蟻", spell: "a - n - t", draw: drawAnt },
  'B': { word: "Bus", ch: "公車", spell: "b - u - s", draw: drawBus },
  'C': { word: "Cat", ch: "貓咪", spell: "c - a - t", draw: drawCat },
  'D': { word: "Dog", ch: "狗狗", spell: "d - o - g", draw: drawDog },
  'E': { word: "Egg", ch: "雞蛋", spell: "e - g - g", draw: drawEgg },
  'F': { word: "Fox", ch: "狐狸", spell: "f - o - x", draw: drawFox },
  'G': { word: "Gum", ch: "糖果", spell: "g - u - m", draw: drawGum },
  'H': { word: "Hat", ch: "帽子", spell: "h - a - t", draw: drawHat },
  'I': { word: "Ice", ch: "冰塊", spell: "i - c - e", draw: drawIce },
  'J': { word: "Jam", ch: "果醬", spell: "j - a - m", draw: drawJam },
  'K': { word: "Key", ch: "鑰匙", spell: "k - e - y", draw: drawKey },
  'L': { word: "Log", ch: "木頭", spell: "l - o - g", draw: drawLog },
  'M': { word: "Mud", ch: "泥巴", spell: "m - u - d", draw: drawMud },
  'N': { word: "Nut", ch: "堅果", spell: "n - u - t", draw: drawNut },
  'O': { word: "Owl", ch: "貓頭鷹", spell: "o - w - l", draw: drawOwl },
  'P': { word: "Pig", ch: "小豬", spell: "p - i - g", draw: drawPig },
  'Q': { word: "Queen", ch: "女王", spell: "q - u - e - e - n", draw: drawQueen },
  'R': { word: "Red", ch: "紅色", spell: "r - e - d", draw: drawRed },
  'S': { word: "Sun", ch: "太陽", spell: "s - u - n", draw: drawSun },
  'T': { word: "Toy", ch: "玩具", spell: "t - o - y", draw: drawToy },
  'U': { word: "UFO", ch: "飛碟", spell: "u - f - o", draw: drawUFO },
  'V': { word: "Van", ch: "貨車", spell: "v - a - n", draw: drawVan },
  'W': { word: "Web", ch: "蜘蛛網", spell: "w - e - b", draw: drawWeb },
  'X': { word: "Box", ch: "盒子", spell: "b - o - x", draw: drawBoxObj },
  'Y': { word: "Yo-yo", ch: "溜溜球", spell: "y - o - y - o", draw: drawYoyo },
  'Z': { word: "Zoo", ch: "動物園", spell: "z - o - o", draw: drawZoo }
};

function setup() {
  createCanvas(1024, 768);
  textAlign(CENTER, CENTER);
  
  scribbleLayer = createGraphics(1024, 768);
  pencilLayer = createGraphics(1024, 768);
  clearCanvasLayers();

  // 計算 26 個關卡的網格位置
  let cols = 7;
  let rows = 4;
  let hSpacing = width / (cols + 1);
  let vSpacing = (height - 140) / (rows + 1);
  
  for (let i = 0; i < 26; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let x = hSpacing * (col + 1);
    let y = 130 + vSpacing * (row + 1);
    levelPositions.push({ x: x, y: y, letter: letters[i] });
    unlockedLevels[letters[i]] = false; 
  }
}

function draw() {
  document.oncontextmenu = function() { return false; };

  if (currentScreen === "MENU") {
    drawMenu();
  } else {
    drawGameScreen();
  }
}

function clearCanvasLayers() {
  scribbleLayer.clear();
  pencilLayer.clear();
}

function checkAllUnlocked() {
  for (let i = 0; i < letters.length; i++) {
    if (!unlockedLevels[letters[i]]) return false;
  }
  return true;
}

function initLevel(letChar) {
  currentLetter = letChar;
  currentScreen = "GAME_" + letChar;
  clearCanvasLayers();
  isLevelCompleted = false;
  isPencilChecked = false; 
  currentTool = "PEN"; // 每次進新關卡預設切換回畫筆
  praiseTimer = 0;
  objectAlpha = 0;
  objectX = width / 2; 
}

// --- 畫面 1: 主選單介面 ---
function drawMenu() {
  let isAllClear = checkAllUnlocked();

  if (isAllClear) {
    background(20, 25, 40);
    fill(255, 255, 255, 150);
    for(let i=0; i<30; i++) {
      let sx = noise(i * 10) * width;
      let sy = noise(i * 20) * (height - 200);
      ellipse(sx, sy, random(2, 4));
    }
    if (random(1) < 0.06) {
      fireworks.push(new Firework(random(width), height, random(width), random(100, 300)));
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update(); fireworks[i].show();
      if (fireworks[i].done()) fireworks.splice(i, 1);
    }
  } else {
    background(248, 246, 240);
  }
  
  fill(isAllClear ? 255 : 60);
  noStroke(); textSize(38); textStyle(BOLD);
  if (isAllClear) {
    text("🎉 AMAZING! YOU DID IT! 🎆", width / 2, 60);
    textSize(18); textStyle(NORMAL); fill(255, 215, 0);
    text("🌟 恭喜點亮整片星空！你完成了所有字母挑戰 🌟", width / 2, 110);
  } else {
    text("✏️ English ABC Adventure 💡", width / 2, 60);
    textSize(18); textStyle(NORMAL); fill(120);
    text("⌨️ 請敲擊實體外接鍵盤 [ A - Z ] 進入關卡挑戰！", width / 2, 110);
  }
  
  for (let i = 0; i < levelPositions.length; i++) {
    let pos = levelPositions[i];
    drawCrayonBulb(pos.x, pos.y, pos.letter, unlockedLevels[pos.letter]);
  }

  if (isAllClear) {
    rectMode(CENTER); fill(255, 70, 70); noStroke(); rect(width - 100, 60, 120, 40, 10);
    fill(255); textSize(14); textStyle(BOLD); text("重玩 🔄", width - 100, 60);
  }
}

function drawCrayonBulb(x, y, letter, isUnlocked) {
  push(); translate(x, y);
  if (isUnlocked) {
    stroke(255, 215, 0, 180); strokeWeight(2.5);
    for (let i = 0; i < 20; i++) {
      let r = random(25, 45); let ang = random(TWO_PI); line(0, 0, r * cos(ang), r * sin(ang));
    }
  } else {
    stroke(180, 180, 180, 40); strokeWeight(1.5);
    for (let i = 0; i < 6; i++) {
      let r = random(15, 22); let ang = random(TWO_PI); line(0, 0, r * cos(ang), r * sin(ang));
    }
  }
  
  stroke(isUnlocked ? [255, 200, 0] : [130, 130, 130]); strokeWeight(3); noFill();
  beginShape();
  for (let a = -PI * 0.8; a < PI * 0.8; a += 0.2) {
    let r = 24 + random(-1, 1); vertex(r * cos(a), r * sin(a) - 5);
  }
  endShape();
  
  rectMode(CENTER); fill(isUnlocked ? 240 : 140); stroke(100); strokeWeight(1.5);
  rect(0, 22, 18, 8, 2); rect(0, 28, 12, 5, 1);
  fill(isUnlocked ? [235, 110, 0] : [110]); noStroke(); textSize(22); textStyle(BOLD);
  text(letter, 0, -5);
  pop();
}

// --- 畫面 2: A~Z 通用挑戰畫面 ---
function drawGameScreen() {
  rectMode(CORNER); noStroke();
  
  // 1. 背景底層
  fill(30, 35, 45); rect(0, 80, width / 2, height - 80); 
  fill(255); rect(width / 2, 80, width / 2, height - 80); 
  
  // 2. 繪製右半邊的「英文四線格線」
  stroke(210, 225, 240); strokeWeight(2);
  let lineYStart = 240;
  for(let i = 0; i < 4; i++) {
    let y = lineYStart + (i * 130);
    line(width / 2 + 30, y, width - 30, y);
    stroke(240, 180, 180, 130); strokeWeight(1.5);
    push(); drawingContext.setLineDash([6, 6]);
    line(width / 2 + 30, y - 45, width - 30, y - 45);
    line(width / 2 + 30, y - 90, width - 30, y - 90);
    pop(); stroke(210, 225, 240); strokeWeight(2);
  }

  // 3. 繪製左半邊尚未喚醒前的字母隱約微光輪廓
  if (!isLevelCompleted) {
    push(); fill(255, 255, 255, 8); noStroke(); textSize(360); textStyle(BOLD);
    text(currentLetter, width / 4, height / 2 + 40); pop();
  }

  // 4. 繪製右半邊的 Apple Pencil 動態灰色導引範本字
  push();
  textStyle(BOLD); fill(225, 228, 232); 
  if (!isLevelCompleted) {
    textSize(110); text(currentLetter, width / 2 + 100, lineYStart - 55);
    textSize(85); text(currentLetter.toLowerCase(), width / 2 + 250, lineYStart - 46);
  } else {
    let data = wordData[currentLetter];
    textSize(80); textAlign(LEFT, CENTER);
    let spacedWord = data.word.toLowerCase().split("").join("   ");
    text(spacedWord, width / 2 + 60, lineYStart - 52);
  }
  pop();

  // 5. 滑鼠 / Apple Pencil 繪圖軌跡偵測 (修改：根據 currentTool 切換畫筆與橡皮擦)
  if (mouseIsPressed) {
    // 限制不要在右邊功能選單區塗鴉 (避免點按鈕時畫到線)
    if (mouseX < 850 || mouseY > 220) {
      
      // 左區：摸黑塗鴉
      if (mouseX > 0 && mouseX < width / 2 && mouseY > 80 && mouseY < height) {
        if (!isLevelCompleted) {
          if (currentTool === "PEN") { // 畫筆模式
            scribbleLayer.stroke(255, 215, 0, 220); 
            for (let i = 0; i < 5; i++) {
              let offsetX = random(-2, 2); let offsetY = random(-2, 2);
              scribbleLayer.strokeWeight(random(1.5, 3.5));
              scribbleLayer.line(pmouseX + offsetX, pmouseY + offsetY, mouseX + offsetX, mouseY + offsetY);
            }
          } else if (currentTool === "ERASER") { // 橡皮擦模式
            scribbleLayer.push();
            scribbleLayer.drawingContext.globalCompositeOperation = 'destination-out';
            scribbleLayer.stroke(255); scribbleLayer.strokeWeight(40);
            scribbleLayer.line(pmouseX, pmouseY, mouseX, mouseY);
            scribbleLayer.pop();
          }
        }
      }
      
      // 右區：精細 Apple Pencil 書寫
      if (mouseX > width / 2 && mouseX < width && mouseY > 80 && mouseY < height) {
        if (currentTool === "PEN") { // 畫筆模式
          pencilLayer.stroke(50, 60, 70, 240); pencilLayer.strokeWeight(3.5); 
          pencilLayer.line(pmouseX + random(-0.5,0.5), pmouseY + random(-0.5,0.5), mouseX, mouseY);
        } else if (currentTool === "ERASER") { // 橡皮擦模式
          pencilLayer.push();
          pencilLayer.drawingContext.globalCompositeOperation = 'destination-out';
          pencilLayer.stroke(255); pencilLayer.strokeWeight(40);
          pencilLayer.line(pmouseX, pmouseY, mouseX, mouseY);
          pencilLayer.pop();
        }
      }
      
    }
  }

  // 將兩個透明繪圖層疊加蓋在背景與格線的上方
  image(scribbleLayer, 0, 0);
  image(pencilLayer, 0, 0);

  // 6. 左側喚醒後的插圖
  if (isLevelCompleted) {
    if (objectAlpha < 255) objectAlpha += 8;
    let targetX = width / 4;
    objectX = lerp(objectX, targetX, 0.1); 
    
    push(); rectMode(CENTER); fill(255, 255, 255, objectAlpha * 0.92); noStroke();
    rect(objectX, height / 2 + 20, 360, 390, 20);
    
    translate(objectX, height / 2 - 40);
    let currentData = wordData[currentLetter];
    if (currentData && currentData.draw) currentData.draw(objectAlpha);
    
    fill(40, 45, 55, objectAlpha); textSize(44); textStyle(BOLD);
    text(currentData.word, 0, 125);
    fill(235, 75, 75, objectAlpha); textSize(32); 
    text(currentData.ch, 0, 175);
    fill(120, 130, 140, objectAlpha); textSize(18); textStyle(NORMAL);
    text(currentData.spell, 0, 215);
    pop();
  }
  
  // 7. 右側寫完單字正確慶祝動畫
  if (isPencilChecked && praiseTimer > 0) {
    praiseTimer--;
    push();
    fill(40, 180, 100, map(praiseTimer, 0, 30, 0, 255)); 
    textSize(48); textStyle(BOLD);
    text("答對了！🎉 GOOD JOB!", width * 0.75, height / 2);
    pop();
  }

  // --- 8. 【新加入：右側專屬 畫筆/橡皮擦 實體側邊按鈕欄】 ---
  push();
  rectMode(CENTER);
  
  // 按鈕 A: 筆按鈕
  if (currentTool === "PEN") {
    fill(90, 160, 235); stroke(50, 110, 180); strokeWeight(3); // 被選取時高亮藍色
  } else {
    fill(255); stroke(220); strokeWeight(1.5);
  }
  rect(width - 80, 125, 130, 44, 12);
  fill(currentTool === "PEN" ? 255 : 60); noStroke(); textSize(15); textStyle(BOLD);
  text("✏️ 畫筆模式", width - 80, 125);
  
  // 按鈕 B: 橡皮擦按鈕
  if (currentTool === "ERASER") {
    fill(240, 110, 110); stroke(180, 60, 60); strokeWeight(3); // 被選取時高亮粉紅色
  } else {
    fill(255); stroke(220); strokeWeight(1.5);
  }
  rect(width - 80, 180, 130, 44, 12);
  fill(currentTool === "ERASER" ? 255 : 60); noStroke(); textSize(15); textStyle(BOLD);
  text("🧽 橡皮擦", width - 80, 180);
  pop();

  // --- 頂部狀態列與功能按鈕 ---
  push(); noStroke(); fill(242, 240, 234); rect(0, 0, width, 80);
  fill(70); textSize(18); textStyle(BOLD); text("🎨 Level " + currentLetter + ": 互動練習", 120, 40);
  
  if (!isLevelCompleted) {
    fill(210, 80, 80); textSize(14);
    text("左區摸黑塗鴉 ｜ 右區用 Pencil 練習 💡 寫完請按實體鍵盤 [ " + currentLetter + " ] 鍵喚醒！", width / 2 - 40, 40);
  } else {
    fill(40, 150, 85); textSize(14);
    text("👏 成功喚醒單字！請點右側按鈕切換工具，拿 Apple Pencil 描寫完整單字 ✍️", width / 2 - 40, 40);
  }
  
  // 繪製頂部右側的「返回主畫面」與「檢查寫字」按鈕
  rectMode(CENTER); fill(255); stroke(200); strokeWeight(2); 
  rect(920, 40, 150, 44, 12); 
  fill(50); noStroke(); textSize(15); textStyle(BOLD); text("返回主畫面 🏠", 920, 40);

  if (isLevelCompleted) {
    fill(255, 235, 50); stroke(220, 180, 0); strokeWeight(2);
    rect(730, 40, 140, 44, 12);
    fill(50); noStroke(); textSize(15); textStyle(BOLD); text("檢查寫字 🔍", 730, 40);
  }
  pop();
}

// --- 點擊按鈕偵測事件 ---
function mousePressed() {
  if (currentScreen !== "MENU") {
    // 1. 頂部「返回主畫面 🏠」按鈕
    if (mouseX > 845 && mouseX < 995 && mouseY > 18 && mouseY < 62) {
      currentScreen = "MENU";
      return;
    }
    
    // 2. 頂部「檢查寫字 🔍」按鈕
    if (isLevelCompleted && mouseX > 660 && mouseX < 800 && mouseY > 18 && mouseY < 62) {
      isPencilChecked = true;
      praiseTimer = 90; 
      playCorrectSound(); 
      return;
    }
    
    // 3. 【新加入：右側 畫筆 模式切換點擊偵測】
    if (mouseX > width - 145 && mouseX < width - 15 && mouseY > 103 && mouseY < 147) {
      currentTool = "PEN";
      return;
    }
    
    // 4. 【新加入：右側 橡皮擦 模式切換點擊偵測】
    if (mouseX > width - 145 && mouseX < width - 15 && mouseY > 158 && mouseY < 202) {
      currentTool = "ERASER";
      return;
    }
  }
  
  if (currentScreen === "MENU") {
    if (checkAllUnlocked() && mouseX > width - 160 && mouseX < width - 40 && mouseY > 40 && mouseY < 80) {
      for (let i = 0; i < letters.length; i++) unlockedLevels[letters[i]] = false;
      fireworks = [];
      return;
    }
  }
}

// --- 叮咚～✨ 電子合成特效音 ---
function playCorrectSound() {
  let ctx = new (window.AudioContext || window.webkitAudioContext)();
  let osc1 = ctx.createOscillator(); let gain1 = ctx.createGain();
  osc1.type = 'sine'; osc1.frequency.setValueAtTime(523.25, ctx.currentTime); 
  gain1.gain.setValueAtTime(0.3, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.connect(gain1); gain1.connect(ctx.destination);
  osc1.start(); osc1.stop(ctx.currentTime + 0.15);
  
  let osc2 = ctx.createOscillator(); let gain2 = ctx.createGain();
  osc2.type = 'sine'; osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
  gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc2.connect(gain2); gain2.connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.08); osc2.stop(ctx.currentTime + 0.3);
}
// --- 語音發音系統（整合中英文） ---
function speakWord(letter) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    let data = wordData[letter];
    let utteranceEng = new SpeechSynthesisUtterance(data.word + ". " + data.spell.replace(/-/g, "") + ".");
    utteranceEng.lang = 'en-US'; utteranceEng.pitch = 1.35; utteranceEng.rate = 0.8;
    
    let utteranceCh = new SpeechSynthesisUtterance(data.ch);
    utteranceCh.lang = 'zh-TW'; utteranceCh.pitch = 1.2; utteranceCh.rate = 0.9;
    
    window.speechSynthesis.speak(utteranceEng);
    window.speechSynthesis.speak(utteranceCh);
  }
}

// --- 鍵盤互動偵測 ---
function keyPressed() {
  let keyUpper = key.toUpperCase(); 
  
  if (currentScreen === "MENU") {
    if (letters.includes(keyUpper)) {
      initLevel(keyUpper);
    }
  } 
  
  if (currentScreen === "GAME_" + currentLetter && keyUpper === currentLetter && !isLevelCompleted) {
    isLevelCompleted = true;
    unlockedLevels[currentLetter] = true; 
    playCorrectSound(); 
    speakWord(currentLetter); 
  }
  
  if (keyCode === ESCAPE) {
    currentScreen = "MENU";
  }
}

// =================================================================
// --- 煙火粒子系統 ---
// =================================================================
class Firework {
  constructor(x, y, targetX, targetY) {
    this.x = x; this.y = y; this.targetY = targetY; this.exploded = false; this.particles = []; this.speed = random(6, 10);
    this.col = color(random(150, 255), random(150, 255), random(150, 255));
  }
  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) { this.exploded = true; this.explode(); }
    } else {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update(); if (this.particles[i].alpha <= 0) this.particles.splice(i, 1);
      }
    }
  }
  explode() {
    let count = random(30, 50);
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI); let speed = random(1, 5); this.particles.push(new Particle(this.x, this.y, angle, speed, this.col));
    }
  }
  show() {
    if (!this.exploded) {
      stroke(this.col); strokeWeight(random(3, 5)); line(this.x, this.y, this.x, this.y + 10);
    } else {
      for (let p of this.particles) p.show();
    }
  }
  done() { return this.exploded && this.particles.length === 0; }
}

class Particle {
  constructor(x, y, angle, speed, col) {
    this.x = x; this.y = y; this.vx = cos(angle) * speed; this.vy = sin(angle) * speed; this.col = col; this.alpha = 255; this.gravity = 0.08; this.w = random(2, 5);
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.alpha -= 4; }
  show() { push(); noStroke(); fill(red(this.col), green(this.col), blue(this.col), this.alpha); ellipse(this.x, this.y, this.w); pop(); }
}

// =================================================================
// --- A~Z 幾何蠟筆風插畫資料庫 ---
// =================================================================
function drawAnt(a) { fill(80, a); noStroke(); ellipse(-25, 0, 35, 35); ellipse(0, -5, 30, 30); ellipse(25, -10, 45, 40); stroke(80, a); strokeWeight(3); line(-10, 5, -15, 25); line(5, 5, 10, 25); }
function drawBus(a) { fill(245, 200, 50, a); noStroke(); rect(-70, -40, 140, 70, 8); fill(50, a); ellipse(-40, 35, 28, 28); ellipse(40, 35, 28, 28); fill(200, 230, 255, a); rect(-55, -30, 35, 25, 3); rect(-10, -30, 35, 25, 3); }
function drawCat(a) { fill(200, a); noStroke(); ellipse(0, 10, 130, 110); triangle(-50, -30, -20, -10, -55, 10); triangle(50, -30, 20, -10, 55, 10); fill(50, a); ellipse(-20, 0, 12, 12); ellipse(20, 0, 12, 12); fill(240, 130, 130, a); triangle(0, 15, -8, 8, 8, 8); }
function drawDog(a) { fill(160, 110, 70, a); noStroke(); ellipse(0, 0, 120, 120); fill(100, 70, 40, a); ellipse(-55, 0, 40, 80); ellipse(55, 0, 40, 80); fill(0, a); ellipse(-20, -10, 14, 14); ellipse(20, -10, 14, 14); ellipse(0, 15, 25, 15); }
function drawEgg(a) { fill(245, 235, 220, a); stroke(220, 200, 180, a); strokeWeight(2); ellipse(0, 0, 110, 150); }
function drawFox(a) { fill(235, 110, 40, a); noStroke(); triangle(-60, -20, 60, -20, 0, 40); ellipse(0, -20, 110, 70); fill(255, a); triangle(-50, -20, 0, -20, -35, 5); fill(0, a); ellipse(-25, -25, 10, 10); ellipse(25, -25, 10, 10); ellipse(0, 35, 15, 15); }
function drawGum(a) { fill(240, 120, 160, a); noStroke(); ellipse(0, 0, 100, 100); quad(-70, -20, -50, 0, -70, 20, -80, 0); quad(70, -20, 50, 0, 70, 20, 80, 0); }
function drawHat(a) { fill(80, 100, 220, a); noStroke(); rect(-50, -60, 100, 80, 10); ellipse(0, 20, 160, 25); }
function drawIce(a) { fill(180, 230, 255, a); noStroke(); rect(-40, -60, 80, 100, 15); fill(210, 140, 90, a); rect(-10, 40, 20, 50, 5); }
function drawJam(a) { fill(200, 50, 80, a); noStroke(); rect(-40, -30, 80, 90, 8); fill(180, a); rect(-45, -45, 90, 15, 4); }
function drawKey(a) { noFill(); stroke(220, 180, 40, a); strokeWeight(8); ellipse(-30, 0, 50, 50); line(-5, 0, 60, 0); line(40, 0, 40, 20); }
function drawLog(a) { fill(110, 75, 40, a); noStroke(); rect(-70, -25, 140, 50, 4); fill(150, 110, 70, a); ellipse(-70, 0, 20, 50); ellipse(70, 0, 20, 50); }
function drawMud(a) { fill(95, 65, 40, a); noStroke(); ellipse(-30, 20, 90, 50); ellipse(30, 15, 100, 60); }
function drawNut(a) { fill(180, 130, 80, a); noStroke(); ellipse(0, 10, 100, 100); fill(130, 90, 50, a); arc(0, -10, 106, 60, PI, TWO_PI); }
function drawOwl(a) { fill(130, 90, 60, a); noStroke(); ellipse(0, 10, 110, 120); fill(255, a); ellipse(-22, -15, 40, 40); ellipse(22, -15, 40, 40); fill(0, a); ellipse(-22, -15, 12, 12); fill(240, 150, 40, a); triangle(0, 0, -8, -10, 8, -10); }
function drawPig(a) { fill(255, 180, 190, a); noStroke(); ellipse(0, 0, 130, 120); fill(255, 140, 160, a); ellipse(0, 15, 45, 30); fill(50, a); ellipse(-10, 15, 6, 6); }
function drawQueen(a) { fill(245, 200, 150, a); noStroke(); ellipse(0, 20, 110, 110); fill(255, 215, 0, a); triangle(-45, -20, -30, -50, -15, -20); triangle(-15, -20, 0, -60, 15, -20); }
function drawRed(a) { fill(240, 40, 40, a); noStroke(); rect(-60, -60, 120, 120, 15); }
function drawSun(a) { fill(255, 80, 80, a); noStroke(); ellipse(0, 0, 110, 110); }
function drawToy(a) { fill(100, 160, 240, a); noStroke(); rect(-40, -40, 80, 80, 10); fill(255, 100, 100, a); ellipse(0, -40, 25, 25); }
function drawUFO(a) { fill(160, 170, 180, a); noStroke(); ellipse(0, 10, 140, 45); fill(130, 220, 255, a * 0.7); ellipse(0, -10, 70, 40); }
function drawVan(a) { fill(100, 180, 160, a); noStroke(); rect(-70, -30, 140, 70, 10); fill(50, a); ellipse(-40, 45, 30, 30); }
function drawWeb(a) { stroke(100, a); strokeWeight(3); noFill(); ellipse(0,0,120,120); line(-60,-60,60,60); line(-60,60,60,-60); }
function drawBoxObj(a) { fill(210, 150, 100, a); noStroke(); rect(-55, -45, 110, 90, 4); stroke(160, 110, 70, a); line(-55, -10, 55, -10); }
function drawYoyo(a) { fill(150, 90, 220, a); noStroke(); ellipse(-15, 0, 50, 120); ellipse(15, 0, 50, 120); stroke(255, a); strokeWeight(4); line(0, -60, 0, 0); }
function drawZoo(a) { fill(120, a); noStroke(); rect(-70, -40, 140, 85, 6); stroke(255, a); strokeWeight(4); for(let i=-50; i<=50; i+=25) line(i, -40, i, 45); }