
/*
  anime_boss_pack.js
  Includes:
   - 6 anime-inspired bosses (Raijin, Chronos, Kage, Nova Prime, Kurai Oni, Shinra Prime)
   - Simple Boss Test Menu (press 'B' to open, 1–6 to spawn, R random)
   - Auto name + health bar overlay for spawned bosses
*/

(function(){
  if (typeof spawn === "undefined" || typeof mobs === "undefined" || typeof player === "undefined" || typeof simulation === "undefined") {
    console.warn("anime_boss_pack.js must be loaded after mob.js and spawn.js");
    return;
  }

  // ========= UTILITIES =========

  function _setBossDefaults(me, opts = {}) {
    me.isBoss = true;
    me.leaveBody = true;
    me.health = opts.health || 3;
    me.damageReduction = opts.damageReduction || 0.6;
    me.accelMag = opts.accelMag || 0.002;
    me.displayName = opts.displayName || me.name || "BOSS";
    me.maxHealth = me.health;
  }

  function _teleportTo(me, x, y) {
    simulation.drawList.push({x: me.position.x, y: me.position.y, radius: me.radius*1.5, color: "rgba(255,255,255,0.12)", time: 10});
    Matter.Body.setPosition(me, {x:x, y:y});
    simulation.drawList.push({x: x, y: y, radius: me.radius*2, color: "rgba(200,200,255,0.12)", time: 12});
  }

  function _radialSalvo(me, count, speed, tier, spread=0) {
    const base = 2*Math.PI*Math.random();
    for (let i=0;i<count;i++){
      const a = base + (i/count)*(2*Math.PI) + (Math.random()-0.5)*spread;
      spawn.bullet(me.position.x + Math.cos(a)*me.radius, me.position.y + Math.sin(a)*me.radius, tier || 5, 8);
      const last = mob[mob.length-1];
      Matter.Body.setVelocity(last, {x: Math.cos(a)*speed, y: Math.sin(a)*speed});
    }
  }

  function _aimedBurst(me, num, speed, tier, spread=0.15) {
    const a = Math.atan2(player.position.y - me.position.y, player.position.x - me.position.x);
    for (let i=0;i<num;i++){
      const off = a + (i-(num-1)/2)*spread + (Math.random()-0.5)*0.05;
      spawn.bullet(me.position.x + Math.cos(off)*me.radius, me.position.y + Math.sin(off)*me.radius, tier || 5, 8);
      const last = mob[mob.length-1];
      Matter.Body.setVelocity(last, {x: Math.cos(off)*speed, y: Math.sin(off)*speed});
    }
  }

  // ========= BOSSES =========

  // Raijin
  spawn.raijin = function(x,y){
    mobs.spawn(x,y,8,60,"rgba(255,240,120,0.85)");
    const me = mob[mob.length-1];
    me.name = "Raijin";
    _setBossDefaults(me,{health:4, damageReduction:0.7, accelMag:0.0025, displayName:"Raijin"});
    me.do = function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes){
        if(!(simulation.cycle%140)){
          const dx=(Math.random()-0.5)*400, dy=(Math.random()-0.5)*300;
          _teleportTo(this,player.position.x+dx,player.position.y+dy);
        }
        if(!(simulation.cycle%60)) _aimedBurst(this,5,22,6,0.12);
      }
      if(!(simulation.cycle%30)) _radialSalvo(this,6,6,4,0.3);
    };
    me.onDeath=function(){_radialSalvo(this,48,14,6,0.5);};
  };

  // Chronos
  spawn.chronos=function(x,y){
    mobs.spawn(x,y,10,58,"rgba(200,220,255,0.85)");
    const me=mob[mob.length-1];
    me.name="Chronos";
    _setBossDefaults(me,{health:4.5,damageReduction:0.75,accelMag:0.0015,displayName:"Chronos"});
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes){
        if(!(simulation.cycle%300)){
          const range2=Math.pow(700,2);
          for(let i=0;i<mob.length;i++) if(Vector.magnitudeSquared(Vector.sub(this.position,mob[i].position))<range2) mobs.statusStun(mob[i],120);
          for(let i=0;i<bullet.length;i++) Matter.Body.setVelocity(bullet[i],{x:bullet[i].velocity.x*0.25,y:bullet[i].velocity.y*0.25});
        }
        if(!(simulation.cycle%80)) _aimedBurst(this,6,12,5,0.2);
      }
    };
    me.onDeath=function(){_radialSalvo(this,32,16,6,0.7);};
  };

  // Kage
  spawn.kage=function(x,y){
    mobs.spawn(x,y,7,52,"rgba(18,18,28,0.85)");
    const me=mob[mob.length-1];
    me.name="Kage";
    _setBossDefaults(me,{health:3.6,damageReduction:0.65,accelMag:0.002,displayName:"Kage"});
    me.clonePhase=false;
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes){
        if(!(simulation.cycle%40)) _aimedBurst(this,3,18,5,0.08);
        if(this.health<1.5&&!this.clonePhase){
          this.clonePhase=true;
          const num=5;
          for(let i=0;i<num;i++) spawn.randomMobByLevelsCleared(this.position.x+(Math.random()-0.5)*120,this.position.y+(Math.random()-0.5)*120);
        }
      }
    };
    me.onDeath=function(){_radialSalvo(this,40,14,6);};
  };

  // Nova Prime
  spawn.novaPrime=function(x,y){
    mobs.spawn(x,y,9,72,"rgba(255,200,220,0.95)");
    const me=mob[mob.length-1];
    me.name="Nova Prime";
    _setBossDefaults(me,{health:6,damageReduction:0.7,accelMag:0.001,displayName:"Nova Prime"});
    me.charge=0;
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes){
        if(!(simulation.cycle%15)) _aimedBurst(this,2,12,5,0.05);
        if(simulation.cycle%120===0) this.charge++;
        if(this.charge>=6){_radialSalvo(this,120,20,7,0.6);this.charge=0;}
      }
    };
    me.onDeath=function(){_radialSalvo(this,64,18,7);};
  };

  // Kurai Oni
  spawn.kuraiOni=function(x,y){
    mobs.spawn(x,y,6,64,"rgba(255,120,80,0.95)");
    const me=mob[mob.length-1];
    me.name="Kurai Oni";
    _setBossDefaults(me,{health:5,damageReduction:0.65,accelMag:0.0022,displayName:"Kurai Oni"});
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes&&!(simulation.cycle%50)){
        for(let i=0;i<5;i++) spawn.bullet(this.position.x+(Math.random()-0.5)*this.radius,this.position.y+(Math.random()-0.5)*this.radius,5,12);
      }
      if(!(simulation.cycle%40)) _radialSalvo(this,8,6,4);
    };
    me.onDeath=function(){_radialSalvo(this,48,14,6);};
  };

  // Shinra Prime
  spawn.shinraPrime=function(x,y){
    mobs.spawn(x,y,10,78,"rgba(200,230,255,0.95)");
    const me=mob[mob.length-1];
    me.name="Shinra Prime";
    _setBossDefaults(me,{health:7,damageReduction:0.8,accelMag:0.001,displayName:"Shinra Prime"});
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes&&!(simulation.cycle%100)){
        for(let i=0;i<4;i++) spawn.bomb(this.position.x,this.position.y,7,6);
      }
    };
    me.onDeath=function(){_radialSalvo(this,56,16,7);};
  };

  // ========= BOSS TEST MENU =========

  let bossMenuActive = false;
  const bossNames = ["raijin", "chronos", "kage", "novaPrime", "kuraiOni", "shinraPrime"];

  window.addEventListener("keydown", function(e) {
    if (e.key === "b" || e.key === "B") {
      bossMenuActive = !bossMenuActive;
      console.log(bossMenuActive ? "Boss Menu: ON" : "Boss Menu: OFF");
    }
    if (!bossMenuActive) return;

    if (e.key >= "1" && e.key <= "6") {
      const idx = parseInt(e.key) - 1;
      const name = bossNames[idx];
      if (spawn[name]) {
        spawn[name](player.position.x + (Math.random()-0.5)*200, player.position.y - 80);
        console.log("Spawned boss:", name);
      }
    }
    if (e.key === "r" || e.key === "R") {
      const name = bossNames[Math.floor(Math.random()*bossNames.length)];
      spawn[name](player.position.x + (Math.random()-0.5)*200, player.position.y - 80);
      console.log("Spawned random boss:", name);
    }
  });

  const oldDraw = simulation.draw;
  simulation.draw = function(ctx){
    oldDraw.call(simulation, ctx);

    // Draw menu overlay
    if (bossMenuActive) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(50, 50, 280, 180);
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.fillText("=== BOSS TEST MENU ===", 70, 80);
      for (let i=0;i<bossNames.length;i++) {
        ctx.fillText((i+1)+") "+bossNames[i], 70, 110 + i*20);
      }
      ctx.fillText("[R] Random Boss", 70, 240);
      ctx.fillText("[B] Close Menu", 70, 260);
      ctx.restore();
    }

    // Draw health bars and names for bosses
    ctx.save();
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    for (let i=0;i<mob.length;i++) {
      const m = mob[i];
      if (m.isBoss && m.health > 0) {
        const hpWidth = 80 * (m.health / m.maxHealth);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(m.position.x - 40, m.position.y - m.radius - 30, 80, 8);
        ctx.fillStyle = "rgba(255,60,60,0.8)";
        ctx.fillRect(m.position.x - 40, m.position.y - m.radius - 30, hpWidth, 8);
        ctx.fillStyle = "#fff";
        ctx.fillText(m.displayName, m.position.x, m.position.y - m.radius - 38);
      }
    }
    ctx.restore();
  };

  console.log("anime_boss_pack.js loaded. Press 'B' to open boss test menu.");
})();
