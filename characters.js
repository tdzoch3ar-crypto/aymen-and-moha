class Character {
    constructor(x, y, name, color, isPlayer1) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color;
        this.width = 60;
        this.height = 100;
        this.speed = 6;
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 0;
        this.maxEnergy = 100;
        this.isPlayer1 = isPlayer1;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.facingRight = isPlayer1;
        this.velocityY = 0;
        this.isJumping = false;
        this.gravity = 0.5;
        this.groundLevel = 350;
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        
        // القفز
        if (dy < 0 && !this.isJumping) {
            this.velocityY = -12;
            this.isJumping = true;
        }
        
        // حدود اللعبة
        this.x = Math.max(50, Math.min(690, this.x));
        
        // اتجاه الشخصية
        if (dx > 0) this.facingRight = true;
        if (dx < 0) this.facingRight = false;
    }

    update() {
        // تطبيق الجاذبية
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        
        // التأكد من عدم النزول تحت الأرض
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
        
        // شحن الطاقة
        if (this.energy < this.maxEnergy) {
            this.energy += 0.2;
        }
        
        // تحديث واجهة المستخدم
        this.updateUI();
    }

    attack() {
        if (this.attackCooldown === 0) {
            this.isAttacking = true;
            this.attackCooldown = 25;
            audioManager.playSound('punch');
            return true;
        }
        return false;
    }

    specialAttack() {
        if (this.energy >= 30) {
            this.energy -= 30;
            audioManager.playSound('kamehameha');
            return new EnergyBall(
                this.x + (this.facingRight ? this.width : -20),
                this.y + 40,
                this.facingRight,
                this.isPlayer1,
                this.color
            );
        }
        return null;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        this.updateUI();
        return this.health <= 0;
    }

    updateUI() {
        const playerPrefix = this.isPlayer1 ? 'p1' : 'p2';
        
        // تحديث الشريط الصحي
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById(`${playerPrefix}Health`).style.width = `${healthPercent}%`;
        document.getElementById(`${playerPrefix}HealthText`).textContent = `${Math.round(healthPercent)}%`;
        
        // تحديث شريط الطاقة
        const energyPercent = (this.energy / this.maxEnergy) * 100;
        document.getElementById(`${playerPrefix}Energy`).style.width = `${energyPercent}%`;
        document.getElementById(`${playerPrefix}EnergyText`).textContent = Math.round(this.energy);
    }

    draw(ctx) {
        ctx.save();
        
        // رسم الجسم
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // رسم الوجه
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 15, this.y + 15, 30, 25);
        
        // رسم العيون
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 20, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 32, this.y + 20, 8, 8);
        
        // تأثير الهجوم
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
            let attackX = this.facingRight ? this.x + this.width : this.x - 40;
            ctx.fillRect(attackX, this.y + 30, 40, 40);
            
            // تأثير الاهتزاز
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(attackX, this.y + 30, 40, 40);
        }
        
        // تأثير الطاقة
        if (this.energy > 50) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${this.energy / 200})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
        
        ctx.restore();
    }
}

class EnergyBall {
    constructor(x, y, facingRight, isPlayer1, color) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 10;
        this.facingRight = facingRight;
        this.isPlayer1 = isPlayer1;
        this.color = color;
        this.trail = [];
        this.maxTrail = 5;
    }

    update() {
        // حفظ الأثر
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
        
        this.x += this.facingRight ? this.speed : -this.speed;
    }

    draw(ctx) {
        ctx.save();
        
        // رسم الأثر
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length * 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.radius * (index / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        
        // رسم كرة الطاقة الرئيسية
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, '#0000FF');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // تأثير التوهج
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    isOutOfBounds() {
        return this.x < -100 || this.x > 900;
    }
}

// الشخصيات المتاحة
const CHARACTERS = {
    goku: {
        name: 'GOKU',
        color: '#FF6B6B',
        speed: 6.5,
        special: 'KAMEHAMEHA'
    },
    vegeta: {
        name: 'VEGETA',
        color: '#4ECDC4',
        speed: 6,
        special: 'GALICK GUN'
    }
};