// Ragdoll Sword Duel Game using Matter.js

const { Engine, Render, Runner, World, Bodies, Body, Constraint, Composite, Events } = Matter;

// Game setup
const width = 900;
const height = 600;
const canvas = document.getElementById('gameCanvas');

const engine = Engine.create();
const world = engine.world;
engine.gravity.y = 0.7; // Less gravity for floatier movement

// Renderer
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false,
    background: '#333'
  }
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Ground, roof, and walls
const ground = Bodies.rectangle(width/2, height-20, width, 40, { isStatic: true, render: { fillStyle: "#666" } });
const roof = Bodies.rectangle(width/2, 20, width, 40, { isStatic: true, render: { fillStyle: "#666" } });
const leftWall = Bodies.rectangle(0, height/2, 40, height, { isStatic: true, render: { fillStyle: "#666" } });
const rightWall = Bodies.rectangle(width, height/2, 40, height, { isStatic: true, render: { fillStyle: "#666" } });
World.add(world, [ground, roof, leftWall, rightWall]);

// Helper: create a ragdoll with sword
function createRagdoll(x, y, color="#fff", swordColor="#ff0") {
  const head = Bodies.circle(x, y-70, 18, { render: { fillStyle: color } });
  const torso = Bodies.rectangle(x, y-30, 16, 48, { chamfer: { radius: 8 }, render: { fillStyle: color } });
  const upperArmL = Bodies.rectangle(x-22, y-40, 32, 10, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const upperArmR = Bodies.rectangle(x+22, y-40, 32, 10, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const lowerArmL = Bodies.rectangle(x-42, y-40, 28, 10, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const lowerArmR = Bodies.rectangle(x+42, y-40, 28, 10, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const handL = Bodies.circle(x-56, y-40, 8, { render: { fillStyle: color } });
  const handR = Bodies.circle(x+56, y-40, 8, { render: { fillStyle: color } });
  const upperLegL = Bodies.rectangle(x-10, y+8, 12, 32, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const upperLegR = Bodies.rectangle(x+10, y+8, 12, 32, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const lowerLegL = Bodies.rectangle(x-10, y+34, 12, 26, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const lowerLegR = Bodies.rectangle(x+10, y+34, 12, 26, { chamfer: { radius: 5 }, render: { fillStyle: color } });
  const footL = Bodies.circle(x-10, y+50, 8, { render: { fillStyle: color } });
  const footR = Bodies.circle(x+10, y+50, 8, { render: { fillStyle: color } });

  // Sword: attached to right hand (handR)
  const sword = Bodies.rectangle(x+76, y-40, 60, 8, { 
    density: 0.005, 
    chamfer: { radius: 2 }, 
    render: { fillStyle: swordColor }
  });
  const swordConstraint = Constraint.create({ 
    bodyA: handR, 
    pointA: {x:6, y:0}, 
    bodyB: sword, 
    pointB: {x:-25, y:0}, 
    length: 0, 
    stiffness: 0.85 
  });

  // Constraints (joints)
  const parts = [head, torso, upperArmL, upperArmR, lowerArmL, lowerArmR, handL, handR,
                 upperLegL, upperLegR, lowerLegL, lowerLegR, footL, footR, sword];
  const constraints = [
    Constraint.create({ bodyA: head, pointA: {x:0, y:18}, bodyB: torso, pointB: {x:0, y:-24}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: {x:-8, y:-20}, bodyB: upperArmL, pointB: {x:16, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: {x:8, y:-20}, bodyB: upperArmR, pointB: {x:-16, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperArmL, pointA: {x:-16, y:0}, bodyB: lowerArmL, pointB: {x:14, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperArmR, pointA: {x:16, y:0}, bodyB: lowerArmR, pointB: {x:-14, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerArmL, pointA: {x:-14, y:0}, bodyB: handL, pointB: {x:0, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerArmR, pointA: {x:14, y:0}, bodyB: handR, pointB: {x:0, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: {x:-6, y:24}, bodyB: upperLegL, pointB: {x:0, y:-14}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: {x:6, y:24}, bodyB: upperLegR, pointB: {x:0, y:-14}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperLegL, pointA: {x:0, y:14}, bodyB: lowerLegL, pointB: {x:0, y:-13}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperLegR, pointA: {x:0, y:14}, bodyB: lowerLegR, pointB: {x:0, y:-13}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerLegL, pointA: {x:0, y:13}, bodyB: footL, pointB: {x:0, y:0}, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerLegR, pointA: {x:0, y:13}, bodyB: footR, pointB: {x:0, y:0}, length: 2, stiffness: 0.6 }),
    swordConstraint
  ];

  // Composite
  const ragdoll = Composite.create({ bodies: parts, constraints: constraints });
  World.add(world, ragdoll);

  return { parts, ragdoll, head, torso, upperArmL, upperArmR, lowerArmL, lowerArmR, handL, handR, footL, footR, sword, swordConstraint };
}

// Player and bot ragdolls
const player = createRagdoll(180, height-120, "#59f", "#fff");
const bot = createRagdoll(width-180, height-120, "#fa4", "#ff2222");

// Health
let playerHealth = 100;
let botHealth = 100;

// Keyboard controls
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// Move player ragdoll
Events.on(engine, 'beforeUpdate', function() {
  // Move left/right (A/D)
  if (keys['a']) {
    Body.applyForce(player.torso, player.torso.position, { x: -0.006, y: 0 });
  }
  if (keys['d']) {
    Body.applyForce(player.torso, player.torso.position, { x: 0.006, y: 0 });
  }
  // Jump (W)
  if (keys['w'] && (player.footL.position.y > height-55 || player.footR.position.y > height-55)) {
    Body.applyForce(player.torso, player.torso.position, { x: 0, y: -0.06 }); // Slightly less jump height
  }
  // Swing sword (Space): rotate right arm
  if (keys[' ']) {
    Body.setAngle(player.upperArmR, Math.PI/2.1 + Math.sin(Date.now()/100)*0.2);
    Body.setAngle(player.lowerArmR, Math.PI/2.1 + Math.sin(Date.now()/100)*0.2);
  } else {
    Body.setAngle(player.upperArmR, 0);
    Body.setAngle(player.lowerArmR, 0);
  }
});

// Simple bot AI: move, jump, and swing sword
setInterval(() => {
  // Move towards player
  const dir = (player.torso.position.x > bot.torso.position.x) ? 1 : -1;
  Body.applyForce(bot.torso, bot.torso.position, { x: 0.005 * dir, y: 0 });
  // Jump occasionally if on ground
  if (Math.random() < 0.18 && (bot.footL.position.y > height-55 || bot.footR.position.y > height-55)) {
    Body.applyForce(bot.torso, bot.torso.position, { x: 0, y: -0.05 });
  }
  // Swing sword toward player
  if (Math.abs(player.torso.position.x - bot.torso.position.x) < 200) {
    Body.setAngle(bot.upperArmR, Math.PI/2.1 + Math.sin(Date.now()/100)*0.2);
    Body.setAngle(bot.lowerArmR, Math.PI/2.1 + Math.sin(Date.now()/100)*0.2);
  } else {
    Body.setAngle(bot.upperArmR, 0);
    Body.setAngle(bot.lowerArmR, 0);
  }
}, 150);

// Sword collision detection and damage
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(pair => {
    // Player sword hits bot
    if (pair.bodyA === player.sword && bot.parts.includes(pair.bodyB)) {
      const speed = Matter.Vector.magnitude(player.sword.velocity);
      if (speed > 2) {
        botHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    if (pair.bodyB === player.sword && bot.parts.includes(pair.bodyA)) {
      const speed = Matter.Vector.magnitude(player.sword.velocity);
      if (speed > 2) {
        botHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    // Bot sword hits player
    if (pair.bodyA === bot.sword && player.parts.includes(pair.bodyB)) {
      const speed = Matter.Vector.magnitude(bot.sword.velocity);
      if (speed > 2) {
        playerHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    if (pair.bodyB === bot.sword && player.parts.includes(pair.bodyA)) {
      const speed = Matter.Vector.magnitude(bot.sword.velocity);
      if (speed > 2) {
        playerHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
  });
});

// Health reset if someone is "KO'd"
Events.on(engine, 'afterUpdate', function() {
  if (playerHealth <= 0 || botHealth <= 0) {
    setTimeout(() => {
      playerHealth = 100;
      botHealth = 100;
      Body.setPosition(player.torso, { x: 180, y: height-120 });
      Body.setVelocity(player.torso, { x: 0, y: 0 });
      Body.setPosition(bot.torso, { x: width-180, y: height-120 });
      Body.setVelocity(bot.torso, { x: 0, y: 0 });
    }, 700);
  }
});

// Draw health bars & KO message
const ctx = canvas.getContext('2d');
function drawHUD() {
  ctx.save();
  ctx.clearRect(0, 0, width, 70);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`You`, 40, 40);
  ctx.fillText(`Bot`, width-90, 40);
  // Health bars
  ctx.fillStyle = "#59f";
  ctx.fillRect(90, 18, Math.max(0, playerHealth*2), 22);
  ctx.fillStyle = "#fa4";
  ctx.fillRect(width-290, 18, Math.max(0, botHealth*2), 22);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(90, 18, 200, 22);
  ctx.strokeRect(width-290, 18, 200, 22);
  // KO message
  if (playerHealth <= 0) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fa4";
    ctx.fillText("Bot Wins!", width/2-110, 60);
  }
  if (botHealth <= 0) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#59f";
    ctx.fillText("You Win!", width/2-110, 60);
  }
  ctx.restore();
}
(function animateHUD() {
  drawHUD();
  requestAnimationFrame(animateHUD);
})();

// -- End of game.js --
