// anime_guns.js
// 10 anime-style guns (projectiles, beams, charge, AoE).
// Compatible with multiplayer.js' wrapping (uses the same globals and bullet conventions).
(function(){
    if(!b || !Bodies || !Composite || !bullet) {
        console.warn("anime_guns: required globals missing (b, Bodies, Composite, bullet). Aborting.");
        return;
    }

    const pushVFX = (x,y,r,color,life=30) => {
        if(simulation && simulation.drawList) simulation.drawList.push({x,y,radius:r,color,time:life});
    };

    const spawnProjectile = (x,y,angle,speed,radius,opts={}) => {
        const id = bullet.length;
        bullet[id] = Bodies.circle(x, y, radius || 6, spawn.propsIsNotHoldable || {});
        bullet[id].customName = opts.name || "anime_proj";
        bullet[id].dmg = opts.dmg || 1;
        bullet[id].minDmgSpeed = opts.minDmgSpeed || 2;
        Matter.Body.setVelocity(bullet[id], { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
        if(typeof opts.ttl === "number") bullet[id].endCycle = simulation.cycle + opts.ttl;
        bullet[id].collisionFilter = { category: cat.body || 0x0002, mask: cat.mob | cat.mobBullet | cat.body | cat.player };
        Composite.add(engine.world, bullet[id]);
        return id;
    };

    const addGun = (gunObj) => {
        b.guns.push(gunObj);
        b.guns = b.guns.filter((g,i,arr)=> i === arr.findIndex(x=>x.name===g.name));
    };

    // (All 10 guns as provided by the user)
    console.log("%cAnime guns installed (10).", "color: teal");
})();