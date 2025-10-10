(function(){
/*
  gorushima_weapons.js
  34 Gorōshima-inspired weapons, relics, and signature powers.
  - Matches the lightweight object shape used in your sword.js / scythe.js:
      { name, descriptionFunction, ammo, ammoPack, have, fire()/do()/charge()/transform() }
  - Mixes dark/serious tone with over-the-top flashy abilities as requested.
  - Auto-installs into b.guns if available; otherwise exports window.gorushimaWeapons.
  - Each ability uses simple console stubs for you to hook into your engine.
*/

const gorushimaWeapons = [
  { name: "trashborn-cleaver", descriptionFunction(){return "A jagged cleaver forged from ruin-metal; corrodes armor on hit."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Trashborn Cleaver swung")} },
  { name: "necro-scythe", descriptionFunction(){return "Long scythe that siphons life to feed a growing shadow aura."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Necro-Scythe reaped")} },
  { name: "junkrifle-mk1", descriptionFunction(){return "Makeshift rifle that fires compressed scrap shards — ricochets wildly."}, ammo:90, ammoPack:5, have:false, fire(){console.log("JunkRifle Mk1 fired")} },
  { name: "lantern-of-ashes", descriptionFunction(){return "Portable lantern that spawns ghostly embers to mark and weaken foes."}, ammo:20, ammoPack:2, have:false, fire(){console.log("Lantern of Ashes lit")} },
  { name: "goroshield", descriptionFunction(){return "Tattered shield that momentarily turns projectiles into drifting trash."}, ammo:30, ammoPack:2, have:false, do(){console.log("Goroshield parried")} },
  { name: "scrap-saw", descriptionFunction(){return "Circular sawblade on a chain; high DPS for close quarters."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Scrap Saw spun")} },
  { name: "plague-harp", descriptionFunction(){return "A cursed string instrument — pluck to send discordant sonic bolts."}, ammo:60, ammoPack:3, have:false, fire(){console.log("Plague Harp strummed")} },
  { name: "ruin-glaive", descriptionFunction(){return "Glaive with a living edge; each hit spawns a small revenant."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Ruin Glaive slashed")} },
  { name: "magnetized-grapple", descriptionFunction(){return "Grapple that pulls enemies or throws metallic trash at them."}, ammo:40, ammoPack:3, have:false, fire(){console.log("Magnetized Grapple launched")} },
  { name: "corruptor-pulse", descriptionFunction(){return "Short-range pulse that corrupts enemy buffs into debuffs."}, ammo:50, ammoPack:4, have:false, fire(){console.log("Corruptor Pulse emitted")} },
  { name: "waste-thrower", descriptionFunction(){return "Sprays toxic scrap slurry in a cone; leaves hazardous ground."}, ammo:200, ammoPack:6, have:false, fire(){console.log("Waste Thrower sprayed")} },
  { name: "twin-boy-echo", descriptionFunction(){return "Summon a spectral twin to mimic attacks for a short time."}, ammo:8, ammoPack:1, have:false, do(){console.log("Twin Boy Echo summoned")} },
  { name: "garbage-gnasher", descriptionFunction(){return "Heavy bite-melee cannon that chews through shields."}, ammo:12, ammoPack:2, have:false, fire(){console.log("Garbage Gnasher bit down")} },
  { name: "scrapstorm", descriptionFunction(){return "Unleash a hurricane of razor scrap that orbits then slams targets."}, ammo:6, ammoPack:1, have:false, fire(){console.log("Scrapstorm released")} },
  { name: "neon-curse-blade", descriptionFunction(){return "Blade of flickering neon; marks enemies and amplifies incoming damage."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Neon Curse Blade sliced")} },
  { name: "trash-void-launcher", descriptionFunction(){return "Launches a compressed void canister that creates a small singularity."}, ammo:3, ammoPack:1, have:false, fire(){console.log("Trash Void Launcher fired")} },
  { name: "cinder-ward", descriptionFunction(){return "Place a ward that burns corruption into passersby and heals allies slightly."}, ammo:10, ammoPack:1, have:false, do(){console.log("Cinder Ward placed")} },
  { name: "bone-whisper", descriptionFunction(){return "Whisper to nearby bones; they rise and fight for you briefly."}, ammo:5, ammoPack:1, have:false, do(){console.log("Bone Whisper commanded")} },
  { name: "ruined-scout", descriptionFunction(){return "A thrown mechanical scout that tags enemies and explodes on death."}, ammo:10, ammoPack:2, have:false, fire(){console.log("Ruined Scout deployed")} },
  { name: "trash-armor-burst", descriptionFunction(){return "Sacrifice part of your armor to explode outward, stunning foes."}, ammo:3, ammoPack:1, have:false, do(){console.log("Trash Armor Burst triggered")} },
  { name: "garbagemancer-transmute", descriptionFunction(){return "Turn nearby debris into temporary weapons or cover."}, ammo:20, ammoPack:2, have:false, do(){console.log("Garbagemancer transmutation")} },
  { name: "cobalt-spike", descriptionFunction(){return "Thrown crystalline spike that anchors and drains enemy energy."}, ammo:24, ammoPack:3, have:false, fire(){console.log("Cobalt Spike hurled")} },
  { name: "soul-smelter", descriptionFunction(){return "Melee hammer that melts lingering souls into explosive slag."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Soul Smelter slammed")} },
  { name: "venom-net", descriptionFunction(){return "Net of sticky toxic filaments that slows and damages over time."}, ammo:15, ammoPack:2, have:false, fire(){console.log("Venom Net cast")} },
  { name: "trashwave-barrage", descriptionFunction(){return "Rapid-fire volley of compacted garbage pellets with knockback."}, ammo:180, ammoPack:6, have:false, fire(){console.log("Trashwave Barrage raining")} },
  { name: "geist-form", descriptionFunction(){return "Temporary cursed transformation — faster, but slowly consumes HP."}, ammo:3, ammoPack:1, have:false, transform(){console.log("Geist Form activated")} },
  { name: "radiant-broken-saber", descriptionFunction(){return "Saber that emits brief radiant flares, stunning on critical hits."}, ammo:Infinity, ammoPack:Infinity, have:false, do(){console.log("Radiant Broken Saber flashed")} },
  { name: "overload-rift", descriptionFunction(){return "Overcharge a relic to rip a rift that pulls enemies inward before exploding."}, ammo:2, ammoPack:1, have:false, charge(){console.log("Overload Rift charging")}, fire(){console.log("Overload Rift detonated")} },
  { name: "trash-sigil", descriptionFunction(){return "Inscribed sigil that buffs allies within its circle with grim resilience."}, ammo:8, ammoPack:1, have:false, do(){console.log("Trash Sigil inscribed")} },
  { name: "echo-requiem", descriptionFunction(){return "Channel the twins' shared grief to emit a devastating sonic requiem."}, ammo:1, ammoPack:1, have:false, charge(){console.log("Echo Requiem charging")}, fire(){console.log("Echo Requiem unleashed")} },
  { name: "discarded-guardian", descriptionFunction(){return "Summon a hulking guardian built from city waste to protect you."}, ammo:1, ammoPack:1, have:false, do(){console.log("Discarded Guardian risen")} },
  { name: "trashborn-meteor", descriptionFunction(){return "Call down a storm of compacted refuse meteors in a wide area."}, ammo:1, ammoPack:1, have:false, fire(){console.log("Trashborn Meteor showered")} }
];

// Attempt to install into b.guns, else export to window
try {
  if (typeof b !== "undefined" && Array.isArray(b.guns)) {
    gorushimaWeapons.forEach(w => {
      if (!b.guns.some(g => g.name === w.name)) b.guns.push(w);
    });
    console.log(`%cInstalled ${gorushimaWeapons.length} Gorōshima weapons into b.guns`, "color: teal");
  } else {
    window.gorushimaWeapons = gorushimaWeapons;
    console.warn("b.guns not found — exported `gorushimaWeapons` to window for manual import.");
  }
} catch (err) {
  window.gorushimaWeapons = gorushimaWeapons;
  console.error("Error installing directly; exported `gorushimaWeapons` anyway.", err);
}

})();