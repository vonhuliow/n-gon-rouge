(function(){
/*
  dragonballz_weapons.js
  30 Dragon Ball Z–inspired weapons & ki techniques.
  - Each entry matches the simple object shape used in your sword.js / scythe.js style:
    { name, descriptionFunction, ammo, ammoPack, have, fire()/do(), optional charge() }
  - Intentionally uses simple stubs for fire()/do() so you can hook into your engine's effects.
  - Auto-installs into b.guns if available, otherwise exports as window.dragonballzWeapons.
  - NOTE: These are fan-inspired items modeled for modding use.
*/

const dragonballzWeapons = [
  { name: "kamehameha", descriptionFunction(){return "Classic concentrated ki wave. Charge to increase power."}, ammo:100, ammoPack:5, have:false,
    charge(level=1){console.log(`kamehameha charging x${level}`)},
    fire(power=1){console.log("KAMEHAMEHA fired with power", power)}
  },
  { name: "big-bang-attack", descriptionFunction(){return "Massive single-shot energy blast with extreme knockback."}, ammo:6, ammoPack:1, have:false,
    fire(){console.log("Big Bang Attack unleashed")}
  },
  { name: "final-flash", descriptionFunction(){return "Huge focused beam — long charge and devastating output."}, ammo:4, ammoPack:1, have:false,
    charge(){console.log("Final Flash charging")},
    fire(){console.log("Final Flash fired")}
  },
  { name: "spirit-bomb", descriptionFunction(){return "Gather ambient energy, create a massive explosive sphere (slow to build)."}, ammo:1, ammoPack:1, have:false,
    charge(){console.log("Spirit Bomb gathering energy")},
    fire(){console.log("Spirit Bomb released")}
  },
  { name: "galick-gun", descriptionFunction(){return "Powerful purple energy wave; medium charge time."}, ammo:8, ammoPack:1, have:false,
    fire(){console.log("Galick Gun fired")}
  },
  { name: "destructo-disc", descriptionFunction(){return "Fast thrown ki disc that slices through defenses."}, ammo:12, ammoPack:2, have:false,
    fire(){console.log("Destructo Disc thrown")}
  },
  { name: "special-beam-cannon", descriptionFunction(){return "Piercing focused beam that drills through targets."}, ammo:6, ammoPack:1, have:false,
    charge(){console.log("Special Beam Cannon charging")},
    fire(){console.log("Special Beam Cannon fired")}
  },
  { name: "solar-flare", descriptionFunction(){return "Flash that blinds enemies temporarily."}, ammo:20, ammoPack:2, have:false,
    fire(){console.log("Solar Flare activated")}
  },
  { name: "instant-transmission", descriptionFunction(){return "Teleport short distances to target enemy or waypoint."}, ammo:30, ammoPack:3, have:false,
    do(target){console.log("Instant Transmission to", target)}
  },
  { name: "kaio-ken-burst", descriptionFunction(){return "Short-lived power multiplier increasing damage and speed."}, ammo:10, ammoPack:2, have:false,
    do(level=2){console.log(`Kaio-ken x${level} active`)}
  },
  { name: "super-saiyan-aura", descriptionFunction(){return "Toggleable transformation that boosts stats dramatically."}, ammo:Infinity, ammoPack:Infinity, have:false,
    do(){console.log("Super Saiyan transformation triggered")}
  },
  { name: "final-shine", descriptionFunction(){return "Concentrated beam charged in palm — high damage single target."}, ammo:4, ammoPack:1, have:false,
    charge(){console.log("Final Shine charging")},
    fire(){console.log("Final Shine fired")}
  },
  { name: "masenko", descriptionFunction(){return "Rapid mid-power ki blast fired from hand."}, ammo:80, ammoPack:4, have:false,
    fire(){console.log("Masenko fired")}
  },
  { name: "burning-attack", descriptionFunction(){return "Flamboyant combo finishing move that ignites enemies."}, ammo:Infinity, ammoPack:Infinity, have:false,
    do(){console.log("Burning Attack executed")}
  },
  { name: "hellzone-grenade", descriptionFunction(){return "Launches homing ki orbs that encircle and explode."}, ammo:12, ammoPack:2, have:false,
    fire(){console.log("Hellzone Grenade launched")}
  },
  { name: "ki-blast-standard", descriptionFunction(){return "Simple quick ki projectile for basic combat."}, ammo:999, ammoPack:20, have:false,
    fire(){console.log("Ki blast fired")}
  },
  { name: "energy-sword", descriptionFunction(){return "Short melee sword composed of condensed ki energy."}, ammo:Infinity, ammoPack:Infinity, have:false,
    do(){console.log("Energy Sword slashed")}
  },
  { name: "power-pole", descriptionFunction(){return "Extendable pole weapon for long-reach melee."}, ammo:Infinity, ammoPack:Infinity, have:false,
    do(){console.log("Power Pole extended and struck")}
  },
  { name: "electric-shockwave", descriptionFunction(){return "Ground-pulse that electrifies nearby enemies."}, ammo:30, ammoPack:3, have:false,
    do(){console.log("Electric Shockwave released")}
  },
  { name: "afterimage-step", descriptionFunction(){return "Create brief afterimages and dash behind foes."}, ammo:40, ammoPack:4, have:false,
    do(){console.log("Afterimage dash performed")}
  },
  { name: "scatter-beams", descriptionFunction(){return "Multiple small ki shots spread in a cone."}, ammo:100, ammoPack:5, have:false,
    fire(){console.log("Scatter Beams fired")}
  },
  { name: "energy-absorb-gauntlet", descriptionFunction(){return "Absorb incoming energy shots and convert to health or ammo."}, ammo:0, ammoPack:0, have:false,
    do(){console.log("Energy absorbed")}
  },
  { name: "final-kamehameha", descriptionFunction(){return "Combined ultimate beam — very long charge with massive damage."}, ammo:2, ammoPack:1, have:false,
    charge(){console.log("Final Kamehameha charging")},
    fire(){console.log("Final Kamehameha unleashed")}
  },
  { name: "destruction-sphere", descriptionFunction(){return "High-energy orb that homes then detonates violently."}, ammo:6, ammoPack:1, have:false,
    fire(){console.log("Destruction Sphere launched")}
  },
  { name: "telekinesis-push", descriptionFunction(){return "Use ki to push or throw enemies at range."}, ammo:60, ammoPack:3, have:false,
    fire(){console.log("Telekinesis Push activated")}
  },
  { name: "spirit-sword", descriptionFunction(){return "Summon spectral blades around you for an area slash."}, ammo:20, ammoPack:2, have:false,
    do(){console.log("Spirit Swords summoned")}
  },
  { name: "energy-drain", descriptionFunction(){return "Drain small amount of enemy ki to refill your ammo."}, ammo:0, ammoPack:0, have:false,
    do(){console.log("Energy drain executed")}
  },
  { name: "galactic-punch", descriptionFunction(){return "Charged punch that creates a small shock crater on impact."}, ammo:10, ammoPack:1, have:false,
    do(){console.log("Galactic Punch landed")}
  },
  { name: "scouter-burst", descriptionFunction(){return "Briefly scans enemies and marks weak points; can overload electronics."}, ammo:50, ammoPack:5, have:false,
    fire(){console.log("Scouter Burst scan")}
  }
];

// Install into b.guns if present, else expose to window
try {
  if (typeof b !== "undefined" && Array.isArray(b.guns)) {
    dragonballzWeapons.forEach(w => {
      if (!b.guns.some(g => g.name === w.name)) b.guns.push(w);
    });
    console.log(`%cInstalled ${dragonballzWeapons.length} DBZ-inspired weapons into b.guns`, "color: orange");
  } else {
    window.dragonballzWeapons = dragonballzWeapons;
    console.warn("b.guns not found — exported `dragonballzWeapons` to window for manual import.");
  }
} catch (err) {
  window.dragonballzWeapons = dragonballzWeapons;
  console.error("Error installing directly; exported `dragonballzWeapons` anyway.", err);
}

})();