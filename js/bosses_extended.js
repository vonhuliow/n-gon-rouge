
/*
  bosses_extended.js
  Adds 22 new bosses to the `spawn` namespace for the n-gon rogue-like.
  - Includes 6 advanced/anime-inspired bosses with more complex behaviors.
  - Usage: include this file after mob.js and spawn.js in your game.
  - Author: generated for user
*/

(function(){
  if (typeof spawn === "undefined" || typeof mobs === "undefined") {
    console.warn("spawn or mobs not found. bosses_extended.js must be loaded after mob.js and spawn.js");
    return;
  }

  // Utility: apply default boss properties
  function _setBossDefaults(me, opts = {}) {
    me.isBoss = true;
    me.leaveBody = true;
    me.isDropPowerUp = opts.dropPower !== undefined ? opts.dropPower : true;
    me.health = opts.health || 3;
    me.damageReduction = opts.damageReduction || 0.6;
    me.accelMag = opts.accelMag || 0.002 * (me.radius/50);
    me.memory = opts.memory || 300;
    me.seePlayerFreq = opts.seePlayerFreq || Math.floor(20 + 20*Math.random());
    me.blinkRate = opts.blinkRate || 60;
    me.blinkLength = opts.blinkLength || 600;
    me.tier = opts.tier || 0;
    me.onDamage = me.onDamage || function() {};
    me.onDeath = me.onDeath || function() {};
    me.damageReductionScale = opts.damageReductionScale || 0.003;
    me.damageReductionGoal = opts.damageReductionGoal || 0.25;
  }

  // Utility: simple teleport effect
  function _teleportTo(me, x, y) {
    simulation.drawList.push({x: me.position.x, y: me.position.y, radius: me.radius*1.5, color: "rgba(255,255,255,0.12)", time: 10});
    Matter.Body.setPosition(me, {x:x, y:y});
    simulation.drawList.push({x: x, y: y, radius: me.radius*2, color: "rgba(200,200,255,0.12)", time: 12});
  }

  // Utility: radial bullet salvo
  function _radialSalvo(me, count, speed, tier, spread=0) {
    const base = 2*Math.PI*Math.random();
    for (let i=0;i<count;i++){
      const a = base + (i/count)*(2*Math.PI) + (Math.random()-0.5)*spread;
      spawn.bullet(me.position.x + Math.cos(a)*me.radius, me.position.y + Math.sin(a)*me.radius, tier || 5, 8);
      const last = mob[mob.length-1];
      const v = {x: Math.cos(a)*speed, y: Math.sin(a)*speed};
      Matter.Body.setVelocity(last, v);
    }
  }

  // Utility: aimed burst
  function _aimedBurst(me, num, speed, tier, spread=0.15) {
    const a = Math.atan2(player.position.y - me.position.y, player.position.x - me.position.x);
    for (let i=0;i<num;i++){
      const off = a + (i-(num-1)/2)*spread + (Math.random()-0.5)*0.05;
      spawn.bullet(me.position.x + Math.cos(off)*me.radius, me.position.y + Math.sin(off)*me.radius, tier || 5, 8);
      const last = mob[mob.length-1];
      Matter.Body.setVelocity(last, {x: Math.cos(off)*speed, y: Math.sin(off)*speed});
    }
  }

  // Utility: spawn small helper mobs
  function _spawnHelpers(x,y,count,side=6,rad=12,color="rgba(200,200,255,0.6)"){
    for (let i=0;i<count;i++){
      spawn.randomMobByLevelsCleared(x + (Math.random()-0.5)*100, y + (Math.random()-0.5)*100);
      const m = mob[mob.length-1];
      if (m) {
        m.fill = color;
        m.radius = rad;
        Matter.Body.setVelocity(m, {x:(Math.random()-0.5)*8, y:(Math.random()-0.5)*8});
      }
    }
  }

  // ----------------------
  // Advanced / Anime-inspired bosses (6)
  // ----------------------

  // 1) Raijin - lightning teleporting storm lord
  spawn.raijin = function(x,y){
    mobs.spawn(x,y,8,60,"rgba(255,240,120,0.85)");
    const me = mob[mob.length-1];
    _setBossDefaults(me, {health:4, damageReduction:0.7, accelMag:0.0025});
    me.name = "Raijin";
    me.lightningCooldown = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        // rapid teleport + lightning arcs
        if (!(simulation.cycle % 140)) {
          // teleport near player
          const dx = (Math.random()-0.5)*400;
          const dy = (Math.random()-0.5)*300;
          _teleportTo(this, player.position.x + dx, player.position.y + dy);
        }
        // chain lightning every 60 cycles
        if (!(simulation.cycle % 60)) {
          // draw jagged lines to player and to nearby mobs
          simulation.drawList.push({x:this.position.x,y:this.position.y,radius:150,color:"rgba(200,220,255,0.06)",time:12});
          // aimed bursts of lightning bullets
          _aimedBurst(this, 5, 22, 6, 0.12);
          // small helpers
          if (Math.random()<0.12) _spawnHelpers(this.position.x, this.position.y, 2, 6, 10, "rgba(255,240,120,0.9)");
        }
      }
      // passive radial crackle
      if (!(simulation.cycle % 30)) _radialSalvo(this, 6, 6, 4, 0.3);
    };
    me.onDamage = function(dmg){
      if (Math.random() < 0.25) {
        // short teleport blink
        const nx = this.position.x + (Math.random()-0.5)*200;
        const ny = this.position.y + (Math.random()-0.5)*200;
        _teleportTo(this,nx,ny);
      }
    };
    me.onDeath = function(){
      // big lightning explosion
      _radialSalvo(this, 48, 14, 6, 0.5);
    };
    return me;
  };

  // 2) Chronos - time manipulator
  spawn.chronos = function(x,y){
    mobs.spawn(x,y,10,58,"rgba(200,220,255,0.85)");
    const me = mob[mob.length-1];
    _setBossDefaults(me, {health:4.5, damageReduction:0.75, accelMag:0.0015});
    me.name = "Chronos";
    me.timeFreezeCooldown = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle % 300)) {
          // Time freeze zone - slows bullets and mobs nearby massively for short cycles
          const range2 = Math.pow(700 + 200*Math.random(),2);
          for (let i=0;i<mob.length;i++){
            if (Vector.magnitudeSquared(Vector.sub(this.position,mob[i].position)) < range2) mobs.statusStun(mob[i],120);
          }
          for (let i=0;i<bullet.length;i++){
            // slow bullets by reducing velocity
            Matter.Body.setVelocity(bullet[i], {x: bullet[i].velocity.x*0.25, y: bullet[i].velocity.y*0.25});
          }
          simulation.timePlayerSkip(30); // small time skip for dramatic effect (existing API used elsewhere)
          simulation.drawList.push({x:this.position.x,y:this.position.y,radius:900,color:"rgba(160,200,255,0.06)",time:40});
        }
        // aimed time-lag pulse
        if (!(simulation.cycle % 80)) _aimedBurst(this, 6, 12, 5, 0.2);
      }
    };
    me.onDamage = function(dmg){
      // every once in a while reverse a small velocity vector of player
      if (Math.random() < 0.12) {
        player.force.x -= player.velocity.x*0.6;
        player.force.y -= player.velocity.y*0.6;
      }
    };
    me.onDeath = function(){ _radialSalvo(this,32,16,6,0.7); };
    return me;
  };

  // 3) Kage - shadow clone samurai (splits into clones)
  spawn.kage = function(x,y){
    mobs.spawn(x,y,7,52,"rgba(18,18,28,0.85)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:3.6, damageReduction:0.65, accelMag:0.002});
    me.name = "Kage";
    me.clonePhase = false;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        this.turnToFacePlayer();
        if (!(simulation.cycle % 40)) _aimedBurst(this,3,18,5,0.08);
        if (this.health < 1.5 && !this.clonePhase) {
          // split into clones
          this.clonePhase = true;
          const num = 4 + Math.floor(Math.random()*3);
          for (let i=0;i<num;i++){
            spawn.randomMobByLevelsCleared(this.position.x + (Math.random()-0.5)*120, this.position.y + (Math.random()-0.5)*120);
            const m = mob[mob.length-1];
            if (m) {
              m.fill = "rgba(40,40,60,0.9)";
              m.health = 0.6;
              m.leaveBody = false;
              m.damageReduction = 0.5;
              Matter.Body.setVelocity(m,{x:(Math.random()-0.5)*10,y:(Math.random()-0.5)*10});
            }
          }
          simulation.drawList.push({x:this.position.x,y:this.position.y,radius:200,color:"rgba(20,20,40,0.12)",time:20});
        }
      }
    };
    me.onDeath = function(){ _radialSalvo(this,40,14,6); };
    return me;
  };

  // 4) Nova Prime - energy accumulator -> nuke
  spawn.novaPrime = function(x,y){
    mobs.spawn(x,y,9,72,"rgba(255,200,220,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:6, damageReduction:0.7, accelMag:0.001});
    me.name = "Nova Prime";
    me.charge = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        // charge up slowly while firing small bursts
        if (!(simulation.cycle % 15)) _aimedBurst(this,2,12,5,0.05);
        if (simulation.cycle % 120 === 0) this.charge++;
        if (this.charge >= 6) {
          // release catastrophic blast
          _radialSalvo(this, 120, 20, 7, 0.6);
          simulation.drawList.push({x:this.position.x,y:this.position.y,radius:1200,color:"rgba(255,220,220,0.06)",time:60});
          this.charge = 0;
        }
      } else {
        // slowly decay
        if (this.charge>0 && !(simulation.cycle%60)) this.charge--;
      }
    };
    me.onDamage = function(d){
      // partial discharge creates local volley
      if (Math.random()<0.2) _radialSalvo(this,18,10,6,0.4);
    };
    me.onDeath = function(){ _radialSalvo(this,64,18,7); };
    return me;
  };

  // 5) Kurai Oni - demonic fire that spawns cursed orbs
  spawn.kuraiOni = function(x,y){
    mobs.spawn(x,y,6,64,"rgba(255,120,80,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5, damageReduction:0.65, accelMag:0.0022});
    me.name = "Kurai Oni";
    me.fireTick = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        this.turnToFacePlayer();
        if (!(simulation.cycle % 50)) {
          // spit cursed orbs that are DoT
          for (let i=0;i<5;i++){
            spawn.bullet(this.position.x + (Math.random()-0.5)*this.radius, this.position.y + (Math.random()-0.5)*this.radius, 5, 12);
            const b = mob[mob.length-1];
            if (b) Matter.Body.setVelocity(b,{x:(Math.random()-0.5)*14 + (player.position.x - this.position.x)/100, y:(Math.random()-0.5)*14 + (player.position.y - this.position.y)/100});
          }
          if (Math.random()<0.4) _spawnHelpers(this.position.x,this.position.y,3,6,12,"rgba(255,120,80,0.9)");
        }
      }
      if (!(simulation.cycle % 40)) _radialSalvo(this, 8, 6, 4);
    };
    me.onDeath = function(){ mobs.statusDoT(this,0.004,240); _radialSalvo(this,48,14,6); };
    return me;
  };

  // 6) Shinra Prime - sci-fi mech that launches missiles and shields
  spawn.shinraPrime = function(x,y){
    mobs.spawn(x,y,10,78,"rgba(200,230,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:7, damageReduction:0.8, accelMag:0.001});
    me.name = "Shinra Prime";
    me.missileCooldown = 0;
    me.shieldActive = false;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle % 100)) {
          // fire guided missiles (spawn small mobs with high velocity)
          for (let i=0;i<4;i++){
            spawn.bomb(this.position.x, this.position.y, 7+Math.ceil(this.radius/15), 6);
            const last = mob[mob.length-1];
            if (last) {
              Matter.Body.setVelocity(last, {x:(Math.random()-0.5)*6 + (player.position.x - this.position.x)/60, y:(Math.random()-0.5)*6 + (player.position.y - this.position.y)/60});
              last.isDropPowerUp = false;
            }
          }
        }
        if (this.health < 3.5 && !this.shieldActive) {
          this.shieldActive = true;
          this.isShielded = true;
          this.shieldCount = 3;
        }
        if (this.shieldActive && !(simulation.cycle%180)) {
          // burst and remove one shield
          _radialSalvo(this, 20, 12, 6);
          this.shieldCount--;
          if (this.shieldCount<=0) { this.isShielded=false; this.shieldActive=false; }
        }
      }
    };
    me.onDeath = function(){ _radialSalvo(this,56,16,7); };
    return me;
  };

  // ----------------------
  // Additional bosses (16)
  // ----------------------

  spawn.titanAlpha = function(x,y){
    mobs.spawn(x,y,12,86,"rgba(180,220,180,0.9)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:6.5, damageReduction:0.7, accelMag:0.001});
    me.name="Titan Alpha";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        this.grow();
        if (!(simulation.cycle%90)) {
          // ground slam: big radial bullets
          _radialSalvo(this, 32, 14, 6, 0.6);
          simulation.drawList.push({x:this.position.x,y:this.position.y,radius:300,color:"rgba(120,200,140,0.05)",time:30});
        }
      }
    };
    me.onDeath = function(){ _radialSalvo(this,48,18,7); };
    return me;
  };

  spawn.gaiaMother = function(x,y){
    mobs.spawn(x,y,14,90,"rgba(120,200,150,0.9)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:6, damageReduction:0.6, accelMag:0.0008});
    me.name="Gaia Mother";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (!(simulation.cycle%120)) {
        // spawn vine helpers that pull player
        _spawnHelpers(this.position.x+Math.random()*40-20, this.position.y+Math.random()*40-20, 3, 6, 18, "rgba(120,200,150,0.9)");
        // small ring of slow projectiles
        mobs.statusSlow(this,30);
        _radialSalvo(this, 18, 8, 4, 0.4);
      }
      if (this.seePlayer.yes && !(simulation.cycle%60)) this.harmZone();
    };
    me.onDeath = function(){ _radialSalvo(this,48,10,6); };
    return me;
  };

  spawn.vortexSerpent = function(x,y){
    mobs.spawn(x,y,20,66,"rgba(180,160,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5, damageReduction:0.65, accelMag:0.0016});
    me.name="Vortex Serpent";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle%180)) this.curl(1200,-8);
        if (!(simulation.cycle%40)) _radialSalvo(this, 10, 10, 5, 0.3);
      }
    };
    me.onDeath = function(){ this.curl(2000,-12); _radialSalvo(this,40,14,6); };
    return me;
  };

  spawn.zero = function(x,y){
    mobs.spawn(x,y,6,58,"rgba(160,220,255,0.9)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:3.8, damageReduction:0.6, accelMag:0.002});
    me.name="Zero";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle%90)) {
          // create ice pillars: slow and damage in area
          mobs.statusSlow(this,120);
          _radialSalvo(this, 12, 6, 4, 0.4);
        }
        if (!(simulation.cycle%40)) _aimedBurst(this,4,14,5);
      }
    };
    me.onDeath = function(){ _radialSalvo(this,30,12,6); };
    return me;
  };

  spawn.yamato = function(x,y){
    mobs.spawn(x,y,5,50,"rgba(255,255,255,0.9)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:3.8, damageReduction:0.5, accelMag:0.003});
    me.name="Yamato";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        // precise dashes: teleport a bit and dash across player
        if (!(simulation.cycle%70)) {
          const ang = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
          const dash = 220;
          Matter.Body.translate(this, {x: Math.cos(ang)*dash, y: Math.sin(ang)*dash});
          _aimedBurst(this,6,22,6,0.05);
        }
      }
      if (!(simulation.cycle%40)) _radialSalvo(this,6,6,4);
    };
    me.onDeath = function(){ _radialSalvo(this,36,16,6); };
    return me;
  };

  spawn.nemesisDrone = function(x,y){
    mobs.spawn(x,y,8,46,"rgba(180,180,200,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:3.2, damageReduction:0.6, accelMag:0.0025});
    me.name="Nemesis Drone";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle%90)) {
          // spawn repair drones that orbit and heal boss (spawn small mobs that buff)
          _spawnHelpers(this.position.x+30, this.position.y+30, 2, 6, 10, "rgba(180,180,200,0.9)");
        }
        if (!(simulation.cycle%40)) _aimedBurst(this,3,14,5);
      }
    };
    me.onDeath = function(){ _radialSalvo(this,28,12,6); };
    return me;
  };

  spawn.arclight = function(x,y){
    mobs.spawn(x,y,10,60,"rgba(160,240,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.2, damageReduction:0.7, accelMag:0.0018});
    me.name="Arclight";
    me.reflectChance = 0.25;
    me.onDamage = function(d){
      if (Math.random()<this.reflectChance){
        // create reflection field that converts bullets within radius to small heal pulses
        const r = 300;
        for (let i=0;i<bullet.length;i++){
          if (Vector.magnitudeSquared(Vector.sub(this.position, bullet[i].position)) < r*r) {
            // convert to heal powerup near player
            powerUps.spawn(player.position.x + (Math.random()-0.5)*50, player.position.y + (Math.random()-0.5)*50, "heal");
            simulation.drawList.push({x:bullet[i].position.x,y:bullet[i].position.y,radius:40,color:"rgba(160,240,255,0.12)",time:18});
            // remove bullet
            bullet[i].endCycle = simulation.cycle;
          }
        }
      }
    };
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%50)) _aimedBurst(this,5,14,5);
    };
    me.onDeath = function(){ _radialSalvo(this,44,14,6); };
    return me;
  };

  spawn.umbraQueen = function(x,y){
    mobs.spawn(x,y,12,70,"rgba(60,30,80,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5, damageReduction:0.7, accelMag:0.0012});
    me.name="Umbra Queen";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (!(simulation.cycle%120)) {
        // spawn webs that slow
        mobs.statusSlow(this,180);
        _spawnHelpers(this.position.x,this.position.y,4,6,12,"rgba(120,80,140,0.9)");
      }
      if (this.seePlayer.yes && !(simulation.cycle%30)) _aimedBurst(this,4,12,5);
    };
    me.onDeath = function(){ _radialSalvo(this,40,12,6); };
    return me;
  };

  spawn.singularity = function(x,y){
    mobs.spawn(x,y,18,80,"rgba(20,20,40,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:7, damageReduction:0.85, accelMag:0.0009});
    me.name="Singularity";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      // constant pull
      if (this.seePlayer.recall) {
        this.pullPlayer();
        this.repelBullets();
      }
      if (!(simulation.cycle%60)) _radialSalvo(this,8,8,5);
    };
    me.onDeath = function(){ b.explosion(this.position, 900); };
    return me;
  };

  spawn.exodus = function(x,y){
    mobs.spawn(x,y,10,60,"rgba(140,40,40,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.5, damageReduction:0.6, accelMag:0.002});
    me.name="Exodus";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%180)) {
        // scream: AoE stun and damage
        for (let i=0;i<mob.length;i++){
          if (Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position)) < 600*600) mobs.statusStun(mob[i],90);
        }
        if (m.immuneCycle < m.cycle) m.takeDamage(0.02);
        simulation.drawList.push({x:this.position.x,y:this.position.y,radius:600,color:"rgba(180,80,80,0.06)",time:24});
      }
      if (!(simulation.cycle%40)) _aimedBurst(this,4,14,5);
    };
    me.onDeath = function(){ _radialSalvo(this,36,12,6); };
    return me;
  };

  spawn.blightReaper = function(x,y){
    mobs.spawn(x,y,8,64,"rgba(90,180,80,0.9)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.2, damageReduction:0.65, accelMag:0.002});
    me.name="Blight Reaper";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%80)){
        // toxic clouds spawn spores that DoT
        for (let i=0;i<6;i++){
          spawn.spawns(this.position.x + (Math.random()-0.5)*120, this.position.y + (Math.random()-0.5)*120, 2);
          const last = mob[mob.length-1];
          if (last) { last.isDropPowerUp=false; last.health=0.3; }
        }
      }
      if (!(simulation.cycle%40)) _aimedBurst(this,3,12,5);
    };
    me.onDeath = function(){ _radialSalvo(this,40,10,6); };
    return me;
  };

  spawn.ryujin = function(x,y){
    mobs.spawn(x,y,16,74,"rgba(240,120,40,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5.8, damageReduction:0.7, accelMag:0.0013});
    me.name="Ryujin";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      // periodic dive from above
      if (this.seePlayer.yes && !(simulation.cycle%200)){
        const px = player.position.x + (Math.random()-0.5)*200;
        const py = player.position.y - 400 + (Math.random()-0.5)*80;
        _teleportTo(this, px, py);
        // dive
        Matter.Body.setVelocity(this, {x: (player.position.x - this.position.x)/18, y: 30});
        _radialSalvo(this, 20, 16, 6);
      }
      if (!(simulation.cycle%40)) _aimedBurst(this,4,14,5);
    };
    me.onDeath = function(){ _radialSalvo(this,48,16,7); };
    return me;
  };

  spawn.erebus = function(x,y){
    mobs.spawn(x,y,14,68,"rgba(10,10,20,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5.5, damageReduction:0.75, accelMag:0.001});
    me.name="Erebus";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        // darken area (visual effect)
        simulation.drawList.push({x:this.position.x,y:this.position.y,radius:900,color:"rgba(10,10,20,0.06)",time:40});
        if (!(simulation.cycle%120)) _radialSalvo(this,12,8,5);
        if (!(simulation.cycle%60)) _aimedBurst(this,3,12,5);
      }
    };
    me.onDeath = function(){ _radialSalvo(this,30,12,6); };
    return me;
  };

  spawn.projectX = function(x,y){
    mobs.spawn(x,y,9,62,"rgba(220,220,160,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.4, damageReduction:0.6, accelMag:0.002});
    me.name="Project X";
    me.mode = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (!(simulation.cycle%240)){
        this.mode = (this.mode+1)%3;
      }
      if (this.mode===0) {
        if (!(simulation.cycle%40)) _aimedBurst(this,4,14,5);
      } else if (this.mode===1) {
        if (!(simulation.cycle%60)) _radialSalvo(this,18,10,5);
      } else {
        if (!(simulation.cycle%90)) _spawnHelpers(this.position.x,this.position.y,3,6,12,"rgba(220,220,160,0.9)");
      }
    };
    me.onDeath = function(){ _radialSalvo(this,40,14,6); };
    return me;
  };

  spawn.akumaCore = function(x,y){
    mobs.spawn(x,y,6,58,"rgba(255,100,60,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.6, damageReduction:0.7, accelMag:0.0025});
    me.name="Akuma Core";
    me.charge = 0;
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes) {
        if (!(simulation.cycle%20)) this.charge += 0.1;
        if (!(simulation.cycle%40)) _aimedBurst(this,3,16,5);
        if (this.charge>3) {
          // dash and explode
          const ang = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
          Matter.Body.setVelocity(this, {x:Math.cos(ang)*28, y:Math.sin(ang)*28});
          this.charge = 0;
          _radialSalvo(this, 40, 16, 6, 0.5);
        }
      }
    };
    me.onDeath = function(){ _radialSalvo(this,56,18,7); };
    return me;
  };

  spawn.shadowFlea = function(x,y){
    mobs.spawn(x,y,5,40,"rgba(10,10,10,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:2.6, damageReduction:0.45, accelMag:0.004});
    me.name="Shadow Flea";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%50)) {
        // rapid teleport hops
        const dx = (Math.random()-0.5)*300;
        const dy = (Math.random()-0.5)*300;
        _teleportTo(this, player.position.x+dx, player.position.y+dy);
        _aimedBurst(this,6,18,5,0.07);
      }
      if (!(simulation.cycle%30)) _radialSalvo(this,6,8,4);
    };
    me.onDeath = function(){ _radialSalvo(this,20,12,5); };
    return me;
  };

  spawn.moonWarden = function(x,y){
    mobs.spawn(x,y,10,60,"rgba(220,240,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.0, damageReduction:0.65, accelMag:0.002});
    me.name="Moon Warden";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%80)) {
        _aimedBurst(this,5,16,5);
        // occasional shielding pulse
        if (Math.random()<0.15) { this.isShielded = true; setTimeout(()=>{ this.isShielded=false; }, 120); }
      }
    };
    me.onDeath = function(){ _radialSalvo(this,32,14,6); };
    return me;
  };

  spawn.pyroWorm = function(x,y){
    mobs.spawn(x,y,9,52,"rgba(255,140,40,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:3.6, damageReduction:0.6, accelMag:0.002});
    me.name="Pyro Worm";
    me.isSoonZombie = true; // spawns smaller worms on death
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%40)) _aimedBurst(this,4,14,5);
      if (!(simulation.cycle%120)) _radialSalvo(this,8,10,5);
    };
    me.onDeath = function(){ _radialSalvo(this,40,12,6); };
    return me;
  };

  spawn.frozenKnight = function(x,y){
    mobs.spawn(x,y,8,56,"rgba(180,220,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.0, damageReduction:0.7, accelMag:0.0018});
    me.name="Frozen Knight";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%60)) {
        mobs.statusSlow(this,80);
        _aimedBurst(this,3,12,5);
      }
      if (!(simulation.cycle%40)) _radialSalvo(this,6,6,4);
    };
    me.onDeath = function(){ _radialSalvo(this,24,12,6); };
    return me;
  };

  spawn.ironGoliath = function(x,y){
    mobs.spawn(x,y,12,90,"rgba(200,200,200,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:7.5, damageReduction:0.85, accelMag:0.0008});
    me.name="Iron Goliath";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%120)) {
        // heavy slow stomps
        _radialSalvo(this,30,12,6);
        simulation.drawList.push({x:this.position.x,y:this.position.y,radius:250,color:"rgba(200,200,200,0.06)",time:20});
      }
    };
    me.onDeath = function(){ _radialSalvo(this,40,18,7); };
    return me;
  };

  spawn.warpHivemind = function(x,y){
    mobs.spawn(x,y,10,62,"rgba(160,160,220,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4.6, damageReduction:0.7, accelMag:0.0016});
    me.name="Warp Hivemind";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (this.seePlayer.yes && !(simulation.cycle%100)) {
        // teleport a cluster of small mobs around player
        _spawnHelpers(player.position.x, player.position.y, 4, 6, 12, "rgba(160,160,220,0.95)");
        _radialSalvo(this,12,12,5);
      }
    };
    me.onDeath = function(){ _radialSalvo(this,44,14,6); };
    return me;
  };

  spawn.zodiac = function(x,y){
    mobs.spawn(x,y,12,68,"rgba(240,200,255,0.95)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:5.2, damageReduction:0.65, accelMag:0.0018});
    me.name="Zodiac";
    me.do = function(){
      this.checkStatus();
      this.seePlayerCheck();
      if (!(simulation.cycle%80)) {
        // rotating constellation attacks
        _radialSalvo(this,20,12,5);
      }
      if (this.seePlayer.yes && !(simulation.cycle%40)) _aimedBurst(this,3,16,5);
    };
    me.onDeath = function(){ _radialSalvo(this,40,16,6); };
    return me;
  };

  // convenience: register a function to spawn a random boss (for debugging/testing)
  spawn.spawnRandomBoss = function(cx, cy){
    const list = Object.keys(spawn).filter(k=>k !== "spawnRandomBoss" && k !== "randomMobByLevelsCleared" && k.startsWith && k.length>0 && (typeof spawn[k]==="function") && k !== "bullet" && k !== "bomb" && k !== "spawns");
    // narrow to boss list we added (heuristic: names lower-case and in our set)
    const bossNames = ["raijin","chronos","kage","novaPrime","kuraiOni","shinraPrime","titanAlpha","gaiaMother","vortexSerpent","zero","yamato","nemesisDrone","arclight","umbraQueen","singularity","exodus","blightReaper","ryujin","erebus","projectX","akumaCore","shadowFlea","moonWarden","pyroWorm","frozenKnight","ironGoliath","warpHivemind","zodiac"];
    const choice = bossNames[Math.floor(Math.random()*bossNames.length)];
    if (spawn[choice]) return spawn[choice](cx||player.position.x + (Math.random()-0.5)*200, cy||player.position.y + (Math.random()-0.5)*200);
    return null;
  };

  console.log("bosses_extended.js loaded: added extended boss roster.");
})();
