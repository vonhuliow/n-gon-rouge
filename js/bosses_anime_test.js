
/*
  bosses_anime_test.js
  Contains 6 advanced/anime-inspired bosses for testing:
    - Raijin
    - Chronos
    - Kage
    - Nova Prime
    - Kurai Oni
    - Shinra Prime
  Load this after mob.js and spawn.js
*/
(function(){
  if (typeof spawn === "undefined" || typeof mobs === "undefined") {
    console.warn("spawn or mobs not found. Load after mob.js and spawn.js");
    return;
  }

  function _setBossDefaults(me, opts = {}) {
    me.isBoss = true;
    me.leaveBody = true;
    me.health = opts.health || 3;
    me.damageReduction = opts.damageReduction || 0.6;
    me.accelMag = opts.accelMag || 0.002;
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

  // 1) Raijin
  spawn.raijin = function(x,y){
    mobs.spawn(x,y,8,60,"rgba(255,240,120,0.85)");
    const me = mob[mob.length-1];
    _setBossDefaults(me,{health:4, damageReduction:0.7, accelMag:0.0025});
    me.name="Raijin";
    me.do=function(){
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

  // 2) Chronos
  spawn.chronos=function(x,y){
    mobs.spawn(x,y,10,58,"rgba(200,220,255,0.85)");
    const me=mob[mob.length-1];
    _setBossDefaults(me,{health:4.5,damageReduction:0.75,accelMag:0.0015});
    me.name="Chronos";
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

  // 3) Kage
  spawn.kage=function(x,y){
    mobs.spawn(x,y,7,52,"rgba(18,18,28,0.85)");
    const me=mob[mob.length-1];
    _setBossDefaults(me,{health:3.6,damageReduction:0.65,accelMag:0.002});
    me.name="Kage";
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

  // 4) Nova Prime
  spawn.novaPrime=function(x,y){
    mobs.spawn(x,y,9,72,"rgba(255,200,220,0.95)");
    const me=mob[mob.length-1];
    _setBossDefaults(me,{health:6,damageReduction:0.7,accelMag:0.001});
    me.name="Nova Prime";
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

  // 5) Kurai Oni
  spawn.kuraiOni=function(x,y){
    mobs.spawn(x,y,6,64,"rgba(255,120,80,0.95)");
    const me=mob[mob.length-1];
    _setBossDefaults(me,{health:5,damageReduction:0.65,accelMag:0.0022});
    me.name="Kurai Oni";
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes&&!(simulation.cycle%50)){
        for(let i=0;i<5;i++) spawn.bullet(this.position.x+(Math.random()-0.5)*this.radius,this.position.y+(Math.random()-0.5)*this.radius,5,12);
      }
      if(!(simulation.cycle%40)) _radialSalvo(this,8,6,4);
    };
    me.onDeath=function(){_radialSalvo(this,48,14,6);};
  };

  // 6) Shinra Prime
  spawn.shinraPrime=function(x,y){
    mobs.spawn(x,y,10,78,"rgba(200,230,255,0.95)");
    const me=mob[mob.length-1];
    _setBossDefaults(me,{health:7,damageReduction:0.8,accelMag:0.001});
    me.name="Shinra Prime";
    me.do=function(){
      this.checkStatus();this.seePlayerCheck();
      if(this.seePlayer.yes&&!(simulation.cycle%100)){
        for(let i=0;i<4;i++) spawn.bomb(this.position.x,this.position.y,7,6);
      }
    };
    me.onDeath=function(){_radialSalvo(this,56,16,7);};
  };

  console.log("bosses_anime_test.js loaded.");
})();
