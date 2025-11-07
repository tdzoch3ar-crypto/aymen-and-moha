class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.selectedCharacters = {
            player1: 'goku',
            player2: 'vegeta'
        };
        
        this.keys = {};
        this.gameOver = false;
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
        
        this.player1 = new Character(100, 350, p1Char.name, p1Char.color, true);
        this.player2 = new Character(600, 350, p2Char.name, p2Char.color, false);
        
        // تحديث الأسماء في الواجهة
        document.getElementById('p1Name').textContent = p1Char.name;
        document.getElementById('p2Name').textContent = p2Char.name;
        
        this.player1.speed = p1Char.speed;
        this.player2.speed = p2Char.speed;
        
        this.gameOver = false;
        this.energyBalls = [];
        this.effects = [];
        
        audioManager.playBackgroundMusic();
        this.gameLoop();
    }

    handleInput() {
        if (this.gameOver) return;
        
        // Player 1 Controls
        if (this.keys['a'] || this.keys['A']) this.player1.move(-1, 0);
        if (this.keys['d'] || this.keys['D']) this.player1.move(1, 0);
        if (this.keys['w'] || this.keys['W']) this.player1.move(0, -1);
        
        if (this.keys[' ']) { // هجوم
            if (this.player1.attack()) {
                this.checkAttack(this.player1, this.player2);
            }
        }
        
        if (this.keys['q'] || this.keys['Q']) { // تقنية خاصة
            const energyBall = this.player1.specialAttack();
            if (energyBall) this.energyBalls.push(energyBall);
        }

        // Player 2 Controls
        if (this.keys['ArrowLeft']) this.player2.move(-1, 0);
        if (this.keys['ArrowRight']) this.player2.move(1, 0);
        if (this.keys['ArrowUp']) this.player2.move(0, -1);
        
        if (this.keys['1']) { // هجوم
            if (this.player2.attack()) {
                this.checkAttack(this.player2, this.player1);
            }
        }
        
        if (this.keys['2']) { // تقنية خاصة
            const energyBall = this.player2.specialAttack();
            if (energyBall) this.energyBalls.push(energyBall);
        }
    }

    checkAttack(attacker, defender) {
        const attackRange = 70;
        const distance = Math.abs(attacker.x - defender.x);
        const verticalDistance = Math.abs(attacker.y - defender.y);
        
        if (distance < attackRange && verticalDistance < 50) {
            const damage = 8;
            if (defender.takeDamage(damage)) {
                this.endGame(attacker.name);
            }
            this.createHitEffect(defender.x, defender.y);
        }
    }

    updateEnergyBalls() {
        for (let i = this.energyBalls.length - 1; i >= 0; i--) {
            const ball = this.energyBalls[i];
            ball.update();
            
            // اكتشاف التصادم
            const target = ball.isPlayer1 ? this.player2 : this.player1;
            const distance = Math.sqrt(
                Math.pow(ball.x - (target.x + target.width/2), 2) +
                Math.pow(ball.y - (target.y + target.height/2), 2)
            );
            
            if (distance < 60) {
                const damage = 20;
                if (target.takeDamage(damage)) {
                    this.endGame(ball.isPlayer1 ? this.player1.name : this.player2.name);
                }
                this.createExplosion(ball.x, ball.y);
                this.energyBalls.splice(i, 1);
                audioManager.playSound('explosion');
            } else if (ball.isOutOfBounds()) {
                this.energyBalls.splice(i, 1);
            }
        }
    }

    createHitEffect(x, y) {
        this.effects.push({
            type: 'hit',
            x: x,
            y: y,
            life: 10,
            maxLife: 10
        });
    }

    createExplosion(x, y) {
        this.effects.push({
            type: 'explosion',
            x: x,
            y: y,
            life: 30,
            maxLife: 30,
            radius: 20
        });
    }

    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life--;
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    drawEffects() {
        this.effects.forEach(effect => {
            const progress = 1 - (effect.life / effect.maxLife);
            
            if (effect.type === 'hit') {
                this.ctx.strokeStyle = `rgba(255, 0, 0, ${progress})`;
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(
                    effect.x - progress * 20,
                    effect.y - progress * 20,
                    60 + progress * 40,
                    100 + progress * 40
                );
            } else if (effect.type === 'explosion') {
                const radius = effect.radius + progress * 30;
                const gradient = this.ctx.createRadialGradient(
                    effect.x, effect.y, 0,
                    effect.x, effect.y, radius
                );
                gradient.addColorStop(0, `rgba(255, 255, 0, ${progress})`);
                gradient.addColorStop(0.5, `rgba(255, 165, 0, ${progress * 0.7})`);
                gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawBackground() {
        // السماء
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(0.5, '#b21f1f');
        gradient.addColorStop(1, '#fdbb2d');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // الأرض
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 400, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 400, this.canvas.width, 20);
        
        // السحاب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(100, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 70, 40, 0, Math.PI * 2);
        this.ctx.arc(160, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(600, 120, 25, 0, Math.PI * 2);
        this.ctx.arc(630, 110, 35, 0, Math.PI * 2);
        this.ctx.arc(660, 120, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    endGame(winnerName) {
        this.gameOver = true;
        audioManager.stopBackgroundMusic();
        audioManager.playSound('victory');
        
        document.getElementById('winnerText').textContent = `${winnerName} WINS!`;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    gameLoop() {
        if (!this.gameOver) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawBackground();
            this.handleInput();
            
            this.player1.update();
            this.player2.update();
            this.updateEnergyBalls();
            this.updateEffects();
            
            this.player1.draw(this.ctx);
            this.player2.draw(this.ctx);
            this.energyBalls.forEach(ball => ball.draw(this.ctx));
            this.drawEffects();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// الدوال العامة
let game;

function selectCharacter(charName) {
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => card.style.borderColor = 'transparent');
    
    event.currentTarget.style.borderColor = '#ffd700';
    game.selectedCharacters.player1 = charName;
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    if (!game) {
        game = new Game();
    }
    game.start();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    game.start();
}

// تهيئة اللعبة عند تحميل الصفحة
window.onload = function() {
    game = new Game();
};