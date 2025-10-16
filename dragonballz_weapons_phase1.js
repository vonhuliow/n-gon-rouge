(function(){
/*
  dragonballz_weapons_phase1.js
  Phase 1: Full physics-backed implementations for 6 DBZ weapons + templates for rest.
*/

function installEphemeraOnce(weapon) {
  if (weapon.haveEphemera) return;
  weapon.haveEphemera = true;
  if (typeof simulation !== 'undefined' && simulation.ephemera) simulation.ephemera.push({ name: weapon.name, do() { if (weapon._tick) weapon._tick(); } });
}
function applyPhysicsSafe(fn){ return function(){ if (typeof Matter !== 'undefined' && typeof Bodies !== 'undefined') { try { fn.apply(this, arguments); } catch(e){ console.error("physics error", e); } } else { fn.apply(this, arguments); } } }
function simpleDamage(target, amt){ if (target && typeof target.damage === 'function') target.damage(amt); else console.log("would deal", amt, "to", target); }

const dragonPhase1 = [];

/* kamehameha */
dragonPhase1.push({
  name: "kamehameha",
  descriptionFunction(){ return "Classic concentrated ki wave. Charge to increase power."; },
  ammo:100, ammoPack:5, have:false, chargeLevel:0, charging:false, maxCharge:300, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 4); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    const power = Math.max(1, this.chargeLevel/40);
    if (typeof Bodies === 'undefined') { console.log("Kamehameha released power", power); this.chargeLevel=0; this.charging=false; return; }
    const x = player.position.x + Math.cos(m.angle)*60, y = player.position.y + Math.sin(m.angle)*60;
    const beam = Bodies.rectangle(x + Math.cos(m.angle)*200, y + Math.sin(m.angle)*200, 400*power, 40*power, spawn.propsIsNotHoldable);
    beam.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    beam.customName = "kamehameha-beam";
    Composite.add(engine.world, beam);
    Matter.Body.setVelocity(beam, { x: Math.cos(m.angle)*35*power, y: Math.sin(m.angle)*35*power });
    if (typeof bullet !== 'undefined') bullet.push(beam);
    setTimeout(()=>{ if (engine && beam) Composite.remove(engine.world, beam); }, 400 + power*40);
    this.chargeLevel=0; this.charging=false;
  })
});

/* final-flash */
dragonPhase1.push({
  name: "final-flash",
  descriptionFunction(){ return "Huge focused beam — long charge and devastating output."; },
  ammo:4, ammoPack:1, have:false, chargeLevel:0, charging:false, maxCharge:500, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 6); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    const power = Math.max(1, this.chargeLevel/80);
    if (typeof Bodies === 'undefined') { console.log("Final Flash release", power); this.chargeLevel=0; this.charging=false; return; }
    const x = player.position.x + Math.cos(m.angle)*300, y = player.position.y + Math.sin(m.angle)*300;
    const beam = Bodies.rectangle(x, y, 700*power, 60*power, spawn.propsIsNotHoldable);
    beam.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    beam.customName = "final-flash-beam";
    Composite.add(engine.world, beam);
    Matter.Body.setVelocity(beam, { x: Math.cos(m.angle)*45*power, y: Math.sin(m.angle)*45*power });
    if (typeof bullet !== 'undefined') bullet.push(beam);
    setTimeout(()=>{ if (engine && beam) Composite.remove(engine.world, beam); }, 600 + power*60);
    this.chargeLevel=0; this.charging=false;
  })
});

/* spirit-bomb */
dragonPhase1.push({
  name: "spirit-bomb",
  descriptionFunction(){ return "Gather ambient energy, create a massive explosive sphere (slow to build)."; },
  ammo:1, ammoPack:1, have:false, chargeLevel:0, charging:false, maxCharge:1200, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 2); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    const power = Math.max(1, this.chargeLevel/200);
    if (typeof Bodies === 'undefined') { console.log("Spirit Bomb released (no engine) power", power); this.chargeLevel=0; this.charging=false; return; }
    const x = player.position.x + Math.cos(m.angle)*100, y = player.position.y + Math.sin(m.angle)*100;
    const orb = Bodies.circle(x, y, 40 + 20*power, spawn.propsIsNotHoldable);
    orb.customName = "spirit-bomb";
    orb.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, orb);
    if (typeof bullet !== 'undefined') bullet.push(orb);
    const id = setInterval(()=>{
      if (!orb || !engine) { clearInterval(id); return; }
      let nearest=null; let nd=1e9;
      for (let i=0;i<(mob||[]).length;i++){ if (mob[i]&&mob[i].alive){ const d=Vector.magnitude(Vector.sub(mob[i].position, orb.position)); if (d<nd){ nd=d; nearest=mob[i]; } } }
      if (nearest) { const dir = Vector.normalise(Vector.sub(nearest.position, orb.position)); Matter.Body.applyForce(orb, orb.position, { x: dir.x*0.0008*power, y: dir.y*0.0008*power }); }
    }, 100);
    setTimeout(()=>{
      for (let i=0;i<(mob||[]).length;i++) if (mob[i] && mob[i].alive){ const d=Vector.magnitude(Vector.sub(mob[i].position, orb.position)); if (d < 600 + 120*power) simpleDamage(mob[i], 0.18 * power); }
      if (engine && orb) Composite.remove(engine.world, orb);
      clearInterval(id);
    }, 1600 + power*300);
    this.chargeLevel=0; this.charging=false;
  })
});

/* destructo-disc */
dragonPhase1.push({
  name: "destructo-disc",
  descriptionFunction(){ return "Fast thrown ki disc that slices through defenses."; },
  ammo:12, ammoPack:2, have:false, cooldown:6, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); }),
  fire: applyPhysicsSafe(function(){
    if (this.ammo !== Infinity && this.ammo <=0) { console.log("destructo: no ammo"); return; }
    if (this.ammo !== Infinity) this.ammo--;
    const x = player.position.x + Math.cos(m.angle)*50, y = player.position.y + Math.sin(m.angle)*50;
    const disc = Bodies.circle(x, y, 24, spawn.propsIsNotHoldable);
    disc.customName = "destructo-disc";
    disc.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, disc);
    Matter.Body.setVelocity(disc, { x: Math.cos(m.angle)*40, y: Math.sin(m.angle)*40 });
    if (typeof bullet !== 'undefined') bullet.push(disc);
  })
});

/* special-beam-cannon */
dragonPhase1.push({
  name: "special-beam-cannon",
  descriptionFunction(){ return "Piercing focused beam that drills through targets."; },
  ammo:6, ammoPack:1, have:false, chargeLevel:0, charging:false, maxCharge:300, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 5); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    const power = Math.max(1, this.chargeLevel/60);
    if (typeof Bodies === 'undefined') { console.log("special beam fired (no engine)", power); this.chargeLevel=0; this.charging=false; return; }
    const x = player.position.x + Math.cos(m.angle)*140, y = player.position.y + Math.sin(m.angle)*140;
    const beam = Bodies.rectangle(x, y, 800*power, 28*power, spawn.propsIsNotHoldable);
    beam.customName = "special-beam";
    beam.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, beam);
    Matter.Body.setVelocity(beam, { x: Math.cos(m.angle)*55*power, y: Math.sin(m.angle)*55*power });
    if (typeof bullet !== 'undefined') bullet.push(beam);
    setTimeout(()=>{ if (engine && beam) Composite.remove(engine.world, beam); }, 300 + power*60);
    this.chargeLevel=0; this.charging=false;
  })
});

/* final-kamehameha */
dragonPhase1.push({
  name: "final-kamehameha",
  descriptionFunction(){ return "Combined ultimate beam — very long charge with massive damage."; },
  ammo:2, ammoPack:1, have:false, chargeLevel:0, charging:false, maxCharge:800, haveEphemera:false,
  do: applyPhysicsSafe(function(){ installEphemeraOnce(this); if (this.charging) this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 8); }),
  charge(start=true){ this.charging = !!start; },
  release: applyPhysicsSafe(function(){
    const power = Math.max(1, this.chargeLevel/120);
    if (typeof Bodies === 'undefined') { console.log("Final Kamehameha released (no engine)", power); this.chargeLevel=0; this.charging=false; return; }
    const x = player.position.x + Math.cos(m.angle)*400, y = player.position.y + Math.sin(m.angle)*400;
    const beam = Bodies.rectangle(x, y, 900*power, 120*power, spawn.propsIsNotHoldable);
    beam.customName = "final-kamehameha-beam";
    beam.collisionFilter = { category: (cat && cat.bullet) || 0, mask: (cat && (cat.mob|cat.body)) || 0 };
    Composite.add(engine.world, beam);
    Matter.Body.setVelocity(beam, { x: Math.cos(m.angle)*60*power, y: Math.sin(m.angle)*60*power });
    if (typeof bullet !== 'undefined') bullet.push(beam);
    setTimeout(()=>{ if (engine && beam) Composite.remove(engine.world, beam); }, 1000 + power*80);
    this.chargeLevel=0; this.charging=false;
  })
});

if (typeof b !== 'undefined' && b.guns) { dragonPhase1.forEach(w=>{ if(!b.guns[w.name]) b.guns[w.name]=w; }); console.log("dragonPhase1 installed into b.guns"); }
else { window.dragonPhase1 = dragonPhase1; console.log("dragonPhase1 exported"); }

})();