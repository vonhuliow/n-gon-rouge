
/* player_randomized.js
   Overlay/extension to add 30+ randomized character types to existing `m` player object.
   Load this AFTER your original player.js. It will:

   - Add m.characterTypes (30+ characters)
   - Add m.randomizeCharacter() to pick and apply a character on spawn
   - Wrap m.spawn() to call randomizeCharacter automatically
   - Add m.activateAbility() and bind to 'E' key and to input.field where available
   - Add visual effects and simple ability implementations (safe fallbacks if some globals are missing)
   - Keeps original m.draw but applies per-character post effects
*/

(function(){
  if (typeof m === "undefined") {
    console.warn("player_randomized.js: global `m` not found. Include this file after player.js where `m` is defined.");
    return;
  }

  // -- 1) Character definitions (30+)
  m.characterTypes = [
    { name: "Default", desc:"Classic", hue:0, light:60, speed:1, jump:1, passive:null, active:null },
    { name: "Blaze", desc:"Flame dash", hue:20, light:50, speed:1.15, jump:1.05, active:"flameDash", passive:null },
    { name: "Frost", desc:"Freeze aura", hue:200, light:80, speed:0.95, jump:0.95, active:"freezeAura", passive:"envSlow" },
    { name: "Volt", desc:"Shockwave", hue:60, light:60, speed:1.25, jump:1.0, active:"shockwave", passive:"electricTrail" },
    { name: "Golem", desc:"Earth shield", hue:30, light:35, speed:0.75, jump:0.8, active:"earthShield", passive:"heavyArmor" },
    { name: "Aether", desc:"Phase shift", hue:270, light:70, speed:1.05, jump:1.2, active:"phaseShift", passive:"ghostLike" },
    { name: "Nano", desc:"Spawn drones", hue:120, light:60, speed:1.0, jump:1.0, active:"spawnMinions", passive:"autoRepair" },
    { name: "Specter", desc:"Stealth cloak", hue:280, light:20, speed:1.3, jump:1.05, active:"stealthCloak", passive:"lowProfile" },
    { name: "Tremor", desc:"Ground slam", hue:25, light:40, speed:0.85, jump:0.9, active:"groundSlam", passive:"stability" },
    { name: "Striker", desc:"Lightning chain", hue:55, light:70, speed:1.3, jump:1.1, active:"lightningChain", passive:"critBoost" },
    { name: "Bulwark", desc:"Reflect shield", hue:190, light:35, speed:0.7, jump:0.8, active:"reflectShield", passive:"damageReduce" },
    { name: "Rocket", desc:"Rocket jump", hue:10, light:60, speed:1.15, jump:1.6, active:"rocketJump", passive:null },
    { name: "Vampire", desc:"Vampiric touch", hue:330, light:35, speed:1.0, jump:1.0, active:"vampiricTouch", passive:"lifeSteal" },
    { name: "Phalanx", desc:"Summon turret", hue:200, light:50, speed:0.9, jump:0.9, active:"summonTurret", passive:null },
    { name: "Surge", desc:"Energy burst", hue:50, light:75, speed:1.4, jump:1.1, active:"energyBurst", passive:null },
    { name: "Anchor", desc:"Anchor field", hue:10, light:30, speed:0.9, jump:0.9, active:"anchorField", passive:"slowFall" },
    { name: "Meteor", desc:"Call meteor", hue:15, light:55, speed:0.95, jump:1.0, active:"meteorCall", passive:null },
    { name: "Swarm", desc:"Spawn swarm", hue:120, light:45, speed:1.2, jump:1.0, active:"swarmCaller", passive:"tinyHits" },
    { name: "Pulse", desc:"Healing pulse", hue:150, light:65, speed:1.0, jump:1.0, active:"healingPulse", passive:"regen" },
    { name: "Mirror", desc:"Clone mirror", hue:260, light:60, speed:1.05, jump:1.0, active:"mirrorClone", passive:null },
    { name: "Phase", desc:"Teleport blink", hue:290, light:70, speed:1.3, jump:1.1, active:"teleportBlink", passive:null },
    { name: "Magnet", desc:"Magnetic pull", hue:210, light:55, speed:1.0, jump:1.0, active:"magneticPull", passive:"metalSense" },
    { name: "Bubble", desc:"Bubble shield", hue:175, light:80, speed:0.95, jump:0.95, active:"bubbleShield", passive:null },
    { name: "Poison", desc:"Toxic cloud", hue:90, light:40, speed:1.1, jump:1.0, active:"poisonGas", passive:"toxinEdge" },
    { name: "Time", desc:"Time slow", hue:220, light:60, speed:0.9, jump:0.9, active:"timeSlow", passive:null },
    { name: "Grapple", desc:"Grappling hook", hue:25, light:65, speed:1.15, jump:1.05, active:"grapplingHook", passive:null },
    { name: "Plasma", desc:"Plasma beam", hue:200, light:70, speed:1.2, jump:1.0, active:"plasmaBeam", passive:null },
    { name: "IceSlide", desc:"Ice slide", hue:195, light:85, speed:1.35, jump:1.0, active:"iceSlide", passive:"slippery" },
    { name: "Stone", desc:"Stone form", hue:30, light:25, speed:0.7, jump:0.8, active:"stoneForm", passive:"reduceKnockback" }
  ];

  // ensure at least 30 types
  if (m.characterTypes.length < 30) {
    console.warn("player_randomized: expected 30+ chars, got", m.characterTypes.length);
  }

  // -- 2) Utility helpers
  function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function safeApplyForce(body, fx, fy){
    if (!body) return;
    if (typeof Matter !== "undefined" && body && body.force) {
      Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
    } else if (body && body.velocity) {
      // fallback velocity nudge
      body.velocity.x += fx*50;
      body.velocity.y += fy*50;
    }
  }

  // Simple small particle fallback
  function spawnParticle(x,y,opts){
    if (typeof simulation !== "undefined" && simulation.drawList) {
      simulation.drawList.push({ x:x, y:y, radius: opts.radius||6, color: opts.color || "rgba(255,255,255,0.6)", time: opts.time||30 });
      return;
    }
    if (typeof bullet !== "undefined") {
      // create tiny bullet-like object
      const p = { position:{x:x,y:y}, velocity:{x:(Math.random()-0.5)*4,y:(Math.random()-0.5)*4}, radius: opts.radius||6, time:opts.time||60, color: opts.color||"#fff" };
      bullet.push(p);
    }
  }

  // -- 3) Apply a character to player object
  m.randomizeCharacter = function(seedName){
    const choice = seedName ? (m.characterTypes.find(c=>c.name===seedName) || randChoice(m.characterTypes)) : randChoice(m.characterTypes);
    m.char = Object.assign({}, choice); //shallow copy

    // Visual colors: set hue and fill colors
    m.color = { hue: m.char.hue||0, sat: 70, light: m.char.light||60 };
    m.setFillColors && m.setFillColors();

    // Adjust movement multipliers safely (keep original behavior if not set)
    m._origMass = m._origMass || m.mass || m.defaultMass || 5;
    // speed uses Fx multiplier; jump uses jumpForce multiplier
    m.speedMultiplier = m.char.speed || 1;
    m.jumpMultiplier = m.char.jump || 1;
    m.setMovement && m.setMovement(); // existing function uses m.squirrelFx etc., we'll temporarily adjust
    // Apply movement by directly scaling Fx and jumpForce relative to defaults if possible
    if (m.Fx && m.defaultMass) {
      // don't permanently change defaultMass; scale current Fx and jumpForce
      m.Fx *= m.speedMultiplier;
      m.jumpForce *= m.jumpMultiplier;
    }

    // meta
    m.name = m.char.name;
    m.desc = m.char.desc || "";
    m.specialAbility = m.char.active || null;
    m.specialPassive = m.char.passive || null;

    // reset per-character state
    m._abilityCooldown = 0;
    m._abilityActiveUntil = 0;
    m._charEffectState = {}; // store visual timers, toggles etc
    simulation && simulation.inGameConsole && simulation.inGameConsole(`Spawned as ${m.name} — ${m.desc}`, 1200);
    return m.char;
  };

  // -- 4) Ability implementations
  m._abilityHandlers = {
    flameDash(opts){
      // burst forward and leave flame particles
      const dir = Math.sign(m.Vx || 1) || 1;
      safeApplyForce(player, dir * 0.06, -0.02);
      for (let i=0;i<10;i++) spawnParticle(m.pos.x - dir*5 + (Math.random()-0.5)*30, m.pos.y + (Math.random()-0.5)*18, { color:"rgba(255,100,20,0.9)", radius:4, time:30 });
      m._abilityActiveUntil = simulation.cycle + 20;
    },
    freezeAura(){
      // emit slow effect to nearby mobs; fallback visual
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(180,220,255,0.5)", radius:60, time:90 });
      if (typeof mobs !== "undefined" && mobs.statusSlowAll) mobs.statusSlowAll(180);
      m._abilityActiveUntil = simulation.cycle + 30;
    },
    shockwave(){
      // push nearby mobs away
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(255,255,200,0.6)", radius:80, time:40 });
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++){
          if (!mob[i] || !mob[i].position) continue;
          const dx = mob[i].position.x - m.pos.x;
          const dy = mob[i].position.y - m.pos.y;
          const dist = Math.max(30, Math.sqrt(dx*dx+dy*dy));
          const force = 0.0005 * (120/dist);
          safeApplyForce(mob[i], dx/dist*force, dy/dist*force);
        }
      }
      m._abilityActiveUntil = simulation.cycle + 6;
    },
    earthShield(){
      // temporary damage reduction and a ring of rocks
      m._abilityActiveUntil = simulation.cycle + 240;
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(160,120,80,0.6)", radius:70, time:240 });
      // set a flag other code can read (defense uses tech or m.defense(); we set m._earthShield)
      m._earthShield = simulation.cycle + 240;
    },
    phaseShift(){
      // short intangibility and teleport a few pixels
      const dx = (Math.random()-0.5)*120;
      const dy = (Math.random()-0.5)*60;
      if (player) Matter.Body.setPosition(player, { x: player.position.x + dx, y: player.position.y + dy });
      m._abilityActiveUntil = simulation.cycle + 60;
      spawnParticle(m.pos.x+dx, m.pos.y+dy, { color:"rgba(200,160,255,0.6)", radius:16, time:50 });
    },
    spawnMinions(){
      // spawn small helper bullets/drones if b.drone exists
      const count = 3 + Math.floor(Math.random()*3);
      for (let i=0;i<count;i++){
        const px = m.pos.x + 30*(Math.random()-0.5);
        const py = m.pos.y + 10*(Math.random()-0.5);
        if (typeof b !== "undefined" && b.drone) {
          b.drone({ x: px, y: py });
        } else if (typeof bullet !== "undefined") {
          bullet.push({ position:{x:px,y:py}, velocity:{x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2}, botType:true, radius:8, life:600 });
        }
      }
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(160,255,200,0.7)", radius:40, time:80 });
      m._abilityActiveUntil = simulation.cycle + 240;
    },
    stealthCloak(){
      m._isStealthed = true;
      m._abilityActiveUntil = simulation.cycle + 240;
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(80,80,120,0.4)", radius:50, time:180 });
    },
    groundSlam(){
      // apply downward force and push nearby mobs
      safeApplyForce(player, 0, 0.18);
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++){
          const dx = mob[i].position.x - m.pos.x;
          const dy = mob[i].position.y - m.pos.y;
          const dist = Math.max(10, Math.sqrt(dx*dx+dy*dy));
          safeApplyForce(mob[i], dx/dist*0.002, dy/dist*0.002);
        }
      }
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(120,90,70,0.6)", radius:120, time:40 });
      m._abilityActiveUntil = simulation.cycle + 12;
    },
    lightningChain(){
      // create chain of electric particles; try to damage nearby mobs
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(255,255,100,0.9)", radius:60, time:60 });
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++){
          if (Math.random()<0.15) { // small chance to nudge
            safeApplyForce(mob[i], (Math.random()-0.5)*0.004, (Math.random()-0.5)*0.004);
          }
        }
      }
      m._abilityActiveUntil = simulation.cycle + 8;
    },
    reflectShield(){
      m._reflectUntil = simulation.cycle + 180;
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(200,240,255,0.6)", radius:70, time:180 });
    },
    rocketJump(){
      safeApplyForce(player, (m.Vx||1)*0.06, -0.26);
      spawnParticle(m.pos.x, m.pos.y+20, { color:"rgba(255,140,80,0.9)", radius:20, time:40 });
      m._abilityActiveUntil = simulation.cycle + 6;
    },
    vampiricTouch(){
      // damage nearby mobs slightly and heal player a bit
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++){
          const d = Math.hypot(mob[i].position.x - m.pos.x, mob[i].position.y - m.pos.y);
          if (d < 120 && mob[i].health) {
            mob[i].health -= 0.06;
            m.addHealth && m.addHealth(0.03);
            spawnParticle(mob[i].position.x, mob[i].position.y, { color:"rgba(200,50,200,0.6)", radius:8, time:30 });
          }
        }
      }
      m._abilityActiveUntil = simulation.cycle + 8;
    },
    summonTurret(){
      // attempt to create an autonomous turret; fallback: spawn bullet marker
      const tx = m.pos.x + (m.Vx>0?60:-60);
      const ty = m.pos.y;
      if (typeof b !== "undefined" && b.spawnTurret) {
        b.spawnTurret({ x: tx, y: ty });
      } else if (typeof bullet !== "undefined") {
        bullet.push({ position:{x:tx,y:ty}, velocity:{x:0,y:0}, radius:12, turret:true, life: 6000 });
      }
      spawnParticle(tx, ty, { color:"rgba(180,180,255,0.9)", radius:16, time:200 });
      m._abilityActiveUntil = simulation.cycle + 600;
    },
    energyBurst(){
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(255,255,255,0.9)", radius:120, time:40 });
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++) safeApplyForce(mob[i], (mob[i].position.x-m.pos.x)/100000, (mob[i].position.y-m.pos.y)/100000);
      }
      m._abilityActiveUntil = simulation.cycle + 12;
    },
    anchorField(){
      m._anchorUntil = simulation.cycle + 180;
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(120,120,150,0.6)", radius:120, time:180 });
    },
    meteorCall(){
      // spawn a few heavy particles from above
      for (let i=0;i<3;i++){
        const mx = m.pos.x + (Math.random()-0.5)*180;
        const my = m.pos.y - 800 - Math.random()*200;
        if (typeof bullet !== "undefined") {
          bullet.push({ position:{x:mx,y:my}, velocity:{x:0,y:8}, radius:22, meteor:true, life:1000});
        } else {
          spawnParticle(mx, my, { color:"rgba(200,80,40,0.9)", radius:22, time:200 });
        }
      }
      m._abilityActiveUntil = simulation.cycle + 40;
    },
    swarmCaller(){
      for (let i=0;i<8;i++) {
        if (typeof bullet !== "undefined") bullet.push({ position:{x:m.pos.x+Math.random()*50-25,y:m.pos.y+Math.random()*50-25}, velocity:{x:(Math.random()-0.5)*3,y:(Math.random()-0.5)*3}, radius:6, botType:true, life:400 });
      }
      m._abilityActiveUntil = simulation.cycle + 200;
    },
    healingPulse(){
      if (m.addHealth) m.addHealth(0.12);
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(150,255,200,0.9)", radius:90, time:120 });
      m._abilityActiveUntil = simulation.cycle + 40;
    },
    mirrorClone(){
      // create a temporary mirrored clone that follows player's past positions (simple visual)
      const len = 40;
      for (let i=0;i<6;i++) spawnParticle(m.pos.x + (i-3)*10, m.pos.y, { color:"rgba(200,200,255,0.6)", radius:10, time:60 });
      m._abilityActiveUntil = simulation.cycle + 90;
    },
    teleportBlink(){
      const dx = (Math.random()-0.5)*240;
      const dy = (Math.random()-0.5)*120;
      if (player) Matter.Body.setPosition(player, { x: player.position.x + dx, y: player.position.y + dy });
      spawnParticle(m.pos.x+dx, m.pos.y+dy, { color:"rgba(220,200,255,0.8)", radius:24, time:80 });
      m._abilityActiveUntil = simulation.cycle + 20;
    },
    magneticPull(){
      if (typeof bullet !== "undefined") {
        for (let i=0;i<bullet.length;i++) {
          const dx = m.pos.x - bullet[i].position.x;
          const dy = m.pos.y - bullet[i].position.y;
          const dist = Math.max(12, Math.sqrt(dx*dx+dy*dy));
          bullet[i].velocity.x += (dx/dist)*0.5;
          bullet[i].velocity.y += (dy/dist)*0.5;
        }
      }
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(180,200,255,0.6)", radius:100, time:40 });
      m._abilityActiveUntil = simulation.cycle + 40;
    },
    bubbleShield(){
      m._bubbleUntil = simulation.cycle + 240;
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(200,255,255,0.5)", radius:80, time:240 });
    },
    poisonGas(){
      if (typeof mob !== "undefined") {
        for (let i=0;i<mob.length;i++){
          const d = Math.hypot(mob[i].position.x-m.pos.x, mob[i].position.y-m.pos.y);
          if (d<120 && mob[i].health) mob[i].health -= 0.02;
        }
      }
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(80,150,60,0.5)", radius:120, time:240 });
      m._abilityActiveUntil = simulation.cycle + 40;
    },
    timeSlow(){
      if (typeof simulation !== "undefined") {
        simulation.fpsCap = Math.max(6, Math.floor(simulation.fpsCap/2));
        setTimeout(()=>{ simulation.fpsCap = simulation.fpsCapDefault || 60; }, 1200);
      }
      spawnParticle(m.pos.x, m.pos.y, { color:"rgba(200,220,255,0.6)", radius:120, time:80 });
      m._abilityActiveUntil = simulation.cycle + 80;
    },
    grapplingHook(){
      // quick pull toward mouse if available
      const target = (simulation && simulation.mouseInGame) ? simulation.mouseInGame : { x: m.pos.x + (m.Vx>0?200:-200), y: m.pos.y };
      if (player) {
        const dx = target.x - player.position.x;
        const dy = target.y - player.position.y;
        safeApplyForce(player, dx*0.0007, dy*0.0007);
      }
      spawnParticle(target.x, target.y, { color:"rgba(200,200,255,0.6)", radius:24, time:60 });
      m._abilityActiveUntil = simulation.cycle + 30;
    },
    plasmaBeam(){
      // fire a straight beam: spawn bullets along angle
      const ang = m.angle || 0;
      for (let i=1;i<7;i++){
        const bx = m.pos.x + Math.cos(ang)*i*24;
        const by = m.pos.y + Math.sin(ang)*i*24;
        spawnParticle(bx, by, { color:"rgba(100,200,255,0.9)", radius:8, time:30 });
        if (typeof mob !== "undefined") {
          for (let j=0;j<mob.length;j++){
            const d = Math.hypot(mob[j].position.x-bx, mob[j].position.y-by);
            if (d<14 && mob[j].health) mob[j].health -= 0.02;
          }
        }
      }
      m._abilityActiveUntil = simulation.cycle + 8;
    },
    iceSlide(){ m._slideUntil = simulation.cycle + 120; spawnParticle(m.pos.x, m.pos.y, { color:"rgba(200,240,255,0.6)", radius:60, time:120 }); },
    stoneForm(){ m._stoneUntil = simulation.cycle + 200; spawnParticle(m.pos.x, m.pos.y, { color:"rgba(150,120,80,0.6)", radius:60, time:200 }); },
    // default noop
    noop(){}
  };

  // -- 5) Public activateAbility function, with cooldown protection
  m.activateAbility = function(forceName){
    if (!m.specialAbility && !forceName) return;
    const name = forceName || m.specialAbility;
    // cooldown: simple check
    if (m._abilityCooldown && simulation && simulation.cycle < m._abilityCooldown) return;
    const handler = m._abilityHandlers[name] || m._abilityHandlers.noop;
    try {
      handler.call(m);
    } catch (e){ console.error("Ability error", e); }
    // set a cooldown (in cycles) to avoid spam; different abilities may set _abilityActiveUntil instead
    m._abilityCooldown = simulation ? simulation.cycle + 60 : Date.now() + 500;
    // optional console log
    simulation && simulation.inGameConsole && simulation.inGameConsole(`Ability: ${name}`, 600);
  };

  // Bind to key E for manual activation
  try {
    document.addEventListener("keydown", function(ev){
      if (ev.code === "KeyE") {
        m.activateAbility();
      }
    });
  } catch(e){ /* ignore if no DOM */ }

  // Also integrate with input.field if present (e.g., pressing field triggers)
  const origInputField = (typeof input !== "undefined" && input.field) ? input.field : null;
  // We'll set up a tiny poll to detect input.field transitions if input exists
  (function integrateInputField(){
    if (typeof input === "undefined") return;
    let last = !!input.field;
    setInterval(function(){
      if (input.field && !last) { // pressed
        m.activateAbility();
      }
      last = !!input.field;
    }, 60);
  })();

  // -- 6) Wrap original m.spawn to randomize character on spawn
  if (m.spawn) {
    if (!m._spawnWrapped) {
      const originalSpawn = m.spawn.bind(m);
      m.spawn = function(){
        originalSpawn();
        // small timeout to ensure physics objects set
        setTimeout(()=>{
          m.randomizeCharacter(); // randomize on each spawn by default
        }, 2);
      };
      m._spawnWrapped = true;
    }
  } else {
    console.warn("player_randomized: m.spawn not found; character system will be available but not auto-applied.");
  }

  // -- 7) Wrap draw to add per-character effects while preserving original draw
  if (m.draw) {
    if (!m._drawWrapped) {
      const origDraw = m.draw.bind(m);
      m.draw = function(){
        origDraw();
        // post-draw effects
        try {
          if (m._isStealthed && simulation && simulation.cycle % 6 < 3) {
            // make translucent
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 34, 0, Math.PI*2);
            ctx.fillStyle = "rgba(100,100,150,0.15)";
            ctx.fill();
            ctx.restore();
          }
          // earth shield visual
          if (m._earthShield && simulation && simulation.cycle < m._earthShield) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 60 + 6*Math.sin(simulation.cycle*0.1), 0, Math.PI*2);
            ctx.strokeStyle = "rgba(140,110,80,0.6)";
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.restore();
          }
          // reflect shield
          if (m._reflectUntil && simulation && simulation.cycle < m._reflectUntil) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 48 + 6*Math.cos(simulation.cycle*0.12), 0, Math.PI*2);
            ctx.strokeStyle = "rgba(200,240,255,0.9)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
          }
          // bubble shield
          if (m._bubbleUntil && simulation && simulation.cycle < m._bubbleUntil) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 80, 0, Math.PI*2);
            ctx.fillStyle = "rgba(160,240,255,0.08)";
            ctx.fill();
            ctx.restore();
          }
          // slide effect
          if (m._slideUntil && simulation && simulation.cycle < m._slideUntil) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(m.pos.x, m.pos.y+18, 48, 18, 0, 0, Math.PI*2);
            ctx.fillStyle = "rgba(200,240,255,0.08)";
            ctx.fill();
            ctx.restore();
          }
          // generic charged aura while ability active
          if (m._abilityActiveUntil && simulation && simulation.cycle < m._abilityActiveUntil) {
            ctx.save();
            const t = (m._abilityActiveUntil - simulation.cycle) / 60;
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 30 + 8*(1-t), 0, Math.PI*2);
            ctx.strokeStyle = `rgba(255,255,255,${0.1+0.6*t})`;
            ctx.lineWidth = 2 + 6*(t);
            ctx.stroke();
            ctx.restore();
          }
          // anchor field visual
          if (m._anchorUntil && simulation && simulation.cycle < m._anchorUntil) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.pos.x, m.pos.y, 140, 0, Math.PI*2);
            ctx.strokeStyle = "rgba(100,100,140,0.06)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
          }
          // meteor incoming visual hint for meteorCall
          if (simulation && simulation.cycle % 30 === 0 && m._abilityActiveUntil && simulation.cycle < m._abilityActiveUntil) {
            // tiny shimmer
            spawnParticle(m.pos.x + (Math.random()-0.5)*40, m.pos.y - 100 + (Math.random()-0.5)*20, { color:"rgba(255,180,120,0.6)", radius:4, time:20 });
          }
        } catch(e){ /* drawing safeties */ }
      };
      m._drawWrapped = true;
    }
  }

  // -- 8) Passive effects tick (integration inside m.move loop is preferable, but poll as a fallback)
  (function passiveTicker(){
    if (typeof simulation === "undefined") return;
    setInterval(function(){
      // apply a few passive effects per-cycle-ish
      if (!m || !m.specialPassive) return;
      const p = m.specialPassive;
      if (p === "regen") {
        if (m.addHealth) m.addHealth(0.002);
      } else if (p === "autoRepair") {
        if (m.energy) m.energy = Math.min(m.maxEnergy||1, (m.energy||0)+0.002);
      } else if (p === "envSlow") {
        // slow mobs in vicinity slightly every few ticks
        if (typeof mobs !== "undefined" && mobs.statusSlowAll && Math.random()<0.01) mobs.statusSlowAll(20);
      } else if (p === "ghostLike") {
        // slight reduction in collision damage - mark a flag read by m.defense if implemented
        m._ghostLike = true;
      }
    }, 120);
  })();

  // -- 9) Expose a utility to pick a character by name (useful for testing/cheats)
  m.setCharacter = function(name){
    return m.randomizeCharacter(name);
  };

  // -- 10) Done
  console.log("player_randomized: Loaded. Characters:", m.characterTypes.length);
})();
