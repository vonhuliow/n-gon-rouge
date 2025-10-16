(function(){
/*
  boss_summons_expanded.js
  Phase 2 — Expanded boss summons, full-body visuals, HUD integration, new legendary weapons,
  empowered/ultimate variants, customization, and particles.
  - Safe: detects Matter, engine, mobs, b.guns, simulation, hud, and falls back where needed.
  - Designed to be non-destructive and to integrate with your existing sword/scythe/spear patterns.
*/

/* ----------------------- Safety utilities ----------------------- */
function safe(fn){ return function(){ try { return fn.apply(this, arguments); } catch(e){ console.error("boss_summons_expanded error:", e); } }; }
function hasEngine(){ return (typeof Matter !== 'undefined' && typeof Bodies !== 'undefined' && typeof Composite !== 'undefined' && typeof engine !== 'undefined'); }
function hasSimulation(){ return (typeof simulation !== 'undefined'); }
function hasHUD(){ return (typeof hud !== 'undefined' && typeof hud.draw === 'function'); }

/* ----------------------- Rendering adapters ----------------------- */
// Prefer simulation.drawList or simulation.ephemera; fallback to canvas context if available.
function pushDrawItem(item){
  if (hasSimulation() && Array.isArray(simulation.drawList)) {
    simulation.drawList.push(item);
  } else if (hasSimulation() && Array.isArray(simulation.ephemera)) {
    // provide a basic visual via ephemera draw list
    simulation.ephemera.push({ name: item.name || "draw", do(){ /* engine should pick up drawList; fallback no-op */ } });
  } else if (typeof ctx !== 'undefined') {
    // draw immediately (best-effort, may not persist)
    try {
      ctx.save();
      if (item.color) ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius||10, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } catch(e){ /* ignore */ }
  } else {
    // no visual system available — silent fallback
  }
}

/* ----------------------- Particle helpers ----------------------- */
function particleTrail(opts){
  if (!opts) return;
  // opts: {x,y,life,color,radius,vel}
  if (hasSimulation() && Array.isArray(simulation.drawList)) {
    simulation.drawList.push({ x: opts.x, y: opts.y, radius: opts.radius||12, color: opts.color||'rgba(255,255,255,0.6)', time: opts.life||30, name: opts.name||'particle' });
    return;
  }
  // fallback: try ctx
  if (typeof ctx !== 'undefined') {
    try {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = opts.color || 'white';
      ctx.beginPath();
      ctx.arc(opts.x, opts.y, opts.radius||8, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } catch(e){}
  }
}

function ringPulse(position, size, count, color, lifetime){
  for (let i=0;i<count;i++){
    const ang = (i/count)*Math.PI*2 + (Math.random()*0.4 - 0.2);
    const px = position.x + Math.cos(ang)*size*(0.5+Math.random()*0.6);
    const py = position.y + Math.sin(ang)*size*(0.5+Math.random()*0.6);
    particleTrail({ x:px, y:py, life: lifetime||40, color: color, radius: 6+Math.random()*14 });
  }
}

/* ----------------------- Spawn adapter ----------------------- */
function spawnMob(def){
  // Preferred: use mobs.spawn(def) if available. Else create a body + mob array push.
  if (typeof mobs !== 'undefined' && typeof mobs.spawn === 'function') {
    try { return mobs.spawn(def); } catch(e){ console.error("mobs.spawn failed:", e); }
  }
  if (!hasEngine()) {
    // fallback: return a simple object (non-physical stub)
    const stub = Object.assign({ stub:true, alive:true, isAlly:true, position: def.position || (player && player.position) || {x:0,y:0} }, def);
    if (typeof mob !== 'undefined' && Array.isArray(mob)) mob.push(stub);
    return stub;
  }
  // Build a composite body with simple parts for visuals & collisions
  const x = def.position ? def.position.x : (player ? player.position.x + 120 : 0);
  const y = def.position ? def.position.y : (player ? player.position.y : 0);
  const radius = def.radius || (def.size || 100);
  const parts = [];
  // main core
  const core = Bodies.circle(x, y, radius*0.6, spawn.propsIsNotHoldable || {});
  core.customName = def.type || "boss-ally";
  parts.push(core);
  // armor plates or decorative parts
  const plate1 = Bodies.rectangle(x + radius*0.7, y, radius*0.6, radius*0.25, spawn.propsIsNotHoldable || {});
  const plate2 = Bodies.rectangle(x - radius*0.7, y, radius*0.6, radius*0.25, spawn.propsIsNotHoldable || {});
  plate1.isSensor = false; plate2.isSensor = false;
  parts.push(plate1); parts.push(plate2);
  const body = Body.create({ parts: parts });
  body.customName = def.type || "boss-ally";
  body.isAlly = true;
  body.team = def.team || "player";
  body.maxHealth = def.hp || def.health || 1000;
  body.health = body.maxHealth;
  body.damage = def.damage || 20;
  body.radius = radius;
  body.lifetime = def.lifetime || 1800;
  body.visual = def.visual || {};
  if (Composite && engine) Composite.add(engine.world, body);
  if (typeof mob !== 'undefined' && Array.isArray(mob)) mob.push(body);
  // add AI tick
  body.do = function(){
    // simple ally AI: follow player, seek enemies, attack by contact
    if (!player) return;
    // find nearest hostile
    let nearest = null; let nd = 1e9;
    for (let i=0;i<(mob||[]).length;i++){
      const mm = mob[i];
      if (!mm || mm === body) continue;
      // consider non-ally mobs as hostile (heuristic: !isAlly)
      if (mm.isAlly) continue;
      if (!mm.alive) continue;
      const d = Vector.magnitude(Vector.sub(mm.position, body.position));
      if (d < nd) { nd = d; nearest = mm; }
    }
    if (nearest && nd < 1400) {
      const dir = Vector.normalise(Vector.sub(nearest.position, body.position));
      Matter.Body.applyForce(body, body.position, { x: dir.x * 0.0015, y: dir.y * 0.0015 });
      // contact damage (best-effort)
      if (Vector.magnitude(Vector.sub(nearest.position, body.position)) < (nearest.radius + body.radius*0.5)) {
        if (typeof nearest.damage === 'function') nearest.damage(body.damage);
      }
    } else {
      // orbit near player
      const toPlayer = Vector.sub(player.position, body.position);
      const d = Vector.magnitude(toPlayer);
      if (d > 220) {
        const unit = Vector.normalise(toPlayer);
        Matter.Body.applyForce(body, body.position, { x: unit.x*0.0009, y: unit.y*0.0009 });
      } else {
        // small hover effect
        const offsetAng = (simulation && simulation.cycle) ? simulation.cycle/90 : 0;
        const tx = player.position.x + Math.cos(offsetAng)*160;
        const ty = player.position.y + Math.sin(offsetAng)*80;
        Matter.Body.applyForce(body, body.position, { x: (tx-body.position.x)*0.0005, y: (ty-body.position.y)*0.0005 });
      }
    }
    // visual pulse
    if (simulation && simulation.cycle % 60 === 0) {
      ringPulse(body.position, body.radius*0.8, 12, body.visual && body.visual.glow || "rgba(255,255,255,0.6)", 30);
    }
    // lifetime
    if (body.lifetime !== undefined) {
      body.lifetime--;
      if (body.lifetime <= 0) {
        body.alive = false;
        try { if (Composite && engine) Composite.remove(engine.world, body); } catch(e){}
      }
    }
  };
  // register ephemeral tick if simulation exists
  if (hasSimulation() && Array.isArray(simulation.ephemera)) {
    simulation.ephemera.push({ name: body.customName + "-ally", do(){ if (typeof body.do === 'function') body.do(); } });
  }
  return body;
}

/* ----------------------- HUD helpers ----------------------- */
function drawBossHUD(ally){
  // Try simulation.drawList first
  if (!ally) return;
  if (hasSimulation() && Array.isArray(simulation.drawList)) {
    const pos = ally.position || (player && player.position) || {x:0,y:0};
    const pct = (ally.health && ally.maxHealth) ? Math.max(0, ally.health/ally.maxHealth) : 1;
    simulation.drawList.push({ x: pos.x, y: pos.y - (ally.radius||80) - 30, name: "ally-hp", width: 120, height: 10, color: "rgba(0,0,0,0.6)", percent: pct, time: 1 });
    return;
  }
  // fallback: attempt to use ctx overlay
  if (typeof ctx !== 'undefined') {
    try {
      const p = ally.position || (player && player.position) || {x:0,y:0};
      const x = p.x - 60, y = p.y - (ally.radius||80) - 30;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x, y, 120, 10);
      const pct = (ally.health && ally.maxHealth) ? Math.max(0, ally.health/ally.maxHealth) : 1;
      ctx.fillStyle = "lime";
      ctx.fillRect(x+2, y+2, 116*pct, 6);
      ctx.restore();
    } catch(e){}
  }
}

/* ----------------------- Boss definitions (full-bodied) ----------------------- */
const bossAllies = [];

/* Iron Colossus - multi-part heavy tank */
bossAllies.push({
  type: "iron-colossus",
  description: "A towering armored colossus that taunts enemies and soaks damage.",
  hp: 6000, damage: 48, radius: 160, lifetime: 5400,
  visual: { model: "colossus", tint: "#b0b8c8", glow: "#ffd27f" },
  spawn(position){
    const b = spawnMob({ type:"iron-colossus", position: position, hp: this.hp, damage: this.damage, radius: this.radius, lifetime: this.lifetime, visual: this.visual });
    // make heavier: increase mass
    if (hasEngine() && b && b.parts) {
      try { Body.setMass(b, (b.mass||1) * 4); } catch(e){}
    }
    // add ground-pound ephemera: periodic shockwave
    if (hasSimulation() && Array.isArray(simulation.ephemera)) {
      const name = b.customName + "-colossus-shock";
      simulation.ephemera.push({ name: name, do(){
        if (!b || !b.alive) return;
        if (simulation.cycle % 180 === 0) {
          // deal AoE damage near b
          for (let i=0;i<(mob||[]).length;i++){
            const mm = mob[i];
            if (!mm || mm.isAlly || !mm.alive) continue;
            const d = Vector.magnitude(Vector.sub(mm.position, b.position));
            if (d < 600) {
              if (typeof mm.damage === 'function') mm.damage(40);
              particleTrail({ x: mm.position.x, y: mm.position.y, color: "#fffae0", life: 40, radius: 18 });
            }
          }
          ringPulse(b.position, 260, 30, "#ffd27f", 60);
        }
        drawBossHUD(b);
      } });
    }
    return b;
  }
});

/* Ashborn Warden - protector with aura */
bossAllies.push({
  type: "ashborn-warden",
  description: "Guardian wreathed in ash; grants damage reduction to nearby allies.",
  hp: 3800, damage: 28, radius: 140, lifetime: 4200,
  visual: { model: "warden", tint: "#4b3b2b", ember: true },
  spawn(position){
    const b = spawnMob({ type:"ashborn-warden", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (hasSimulation() && Array.isArray(simulation.ephemera)) {
      simulation.ephemera.push({ name: b.customName + "-warden-aura", do(){
        if (!b || !b.alive) return;
        // apply aura - reduce damage taken for allies in range by 20%
        for (let i=0;i<(mob||[]).length;i++){
          const mm = mob[i];
          if (!mm || !mm.alive || !mm.isAlly) continue;
          const d = Vector.magnitude(Vector.sub(mm.position, b.position));
          if (d < 600) {
            mm.damageTakenMultiplier = 0.8;
            particleTrail({ x: mm.position.x, y: mm.position.y, color: "rgba(140,110,90,0.6)", life: 18, radius: 8 });
          }
        }
        drawBossHUD(b);
      } });
    }
    return b;
  }
});

/* Rift Drake - flying ranged boss */
bossAllies.push({
  type: "rift-drake",
  description: "A flying drake that strafes and spits void bombs.",
  hp: 3200, damage: 36, radius: 110, lifetime: 3600,
  visual: { model:"drake", wings:true, particleColor: "rgba(180,80,255,0.95)" },
  spawn(position){
    const b = spawnMob({ type:"rift-drake", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (hasSimulation() && Array.isArray(simulation.ephemera)) {
      simulation.ephemera.push({ name: b.customName + "-drake-ranged", do(){
        if (!b || !b.alive) return;
        if (simulation.cycle % 70 === 0) {
          // pick nearest hostile and fire a void bomb
          let nearest = null; let nd = 1e9;
          for (let i=0;i<(mob||[]).length;i++){ const mm = mob[i]; if (!mm || mm.isAlly || !mm.alive) continue; const d=Vector.magnitude(Vector.sub(mm.position, b.position)); if (d<nd){ nd=d; nearest=mm; } }
          if (nearest) {
            if (hasEngine()) {
              const pos = { x: b.position.x + Math.cos(Math.random()*Math.PI*2)*24, y: b.position.y + Math.sin(Math.random()*Math.PI*2)*24 };
              const bolt = Bodies.circle(pos.x, pos.y, 18, spawn.propsIsNotHoldable || {});
              bolt.customName = "drake-bolt";
              bolt.isAlly = true;
              Composite.add(engine.world, bolt);
              if (typeof bullet !== 'undefined') bullet.push(bolt);
              const dir = Vector.normalise(Vector.sub(nearest.position, pos));
              Matter.Body.setVelocity(bolt, { x: dir.x*22, y: dir.y*22 });
              ringPulse(b.position, 40, 16, b.visual.particleColor, 30);
            } else {
              // fallback damage directly
              if (typeof nearest.damage === 'function') nearest.damage(18);
            }
          }
        }
        drawBossHUD(b);
      } });
    }
    return b;
  }
});

/* Wraith Matriarch - caster/healer */
bossAllies.push({
  type: "wraith-matriarch",
  description: "A spectral queen who heals allies and weakens foes with a cry.",
  hp: 2400, damage: 12, radius: 100, lifetime: 4200,
  visual: { model:"matriarch", aura:"#b19cd9" },
  spawn(position){
    const b = spawnMob({ type:"wraith-matriarch", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (hasSimulation() && Array.isArray(simulation.ephemera)) {
      simulation.ephemera.push({ name: b.customName + "-matriarch-cast", do(){
        if (!b || !b.alive) return;
        if (simulation.cycle % 110 === 0) {
          // heal allied mobs in range
          for (let i=0;i<(mob||[]).length;i++){ const mm = mob[i]; if (!mm || !mm.alive || !mm.isAlly) continue; const d = Vector.magnitude(Vector.sub(mm.position, b.position)); if (d < 700){ if (typeof mm.heal === 'function') mm.heal(60); else mm.health = Math.min(mm.maxHealth||100, (mm.health||100)+60); particleTrail({ x:mm.position.x, y:mm.position.y, color:"#b19cd9", life:40, radius:18 }); } }
        }
        drawBossHUD(b);
      } });
    }
    return b;
  }
});

/* Juggernaut Engine - artillery siege boss */
bossAllies.push({
  type: "juggernaut-engine",
  description: "A slow-moving siege engine that lobs massive shells.",
  hp: 7200, damage: 84, radius: 200, lifetime: 6000,
  visual: { model:"juggernaut", metal:true, core:"#ff8c4d" },
  spawn(position){
    const b = spawnMob({ type:"juggernaut-engine", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (hasSimulation() && Array.isArray(simulation.ephemera)) {
      simulation.ephemera.push({ name: b.customName + "-juggernaut-artillery", do(){
        if (!b || !b.alive) return;
        if (simulation.cycle % 240 === 0) {
          // lob large shell at cluster
          const targets = [];
          for (let i=0;i<(mob||[]).length;i++){ const mm = mob[i]; if (!mm || !mm.alive || mm.isAlly) continue; targets.push(mm); }
          if (targets.length > 0 && hasEngine()) {
            const t = targets[Math.floor(Math.random()*targets.length)];
            const shell = Bodies.circle(b.position.x, b.position.y, 36, spawn.propsIsNotHoldable || {});
            shell.customName = "juggernaut-shell";
            Composite.add(engine.world, shell);
            if (typeof bullet !== 'undefined') bullet.push(shell);
            const dir = Vector.normalise(Vector.sub(t.position, b.position));
            Matter.Body.setVelocity(shell, { x: dir.x*12, y: dir.y*12 });
            ringPulse(b.position, 140, 28, "#ff8c4d", 60);
          }
        }
        drawBossHUD(b);
      } });
    }
    return b;
  }
});

/* ----------------------- Summon Weapons (empowered & ultimate variants) ----------------------- */
const bossSummonWeapons = [];

// utility to create empowered & ultimate names
function empName(base){ return base + "-empowered"; }
function ultName(base){ return base + "-ultimate"; }

// Generic summoning factory
function makeSummonWeapon(opts){
  const base = {
    name: opts.name,
    descriptionFunction: opts.descriptionFunction || function(){ return opts.type + " summon"; },
    ammo: opts.ammo || 1, ammoPack: opts.ammoPack || 1, cooldown: opts.cooldown || 3600, cycle:0, have:false,
    do: safe(function(){ if (this.cycle>0) this.cycle--; }),
    fire: safe(function(powerVariant){
      if (this.cycle>0 || this.ammo<=0) return;
      this.ammo--; this.cycle=this.cooldown;
      const pos = opts.spawnOffset ? { x: player.position.x + Math.cos(m.angle)*opts.spawnOffset, y: player.position.y + Math.sin(m.angle)*opts.spawnYOffset } : { x: player.position.x + Math.cos(m.angle)*200, y: player.position.y + Math.sin(m.angle)*200 };
      const def = bossAllies.find(x=>x.type===opts.bossType);
      if (!def) return;
      def.spawn(pos);
      ringPulse(pos, opts.vfxSize||160, 36, opts.vfxColor||"#ffffff", 90);
    })
  };
  // empowered variant: consumes "summonCharge" if present (fallback to extra ammo)
  const empowered = Object.assign({}, base, {
    name: empName(base.name),
    fire: safe(function(){
      // attempt to use global summonCharge
      const chargePool = (typeof player !== 'undefined' && player.summonCharge !== undefined) ? player.summonCharge : null;
      if (chargePool && player.summonCharge > 0) {
        player.summonCharge = Math.max(0, player.summonCharge - 1);
        // reduced cooldown and slightly stronger boss (spawn same but increase hp)
        const pos = { x: player.position.x + Math.cos(m.angle)*220, y: player.position.y + Math.sin(m.angle)*220 };
        const def = bossAllies.find(x=>x.type===opts.bossType);
        if (!def) return;
        const b = def.spawn(pos);
        if (b && b.health) b.health = Math.min((b.maxHealth||b.health)+ (b.maxHealth||100)*0.25, (b.maxHealth||b.health)*1.25);
        ringPulse(pos, opts.vfxSize?opts.vfxSize*1.2:200, 44, opts.vfxColor||"#ffffff", 110);
      } else {
        // fallback to base fire
        base.fire();
      }
    })
  });
  // ultimate variant: spawns dual bosses or an enhanced variant
  const ultimate = Object.assign({}, base, {
    name: ultName(base.name),
    fire: safe(function(){
      if (this.cycle>0 || this.ammo<=0) return;
      this.ammo--; this.cycle=this.cooldown*2;
      const pos1 = { x: player.position.x + Math.cos(m.angle)*220, y: player.position.y + Math.sin(m.angle)*220 };
      const pos2 = { x: player.position.x + Math.cos(m.angle + Math.PI/6)*320, y: player.position.y + Math.sin(m.angle + Math.PI/6)*320 };
      const def = bossAllies.find(x=>x.type===opts.bossType);
      if (!def) return;
      const b1 = def.spawn(pos1);
      const b2 = def.spawn(pos2);
      // buff them if possible
      if (b1 && b2) { if (b1.health) b1.health *= 1.2; if (b2.health) b2.health *= 1.2; }
      ringPulse(pos1, opts.vfxSize?opts.vfxSize*1.3:260, 56, opts.vfxColor||"#ffffff", 160);
      ringPulse(pos2, opts.vfxSize?opts.vfxSize*1.3:260, 56, opts.vfxColor||"#ffffff", 160);
    })
  });
  return [base, empowered, ultimate];
}

// Create weapons for each boss type
[
  { bossType: "iron-colossus", name: "colossus-anchor", vfxColor:"#b0b8c8", vfxSize:220, cooldown:3600, ammo:1 },
  { bossType: "ashborn-warden", name: "warden-banner", vfxColor:"#4b3b2b", vfxSize:150, cooldown:3000, ammo:1 },
  { bossType: "rift-drake", name: "drake-sigil", vfxColor:"rgba(180,80,255,0.95)", vfxSize:160, cooldown:2800, ammo:1 },
  { bossType: "wraith-matriarch", name: "matriarch-locket", vfxColor:"#b19cd9", vfxSize:120, cooldown:4200, ammo:1 },
  { bossType: "juggernaut-engine", name: "juggernaut-beacon", vfxColor:"#ff8c4d", vfxSize:260, cooldown:7200, ammo:1 }
].forEach(cfg=>{
  const variants = makeSummonWeapon(cfg);
  variants.forEach(v => bossSummonWeapons.push(v));
});

/* ----------------------- Legendary cool weapons expanded ----------------------- */
const coolWeapons = [];

/* Celestial Forge - melee meteor caller */
coolWeapons.push({
  name:"celestial-forge",
  descriptionFunction(){ return "Massive blade that, on heavy impact, calls down meteor strikes that spawn micro-aliens."; },
  ammo: Infinity, ammoPack: Infinity, durability: 800, maxDurability: 800, have:false,
  onHeavyHit: safe(function(target, pos){
    // spawn 3 meteors that spawn small minions on impact
    for (let i=0;i<3;i++){
      const tx = pos.x + (Math.random()*160 - 80);
      const ty = pos.y - 800 - Math.random()*200;
      (function(tx,ty){
        if (hasEngine()) {
          const meteor = Bodies.circle(tx, ty, 28 + Math.random()*18, spawn.propsIsNotHoldable || {});
          meteor.customName = "meteor";
          Composite.add(engine.world, meteor);
          if (typeof bullet !== 'undefined') bullet.push(meteor);
          // fall to pos
          const dir = Vector.normalise(Vector.sub(pos, {x:tx,y:ty}));
          Matter.Body.setVelocity(meteor, { x: dir.x*10 + (Math.random()-0.5)*3, y: dir.y*10 + (Math.random()-0.5)*3 });
          setTimeout(()=>{
            // on impact: spawn small minion
            if (hasEngine()) {
              try { Composite.remove(engine.world, meteor); } catch(e){}
            }
            spawnMob({ type: "meteor-minion", position: pos, hp: 200, damage: 12, radius: 22, lifetime: 900 });
            ringPulse(pos, 90, 20, "#ffb36b", 60);
          }, 1200 + Math.random()*400);
        } else {
          spawnMob({ type: "meteor-minion", position: pos, hp:200, damage:12, radius:22, lifetime:900 });
        }
      })(tx,ty);
    }
    ringPulse(pos, 160, 28, "#ffd27f", 90);
  })
});

/* Soul Conductor - staff that transfers HP to allies */
coolWeapons.push({
  name:"soul-conductor",
  descriptionFunction(){ return "An arcane staff that siphons life from enemies in an area and redistributes it to allied summons.", },
  ammo: 6, ammoPack:1, cooldown: 240, cycle:0, have:false,
  do: safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire: safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    // drain small HP from nearby hostiles and heal allies
    let drained = 0;
    for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (!mm||!mm.alive||mm.isAlly) continue; const d=Vector.magnitude(Vector.sub(mm.position, player.position)); if (d<520){ const take = Math.min(80, (mm.health||100)*0.06); if (typeof mm.damage === 'function') mm.damage(take); drained += take; particleTrail({x:mm.position.x,y:mm.position.y, color:"#9ee7ff", life:30, radius:12}); } }
    // distribute to allies
    for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (!mm||!mm.alive||!mm.isAlly) continue; const d=Vector.magnitude(Vector.sub(mm.position, player.position)); if (d<720){ if (typeof mm.heal === 'function') mm.heal(drained*0.35); else mm.health = Math.min(mm.maxHealth||100, (mm.health||100)+drained*0.35); particleTrail({x:mm.position.x,y:mm.position.y, color:"#b19cd9", life:40, radius:18}); } }
    ringPulse(player.position, 220, 36, "#9ee7ff", 80);
  })
});

/* Null Comet - launcher that spawns micro-voids on impact */
coolWeapons.push({
  name:"null-comet",
  descriptionFunction(){ return "Launch a comet that detonates into micro-black-holes, altering battlefield geometry and summoning a small void warden.", },
  ammo:3, ammoPack:1, have:false,
  fire: safe(function(targetPos){
    if (this.ammo<=0) return;
    this.ammo--;
    const pos = targetPos || { x: player.position.x + Math.cos(m.angle)*600, y: player.position.y + Math.sin(m.angle)*600 };
    if (hasEngine()) {
      const comet = Bodies.circle(player.position.x + Math.cos(m.angle)*80, player.position.y + Math.sin(m.angle)*80, 26, spawn.propsIsNotHoldable || {});
      Composite.add(engine.world, comet);
      Matter.Body.setVelocity(comet, { x: Math.cos(m.angle)*28, y: Math.sin(m.angle)*28 });
      if (typeof bullet !== 'undefined') bullet.push(comet);
      setTimeout(()=>{
        // on impact: spawn 3 micro-voids and a small void warden
        for (let i=0;i<3;i++){
          const p = { x: pos.x + (Math.random()*200 - 100), y: pos.y + (Math.random()*140 - 70) };
          if (hasEngine()){
            const v = Bodies.circle(p.x, p.y, 18, spawn.propsIsNotHoldable || {});
            v.customName = "micro-void";
            Composite.add(engine.world, v);
            if (typeof bullet !== 'undefined') bullet.push(v);
            setTimeout(()=>{ try { Composite.remove(engine.world, v); } catch(e){} }, 900 + Math.random()*400);
          }
        }
        spawnMob({ type: "void-warden", position: pos, hp: 600, damage: 28, radius: 36, lifetime: 1200 });
        ringPulse(pos, 140, 28, "rgba(60,0,90,0.95)", 120);
      }, 900);
    } else {
      spawnMob({ type: "void-warden", position: pos, hp:600, damage:28, radius:36, lifetime:1200 });
    }
  })
});

/* Eclipse Reaver - dual scythes that spawn shadow copies */
coolWeapons.push({
  name:"eclipse-reaver",
  descriptionFunction(){ return "Twin scythes that, on special activation, tear open eclipse fields spawning shadow copies which fight for you.", },
  ammo: Infinity, ammoPack: Infinity, chargeLevel:0, maxCharge:160, charging:false, have:false,
  do: safe(function(){ if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 2); }),
  charge: safe(function(start){ this.charging = !!start; }),
  release: safe(function(){
    if (this.chargeLevel < 40) return;
    const pos = { x: player.position.x + Math.cos(m.angle)*240, y: player.position.y + Math.sin(m.angle)*240 };
    // open 2 eclipse fields that spawn shadow copies
    for (let i=0;i<2;i++){
      const p = { x: pos.x + Math.cos(i*Math.PI)*120, y: pos.y + Math.sin(i*Math.PI)*60 };
      spawnMob({ type: "shadow-copy", position: p, hp: 400 + Math.random()*200, damage: 20, radius: 40, lifetime: 900 });
      ringPulse(p, 120, 28, "rgba(20,20,40,0.9)", 100);
    }
    this.chargeLevel = 0; this.charging = false;
  })
});

/* Overmind Core - fusion ultimate that temporarily merges active bosses into a single huge ally */
coolWeapons.push({
  name:"overmind-core",
  descriptionFunction(){ return "Concentrate your active bosses into a single Overmind for a short time; devastating but consumes them.", },
  ammo:1, ammoPack:1, cooldown: 14400, cycle:0, have:false,
  do: safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire: safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    // collect existing boss allies and fuse their stats
    const active = [];
    for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && mm.isAlly && mm.customName && mm.customName.indexOf("-ally")>-1) active.push(mm); }
    if (active.length === 0) return;
    // compute combined stats
    let totalHP = 0, totalDamage = 0, size = 0;
    for (const a of active){ totalHP += (a.health||100); totalDamage += (a.damage||10); size += (a.radius||80); try{ if (Composite && engine) Composite.remove(engine.world, a); } catch(e){} a.alive = false; }
    const fusedHP = Math.min(totalHP * 1.6, 20000);
    const fusedDamage = Math.min(totalDamage * 1.6, 2000);
    const fusedRadius = Math.min(Math.max(size/active.length, 160), 500);
    const pos = player.position ? {x: player.position.x + 120, y: player.position.y} : {x:0,y:0};
    const overmind = spawnMob({ type: "overmind", position: pos, hp: fusedHP, damage: fusedDamage, radius: fusedRadius, lifetime: 1200, visual: { model:"overmind", glow:"#fff200" } });
    ringPulse(pos, fusedRadius*1.1, 80, "#fff200", 180);
  })
});

/* ----------------------- Character customization expanded ----------------------- */
const customization = {
  applyTint(playerObj, hexColor){ if (!playerObj) return; playerObj.modelTint = hexColor; if (playerObj.position) ringPulse(playerObj.position, 80, 24, hexColor, 45); },
  setSize(playerObj, scale){ if (!playerObj) return; playerObj.modelScale = scale; if (playerObj && playerObj.mass && typeof Matter !== 'undefined') { try{ Matter.Body.setMass(playerObj, (playerObj.mass || 1) * scale); }catch(e){} } },
  addAccessory(playerObj, name){ if (!playerObj) return; if (!playerObj.accessories) playerObj.accessories = []; playerObj.accessories.push(name); console.log("Accessory added:", name); },
  applyModel(playerObj, modelName){ if (!playerObj) return; playerObj.modelName = modelName; console.log("Model applied:", modelName); },
  applyAura(playerObj, color, radius){ if (!playerObj) return; if (playerObj.position) ringPulse(playerObj.position, radius||120, 40, color||"#ffffff", 120); }
};

/* ----------------------- Auto-install / export ----------------------- */
const installToBGuns = function(container){
  if (!container) return;
  // add boss summons and their variants
  bossSummonWeapons.forEach(w=> { if (!container[w.name]) container[w.name] = w; });
  // add cool weapons
  coolWeapons.forEach(w=> { if (!container[w.name]) container[w.name] = w; });
  // expose customization & bossAllies
  container._bossAllies = bossAllies;
  container._bossSummonPackMeta = { installedAt: Date.now() };
};

if (typeof b !== 'undefined' && b.guns) {
  installToBGuns(b.guns);
  // also attach helpers to window for convenience
  window.bossAllies = bossAllies;
  window.summonCustomization = customization;
  console.log("boss_summons_expanded installed into b.guns and exported helpers to window");
} else {
  window.bossSummonWeaponsExpanded = bossSummonWeapons;
  window.coolWeaponsExpanded = coolWeapons;
  window.bossAllies = bossAllies;
  window.summonCustomization = customization;
  console.log("boss_summons_expanded exported as globals (b.guns not present)");
}

})();