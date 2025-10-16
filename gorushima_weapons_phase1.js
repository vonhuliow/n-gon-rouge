(function(){
/*
  gorushima_weapons_phase1.js
  Phase 1: Full physics-backed implementations for 6 Gorōshima weapons + templates for rest.
*/

function installEphemeraOnce(weapon) {
  if (weapon.haveEphemera) return;
  weapon.haveEphemera = true;
  if (typeof simulation !== 'undefined' && simulation.ephemera) {
    simulation.ephemera.push({ name: weapon.name, do() { if (weapon._tick) weapon._tick(); } });
  }
}
function applyPhysicsSafe(fn){ return function(){ if (typeof Matter !== 'undefined' && typeof Bodies !== 'undefined') { try { fn.apply(this, arguments); } catch(e){ console.error("physics error", e); } } else { fn.apply(this, arguments); } } }
function simpleDamage(target, amt){ if (target && typeof target.damage === 'function') target.damage(amt); else console.log("would deal", amt, "to", target); }

const gorushimaPhase1 = [];

/* necro-scythe */
gorushimaPhase1.push({
  name: "necro-scythe",
  descriptionFunction(){ return "Long scythe that siphons life to feed a growing shadow aura."; },
  ammo: Infinity, ammoPack: Infinity, have:false,
  cycle: 0, scythe: undefined, bladeSegments: [], bladeTrails: [], durability:300, maxDurability:300, haveEphemera:false,
  do: applyPhysicsSafe(function(){
    installEphemeraOnce(this);
    this.cycle++;
    if (this.scythe && player) {
      const ang = (m && m.angle) || 0;
      Matter.Body.setPosition(this.scythe, { x: player.position.x + Math.cos(ang) * 60, y: player.position.y + Math.sin(ang) * 60 });
      Matter.Body.setAngularVelocity(this.scythe, 0.2);
      // collision check with mobs
      for (let i=0;i<(mob||[]).length;i++){
        const mb = mob[i];
        if (!mb || !mb.alive) continue;
        if (typeof Matter !== 'undefined' && Matter.Query.collides(this.scythe, [mb]).length>0) {
          const dmg = 0.08 * (m && m.dmgScale || 1);
          simpleDamage(mb, dmg);
          if (m) { m.health = Math.min(m.maxHealth || 100, (m.health||100) + dmg*0.35); }
          this.durability = Math.max(0, this.durability-1);
        }
      }
    }
  }),
  activate: applyPhysicsSafe(function(){
    if (this.scythe) return;
    const x = player.position.x, y = player.position.y;
    const handle = Bodies.rectangle(x, y, 20, 140, spawn.propsIsNotHoldable);
    const blade = Bodies.rectangle(x, y-90, 20, 260, spawn.propsIsNotHoldable);
    const scythe = Body.create({ parts: [handle, blade] });
    scythe.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, scythe);
    Matter.Body.setPosition(scythe, {x: x + 60, y: y});
    this.scythe = scythe;
    this.bladeSegments = [blade];
    this.bladeTrails = [[]];
  }),
  deactivate: applyPhysicsSafe(function(){
    if (this.scythe && typeof Composite !== 'undefined') {
      Composite.remove(engine.world, this.scythe);
      this.scythe.parts.forEach(p=>{ const idx = (typeof bullet !== 'undefined') ? bullet.indexOf(p) : -1; if(idx!==-1) bullet.splice(idx,1); });
      this.scythe = undefined; this.bladeSegments = []; this.bladeTrails = [];
    }
  })
});

/* scrap-saw */
gorushimaPhase1.push({
  name: "scrap-saw",
  descriptionFunction(){ return "Circular sawblade on a chain; high DPS for close quarters."; },
  ammo: Infinity, ammoPack: Infinity, have:false,
  cycle:0, saw:undefined, durability:200, maxDurability:200, haveEphemera:false,
  do: applyPhysicsSafe(function(){
    installEphemeraOnce(this);
    this.cycle++;
    if (this.saw) {
      Matter.Body.setAngularVelocity(this.saw, 0.6 + Math.sin(this.cycle/6)*0.3);
      for (let i=0;i<(mob||[]).length;i++){
        const mb = mob[i];
        if (!mb||!mb.alive) continue;
        if (typeof Matter !== 'undefined' && Matter.Query.collides(this.saw, [mb]).length>0) {
          simpleDamage(mb, 0.07*(m&&m.dmgScale||1));
          this.durability = Math.max(0, this.durability-0.5);
        }
      }
    }
  }),
  throw: applyPhysicsSafe(function(){
    if (this.saw) return;
    const s = Bodies.circle(player.position.x + Math.cos(m.angle)*80, player.position.y + Math.sin(m.angle)*80, 50, spawn.propsIsNotHoldable);
    s.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, s);
    Matter.Body.setVelocity(s, { x: Math.cos(m.angle)*30, y: Math.sin(m.angle)*30 });
    this.saw = s; if (typeof bullet !== 'undefined') bullet.push(s);
  }),
  recall: applyPhysicsSafe(function(){
    if (!this.saw) return;
    Matter.Body.setVelocity(this.saw, { x: (player.position.x - this.saw.position.x)*0.2, y: (player.position.y - this.saw.position.y)*0.2 });
  })
});

/* ruin-glaive */
gorushimaPhase1.push({
  name: "ruin-glaive",
  descriptionFunction(){ return "Glaive with a living edge; each hit spawns a small revenant."; },
  ammo: Infinity, ammoPack: Infinity, have:false,
  durability:220, maxDurability:220, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); }),
  onHit: applyPhysicsSafe(function(target){
    simpleDamage(target, 0.12*(m && m.dmgScale || 1));
    if (typeof mobs !== 'undefined' && typeof mobs.spawn === 'function') mobs.spawn({ type: 'revenant', position: target.position, lifetime: 600 });
    else console.log("spawn revenant at", target && target.position);
    this.durability = Math.max(0, this.durability-1);
  })
});

/* junkrifle-mk1 */
gorushimaPhase1.push({
  name: "junkrifle-mk1",
  descriptionFunction(){ return "Makeshift rifle that fires compressed scrap shards — ricochets wildly."; },
  ammo:90, ammoPack:5, defaultAmmoPack:5, have:false, cooldown:6, cycle:0, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); this.cycle++; }),
  fire: applyPhysicsSafe(function(power){
    if (this.ammo !== Infinity && this.ammo <= 0) { console.log("junkrifle: no ammo"); return; }
    if (this.ammo !== Infinity) this.ammo--;
    const x = player.position.x + Math.cos(m.angle)*40, y = player.position.y + Math.sin(m.angle)*40;
    const shard = Bodies.polygon(x, y, 3, 8, spawn.propsIsNotHoldable);
    shard.customName = "junk-shard";
    shard.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, shard);
    const speed = 25 + (power||0)*10;
    Matter.Body.setVelocity(shard, { x: Math.cos(m.angle)*speed + (Math.random()-0.5)*6, y: Math.sin(m.angle)*speed + (Math.random()-0.5)*6 });
    shard.do = function(){};
    if (typeof bullet !== 'undefined') bullet.push(shard);
  })
});

/* trash-void-launcher */
gorushimaPhase1.push({
  name: "trash-void-launcher",
  descriptionFunction(){ return "Launches a compressed void canister that creates a small singularity."; },
  ammo:3, ammoPack:1, have:false, cycle:0, activeVoid:undefined, haveEphemera:false,
  do: applyPhysicsSafe(function(){
    installEphemeraOnce(this);
    if (this.activeVoid) {
      for (let i=0;i<(mob||[]).length;i++){
        const mb = mob[i]; if (!mb||!mb.alive) continue;
        const dist = Vector.magnitude(Vector.sub(this.activeVoid.position, mb.position));
        if (dist < 500) {
          const unit = Vector.normalise(Vector.sub(this.activeVoid.position, mb.position));
          Matter.Body.applyForce(mb, mb.position, { x: unit.x * 0.0005, y: unit.y * 0.0005 });
        }
      }
    }
  }),
  fire: applyPhysicsSafe(function(){
    if (this.ammo !== Infinity && this.ammo <= 0) { console.log("void launcher: no ammo"); return; }
    if (this.ammo !== Infinity) this.ammo--;
    const x = player.position.x + Math.cos(m.angle)*60, y = player.position.y + Math.sin(m.angle)*60;
    const can = Bodies.circle(x, y, 40, spawn.propsIsNotHoldable);
    can.customName = "void-canister";
    can.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, can);
    Matter.Body.setVelocity(can, { x: Math.cos(m.angle)*18, y: Math.sin(m.angle)*18 });
    if (typeof bullet !== 'undefined') bullet.push(can);
    const self = this;
    setTimeout(function(){
      if (!can) return;
      if (typeof Composite !== 'undefined' && engine) Composite.remove(engine.world, can);
      const voidAttractor = Bodies.circle(can.position.x, can.position.y, 12, spawn.propsIsNotHoldable);
      voidAttractor.isSensor = true; voidAttractor.customName = "void-core";
      Composite.add(engine.world, voidAttractor);
      self.activeVoid = voidAttractor;
      setTimeout(function(){
        for (let i=0;i<(mob||[]).length;i++) if(mob[i] && mob[i].alive){
          const d = Vector.magnitude(Vector.sub(voidAttractor.position, mob[i].position));
          if (d < 650) simpleDamage(mob[i], 0.12);
        }
        if (engine && voidAttractor) Composite.remove(engine.world, voidAttractor);
        self.activeVoid = undefined;
      }, 900);
    }, 300);
  })
});

/* overload-rift */
gorushimaPhase1.push({
  name: "overload-rift",
  descriptionFunction(){ return "Overcharge a relic to rip a rift that pulls enemies inward before exploding."; },
  ammo:2, ammoPack:1, have:false, chargeLevel:0, charging:false, maxCharge:120, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 3); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    if (this.chargeLevel <= 0) return;
    const power = Math.max(1, this.chargeLevel/30);
    for (let i=0;i<(mob||[]).length;i++) if(mob[i] && mob[i].alive){
      const d = Vector.magnitude(Vector.sub(player.position, mob[i].position));
      if (d < 1600) {
        const force = Vector.normalise(Vector.sub(player.position, mob[i].position));
        Matter.Body.applyForce(mob[i], mob[i].position, { x: -force.x * 0.002 * power, y: -force.y * 0.002 * power });
        simpleDamage(mob[i], 0.05 * power);
      }
    }
    for (let i=0;i<(mob||[]).length;i++) if(mob[i] && mob[i].alive){
      const d = Vector.magnitude(Vector.sub(player.position, mob[i].position));
      if (d < 800) simpleDamage(mob[i], 0.12 * power);
    }
    this.chargeLevel = 0; this.charging = false;
  })
});

if (typeof b !== 'undefined' && b.guns) { gorushimaPhase1.forEach(w=>{ if(!b.guns[w.name]) b.guns[w.name]=w; }); console.log("gorushimaPhase1 installed into b.guns"); }
else { window.gorushimaPhase1 = gorushimaPhase1; console.log("gorushimaPhase1 exported"); }

})();