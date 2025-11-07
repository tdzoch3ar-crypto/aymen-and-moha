// نظام الصوت
class AudioManager {
    constructor() {
        this.sounds = {
            punch: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-boxing-punch-2051.mp3'], volume: 0.7 }),
            energy: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-magic-spell-raise-1676.mp3'], volume: 0.8 }),
            explosion: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-explosion-1694.mp3'], volume: 0.9 }),
            kamehameha: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-woosh-1531.mp3'], volume: 0.9 }),
            transform: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-power-up-energy-2571.mp3'], volume: 0.8 }),
            victory: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-video-game-win-2016.mp3'], volume: 0.7 }),
            damage: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-weak-hit-2153.mp3'], volume: 0.6 }),
            charge: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-energy-charge-2572.mp3'], volume: 0.7 })
        };
        
        this.backgroundMusic = new Howl({
            src: ['https://assets.mixkit.co/music/preview/mixkit-epic-battle-2573.mp3'],
            volume: 0.4,
            loop: true
        });
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].play();
            return sound;
        }
    }

    playBackgroundMusic() {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.stop();
    }
}

// تعريف الشخصيات مع أشكالها
const CHARACTERS = {
    goku: {
        name: 'GOKU',
        color: '#FF6B6B',
        specialColor: '#FFD700',
        specialAttack: 'KAMEHAMEHA',
        transformName: 'SUPER SAIYAN',
        speed: 6,
        power: 8,
        // شكل Goku
        bodyColor: '#FF6B6B',
        hairColor: '#000000',
        giColor: '#FF6B6B',
        pantsColor: '#0000FF'
    },
    vegeta: {
        name: 'VEGETA', 
        color: '#4ECDC4',
        specialColor: '#9370DB',
        specialAttack: 'GALICK GUN',
        transformName: 'SUPER SAIYAN',
        speed: 6.5,
        power: 9,
        bodyColor: '#4ECDC4',
        hairColor: '#000000',
        armorColor: '#4ECDC4',
        suitColor: '#0000FF'
    },
    gohan: {
        name: 'GOHAN',
        color: '#FF9999',
        specialColor: '#FF4444',
        specialAttack: 'MASENKO',
        transformName: 'MYSTIC',
        speed: 7,
        power: 10,
        bodyColor: '#FF9999',
        hairColor: '#000000',
        giColor: '#FF9999',
        pantsColor: '#660000'
    },
    frieza: {
        name: 'FRIEZA',
        color: '#9370DB',
        specialColor: '#FFFFFF',
        specialAttack: 'DEATH BEAM',
        transformName: 'FINAL FORM',
        speed: 5.5,
        power: 9,
        bodyColor: '#9370DB',
        headColor: '#FFFFFF',
        armorColor: '#9370DB'
    }
};

// كرة الطاقة
class EnergyBall {
    constructor(x, y, facingRight, isPlayer1, color, power, specialName) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 15;
        this.facingRight = facingRight;
        this.isPlayer1 = isPlayer1;
        this.color = color;
        this.power = power;
        this.specialName = specialName;
        this.trail = [];
        this.maxTrail = 10;
        this.particles = [];
    }

    update() {
        // تحديث الأثر
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
        
        // إضافة جزيئات
        for (let i = 0; i < 2; i++) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20,
                size: Math.random() * 4 + 2,
                life: 20,
                maxLife: 20
            });
        }
        
        // تحديث الجزيئات
        this.particles = this.particles.filter(particle => {
            particle.life--;
            return particle.life > 0;
        });
        
        this.x += this.facingRight ? this.speed : -this.speed;
    }

    draw(ctx) {
        ctx.save();
        
        // رسم الجزيئات
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // رسم الأثر
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length * 0.8;
            const size = this.radius * (index / this.trail.length);
            
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // كرة الطاقة الرئيسية
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.2, this.color);
        gradient.addColorStop(0.6, '#0000FF');
        gradient.addColorStop(1, '#000066');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // تأثير التوهج
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    isOutOfBounds() {
        return this.x < -100 || this.x > 1100;
    }
}

// تأثيرات بصرية
class Effect {
    constructor(x, y, type, color) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color;
        this.life = type === 'explosion' ? 40 : 25;
        this.maxLife = this.life;
        this.radius = type === 'explosion' ? 25 : 15;
        this.particles = [];
        
        if (type === 'explosion') {
            // إنشاء جزيئات الانفجار
            for (let i = 0; i < 15; i++) {
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    size: Math.random() * 8 + 4,
                    life: 30,
                    maxLife: 30
                });
            }
        }
    }

    update() {
        this.life--;
        
        // تحديث جزيئات الانفجار
        if (this.type === 'explosion') {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
            });
            this.particles = this.particles.filter(p => p.life > 0);
        }
    }

    draw(ctx) {
        const progress = 1 - (this.life / this.maxLife);
        
        if (this.type === 'explosion') {
            // رسم جزيئات الانفجار
            this.particles.forEach(particle => {
                const alpha = particle.life / particle.maxLife;
                ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // تأثير الانفجار الرئيسي
            const radius = this.radius + progress * 80;
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 0, ${1 - progress})`);
            gradient.addColorStop(0.3, `rgba(255, 165, 0, ${0.8 - progress})`);
            gradient.addColorStop(0.6, `rgba(255, 0, 0, ${0.5 - progress})`);
            gradient.addColorStop(1, `rgba(128, 0, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.type === 'hit') {
            // تأثير الإصابة
            ctx.strokeStyle = `rgba(255, 0, 0, ${1 - progress})`;
            ctx.lineWidth = 4;
            ctx.strokeRect(
                this.x - progress * 40 - 35,
                this.y - progress * 40 - 60,
                70 + progress * 80,
                120 + progress * 80
            );
        }
        else if (this.type === 'transform') {
            // تأثير التحول
            const radius = 40 + progress * 60;
            ctx.strokeStyle = `rgba(255, 215, 0, ${1 - progress})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // جزيئات التحول
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() / 100 + i * 120) * Math.PI / 180;
                const sparkX = this.x + Math.cos(angle) * radius;
                const sparkY = this.y + Math.sin(angle) * radius;
                
                ctx.fillStyle = `rgba(255, 215, 0, ${1 - progress})`;
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    isDead() {
        return this.life <= 0;
    }
}

// الشخصية الرئيسية مع شكل حقيقي
class Character {
    constructor(x, y, characterType, isPlayer1) {
        const char = CHARACTERS[characterType];
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 120;
        this.speed = char.speed;
        this.color = char.color;
        this.specialColor = char.specialColor;
        this.name = char.name;
        this.specialAttackName = char.specialAttack;
        this.transformName = char.transformName;
        this.power = char.power;
        this.charType = characterType;
        
        // ألوان الشخصية
        this.bodyColor = char.bodyColor;
        this.hairColor = char.hairColor || '#000000';
        this.giColor = char.giColor || char.bodyColor;
        this.pantsColor = char.pantsColor || '#0000FF';
        this.armorColor = char.armorColor || char.bodyColor;
        
        this.isPlayer1 = isPlayer1;
        this.health = 100;
        this.maxHealth = 100;
        this.ki = 0;
        this.maxKi = 100;
        this.isTransformed = false;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.facingRight = isPlayer1;
        this.velocityY = 0;
        this.isJumping = false;
        this.gravity = 0.8;
        this.groundLevel = 450;
        this.transformCooldown = 0;
        this.attackType = 'punch';
        this.chargeTime = 0;
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        
        if (dy < 0 && !this.isJumping) {
            this.velocityY = -20;
            this.isJumping = true;
            audioManager.playSound('energy');
        }
        
        this.x = Math.max(50, Math.min(880, this.x));
        
        if (dx > 0) this.facingRight = true;
        if (dx < 0) this.facingRight = false;
    }

    update() {
        // الجاذبية
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        
        if (this.y > this.groundLevel) {
            this.y = this.groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        // تحديث الكولدون
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            if (this.attackCooldown === 0) {
                this.isAttacking = false;
            }
        }
        
        if (this.transformCooldown > 0) {
            this.transformCooldown--;
        }
        
        // شحن الطاقة
        if (this.ki < this.maxKi) {
            this.ki += this.isTransformed ? 0.15 : 0.25;
        }
        
        this.updateUI();
    }

    attack() {
        if (this.attackCooldown === 0) {
            this.isAttacking = true;
            this.attackCooldown = 25;
            this.attackType = 'punch';
            audioManager.playSound('punch');
            return { damage: this.isTransformed ? 15 : 10, type: 'punch' };
        }
        return null;
    }

    kick() {
        if (this.attackCooldown === 0) {
            this.isAttacking = true;
            this.attackCooldown = 30;
            this.attackType = 'kick';
            audioManager.playSound('punch');
            return { damage: this.isTransformed ? 20 : 12, type: 'kick' };
        }
        return null;
    }

    specialAttack() {
        if (this.ki >= 35) {
            this.ki -= 35;
            this.isAttacking = true;
            this.attackCooldown = 40;
            this.attackType = 'special';
            audioManager.playSound('kamehameha');
            return new EnergyBall(
                this.x + (this.facingRight ? this.width : -30),
                this.y + 40,
                this.facingRight,
                this.isPlayer1,
                this.isTransformed ? this.specialColor : this.color,
                this.isTransformed ? 35 : 25,
                this.specialAttackName
            );
        }
        return null;
    }

    transform() {
        if (this.ki >= 60 && this.transformCooldown === 0 && !this.isTransformed) {
            this.isTransformed = true;
            this.ki -= 60;
            this.transformCooldown = 400;
            this.speed *= 1.4;
            this.power *= 1.5;
            audioManager.playSound('transform');
            return new Effect(this.x + this.width/2, this.y + this.height/2, 'transform', this.specialColor);
        }
        return null;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        audioManager.playSound('damage');
        this.updateUI();
        return new Effect(this.x + this.width/2, this.y + this.height/2, 'hit', '#ff0000');
    }

    updateUI() {
        const playerPrefix = this.isPlayer1 ? 'p1' : 'p2';
        
        document.getElementById(`${playerPrefix}Health`).style.width = `${this.health}%`;
        document.getElementById(`${playerPrefix}HealthText`).textContent = `${Math.round(this.health)}%`;
        
        document.getElementById(`${playerPrefix}Ki`).style.width = `${this.ki}%`;
        document.getElementById(`${playerPrefix}KiText`).textContent = Math.round(this.ki);
        
        document.getElementById(`${playerPrefix}Name`).textContent = this.name;
        document.getElementById(`${playerPrefix}Transform`).textContent = this.isTransformed ? this.transformName : '';
    }

    draw(ctx) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const isGoku = this.charType === 'goku';
        isVegeta = this.charType === 'vegeta';
        isGohan = this.charType === 'gohan';
        isFrieza = this.charType === 'frieza';

        // تأثير التحول
        if (this.isTransformed) {
            ctx.strokeStyle = `rgba(255, 215, 0, 0.7)`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.x - 8, this.y - 8, this.width + 16, this.height + 16);
            
            // توهج التحول
            const glowGradient = ctx.createRadialGradient(
                centerX, this.y + this.height/2, 0,
                centerX, this.y + this.height/2, 80
            );
            glowGradient.addColorStop(0, `rgba(255, 215, 0, 0.3)`);
            glowGradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
            ctx.fillStyle = glowGradient;
            ctx.fillRect(this.x - 40, this.y - 40, this.width + 80, this.height + 80);
        }

        // رسم الجسم الأساسي
        if (isFrieza) {
            // شكل Frieza
            ctx.fillStyle = this.isTransformed ? '#FFFFFF' : this.bodyColor;
            ctx.fillRect(this.x, this.y + 20, this.width, this.height - 40);
            
            // الرأس
            ctx.fillStyle = this.isTransformed ? '#FFFFFF' : '#FFFFFF';
            ctx.fillRect(this.x + 10, this.y, this.width - 20, 30);
            
            // القرون
            ctx.fillStyle = this.isTransformed ? '#FFFFFF' : this.bodyColor;
            ctx.fillRect(this.x + 5, this.y - 10, 10, 15);
            ctx.fillRect(this.x + this.width - 15, this.y - 10, 10, 15);
        } else {
            // شكل السايان
            ctx.fillStyle = this.isTransformed ? this.specialColor : this.bodyColor;
            
            // الجذع
            ctx.fillRect(this.x + 10, this.y + 30, this.width - 20, this.height - 50);
            
            // الرأس
            ctx.fillRect(this.x + 15, this.y, this.width - 30, 30);
            
            // الشعر (لـ Goku و Vegeta و Gohan)
            ctx.fillStyle = this.isTransformed ? '#FFD700' : this.hairColor;
            if (isGoku) {
                // شعر Goku
                ctx.fillRect(this.x + 10, this.y - 15, this.width - 20, 20);
                ctx.fillRect(this.x + 5, this.y - 10, 10, 15);
                ctx.fillRect(this.x + this.width - 15, this.y - 10, 10, 15);
            } else if (isVegeta) {
                // شعر Vegeta
                ctx.fillRect(this.x + 15, this.y - 20, this.width - 30, 25);
            } else if (isGohan) {
                // شعر Gohan
                ctx.fillRect(this.x + 20, this.y - 10, this.width - 40, 15);
            }
            
            // الملابس
            if (isGoku || isGohan) {
                ctx.fillStyle = this.isTransformed ? '#FFD700' : this.giColor;
                ctx.fillRect(this.x, this.y + 25, this.width, 15);
                ctx.fillStyle = this.pantsColor;
                ctx.fillRect(this.x + 5, this.y + 70, this.width - 10, this.height - 70);
            } else if (isVegeta) {
                ctx.fillStyle = this.isTransformed ? '#9370DB' : this.armorColor;
                ctx.fillRect(this.x, this.y + 25, this.width, 20);
                ctx.fillStyle = this.isTransformed ? '#9370DB' : this.suitColor;
                ctx.fillRect(this.x + 5, this.y + 70, this.width - 10, this.height - 70);
            }
        }

        // العيون
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 25, this.y + 10, 8, 8);
        ctx.fillRect(this.x + this.width - 33, this.y + 10, 8, 8);

        // تأثير الهجوم
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            let attackX, attackWidth, attackHeight;
            
            if (this.attackType === 'punch') {
                attackX = this.facingRight ? this.x + this.width : this.x - 40;
                attackWidth = 40;
                attackHeight = 30;
            } else if (this.attackType === 'kick') {
                attackX = this.facingRight ? this.x + this.width - 20 : this.x - 60;
                attackWidth = 60;
                attackHeight = 20;
            } else if (this.attackType === 'special') {
                attackX = this.facingRight ? this.x + this.width : this.x - 80;
                attackWidth = 80;
                attackHeight = 50;
                ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            }
            
            ctx.fillRect(attackX, this.y + 40, attackWidth, attackHeight);
            
            // تأثير الاهتزاز
            ctx.strokeStyle = this.attackType === 'special' ? '#00FFFF' : '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(attackX, this.y + 40, attackWidth, attackHeight);
        }

        // تأثير الطاقة
        if (this.ki > 20) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${this.ki / 150})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
        }

        ctx.restore();
    }
}

// اللعبة الرئيسية
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioManager = new AudioManager();
        
        this.selectedCharacters = {
            player1: 'goku',
            player2: 'vegeta'
        };
        
        this.keys = {};
        this.gameActive = false;
        this.energyBalls = [];
        this.effects = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    start() {
        const p1Char = CHARACTERS[this.selectedCharacters.player1];
        const p2Char = CHARACTERS[this.selectedCharacters.player2];
        
        this.player1 = new Character(200, 450, this.selectedCharacters.player1, true);
        this.player2 = new Character(700, 450, this.selectedCharacters.player2, false);
        
        this.gameActive = true;
        this.energyBalls = [];
        this.effects = [];
        
        this.audioManager.playBackgroundMusic();
        this.gameLoop();
    }

    handleInput() {
        if (!this.gameActive) return;
        
        // Player 1 Controls
        if (this.keys['a'] || this.keys['A']) this.player1.move(-1, 0);
        if (this.keys['d'] || this.keys['D']) this.player1.move(1, 0);
        if (this.keys['w'] || this.keys['W']) this.player1.move(0, -1);
        
        if (this.keys[' ']) {
            const attack = this.player1.attack();
            if (attack) {
                this.checkAttack(this.player1, this.player2, attack);
            }
        }
        
        if (this.keys['f'] || this.keys['F']) {
            const attack = this.player1.kick();
            if (attack) {
                this.checkAttack(this.player1, this.player2, attack);
            }
        }
        
        if (this.keys['q'] || this.keys['Q']) {
            const energyBall = this.player1.specialAttack();
            if (energyBall) this.energyBalls.push(energyBall);
        }
        
        if (this.keys['e'] || this.keys['E']) {
            const transformEffect = this.player1.transform();
            if (transformEffect) this.effects.push(transformEffect);
        }

        // Player 2 Controls
        if (this.keys['ArrowLeft']) this.player2.move(-1, 0);
        if (this.keys['ArrowRight']) this.player2.move(1, 0);
        if (this.keys['ArrowUp']) this.player2.move(0, -1);
        
        if (this.keys['1']) {
            const attack = this.player2.attack();
            if (attack) {
                this.checkAttack(this.player2, this.player1, attack);
            }
        }
        
        if (this.keys['4']) {
            const attack = this.player2.kick();
            if (attack) {
                this.checkAttack(this.player2, this.player1, attack);
            }
        }
        
        if (this.keys['2']) {
            const energyBall = this.player2.specialAttack();
            if (energyBall) this.energyBalls.push(energyBall);
        }
        
        if (this.keys['3']) {
            const transformEffect = this.player2.transform();
            if (transformEffect) this.effects.push(transformEffect);
        }
    }

    checkAttack(attacker, defender, attack) {
        const attackRange = attack.type === 'kick' ? 100 : 80;
        const distance = Math.abs(attacker.x - defender.x);
        const verticalDistance = Math.abs(attacker.y - defender.y);
        
        if (distance < attackRange && verticalDistance < 60) {
            const hitEffect = defender.takeDamage(attack.damage);
            this.effects.push(hitEffect);
            
            // دفع الخصم عند الإصابة
            const pushDirection = attacker.facingRight ? 1 : -1;
            defender.x += pushDirection * 20;
            
            if (defender.health <= 0) {
                this.endGame(attacker);
            }
        }
    }

    updateEnergyBalls() {
        for (let i = this.energyBalls.length - 1; i >= 0; i--) {
            const ball = this.energyBalls[i];
            ball.update();
            
            const target = ball.isPlayer1 ? this.player2 : this.player1;
            const distance = Math.sqrt(
                Math.pow(ball.x - (target.x + target.width/2), 2) +
                Math.pow(ball.y - (target.y + target.height/2), 2)
            );
            
            if (distance < 80) {
                const hitEffect = target.takeDamage(ball.power);
                this.effects.push(hitEffect);
                this.effects.push(new Effect(ball.x, ball.y, 'explosion', ball.color));
                this.energyBalls.splice(i, 1);
                audioManager.playSound('explosion');
                
                if (target.health <= 0) {
                    this.endGame(ball.isPlayer1 ? this.player1 : this.player2);
                }
            } else if (ball.isOutOfBounds()) {
                this.energyBalls.splice(i, 1);
            }
        }
    }

    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].update();
            if (this.effects[i].isDead()) {
                this.effects.splice(i, 1);
            }
        }
    }

    drawBackground() {
        // السماء
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(0.3, '#000066');
        gradient.addColorStop(0.6, '#000099');
        gradient.addColorStop(1, '#0000cc');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // النجوم
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * 400;
            const size = Math.random() * 3;
            const brightness = Math.random() * 0.8 + 0.2;
            this.ctx.globalAlpha = brightness;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
        
        // القمر
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.beginPath();
        this.ctx.arc(900, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // الأرض
        this.ctx.fillStyle = '#1e4d2b';
        this.ctx.fillRect(0, 500, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 500, this.canvas.width, 25);
        
        // الصخور
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(100, 480, 50, 20);
        this.ctx.fillRect(800, 470, 70, 30);
        this.ctx.fillRect(400, 490, 40, 10);
        this.ctx.fillRect(600, 485, 30, 15);
    }

    endGame(winner) {
        this.gameActive = false;
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('victory');
        
        document.getElementById('winnerName').textContent = `${winner.name} WINS!`;
        document.getElementById('finishMove').textContent = `${winner.specialAttackName}!`;
        document.getElementById('endScreen').style.display = 'flex';
    }

    gameLoop() {
        if (this.gameActive) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawBackground();
            this.handleInput();
            
            this.player1.update();
            this.player2.update();
            this.updateEnergyBalls();
            this.updateEffects();
            
            this.effects.forEach(effect => effect.draw(this.ctx));
            this.energyBalls.forEach(ball => ball.draw(this.ctx));
            this.player1.draw(this.ctx);
            this.player2.draw(this.ctx);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// المتغيرات العامة
let audioManager;
let game;

function selectCharacter(charName) {
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => card.classList.remove('selected'));
    
    event.currentTarget.classList.add('selected');
    if (!game) {
        game = new Game();
    }
    game.selectedCharacters.player1 = charName;
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    if (!game) {
        game = new Game();
    }
    if (!audioManager) {
        audioManager = new AudioManager();
    }
    game.start();
}

function restartGame() {
    document.getElementById('endScreen').style.display = 'none';
    game.start();
}

function simulateKey(key) {
    // محاكاة ضغط المفاتيح للازرار
    const event = new KeyboardEvent('keydown', { key: key });
    document.dispatchEvent(event);
    
    setTimeout(() => {
        const eventUp = new KeyboardEvent('keyup', { key: key });
        document.dispatchEvent(eventUp);
    }, 100);
}

// التهيئة
window.onload = function() {
    audioManager = new AudioManager();
    game = new Game();
};