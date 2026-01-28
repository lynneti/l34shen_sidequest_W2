// PANIC BLOB + MISCHIEF MAP (p5.js)
// Intro (min 5s) -> Game -> End screen (when ALL COINS are stolen)
// End screen matches intro layout + style, with:
// 1) RESTART (restarts game immediately)
// 2) END (goes back to intro screen)

let gameState = "intro"; // "intro" | "game" | "end"
let introStartMs = 0;

let startBtn = { x: 0, y: 0, w: 190, h: 46, r: 16, hover: false };

// End screen buttons
let restartBtn = { x: 0, y: 0, w: 190, h: 46, r: 16, hover: false };
let endBtn = { x: 0, y: 0, w: 190, h: 46, r: 16, hover: false };

let blob = {
  x: 240,
  y: 160,
  vx: 0,
  vy: 0,

  // Base shape
  r: 26,
  points: 52,
  wobble: 9,
  wobbleFreq: 0.9,

  // Time for noise breathing
  t: 0,
  tSpeed: 0.012,

  // Emotion state
  panic: 0, // 0..1
  stamina: 1,
};

let objs = [];
let stolen = 0;

// NEW: coin win condition
let totalCoins = 0;
let coinsStolen = 0;

function setup() {
  createCanvas(480, 320);
  textFont("sans-serif");
  textSize(13);

  introStartMs = millis();

  // Button positions (centered)
  startBtn.x = width / 2 - startBtn.w / 2;
  startBtn.y = height / 2 - 5;

  // End screen buttons (stacked, same center line)
  restartBtn.x = width / 2 - restartBtn.w / 2;
  restartBtn.y = height / 2 - 5;

  endBtn.x = width / 2 - endBtn.w / 2;
  endBtn.y = restartBtn.y + restartBtn.h + 14;

  resetGame(); // prepare game objects, but don't run until state="game"
}

function resetGame() {
  // Reset blob for gameplay
  blob.x = 240;
  blob.y = 160;
  blob.vx = 0;
  blob.vy = 0;
  blob.panic = 0;
  blob.stamina = 1;

  stolen = 0;
  coinsStolen = 0;
  totalCoins = 0;
  objs = [];

  // Spawn objects
  // (same as your original: 6 coins, 4 boxes)
  for (let i = 0; i < 10; i++) {
    const type = i < 6 ? "coin" : "box";
    if (type === "coin") totalCoins++;

    objs.push(makeObj(random(50, width - 50), random(50, height - 50), type));
  }
}

function makeObj(x, y, type) {
  const isBox = type === "box";
  const basePeriod = 5000; // ms
  const phase = random(0, basePeriod);

  return {
    x,
    y,
    vx: 0,
    vy: 0,
    r: type === "coin" ? 8 : 14,
    mass: type === "coin" ? 0.6 : 1.4,
    type,
    stolen: false,

    tentacle: {
      active: false,
      dir: p5.Vector.random2D(),
      len: 0,
      maxLen: isBox ? random(28, 55) : 0,
      growSpeed: isBox ? random(2.2, 3.4) : 0,
      retractSpeed: isBox ? random(3.0, 4.6) : 0,
      holdFrames: isBox ? floor(random(18, 45)) : 0,
      holdLeft: 0,
      period: basePeriod,
      nextPopAt: millis() + phase + random(-700, 700),
    },
  };
}

function draw() {
  if (gameState === "intro") {
    drawIntro();
  } else if (gameState === "game") {
    drawGame();
  } else {
    drawEnd();
  }
}

/* =========================
   INTRO SCENE (5 seconds min)
   ========================= */
function drawIntro() {
  background(255);

  // Intro lasts at least 5 seconds (but can continue until click)
  const elapsed = millis() - introStartMs;
  const introReady = elapsed >= 5000;

  // Title + Subtext (centered)
  fill(10);
  textAlign(CENTER, CENTER);

  textSize(22);
  text("WELCOME TO PANIC BLOB", width / 2, height / 2 - 80);

  textSize(13);
  fill(60);
  text(
    "Move your mouse near the blob to scare it.",
    width / 2,
    height / 2 - 52,
  );

  // Draw blob on the right (NO movement, only reactive animation)
  const bx = width - 95;
  const by = height / 2;
  drawIntroBlob(bx, by);

  // Button hover
  startBtn.hover = pointInRoundedRect(
    mouseX,
    mouseY,
    startBtn.x,
    startBtn.y,
    startBtn.w,
    startBtn.h,
    startBtn.r,
  );

  // Button (disabled look until 5s passes)
  const enabled = introReady;
  const btnFill = enabled ? (startBtn.hover ? 30 : 10) : 200;
  const txtFill = enabled ? 255 : 120;

  noStroke();
  fill(btnFill);
  roundedRect(startBtn.x, startBtn.y, startBtn.w, startBtn.h, startBtn.r);

  fill(txtFill);
  textSize(15);
  text("GAME START", startBtn.x + startBtn.w / 2, startBtn.y + startBtn.h / 2);

  // Hint if clicked too early
  if (!introReady) {
    fill(120);
    textSize(12);
    const left = max(0, ceil((5000 - elapsed) / 1000));
    text(
      `Starting in ${left}s...`,
      startBtn.x + startBtn.w / 2,
      startBtn.y + startBtn.h + 18,
    );
  }

  // Reset alignment
  textAlign(LEFT, BASELINE);
  textSize(13);
}

/* =========================
   END SCREEN (same layout vibe as intro)
   ========================= */
function drawEnd() {
  background(255);

  // Title + Subtext (centered)
  fill(10);
  textAlign(CENTER, CENTER);

  textSize(22);
  text("GREAT JOB!", width / 2, height / 2 - 80);

  textSize(13);
  fill(60);
  text("You stole all the coins 😈", width / 2, height / 2 - 52);

  // Blob on the right, reactive like intro
  const bx = width - 95;
  const by = height / 2;
  drawIntroBlob(bx, by);

  // Hover states
  restartBtn.hover = pointInRoundedRect(
    mouseX,
    mouseY,
    restartBtn.x,
    restartBtn.y,
    restartBtn.w,
    restartBtn.h,
    restartBtn.r,
  );
  endBtn.hover = pointInRoundedRect(
    mouseX,
    mouseY,
    endBtn.x,
    endBtn.y,
    endBtn.w,
    endBtn.h,
    endBtn.r,
  );

  // Buttons (enabled always on end screen)
  noStroke();

  fill(restartBtn.hover ? 30 : 10);
  roundedRect(
    restartBtn.x,
    restartBtn.y,
    restartBtn.w,
    restartBtn.h,
    restartBtn.r,
  );
  fill(255);
  textSize(15);
  text(
    "RESTART",
    restartBtn.x + restartBtn.w / 2,
    restartBtn.y + restartBtn.h / 2,
  );

  fill(endBtn.hover ? 30 : 10);
  roundedRect(endBtn.x, endBtn.y, endBtn.w, endBtn.h, endBtn.r);
  fill(255);
  textSize(15);
  text("END", endBtn.x + endBtn.w / 2, endBtn.y + endBtn.h / 2);

  // Reset alignment
  textAlign(LEFT, BASELINE);
  textSize(13);
}

function drawIntroBlob(x, y) {
  // Panic based on mouse distance (only for visuals)
  const d = dist(x, y, mouseX, mouseY);
  const fear = constrain(map(d, 220, 40, 0, 1), 0, 1);
  blob.panic = lerp(blob.panic, fear, 0.12);

  // Animate wobble only (no position movement)
  blob.tSpeed = lerp(0.01, 0.035, blob.panic);
  blob.wobble = lerp(7, 16, blob.panic);
  blob.wobbleFreq = lerp(0.85, 1.25, blob.panic);
  blob.t += blob.tSpeed;

  // Blue design on intro/end
  const rCol = lerp(20, 210, blob.panic);
  const gCol = lerp(120, 60, blob.panic);
  const bCol = lerp(255, 90, blob.panic);

  noStroke();
  fill(0, 20);
  ellipse(x + 2, y + 6, blob.r * 2.2, blob.r * 1.3);

  fill(rCol, gCol, bCol);
  beginShape();
  for (let i = 0; i < blob.points; i++) {
    const a = (i / blob.points) * TAU;
    const n = noise(
      cos(a) * blob.wobbleFreq + 100,
      sin(a) * blob.wobbleFreq + 100,
      blob.t,
    );
    const spike = pow(abs(sin(a * 6 + frameCount * 0.12)), 6) * blob.panic * 6;
    const rr = blob.r + map(n, 0, 1, -blob.wobble, blob.wobble) + spike;
    vertex(x + cos(a) * rr, y + sin(a) * rr);
  }
  endShape(CLOSE);

  // Face: sad when mouse close
  drawFaceAt(x, y, d);
}

/* =========================
   GAME
   ========================= */
function drawGame() {
  const dMouse = dist(blob.x, blob.y, mouseX, mouseY);

  // Base fear from mouse
  const fearFromMouse = constrain(map(dMouse, 220, 40, 0, 1), 0, 1);

  // Environment (uses blob.panic from last frame; updated after hazards)
  const alarm = 0.5 + 0.5 * sin(frameCount * (0.05 + 0.25 * blob.panic));
  const bg = lerp(245, 30, blob.panic);
  background(bg);

  drawWalls(alarm);
  drawFloorNoise();

  // Update objects + tentacles + detect hazard fear
  const fearFromTentacles = updateObjectsAndTentacles(); // 0..1 spike

  // Combine fears
  const fearTarget = constrain(max(fearFromMouse, fearFromTentacles), 0, 1);
  blob.panic = lerp(blob.panic, fearTarget, 0.1);

  // Movement
  const input = getInputDir();
  const accel = lerp(0.18, 0.52, blob.panic);
  const friction = lerp(0.88, 0.76, blob.panic);

  blob.stamina = min(1, blob.stamina + 0.006);
  if (blob.panic > 0.45 && random() < 0.06 && blob.stamina > 0.25) {
    const burst = lerp(1.0, 2.0, blob.panic);
    blob.vx += random(-burst, burst);
    blob.vy += random(-burst, burst);
    blob.stamina -= 0.22;
  }

  const fleeStrength = 0.18 * blob.panic;
  const flee = createVector(blob.x - mouseX, blob.y - mouseY);
  if (flee.mag() > 0.001) flee.normalize().mult(fleeStrength);

  blob.vx += input.x * accel + flee.x;
  blob.vy += input.y * accel + flee.y;

  const jitter = 0.35 * blob.panic;
  blob.vx += random(-jitter, jitter);
  blob.vy += random(-jitter, jitter);

  blob.vx *= friction;
  blob.vy *= friction;

  const maxSpeed = lerp(2.0, 4.8, blob.panic);
  const speed = sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
  if (speed > maxSpeed) {
    const s = maxSpeed / speed;
    blob.vx *= s;
    blob.vy *= s;
  }

  blob.x += blob.vx;
  blob.y += blob.vy;
  keepInBounds();

  // Shape animation
  blob.tSpeed = lerp(0.01, 0.04, blob.panic);
  blob.wobble = lerp(7, 18, blob.panic);
  blob.wobbleFreq = lerp(0.85, 1.3, blob.panic);
  blob.t += blob.tSpeed;

  drawObjectsAndTentacles();
  drawBlob(dMouse);
  drawUI(dMouse);

  // NEW: Win condition (when all coins are stolen)
  if (totalCoins > 0 && coinsStolen >= totalCoins) {
    gameState = "end";
  }
}

/* =========================
   COMMON DRAW HELPERS
   ========================= */
function drawWalls(alarm) {
  noStroke();
  const tint = lerp(0, 90, blob.panic) * alarm;
  fill(20 + tint, 20, 25);
  rect(0, 0, width, 10);
  rect(0, height - 10, width, 10);
  rect(0, 0, 10, height);
  rect(width - 10, 0, 10, height);

  if (blob.panic > 0.2) {
    fill(255, 60, 60, 140 * alarm);
    circle(16, 16, 10);
    circle(width - 16, 16, 10);
    circle(16, height - 16, 10);
    circle(width - 16, height - 16, 10);
  }
}

function drawFloorNoise() {
  if (frameCount % 2 === 0) return;
  noStroke();
  const alpha = lerp(10, 22, blob.panic);
  fill(0, alpha);
  for (let i = 0; i < 35; i++)
    rect(random(12, width - 12), random(12, height - 12), 1, 1);
}

function getInputDir() {
  let x = 0,
    y = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) x -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) x += 1;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) y -= 1;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) y += 1;
  const m = sqrt(x * x + y * y);
  if (m > 1) {
    x /= m;
    y /= m;
  }
  return { x, y };
}

function keepInBounds() {
  const pad = 10;
  const r = blob.r + 4;
  if (blob.x < pad + r) {
    blob.x = pad + r;
    blob.vx *= -0.6;
  }
  if (blob.x > width - pad - r) {
    blob.x = width - pad - r;
    blob.vx *= -0.6;
  }
  if (blob.y < pad + r) {
    blob.y = pad + r;
    blob.vy *= -0.6;
  }
  if (blob.y > height - pad - r) {
    blob.y = height - pad - r;
    blob.vy *= -0.6;
  }
}

// Returns fear spike 0..1 when blob is within 30px of any active tentacle segment.
function updateObjectsAndTentacles() {
  let danger = 0;

  for (const o of objs) {
    if (o.stolen) continue;

    o.vx *= 0.92;
    o.vy *= 0.92;

    // blob-object collision
    const dx = o.x - blob.x;
    const dy = o.y - blob.y;
    const distNow = sqrt(dx * dx + dy * dy);
    const minD = o.r + blob.r * 0.9;

    if (distNow < minD && distNow > 0.0001) {
      const nx = dx / distNow;
      const ny = dy / distNow;
      const shove = lerp(0.9, 2.2, blob.panic) / o.mass;
      o.vx += nx * shove + blob.vx * 0.25;
      o.vy += ny * shove + blob.vy * 0.25;
      blob.vx -= nx * 0.12;
      blob.vy -= ny * 0.12;

      const overlap = (minD - distNow) * 0.6;
      o.x += nx * overlap;
      o.y += ny * overlap;
    }

    // bounds
    const pad = 12;
    if (o.x < pad + o.r) {
      o.x = pad + o.r;
      o.vx *= -0.6;
    }
    if (o.x > width - pad - o.r) {
      o.x = width - pad - o.r;
      o.vx *= -0.6;
    }
    if (o.y < pad + o.r) {
      o.y = pad + o.r;
      o.vy *= -0.6;
    }
    if (o.y > height - pad - o.r) {
      o.y = height - pad - o.r;
      o.vy *= -0.6;
    }

    o.x += o.vx;
    o.y += o.vy;

    // Tentacles for boxes
    if (o.type === "box") {
      const t = o.tentacle;

      if (!t.active && millis() >= t.nextPopAt) {
        t.active = true;
        t.dir = p5.Vector.random2D();
        t.len = 0;
        t.holdLeft = t.holdFrames;
        t.nextPopAt = millis() + t.period + random(-900, 900);
      }

      if (t.active) {
        if (t.len < t.maxLen && t.holdLeft === t.holdFrames) {
          t.len = min(t.maxLen, t.len + t.growSpeed);
        } else if (t.holdLeft > 0) {
          t.holdLeft--;
        } else {
          t.len = max(0, t.len - t.retractSpeed);
          if (t.len <= 0) {
            t.len = 0;
            t.active = false;
          }
        }

        const start = createVector(o.x, o.y);
        const end = createVector(o.x + t.dir.x * t.len, o.y + t.dir.y * t.len);
        const dSeg = distPointToSegment(
          createVector(blob.x, blob.y),
          start,
          end,
        );

        // If blob touches tentacle (< 30), panic mode starts (spike)
        if (dSeg < 30) {
          danger = max(danger, map(dSeg, 30, 0, 0.65, 1.0));
        }
      }
    }
  }

  return danger;
}

function drawObjectsAndTentacles() {
  noStroke();

  for (const o of objs) {
    if (o.stolen) continue;

    if (o.type === "coin") {
      fill(250, 210, 60);
      circle(o.x, o.y, o.r * 2);
      fill(255, 255, 255, 90);
      circle(o.x - 2, o.y - 2, o.r * 0.8);
    } else {
      fill(80, 120, 120);
      rectMode(CENTER);
      rect(o.x, o.y, o.r * 2.1, o.r * 2.1, 4);

      const t = o.tentacle;
      if (t.active && t.len > 0.5) {
        const sx = o.x,
          sy = o.y;
        const ex = o.x + t.dir.x * t.len;
        const ey = o.y + t.dir.y * t.len;

        stroke(40, 25, 55, 220);
        strokeWeight(6);
        line(sx, sy, lerp(sx, ex, 0.55), lerp(sy, ey, 0.55));
        strokeWeight(3);
        line(lerp(sx, ex, 0.55), lerp(sy, ey, 0.55), ex, ey);

        noStroke();
        fill(230, 200, 255, 160);
        circle(ex, ey, 6);
      }
    }
  }
  noStroke();
}

function drawBlob(dMouse) {
  const rCol = lerp(20, 210, blob.panic);
  const gCol = lerp(120, 60, blob.panic);
  const bCol = lerp(255, 90, blob.panic);

  noStroke();

  fill(0, lerp(40, 80, blob.panic));
  ellipse(blob.x + 2, blob.y + 6, blob.r * 2.2, blob.r * 1.3);

  fill(rCol, gCol, bCol);
  beginShape();
  for (let i = 0; i < blob.points; i++) {
    const a = (i / blob.points) * TAU;
    const n = noise(
      cos(a) * blob.wobbleFreq + 100,
      sin(a) * blob.wobbleFreq + 100,
      blob.t,
    );
    const spike = pow(abs(sin(a * 6 + frameCount * 0.12)), 6) * blob.panic * 6;
    const rr = blob.r + map(n, 0, 1, -blob.wobble, blob.wobble) + spike;
    vertex(blob.x + cos(a) * rr, blob.y + sin(a) * rr);
  }
  endShape(CLOSE);

  drawFaceAt(blob.x, blob.y, dMouse);
}

// Face helper that can draw at any x,y (for intro + game + end)
function drawFaceAt(x, y, dMouse) {
  const faceOffset = createVector(blob.vx, blob.vy);
  if (faceOffset.mag() > 0.001) faceOffset.setMag(lerp(1, 4, blob.panic));

  const fx = x + faceOffset.x;
  const fy = y + faceOffset.y;

  const eyeW = lerp(4, 6.5, blob.panic);
  const eyeH = lerp(6, 10, blob.panic);

  fill(10, 10, 20, 210);
  ellipse(fx - 6, fy - 4, eyeW, eyeH);
  ellipse(fx + 6, fy - 4, eyeW, eyeH);

  noFill();
  stroke(10, 10, 20, 200);
  strokeWeight(2);

  const mouthOpen = lerp(2, 7, blob.panic);
  const isSad = dMouse <= 120;

  if (isSad) arc(fx, fy + 8, 12, mouthOpen + 4, PI, TWO_PI);
  else arc(fx, fy + 5, 10, mouthOpen + 4, 0, PI);

  noStroke();
}

function keyPressed() {
  if (gameState !== "game") return;
  if (key === "e" || key === "E") stealNearest();
}

function stealNearest() {
  let best = null;
  let bestD = 9999;

  for (const o of objs) {
    if (o.stolen) continue;
    const d = dist(blob.x, blob.y, o.x, o.y);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }

  if (best && bestD < blob.r + best.r + 8) {
    const canSteal = best.type === "coin" || blob.panic > 0.65;
    if (canSteal) {
      best.stolen = true;
      stolen++;

      // NEW: track coins only for win condition
      if (best.type === "coin") coinsStolen++;

      blob.r += 0.8;
      setTimeout(() => (blob.r -= 0.8), 120);
    }
  }
}

function drawUI(dMouse) {
  fill(0, 180);
  rect(10, 10, 230, 60, 8);

  fill(255);
  const panicPct = floor(blob.panic * 100);
  text(`Emotion: PANIC (${panicPct}%)`, 20, 30);
  text(`Mischief stolen: ${stolen}`, 20, 48);
  text(`Coins: ${coinsStolen}/${totalCoins} | Steal: E`, 20, 66);

  if (dMouse < 120) {
    fill(255, 90, 90);
    text("Mouse too close!!", width - 135, 24);
  }
}

/* =========================
   INPUT: CLICK BUTTONS
   ========================= */
function mousePressed() {
  if (gameState === "intro") {
    const elapsed = millis() - introStartMs;
    const introReady = elapsed >= 5000;
    if (!introReady) return;

    if (
      pointInRoundedRect(
        mouseX,
        mouseY,
        startBtn.x,
        startBtn.y,
        startBtn.w,
        startBtn.h,
        startBtn.r,
      )
    ) {
      gameState = "game";
      resetGame();
    }
    return;
  }

  if (gameState === "end") {
    // Restart (back to game immediately)
    if (
      pointInRoundedRect(
        mouseX,
        mouseY,
        restartBtn.x,
        restartBtn.y,
        restartBtn.w,
        restartBtn.h,
        restartBtn.r,
      )
    ) {
      resetGame();
      gameState = "game";
      return;
    }

    // End (back to intro, restart intro timer)
    if (
      pointInRoundedRect(
        mouseX,
        mouseY,
        endBtn.x,
        endBtn.y,
        endBtn.w,
        endBtn.h,
        endBtn.r,
      )
    ) {
      gameState = "intro";
      introStartMs = millis();
      // keep everything ready like before
      resetGame();
      return;
    }
  }
}

/* =========================
   GEOMETRY HELPERS
   ========================= */
function roundedRect(x, y, w, h, r) {
  rectMode(CORNER);
  rect(x, y, w, h, r);
}

function pointInRoundedRect(px, py, x, y, w, h, r) {
  // Simple AABB is good enough for click/hover here
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// Distance from point P to segment AB
function distPointToSegment(p, a, b) {
  const ab = p5.Vector.sub(b, a);
  const ap = p5.Vector.sub(p, a);
  const ab2 = ab.x * ab.x + ab.y * ab.y;
  if (ab2 === 0) return p5.Vector.dist(p, a);
  let t = (ap.x * ab.x + ap.y * ab.y) / ab2;
  t = constrain(t, 0, 1);
  const proj = createVector(a.x + ab.x * t, a.y + ab.y * t);
  return p5.Vector.dist(p, proj);
}
