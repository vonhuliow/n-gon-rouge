(function(){
/*
  boss_summons_pack.js
  - Boss-type summons (strong temporary allies with unique AI & visuals)
  - New character customization helpers (model tint, size, accessories)
  - Several "cool" new weapons that summon bosses or use boss-tier effects
  - Particle systems and model-like visuals using safe engine hooks (simulation.ephemera, Bodies, Composite)
  - Safe: will fallback to console behavior if engine globals are unavailable.
*/

/* ---------- Safety and helpers ---------- */
function safe(fn){
  return function(){
    try { return fn.apply(this, arguments); } catch(e){ console.error("error in boss_summons_pack:", e); }
  }
}

function hasEngine(){ return (typeof Matter !== 'undefined' && typeof Bodies !== 'undefined' && typeof Composite !== 'undefined'); }

function spawnMob(def){
  // Preferred engine spawn via mobs.spawn if available; else build crude body + object
  if (typeof mobs !== 'undefined' && typeof mobs.spawn === 'function') {
    return mobs.spawn(def);
  }
  if (!hasEngine()) {
    console.log("spawnMob stub:", def);
    return Object.assign({ stub:true, alive:true }, def);
  }
  // Build a generic powerful body for boss-type ally
  const x = def.position ? def.position.x : (player ? player.position.x + 120 : 0);
  const y = def.position ? def.position.y : (player ? player.position.y : 0);
  const radius = def.radius || (def.size || 120);
  const body = Bodies.circle(x, y, radius, Object.assign({}, spawn.propsIsNotHoldable || {}));
  body.customName = def.type || "boss-ally";
  body.isAlly = true;
  body.health = def.health || (def.hp || 1000);
  body.maxHealth = body.health;
  body.team = def.team || "player";
  body.lifetime = def.lifetime || 1800;
  body.visual = def.visual || {};
  if (Composite && engine && body) Composite.add(engine.world, body);
  if (typeof mob !== 'undefined') mob.push(body);
  // add a simple tick behavior
  body.do = function(){
    // follow player slowly and attack nearby enemies
    if (!player || !mob) return;
    // simple AI: chase nearest hostile
    let nearest=null; let nd=1e9;
    for (let i=0;i<(mob||[]).length;i++){ if (mob[i] && mob[i].alive && !mob[i].isAlly){ const d = Vector.magnitude(Vector.sub(mob[i].position, body.position)); if (d < nd){ nd = d; nearest = mob[i]; } } }
    if (nearest && nd < 1500){
      const dir = Vector.normalise(Vector.sub(nearest.position, body.position));
      Matter.Body.applyForce(body, body.position, { x: dir.x*0.0015, y: dir.y*0.0015 });
      // damage on contact:
      if (nearest && Vector.magnitude(Vector.sub(nearest.position, body.position)) < (nearest.radius + radius*0.5)) {
        if (typeof nearest.damage === 'function') nearest.damage(def.damage || 8);
      }
    } else {
      // idle near player
      const toPlayer = Vector.sub(player.position, body.position);
      const d = Vector.magnitude(toPlayer);
      if (d > 300) {
        const unit = Vector.normalise(toPlayer);
        Matter.Body.applyForce(body, body.position, { x: unit.x*0.001, y: unit.y*0.001 });
      } else {
        // small orbit motion
        const ang = (simulation && simulation.cycle) ? (simulation.cycle/60) : 0;
        const tx = player.position.x + Math.cos(ang)*200;
        const ty = player.position.y + Math.sin(ang)*120;
        Matter.Body.applyForce(body, body.position, { x: (tx-body.position.x)*0.0006, y: (ty-body.position.y)*0.0006 });
      }
    }
    // lifetime and visual pulse
    if (body.lifetime !== undefined) {
      body.lifetime--;
      if (body.lifetime <= 0) {
        body.alive = false;
        if (Composite && engine && body) Composite.remove(engine.world, body);
      }
    }
  };
  // push into simulation ephemera
  if (typeof simulation !== 'undefined' && simulation.ephemera) {
    simulation.ephemera.push({ name: body.customName+"-ally", do(){ if (typeof body.do === 'function') body.do(); } });
  }
  return body;
}

/* ---------- Particle & visual helpers ---------- */
function particleTrail(opts){
  if (!opts) return;
  if (typeof simulation !== 'undefined' && simulation.drawList) {
    simulation.drawList.push({ x:opts.x, y:opts.y, radius:opts.radius||20, color:opts.color||'rgba(255,0,0,0.6)', time:opts.life||30 });
  }
}

function ringPulse(position, size, count, color, lifetime){
  for (let i=0;i<count;i++){
    const ang = (i/count)*Math.PI*2;
    const px = position.x + Math.cos(ang)*size*(0.5+Math.random()*0.6);
    const py = position.y + Math.sin(ang)*size*(0.5+Math.random()*0.6);
    particleTrail({ x:px, y:py, life: lifetime||40, color: color, radius: 8+Math.random()*12 });
  }
}

/* ---------- New Boss-type Allies (definitions) ---------- */
const bossAllies = [];

/* 1) Iron Colossus */
bossAllies.push({
  type: "iron-colossus",
  description: "A towering armored colossus that taunts enemies and soaks damage.",
  hp: 4000,
  damage: 32,
  radius: 140,
  lifetime: 3600,
  visual: { model: "colossus", tint: "#b0b8c8", glow: "#ffd27f" },
  spawn(position){ return spawnMob({ type: "iron-colossus", position: position, hp: this.hp, damage: this.damage, radius: this.radius, lifetime: this.lifetime, visual: this.visual }); }
});

/* 2) Ashborn Warden */
bossAllies.push({
  type: "ashborn-warden",
  description: "Guardian wreathed in ash; grants damage reduction to nearby allies.",
  hp: 2800,
  damage: 18,
  radius: 120,
  lifetime: 3000,
  visual: { model: "warden", tint: "#4b3b2b", ember: true },
  spawn(position){
    const b = spawnMob({ type:"ashborn-warden", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (typeof simulation !== 'undefined' && simulation.ephemera){
      simulation.ephemera.push({ name: b.customName+"-aura", do(){ 
        for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && mm.isAlly){ const d=Vector.magnitude(Vector.sub(mm.position, b.position||{x:0,y:0})); if (d<600){ mm.damageTakenMultiplier = 0.85; } } } 
      } });
    }
    return b;
  }
});

/* 3) Rift Drake */
bossAllies.push({
  type: "rift-drake",
  description: "A flying drake that strafes and spits void bombs.",
  hp: 2200,
  damage: 26,
  radius: 100,
  lifetime: 2400,
  visual: { model:"drake", wings:true, particleColor: "rgba(180,80,255,0.9)" },
  spawn(position){
    const b = spawnMob({ type:"rift-drake", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (typeof simulation !== 'undefined' && simulation.ephemera){
      simulation.ephemera.push({ name: b.customName+"-ranged", do(){ 
        if (!b || !b.alive) return;
        if (simulation.cycle % 90 === 0){
          let nearest=null; let nd=1e9;
          for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && !mm.isAlly){ const d=Vector.magnitude(Vector.sub(mm.position, b.position)); if (d<nd){ nd=d; nearest=mm; } } }
          if (nearest){
            const pos = { x: b.position.x + Math.cos(Math.random()*Math.PI*2)*20, y: b.position.y + Math.sin(Math.random()*Math.PI*2)*20 };
            if (typeof Bodies !== 'undefined'){
              const bolt = Bodies.circle(pos.x, pos.y, 18, spawn.propsIsNotHoldable);
              bolt.customName = "drake-bolt";
              bolt.isAlly = true;
              if (Composite && engine) Composite.add(engine.world, bolt);
              if (typeof bullet !== 'undefined') bullet.push(bolt);
              const dir = Vector.normalise(Vector.sub(nearest.position, pos));
              Matter.Body.setVelocity(bolt, { x: dir.x*18, y: dir.y*18 });
            }
            ringPulse(b.position, 40, 16, b.visual.particleColor, 30);
          }
        }
      } });
    }
    return b;
  }
});

/* 4) Wraith Matriarch */
bossAllies.push({
  type:"wraith-matriarch",
  description: "A spectral queen who heals allies and weakens foes with a cry.",
  hp: 1800, damage: 8, radius: 90, lifetime: 3600,
  visual:{ model:"matriarch", aura:"#b19cd9" },
  spawn(position){
    const b = spawnMob({ type:"wraith-matriarch", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (typeof simulation !== 'undefined' && simulation.ephemera){
      simulation.ephemera.push({ name: b.customName+"-caster", do(){ 
        if (!b || !b.alive) return;
        if (simulation.cycle % 120 === 0){
          for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && mm.isAlly){ const d=Vector.magnitude(Vector.sub(mm.position, b.position)); if (d<800){ if (typeof mm.heal === 'function') mm.heal(40); else mm.health = Math.min(mm.maxHealth||100, (mm.health||100)+40); particleTrail({x:mm.position.x,y:mm.position.y,life:40,color:"#b19cd9",radius:18}); } } }
        }
      } });
    }
    return b;
  }
});

/* 5) Juggernaut Engine */
bossAllies.push({
  type:"juggernaut-engine",
  description: "A slow-moving siege engine that lobs massive shells.", hp: 5200, damage: 60, radius: 180, lifetime: 4200,
  visual:{ model:"juggernaut", metal:true, core:"#ff8c4d" },
  spawn(position){
    const b = spawnMob({ type:"juggernaut-engine", position, hp:this.hp, damage:this.damage, radius:this.radius, lifetime:this.lifetime, visual:this.visual });
    if (typeof simulation !== 'undefined' && simulation.ephemera){
      simulation.ephemera.push({ name: b.customName+"-artillery", do(){ 
        if (!b || !b.alive) return;
        if (simulation.cycle % 200 === 0){
          let targets=[];
          for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && !mm.isAlly) targets.push(mm); }
          if (targets.length>0){
            const t = targets[Math.floor(Math.random()*targets.length)];
            if (typeof Bodies !== 'undefined'){
              const shell = Bodies.circle(b.position.x, b.position.y, 34, spawn.propsIsNotHoldable);
              shell.customName = "juggernaut-shell";
              if (Composite && engine) Composite.add(engine.world, shell);
              if (typeof bullet !== 'undefined') bullet.push(shell);
              const dir = Vector.normalise(Vector.sub(t.position, b.position));
              Matter.Body.setVelocity(shell, { x: dir.x*10, y: dir.y*10 });
              ringPulse(b.position, 120, 20, "#ff8c4d", 60);
            }
          }
        }
      } });
    }
    return b;
  }
});

/* ---------- New Summon Weapons (boss-tier) ---------- */
const bossSummonWeapons = [];

/* Colossus Anchor */
bossSummonWeapons.push({
  name: "colossus-anchor",
  descriptionFunction(){ return "Plant a titanic anchor; summons an Iron Colossus to fight by your side for a long time."; },
  ammo:1, ammoPack:1, cooldown: 3600, cycle:0, have:false,
  do: safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire: safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*240, y: player.position.y + Math.sin(m.angle)*240 };
    const b = bossAllies.find(x=>x.type==="iron-colossus");
    if (b) {
      const ally = b.spawn(pos);
      ringPulse(pos, 220, 40, "#b0b8c8", 90);
    }
  })
});

/* Warden Banner */
bossSummonWeapons.push({
  name:"warden-banner",
  descriptionFunction(){ return "Raise a protective Warden that reduces incoming damage for nearby allies."; },
  ammo:1, ammoPack:1, cooldown:3000, cycle:0, have:false,
  do:safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire:safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*160, y: player.position.y + Math.sin(m.angle)*160 };
    const b = bossAllies.find(x=>x.type==="ashborn-warden");
    if (b) { const ally = b.spawn(pos); ringPulse(pos, 150, 28, "#4b3b2b", 80); }
  })
});

/* Drake Sigil */
bossSummonWeapons.push({
  name:"drake-sigil",
  descriptionFunction(){ return "Invoke a drake sigil; a Rift Drake will appear and harry enemies from above."; },
  ammo:1, ammoPack:1, cooldown:2800, cycle:0, have:false,
  do:safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire:safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*320, y: player.position.y - 120 };
    const b = bossAllies.find(x=>x.type==="rift-drake");
    if (b) { const ally = b.spawn(pos); ringPulse(pos, 160, 36, "rgba(180,80,255,0.9)", 90); }
  })
});

/* Matriarch Locket */
bossSummonWeapons.push({
  name:"matriarch-locket",
  descriptionFunction(){ return "Unleash a spectral matriarch who heals your allies and curses your foes."; },
  ammo:1, ammoPack:1, cooldown:4200, cycle:0, have:false,
  do:safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire:safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*120, y: player.position.y + Math.sin(m.angle)*120 };
    const b = bossAllies.find(x=>x.type==="wraith-matriarch");
    if (b) { const ally = b.spawn(pos); ringPulse(pos, 120, 28, "#b19cd9", 100); }
  })
});

/* Juggernaut Beacon */
bossSummonWeapons.push({
  name:"juggernaut-beacon",
  descriptionFunction(){ return "Call forth a siege engine that fires huge shells at enemy clusters."; },
  ammo:1, ammoPack:1, cooldown:7200, cycle:0, have:false,
  do:safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire:safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*400, y: player.position.y };
    const b = bossAllies.find(x=>x.type==="juggernaut-engine");
    if (b) { const ally = b.spawn(pos); ringPulse(pos, 260, 48, "#ff8c4d", 120); }
  })
});

/* ---------- Character customization helper ---------- */
const customization = {
  applyTint(playerObj, hexColor){
    if (!playerObj) return;
    playerObj.modelTint = hexColor;
    if (playerObj.position) ringPulse(playerObj.position, 80, 24, hexColor, 45);
  },
  setSize(playerObj, scale){
    if (!playerObj) return;
    playerObj.modelScale = scale;
    if (playerObj && playerObj.mass && typeof Matter !== 'undefined') {
      Matter.Body.setMass(playerObj, (playerObj.mass || 1) * scale);
    }
  },
  addAccessory(playerObj, name){
    if (!playerObj) return;
    if (!playerObj.accessories) playerObj.accessories = [];
    playerObj.accessories.push(name);
    console.log("Accessory added:", name);
  },
  applyModel(playerObj, modelName){
    if (!playerObj) return;
    playerObj.modelName = modelName;
    console.log("Model applied:", modelName);
  }
};

/* ---------- New 'cool' weapons with boss-tier effects/looks ---------- */
const coolWeapons = [];

/* A: Voidhammer (melee that summons small void nodes on heavy hits) */
coolWeapons.push({
  name:"voidhammer",
  descriptionFunction(){ return "A heavy hammer that creates void nodes on heavy impacts, pulling enemies and spawning a small void wraith."; },
  ammo:Infinity, ammoPack:Infinity, have:false, durability:500, maxDurability:500,
  do:safe(function(){
    // visual heavy swing particle when used is left to engine collision hooks
  }),
  onHeavyHit:safe(function(target, pos){
    // spawn a tiny void node that pulls and then spawns a wraith
    ringPulse(pos, 60, 28, "rgba(80,0,120,0.9)", 80);
    if (typeof mobs !== 'undefined' && typeof mobs.spawn === 'function'){
      mobs.spawn({ type:"void-wraith", position:pos, team:"player", lifetime:600, hp:400, damage:18 });
    } else {
      spawnMob({ type:"void-wraith", position:pos, hp:400, damage:18, lifetime:600 });
    }
  })
});

/* B: Aether Bow (charged arrow that calls down an ally strike) */
coolWeapons.push({
  name:"aether-bow",
  descriptionFunction(){ return "Charge to fire arrows that call down a small allied sentinel strike on impact."; },
  ammo:40, ammoPack:4, defaultAmmoPack:4, cooldown:12, chargeLevel:0, maxCharge:80, charging:false,
  do:safe(function(){ if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel+2); }),
  charge:safe(function(start){ this.charging = !!start; }),
  release:safe(function(pos){
    // spawn sentinel ally at impact point
    ringPulse(pos, 40, 20, "#9ef0ff", 45);
    spawnMob({ type:"aether-sentinel", position:pos, hp:600, damage:22, radius:60, lifetime:900 });
    this.chargeLevel = 0; this.charging = false;
  }),
  fire:safe(function(targetPos){
    if (this.ammo !== Infinity && this.ammo<=0) return;
    if (this.ammo !== Infinity) this.ammo--;
    const pos = targetPos || { x: player.position.x + Math.cos(m.angle)*400, y: player.position.y + Math.sin(m.angle)*400 };
    // spawn arrow + particle
    ringPulse(pos, 30, 12, "#9ef0ff", 30);
    this.release(pos);
  })
});

/* C: Beacon of Binding (creates a tether field that buffs summons) */
coolWeapons.push({
  name:"beacon-binding",
  descriptionFunction(){ return "Place a beacon that buffs nearby summons (attack speed + damage).", },
  ammo:3, ammoPack:1, cooldown:1800, cycle:0, have:false,
  do:safe(function(){ if (this.cycle>0) this.cycle--; }),
  fire:safe(function(){
    if (this.cycle>0 || this.ammo<=0) return;
    this.ammo--; this.cycle=this.cooldown;
    const pos = { x: player.position.x + Math.cos(m.angle)*220, y: player.position.y + Math.sin(m.angle)*220 };
    // apply buff ephemera
    if (typeof simulation !== 'undefined' && simulation.ephemera){
      const buffName = "beacon-binding-"+Date.now();
      simulation.ephemera.push({ name: buffName, do(){ 
        for (let i=0;i<(mob||[]).length;i++){ const mm=mob[i]; if (mm && mm.alive && mm.isAlly){ const d=Vector.magnitude(Vector.sub(mm.position,pos)); if (d<600){ mm.damage = (mm.damage || 5) * 1.2; mm.attackSpeed = (mm.attackSpeed||1)*1.25; particleTrail({x:mm.position.x,y:mm.position.y,life:20,color:"#7fffd4",radius:10}); } } } 
      } });
    }
    ringPulse(pos, 120, 36, "#7fffd4", 90);
  })
});

/* ---------- Auto-install/export ---------- */
if (typeof b !== 'undefined' && b.guns){
  bossSummonWeapons.forEach(w=>{ if(!b.guns[w.name]) b.guns[w.name]=w; });
  coolWeapons.forEach(w=>{ if(!b.guns[w.name]) b.guns[w.name]=w; });
  window.bossAllies = bossAllies;
  window.summonCustomization = customization;
  console.log("bossSummonWeapons & coolWeapons installed into b.guns; customization exposed as window.summonCustomization");
} else {
  window.bossSummonWeapons = bossSummonWeapons;
  window.coolWeapons = coolWeapons;
  window.bossAllies = bossAllies;
  window.summonCustomization = customization;
  console.log("bossSummonWeapons, coolWeapons, bossAllies, and summonCustomization exported on window");
}

})();