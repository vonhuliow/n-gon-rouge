// N-gon Custom Weapons Pack
// All custom weapons combined into one file
// Generated on 2025-10-11T18:01:40.307Z

javascript:(function() {
	const e = {
		name: "sword",
		descriptionFunction() { return `swing a <b>sword</b> that <b style="color: indigo;">lifesteals</b> <strong class='color-h'>health</strong><br>drains <strong class='color-h'>health</strong> instead of ammunition<br>doesn't use <b>ammo</b>`},
		ammo: Infinity,
		ammoPack: Infinity,
		defaultAmmoPack: Infinity,
		have: false,
		cycle: 0,
		sword: undefined,
		swordArray: [],
		bladeSegments: undefined,
		bladeTrails: [],
		angle: 0,
		constraint: undefined,
		charge: 0,
		angle2: 0,
		released: false,
		stabStatus: false,
		haveEphemera: false,
		fire() { },
		do() {
			if(!this.haveEphemera) {
				this.haveEphemera = true;
				simulation.ephemera.push({
					name: "sword",
					do() {
						if(b.guns[b.activeGun].name !== 'sword') {
							for (let i = 0, len = b.inventory.length; i < len; ++i) {
								if(b.guns[b.inventory[i]].name === "sword" && b.guns[b.inventory[i]].sword) {
									b.guns[b.inventory[i]].cycle = 0;
									if(b.guns[b.inventory[i]].constraint1) {
										Composite.remove(engine.world, b.guns[b.inventory[i]].constraint1);
										b.guns[b.inventory[i]].constraint1 = undefined;
									}
									if(b.guns[b.inventory[i]].constraint2) {
										Composite.remove(engine.world, b.guns[b.inventory[i]].constraint2);
										b.guns[b.inventory[i]].constraint2 = undefined;
									}
									Composite.remove(engine.world, b.guns[b.inventory[i]].sword);
									b.guns[b.inventory[i]].sword.parts.forEach(part => {
										Composite.remove(engine.world, part);
										const index = bullet.indexOf(part);
										if (index !== -1) {
											bullet.splice(index, 1);
										}
									});
									b.guns[b.inventory[i]].sword = undefined;
									b.guns[b.inventory[i]].bladeTrails = [];
								}
							}
						}
						if(b.guns[b.activeGun].name == 'sword' && tech.greatSword && b.guns[b.activeGun].sword) {
							let bladeSegments = b.guns[b.activeGun].bladeSegments;
							for(let i = 0; i < bladeSegments.length; i++) {
								ctx.beginPath();
								ctx.lineJoin = "miter";
								ctx.miterLimit = 100;
								ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "crimson";
								ctx.lineWidth = 5;
								ctx.fillStyle = "black";
								ctx.moveTo(bladeSegments[i].vertices[0].x, bladeSegments[i].vertices[0].y);
								for(let j = 0; j < bladeSegments[i].vertices.length; j++) {
									ctx.lineTo(bladeSegments[i].vertices[j].x, bladeSegments[i].vertices[j].y)
								};
								ctx.closePath();
								ctx.stroke();
								ctx.fill();
								ctx.lineJoin = "round";
								ctx.miterLimit = 10;
							}
						}
					}
				})
			}
			if(this.sword && this.cycle < 1) {
				this.angle2 = Math.atan2(this.sword.position.y - m.pos.y, this.sword.position.x - m.pos.x);
			}
			if(this.sword) {
				this.cycle++;
			}
			this.chooseFireMethod();
			this.fire();
			if(tech.soundSword) {
				this.renderSoundSword();
			} else if(tech.longSword) {
				this.renderLongsword();
			} else {
				this.renderDefault();
			}
			this.collision();
		},
		chooseFireMethod() {
			if (tech.isStabSword && m.crouch && input.down) {
				this.fire = this.stabFire
			} else {
				this.fire = this.normalFire
			}
		},
		stabFire() {
			if(this.constraint) {
				this.constraint.pointA = player.position;
			}
			if(this.sword) {
				this.stabStatus = true;
				if(tech.isEnergyHealth) {
					m.energy -= 0.002;
				} else {
					m.health -= 0.00025;
					m.displayHealth();
				}
			}
			if (input.fire && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11)) {
				if (!this.sword && b.guns[b.activeGun].name === 'sword') {
					if(tech.greatSword) {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.greatSword());
					} else if(tech.longSword) {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.longSword());
					} else {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.createAndSwingSword());
					}
					this.angle = m.angle;
				}
			}
			if(this.sword && this.released == true && this.charge <= 0) {
				this.cycle = 0;
				Matter.Body.setAngularVelocity(this.sword, 0);
				player.force.x *= 0.01;
				player.force.y *= 0.01;
				Composite.remove(engine.world, this.sword);
				this.sword.parts.forEach(part => {
					Composite.remove(engine.world, part);
					const index = bullet.indexOf(part);
					if (index !== -1) {
						bullet.splice(index, 1);
					}
				});
				this.sword = undefined;
				if(this.constraint) {
					Composite.remove(engine.world, this.constraint);
					this.constraint = undefined;
				}
				this.bladeTrails = [];
				this.charge = 0;
				this.released = false;
			} else {
				if (this.sword && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11)) {
					if(tech.infinityEdge) {
						const newSize = Math.sqrt(0.5 * m.health) + 1;
						Matter.Body.scale(this.sword, newSize * (1 / (this.sword.scale == undefined ? 1 : this.sword.scale)), newSize * (1 / (this.sword.scale == undefined ? 1 : this.sword.scale)), this.sword.position);
						this.sword.scale = newSize;
					}
					let handle;
					for(let i = 0; i < bullet.length; i++) {
						if(bullet[i].customName == "handle") {
							 handle = bullet[i];
						}
					}
					Matter.Body.setAngle(this.sword, m.angle + (Math.PI / 2))
					if(!this.released) {
						this.sword.force.x -= Math.cos(m.angle) * this.charge;
						this.sword.force.y -= Math.sin(m.angle) * this.charge;
						if(this.charge > 10 && !input.fire) {
							this.released = true;
						} 
						if(this.charge <= 10) {
							this.charge += 0.2;
						}
						const flashEffect = Math.sin((2 * Math.PI * this.cycle) / (50))
						const radius = 100;
						ctx.beginPath();
						ctx.lineWidth = 2;
						ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
						ctx.arc(simulation.mouseInGame.x, simulation.mouseInGame.y, radius, 0, Math.PI * 2 * (this.charge / 10));
						ctx.stroke();
						if((this.charge / 10) >= 1 && flashEffect > 0) {
							ctx.beginPath();
							ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
							ctx.moveTo(simulation.mouseInGame.x, simulation.mouseInGame.y - radius);
							ctx.lineTo(simulation.mouseInGame.x + radius, simulation.mouseInGame.y);
							ctx.lineTo(simulation.mouseInGame.x, simulation.mouseInGame.y + radius);
							ctx.lineTo(simulation.mouseInGame.x - radius, simulation.mouseInGame.y);
							ctx.closePath();
							ctx.fill();
							
							ctx.beginPath();
							ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
							ctx.lineWidth = 18;
							ctx.moveTo(simulation.mouseInGame.x, simulation.mouseInGame.y - 75);
							ctx.lineTo(simulation.mouseInGame.x, simulation.mouseInGame.y + 25);
							ctx.stroke();
							ctx.beginPath();
							ctx.moveTo(simulation.mouseInGame.x + 5, simulation.mouseInGame.y + 70);
							ctx.arc(simulation.mouseInGame.x, simulation.mouseInGame.y + 70, 5, 0, 2 * Math.PI);
							ctx.stroke();
						}
					} else {
						if(this.charge > 0) {
							this.charge -= 0.5;
							this.sword.force.x += Math.cos(m.angle) * this.charge * 2 * Math.sqrt(this.sword.mass);
							this.sword.force.y += Math.sin(m.angle) * this.charge * 2 * Math.sqrt(this.sword.mass);
						} else {
							m.fireCDcycle = m.cycle + 100;
						}
					}
					if(!this.constraint && (m.angle > -Math.PI / 2 && m.angle < Math.PI / 2)) {
						this.constraint = Constraint.create({
							pointA: player.position,
							bodyB: this.sword,
							pointB: {x: -9, y: 0},
							stiffness: 0.09,
							damping: 0.9,
							length: 0,
						});
						Composite.add(engine.world, this.constraint);
					} else if(!this.constraint) {
						this.constraint = Constraint.create({
							pointA: player.position,
							bodyB: this.sword,
							pointB: {x: 9, y: 0},
							stiffness: 0.09,
							damping: 0.9,
							length: 0,
						});
						Composite.add(engine.world, this.constraint);
					}
				} else {
					if(this.sword) {
						this.cycle = 0;
						Matter.Body.setAngularVelocity(this.sword, 0);
						player.force.x *= 0.01;
						player.force.y *= 0.01;
						if(player.velocity > 4) {
							Matter.Body.setVelocity(player, {
								x: player.velocity * 0.01, 
								y: player.velocity * 0.01
							})
						}
						Composite.remove(engine.world, this.sword);
						this.sword.parts.forEach(part => {
							Composite.remove(engine.world, part);
							const index = bullet.indexOf(part);
							if (index !== -1) {
								bullet.splice(index, 1);
							}
						});
						this.sword = undefined;
						if(this.constraint) {
							Composite.remove(engine.world, this.constraint);
							this.constraint = undefined;
						}
						this.bladeTrails = [];
						this.charge = 0;
						this.released = false;
					}
				}
			}
		},
		normalFire() {
			if(this.constraint) {
				this.constraint.pointA = player.position;
			}
			if(tech.isStabSword && !m.crouch && this.cycle > 0 && this.stabStatus) {
				if(this.sword) {
					this.stabStatus = false;
					if(tech.isEnergyHealth) {
						m.energy = 0.01;
						m.immuneCycle = m.cycle + 30;
					}
					this.cycle = 0;
					Matter.Body.setAngularVelocity(this.sword, 0);
					Composite.remove(engine.world, this.sword);
					this.sword.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.sword = undefined;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
					this.bladeTrails = [];
					m.fireCDcycle = 0;
				}
			}
			
			if(input.fire && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11)) {
				if(tech.isEnergyHealth) {
					m.energy -= 0.004;
				} else {
					m.health -= 0.001 * (input.down ? 0.5 : 1);
					m.displayHealth();
				}
			}
			if (input.fire && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11)) {
				if (!this.sword && b.guns[b.activeGun].name === 'sword') {
					if(tech.greatSword) {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.greatSword());
					} else if(tech.longSword) {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.longSword());
					} else {
						({ sword: this.sword, bladeSegments: this.bladeSegments} = this.createAndSwingSword());
					}
					this.angle = m.angle;
				}
			}
			if(this.sword && !input.fire) {
				this.cycle = 0;
				Matter.Body.setAngularVelocity(this.sword, 0);
				player.force.x *= 0.01;
				player.force.y *= 0.01;
				Composite.remove(engine.world, this.sword);
				this.sword.parts.forEach(part => {
					Composite.remove(engine.world, part);
					const index = bullet.indexOf(part);
					if (index !== -1) {
						bullet.splice(index, 1);
					}
				});
				this.sword = undefined;
				if(this.constraint) {
					Composite.remove(engine.world, this.constraint);
					this.constraint = undefined;
				}
				this.bladeTrails = [];
				this.bladeSegments = undefined;
				m.fireCDcycle = m.cycle + 10;
			} else {
				if (this.sword && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11)) {
					if(tech.infinityEdge) {
						const newSize = Math.sqrt(0.5 * m.health) + 1;
						Matter.Body.scale(this.sword, newSize * (1 / (this.sword.scale == undefined ? 1 : this.sword.scale)), newSize * (1 / (this.sword.scale == undefined ? 1 : this.sword.scale)), this.sword.position);
						this.sword.scale = newSize;
					}
					if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
						Matter.Body.setAngularVelocity(this.sword, -Math.PI * 0.1 * (tech.greatSword ? 0.75 : 1) * (tech.longSword ? 0.6 : 1));
					} else {
						Matter.Body.setAngularVelocity(this.sword, Math.PI * 0.1 * (tech.greatSword ? 0.75 : 1) * (tech.longSword ? 0.6 : 1));
					}
					if(tech.sizeIllusion) {
						player.force.x += Math.cos(m.angle) * player.mass / 500;
						player.force.y += Math.sin(m.angle) * player.mass / 500;
					}
					if(!this.constraint && (m.angle > -Math.PI / 2 && m.angle < Math.PI / 2)) {
						this.constraint = Constraint.create({
							pointA: player.position,
							bodyB: this.sword,
							pointB: {x: tech.longSword ? -75 : (tech.greatSword ? -50 : -9), y: (tech.longSword ? 275 : 200)},
							stiffness: (tech.infinityEdge ? 0.05 : 0.1),
							damping: 0.001815,
							length: 0,
							
						});
						Composite.add(engine.world, this.constraint);
					} else if(!this.constraint) {
						this.constraint = Constraint.create({
							pointA: player.position,
							bodyB: this.sword,
							pointB: {x: tech.longSword ? 75 : (tech.greatSword ? 50 : 9), y: (tech.longSword ? 275 : 200)},
							stiffness: (tech.infinityEdge ? 0.05 : 0.1),
							damping: 0.001815,
							length: 0,
						});
						Composite.add(engine.world, this.constraint);
					}
				} else if(this.sword) {
					if(tech.isEnergyHealth) {
						m.energy = 0.01;
						m.immuneCycle = m.cycle + 30;
					}
					this.cycle = 0;
					Matter.Body.setAngularVelocity(this.sword, 0);
					player.force.x *= 0.01;
					player.force.y *= 0.01;
					Composite.remove(engine.world, this.sword);
					this.sword.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.sword = undefined;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
					this.bladeTrails = [];
					this.bladeSegments = undefined;
					m.fireCDcycle = 0;
				}
			}
		},
		createAndSwingSword(x = player.position.x, y = player.position.y, angle = m.angle) {
			const handleWidth = 20;
			const handleHeight = 150;
			const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
			const pommelWidth = 30;
			const pommelHeight = 40;
			const pommelVertices = [
				{ x: x, y: y + handleHeight / 2 + pommelHeight / 2 },
				{ x: x + pommelWidth / 2, y: y + handleHeight / 2 },
				{ x: x, y: y + handleHeight / 2 - pommelHeight / 2 },
				{ x: x - pommelWidth / 2, y: y + handleHeight / 2 },
			];
			const pommel = Bodies.fromVertices(x, y + handleHeight / 2, pommelVertices, spawn.propsIsNotHoldable);
			const bladeWidth = 100 * (tech.soundSword ? 3 : 1);
			const bladeHeight = 20 * (tech.soundSword ? 3 : 1);
			const numBlades = 15;
			const extensionFactor = 5;
			const bladeSegments = [];
			bladeSegments.push(handle);
			if ((angle > -Math.PI / 2 && angle < Math.PI / 2)) {
				for (let i = 0; i < numBlades; i++) {
					const extensionFactorFraction = (i / (numBlades - 1)) * extensionFactor;
					const bladeX = x + i * (bladeWidth / 20);
					const bladeY = y - handleHeight / 2 - i * (bladeHeight / 4.5) * extensionFactor;
		
					const vertices = [
						{ x: bladeX, y: bladeY - bladeHeight / 2 }, 
						{ x: bladeX + bladeWidth / 2, y: bladeY + bladeHeight / 2 },
						{ x: bladeX - bladeWidth / 2, y: bladeY + bladeHeight / 2 },
						{ x: bladeX, y: bladeY - bladeHeight / 2 + 10 },
					];
		
					const blade = Bodies.fromVertices(bladeX, bladeY, vertices, spawn.propsIsNotHoldable);
					Matter.Body.rotate(blade, -Math.sin(i * (Math.PI / 270) * 15));
					bladeSegments.push(blade);
				}
			} else {
				for (let i = 0; i < numBlades; i++) {
					const extensionFactorFraction = (i / (numBlades - 1)) * extensionFactor;
					const mirroredBladeX = x - i * (bladeWidth / 20);
					const mirroredBladeY = y - handleHeight / 2 - i * (bladeHeight / 4.5) * extensionFactor;
					const mirroredVertices = [
						{ x: mirroredBladeX, y: mirroredBladeY - bladeHeight / 2 },
						{ x: mirroredBladeX + bladeWidth / 2, y: mirroredBladeY + bladeHeight / 2 },
						{ x: mirroredBladeX - bladeWidth / 2, y: mirroredBladeY + bladeHeight / 2 },
						{ x: mirroredBladeX, y: mirroredBladeY - bladeHeight / 2 + 10 },
					];
					const mirroredBlade = Bodies.fromVertices(mirroredBladeX, mirroredBladeY, mirroredVertices, spawn.propsIsNotHoldable);
					Matter.Body.rotate(mirroredBlade, Math.sin(i * (Math.PI / 270) * 15));
					bladeSegments.push(mirroredBlade);
				}
			}
			bladeSegments.push(pommel);
			const sword = Body.create({
				parts: [...bladeSegments],
			});
			Composite.add(engine.world, sword);
			Matter.Body.setPosition(sword, { x, y });
			sword.collisionFilter.category = cat.bullet;
			sword.collisionFilter.mask = cat.mobBullet | cat.powerup | cat.mob;
			Body.scale(sword, -1, 1, { x, y });
			return { sword, bladeSegments };
		},
		greatSword(position = player.position) {
			let x = position.x;
			let y = position.y;
			const handleWidth = 20;
			const handleHeight = 120;
			const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
			bullet[bullet.length] = handle;
			handle.customName = "handle";
			bullet[bullet.length - 1].do = () => {};
			const pommelWidth = 30;
			const pommelHeight = 40;
			const pommelVertices = [
				{ x: x, y: y + handleHeight / 2 + pommelHeight / 2 },
				{ x: x + pommelWidth / 2, y: y + handleHeight / 2 },
				{ x: x, y: y + handleHeight / 2 - pommelHeight / 2 },
				{ x: x - pommelWidth / 2, y: y + handleHeight / 2 },
			];
			const pommel = Bodies.fromVertices(x, y + handleHeight / 2, pommelVertices, spawn.propsIsNotHoldable);
			const crossWidth = 50;
			const crossHeight = 15;
			const crossVertices = [
				{ x: x + crossWidth, y: y },
				{ x: x, y: y - crossHeight},
				{ x: x - crossWidth, y: y },
				{ x: x, y: y + crossHeight},
			];
			const cross = Bodies.fromVertices(x, y - handleHeight / 2, crossVertices, spawn.propsIsNotHoldable);
			const leftOuterVertices = [
				{ x: x, y: y - 95 },
				{ x: x + 15, y: y - 120 },
				{ x: x + 15, y: y },
				{ x: x, y: y },
			];
			const leftOuter = Bodies.fromVertices(x + 15, y - handleHeight, leftOuterVertices, spawn.propsIsNotHoldable);
			bullet[bullet.length] = leftOuter;
			bullet[bullet.length - 1].do = () => {};
			const rightOuterVertices = [
				{ x: x, y: y - 95 },
				{ x: x - 15, y: y - 120 },
				{ x: x - 15, y: y },
				{ x: x, y: y },
			];
			const rightOuter = Bodies.fromVertices(x - 15, y - handleHeight, rightOuterVertices, spawn.propsIsNotHoldable);
			const cross2Width = 20;
			const cross2Height = 30;
			const cross2Vertices = [
				{ x: x + cross2Width, y: y },
				{ x: x, y: y - cross2Height},
				{ x: x - cross2Width, y: y },
				{ x: x, y: y + cross2Height},
			];
			const cross2 = Bodies.fromVertices(x, y - handleHeight - 95, cross2Vertices, spawn.propsIsNotHoldable);
			const leftHigherVertices = [
				{ x: x, y: y + 95 },
				{ x: x + 15, y: y + 120 },
				{ x: x + 15, y: y },
				{ x: x, y: y - 50 },
			];
			const leftHigher = Bodies.fromVertices(x + 15, y - handleHeight * 2 - 85, leftHigherVertices, spawn.propsIsNotHoldable);
			const rightHigherVertices = [
				{ x: x, y: y + 95 },
				{ x: x - 15, y: y + 120 },
				{ x: x - 15, y: y },
				{ x: x, y: y - 50 },
			];
			const rightHigher = Bodies.fromVertices(x - 15, y - handleHeight * 2 - 85, rightHigherVertices, spawn.propsIsNotHoldable);
			const decor1Vertices = [
				{ x: x, y: y },
				{ x: x + 10, y: y },
				{ x: x + 40, y: y - 70},
				{ x: x + 30, y: y - 70 },
			];
			const decor1 = Bodies.fromVertices(x + 30, y - handleHeight / 2 - 50, decor1Vertices, spawn.propsIsNotHoldable);
			const decor2Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x - 80, y: y - 120},
				{ x: x - 70, y: y - 120 },
			];
			const decor2 = Bodies.fromVertices(x + 10, y - handleHeight / 2 - 150, decor2Vertices, spawn.propsIsNotHoldable);
			const decor3Vertices = [
				{ x: x, y: y },
				{ x: x + 10, y: y },
				{ x: x + 40, y: y - 70},
				{ x: x + 40, y: y - 80 },
			];
			const decor3 = Bodies.fromVertices(x - 10, y - handleHeight / 2 - 247, decor3Vertices, spawn.propsIsNotHoldable);
			const decor4Vertices = [
				{ x: x, y: y + 6},
				{ x: x - 10, y: y + 6 },
				{ x: x - 40, y: y - 70},
				{ x: x - 30, y: y - 70 },
			];
			const decor4 = Bodies.fromVertices(x - 30, y - handleHeight / 2 - 47, decor4Vertices, spawn.propsIsNotHoldable);						
			const decor5Vertices = [
				{ x: x, y: y },
				{ x: x + 10, y: y },
				{ x: x + 80, y: y - 120},
				{ x: x + 70, y: y - 120 },
			];
			const decor5 = Bodies.fromVertices(x - 10, y - handleHeight / 2 - 150, decor5Vertices, spawn.propsIsNotHoldable);
			const decor6Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x - 35, y: y - 70},
				{ x: x - 35, y: y - 80 },
			];
			const decor6 = Bodies.fromVertices(x + 12, y - handleHeight / 2 - 246, decor6Vertices, spawn.propsIsNotHoldable);
			const sword = Body.create({
				parts: [handle, leftOuter, rightOuter, rightHigher, decor1, decor2, decor3, leftHigher, decor4, decor5, decor6, pommel, cross, cross2],
			});
			Composite.add(engine.world, sword);
			Matter.Body.setPosition(sword, { 
				x: x, 
				y: y
			});
			Matter.Body.setVelocity(sword, { 
				x: 0, 
				y: 0
			});
			sword.collisionFilter.category = cat.bullet;
			sword.collisionFilter.mask = cat.mobBullet | cat.powerup | cat.mob | cat.body | cat.bullet;
			Body.scale(sword, -1, 1, { x, y });
			return { sword, bladeSegments: [rightOuter, rightHigher, decor1, decor4, leftOuter, decor2, decor3, leftHigher, decor5, decor6, pommel, cross, cross2] };
        },
		longSword(position = player.position) {
			let x = position.x;
			let y = position.y;
			const handleWidth = 20;
			const handleHeight = 180;
			const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
			const eye = Bodies.circle(x, y - handleHeight / 2, 20, spawn.propsIsNotHoldable);
			const pommelWidth = 30;
			const pommelHeight = 40;
			const pommelVertices = [
				{ x: x, y: y + handleHeight / 2 + pommelHeight / 2 },
				{ x: x + pommelWidth / 2, y: y + handleHeight / 2 },
				{ x: x, y: y + handleHeight / 2 - pommelHeight / 2 },
				{ x: x - pommelWidth / 2, y: y + handleHeight / 2 },
			];
			const pommel = Bodies.fromVertices(x, y + handleHeight / 2, pommelVertices, spawn.propsIsNotHoldable);
			const crossWidth = 50;
			const crossHeight = 15;
			const crossVertices = [
				{ x: x + crossWidth, y: y },
				{ x: x, y: y - crossHeight},
				{ x: x - crossWidth, y: y },
				{ x: x, y: y + crossHeight},
			];
			const cross = Bodies.fromVertices(x, y - handleHeight / 2, crossVertices, spawn.propsIsNotHoldable);					
			const blade1Vertices = [
				{ x: x, y: y - 750 },
				{ x: x + 15, y: y - 650 },
				{ x: x + 10, y: y },
				{ x: x - 10, y: y },
				{ x: x - 15, y: y - 650 },
			];
			const blade1 = Bodies.fromVertices(x, y - handleHeight - 290, blade1Vertices, spawn.propsIsNotHoldable);					
			const blade2Vertices = [
				{ x: x + 20, y: y },
				{ x: x, y: y - 30 },
				{ x: x - 20, y: y },
				{ x: x, y: y + 10 },
			];
			const blade2 = Bodies.fromVertices(x, y - handleHeight + 50, blade2Vertices, spawn.propsIsNotHoldable);		
			const cross2Vertices = [
				{ x: x, y: y - 10 },
				{ x: x + 27, y: y },
				{ x: x, y: y + 10 },
				{ x: x - 7, y: y },
			];
			const cross2 = Bodies.fromVertices(x - crossWidth, y - handleHeight / 2, cross2Vertices, spawn.propsIsNotHoldable);				
			const cross3Vertices = [
				{ x: x, y: y - 10 },
				{ x: x + 7, y: y },
				{ x: x, y: y + 10 },
				{ x: x - 27, y: y },
			];
			const cross3 = Bodies.fromVertices(x + crossWidth, y - handleHeight / 2, cross3Vertices, spawn.propsIsNotHoldable);				
			const cross4Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x - 15, y: y + 50 },
			];
			const cross4 = Bodies.fromVertices(x + crossWidth, y - handleHeight / 2 + 25, cross4Vertices, spawn.propsIsNotHoldable);				
			const cross5Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x + 5, y: y + 50 },
			];
			const cross5 = Bodies.fromVertices(x - crossWidth, y - handleHeight / 2 + 25, cross5Vertices, spawn.propsIsNotHoldable);				
			const cross6Vertices = [
				{ x: x, y: y - 50 },
				{ x: x + 10, y: y },
				{ x: x, y: y + 50 },
				{ x: x - 10, y: y },
			];
			const cross6 = Bodies.fromVertices(x, y - handleHeight / 2, cross6Vertices, spawn.propsIsNotHoldable);		
			const cross7Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x - 15, y: y - 50 },
			];
			const cross7 = Bodies.fromVertices(x + crossWidth, y - handleHeight / 2 - 25, cross7Vertices, spawn.propsIsNotHoldable);				
			const cross8Vertices = [
				{ x: x, y: y },
				{ x: x - 10, y: y },
				{ x: x + 5, y: y - 50 },
			];
			const cross8 = Bodies.fromVertices(x - crossWidth, y - handleHeight / 2 - 25, cross8Vertices, spawn.propsIsNotHoldable);		
			const slitVertices = [
				{ x: x, y: y - 20 },
				{ x: x + 5, y: y },
				{ x: x, y: y + 20 },
				{ x: x - 5, y: y },
			];
			const slit = Bodies.fromVertices(x, y - handleHeight / 2, slitVertices, spawn.propsIsNotHoldable);	
			const sword = Body.create({
				parts: [handle, pommel, blade1, blade2, cross4, cross5, cross7, cross8, cross, cross2, cross3, cross6, eye, slit],
			});
			Composite.add(engine.world, sword);
			Matter.Body.setPosition(sword, { 
				x: x, 
				y: y
			});
			Matter.Body.setVelocity(sword, { 
				x: 0, 
				y: 0
			});
			sword.collisionFilter.category = cat.bullet;
			sword.collisionFilter.mask = cat.mobBullet | cat.powerup | cat.mob | cat.body | cat.bullet;
			sword.restitution = 0;
			Body.scale(sword, -1, 1, { x, y });
			return { sword, bladeSegments: [handle, pommel, blade1, blade2, cross4, cross5, cross7, cross8, cross, cross2, cross3, cross6, eye, slit] };
		},
		renderDefault() {
			if(this.sword) {
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}
	
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
	
					const alphaStep = 1 / trail.length;
					let alpha = 0;
	
					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.beginPath();
						ctx.moveTo(vertices[0].x, vertices[0].y);
	
						for (let k = 1; k < vertices.length; k++) {
							ctx.lineTo(vertices[k].x, vertices[k].y);
						};
	
						alpha += alphaStep;
						ctx.closePath();
						if(tech.isEnergyHealth) {
							const eyeColor = m.fieldMeterColor;    
							const r = eyeColor[1];
							const g = eyeColor[2];
							const b = eyeColor[3];
							const color = `#${r}${r}${g}${g}${b}${b}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
							ctx.fillStyle = color;
						} else {
							ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`;
						}
						ctx.fill();
					}
				}
				if(!tech.greatSword) {
					for(let i = 0; i < this.bladeSegments.length; i++) {
						ctx.beginPath();
						ctx.lineJoin = "miter";
						ctx.miterLimit = 100;
						ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : tech.isAmmoSword ? "#c0c0c0" : "crimson";
						ctx.lineWidth = 5;
						ctx.fillStyle = "black";
						ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
						for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
							ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
						};
						ctx.closePath();
						ctx.stroke();
						ctx.fill();
						ctx.lineJoin = "round";
						ctx.miterLimit = 10;
					}
				}
			}
		},		
		renderLongsword() {
			if(this.sword) {
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const tip = blade.vertices[1];
					const base = blade.vertices[blade.vertices.length - 2];

					trail.push({ tip: { x: tip.x, y: tip.y }, base: { x: base.x, y: base.y } });

					if (trail.length > 15) {
						trail.shift();
					}

					this.bladeTrails[i] = trail;
				}
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
					if (this.bladeTrails[2] != trail) continue;
					ctx.save();
					ctx.beginPath();
					const gradient = ctx.createLinearGradient(
						trail[0].tip.x, trail[0].tip.y, 
						trail[trail.length - 1].tip.x, trail[trail.length - 1].tip.y
					);
					gradient.addColorStop(0, "rgba(180, 0, 220, 0)");
					gradient.addColorStop(1, "rgba(220, 220, 220, 1)");
					ctx.fillStyle = gradient;
					ctx.moveTo(trail[0].tip.x, trail[0].tip.y);
					for (let j = 1; j < trail.length; j++) {
						ctx.lineTo(trail[j].tip.x, trail[j].tip.y);
					}
					for (let j = trail.length - 1; j >= 0; j--) {
						ctx.lineTo(trail[j].base.x, trail[j].base.y);
					}
					ctx.closePath();
					ctx.fill();
					ctx.restore();
				}
				for(let i = 0; i < this.bladeSegments.length; i++) {
					ctx.save();
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "rgba(180, 0, 220, 0.2)";
					ctx.lineWidth = 15;
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.stroke();
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "rgba(180, 0, 220, 0.8)";
					ctx.lineWidth = 10;
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.stroke();
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "white";
					ctx.lineWidth = 5;
					ctx.fillStyle = "black";
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}
			}
		},
		renderSoundSword() {
			if (this.sword) {
				color.bullet = "transparent";
				if(this.cycle > 20 && (!tech.isStabSword && !input.down)) {
					this.cycle = 0;
					Matter.Body.setAngularVelocity(this.sword, 0);
					player.force.x *= 0.01;
					player.force.y *= 0.01;
					Composite.remove(engine.world, this.sword);
					this.sword.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.sword = undefined;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
					m.fireCDcycle = m.cycle + 10;
				}
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}
	
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
	
					const alphaStep = 0.01 / trail.length;
					let alpha = 0;
	
					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.beginPath();
						ctx.moveTo(vertices[0].x, vertices[0].y);
	
						for (let k = 1; k < vertices.length; k++) {
							ctx.lineTo(vertices[k].x, vertices[k].y);
						};
	
						alpha += alphaStep;
						ctx.closePath();
						if(tech.isEnergyHealth) {
							const eyeColor = m.fieldMeterColor;    
							const r = eyeColor[1];
							const g = eyeColor[2];
							const b = eyeColor[3];
							const color = `#${r}${r}${g}${g}${b}${b}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
							ctx.fillStyle = color;
						} else {
							ctx.fillStyle = `rgba(60, 10, 60, ${alpha})`;
						}
						ctx.fill();
					}
				}
				for(let i = 0; i < this.bladeSegments.length; i++) {
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : `rgba(60, 10, 60, 0.01)`;
					ctx.lineWidth = 5;
					ctx.fillStyle = "transparent";
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.stroke();
					ctx.fill();
					ctx.lineJoin = "round";
					ctx.miterLimit = 10;
				}
			} else {
				color.bullet = "black"
			}
		},
		collision() {
			if(this.sword) {
				for (let i = 0; i < mob.length; i++) {
					if (Matter.Query.collides(this.sword, [mob[i]]).length > 0) {
						const dmg = (m.damageDone ? m.damageDone : m.dmgScale) * Math.sqrt(this.sword.speed) * (tech.sizeIllusion ? 1.1 : 1) * (tech.isStabSword ? 1.5 : 1) * (tech.infinityEdge ? 1.1 : 1) * (tech.greatSword ? 2 : 1) * (tech.longSword ? 1.7 : 1);
						if(!tech.soundSword) {
							if(m.health < m.maxHealth) {
								if(tech.isEnergyHealth) {
									m.energy += 0.04;
								} else {
									m.health += 0.01 * (dmg - mob[i].health);
									m.displayHealth();
								}
							} else {
								if(tech.isEnergyHealth) {
									m.energy += 0.04;
								} else {
									m.health = m.maxHealth;
									m.displayHealth();
								}
							}
						}
						mob[i].damage(dmg, true);
						simulation.drawList.push({
							x: mob[i].position.x,
							y: mob[i].position.y,
							radius: Math.abs(Math.log(dmg * this.sword.speed) * 40 * mob[i].damageReduction + 3),
							color: (tech.soundSword ? "rgba(0, 0, 0, 0.3)": simulation.mobDmgColor),
							time: simulation.drawTime
						});
						if(!tech.soundSword && !tech.greatSword) {
							const angle = Math.atan2(mob[i].position.y - this.sword.position.y, mob[i].position.x - this.sword.position.x);
							this.sword.force.x -= Math.cos(angle) * 10;
							this.sword.force.y -= Math.sin(angle) * 10;
						}
						break
					}
				}
			}
		}
	};
	b.guns.push(e);
	const gunArray = b.guns.filter(
	(obj, index, self) =>
		index === self.findIndex((item) => item.name === obj.name)
	);
	b.guns = gunArray;
	const t = [
		{
			name: "size-weight illusion",
			descriptionFunction() {
				return `follow your cursor when sword is active<br><b>1.1x</b> <b class="color-d">damage</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("sword") && !tech.isStabSword
			},
			requires: "sword",
			effect() {
				tech.sizeIllusion = true;
			},
			remove() {
				tech.sizeIllusion = false;
			}
		},		
		{
			name: "silicon carbide",
			descriptionFunction() {
				return `crouch hold fire to charge <b>stab</b><br><b>1.5x</b> <b class="color-d">damage</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() { 
				return tech.haveGunCheck("sword") && !tech.sizeIllusion && !tech.infinityEdge
			},
			requires: "sword, not cantor's theorem, not size-weight illusion",
			effect() {
				tech.isStabSword = true;
			},
			remove() {
				tech.isStabSword = false;
			}
		},
		{
			name: "cantor's theorem",
			descriptionFunction() {
				return `sword size <b>scales</b> by <b class="color-h">health</b><br><b>1.1x</b> <b class="color-d">damage</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() { 
				return tech.haveGunCheck("sword") && !tech.isStabSword && !tech.greatSword && !tech.longSword
			},
			requires: "sword, not silicon carbide",
			effect() {
				tech.infinityEdge = true;
			},
			remove() {
				tech.infinityEdge = false;
			}
		},
		{
			name: "plasmon",
			descriptionFunction() {
				return `increase sword range by <b>3x</b><br><em>plasmon is beyond visible perception</em>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() { 
				return tech.haveGunCheck("sword") && !tech.greatSword && !tech.longSword
			},
			requires: "sword, not greatsword, longsword",
			effect() {
				tech.soundSword = true;
			},
			remove() {
				tech.soundSword = false;
			}
		},		
		{
			name: "greatsword",
			descriptionFunction() {
				return `<b>2x</b> sword <b class="color-d">damage</b><br><b>0.75x</b> sword <b class="color-speed">speed</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() { 
				return tech.haveGunCheck("sword") && !tech.infinityEdge && !tech.soundSword && !tech.longSword
			},
			requires: "sword, not plasmon, canton's theorem",
			effect() {
				tech.greatSword = true;
			},
			remove() {
				tech.greatSword = false;
				for (let i = 0, len = b.inventory.length; i < len; ++i) {
					if(b.guns[b.inventory[i]].name === "sword" && !m.alive) {
						b.guns[b.inventory[i]].cycle = 0;
						b.guns[b.inventory[i]].haveEphemera = false;
					}
				}
			}
		},		
		{
			name: "longsword",
			descriptionFunction() {
				return `<b>1.7x</b> sword <em>length</em> and <b class="color-d">damage</b><br><b>0.6x</b> swing <b class="color-speed">speed</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() { 
				return tech.haveGunCheck("sword") && !tech.infinityEdge && !tech.soundSword && !tech.greatSword
			},
			requires: "sword, not plasmon, canton's theorem",
			effect() {
				tech.longSword = true;
			},
			remove() {
				tech.longSword = false;
			}
		},
	];
	t.reverse();
	for(let i = 0; i < tech.tech.length; i++) {
		if(tech.tech[i].name === 'spherical harmonics') {
			for(let j = 0; j < t.length; j++) {
				tech.tech.splice(i, 0, t[j]);
			}
			break;
		}
	}
	const techArray = tech.tech.filter(
		(obj, index, self) =>
			index === self.findIndex((item) => item.name === obj.name)
		);
	tech.tech = techArray;
	console.log("%cSword mod successfully installed", "color: crimson");
})();


// ========================================

javascript:(function() {
	const e = {
		name: "scythe",
		descriptionFunction() { return `throw a <b>scythe</b> that keeps velocity upon collisions<br>drains <strong class='color-h'>health</strong> instead of ammunition<br>doesn't use <b>ammo</b>`},
		ammo: Infinity,
		ammoPack: Infinity,
		defaultAmmoPack: Infinity,
		have: false,
		fire() {},
		cycle: 0,
		cycle2: 0,
		scythe: undefined,
		bladeSegments: undefined,
		bladeTrails: [],
		angle: 0,
		constraint: undefined,
		durability: 200,
		maxDurability: 200,
		haveEphemera: false,
		right: true,
		do() {
			if(this.cycle2 === 0) {
				const oldEffect = powerUps.ammo.effect;
				powerUps.ammo.effect = () => {
					oldEffect();
					for (let i = 0, len = b.inventory.length; i < len; ++i) {
						if(b.guns[b.inventory[i]].name === "scythe" && tech.durabilityScythe) {
							b.guns[b.inventory[i]].durability += (tech.isAmmoForGun && b.guns[b.activeGun].name === 'scythe') ? 30 : 15;
						}
					}
				}
			}
			this.cycle2++;
			if(!this.haveEphemera) {
				this.haveEphemera = true;
				simulation.ephemera.push({
					name: "scythe",
					do() {
						if(b.guns[b.activeGun].name !== 'scythe') {
							for (let i = 0, len = b.inventory.length; i < len; ++i) {
								if(b.guns[b.inventory[i]].name === "scythe" && b.guns[b.inventory[i]].scythe) {
									b.guns[b.inventory[i]].cycle = 0;
									if(b.guns[b.inventory[i]].constraint) {
										Composite.remove(engine.world, b.guns[b.inventory[i]].constraint);
										b.guns[b.inventory[i]].constraint = undefined;
									}
									Composite.remove(engine.world, b.guns[b.inventory[i]].scythe);
									b.guns[b.inventory[i]].scythe.parts.forEach(part => {
										Composite.remove(engine.world, part);
										const index = bullet.indexOf(part);
										if (index !== -1) {
											bullet.splice(index, 1);
										}
									});
									b.guns[b.inventory[i]].scythe = undefined;
									b.guns[b.inventory[i]].bladeTrails = [];
								}
							}
						}
						for (let i = 0, len = b.inventory.length; i < len; ++i) {
							if(b.guns[b.inventory[i]].name === "scythe" && tech.durabilityScythe) {
								document.getElementById(b.inventory[i]).innerHTML = `${b.guns[b.inventory[i]].name} - ${b.guns[b.inventory[i]].durability}/${b.guns[b.inventory[i]].maxDurability} <em style="font-size: 20px;">durability</em>`
							}
						}
					},
				})
			}
			if(tech.isAmmoScythe) {
				this.ammoPack = 1;
				this.defaultAmmoPack = 1;
			} else {
				this.ammo = Infinity;
				this.ammoPack = Infinity;
				this.defaultAmmoPack = Infinity;
			}
			this.durability = Math.max(0, Math.min(this.durability, this.maxDurability));
			if (b.activeGun !== null && input.fire && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11) && this.durability > 0) {
				if (!this.scythe && b.guns[b.activeGun].name === 'scythe') {					
					this.angle = m.angle;
					if(tech.durabilityScythe) {
						if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
							this.right = false;
							({ scythe: this.scythe, bladeSegments: this.bladeSegments} = this.createScythe(player.position, false));
						} else {
							this.right = true;
							({ scythe: this.scythe, bladeSegments: this.bladeSegments} = this.createScythe(player.position, true));
						}
					} else {
						({ scythe: this.scythe, bladeSegments: this.bladeSegments} = this.createAndSwingScythe());
					}
					
					if(!tech.isAmmoScythe && !b.guns[b.activeGun].ammo == 0 && !tech.durabilityScythe) {
						if(tech.isEnergyHealth) {
							m.energy -= 0.1;
							if(tech.isPhaseScythe) {
								m.immuneCycle = this.cycle;
							}
						} else {
							m.health -= 0.1;
							m.displayHealth();
						}
					}
				}
			}
			if(tech.durabilityScythe) {
				if (!(m.angle > -Math.PI / 2 && m.angle < Math.PI / 2) && this.right == true && this.scythe) {
					Matter.Body.setAngularVelocity(this.scythe, 0);
					Composite.remove(engine.world, this.scythe);
					this.scythe.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.scythe = undefined;
					this.bladeTrails = [];
					m.fireCDcycle = 0;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
				} else if((m.angle > -Math.PI / 2 && m.angle < Math.PI / 2) && this.right == false && this.scythe) {
					Matter.Body.setAngularVelocity(this.scythe, 0);
					Composite.remove(engine.world, this.scythe);
					this.scythe.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.scythe = undefined;
					this.bladeTrails = [];
					m.fireCDcycle = 0;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
				}
				if(this.scythe && (!input.fire || !this.durability)) {
					Matter.Body.setAngularVelocity(this.scythe, 0);
					Composite.remove(engine.world, this.scythe);
					this.scythe.parts.forEach(part => {
						Composite.remove(engine.world, part);
						const index = bullet.indexOf(part);
						if (index !== -1) {
							bullet.splice(index, 1);
						}
					});
					this.scythe = undefined;
					this.bladeTrails = [];
					m.fireCDcycle = 0;
					if(this.constraint) {
						Composite.remove(engine.world, this.constraint);
						this.constraint = undefined;
					}
				}
			}
			if(this.scythe && m.cycle > this.cycle + 30 && !tech.durabilityScythe) {
				Matter.Body.setAngularVelocity(this.scythe, 0);
				Composite.remove(engine.world, this.scythe);
				this.scythe.parts.forEach(part => {
					Composite.remove(engine.world, part);
					const index = bullet.indexOf(part);
					if (index !== -1) {
						bullet.splice(index, 1);
					}
				});
				this.scythe = undefined;
				this.bladeTrails = [];
				m.fireCDcycle = 0;
				if(this.constraint) {
					Composite.remove(engine.world, this.constraint);
					this.constraint = undefined;
				}
			} else {
				if (this.scythe && !tech.isMeleeScythe && !tech.durabilityScythe) {
					if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
						Matter.Body.setAngularVelocity(this.scythe, -Math.PI * 0.15 - (tech.scytheRad ? tech.scytheRad * 0.1 : 0));
					} else {
						Matter.Body.setAngularVelocity(this.scythe, Math.PI * 0.15 + (tech.scytheRad ? tech.scytheRad * 0.1 : 0));
					}
					Matter.Body.setVelocity(this.scythe, {
						x: Math.cos(this.angle) * 30,
						y: Math.sin(this.angle) * 30
					});
				} else if(this.scythe && (tech.isMeleeScythe || tech.durabilityScythe)) {
					if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
						Matter.Body.setAngularVelocity(this.scythe, -Math.PI * 0.1 + (tech.isStunScythe ? 0.1 : 0) - (tech.scytheRad ? tech.scytheRad * 0.1 : 0));
					} else {
						Matter.Body.setAngularVelocity(this.scythe, Math.PI * 0.1 - (tech.isStunScythe ? 0.1 : 0) + (tech.scytheRad ? tech.scytheRad * 0.1 : 0));
					}
					if(tech.durabilityScythe) {
						if(!this.constraint) {
							if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
								this.constraint = Constraint.create({
									pointA: player.position,
									bodyB: this.scythe,
									pointB: {x: 50, y: 100},
									stiffness: 0.9,
									damping: 0.001
								});
								Composite.add(engine.world, this.constraint);
							} else {
								this.constraint = Constraint.create({
									pointA: player.position,
									bodyB: this.scythe,
									pointB: {x: -50, y: 100},
									stiffness: 0.9,
									damping: 0.001
								});
								Composite.add(engine.world, this.constraint);
							}
						} 
					} else {
						Matter.Body.setPosition(this.scythe, player.position);
					}
				}
			}
			if(this.scythe) {
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}
	
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
	
					const alphaStep = 1 / trail.length;
					let alpha = 0;
	
					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.beginPath();
						ctx.moveTo(vertices[0].x, vertices[0].y);
	
						for (let k = 1; k < vertices.length; k++) {
							ctx.lineTo(vertices[k].x, vertices[k].y);
						};
	
						alpha += alphaStep;
						ctx.closePath();
						if(tech.isEnergyHealth) {
							const eyeColor = m.fieldMeterColor;    
							const r = eyeColor[1];
							const g = eyeColor[2];
							const b = eyeColor[3];
							const color = `#${r}${r}${g}${g}${b}${b}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
							ctx.fillStyle = color;
						} else if (tech.isAmmoScythe) {
							ctx.fillStyle = `#c0c0c0${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
						} else if (tech.isStunScythe) {
							ctx.fillStyle = `#4b0082${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
						} else {
							ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`;
						}
						ctx.fill();
					}
				}
				for(let i = 0; i < this.bladeSegments.length; i++) {
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : tech.isAmmoScythe ? "#c0c0c0" : tech.isStunScythe ? "indigo" : "crimson";
					ctx.lineWidth = 5;
					ctx.fillStyle = "black";
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.stroke();
					ctx.fill();
					ctx.lineJoin = "round";
					ctx.miterLimit = 10;
				}
			}
			if(this.scythe) {
				for (let i = 0; i < mob.length; i++) {
					if (Matter.Query.collides(this.scythe, [mob[i]]).length > 0) {
						if(tech.durabilityScythe) {
							this.durability--;
						}
						const dmg = (m.damageDone ? m.damageDone : m.dmgScale) * 0.12 * 2.73 * (tech.isLongBlade ? 1.3 : 1) * (tech.scytheRange ? tech.scytheRange * 1.15 : 1) * (tech.isDoubleScythe ? 0.9 : 1) * (tech.scytheRad ? tech.scytheRad * 1.5 : 1);
						mob[i].damage(dmg, true);
						simulation.drawList.push({
							x: mob[i].position.x,
							y: mob[i].position.y,
							radius: Math.sqrt(dmg) * 50,
							color: simulation.mobDmgColor,
							time: simulation.drawTime
						});
						if(!tech.isMeleeScythe) {
							const angle = Math.atan2(mob[i].position.y - this.scythe.position.y, mob[i].position.x - this.scythe.position.x);
							this.scythe.force.x += Math.cos(angle) * 2;
							this.scythe.force.y += Math.sin(angle) * 2;
						}
						if(tech.isStunScythe) {
							mobs.statusStun(mob[i], 90);
						}
						break
					}
				}
			}
		},
		createAndSwingScythe(x = player.position.x, y = player.position.y, angle = m.angle) {
			if (this.cycle < m.cycle) {
				this.cycle = m.cycle + 60 + (tech.scytheRange * 6);
				m.fireCDcycle = Infinity;
				const handleWidth = 20;
				const handleHeight = 200 + (tech.isLongBlade ? 30 : 0) + (tech.isMeleeScythe ? 140 : 0);
				const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
				bullet[bullet.length] = handle;
				bullet[bullet.length - 1].do = () => {};
				const bladeWidth = 100;
				const bladeHeight = 20;
				const numBlades = 10 + (tech.isLongBlade ? 1 : 0) + (tech.isMeleeScythe ? 2 : 0);
				const extensionFactor = 5.5;
				const bladeSegments = [];
				if(!tech.isDoubleScythe) {
					for (let i = 0; i < numBlades; i++) {
						const extensionFactorFraction = (i / (numBlades - 1)) * extensionFactor;
						const bladeX = x - handleWidth / 2 + i * (bladeWidth / 2) - extensionFactorFraction * (bladeWidth / 2);
						const bladeY = y + handleHeight / 2 - i * (bladeHeight / (3 ** i));
			
						const vertices = [
							{ x: bladeX, y: bladeY - bladeHeight / 2 }, 
							{ x: bladeX + bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX - bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX, y: bladeY - bladeHeight / 2 + 10 },
						];
			
						const blade = Bodies.fromVertices(bladeX, bladeY, vertices, spawn.propsIsNotHoldable);
						bullet[bullet.length] = blade;
						bullet[bullet.length - 1].do = () => {};
						Matter.Body.rotate(blade, -Math.sin(i * (Math.PI / 180) * 5));
						bladeSegments.push(blade);
					}
				} else {
					for (let i = 0; i < numBlades; i++) {
						const extensionFactorFraction = (i / (numBlades - 1)) * extensionFactor;
						const bladeX = x - handleWidth / 2 + i * (bladeWidth / 2) - extensionFactorFraction * (bladeWidth / 2);
						const bladeY = y + handleHeight / 2 - i * (bladeHeight / (3 ** i));
			
						const vertices = [
							{ x: bladeX, y: bladeY - bladeHeight / 2 }, 
							{ x: bladeX + bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX - bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX, y: bladeY - bladeHeight / 2 + 10 },
						];
			
						const blade = Bodies.fromVertices(bladeX, bladeY, vertices, spawn.propsIsNotHoldable);
						bullet[bullet.length] = blade;
						bullet[bullet.length - 1].do = () => {};
						Matter.Body.rotate(blade, -Math.sin(i * (Math.PI / 180) * 5));
						bladeSegments.push(blade);
					}

					for (let i = 0; i < numBlades; i++) {
						const extensionFactorFraction = (i / (numBlades - 1)) * extensionFactor;
						const bladeX = x + handleWidth / 2 - i * (bladeWidth / 2) + extensionFactorFraction * (bladeWidth / 2);
						const bladeY = y - handleHeight / 2 - i * (bladeHeight / (3 ** i));
			
						const vertices = [
							{ x: bladeX, y: bladeY - bladeHeight / 2 }, 
							{ x: bladeX + bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX - bladeWidth / 2, y: bladeY + bladeHeight / 2 },
							{ x: bladeX, y: bladeY - bladeHeight / 2 + 10 },
						];
			
						const blade = Bodies.fromVertices(bladeX, bladeY, vertices, spawn.propsIsNotHoldable);
						bullet[bullet.length] = blade;
						bullet[bullet.length - 1].do = () => {};
						Matter.Body.rotate(blade, -Math.sin(i * (Math.PI / 180) * 5) + Math.PI);
						bladeSegments.push(blade);
					}
				}
				const scythe = Body.create({
					parts: [handle, ...bladeSegments],
				});
		
				Composite.add(engine.world, scythe);
				Matter.Body.setPosition(scythe, { x, y });
		
				scythe.collisionFilter.category = cat.bullet;
				scythe.collisionFilter.mask = cat.mobBullet | cat.mob;
		
				if ((angle > -Math.PI / 2 && angle < Math.PI / 2)) {
					Body.scale(scythe, -1, 1, { x, y });
				}

				scythe.frictionAir -= 0.01;
		
				return { scythe, bladeSegments };
			}
		},
		createScythe(position = player.position, right = true) {
			let x = position.x;
			let y = position.y;
			const handleWidth = 20;
			const handleHeight = 220;

			const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
			const pommelWidth = 30;
			const pommelHeight = 40;
			const pommelVertices = [
				{ x: x, y: y + handleHeight / 2 + pommelHeight / 2 },
				{ x: x + pommelWidth / 2, y: y + handleHeight / 2 },
				{ x: x, y: y + handleHeight / 2 - pommelHeight / 2 },
				{ x: x - pommelWidth / 2, y: y + handleHeight / 2 },
			];
			const pommel = Bodies.fromVertices(x, y + handleHeight / 2, pommelVertices, spawn.propsIsNotHoldable);
			const handle2Vertices = [
				{ x: x + 120, y: y - 140},
				{ x: x + 100, y: y - 140 },
				{ x: x + 23, y: y },
				{ x: x + 3, y: y },
			];
			const handle2 = Bodies.fromVertices(x + 50, y - handleHeight / 2 - 70, handle2Vertices, spawn.propsIsNotHoldable);
			
			const joint = Bodies.polygon(x + 100, y - handleHeight - 20, 5, 30, spawn.propsIsNotHoldable);	
			
			const joint2 = Bodies.polygon(x, y - handleHeight / 2, 3, 20, spawn.propsIsNotHoldable);
			Body.rotate(joint2, Math.PI / 2)
			
			const blade1Vertices = [
				{ x: x - 5, y: y - 10},
				{ x: x - 15, y: y + 10 },
				{ x: x - 100, y: y - 35},
				{ x: x - 60, y: y},
			];
			const blade1 = Bodies.fromVertices(x + 50, y - handleHeight / 2 - 150, blade1Vertices, spawn.propsIsNotHoldable);
			
			const blade2Vertices = [
				{ x: x - 10, y: y - 10},
				{ x: x + 15, y: y + 10 },
				{ x: x - 100, y: y - 30},
				{ x: x - 60, y: y},
			];
			const blade2 = Bodies.fromVertices(x + 100, y - handleHeight / 2 - 150, blade2Vertices, spawn.propsIsNotHoldable);		
			
			const blade3Vertices = [
				{ x: x - 10, y: y - 10},
				{ x: x + 15, y: y + 10 },
				{ x: x - 90, y: y - 30},
				{ x: x - 60, y: y},
			];
			const blade3 = Bodies.fromVertices(x + 150, y - handleHeight / 2 - 130, blade3Vertices, spawn.propsIsNotHoldable);		
			
			const blade4Vertices = [
				{ x: x, y: y - 10},
				{ x: x + 15, y: y + 10},
				{ x: x - 90, y: y - 25},
				{ x: x - 60, y: y + 5},
			];
			const blade4 = Bodies.fromVertices(x - 20, y - handleHeight / 2 - 160, blade4Vertices, spawn.propsIsNotHoldable);
			
			const blade5Vertices = [
				{ x: x, y: y - 30},
				{ x: x + 15, y: y - 10},
				{ x: x - 90, y: y - 25},
				{ x: x - 60, y: y},
			];
			const blade5 = Bodies.fromVertices(x - 90, y - handleHeight / 2 - 160, blade5Vertices, spawn.propsIsNotHoldable);

			const blade6Vertices = [
				{ x: x + 10, y: y - 15},
				{ x: x + 30, y: y + 4},
				{ x: x - 90, y: y + 10},
				{ x: x - 30, y: y + 20},
			];
			const blade6 = Bodies.fromVertices(x - 150, y - handleHeight / 2 - 150, blade6Vertices, spawn.propsIsNotHoldable);
			
			const scythe = Body.create({
				parts: [handle, handle2, pommel, blade6, blade5, blade4, blade1, blade2, blade3, joint, joint2],
			});

			Composite.add(engine.world, scythe);
			Matter.Body.setPosition(scythe, { 
				x: x, 
				y: y
			});
			Matter.Body.setVelocity(scythe, { 
				x: 0, 
				y: 0
			});
			scythe.collisionFilter.category = cat.bullet;
			scythe.collisionFilter.mask = cat.mobBullet | cat.powerup | cat.mob | cat.body | cat.bullet;
			Body.scale(scythe, -1, 1); //disappears without this >:(
			if(!right) {
				Body.scale(scythe, -1, 1);
			}
			return { scythe, bladeSegments: [handle, handle2, pommel, blade6, blade5, blade4, blade1, blade2, blade3, joint, joint2] };
        },
	};
	b.guns.push(e);
	const gunArray = b.guns.filter(
	(obj, index, self) =>
		index === self.findIndex((item) => item.name === obj.name)
	);
	b.guns = gunArray;

	const t = [
		{
			name: "drawn out",
			link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Forging' class="link">drawn out</a>`,
			descriptionFunction() {
				return `<strong>+1</strong> scythe blade parts<br><strong>1.3x</strong> scythe <strong class="color-d">damage</strong>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.durabilityScythe
			},
			requires: "scythe",
			effect() {
				tech.isLongBlade = true;
			},
			remove() {
				tech.isLongBlade = false;
			}
		},
		{
			name: "Ti-6Al-4V",
			link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Ti-6Al-4V' class="link">Ti-6Al-4V</a>`,
			descriptionFunction() {
				return `<strong>1.1x</strong> scythe <strong>range</strong><br><strong>1.15x</strong> scythe <strong class="color-d">damage</strong>`
			},
			isGunTech: true,
			maxCount: 9,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.isPhaseScythe && !tech.durabilityScythe
			},
			requires: "scythe, not phase transition",
			effect() {
				tech.scytheRange = this.count;
				tech.isScytheRange = true;
			},
			remove() {
				tech.scytheRange = 0;
				tech.isScytheRange = false;
			}
		},
		{
			name: "potential flow",
			descriptionFunction() {
				return `<strong style="color: indigo;">+0.1</strong> scythe <strong style="color: indigo;">rotation radians</strong><br><strong>1.5x</strong> scythe <strong class="color-d">damage</strong>`
			},
			isGunTech: true,
			maxCount: 3,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.isMeleeScythe
			},
			requires: "scythe, not reaping",
			effect() {
				tech.isScytheRad = true;
				tech.scytheRad = this.count;
			},
			remove() {
				tech.isScytheRad = false;
				tech.scytheRad = 0;
			}
		},
		{
			name: "duality",
			descriptionFunction() {
				return `forge <strong>+1</strong> scythe blade<br><strong>0.9x</strong> scythe <strong class="color-d">damage</strong>`
			},
			link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Duality_(mathematics)' class="link">duality</a>`,
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.durabilityScythe
			},
			requires: "scythe",
			effect() {
				tech.isDoubleScythe = true;
			},
			remove() {
				tech.isDoubleScythe = false;
			}
		},
		{
			name: "phase transition",
			descriptionFunction() {
				return `when scythe is <strong>active</strong> become <strong>invulnerable</strong><br>drain <strong class="color-f">energy</strong>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.isScytheRange && tech.isEnergyHealth
			},
			requires: "scythe, mass energy, not Ti-6Al-4V",
			effect() {
				tech.isPhaseScythe = true;
			},
			remove() {
				tech.isPhaseScythe = false;
			}
		},
		{
			name: "titanium nitride",
			descriptionFunction() {
				return `scythe now uses <b>ammo</b> instead of <strong class="color-h">health</strong><br><strong>+24%</strong> <strong class='color-junk'>JUNK</strong> to <strong class='color-m'>tech</strong> pool`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && tech.isScytheRange && !tech.durabilityScythe
			},
			requires: "scythe, Ti-6Al-4V",
			effect() {
				tech.isAmmoScythe = true;
				for (let i = 0, len = b.inventory.length; i < len; ++i) {
					if(b.guns[b.inventory[i]].name === "scythe") {
						b.guns[b.inventory[i]].ammo = 17;
					}
				}
				simulation.updateGunHUD();
				this.refundAmount += tech.addJunkTechToPool(0.24);
			},
			refundAmount: 0,
			remove() {
				if (tech.isAmmoScythe) {
					tech.isAmmoScythe = false;
					simulation.updateGunHUD();
				}
				tech.isAmmoScythe = false;
				if (this.count > 0 && this.refundAmount > 0) {
					tech.removeJunkTechFromPool(this.refundAmount);
					this.refundAmount = 0;
				}
			}
		},
		{
			name: "reaping",
			descriptionFunction() {
				return `<strong>+2</strong> scythe blades and <strong>1.7x</strong> handle length<br>scythe is now swung`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && tech.isDoubleScythe && !tech.isScytheRad && !tech.durabilityScythe
			},
			requires: "scythe, duality",
			effect() {
				tech.isMeleeScythe = true;
			},
			remove() {
				tech.isMeleeScythe = false;
			}
		},
		{
			name: "neurotoxin",
			descriptionFunction() {
				return `scythe <strong>stuns</strong> mobs for 1.5 seconds<br><strong style="color: indigo;">-0.1</strong> scythe <strong style="color: indigo;">rotation radians</strong>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && (tech.isDoubleScythe && tech.isMeleeScythe) || tech.durabilityScythe
			},
			requires: "scythe, reaping",
			effect() {
				tech.isStunScythe = true;
			},
			remove() {
				tech.isStunScythe = false;
			}
		},		
		{
			name: "genetic drift",
			descriptionFunction() {
				return `<b>scythe</b> no longer drains <b class="color-h">health</b> and swung<br>scythe has <em>durability</em> and is <b>slightly longer</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("scythe") && !tech.isAmmoScythe && !tech.isMeleeScythe && !tech.scytheRange && !tech.isLongBlade && !tech.isDoubleScythe
			},
			requires: "scythe",
			effect() {
				tech.durabilityScythe = true;
			},
			remove() {
				tech.durabilityScythe = false;
				for (let i = 0, len = b.inventory.length; i < len; ++i) {
					if(b.guns[b.inventory[i]].name === "scythe" && b.guns[b.inventory[i]].maxDurability > 200) {
						b.guns[b.inventory[i]].maxDurability -= 100;
					} else {
						if(b.guns[b.inventory[i]].name === "scythe" && !m.alive) {
							b.guns[b.inventory[i]].cycle = 0;
							b.guns[b.inventory[i]].haveEphemera = false;
							b.guns[b.inventory[i]].durability = 200;
							b.guns[b.inventory[i]].maxDurability = 200;
						}
					}
				}
			}
		},
	];
	t.reverse();
	for(let i = 0; i < tech.tech.length; i++) {
		if(tech.tech[i].name === 'spherical harmonics') {
			for(let j = 0; j < t.length; j++) {
				tech.tech.splice(i, 0, t[j]);
			}
			break;
		}
	}
	const techArray = tech.tech.filter(
		(obj, index, self) =>
			index === self.findIndex((item) => item.name === obj.name)
		);
	tech.tech = techArray;
	console.log("%cscythe mod successfully installed", "color: crimson");
})();


// ========================================

javascript:(function() {
	const e = {
		name: "spear",
		descriptionFunction() { return `control a <b>spear</b> that has <em style="color: gray;">durability</em><br>spear is <b>controlled</b> by <b>cursor</b><br><strong>${tech.isAmmoForGun ? 30 - (tech.tempering ? tech.tempering : 0) : 15 - (tech.tempering ? tech.tempering : 0)}</strong> </em style="color: gray;">durability</em> per ${powerUps.orb.ammo()}`},
		ammo: Infinity,
		ammoPack: Infinity,
		defaultAmmoPack: Infinity,
        have: false,
        orbitals: [],
		bladeSegments: undefined,
		bladeTrails: [],
		spear: undefined,
		angle: undefined,
		constraint1: undefined,
		constraint2: undefined,
		cycle: 0,
		durability: 300,
		maxDurability: 300,
		haveEphemera: false,
		fire() {},
		do() {
			if(!this.haveEphemera) {
				this.haveEphemera = true;
				simulation.ephemera.push({
					name: "spear",
					do() {
						if(b.guns[b.activeGun].name !== 'spear') {
							for (let i = 0, len = b.inventory.length; i < len; ++i) {
								if(b.guns[b.inventory[i]].name === "spear" && b.guns[b.inventory[i]].spear) {
									b.guns[b.inventory[i]].cycle = 0;
									if(b.guns[b.inventory[i]].constraint1) {
										Composite.remove(engine.world, b.guns[b.inventory[i]].constraint1);
										b.guns[b.inventory[i]].constraint1 = undefined;
									}
									if(b.guns[b.inventory[i]].constraint2) {
										Composite.remove(engine.world, b.guns[b.inventory[i]].constraint2);
										b.guns[b.inventory[i]].constraint2 = undefined;
									}
									Composite.remove(engine.world, b.guns[b.inventory[i]].spear);
									b.guns[b.inventory[i]].spear.parts.forEach(part => {
										Composite.remove(engine.world, part);
										const index = bullet.indexOf(part);
										if (index !== -1) {
											bullet.splice(index, 1);
										}
									});
									b.guns[b.inventory[i]].spear = undefined;
									b.guns[b.inventory[i]].bladeTrails = [];
								}
							}
						}
						for (let i = 0, len = b.inventory.length; i < len; ++i) {
							if(b.guns[b.inventory[i]].name === "spear") {
								document.getElementById(b.inventory[i]).innerHTML = `${b.guns[b.inventory[i]].name} - ${b.guns[b.inventory[i]].durability}/${b.guns[b.inventory[i]].maxDurability} <em style="font-size: 20px;">durability</em>`
							}
						}
					},
				})
			}
			if(this.cycle === 0) {
				const oldEffect = powerUps.ammo.effect;
				powerUps.ammo.effect = () => {
					oldEffect();
					for (let i = 0, len = b.inventory.length; i < len; ++i) {
						if(b.guns[b.inventory[i]].name === "spear") {
							b.guns[b.inventory[i]].durability += (tech.isAmmoForGun && b.guns[b.activeGun].name === 'spear') ? 30 - (tech.tempering ? tech.tempering : 0): 15 - (tech.tempering ? tech.tempering : 0);
						}
					}
				}
			}
			this.cycle++;
			this.durability = Math.min(this.maxDurability, Math.max(0, this.durability));
			for (let i = 0, len = b.inventory.length; i < len; ++i) {
				if(b.guns[b.inventory[i]].name === "spear") {
					document.getElementById(b.inventory[i]).innerHTML = `${b.guns[b.inventory[i]].name} - ${this.durability}/${this.maxDurability} <em style="font-size: 20px;">durability</em>`
				}
			}
			if (input.fire && this.durability > 0 && m.fireCDcycle < m.cycle) {
				if (!this.spear && b.guns[b.activeGun].name === 'spear') {
					({ spear: this.spear, bladeSegments: this.bladeSegments} = this.createSpear(player.position));
					this.angle = m.angle;
				}
			}
			if(this.spear) {
				// Matter.Body.setVelocity(this.spear, {x: this.spear.velocity.x * 0.99, y: this.spear.velocity.y * 0.99})
				if(!this.constraint1) {
					this.constraint1 = Constraint.create({
						pointA: player.position,
						bodyB: this.spear,
						pointB: {x: Math.cos(m.angle) * -100, y: Math.sin(m.angle) * -100},
						stiffness: 0.1,
						damping: 0.0000001815,
						length: 0,
						
					});
					Composite.add(engine.world, this.constraint1);
				}
				if(!this.constraint2) {
					this.constraint2 = Constraint.create({
						pointA: simulation.mouseInGame,
						bodyB: this.spear,
						pointB: {x: Math.cos(m.angle) * 100, y: Math.sin(m.angle) * 100},
						stiffness: 0.1,
						damping: 0.0000001815,
						length: 0,
						
					});
					Composite.add(engine.world, this.constraint2);
				}
			}
			if(this.spear && !input.fire) {
				this.cycle = 0;
				if(this.constraint1) {
					Composite.remove(engine.world, this.constraint1);
					this.constraint1 = undefined;
				}
				if(this.constraint2) {
					Composite.remove(engine.world, this.constraint2);
					this.constraint2 = undefined;
				}
				Composite.remove(engine.world, this.spear);
				this.spear.parts.forEach(part => {
					Composite.remove(engine.world, part);
					const index = bullet.indexOf(part);
					if (index !== -1) {
						bullet.splice(index, 1);
					}
				});
				this.spear = undefined;
				this.bladeTrails = [];
				m.fireCDcycle = m.cycle + 10;
			}
			this.collision();
			//this.drawDurability();
			if(tech.pyroSpear && this.spear) {
				const range = 500 + 140 * Math.sin(simulation.cycle / 100);
				const dmg = 0.03 * (m.damageDone ? m.damageDone : m.dmgScale);
				for (let i = 0; i < mob.length; i++) {
					const distance = Vector.magnitude(Vector.sub(this.spear.position, mob[i].position))
					if (distance < range) {
						mob[i].damage(dmg);
						mob[i].locatePlayer();
					}
				}
				if (this.oldSpear === undefined) {
					this.oldSpear = { position: { x: 0, y: 0 } };
				}
				const t = 0.1;
				let interpolateX = (1 - t) * this.oldSpear.position.x + t * this.spear.position.x;
				let interpolateY = (1 - t) * this.oldSpear.position.y + t * this.spear.position.y;
				this.drawPerlinWaveCircle(interpolateX, interpolateY, range);
				this.oldSpear.position = this.spear.position;
			}
			if(tech.shockSpear) {
				this.renderLightning();
				if(this.spear) {
					m.energy -= 0.001;
				}
			} else if(tech.pyroSpear) {
				this.renderFlame();
			} else {
				this.renderDefault();
			}
			if(tech.spearArc && this.spear) {
				const dmg = 0.0001 * (m.damageDone ? m.damageDone : m.dmgScale);
				const arcList = [];
				const damageRadius = 1000;
				const dischargeRange = 1700;
				for (let i = 0, len = mob.length; i < len; i++) {
					if (mob[i].alive && (!mob[i].isBadTarget || mob[i].isMobBullet) && !mob[i].isInvulnerable) {
						const sub = Vector.magnitude(Vector.sub(this.spear.position, mob[i].position))
						if (sub < damageRadius + mob[i].radius) {
							arcList.push(mob[i]);
							Matter.Body.setVelocity(mob[i], {x: mob[i].velocity.x * 0.95, y:  mob[i].velocity.y * 0.95})
						}
					}
				}
				for (let i = 0; i < arcList.length; i++) {
					if (tech.spearArc * 0.1 > Math.random()) {
						const who = arcList[Math.floor(Math.random() * arcList.length)]
						who.damage(dmg * 4);
						const sub = Vector.sub(who.position, this.spear.position)
						const unit = Vector.normalise(sub)
						let len = 12
						const step = Vector.magnitude(sub) / (len + 2)
						let x = this.spear.position.x
						let y = this.spear.position.y
						ctx.beginPath();
						ctx.moveTo(x, y);
						for (let i = 0; i < len; i++) {
							x += step * (unit.x + (Math.random() - 0.5))
							y += step * (unit.y + (Math.random() - 0.5))
							ctx.lineTo(x, y);
						}
						ctx.lineTo(who.position.x, who.position.y);
						ctx.strokeStyle = "rgb(220, 20, 220)";
						ctx.lineWidth = 4 + 3 * Math.random();
						ctx.stroke();
					}
				}
			}
        },
		fade(t) {
			return t * t * t * (t * (t * 6 - 15) + 10);
		},
		lerp(t, a, b) {
			return a + t * (b - a);
		},
		grad(hash, x) {
			const h = hash & 15; // Convert low 4 bits of hash code
			const u = h < 8 ? x : 0; // Gradient value 1-8
			const v = h < 4 ? 0 : (h === 12 || h === 14 ? x : 0); // Gradient value 9-12
			return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v); // Return the final gradient
		},
		p: [],
		perm: [],
		setPerm() {
			for (let i = 0; i < 256; i++) {
				this.p[i] = Math.floor(Math.random() * 256);
			}
			for (let i = 0; i < 512; i++) {
				this.perm[i] = p[i & 255];
			}
		},
		noise(x) {
			const X = Math.floor(x) & 255;
			x -= Math.floor(x);
			const u = this.fade(x);
			return this.lerp(u, this.grad(this.perm[X], x), this.grad(this.perm[X + 1], x - 1));
		},
		drawPerlinWaveCircle(x, y, radius) {
			if(this.perm == []) {
				this.setPerm();
			}
			ctx.beginPath();
			const points = 100;
			const noiseScale = 0.9;
			const timeFactor = simulation.cycle * 0.02;
			for (let i = 0; i <= points; i++) {
				const angle = (i / points) * 2 * Math.PI; 
				
				const noiseValue = this.noise(Math.cos(angle + timeFactor) * noiseScale - timeFactor);
				
				const r = radius + (radius * noiseValue * 0.5);
				
				const xPos = x + r * Math.cos(angle);
				const yPos = y + r * Math.sin(angle);
				
				if (i === 0) {
					ctx.moveTo(xPos, yPos);
				} else {
					ctx.lineTo(xPos, yPos);
				}
			}
			const grd = ctx.createRadialGradient(x, y, 300, x, y, 1000);
			grd.addColorStop(0, `rgba(255, 69, ${Math.abs(Math.sin(simulation.cycle / 30)) * 255}, 0.8)`);
			grd.addColorStop(1, "transparent");
			ctx.closePath();
			ctx.strokeStyle = `rgba(255, 69, ${Math.abs(Math.sin(simulation.cycle / 30)) * 255}, 0.8)`;
			ctx.fillStyle = grd;
			ctx.lineWidth = 2; // Line width
			ctx.stroke();
			ctx.fill();
		},
		createSpear(position) {
			let x = position.x;
			let y = position.y;
			let angle = m.angle;
			const handleWidth = 20;
			const handleHeight = 500;

			const handle = Bodies.rectangle(x, y, handleWidth, handleHeight, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = handle;
				bullet[bullet.length - 1].do = () => {};
			}

			const pommelWidth = 30;
			const pommelHeight = 40;
			const pommelVertices = [
				{ x: x, y: y + handleHeight / 2 + pommelHeight / 2 },
				{ x: x + pommelWidth / 2, y: y + handleHeight / 2 },
				{ x: x, y: y + handleHeight / 2 - pommelHeight / 2 },
				{ x: x - pommelWidth / 2, y: y + handleHeight / 2 },
			];
			const pommel = Bodies.fromVertices(x, y + handleHeight / 2, pommelVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = pommel;
				bullet[bullet.length - 1].do = () => {};
			}
			const prongWidth = 20;
			const prongHeight = 300;
			const prongOffsetX = 30;

			const leftOuterProngVertices = [
				{ x: x - prongOffsetX, y: y - handleHeight / 2 - prongHeight },
				{ x: x - prongOffsetX - prongWidth, y: y - handleHeight / 2 - prongHeight / 2 },
				{ x: x - prongOffsetX - prongWidth, y: y - handleHeight / 2 },
				{ x: x - prongOffsetX, y: y - handleHeight / 2 - prongHeight / 10},
			];
			const leftOuterProng = Bodies.fromVertices(x - prongOffsetX, y - handleHeight / 2, leftOuterProngVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = leftOuterProng;
				bullet[bullet.length - 1].do = () => {};
			}
			const leftInnerProngVertices = [
				{ x: x - prongOffsetX / 2, y: y - handleHeight / 2 - prongHeight / 1.5 },
				{ x: x - prongOffsetX / 2 - prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
				{ x: x - prongOffsetX / 2 + prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
			];
			const leftInnerProng = Bodies.fromVertices(x - prongOffsetX / 2, y - handleHeight / 2, leftInnerProngVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = leftInnerProng;
				bullet[bullet.length - 1].do = () => {};
			}
			const rightOuterProngVertices = [
				{ x: x + prongOffsetX, y: y - handleHeight / 2 - prongHeight },
				{ x: x + prongOffsetX + prongWidth, y: y - handleHeight / 2 - prongHeight / 2 },
				{ x: x + prongOffsetX + prongWidth, y: y - handleHeight / 2 },
				{ x: x + prongOffsetX, y: y - handleHeight / 2  - prongHeight / 10},
			];
			const rightOuterProng = Bodies.fromVertices(x + prongOffsetX, y - handleHeight / 2, rightOuterProngVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = rightOuterProng;
				bullet[bullet.length - 1].do = () => {};
			}
			const rightInnerProngVertices = [
				{ x: x + prongOffsetX / 2, y: y - handleHeight / 2 - prongHeight / 1.5 },
				{ x: x + prongOffsetX / 2 - prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
				{ x: x + prongOffsetX / 2 + prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
			];
			const rightInnerProng = Bodies.fromVertices(x + prongOffsetX / 2, y - handleHeight / 2, rightInnerProngVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = rightInnerProng;
				bullet[bullet.length - 1].do = () => {};
			}
			const middleSmallProngVertices = [
				{ x: x, y: y - handleHeight / 2 - prongHeight / 2 },
				{ x: x - prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
				{ x: x + prongWidth / 2, y: y - handleHeight / 2 - prongHeight / 3 },
			];
			const middleSmallProng = Bodies.fromVertices(x, y - handleHeight / 2, middleSmallProngVertices, spawn.propsIsNotHoldable);
			if(!tech.pyroSpear) {
				bullet[bullet.length] = middleSmallProng;
				bullet[bullet.length - 1].do = () => {};
			}
			const spear = Body.create({
				parts: [handle, pommel, leftOuterProng, leftInnerProng, rightOuterProng, rightInnerProng, middleSmallProng],
			});

			Composite.add(engine.world, spear);
			Matter.Body.setAngle(spear, -m.angle - Math.PI / 2);
			Matter.Body.setPosition(spear, { 
				x: x, 
				y: y
			});
			Matter.Body.setVelocity(spear, { 
				x: 0, 
				y: 0
			});
			spear.collisionFilter.category = cat.bullet;
			spear.collisionFilter.mask = cat.mobBullet | cat.powerup | cat.mob | cat.body;
			Body.scale(spear, -1, 1, { x, y });
			if(!tech.pyroSpear) {
				return { spear, bladeSegments: [leftOuterProng, leftInnerProng, rightOuterProng, rightInnerProng, middleSmallProng, pommel] };
			} else {
				Body.scale(spear, 1.5, 1.5, { x, y });
				return { spear, bladeSegments: [handle, leftOuterProng, leftInnerProng, rightOuterProng, rightInnerProng, middleSmallProng, pommel] };
			}
        },
		renderDefault() {
			if(this.spear) {
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
	
					const alphaStep = 1 / trail.length;
					let alpha = 0;
	
					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.beginPath();
						ctx.moveTo(vertices[0].x, vertices[0].y);
	
						for (let k = 1; k < vertices.length; k++) {
							ctx.lineTo(vertices[k].x, vertices[k].y);
						};
	
						alpha += alphaStep;
						ctx.closePath();
						if(tech.isEnergyHealth) {
							const eyeColor = m.fieldMeterColor;    
							const r = eyeColor[1];
							const g = eyeColor[2];
							const b = eyeColor[3];
							const color = `#${r}${r}${g}${g}${b}${b}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
							ctx.fillStyle = color;
						} else {
							ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`;
						}
						ctx.fill();
					}
				}
				for(let i = 0; i < this.bladeSegments.length; i++) {
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "crimson";
					ctx.lineWidth = 5;
					ctx.fillStyle = "black";
					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y)
					};
					ctx.closePath();
					ctx.stroke();
					ctx.fill();
					ctx.lineJoin = "round";
					ctx.miterLimit = 10;
				}
			}
		},
		renderLightning() {
			if(this.spear) {
				let shock = 20;
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}
				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
					const alphaStep = 1 / trail.length;
					let alpha = 0;
					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.moveTo(vertices[0].x + shock * Math.random() - shock * Math.random(), vertices[0].y + shock * Math.random() - shock * Math.random());
						for (let k = 1; k < vertices.length; k++) {
							ctx.lineTo(vertices[k].x + shock * Math.random() - shock * Math.random(), vertices[k].y + shock * Math.random() - shock * Math.random());
						};
						alpha += alphaStep;
						ctx.closePath();
						ctx.strokeStyle = `rgba(220, 20, 220, ${alpha})`;
						ctx.fillStyle = `rgba(250, 250, 250, ${alpha})`;
						ctx.fill();
						ctx.stroke();
					}
				}
				for(let i = 0; i < this.bladeSegments.length; i++) {
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "rgb(220, 20, 220)";
					ctx.lineWidth = 10;
					ctx.fillStyle = "white";
					ctx.moveTo(this.bladeSegments[i].vertices[0].x + shock * Math.random() - shock * Math.random(), this.bladeSegments[i].vertices[0].y + shock * Math.random() - shock * Math.random());
					for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x + shock * Math.random() - shock * Math.random(), this.bladeSegments[i].vertices[j].y + shock * Math.random() - shock * Math.random())
					};
					ctx.closePath();
					ctx.stroke();
					ctx.fill();
					ctx.lineJoin = "round";
					ctx.miterLimit = 10;
				}
				for(let i = 0; i < this.bladeSegments.length - 1; i++) {
					this.lightning(this.bladeSegments[i].position.x, this.bladeSegments[i].position.y, this.bladeSegments[i + 1].position.x, this.bladeSegments[i + 1].position.y)
				}
			}
		},
		renderFlame() {
			if (this.spear) {
				for (let i = 0; i < this.bladeSegments.length; i++) {
					const blade = this.bladeSegments[i];
					const trail = this.bladeTrails[i] || [];
					const vertices = blade.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }));
					trail.push(vertices);
					if (trail.length > 10) {
						trail.shift();
					}
					this.bladeTrails[i] = trail;
				}

				for (let i = 0; i < this.bladeTrails.length; i++) {
					const trail = this.bladeTrails[i];
					const alphaStep = 1 / trail.length;
					let alpha = 0;

					for (let j = 0; j < trail.length; j++) {
						const vertices = trail[j];
						ctx.beginPath();
						const offx = Math.sin((j) * 0.3 * Math.abs(Math.sin(simulation.cycle / 1000)) + simulation.cycle * 0.08) * 25;
						const offy = Math.sin((j) * 0.5 * Math.abs(Math.sin(simulation.cycle / 1000)) + simulation.cycle * 0.08) * 25;
						ctx.moveTo(vertices[0].x + offx, vertices[0].y + offy);
						for (let k = 1; k < vertices.length; k++) {
							const offsetX = Math.sin((j + k) * 0.3 * Math.abs(Math.sin(simulation.cycle / 1000)) + simulation.cycle * 0.08) * 25;
							const offsetY = Math.sin((j + k) * 0.5 * Math.abs(Math.sin(simulation.cycle / 1000)) + simulation.cycle * 0.08) * 25;
							ctx.lineTo(vertices[k].x + offsetX, vertices[k].y + offsetY);
						}

						alpha += alphaStep;
						ctx.closePath();

						ctx.fillStyle = `rgba(${255 + j * 10}, ${90 + j * 5}, ${75 + j * 15}, ${alpha})`;
						ctx.fill();
					}
				}
				const gradient = ctx.createRadialGradient(
					this.bladeSegments[0].vertices[0].x, 
					this.bladeSegments[0].vertices[0].y, 
					0,
					this.bladeSegments[0].vertices[0].x, 
					this.bladeSegments[0].vertices[0].y, 
					Math.abs(Math.sin(simulation.cycle / 30)) * 1000
				);
				for (let i = 0; i < this.bladeSegments.length; i++) {
					ctx.save()
					ctx.beginPath();
					ctx.lineJoin = "miter";
					ctx.miterLimit = 100;
					ctx.globalCompositeOperation = "overlay";
					ctx.filter = "blur(3px)"

					gradient.addColorStop(0, `rgba(255, 69, ${Math.abs(Math.sin(simulation.cycle / 30)) * 255}, 0.8)`); // Inner color
					// gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.4)`);
					gradient.addColorStop(1, `rgba(255, 0, 0, 0.4)`); // Outer color (can adjust this as needed)

					// ctx.strokeStyle = gradient;
					ctx.lineWidth = 5;

					ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);

					for (let j = 1; j < this.bladeSegments[i].vertices.length; j++) {
						ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y);
					}

					ctx.closePath();
					
					ctx.fillStyle = gradient;
					ctx.fill();
					// ctx.stroke();

					ctx.lineJoin = "round";
					ctx.miterLimit = 10;
					ctx.restore();
				}
			}
		},
		lightning(x1, y1, x2, y2, strokeColor = 'rgb(220, 20, 220)', lineWidth = 5) {
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = lineWidth;
			const dx = x2 - x1;
			const dy = y2 - y1;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);
			const boltCount = Math.floor(Math.random() * 3) + 1;
			for (let i = 0; i < boltCount; i++) {
				let currentX = x1;
				let currentY = y1;
				ctx.beginPath();
				ctx.moveTo(currentX, currentY);
				while (Math.hypot(currentX - x1, currentY - y1) < distance) {
					const segmentLength = Math.random() * 10 + 5;
					const offsetAngle = angle + (Math.random() - 0.5) * 0.4;
					const nextX = currentX + Math.cos(offsetAngle) * segmentLength;
					const nextY = currentY + Math.sin(offsetAngle) * segmentLength;
					if (Math.hypot(nextX - x1, nextY - y1) >= distance) break;
					ctx.lineTo(nextX, nextY);
					currentX = nextX;
					currentY = nextY;
				}
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}
		},
		collision() {
			if(this.spear) {
				for (let i = 0; i < mob.length; i++) {
					if (Matter.Query.collides(this.spear, [mob[i]]).length > 0) {
						const dmg = Math.sqrt((m.damageDone ? m.damageDone : m.dmgScale) * Math.sqrt(this.spear.speed)) * (tech.spearEye ? (m.health > 0.01 ? 3 : 1) : 1);
						mob[i].damage(dmg, true);
						simulation.drawList.push({
							x: mob[i].position.x,
							y: mob[i].position.y,
							radius: Math.abs(Math.log(dmg * this.spear.speed) * 40 * mob[i].damageReduction + 3),
							color: simulation.mobDmgColor,
							time: simulation.drawTime
						});
						if(tech.shockSpear) {
							mobs.statusStun(mob[i], 10);
						}
						if(this.durability > 0) {
							this.durability--;
						}
						break
					}
				}
			}
		},
		drawDurability(bgColor = "rgba(0, 0, 0, 0.4)") {
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.strokeStyle = bgColor;
			ctx.arc(m.pos.x, m.pos.y, 35, 0, 2 * Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.strokeStyle = "#467";
			ctx.arc(m.pos.x, m.pos.y, 35, 0, 2 * Math.PI * (this.durability / this.maxDurability));
			ctx.stroke();
		},
	};
	b.guns.push(e);
	const gunArray = b.guns.filter(
	(obj, index, self) =>
		index === self.findIndex((item) => item.name === obj.name)
	);
	b.guns = gunArray;
	const t = [
		{
			name: "protoporphyrin IX",
			descriptionFunction() {
				return `<b class="color-h">health</b> is converted to <b>spear</b> <em>durability</em><br>when spear <em>durability</em> reaches 0`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear")
			},
			requires: "spear",
			effect() {
				tech.protoporphyrin = true;
				simulation.ephemera.push({
					name: "healthSpear",
					do() {
						for (let i = 0, len = b.inventory.length; i < len; ++i) {
							if(b.guns[b.inventory[i]].name === "spear" && b.guns[b.inventory[i]].durability == 0) {
								if(tech.isEnergyHealth) {
									m.energy -= 0.1;
									b.guns[b.inventory[i]].durability += 100;
								} else {
									m.health -= 0.1;
									b.guns[b.inventory[i]].durability += 100;
									m.displayHealth();
								}
							}
						}
					}
				})
			},
			remove() {
				tech.protoporphyrin = false;
				simulation.removeEphemera("healthSpear");
			}
		},		
		{
			name: "tempering",
			descriptionFunction() {
				return `+100 spear <em>durability</em><br>-1 <em>durability</em> per ${powerUps.orb.ammo()}`
			},
			isGunTech: true,
			maxCount: 9,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear")
			},
			requires: "spear",
			effect() {
				tech.tempering = this.count;
				for (let i = 0, len = b.inventory.length; i < len; ++i) {
					if(b.guns[b.inventory[i]].name === "spear") {
						b.guns[b.inventory[i]].maxDurability += 100;
					}
				}
			},
			remove() { //reset code here because it doesn't work anywhere else :/
				tech.tempering = this.count; 
				for (let i = 0, len = b.inventory.length; i < len; ++i) {
					if(b.guns[b.inventory[i]].name === "spear" && b.guns[b.inventory[i]].maxDurability > 300) {
						b.guns[b.inventory[i]].maxDurability -= 100;
					} else {
						if(b.guns[b.inventory[i]].name === "spear" && !m.alive) {
							b.guns[b.inventory[i]].cycle = 0;
							b.guns[b.inventory[i]].haveEphemera = false;
							b.guns[b.inventory[i]].durability = 300;
							b.guns[b.inventory[i]].maxDurability = 300;
						}
					}
				}
			}
		},
		{
			name: "dry lightning",
			descriptionFunction() {
				return `imbue <b>spear</b> with <b style="color: rgb(220, 20, 220);">energy</b><br>mobs are <b class="color-s">stunned</b> by <b>spear</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && !tech.spearEye
			},
			requires: "spear, not blood transfusion",
			effect() {
				tech.shockSpear = true;
			},
			remove() {
				tech.shockSpear = false;
			}
		},		
		{
			name: "arc discharge",
			descriptionFunction() {
				return `spear <b style="color: rgb(220, 20, 220);">lightning</b> may strike nearby mobs<br>increases <b>probability</b> and <b style="color: rgb(220, 20, 220);">energy</b> cost`
			},
			isGunTech: true,
			maxCount: 9,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && tech.shockSpear
			},
			requires: "spear",
			effect() {
				tech.spearArc = this.count;
			},
			remove() {
				tech.spearArc = this.count;
			}
		},
		{
			name: "polonium-210",
			descriptionFunction() {
				return `gather <b>polonium-210</b> into spear<br>crouching <b>charges</b> a ball of polonium and <b class="color-f">energy</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && tech.shockSpear
			},
			requires: "spear, dry lightning",
			effect() {
				tech.spearRadioactive = true;
				simulation.ephemera.push({
					name: "spearRadioactive",
					radius: 0,
					particles: [],
					maxParticles: 50,
					gatherSpeed: 0.08,
					do() {
						if(!tech.spearRadioactive) {
							simulation.removeEphemera(this.name);
						}
						for (let i = 0, len = b.inventory.length; i < len; ++i) {
							if(b.guns[b.inventory[i]].name === "spear" && b.guns[b.inventory[i]].spear) {
								let spearPos = {
									x: b.guns[b.inventory[i]].bladeSegments[4].vertices[0].x,
									y: b.guns[b.inventory[i]].bladeSegments[4].vertices[0].y
								};
								if(input.down && m.energy > 0) {
									this.radius += 1;
									m.energy -= 0.001;
								} else if(this.radius > 0) {
									let angle = Math.atan2(b.guns[b.inventory[i]].constraint2.pointA.y - b.guns[b.inventory[i]].constraint1.bodyB.position.y, b.guns[b.inventory[i]].constraint2.pointA.x - b.guns[b.inventory[i]].constraint1.bodyB.position.x);
								
									const range = {
										x: 5000 * Math.cos(angle),
										y: 5000 * Math.sin(angle)
									}
									const rangeOffPlus = {
										x: 7.5 * Math.cos(angle + Math.PI / 2),
										y: 7.5 * Math.sin(angle + Math.PI / 2)
									}
									const rangeOffMinus = {
										x: 7.5 * Math.cos(angle - Math.PI / 2),
										y: 7.5 * Math.sin(angle - Math.PI / 2)
									}
									const dmg = this.radius * (m.damageDone ? m.damageDone : m.dmgScale);
									const where = {
										x: spearPos.x + 30 * Math.cos(angle),
										y: spearPos.y + 30 * Math.sin(angle)
									}
									const eye = {
										x: spearPos.x + 15 * Math.cos(angle),
										y: spearPos.y + 15 * Math.sin(angle)
									}
									if (Matter.Query.ray(map, eye, where).length === 0 && Matter.Query.ray(body, eye, where).length === 0) {
										this.energyBeam(eye, angle, this.radius);
									}
									for (let i = 1; i < 4; i++) {
										let whereOff = Vector.add(where, {
											x: i * rangeOffPlus.x,
											y: i * rangeOffPlus.y
										})
										if (Matter.Query.ray(map, eye, whereOff).length === 0 && Matter.Query.ray(body, eye, whereOff).length === 0) {
											this.energyBeam(eye, angle, this.radius);
										}
										whereOff = Vector.add(where, {
											x: i * rangeOffMinus.x,
											y: i * rangeOffMinus.y
										})
										if (Matter.Query.ray(map, eye, whereOff).length === 0 && Matter.Query.ray(body, eye, whereOff).length === 0) {
											this.energyBeam(eye, angle, this.radius);
										}
									}
									this.radius -= 0.5;
								}
								this.radius = Math.min(75 + 15 * Math.random(), Math.max(0, this.radius));
								if (this.particles.length < this.maxParticles && input.down) {
									const angle = Math.random() * 2 * Math.PI;
									const distance = this.radius + Math.random() * 500;
									const offsetX = Math.cos(angle) * distance;
									const offsetY = Math.sin(angle) * distance;
									this.particles.push({
										position: { x: offsetX, y: offsetY },
										prevPosition: { x: offsetX, y: offsetY },
										speed: 0.5 + Math.random() * 0.5
									});
								}
								ctx.save();
								ctx.globalAlpha = 1;
								ctx.translate(spearPos.x, spearPos.y);
								ctx.beginPath();
								ctx.strokeStyle = "transparent";
								const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
								const alpha = 0.8 + 0.1 * Math.random();
								gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
								gradient.addColorStop(0.35 + 0.1 * Math.random(), `rgba(255,150,255,${alpha})`);
								gradient.addColorStop(1, `rgba(255,0,255,${alpha})`);
								// gradient.addColorStop(1, `rgba(255,150,255,${alpha})`);
								ctx.fillStyle = gradient
								ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
								ctx.stroke();
								ctx.fill();
								ctx.lineWidth = 1000;
								for(let i = 0; i < 4; i++) {
									const angle = Math.random() * 2 * Math.PI
									const Dx = Math.cos(angle);
									const Dy = Math.sin(angle);
									let xElec = 40 * Dx;
									let yElec = 40 * Dy;
									ctx.beginPath();
									ctx.moveTo(xElec, yElec);
									const step = 40
									for (let i = 0; i < 3; i++) {
										xElec += step * (Dx + 1.5 * (Math.random() - 0.5))
										yElec += step * (Dy + 1.5 * (Math.random() - 0.5))
										ctx.lineTo(xElec, yElec);
									}
									ctx.stroke();
								}
								ctx.restore();
								this.particles.forEach((particle, index) => {
									ctx.globalAlpha = 1;
									if (particle.trailLife === undefined) {
										particle.trailLife = 0;
										particle.maxTrailLife = 125;
									}

									const dx = -particle.position.x * this.gatherSpeed * particle.speed;
									const dy = -particle.position.y * this.gatherSpeed * particle.speed;

									particle.prevPosition.x = particle.position.x;
									particle.prevPosition.y = particle.position.y;

									particle.position.x += dx;
									particle.position.y += dy;

									particle.trailLife = Math.min(particle.maxTrailLife, particle.trailLife + 1);
									if (particle.trailLife >= particle.maxTrailLife) particle.trailLife -= 2;

									const trailLength = (particle.trailLife / particle.maxTrailLife) * 300 * (1 - Math.abs(particle.trailLife - particle.maxTrailLife / 2) / (particle.maxTrailLife / 2));

									const trailEndX = spearPos.x + particle.position.x - dx * trailLength;
									const trailEndY = spearPos.y + particle.position.y - dy * trailLength;

									ctx.beginPath();
									ctx.moveTo(trailEndX, trailEndY);
									ctx.lineTo(spearPos.x + particle.position.x, spearPos.y + particle.position.y);
									ctx.strokeStyle = `rgba(220, 20, 220, 0.8)`;
									ctx.lineWidth = 6;
									ctx.stroke();

									ctx.beginPath();
									ctx.moveTo(trailEndX, trailEndY);
									ctx.lineTo(spearPos.x + particle.position.x, spearPos.y + particle.position.y);
									ctx.strokeStyle = `#FFFFFF`;
									ctx.lineWidth = 3;
									ctx.stroke();

									const distanceSquared = particle.position.x * particle.position.x + particle.position.y * particle.position.y;
									if (distanceSquared < 1) {
										this.particles.splice(index, 1);
									}
								});
							}
						}
					},
					energyBeam(where, angle, charge) {
						let best;
						let range = 5000;
						const path = [
							{
								x: where.x + 20 * Math.cos(angle),
								y: where.y + 20 * Math.sin(angle)
							},
							{
								x: where.x + range * Math.cos(angle),
								y: where.y + range * Math.sin(angle)
							}
						];

						best = {
							x: null,
							y: null,
							dist2: Infinity,
							who: null,
							v1: null,
							v2: null
						};
						if (!best.who) {
							best = vertexCollision(path[0], path[1], [mob, map, body]);
							if (best.dist2 != Infinity) {
								path[path.length - 1] = {
									x: best.x,
									y: best.y
								};
							}
						}
						if (best.dist2 !== Infinity) {
							path[path.length - 1] = { x: best.x, y: best.y };
							if (best.who.alive) {
								best.who.locatePlayer();
								if (best.who.damageReduction) {
									best.who.damage(charge * 0.005 * (m.damageDone ? m.damageDone : m.dmgScale));
								}
							}
						}
						ctx.beginPath();
						ctx.moveTo(path[0].x, path[0].y);
						ctx.lineTo(path[1].x, path[1].y);

						ctx.strokeStyle = "rgba(220,0,220,0.01)";
						ctx.lineWidth = 50;
						ctx.stroke();
						
						ctx.beginPath();
						ctx.moveTo(path[0].x, path[0].y);
						ctx.lineTo(path[1].x, path[1].y);

						ctx.strokeStyle = "rgba(220,0,220,0.05)";
						ctx.lineWidth = 35;
						ctx.stroke();
						
						ctx.beginPath();
						ctx.moveTo(path[0].x, path[0].y);
						ctx.lineTo(path[1].x, path[1].y);

						ctx.strokeStyle = "rgba(220,220,220,0.9)";
						ctx.lineWidth = 17;
						ctx.stroke();
						
						this.lightning(path[0].x, path[0].y, path[1].x, path[1].y);
					},
					lightning(x1, y1, x2, y2, strokeColor = 'rgb(220, 20, 220)', lineWidth = 5) {
						ctx.strokeStyle = strokeColor;
						ctx.lineWidth = lineWidth;
						const dx = x2 - x1;
						const dy = y2 - y1;
						const distance = Math.sqrt(dx * dx + dy * dy);
						const angle = Math.atan2(dy, dx);
						const boltCount = Math.floor(Math.random() * 3) + 1;
						for (let i = 0; i < boltCount; i++) {
							let currentX = x1;
							let currentY = y1;
							ctx.beginPath();
							ctx.moveTo(currentX, currentY);
							while (Math.hypot(currentX - x1, currentY - y1) < distance) {
								const segmentLength = Math.random() * 10 + 5;
								const offsetAngle = angle + (Math.random() - 0.5) * 0.4;
								const nextX = currentX + Math.cos(offsetAngle) * segmentLength;
								const nextY = currentY + Math.sin(offsetAngle) * segmentLength;
								if (Math.hypot(nextX - x1, nextY - y1) >= distance) break;
								ctx.lineTo(nextX, nextY);
								currentX = nextX;
								currentY = nextY;
							}
							ctx.lineTo(x2, y2);
							ctx.stroke();
						}
					},
				})
			},
			remove() {
				tech.spearRadioactive = false;
			}
		},
		{
			name: "blood transfusion",
			descriptionFunction() {
				return `sacrifice <b class="color-h">health</b> onto your spear<br>-6 <b class="color-h">health</b>/second but <b>3x</b> spear <b class="color-d">damage</b>`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && !tech.isEnergyHealth && !tech.shockSpear
			},
			requires: "spear, not mass energy or dry lightning",
			effect() {
				tech.spearEye = true;
				simulation.ephemera.push({
					name: "eyeSpear",
					eyeCount: undefined,
					do() {
						if(!tech.spearEye) {
							simulation.removeEphemera(this.name);
						}
						for (let i = 0, len = b.inventory.length; i < len; ++i) {
							if(b.guns[b.inventory[i]].name === "spear" && b.guns[b.inventory[i]].spear) {
								if(m.health > 0.01) {
									m.health -= (tech.spearHeart ? 0.0001 : 0.001);
									m.displayHealth();
									if(tech.spearHeart && Math.random() < 0.005) {
										m.energy -= 0.1;
									}
								} else {
									break;
								}
								let spearPos = {
									x: b.guns[b.inventory[i]].bladeSegments[4].vertices[0].x,
									y: b.guns[b.inventory[i]].bladeSegments[4].vertices[0].y
								};
								ctx.save();
								const eyeCount = 3;
								const radius = 3000;
								const lerpSpeed = 0.05;
								if (!this.eyePositions) {
									this.eyePositions = Array(eyeCount).fill({ x: spearPos.x, y: spearPos.y });
								}
								for (let j = 0; j < eyeCount; j++) {
									const targetAngle = (j * (2 * Math.PI)) / eyeCount + performance.now() * 0.001;
									const targetX = spearPos.x + Math.cos(targetAngle) * radius;
									const targetY = spearPos.y + Math.sin(targetAngle) * radius;
									const currentPos = this.eyePositions[j];
									currentPos.x += (targetX - currentPos.x) * lerpSpeed;
									currentPos.y += (targetY - currentPos.y) * lerpSpeed;
									const angleToSpear = Math.atan2(spearPos.y - currentPos.y, spearPos.x - currentPos.x);
									ctx.save();
									ctx.translate(currentPos.x, currentPos.y);
									ctx.rotate(angleToSpear);
									ctx.beginPath();
									ctx.arc(0, 0, 10, 0, 2 * Math.PI);
									ctx.strokeStyle = "crimson";
									ctx.fillStyle = "crimson";
									ctx.stroke();
									ctx.fill();
									ctx.beginPath();
									ctx.moveTo(-25, 0);
									ctx.quadraticCurveTo(0, -20, 25, 0);
									ctx.moveTo(-25, 0);
									ctx.quadraticCurveTo(0, 20, 25, 0);
									ctx.strokeStyle = "crimson";
									ctx.lineWidth = 2;
									ctx.stroke();
									ctx.restore();
								}

								ctx.restore();
							}
						}
					}
				})
			},
			remove() {
				tech.spearEye = false;
			}
		},		
		{
			name: "heart meridian",
			descriptionFunction() {
				return `reduce <b class="color-h">health</b> drain by <b>10x</b><br><b class="color-f">energy</b> will randomly drain`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && tech.spearEye
			},
			requires: "spear, blood transfusion",
			effect() {
				tech.spearHeart = true;
			},
			remove() {
				tech.spearHeart = false;
			}
		},		
		{
			name: "pyroflux",
			descriptionFunction() {
				return `<b>1.5x</b> spear <b>size</b><br><b class="color-d">damage</b> nearby mobs`
			},
			isGunTech: true,
			maxCount: 1,
			count: 0,
			frequency: 2,
			frequencyDefault: 2,
			allowed() {
				return tech.haveGunCheck("spear") && !tech.spearEye && ! tech.shockSpear
			},
			requires: "spear, not blood transfusion, dry lightning",
			effect() {
				tech.pyroSpear = true;
			},
			remove() {
				tech.pyroSpear = false;
			}
		},
	];
	t.reverse();
	for(let i = 0; i < tech.tech.length; i++) {
		if(tech.tech[i].name === 'spherical harmonics') {
			for(let j = 0; j < t.length; j++) {
				tech.tech.splice(i, 0, t[j]);
			}
			break;
		}
	}
	const techArray = tech.tech.filter(
		(obj, index, self) =>
			index === self.findIndex((item) => item.name === obj.name)
		);
	tech.tech = techArray;
	console.log("%cSpear mod successfully installed", "color: crimson");
})();


// ========================================


javascript:(function() {
    const e = {
        name: "dualGauntlets",
        descriptionFunction() {
            return `wield <b>dual gauntlets</b> that punch rapidly in melee combat<br>drains <strong class='color-h'>health</strong> instead of ammunition<br>doesn't use <b>ammo</b>`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        cycle: 0,
        leftGauntlet: undefined,
        rightGauntlet: undefined,
        gauntletSegments: [],
        punchCooldown: 0,
        isPunching: false,
        punchSide: "left",
        haveEphemera: false,
        fire() {},
        do() {
            if(!this.haveEphemera) {
                this.haveEphemera = true;
                simulation.ephemera.push({
                    name: "dualGauntlets",
                    do() {
                        if(b.guns[b.activeGun].name !== 'dualGauntlets') {
                            for (let i = 0; i < b.inventory.length; i++) {
                                if(b.guns[b.inventory[i]].name === "dualGauntlets") {
                                    if(b.guns[b.inventory[i]].leftGauntlet) {
                                        Composite.remove(engine.world, b.guns[b.inventory[i]].leftGauntlet);
                                        b.guns[b.inventory[i]].leftGauntlet = undefined;
                                    }
                                    if(b.guns[b.inventory[i]].rightGauntlet) {
                                        Composite.remove(engine.world, b.guns[b.inventory[i]].rightGauntlet);
                                        b.guns[b.inventory[i]].rightGauntlet = undefined;
                                    }
                                    b.guns[b.inventory[i]].gauntletSegments = [];
                                }
                            }
                        }
                    }
                });
            }

            this.cycle++;

            if (input.fire && b.activeGun !== null && (tech.isEnergyHealth ? m.energy >= 0.05 : m.health >= 0.05)) {
                if (!this.leftGauntlet && !this.rightGauntlet && b.guns[b.activeGun].name === 'dualGauntlets') {
                    this.createGauntlets();
                }

                if (this.punchCooldown <= 0) {
                    this.isPunching = true;
                    this.punchCooldown = 8;
                    if(tech.isEnergyHealth) {
                        m.energy -= 0.002;
                    } else {
                        m.health -= 0.0005;
                        m.displayHealth();
                    }
                }
            }

            if (this.punchCooldown > 0) this.punchCooldown--;

            if (this.leftGauntlet && this.rightGauntlet) {
                const offset = this.isPunching ? 60 : 30;
                const activeGauntlet = this.punchSide === "left" ? this.leftGauntlet : this.rightGauntlet;
                const inactiveGauntlet = this.punchSide === "left" ? this.rightGauntlet : this.leftGauntlet;

                Matter.Body.setPosition(activeGauntlet, {
                    x: m.pos.x + Math.cos(m.angle) * offset,
                    y: m.pos.y + Math.sin(m.angle) * offset
                });

                Matter.Body.setPosition(inactiveGauntlet, {
                    x: m.pos.x + Math.cos(m.angle) * 20,
                    y: m.pos.y + Math.sin(m.angle) * 20
                });

                Matter.Body.setAngle(activeGauntlet, m.angle);
                Matter.Body.setAngle(inactiveGauntlet, m.angle);

                // Render gauntlets
                this.gauntletSegments.forEach(segment => {
                    ctx.beginPath();
                    ctx.moveTo(segment.vertices[0].x, segment.vertices[0].y);
                    for(let j = 1; j < segment.vertices.length; j++) {
                        ctx.lineTo(segment.vertices[j].x, segment.vertices[j].y);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = tech.isEnergyHealth ? m.fieldMeterColor : "#8b4513";
                    ctx.lineWidth = 4;
                    ctx.fillStyle = "#444";
                    ctx.stroke();
                    ctx.fill();
                });

                // Collision detection
                for (let i = 0; i < mob.length; i++) {
                    if (Matter.Query.collides(activeGauntlet, [mob[i]]).length > 0) {
                        const dmg = (m.damageDone ? m.damageDone : m.dmgScale) * 0.08;
                        mob[i].damage(dmg, true);
                        simulation.drawList.push({
                            x: mob[i].position.x,
                            y: mob[i].position.y,
                            radius: 40,
                            color: simulation.mobDmgColor,
                            time: simulation.drawTime
                        });
                        this.punchSide = this.punchSide === "left" ? "right" : "left";
                        break;
                    }
                }

                if (this.isPunching && this.punchCooldown === 0) {
                    this.isPunching = false;
                    this.punchSide = this.punchSide === "left" ? "right" : "left";
                }
            }

            if (!input.fire && (this.leftGauntlet || this.rightGauntlet)) {
                if(this.leftGauntlet) {
                    Composite.remove(engine.world, this.leftGauntlet);
                    this.leftGauntlet = undefined;
                }
                if(this.rightGauntlet) {
                    Composite.remove(engine.world, this.rightGauntlet);
                    this.rightGauntlet = undefined;
                }
                this.gauntletSegments = [];
            }
        },
        createGauntlets() {
            const x = m.pos.x;
            const y = m.pos.y;

            // Left gauntlet
            const leftFist = Bodies.rectangle(x - 20, y, 30, 25, spawn.propsIsNotHoldable);
            const leftArm = Bodies.rectangle(x - 30, y, 15, 40, spawn.propsIsNotHoldable);
            this.leftGauntlet = Body.create({ parts: [leftFist, leftArm] });
            Composite.add(engine.world, this.leftGauntlet);
            this.leftGauntlet.collisionFilter.category = cat.bullet;
            this.leftGauntlet.collisionFilter.mask = cat.mob;

            // Right gauntlet
            const rightFist = Bodies.rectangle(x + 20, y, 30, 25, spawn.propsIsNotHoldable);
            const rightArm = Bodies.rectangle(x + 30, y, 15, 40, spawn.propsIsNotHoldable);
            this.rightGauntlet = Body.create({ parts: [rightFist, rightArm] });
            Composite.add(engine.world, this.rightGauntlet);
            this.rightGauntlet.collisionFilter.category = cat.bullet;
            this.rightGauntlet.collisionFilter.mask = cat.mob;

            this.gauntletSegments = [leftFist, leftArm, rightFist, rightArm];
        }
    };

    b.guns.push(e);
    const gunArray = b.guns.filter((obj, index, self) => index === self.findIndex(item => item.name === obj.name));
    b.guns = gunArray;
    console.log("%cDual Gauntlets mod successfully installed", "color: #8b4513");
})();


// ========================================


javascript:(function() {
    const e = {
        name: "pinkBlossomHammer",
        descriptionFunction() {
            return `wield a <b>pink blossom hammer</b> that can <strong>smash</strong> in melee or be <strong>thrown</strong> and return<br>leaves a <span style='color:#ff69b4'>petal trail</span> and uses <strong class='color-h'>petal energy</strong> instead of ammo`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        fire() {},
        cycle: 0,
        cycle2: 0,
        hammer: undefined,
        headSegments: undefined,
        headTrails: [],
        angle: 0,
        constraint: undefined,
        durability: 220,
        maxDurability: 220,
        haveEphemera: false,
        right: true,
        do() {
            if (!this.haveEphemera) {
                this.haveEphemera = true;
                simulation.ephemera.push({
                    name: "pinkBlossomHammer",
                    do() {
                        if (b.guns[b.activeGun].name !== 'pinkBlossomHammer') {
                            for (let i = 0; i < b.inventory.length; i++) {
                                if (b.guns[b.inventory[i]].name === "pinkBlossomHammer" && b.guns[b.inventory[i]].hammer) {
                                    Composite.remove(engine.world, b.guns[b.inventory[i]].hammer);
                                    b.guns[b.inventory[i]].hammer = undefined;
                                    b.guns[b.inventory[i]].headTrails = [];
                                }
                            }
                        }
                        for (let i = 0; i < b.inventory.length; i++) {
                            if (b.guns[b.inventory[i]].name === "pinkBlossomHammer" && tech.durabilityHammer) {
                                document.getElementById(b.inventory[i]).innerHTML = `${b.guns[b.inventory[i]].name} - ${b.guns[b.inventory[i]].durability}/${b.guns[b.inventory[i]].maxDurability} <em style="font-size: 20px;">durability</em>`;
                            }
                        }
                    }
                });
            }

            this.cycle2++;
            this.durability = Math.max(0, Math.min(this.durability, this.maxDurability));

            if (b.activeGun !== null && input.fire && (tech.isEnergyHealth ? m.energy >= 0.11 : m.health >= 0.11) && this.durability > 0) {
                if (!this.hammer && b.guns[b.activeGun].name === 'pinkBlossomHammer') {
                    this.angle = m.angle;
                    ({ hammer: this.hammer, headSegments: this.headSegments } = this.createAndSwingHammer());
                    if(tech.isEnergyHealth) {
                        m.energy -= 0.05;
                    } else {
                        m.health -= 0.05;
                        m.displayHealth();
                    }
                }
            }

            if (this.hammer && (!input.fire || this.durability <= 0)) {
                Composite.remove(engine.world, this.hammer);
                this.hammer.parts.forEach(part => {
                    Composite.remove(engine.world, part);
                });
                this.hammer = undefined;
                this.headTrails = [];
            }

            if (this.hammer) {
                if (!(this.angle > -Math.PI / 2 && this.angle < Math.PI / 2)) {
                    Matter.Body.setAngularVelocity(this.hammer, -Math.PI * 0.12);
                } else {
                    Matter.Body.setAngularVelocity(this.hammer, Math.PI * 0.12);
                }
                Matter.Body.setVelocity(this.hammer, {
                    x: Math.cos(this.angle) * 25,
                    y: Math.sin(this.angle) * 25
                });

                for (let i = 0; i < this.headSegments.length; i++) {
                    const head = this.headSegments[i];
                    const trail = this.headTrails[i] || [];
                    const vertices = head.vertices.map(v => ({ x: v.x, y: v.y }));
                    trail.push(vertices);
                    if (trail.length > 8) trail.shift();
                    this.headTrails[i] = trail;
                }

                for (let i = 0; i < this.headTrails.length; i++) {
                    const trail = this.headTrails[i];
                    const alphaStep = 1 / trail.length;
                    let alpha = 0;
                    for (let j = 0; j < trail.length; j++) {
                        const vertices = trail[j];
                        ctx.beginPath();
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let k = 1; k < vertices.length; k++) ctx.lineTo(vertices[k].x, vertices[k].y);
                        alpha += alphaStep;
                        ctx.closePath();
                        ctx.fillStyle = `rgba(255,182,193,${alpha})`;
                        ctx.fill();
                    }
                }

                for (let i = 0; i < this.headSegments.length; i++) {
                    ctx.beginPath();
                    ctx.lineJoin = "round";
                    ctx.strokeStyle = "#ff69b4";
                    ctx.lineWidth = 6;
                    ctx.fillStyle = "#ffe4e1";
                    ctx.moveTo(this.headSegments[i].vertices[0].x, this.headSegments[i].vertices[0].y);
                    for (let j = 0; j < this.headSegments[i].vertices.length; j++) {
                        ctx.lineTo(this.headSegments[i].vertices[j].x, this.headSegments[i].vertices[j].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }

                for (let i = 0; i < mob.length; i++) {
                    if (Matter.Query.collides(this.hammer, [mob[i]]).length > 0) {
                        if(tech.durabilityHammer) this.durability--;
                        const dmg = (m.damageDone ? m.damageDone : m.dmgScale) * 0.18 * 2.5;
                        mob[i].damage(dmg, true);
                        simulation.drawList.push({
                            x: mob[i].position.x,
                            y: mob[i].position.y,
                            radius: 60,
                            color: "#ffb6c1",
                            time: simulation.drawTime
                        });
                        for (let p = 0; p < 6; p++) {
                            simulation.drawList.push({
                                x: mob[i].position.x + Math.random() * 40 - 20,
                                y: mob[i].position.y + Math.random() * 40 - 20,
                                radius: 6 + Math.random() * 6,
                                color: "#ffc0cb",
                                time: simulation.drawTime
                            });
                        }
                        break;
                    }
                }
            }
        },
        createAndSwingHammer(x = player.position.x, y = player.position.y, angle = m.angle) {
            this.cycle = m.cycle + 60;
            const handle = Bodies.rectangle(x, y, 20, 120, spawn.propsIsNotHoldable);
            const head = Bodies.rectangle(x, y - 80, 100, 50, spawn.propsIsNotHoldable);
            bullet[bullet.length] = handle;
            bullet[bullet.length - 1].do = () => {};
            bullet[bullet.length] = head;
            bullet[bullet.length - 1].do = () => {};
            const hammer = Body.create({ parts: [handle, head] });
            Composite.add(engine.world, hammer);
            Matter.Body.setPosition(hammer, { x, y });
            Matter.Body.setVelocity(hammer, { x: 0, y: 0 });
            hammer.collisionFilter.category = cat.bullet;
            hammer.collisionFilter.mask = cat.mobBullet | cat.mob;
            if ((angle > -Math.PI / 2 && angle < Math.PI / 2)) Body.scale(hammer, -1, 1, { x, y });
            return { hammer, headSegments: [handle, head] };
        }
    };

    b.guns.push(e);
    const gunArray = b.guns.filter((obj, index, self) => index === self.findIndex(item => item.name === obj.name));
    b.guns = gunArray;
    console.log("%cPink Blossom Hammer mod successfully installed!", "color:#ff69b4");
})();


// ========================================


// anime_guns.js
// 10 anime-style guns (projectiles, beams, charge, AoE).
// Compatible with n-gon's bullet system
(function(){
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined' || typeof bullet === 'undefined') {
        console.warn("anime_guns: required globals missing (b, Bodies, Composite, bullet). Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const pushVFX = (x, y, r, color, life = 30) => {
        if(simulation && simulation.drawList) {
            simulation.drawList.push({x, y, radius: r, color, time: life});
        }
    };

    const spawnProjectile = (x, y, angle, speed, radius, opts = {}) => {
        const id = bullet.length;
        bullet[id] = Bodies.circle(x, y, radius || 6, {
            density: 0.001,
            friction: 0.5,
            frictionAir: 0,
            restitution: 0,
        });
        bullet[id].customName = opts.name || "anime_proj";
        bullet[id].dmg = opts.dmg || 1;
        bullet[id].minDmgSpeed = opts.minDmgSpeed || 2;
        bullet[id].classType = "bullet";
        bullet[id].collisionFilter = {
            category: (typeof cat !== 'undefined' && cat.bullet) || 0x0004,
            mask: (typeof cat !== 'undefined') ? (cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield) : 0xFFFF
        };
        Matter.Body.setVelocity(bullet[id], { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
        if(typeof opts.ttl === "number") bullet[id].endCycle = simulation.cycle + opts.ttl;
        bullet[id].beforeDmg = opts.beforeDmg || function() {};
        bullet[id].onEnd = opts.onEnd || function() {};
        bullet[id].do = opts.do || function() {};
        Composite.add(engine.world, bullet[id]);
        return id;
    };

    // 1. Spirit Rifle - rapid fire energy bolts
    b.guns.push({
        name: "spirit rifle",
        descriptionFunction() {
            return `rapid-fire <b style="color:#4af">spirit bolts</b><br>high rate of fire, medium damage`;
        },
        ammo: 180,
        ammoPack: 45,
        defaultAmmoPack: 45,
        have: false,
        fire() {
            const angle = m.angle;
            const speed = 25;
            m.fireCDcycle = m.cycle + 3;
            
            spawnProjectile(
                m.pos.x + 30 * Math.cos(angle),
                m.pos.y + 30 * Math.sin(angle),
                angle, speed, 4,
                {
                    name: "spirit_bolt",
                    dmg: 0.3,
                    ttl: 90,
                    do() {
                        pushVFX(this.position.x, this.position.y, 8, "rgba(70,170,255,0.3)", 3);
                    }
                }
            );
            pushVFX(m.pos.x + 20 * Math.cos(angle), m.pos.y + 20 * Math.sin(angle), 15, "#4af", 5);
        },
        do() {}
    });

    // 2. Mana Cannon - charged shots
    b.guns.push({
        name: "mana cannon",
        descriptionFunction() {
            return `charge and release <b style="color:#f4a">mana blasts</b><br>longer charge = more damage`;
        },
        ammo: 50,
        ammoPack: 12,
        defaultAmmoPack: 12,
        have: false,
        charge: 0,
        fire() {
            if(input.fire) {
                this.charge = Math.min(this.charge + 1, 120);
            }
        },
        do() {
            if(this.charge > 0 && !input.fire) {
                const angle = m.angle;
                const dmg = 0.5 + this.charge * 0.02;
                const radius = 8 + this.charge * 0.1;
                
                spawnProjectile(
                    m.pos.x + 40 * Math.cos(angle),
                    m.pos.y + 40 * Math.sin(angle),
                    angle, 20, radius,
                    {
                        name: "mana_blast",
                        dmg: dmg,
                        ttl: 150,
                        do() {
                            pushVFX(this.position.x, this.position.y, this.radius * 1.5, "rgba(255,70,170,0.2)", 4);
                        },
                        onEnd() {
                            if(this.endCycle === simulation.cycle) {
                                b.explosion(this.position, 50 + this.radius * 5);
                            }
                        }
                    }
                );
                
                pushVFX(m.pos.x + 30 * Math.cos(angle), m.pos.y + 30 * Math.sin(angle), 30, "#f4a", 8);
                m.fireCDcycle = m.cycle + 30;
                this.charge = 0;
                b.guns[b.activeGun].ammo--;
                simulation.updateGunHUD();
            }
        }
    });

    // 3. Lightning Lance - piercing beam
    b.guns.push({
        name: "lightning lance",
        descriptionFunction() {
            return `piercing <b style="color:#ff0">lightning beam</b><br>hits multiple enemies in a line`;
        },
        ammo: 60,
        ammoPack: 15,
        defaultAmmoPack: 15,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 25;
            
            const range = 1200;
            const start = { x: m.pos.x + 30 * Math.cos(angle), y: m.pos.y + 30 * Math.sin(angle) };
            const end = { x: start.x + range * Math.cos(angle), y: start.y + range * Math.sin(angle) };
            
            const hit = vertexCollision(start, end, [map, mob, body]);
            const actualEnd = hit.x !== null ? { x: hit.x, y: hit.y } : end;
            
            // Visual beam
            for(let i = 0; i < 8; i++) {
                const t = i / 7;
                pushVFX(
                    start.x + (actualEnd.x - start.x) * t,
                    start.y + (actualEnd.y - start.y) * t,
                    12 - i, "rgba(255,255,0,0.6)", 6
                );
            }
            
            // Damage mobs along the line
            for(let i = 0; i < mob.length; i++) {
                if(mob[i].alive) {
                    const dist = Math.abs(
                        (actualEnd.y - start.y) * mob[i].position.x -
                        (actualEnd.x - start.x) * mob[i].position.y +
                        actualEnd.x * start.y - actualEnd.y * start.x
                    ) / Math.sqrt(Math.pow(actualEnd.y - start.y, 2) + Math.pow(actualEnd.x - start.x, 2));
                    
                    if(dist < mob[i].radius + 15) {
                        mob[i].damage(1.2);
                        pushVFX(mob[i].position.x, mob[i].position.y, mob[i].radius, "rgba(255,255,0,0.4)", 8);
                    }
                }
            }
        },
        do() {}
    });

    // 4. Frost Shard - ice projectiles that slow
    b.guns.push({
        name: "frost shard",
        descriptionFunction() {
            return `shoots <b style="color:#0cf">ice shards</b> that slow enemies<br>chills targets on hit`;
        },
        ammo: 90,
        ammoPack: 22,
        defaultAmmoPack: 22,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 12;
            
            spawnProjectile(
                m.pos.x + 30 * Math.cos(angle),
                m.pos.y + 30 * Math.sin(angle),
                angle, 22, 5,
                {
                    name: "frost_shard",
                    dmg: 0.4,
                    ttl: 100,
                    beforeDmg(who) {
                        if(typeof mobs !== 'undefined' && mobs.statusSlow) {
                            mobs.statusSlow(who, 90);
                        }
                        this.endCycle = 0;
                    },
                    do() {
                        pushVFX(this.position.x, this.position.y, 6, "rgba(0,200,255,0.4)", 3);
                    }
                }
            );
            pushVFX(m.pos.x + 20 * Math.cos(angle), m.pos.y + 20 * Math.sin(angle), 12, "#0cf", 4);
        },
        do() {}
    });

    // 5. Void Blaster - dark energy AoE
    b.guns.push({
        name: "void blaster",
        descriptionFunction() {
            return `fires <b style="color:#808">void spheres</b><br>explodes on impact with dark energy`;
        },
        ammo: 40,
        ammoPack: 10,
        defaultAmmoPack: 10,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 35;
            
            spawnProjectile(
                m.pos.x + 35 * Math.cos(angle),
                m.pos.y + 35 * Math.sin(angle),
                angle, 18, 10,
                {
                    name: "void_sphere",
                    dmg: 0.6,
                    ttl: 120,
                    do() {
                        pushVFX(this.position.x, this.position.y, 14, "rgba(100,0,100,0.3)", 4);
                    },
                    onEnd() {
                        if(this.endCycle === simulation.cycle) {
                            b.explosion(this.position, 180);
                            for(let i = 0; i < 5; i++) {
                                pushVFX(
                                    this.position.x + (Math.random() - 0.5) * 60,
                                    this.position.y + (Math.random() - 0.5) * 60,
                                    30 + Math.random() * 20, "rgba(100,0,100,0.4)", 12
                                );
                            }
                        }
                    }
                }
            );
            pushVFX(m.pos.x + 25 * Math.cos(angle), m.pos.y + 25 * Math.sin(angle), 25, "#808", 6);
        },
        do() {}
    });

    // 6. Plasma Repeater - fast triple shot
    b.guns.push({
        name: "plasma repeater",
        descriptionFunction() {
            return `triple-shot <b style="color:#0f0">plasma bursts</b><br>fires 3 bolts in a spread`;
        },
        ammo: 120,
        ammoPack: 30,
        defaultAmmoPack: 30,
        have: false,
        fire() {
            const baseAngle = m.angle;
            m.fireCDcycle = m.cycle + 15;
            
            for(let i = -1; i <= 1; i++) {
                const angle = baseAngle + i * 0.15;
                spawnProjectile(
                    m.pos.x + 28 * Math.cos(angle),
                    m.pos.y + 28 * Math.sin(angle),
                    angle, 23, 4,
                    {
                        name: "plasma_bolt",
                        dmg: 0.25,
                        ttl: 85,
                        do() {
                            pushVFX(this.position.x, this.position.y, 7, "rgba(0,255,0,0.3)", 3);
                        }
                    }
                );
            }
            pushVFX(m.pos.x + 20 * Math.cos(baseAngle), m.pos.y + 20 * Math.sin(baseAngle), 18, "#0f0", 5);
        },
        do() {}
    });

    // 7. Photon Rifle - precision laser
    b.guns.push({
        name: "photon rifle",
        descriptionFunction() {
            return `fires precise <b style="color:#fff">photon beams</b><br>instant hit, high accuracy`;
        },
        ammo: 70,
        ammoPack: 18,
        defaultAmmoPack: 18,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 20;
            
            const range = 1500;
            const start = { x: m.pos.x + 35 * Math.cos(angle), y: m.pos.y + 35 * Math.sin(angle) };
            const end = { x: start.x + range * Math.cos(angle), y: start.y + range * Math.sin(angle) };
            
            const hit = vertexCollision(start, end, [map, mob, body]);
            const actualEnd = hit.x !== null ? { x: hit.x, y: hit.y } : end;
            
            // Draw beam
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(actualEnd.x, actualEnd.y);
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
            
            // Damage on hit
            if(hit.who && hit.who.alive) {
                hit.who.damage(1.5);
                pushVFX(actualEnd.x, actualEnd.y, 25, "rgba(255,255,255,0.6)", 10);
            }
            
            pushVFX(start.x, start.y, 20, "#fff", 6);
        },
        do() {}
    });

    // 8. Chaos Scatter - random spread
    b.guns.push({
        name: "chaos scatter",
        descriptionFunction() {
            return `unleashes <b style="color:#f80">chaotic energy</b><br>fires random projectiles in all directions`;
        },
        ammo: 80,
        ammoPack: 20,
        defaultAmmoPack: 20,
        have: false,
        fire() {
            m.fireCDcycle = m.cycle + 18;
            const count = 5 + Math.floor(Math.random() * 3);
            
            for(let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 15 + Math.random() * 10;
                
                spawnProjectile(
                    m.pos.x, m.pos.y,
                    angle, speed, 3 + Math.random() * 3,
                    {
                        name: "chaos_orb",
                        dmg: 0.2 + Math.random() * 0.3,
                        ttl: 60 + Math.floor(Math.random() * 40),
                        do() {
                            const colors = ["#f80", "#f08", "#08f", "#0f8"];
                            pushVFX(
                                this.position.x, this.position.y,
                                this.radius * 1.5,
                                colors[Math.floor(Math.random() * colors.length)] + "44",
                                3
                            );
                        }
                    }
                );
            }
            pushVFX(m.pos.x, m.pos.y, 30, "rgba(255,128,0,0.5)", 8);
        },
        do() {}
    });

    // 9. Star Burst - explosive star pattern
    b.guns.push({
        name: "star burst",
        descriptionFunction() {
            return `creates an explosive <b style="color:#ff0">star pattern</b><br>shoots 8 projectiles in a circle`;
        },
        ammo: 32,
        ammoPack: 8,
        defaultAmmoPack: 8,
        have: false,
        fire() {
            m.fireCDcycle = m.cycle + 45;
            
            for(let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                spawnProjectile(
                    m.pos.x, m.pos.y,
                    angle, 20, 6,
                    {
                        name: "star_shard",
                        dmg: 0.5,
                        ttl: 100,
                        do() {
                            pushVFX(this.position.x, this.position.y, 10, "rgba(255,255,0,0.4)", 4);
                        },
                        onEnd() {
                            if(this.endCycle === simulation.cycle) {
                                b.explosion(this.position, 100);
                            }
                        }
                    }
                );
            }
            pushVFX(m.pos.x, m.pos.y, 40, "#ff0", 10);
        },
        do() {}
    });

    // 10. Graviton Wave - pulls enemies
    b.guns.push({
        name: "graviton wave",
        descriptionFunction() {
            return `emits a <b style="color:#c0f">graviton wave</b><br>pulls nearby enemies toward impact point`;
        },
        ammo: 25,
        ammoPack: 6,
        defaultAmmoPack: 6,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 50;
            
            spawnProjectile(
                m.pos.x + 30 * Math.cos(angle),
                m.pos.y + 30 * Math.sin(angle),
                angle, 15, 12,
                {
                    name: "graviton_wave",
                    dmg: 0.3,
                    ttl: 150,
                    do() {
                        pushVFX(this.position.x, this.position.y, 16, "rgba(200,0,255,0.3)", 4);
                        
                        // Pull nearby mobs
                        for(let i = 0; i < mob.length; i++) {
                            if(mob[i].alive) {
                                const dx = this.position.x - mob[i].position.x;
                                const dy = this.position.y - mob[i].position.y;
                                const dist2 = dx * dx + dy * dy;
                                if(dist2 < 90000) { // 300px radius
                                    const force = Vector.mult(
                                        Vector.normalise({x: dx, y: dy}),
                                        0.0005 * mob[i].mass
                                    );
                                    mob[i].force.x += force.x;
                                    mob[i].force.y += force.y;
                                }
                            }
                        }
                    },
                    onEnd() {
                        if(this.endCycle === simulation.cycle) {
                            b.explosion(this.position, 200);
                        }
                    }
                }
            );
            pushVFX(m.pos.x + 20 * Math.cos(angle), m.pos.y + 20 * Math.sin(angle), 25, "#c0f", 8);
        },
        do() {}
    });

    
    console.log("%cAnime guns mod loaded! (10 weapons)", "color: teal");
})();


// ========================================


// anime_enemies.js
// Anime-themed enemy spawners for n-gon
(function(){
    'use strict';
    
    if(typeof spawn === 'undefined' || typeof mobs === 'undefined' || typeof Matter === 'undefined') {
        console.warn("anime_enemies: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }
    
    const Vector = Matter.Vector;

    // 1. Shadow Stalker - teleporting assassin
    spawn.shadowStalker = function(x, y, radius = 40) {
        mobs.spawn(x, y, 6, radius, "rgba(50,0,80,0.8)");
        let me = mob[mob.length - 1];
        me.stroke = "#000";
        me.memory = 300;
        me.seeAtDistance2 = 1000000;
        me.teleportCD = 0;
        
        me.do = function() {
            this.gravity();
            this.seePlayerCheck();
            
            if(this.seePlayer.yes) {
                // Teleport behind player occasionally
                if(this.teleportCD < m.cycle && Math.random() < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 150;
                    Matter.Body.setPosition(this, {
                        x: player.position.x + Math.cos(angle) * dist,
                        y: player.position.y + Math.sin(angle) * dist
                    });
                    this.teleportCD = m.cycle + 180;
                    
                    // Teleport effect
                    for(let i = 0; i < 8; i++) {
                        simulation.drawList.push({
                            x: this.position.x + (Math.random() - 0.5) * 80,
                            y: this.position.y + (Math.random() - 0.5) * 80,
                            radius: 15,
                            color: "rgba(100,0,150,0.4)",
                            time: 10
                        });
                    }
                }
                
                // Fast dash toward player
                const angle = Math.atan2(
                    this.seePlayer.position.y - this.position.y,
                    this.seePlayer.position.x - this.position.x
                );
                this.force.x += 0.003 * this.mass * Math.cos(angle);
                this.force.y += 0.003 * this.mass * Math.sin(angle);
            }
            
            this.checkStatus();
        };
    };

    // 2. Crystal Sentinel - defensive turret
    spawn.crystalSentinel = function(x, y, radius = 50) {
        mobs.spawn(x, y, 8, radius, "rgba(100,200,255,0.7)");
        let me = mob[mob.length - 1];
        me.stroke = "#0af";
        me.memory = 600;
        me.seeAtDistance2 = 2000000;
        me.fireCD = 0;
        me.frictionAir = 0.03; // Slow moving
        
        me.do = function() {
            this.gravity();
            this.seePlayerCheck();
            
            // Create shield effect
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(100,200,255,0.3)";
            ctx.lineWidth = 3;
            ctx.stroke();
            
            if(this.seePlayer.yes && this.fireCD < m.cycle) {
                // Fire crystal shard
                const angle = Math.atan2(
                    this.seePlayer.position.y - this.position.y,
                    this.seePlayer.position.x - this.position.x
                );
                
                mobs.bullet(this, angle, 18, 0.015);
                this.fireCD = m.cycle + 60;
            }
            
            this.checkStatus();
        };
    };

    // 3. Plasma Drone - flying shooter
    spawn.plasmaDrone = function(x, y, radius = 30) {
        mobs.spawn(x, y, 4, radius, "rgba(0,255,100,0.7)");
        let me = mob[mob.length - 1];
        me.stroke = "#0f8";
        me.memory = 400;
        me.seeAtDistance2 = 1500000;
        me.fireCD = 0;
        me.frictionAir = 0.02;
        me.g = -0.0003; // Floats
        
        me.do = function() {
            this.force.y += this.mass * this.g;
            this.seePlayerCheck();
            
            // Hover at certain height
            if(this.position.y > this.spawnPos.y - 200) {
                this.force.y -= 0.001 * this.mass;
            }
            
            if(this.seePlayer.yes) {
                // Circle around player
                const toPlayer = Vector.sub(this.seePlayer.position, this.position);
                const dist = Vector.magnitude(toPlayer);
                const perpendicular = { x: -toPlayer.y, y: toPlayer.x };
                const normalized = Vector.normalise(perpendicular);
                
                this.force.x += 0.001 * this.mass * normalized.x;
                this.force.y += 0.001 * this.mass * normalized.y;
                
                // Fire plasma bolts
                if(this.fireCD < m.cycle && dist < 600) {
                    const angle = Math.atan2(toPlayer.y, toPlayer.x);
                    mobs.bullet(this, angle, 15, 0.012);
                    this.fireCD = m.cycle + 45;
                }
            }
            
            this.checkStatus();
        };
    };

    // 4. Void Wraith - phase-shifting entity
    spawn.voidWraith = function(x, y, radius = 45) {
        mobs.spawn(x, y, 5, radius, "rgba(80,0,120,0.6)");
        let me = mob[mob.length - 1];
        me.stroke = "#508";
        me.memory = 500;
        me.seeAtDistance2 = 1800000;
        me.phaseCD = 0;
        me.isPhased = false;
        
        me.do = function() {
            this.gravity();
            this.seePlayerCheck();
            
            // Phase in/out
            if(this.phaseCD < m.cycle) {
                this.isPhased = !this.isPhased;
                this.phaseCD = m.cycle + 120;
                
                if(this.isPhased) {
                    this.collisionFilter.category = 0;
                    this.collisionFilter.mask = 0;
                    this.fill = "rgba(80,0,120,0.2)";
                } else {
                    this.collisionFilter.category = cat.mob;
                    this.collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet;
                    this.fill = "rgba(80,0,120,0.6)";
                }
            }
            
            if(this.seePlayer.yes) {
                const angle = Math.atan2(
                    this.seePlayer.position.y - this.position.y,
                    this.seePlayer.position.x - this.position.x
                );
                const speed = this.isPhased ? 0.004 : 0.002;
                this.force.x += speed * this.mass * Math.cos(angle);
                this.force.y += speed * this.mass * Math.sin(angle);
            }
            
            this.checkStatus();
        };
    };

    // 5. Thunder Beast - electric AoE
    spawn.thunderBeast = function(x, y, radius = 60) {
        mobs.spawn(x, y, 6, radius, "rgba(255,255,0,0.7)");
        let me = mob[mob.length - 1];
        me.stroke = "#ff0";
        me.memory = 450;
        me.seeAtDistance2 = 1600000;
        me.zapCD = 0;
        
        me.do = function() {
            this.gravity();
            this.seePlayerCheck();
            
            // Lightning aura
            if(m.cycle % 20 === 0) {
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255,255,0,0.4)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            if(this.seePlayer.yes) {
                // Chase player
                const angle = Math.atan2(
                    this.seePlayer.position.y - this.position.y,
                    this.seePlayer.position.x - this.position.x
                );
                this.force.x += 0.0025 * this.mass * Math.cos(angle);
                this.force.y += 0.0025 * this.mass * Math.sin(angle);
                
                // Electric discharge
                const dist = Vector.magnitude(Vector.sub(this.position, player.position));
                if(dist < 250 && this.zapCD < m.cycle) {
                    if(m.immuneCycle < m.cycle) {
                        m.takeDamage(0.02 * this.damageScale());
                    }
                    
                    // Lightning effect
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(player.position.x, player.position.y);
                    ctx.strokeStyle = "#ff0";
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    
                    this.zapCD = m.cycle + 30;
                }
            }
            
            this.checkStatus();
        };
    };

    // Add to spawn pools
    if (typeof spawn !== 'undefined') {
        // Add to tier 2 (medium difficulty)
        if (!spawn.tier[2].includes("shadowStalker")) {
            spawn.tier[2].push("shadowStalker", "crystalSentinel", "plasmaDrone");
        }
        
        // Add to tier 3 (harder)
        if (!spawn.tier[3].includes("voidWraith")) {
            spawn.tier[3].push("voidWraith", "thunderBeast");
        }
        
        // Add to full pick list
        const animeEnemies = ["shadowStalker", "crystalSentinel", "plasmaDrone", "voidWraith", "thunderBeast"];
        animeEnemies.forEach(name => {
            if (!spawn.fullPickList.includes(name)) {
                spawn.fullPickList.push(name);
            }
        });
    }
    
    console.log("%cAnime enemies mod loaded! (5 types)", "color: purple");
})();


// ========================================


// Celestial Halberd - Cosmic Hybrid (anime-style)
// Sweeping arc with a solar charge that can be released as a starburst AoE.

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("celestialHalberd: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const CelestialHalberd = {
        name: "celestial halberd",
        descriptionFunction() {
            return `wield a <b style="color:#ffd700">celestial halberd</b> that charges solar energy<br>release a <span style='color:#ff8c00'>starburst AoE</span> when fully charged`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        halberd: null,
        charge: 0,
        maxCharge: 120,
        cycle: 0,
        fire() {},
        do() {
            // charge while not firing (idle stacking)
            if (!input.fire && this.charge < this.maxCharge) {
                this.charge = Math.min(this.maxCharge, this.charge + 0.5);
            }

            // on fire, swing and possibly release starburst
            if (input.fire && !this.halberd && m.fireCDcycle < m.cycle) {
                m.fireCDcycle = m.cycle + 30;
                const pos = m.pos;
                const handle = Bodies.rectangle(pos.x, pos.y, 28, 320, spawn.propsIsNotHoldable);
                const bladeVertices = [
                    { x: -48, y: -80 },
                    { x: 88, y: -200 },
                    { x: -48, y: -240 }
                ];
                const blade = Bodies.fromVertices(pos.x, pos.y - 160, bladeVertices, spawn.propsIsNotHoldable);
                const body = Body.create({ parts: [handle, blade] });
                Composite.add(engine.world, body);
                body.collisionFilter.category = cat.bullet;
                body.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                Body.setVelocity(body, { x: Math.cos(m.angle) * 20, y: Math.sin(m.angle) * 20 });
                body._born = m.cycle;
                body._releasedStar = false;
                body._chargeLevel = this.charge;
                this.halberd = body;
                this.cycle = m.cycle;

                // Visual charge effect
                simulation.drawList.push({
                    x: pos.x,
                    y: pos.y,
                    radius: 20 + this.charge * 0.5,
                    color: `rgba(255, 215, 0, ${0.3 + this.charge / 240})`,
                    time: 10
                });
            }

            if (this.halberd) {
                // Draw charge indicator
                if (this.halberd._chargeLevel > 60) {
                    ctx.beginPath();
                    ctx.arc(this.halberd.position.x, this.halberd.position.y, 40 + Math.sin(m.cycle * 0.1) * 10, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 140, 0, ${0.4 + Math.sin(m.cycle * 0.2) * 0.2})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && Matter.Query.collides(this.halberd, [mob[i]]).length > 0) {
                        const dmg = 0.18 * m.dmgScale;
                        mob[i].damage(dmg, true);
                        
                        // if enough charge, release a starburst AoE once per swing
                        if (this.halberd._chargeLevel > 60 && !this.halberd._releasedStar) {
                            this.halberd._releasedStar = true;
                            const center = this.halberd.position;
                            const starCount = 8;
                            
                            // spawn multiple star projectiles
                            for (let s = 0; s < starCount; s++) {
                                const a = (s / starCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
                                const speed = 18 + this.halberd._chargeLevel / 8;
                                const starRadius = 14;
                                
                                const star = Bodies.circle(
                                    center.x + Math.cos(a) * 36,
                                    center.y + Math.sin(a) * 36,
                                    starRadius,
                                    spawn.propsIsNotHoldable
                                );
                                
                                Composite.add(engine.world, star);
                                star.collisionFilter.category = cat.bullet;
                                star.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                                star.classType = "bullet";
                                star.dmg = 0.12 * m.dmgScale;
                                star.minDmgSpeed = 5;
                                
                                Body.setVelocity(star, {
                                    x: Math.cos(a) * speed,
                                    y: Math.sin(a) * speed
                                });
                                
                                star.endCycle = m.cycle + 120;
                                star.do = function() {
                                    // Star visual trail
                                    simulation.drawList.push({
                                        x: this.position.x,
                                        y: this.position.y,
                                        radius: 8,
                                        color: "rgba(255, 215, 0, 0.6)",
                                        time: 3
                                    });
                                };
                                
                                bullet.push(star);
                            }
                            
                            // visual burst
                            simulation.drawList.push({
                                x: center.x,
                                y: center.y,
                                radius: 80,
                                color: "rgba(255, 140, 0, 0.5)",
                                time: 15
                            });
                            
                            this.charge = 0; // reset charge after burst
                        }
                        break;
                    }
                }

                // cleanup halberd after timeout
                if (m.cycle > this.cycle + 200) {
                    if (this.halberd) {
                        Composite.remove(engine.world, this.halberd);
                        this.halberd = null;
                    }
                }
            }
        }
    };

    b.guns.push(CelestialHalberd);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cCelestial Halberd mod loaded!", "color: #ffd700");
})();


// ========================================


// Raijin Edge - Electric Twin Swords (anime-style)
// Dual swords that create chain lightning between hit enemies; combo counter rewards.

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("raijinEdge: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const RaijinEdge = {
        name: "raijin edge",
        descriptionFunction() {
            return `wield <b style="color:#4169e1">twin lightning swords</b> that chain damage<br>build combo for increased power with <span style='color:#00ffff'>chain lightning</span>`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        blades: [],
        combo: 0,
        lastHitCycle: 0,
        cycle: 0,
        fire() {},
        do() {
            // fire spawns two blades slightly offset
            if (input.fire && this.blades.length === 0 && m.fireCDcycle < m.cycle) {
                m.fireCDcycle = m.cycle + 25;
                const pos = m.pos;
                
                for (let side of [-1, 1]) {
                    const handle = Bodies.rectangle(pos.x + side * 12, pos.y, 12, 120, spawn.propsIsNotHoldable);
                    const bladeVertices = [
                        { x: -4, y: -120 },
                        { x: 4, y: -120 },
                        { x: side * 8, y: -40 }
                    ];
                    const blade = Bodies.fromVertices(pos.x + side * 12, pos.y - 70, bladeVertices, spawn.propsIsNotHoldable);
                    const swordBody = Body.create({ parts: [handle, blade] });
                    
                    Composite.add(engine.world, swordBody);
                    swordBody.collisionFilter.category = cat.bullet;
                    swordBody.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                    Body.setVelocity(swordBody, {
                        x: Math.cos(m.angle) * 30,
                        y: Math.sin(m.angle) * 30
                    });
                    swordBody._born = m.cycle;
                    swordBody._side = side;
                    this.blades.push(swordBody);
                }
                this.cycle = m.cycle;
            }

            // Draw combo counter
            if (this.combo > 0) {
                ctx.fillStyle = `rgba(65, 105, 225, ${0.8 - this.combo * 0.02})`;
                ctx.font = "20px Arial";
                ctx.fillText(`⚡ Combo: ${this.combo}x`, m.pos.x - 40, m.pos.y - 80);
            }

            // blades exist: check collisions and chain lightning
            if (this.blades.length > 0) {
                for (let b of this.blades) {
                    // Lightning trail effect
                    if (Composite.allBodies(engine.world).includes(b)) {
                        simulation.drawList.push({
                            x: b.position.x,
                            y: b.position.y,
                            radius: 12,
                            color: "rgba(0, 255, 255, 0.4)",
                            time: 3
                        });
                    }

                    for (let i = 0; i < mob.length; i++) {
                        if (mob[i].alive && Matter.Query.collides(b, [mob[i]]).length > 0) {
                            const hitPower = 0.1 + Math.min(0.25, this.combo * 0.02);
                            mob[i].damage(hitPower * m.dmgScale, true);
                            
                            // chain lightning: find nearby mobs and zap
                            const zapped = [mob[i]];
                            for (let j = 0; j < mob.length; j++) {
                                if (mob[j].alive && mob[j] !== mob[i]) {
                                    const d = Vector.magnitude(Vector.sub(mob[j].position, mob[i].position));
                                    if (d < 220 && Math.random() < 0.9) {
                                        mob[j].damage(0.06 * m.dmgScale, true);
                                        zapped.push(mob[j]);
                                        
                                        // Draw lightning arc
                                        ctx.beginPath();
                                        ctx.moveTo(mob[i].position.x, mob[i].position.y);
                                        ctx.lineTo(mob[j].position.x, mob[j].position.y);
                                        ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
                                        ctx.lineWidth = 2;
                                        ctx.stroke();
                                        
                                        // small knockback
                                        Body.applyForce(mob[j], mob[j].position, {
                                            x: (mob[j].position.x - mob[i].position.x) * 0.0004,
                                            y: (mob[j].position.y - mob[i].position.y) * 0.0004
                                        });
                                    }
                                }
                            }
                            
                            // combo increment and timer
                            this.combo = Math.min(20, this.combo + 1);
                            this.lastHitCycle = m.cycle;
                            
                            // visual lightning effect
                            simulation.drawList.push({
                                x: mob[i].position.x,
                                y: mob[i].position.y,
                                radius: 30 + zapped.length * 10,
                                color: "rgba(65, 105, 225, 0.5)",
                                time: 8
                            });
                            
                            // blades break after a hit
                            Composite.remove(engine.world, b);
                        }
                    }
                }
                
                // remove destroyed blades from array
                this.blades = this.blades.filter(b => Composite.allBodies(engine.world).includes(b));
                
                // combo decay
                if (m.cycle > this.lastHitCycle + 80) this.combo = Math.max(0, this.combo - 1);
                
                // cleanup timeout
                if (m.cycle > this.cycle + 200) {
                    this.blades.forEach(b => Composite.remove(engine.world, b));
                    this.blades = [];
                }
            }
        }
    };

    b.guns.push(RaijinEdge);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cRaijin Edge mod loaded!", "color: #4169e1");
})();


// ========================================


// Reaper's Blossom - Ethereal Scythe (anime-style)
// On kills, spawns homing petal blades that seek nearest targets.

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("reapersBlossom: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const ReapersBlossom = {
        name: "reaper's blossom",
        descriptionFunction() {
            return `wield a <b style="color:#8b008b">ghostly scythe</b> that bursts<br><span style='color:#ff69b4'>homing petals</span> which seek targets on kill`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        scythe: null,
        petals: [],
        cycle: 0,
        fire() {},
        do() {
            if (input.fire && !this.scythe && m.fireCDcycle < m.cycle) {
                m.fireCDcycle = m.cycle + 35;
                const pos = m.pos;
                const handle = Bodies.rectangle(pos.x, pos.y, 22, 280, spawn.propsIsNotHoldable);
                const bladeVertices = [
                    { x: -30, y: -40 },
                    { x: 60, y: -140 },
                    { x: -30, y: -220 }
                ];
                const blade = Bodies.fromVertices(pos.x, pos.y - 130, bladeVertices, spawn.propsIsNotHoldable);
                const body = Body.create({ parts: [handle, blade] });
                
                Composite.add(engine.world, body);
                body.collisionFilter.category = cat.bullet;
                body.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                Body.setVelocity(body, {
                    x: Math.cos(m.angle) * 22,
                    y: Math.sin(m.angle) * 22
                });
                body._born = m.cycle;
                this.scythe = body;
                this.cycle = m.cycle;
            }

            // on collision, damage and sometimes spawn petals
            if (this.scythe) {
                // Ghostly trail
                simulation.drawList.push({
                    x: this.scythe.position.x,
                    y: this.scythe.position.y,
                    radius: 25,
                    color: "rgba(139, 0, 139, 0.3)",
                    time: 4
                });

                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && Matter.Query.collides(this.scythe, [mob[i]]).length > 0) {
                        const wasAlive = mob[i].alive;
                        mob[i].damage(0.14 * m.dmgScale, true);
                        
                        // spawn 4 petals on kill or on strong hits
                        if (!mob[i].alive || Math.random() < 0.22) {
                            for (let p = 0; p < 4; p++) {
                                const petal = Bodies.circle(
                                    this.scythe.position.x + (Math.random() - 0.5) * 20,
                                    this.scythe.position.y + (Math.random() - 0.5) * 20,
                                    8,
                                    spawn.propsIsNotHoldable
                                );
                                
                                Composite.add(engine.world, petal);
                                petal.collisionFilter.category = cat.bullet;
                                petal.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                                petal.classType = "bullet";
                                petal.dmg = 0.06 * m.dmgScale;
                                petal.minDmgSpeed = 3;
                                petal._born = m.cycle;
                                petal._life = 160;
                                petal._speed = 6 + Math.random() * 4;
                                
                                petal.do = function() {
                                    // Petal visual
                                    ctx.save();
                                    ctx.translate(this.position.x, this.position.y);
                                    ctx.rotate(m.cycle * 0.1);
                                    ctx.fillStyle = "rgba(255, 105, 180, 0.8)";
                                    ctx.beginPath();
                                    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
                                    ctx.fill();
                                    ctx.restore();
                                };
                                
                                this.petals.push(petal);
                                bullet.push(petal);
                            }
                        }
                        break;
                    }
                }

                // cleanup scythe
                if (m.cycle > this.cycle + 160) {
                    if (this.scythe) {
                        Composite.remove(engine.world, this.scythe);
                        this.scythe = null;
                    }
                }
            }

            // update petals: seek nearest mob
            if (this.petals.length > 0) {
                const survivors = [];
                for (let pet of this.petals) {
                    if (!Composite.allBodies(engine.world).includes(pet)) continue;
                    
                    if (m.cycle - (pet._born || 0) > (pet._life || 160)) {
                        Composite.remove(engine.world, pet);
                        continue;
                    }
                    
                    // find nearest mob
                    let target = null;
                    let best = 1e9;
                    for (let i = 0; i < mob.length; i++) {
                        if (mob[i].alive) {
                            const d = Vector.magnitude(Vector.sub(mob[i].position, pet.position));
                            if (d < best) {
                                best = d;
                                target = mob[i];
                            }
                        }
                    }
                    
                    if (target) {
                        const dir = Vector.normalise(Vector.sub(target.position, pet.position));
                        Body.setVelocity(pet, {
                            x: dir.x * pet._speed,
                            y: dir.y * pet._speed
                        });
                    } else {
                        // drift slowly upward
                        Body.translate(pet, { x: 0, y: -0.4 });
                    }
                    
                    survivors.push(pet);
                }
                this.petals = survivors;
            }
        }
    };

    b.guns.push(ReapersBlossom);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cReaper's Blossom mod loaded!", "color: #8b008b");
})();


// ========================================


// Excaliblaze - Flaming Divine Sword (anime-style)
// Charged swing creates crescent flame wave, burn-over-time on hit.

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("excaliblaze: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const Excaliblaze = {
        name: "excaliblaze",
        descriptionFunction() {
            return `wield a <b style="color:#ff4500">flaming divine sword</b><br>hold to charge, release for <span style='color:#ffa500'>flame wave</span> and burn damage`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        sword: null,
        chargeStart: 0,
        charged: false,
        cycle: 0,
        durability: 240,
        maxDurability: 240,
        _flameWaveReleased: false,
        fire() {},
        do() {
            // charge when holding fire
            if (input.fire && !this.sword && !this.charged) {
                if (this.chargeStart === 0) {
                    this.chargeStart = m.cycle;
                }
                
                // Visual charge effect
                const chargeTime = Math.min(60, m.cycle - this.chargeStart);
                if (chargeTime > 0) {
                    simulation.drawList.push({
                        x: m.pos.x,
                        y: m.pos.y,
                        radius: 15 + chargeTime * 0.5,
                        color: `rgba(255, 69, 0, ${0.2 + chargeTime / 120})`,
                        time: 2
                    });
                }
            }
            
            // release / swing
            if (!input.fire && this.chargeStart && !this.sword) {
                const chargeTime = Math.min(60, m.cycle - this.chargeStart);
                const power = 1 + (chargeTime / 60) * 2; // 1x -> 3x
                const pos = m.pos;
                
                // create sword body
                const handle = Bodies.rectangle(pos.x, pos.y, 18, 140, spawn.propsIsNotHoldable);
                const bladeVertices = [
                    { x: -6, y: -140 },
                    { x: 6, y: -140 },
                    { x: 18, y: -40 },
                    { x: -18, y: -40 }
                ];
                const blade = Bodies.fromVertices(pos.x, pos.y - 80, bladeVertices, spawn.propsIsNotHoldable);
                const body = Body.create({ parts: [handle, blade] });
                
                Composite.add(engine.world, body);
                body.collisionFilter.category = cat.bullet;
                body.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                
                const speed = 18 + 8 * (chargeTime / 60);
                Body.setVelocity(body, {
                    x: Math.cos(m.angle) * speed,
                    y: Math.sin(m.angle) * speed
                });
                
                body._power = power;
                body._spawnAt = m.cycle;
                this.sword = body;
                this.cycle = m.cycle;
                this.chargeStart = 0;
                this.charged = chargeTime > 28;
                this._flameWaveReleased = false;
                
                m.fireCDcycle = m.cycle + 20;
            }

            // sword exists: apply on-hit effects and flame wave on big charge
            if (this.sword) {
                // Flame trail
                simulation.drawList.push({
                    x: this.sword.position.x,
                    y: this.sword.position.y,
                    radius: 15 * (this.sword._power || 1),
                    color: `rgba(255, 140, 0, ${0.4 * (this.sword._power || 1)})`,
                    time: 5
                });

                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && Matter.Query.collides(this.sword, [mob[i]]).length > 0) {
                        const p = this.sword._power || 1;
                        mob[i].damage(0.12 * p * m.dmgScale, true);
                        
                        // apply burn over time
                        if (typeof mobs.statusDoT === 'function') {
                            mobs.statusDoT(mob[i], 0.01 * p, 80 + 40 * (p - 1));
                        }
                        
                        // on first hit of charged swing, release a crescent flame wave
                        if (this.charged && !this._flameWaveReleased) {
                            this._flameWaveReleased = true;
                            const wave = Bodies.circle(
                                this.sword.position.x + Math.cos(m.angle) * 40,
                                this.sword.position.y + Math.sin(m.angle) * 40,
                                24,
                                spawn.propsIsNotHoldable
                            );
                            
                            Composite.add(engine.world, wave);
                            wave.collisionFilter.category = cat.bullet;
                            wave.collisionFilter.mask = cat.mob | cat.mobBullet | cat.powerup;
                            wave.classType = "bullet";
                            wave.dmg = 0.08 * p * m.dmgScale;
                            wave.minDmgSpeed = 5;
                            
                            const waveSpeed = 28 * p;
                            Body.setVelocity(wave, {
                                x: Math.cos(m.angle) * waveSpeed,
                                y: Math.sin(m.angle) * waveSpeed
                            });
                            
                            wave._born = m.cycle;
                            wave.endCycle = m.cycle + 120;
                            wave._power = p;
                            
                            wave.do = function() {
                                // Flame wave visual
                                simulation.drawList.push({
                                    x: this.position.x,
                                    y: this.position.y,
                                    radius: 30 * (this._power || 1),
                                    color: "rgba(255, 69, 0, 0.6)",
                                    time: 4
                                });
                            };
                            
                            bullet.push(wave);
                        }
                        
                        this.durability -= 4;
                        break;
                    }
                }

                // cleanup sword after timeout or durability depletion
                if (m.cycle > this.cycle + 160 || this.durability <= 0) {
                    if (this.sword) {
                        Composite.remove(engine.world, this.sword);
                        this.sword = null;
                        this._flameWaveReleased = false;
                        this.charged = false;
                        this.durability = this.maxDurability;
                    }
                }
            }
        }
    };

    b.guns.push(Excaliblaze);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cExcaliblaze mod loaded!", "color: #ff4500");
})();


// ========================================


// Meteor Hammer - Heavy Spinning Weapon (anime-style)
// Swing a massive hammer that spins and deals area damage

const MeteorHammer = {
  name: "meteor-hammer",
  descriptionFunction() {
    return "Meteor Hammer — massive spinning hammer with AOE damage and knockback.";
  },
  have: false,
  ammo: Infinity,
  ammoPack: Infinity,
  defaultAmmoPack: Infinity,
  hammer: null,
  headSegments: [],
  headTrails: [],
  angle: 0,
  spinSpeed: 0,
  
  fire() {},
  
  do() {
    if (input.fire && b.guns[b.activeGun].name === 'meteor-hammer') {
      if (!this.hammer) {
        this.createHammer();
      }
      
      if (this.hammer) {
        // Increase spin speed
        this.spinSpeed = Math.min(this.spinSpeed + 0.02, 0.3);
        Matter.Body.setAngularVelocity(this.hammer, this.spinSpeed);
        
        // Position around player
        const radius = 150;
        const x = m.pos.x + Math.cos(this.hammer.angle) * radius;
        const y = m.pos.y + Math.sin(this.hammer.angle) * radius;
        Matter.Body.setPosition(this.hammer, { x, y });
        
        // Collision detection
        for (let i = 0; i < mob.length; i++) {
          if (Matter.Query.collides(this.hammer, [mob[i]]).length > 0) {
            const dmg = (m.damageDone || m.dmgScale) * 0.25;
            mob[i].damage(dmg, true);
            
            // Knockback
            const angle = Math.atan2(mob[i].position.y - this.hammer.position.y, 
                                    mob[i].position.x - this.hammer.position.x);
            mob[i].force.x += Math.cos(angle) * 0.5;
            mob[i].force.y += Math.sin(angle) * 0.5;
            
            simulation.drawList.push({
              x: mob[i].position.x,
              y: mob[i].position.y,
              radius: 80,
              color: "#ff6600",
              time: simulation.drawTime
            });
          }
        }
        
        // Draw
        ctx.beginPath();
        ctx.arc(this.hammer.position.x, this.hammer.position.y, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff6600";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    } else if (this.hammer) {
      Composite.remove(engine.world, this.hammer);
      this.hammer = null;
      this.spinSpeed = 0;
    }
  },
  
  createHammer() {
    this.hammer = Bodies.circle(m.pos.x, m.pos.y, 50, {
      density: 0.1,
      frictionAir: 0.01,
      collisionFilter: {
        category: cat.bullet,
        mask: cat.mob
      }
    });
    Composite.add(engine.world, this.hammer);
  }
};

b.guns.push(MeteorHammer);
console.log("%cMeteor Hammer loaded!", "color: #ff6600");


// ========================================


// Shadow Rapier - Fast Thrust Weapon (anime-style)
// Quick thrusting attacks that can teleport player short distances

const ShadowRapier = {
  name: "shadow-rapier",
  descriptionFunction() {
    return "Shadow Rapier — lightning-fast thrusts with shadow step mobility.";
  },
  have: false,
  ammo: Infinity,
  ammoPack: Infinity,
  defaultAmmoPack: Infinity,
  rapier: null,
  thrustCooldown: 0,
  
  fire() {},
  
  do() {
    if (input.fire && this.thrustCooldown <= 0 && b.guns[b.activeGun].name === 'shadow-rapier') {
      this.thrust();
      this.thrustCooldown = 15;
    }
    
    if (this.thrustCooldown > 0) this.thrustCooldown--;
    
    // Draw rapier
    if (b.guns[b.activeGun].name === 'shadow-rapier') {
      const length = 120;
      const startX = m.pos.x + Math.cos(m.angle) * 30;
      const startY = m.pos.y + Math.sin(m.angle) * 30;
      const endX = startX + Math.cos(m.angle) * length;
      const endY = startY + Math.sin(m.angle) * length;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#4b0082";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Tip
      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#9400d3";
      ctx.fill();
    }
  },
  
  thrust() {
    const range = 200;
    const tipX = m.pos.x + Math.cos(m.angle) * range;
    const tipY = m.pos.y + Math.sin(m.angle) * range;
    
    // Check for hits
    for (let i = 0; i < mob.length; i++) {
      const dx = mob[i].position.x - tipX;
      const dy = mob[i].position.y - tipY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < mob[i].radius + 20) {
        const dmg = (m.damageDone || m.dmgScale) * 0.15;
        mob[i].damage(dmg, true);
        
        simulation.drawList.push({
          x: mob[i].position.x,
          y: mob[i].position.y,
          radius: 50,
          color: "#4b0082",
          time: simulation.drawTime
        });
      }
    }
    
    // Visual effect
    simulation.drawList.push({
      x: tipX,
      y: tipY,
      radius: 30,
      color: "rgba(75, 0, 130, 0.5)",
      time: 6
    });
  }
};

b.guns.push(ShadowRapier);
console.log("%cShadow Rapier loaded!", "color: #4b0082");


// ========================================


// Tri-Trident - Triple Projectile Weapon (anime-style)
// Throws three water-based projectiles in a spread

const TriTrident = {
  name: "tri-trident",
  descriptionFunction() {
    return "Tri-Trident — throws three water spears in a spread pattern.";
  },
  have: false,
  ammo: 45,
  ammoPack: 15,
  defaultAmmoPack: 15,
  
  fire() {
    const spreadAngle = Math.PI / 12;
    
    for (let i = -1; i <= 1; i++) {
      const angle = m.angle + i * spreadAngle;
      const me = bullet.length;
      
      bullet[me] = Bodies.rectangle(
        m.pos.x + 30 * Math.cos(angle),
        m.pos.y + 30 * Math.sin(angle),
        40, 8,
        b.fireAttributes(angle)
      );
      
      bullet[me].dmg = 0.8;
      Matter.Body.setVelocity(bullet[me], {
        x: 25 * Math.cos(angle),
        y: 25 * Math.sin(angle)
      });
      
      Composite.add(engine.world, bullet[me]);
      
      bullet[me].do = function() {
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      };
    }
    
    m.fireCDcycle = m.cycle + 20;
  },
  
  do() {}
};

b.guns.push(TriTrident);
console.log("%cTri-Trident loaded!", "color: #00ffff");


// ========================================


// Chain-Scythe - Extending Chain Weapon (anime-style)
// Throwable scythe on a chain that can be pulled back

const ChainScythe = {
  name: "chain-scythe",
  descriptionFunction() {
    return "Chain-Scythe — throwable scythe on a chain that returns to you.";
  },
  have: false,
  ammo: Infinity,
  ammoPack: Infinity,
  defaultAmmoPack: Infinity,
  scythe: null,
  isExtending: false,
  maxLength: 500,
  currentLength: 0,
  
  fire() {},
  
  do() {
    if (input.fire && !this.scythe && b.guns[b.activeGun].name === 'chain-scythe') {
      this.throwScythe();
    }
    
    if (this.scythe) {
      if (this.isExtending) {
        this.currentLength += 30;
        if (this.currentLength >= this.maxLength) {
          this.isExtending = false;
        }
      } else {
        this.currentLength -= 40;
        if (this.currentLength <= 0) {
          Composite.remove(engine.world, this.scythe);
          this.scythe = null;
          this.currentLength = 0;
          m.fireCDcycle = m.cycle + 30;
        }
      }
      
      if (this.scythe) {
        // Pull toward player
        const dx = m.pos.x - this.scythe.position.x;
        const dy = m.pos.y - this.scythe.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (!this.isExtending && dist > 50) {
          this.scythe.force.x = (dx / dist) * 0.03;
          this.scythe.force.y = (dy / dist) * 0.03;
        }
        
        Matter.Body.setAngularVelocity(this.scythe, 0.3);
        
        // Draw chain
        ctx.beginPath();
        ctx.moveTo(m.pos.x, m.pos.y);
        ctx.lineTo(this.scythe.position.x, this.scythe.position.y);
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw scythe
        ctx.save();
        ctx.translate(this.scythe.position.x, this.scythe.position.y);
        ctx.rotate(this.scythe.angle);
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(-30, -5, 60, 10);
        ctx.fillRect(20, -25, 10, 30);
        ctx.restore();
        
        // Collision
        for (let i = 0; i < mob.length; i++) {
          if (Matter.Query.collides(this.scythe, [mob[i]]).length > 0) {
            const dmg = (m.damageDone || m.dmgScale) * 0.2;
            mob[i].damage(dmg, true);
            simulation.drawList.push({
              x: mob[i].position.x,
              y: mob[i].position.y,
              radius: 60,
              color: "#8b0000",
              time: simulation.drawTime
            });
          }
        }
      }
    }
  },
  
  throwScythe() {
    this.scythe = Bodies.rectangle(
      m.pos.x + 40 * Math.cos(m.angle),
      m.pos.y + 40 * Math.sin(m.angle),
      60, 10
    );
    
    this.scythe.collisionFilter = {
      category: cat.bullet,
      mask: cat.mob
    };
    
    Matter.Body.setVelocity(this.scythe, {
      x: 20 * Math.cos(m.angle),
      y: 20 * Math.sin(m.angle)
    });
    
    Composite.add(engine.world, this.scythe);
    this.isExtending = true;
    this.currentLength = 0;
  }
};

b.guns.push(ChainScythe);
console.log("%cChain-Scythe loaded!", "color: #8b0000");


// ========================================


// Katana - Fast Slash Melee Weapon (anime-style)
// Quick slashes with charge-up for powerful strike

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("katana: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const Katana = {
        name: "katana",
        descriptionFunction() {
            return `wield a <b style="color:#c0c0c0">swift katana</b><br>hold to charge for a <span style='color:#4169e1'>devastating slash</span><br>drains <strong class='color-h'>health</strong> instead of ammunition`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        katana: null,
        bladeSegments: [],
        bladeTrails: [],
        charge: 0,
        maxCharge: 60,
        cycle: 0,
        haveEphemera: false,
        fire() {},
        do() {
            if(!this.haveEphemera) {
                this.haveEphemera = true;
                simulation.ephemera.push({
                    name: "katana",
                    do() {
                        if(b.guns[b.activeGun].name !== 'katana') {
                            for (let i = 0; i < b.inventory.length; i++) {
                                if(b.guns[b.inventory[i]].name === "katana" && b.guns[b.inventory[i]].katana) {
                                    Composite.remove(engine.world, b.guns[b.inventory[i]].katana);
                                    b.guns[b.inventory[i]].katana = null;
                                    b.guns[b.inventory[i]].bladeTrails = [];
                                }
                            }
                        }
                    }
                });
            }

            // Charge mechanic
            if (input.fire && !this.katana && (tech.isEnergyHealth ? m.energy >= 0.05 : m.health >= 0.05)) {
                this.charge = Math.min(this.maxCharge, this.charge + 1);
                
                // Visual charge effect
                if(this.charge > 10) {
                    simulation.drawList.push({
                        x: m.pos.x,
                        y: m.pos.y,
                        radius: 10 + this.charge * 0.5,
                        color: `rgba(65, 105, 225, ${this.charge / this.maxCharge * 0.5})`,
                        time: 2
                    });
                }
            }

            // Release slash
            if(!input.fire && this.charge > 0 && !this.katana) {
                const power = 1 + (this.charge / this.maxCharge) * 2;
                this.createKatana(power);
                this.cycle = m.cycle;
                
                if(tech.isEnergyHealth) {
                    m.energy -= 0.03 * power;
                } else {
                    m.health -= 0.02 * power;
                    m.displayHealth();
                }
                
                this.charge = 0;
            }

            // Update katana
            if(this.katana) {
                this.cycle++;
                
                // Spin katana
                Matter.Body.setAngularVelocity(this.katana, 
                    (m.angle > -Math.PI / 2 && m.angle < Math.PI / 2) ? 0.4 : -0.4
                );
                
                // Position near player
                const targetX = m.pos.x + Math.cos(m.angle) * 80;
                const targetY = m.pos.y + Math.sin(m.angle) * 80;
                Matter.Body.setPosition(this.katana, { x: targetX, y: targetY });
                
                // Trail effect
                for (let i = 0; i < this.bladeSegments.length; i++) {
                    const blade = this.bladeSegments[i];
                    const trail = this.bladeTrails[i] || [];
                    const vertices = blade.vertices.map(v => ({ x: v.x, y: v.y }));
                    trail.push(vertices);
                    if (trail.length > 8) trail.shift();
                    this.bladeTrails[i] = trail;
                }

                // Draw trails
                for (let i = 0; i < this.bladeTrails.length; i++) {
                    const trail = this.bladeTrails[i];
                    const alphaStep = 1 / trail.length;
                    let alpha = 0;

                    for (let j = 0; j < trail.length; j++) {
                        const vertices = trail[j];
                        ctx.beginPath();
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let k = 1; k < vertices.length; k++) {
                            ctx.lineTo(vertices[k].x, vertices[k].y);
                        }
                        alpha += alphaStep;
                        ctx.closePath();
                        ctx.fillStyle = `rgba(192, 192, 192, ${alpha * 0.6})`;
                        ctx.fill();
                    }
                }

                // Draw katana
                for(let i = 0; i < this.bladeSegments.length; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = "#c0c0c0";
                    ctx.lineWidth = 4;
                    ctx.fillStyle = "#e8e8e8";
                    ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
                    for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
                        ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }

                // Collision
                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && Matter.Query.collides(this.katana, [mob[i]]).length > 0) {
                        const dmg = 0.15 * m.dmgScale * (this.katana._power || 1);
                        mob[i].damage(dmg, true);
                        simulation.drawList.push({
                            x: mob[i].position.x,
                            y: mob[i].position.y,
                            radius: 50 * (this.katana._power || 1),
                            color: "rgba(192, 192, 255, 0.6)",
                            time: simulation.drawTime
                        });
                        break;
                    }
                }

                // Remove after duration
                if(this.cycle > m.cycle + 45) {
                    Composite.remove(engine.world, this.katana);
                    this.katana = null;
                    this.bladeTrails = [];
                }
            }
        },
        createKatana(power = 1) {
            const pos = m.pos;
            const handle = Bodies.rectangle(pos.x, pos.y, 15, 100, spawn.propsIsNotHoldable);
            
            const bladeVertices = [
                { x: -5, y: -150 },
                { x: 5, y: -150 },
                { x: 8, y: 0 },
                { x: -8, y: 0 }
            ];
            const blade = Bodies.fromVertices(pos.x, pos.y - 75, bladeVertices, spawn.propsIsNotHoldable);
            
            const katana = Body.create({ parts: [handle, blade] });
            Composite.add(engine.world, katana);
            
            katana.collisionFilter.category = cat.bullet;
            katana.collisionFilter.mask = cat.mob | cat.mobBullet;
            katana._power = power;
            
            this.katana = katana;
            this.bladeSegments = [handle, blade];
        }
    };

    b.guns.push(Katana);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cKatana mod loaded!", "color: #c0c0c0");
})();


// ========================================


// Battle Axe - Heavy Cleave Weapon (anime-style)
// Slow but powerful overhead strikes with knockback

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("battleAxe: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const BattleAxe = {
        name: "battle axe",
        descriptionFunction() {
            return `wield a <b style="color:#8b4513">massive battle axe</b><br><span style='color:#ff4500'>devastating cleave</span> with heavy knockback<br>drains <strong class='color-h'>health</strong> instead of ammunition`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        axe: null,
        bladeSegments: [],
        bladeTrails: [],
        cycle: 0,
        haveEphemera: false,
        fire() {},
        do() {
            if(!this.haveEphemera) {
                this.haveEphemera = true;
                simulation.ephemera.push({
                    name: "battleAxe",
                    do() {
                        if(b.guns[b.activeGun].name !== 'battle axe') {
                            for (let i = 0; i < b.inventory.length; i++) {
                                if(b.guns[b.inventory[i]].name === "battle axe" && b.guns[b.inventory[i]].axe) {
                                    Composite.remove(engine.world, b.guns[b.inventory[i]].axe);
                                    b.guns[b.inventory[i]].axe = null;
                                    b.guns[b.inventory[i]].bladeTrails = [];
                                }
                            }
                        }
                    }
                });
            }

            if (input.fire && !this.axe && b.guns[b.activeGun].name === 'battle axe') {
                if(tech.isEnergyHealth ? m.energy >= 0.08 : m.health >= 0.08) {
                    this.createAxe();
                    this.cycle = m.cycle;
                    
                    if(tech.isEnergyHealth) {
                        m.energy -= 0.08;
                    } else {
                        m.health -= 0.05;
                        m.displayHealth();
                    }
                }
            }

            if(this.axe) {
                this.cycle++;
                
                // Heavy swing
                const swingSpeed = (m.angle > -Math.PI / 2 && m.angle < Math.PI / 2) ? 0.25 : -0.25;
                Matter.Body.setAngularVelocity(this.axe, swingSpeed);
                
                // Follow player
                const targetX = m.pos.x + Math.cos(m.angle) * 100;
                const targetY = m.pos.y + Math.sin(m.angle) * 100;
                Matter.Body.setPosition(this.axe, { x: targetX, y: targetY });
                
                // Trail
                for (let i = 0; i < this.bladeSegments.length; i++) {
                    const blade = this.bladeSegments[i];
                    const trail = this.bladeTrails[i] || [];
                    const vertices = blade.vertices.map(v => ({ x: v.x, y: v.y }));
                    trail.push(vertices);
                    if (trail.length > 6) trail.shift();
                    this.bladeTrails[i] = trail;
                }

                // Draw trails
                for (let i = 0; i < this.bladeTrails.length; i++) {
                    const trail = this.bladeTrails[i];
                    const alphaStep = 1 / trail.length;
                    let alpha = 0;

                    for (let j = 0; j < trail.length; j++) {
                        const vertices = trail[j];
                        ctx.beginPath();
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let k = 1; k < vertices.length; k++) {
                            ctx.lineTo(vertices[k].x, vertices[k].y);
                        }
                        alpha += alphaStep;
                        ctx.closePath();
                        ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.4})`;
                        ctx.fill();
                    }
                }

                // Draw axe
                for(let i = 0; i < this.bladeSegments.length; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = "#8b4513";
                    ctx.lineWidth = 5;
                    ctx.fillStyle = "#a0522d";
                    ctx.moveTo(this.bladeSegments[i].vertices[0].x, this.bladeSegments[i].vertices[0].y);
                    for(let j = 0; j < this.bladeSegments[i].vertices.length; j++) {
                        ctx.lineTo(this.bladeSegments[i].vertices[j].x, this.bladeSegments[i].vertices[j].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }

                // Collision with knockback
                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && Matter.Query.collides(this.axe, [mob[i]]).length > 0) {
                        const dmg = 0.25 * m.dmgScale;
                        mob[i].damage(dmg, true);
                        
                        // Heavy knockback
                        const angle = Math.atan2(mob[i].position.y - this.axe.position.y, 
                                                mob[i].position.x - this.axe.position.x);
                        mob[i].force.x += Math.cos(angle) * 0.8;
                        mob[i].force.y += Math.sin(angle) * 0.8;
                        
                        simulation.drawList.push({
                            x: mob[i].position.x,
                            y: mob[i].position.y,
                            radius: 80,
                            color: "rgba(255, 69, 0, 0.7)",
                            time: simulation.drawTime
                        });
                        break;
                    }
                }

                // Remove after swing
                if(this.cycle > m.cycle + 50) {
                    Composite.remove(engine.world, this.axe);
                    this.axe = null;
                    this.bladeTrails = [];
                    m.fireCDcycle = m.cycle + 40;
                }
            }
        },
        createAxe() {
            const pos = m.pos;
            const handle = Bodies.rectangle(pos.x, pos.y, 25, 180, spawn.propsIsNotHoldable);
            
            // Axe head - wide blade
            const blade1Vertices = [
                { x: -80, y: -100 },
                { x: 80, y: -100 },
                { x: 20, y: 0 },
                { x: -20, y: 0 }
            ];
            const blade1 = Bodies.fromVertices(pos.x, pos.y - 140, blade1Vertices, spawn.propsIsNotHoldable);
            
            const blade2Vertices = [
                { x: -60, y: 0 },
                { x: 60, y: 0 },
                { x: 15, y: 40 },
                { x: -15, y: 40 }
            ];
            const blade2 = Bodies.fromVertices(pos.x, pos.y - 120, blade2Vertices, spawn.propsIsNotHoldable);
            
            const axe = Body.create({ parts: [handle, blade1, blade2] });
            Composite.add(engine.world, axe);
            
            axe.collisionFilter.category = cat.bullet;
            axe.collisionFilter.mask = cat.mob | cat.mobBullet;
            
            this.axe = axe;
            this.bladeSegments = [handle, blade1, blade2];
        }
    };

    b.guns.push(BattleAxe);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cBattle Axe mod loaded!", "color: #8b4513");
})();


// ========================================


// Energy Bow - Charged Arrow Weapon (anime-style)
// Fires energy arrows with charge mechanic

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("energyBow: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const EnergyBow = {
        name: "energy bow",
        descriptionFunction() {
            return `fires <b style="color:#00ff00">energy arrows</b><br>hold to charge for increased damage and speed`;
        },
        ammo: 60,
        ammoPack: 20,
        defaultAmmoPack: 20,
        have: false,
        charge: 0,
        maxCharge: 90,
        fire() {},
        do() {
            // Charge while holding fire
            if(input.fire && this.charge < this.maxCharge) {
                this.charge = Math.min(this.maxCharge, this.charge + 2);
                
                // Visual charge effect
                if(this.charge > 15) {
                    simulation.drawList.push({
                        x: m.pos.x + Math.cos(m.angle) * 40,
                        y: m.pos.y + Math.sin(m.angle) * 40,
                        radius: 8 + this.charge * 0.3,
                        color: `rgba(0, 255, 0, ${this.charge / this.maxCharge})`,
                        time: 2
                    });
                }
            }
            
            // Release arrow
            if(!input.fire && this.charge > 15 && m.fireCDcycle < m.cycle) {
                const power = this.charge / this.maxCharge;
                const angle = m.angle;
                const speed = 15 + power * 25;
                
                const arrow = Bodies.rectangle(
                    m.pos.x + Math.cos(angle) * 40,
                    m.pos.y + Math.sin(angle) * 40,
                    50 * (1 + power * 0.5), 8,
                    spawn.propsIsNotHoldable
                );
                
                Composite.add(engine.world, arrow);
                arrow.collisionFilter.category = cat.bullet;
                arrow.collisionFilter.mask = cat.mob | cat.mobBullet | cat.map;
                arrow.classType = "bullet";
                arrow.dmg = 0.5 * (1 + power * 2) * m.dmgScale;
                arrow.minDmgSpeed = 5;
                
                Body.setVelocity(arrow, {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                });
                
                Body.setAngle(arrow, angle);
                arrow.endCycle = m.cycle + 150;
                arrow._power = power;
                
                arrow.do = function() {
                    // Arrow trail
                    ctx.save();
                    ctx.translate(this.position.x, this.position.y);
                    ctx.rotate(this.angle);
                    
                    // Glow
                    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
                    grd.addColorStop(0, `rgba(0, 255, 0, ${this._power || 0.5})`);
                    grd.addColorStop(1, 'rgba(0, 255, 0, 0)');
                    ctx.fillStyle = grd;
                    ctx.fillRect(-30, -15, 60, 30);
                    
                    // Arrow
                    ctx.fillStyle = "#00ff00";
                    ctx.beginPath();
                    ctx.moveTo(25, 0);
                    ctx.lineTo(-20, -4);
                    ctx.lineTo(-20, 4);
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.restore();
                };
                
                bullet.push(arrow);
                
                m.fireCDcycle = m.cycle + 20;
                this.charge = 0;
                b.guns[b.activeGun].ammo--;
                simulation.updateGunHUD();
                
                // Visual release effect
                simulation.drawList.push({
                    x: m.pos.x + Math.cos(angle) * 40,
                    y: m.pos.y + Math.sin(angle) * 40,
                    radius: 30,
                    color: "rgba(0, 255, 0, 0.6)",
                    time: 8
                });
            }
            
            // Reset charge if not firing
            if(!input.fire && this.charge < 15) {
                this.charge = 0;
            }
        }
    };

    b.guns.push(EnergyBow);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cEnergy Bow mod loaded!", "color: #00ff00");
})();


// ========================================


// Railgun - Electromagnetic Projectile Weapon (sci-fi style)
// Fires high-velocity projectiles with piercing capability

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("railgun: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const Railgun = {
        name: "railgun",
        descriptionFunction() {
            return `fires <b style="color:#00ffff">electromagnetic projectiles</b><br>pierces through multiple enemies with devastating force`;
        },
        ammo: 30,
        ammoPack: 10,
        defaultAmmoPack: 10,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 60;
            
            // Create projectile
            const projectile = Bodies.rectangle(
                m.pos.x + Math.cos(angle) * 50,
                m.pos.y + Math.sin(angle) * 50,
                40, 6,
                spawn.propsIsNotHoldable
            );
            
            Composite.add(engine.world, projectile);
            projectile.collisionFilter.category = cat.bullet;
            projectile.collisionFilter.mask = cat.mob | cat.mobBullet | cat.map;
            projectile.classType = "bullet";
            projectile.dmg = 1.5 * m.dmgScale;
            projectile.minDmgSpeed = 10;
            
            const speed = 45;
            Body.setVelocity(projectile, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
            
            Body.setAngle(projectile, angle);
            projectile.endCycle = m.cycle + 120;
            projectile._hitCount = 0;
            projectile._maxHits = 3;
            
            projectile.beforeDmg = function(who) {
                this._hitCount++;
                if(this._hitCount >= this._maxHits) {
                    this.endCycle = 0;
                }
            };
            
            projectile.do = function() {
                // Electromagnetic field effect
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(this.angle);
                
                // Electric field
                for(let i = 0; i < 3; i++) {
                    const offset = (m.cycle + i * 10) % 30;
                    ctx.strokeStyle = `rgba(0, 255, 255, ${1 - offset / 30})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, 10 + offset, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                // Projectile core
                ctx.fillStyle = "#00ffff";
                ctx.fillRect(-20, -3, 40, 6);
                
                // Glow
                const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
                grd.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                grd.addColorStop(1, 'rgba(0, 255, 255, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(-25, -10, 50, 20);
                
                ctx.restore();
                
                // Trail particles
                if(typeof simulation !== 'undefined' && simulation.drawList) {
                    simulation.drawList.push({
                        x: this.position.x,
                        y: this.position.y,
                        radius: 8,
                        color: "rgba(0, 255, 255, 0.5)",
                        time: 5
                    });
                }
            };
            
            bullet.push(projectile);
            
            // Muzzle flash
            if(typeof simulation !== 'undefined' && simulation.drawList) {
                simulation.drawList.push({
                    x: m.pos.x + Math.cos(angle) * 50,
                    y: m.pos.y + Math.sin(angle) * 50,
                    radius: 40,
                    color: "rgba(0, 255, 255, 0.7)",
                    time: 10
                });
            }
            
            // Recoil
            m.force.x -= Math.cos(angle) * 0.15;
            m.force.y -= Math.sin(angle) * 0.15;
        },
        do() {}
    };

    b.guns.push(Railgun);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cRailgun mod loaded!", "color: #00ffff");
})();


// ========================================


// Plasma Cannon - Explosive Energy Weapon (sci-fi style)
// Fires slow-moving plasma orbs that explode on impact

(function() {
    'use strict';
    
    if(typeof b === 'undefined' || typeof Bodies === 'undefined' || typeof Composite === 'undefined') {
        console.warn("plasmaCannon: required globals missing. Retrying...");
        setTimeout(arguments.callee, 100);
        return;
    }

    const PlasmaCannon = {
        name: "plasma cannon",
        descriptionFunction() {
            return `fires <b style="color:#ff00ff">superheated plasma orbs</b><br>explodes on impact with area damage`;
        },
        ammo: 40,
        ammoPack: 12,
        defaultAmmoPack: 12,
        have: false,
        fire() {
            const angle = m.angle;
            m.fireCDcycle = m.cycle + 45;
            
            // Create plasma orb
            const orb = Bodies.circle(
                m.pos.x + Math.cos(angle) * 50,
                m.pos.y + Math.sin(angle) * 50,
                18,
                spawn.propsIsNotHoldable
            );
            
            Composite.add(engine.world, orb);
            orb.collisionFilter.category = cat.bullet;
            orb.collisionFilter.mask = cat.mob | cat.mobBullet | cat.map;
            orb.classType = "bullet";
            orb.dmg = 0.8 * m.dmgScale;
            orb.minDmgSpeed = 3;
            
            const speed = 12;
            Body.setVelocity(orb, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
            
            orb.endCycle = m.cycle + 180;
            orb._born = m.cycle;
            
            orb.beforeDmg = function(who) {
                this.endCycle = 0;
            };
            
            orb.onEnd = function() {
                if(this.endCycle === simulation.cycle) {
                    // Explosion effect
                    b.explosion(this.position, 150);
                    
                    // Visual explosion
                    for(let i = 0; i < 8; i++) {
                        simulation.drawList.push({
                            x: this.position.x + (Math.random() - 0.5) * 80,
                            y: this.position.y + (Math.random() - 0.5) * 80,
                            radius: 30 + Math.random() * 40,
                            color: `rgba(255, 0, 255, ${0.4 + Math.random() * 0.4})`,
                            time: 15
                        });
                    }
                }
            };
            
            orb.do = function() {
                // Plasma effect
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                
                // Pulsing glow
                const pulse = Math.sin((m.cycle - this._born) * 0.2) * 0.3 + 0.7;
                
                // Outer glow
                const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
                grd.addColorStop(0, `rgba(255, 0, 255, ${pulse})`);
                grd.addColorStop(0.5, `rgba(255, 100, 255, ${pulse * 0.5})`);
                grd.addColorStop(1, 'rgba(255, 0, 255, 0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(0, 0, 25, 0, Math.PI * 2);
                ctx.fill();
                
                // Core
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Energy arcs
                for(let i = 0; i < 3; i++) {
                    const arcAngle = (m.cycle * 0.1 + i * Math.PI * 2 / 3) % (Math.PI * 2);
                    const arcRadius = 15;
                    ctx.strokeStyle = `rgba(255, 0, 255, ${pulse * 0.6})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(arcAngle) * arcRadius, Math.sin(arcAngle) * arcRadius);
                    ctx.stroke();
                }
                
                ctx.restore();
            };
            
            bullet.push(orb);
            
            // Launch effect
            simulation.drawList.push({
                x: m.pos.x + Math.cos(angle) * 50,
                y: m.pos.y + Math.sin(angle) * 50,
                radius: 35,
                color: "rgba(255, 0, 255, 0.6)",
                time: 8
            });
        },
        do() {}
    };

    b.guns.push(PlasmaCannon);
    b.guns = b.guns.filter((g, i, arr) => i === arr.findIndex(x => x.name === g.name));
    console.log("%cPlasma Cannon mod loaded!", "color: #ff00ff");
})();

