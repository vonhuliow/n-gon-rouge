(function(){
/*
  crazy_weapons_mod.js
  32 over-the-top guns & melees (some anime-themed) for use with the same modding style
  - Each weapon is a minimal object compatible with the b.guns array used in the uploaded files.
  - Objects include name, descriptionFunction, ammo properties, and simple do() or fire() stubs.
  - This file intentionally avoids heavy engine calls so you can drop it into your mod loader and iterate.
*/

const crazyWeapons = [
  { name: "voidrifle", descriptionFunction(){return "shoot concentrated void bolts that phase through walls."}, ammo:120, ammoPack:4, have:false, fire(){console.log("voidrifle fired")} },
  { name: "starshredder", descriptionFunction(){return "belt-fed plasma cannon that ejects star fragments."}, ammo:40, ammoPack:2, have:false, fire(){console.log("starshredder fired")} },
  { name: "neon-katana", descriptionFunction(){return "anime-energy blade that leaves neon trails and lifesteals."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("neon-katana swung")} },
  { name: "gravity-gun-x", descriptionFunction(){return "pick up enemies and fling them into orbit."}, ammo:30, ammoPack:1, have:false, fire(){console.log("gravity-gun-x fired")} },
  { name: "phase-scythe", descriptionFunction(){return "a scythe that phases between dimensions on each hit."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("phase-scythe active")} },
  { name: "aurablade", descriptionFunction(){return "short sword surrounded by rotating elemental shards."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("aurablade swung")} },
  { name: "rail-archer", descriptionFunction(){return "fires silent hyper-velocity arrows (gun-like reload)."}, ammo:24, ammoPack:3, have:false, fire(){console.log("rail-archer fired")} },
  { name: "omegashot", descriptionFunction(){return "single-shot doomsday round — huge recoil, huge boom."}, ammo:6, ammoPack:1, have:false, fire(){console.log("omegashot fired")} },
  { name: "plasma-shuriken", descriptionFunction(){return "throwing stars that explode into mini suns."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("plasma-shuriken thrown")} },
  { name: "synth-lance", descriptionFunction(){return "lance that charges and releases a piercing synth-wave."}, ammo:12, ammoPack:2, have:false, fire(){console.log("synth-lance charged")} },
  { name: "mirror-claws", descriptionFunction(){return "melee claws that create mirrored afterimages."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("mirror-claws slash")} },
  { name: "helios-burst", descriptionFunction(){return "rapid-fire sunblasts that blind mobs briefly."}, ammo:200, ammoPack:8, have:false, fire(){console.log("helios-burst fired")} },
  { name: "rift-hammer", descriptionFunction(){return "ground-slam hammer that opens short rifts."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("rift-hammer slammed")} },
  { name: "kuro-shock", descriptionFunction(){return "anime electric katana — chain lightning on hit."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("kuro-shock slash")} },
  { name: "chrono-pistol", descriptionFunction(){return "slows time for targets hit (short duration)."}, ammo:60, ammoPack:3, have:false, fire(){console.log("chrono-pistol fired")} },
  { name: "void-gauntlet", descriptionFunction(){return "melee gauntlet that teleports you to the struck enemy."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("void-gauntlet punch")} },
  { name: "polarity-rifle", descriptionFunction(){return "alternates between push and pull magnetic shots."}, ammo:90, ammoPack:3, have:false, fire(){console.log("polarity-rifle fired")} },
  { name: "meteor-mace", descriptionFunction(){return "swing to summon tiny meteor showers on impact."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("meteor-mace swung")} },
  { name: "shadow-glaive", descriptionFunction(){return "glaive that phases to shadow realm and back."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("shadow-glaive tossed")} },
  { name: "ripple-shot", descriptionFunction(){return "shots propagate as ripples, hitting multiple targets."}, ammo:150, ammoPack:5, have:false, fire(){console.log("ripple-shot fired")} },
  { name: "soulbrush", descriptionFunction(){return "paint-based melee that marks enemies; marks detonate."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("soulbrush swept")} },
  { name: "nebulon-cannon", descriptionFunction(){return "cannon that creates nebula fields slowing enemies."}, ammo:10, ammoPack:1, have:false, fire(){console.log("nebulon-cannon fired")} },
  { name: "ion-whip", descriptionFunction(){return "whip that arcs ion energy in a long curve."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("ion-whip snapped")} },
  { name: "sakura-flurry", descriptionFunction(){return "anime-themed sword that unleashes petal storms."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("sakura-flurry slice")} },
  { name: "hex-launcher", descriptionFunction(){return "launches hex-shaped mines that orbit enemies."}, ammo:36, ammoPack:2, have:false, fire(){console.log("hex-launcher fired")} },
  { name: "photon-rapier", descriptionFunction(){return "rapier with light-phase stabs (precision weapon)."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("photon-rapier thrust")} },
  { name: "dragonbreath", descriptionFunction(){return "short cone flamethrower with dragon-like visuals."}, ammo:300, ammoPack:10, have:false, fire(){console.log("dragonbreath fired")} },
  { name: "lumin-bow", descriptionFunction(){return "bow that charges into glowing spirit arrows."}, ammo:50, ammoPack:5, have:false, fire(){console.log("lumin-bow fired")} },
  { name: "quantum-scythe", descriptionFunction(){return "scythe that duplicates itself for twin attacks."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("quantum-scythe swung")} },
  { name: "celestial-fists", descriptionFunction(){return "melee fists that call down stars per combo."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("celestial-fists strike")} },
  { name: "anime-excalibur", descriptionFunction(){return "ultimate anime sword with dramatic charge attack."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("anime-excalibur unleashed")} }
];

// Attempt to push to b.guns if available, otherwise export as global for manual import.
try {
  if (typeof b !== "undefined" && Array.isArray(b.guns)) {
    crazyWeapons.forEach(w => {
      // Prevent duplicate by name
      if (!b.guns.some(g => g.name === w.name)) {
        b.guns.push(w);
      }
    });
    console.log(`%cInstalled ${crazyWeapons.length} crazy weapons into b.guns`, "color: purple");
  } else {
    // expose for manual usage
    window.crazyWeapons = crazyWeapons;
    console.warn("b.guns not found — exported `crazyWeapons` to window for manual import.");
  }
} catch (err) {
  window.crazyWeapons = crazyWeapons;
  console.error("Error installing directly; exported `crazyWeapons` anyway.", err);
}

})();