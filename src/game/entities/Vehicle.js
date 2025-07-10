export class Vehicle {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.angularVelocity = 0;
        
        this.width = 40;
        this.height = 20;
        this.wheelRadius = 12;
        
        this.isDead = false;
        this.isFlipped = false;
        this.onGround = false;
        
        this.score = 0;
        this.fitness = 0;
        this.timeAlive = 0;
        
        this.brain = null;
        
        // Vehicle properties
        this.maxSpeed = 15;
        this.acceleration = 8;
        this.brakeForce = 12;
        this.torque = 0.3;
        
        this.fuel = 100;
        this.maxFuel = 100;
        
        // Wheels
        this.wheels = [
            { x: -15, y: 10, onGround: false, rotation: 0 },
            { x: 15, y: 10, onGround: false, rotation: 0 }
        ];
        
        this.startTime = Date.now();
    }

    update(deltaTime) {
        if (this.isDead) return;
        
        this.timeAlive += deltaTime;
        
        // Update score based on distance traveled
        this.score = Math.max(this.score, this.position.x / 10);
        
        // Check if vehicle is flipped
        const normalizedAngle = ((this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        this.isFlipped = normalizedAngle > Math.PI * 0.7 && normalizedAngle < Math.PI * 1.3;
        
        // Check death conditions
        if (this.position.y > 800 || this.timeAlive > 30 || this.fuel <= 0) {
            this.isDead = true;
            return;
        }
        
        // If flipped for too long, die
        if (this.isFlipped) {
            this.flipTime = (this.flipTime || 0) + deltaTime;
            if (this.flipTime > 3) {
                this.isDead = true;
                return;
            }
        } else {
            this.flipTime = 0;
        }
        
        // Update wheel rotations
        for (let wheel of this.wheels) {
            wheel.rotation += this.velocity.x * deltaTime * 0.1;
        }
        
        // Consume fuel
        if (Math.abs(this.velocity.x) > 1) {
            this.fuel -= deltaTime * 2;
        }
    }

    applyControls(outputs) {
        if (this.isDead) return;
        
        const [accelerate, brake, lean] = outputs;
        
        // Apply acceleration/braking
        if (accelerate > 0.5) {
            this.velocity.x += this.acceleration * 0.016; // Assuming 60fps
            this.fuel -= 0.1;
        }
        
        if (brake > 0.5) {
            this.velocity.x *= 0.9;
        }
        
        // Apply leaning torque
        if (lean > 0.6) {
            this.angularVelocity += this.torque * 0.016;
        } else if (lean < 0.4) {
            this.angularVelocity -= this.torque * 0.016;
        }
        
        // Limit speed
        this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.x));
    }

    applyHumanControls(controls) {
        if (this.isDead) return;
        
        // Apply acceleration/braking
        if (controls.accelerate) {
            this.velocity.x += this.acceleration * 0.016;
            this.fuel -= 0.1;
        }
        
        if (controls.brake) {
            this.velocity.x *= 0.9;
        }
        
        // Apply leaning
        if (controls.lean !== 0) {
            this.angularVelocity += controls.lean * this.torque * 0.016;
        }
        
        // Limit speed
        this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.x));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        
        // Draw vehicle body
        ctx.fillStyle = this.isDead ? '#666' : '#ff4444';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw wheels
        ctx.fillStyle = '#333';
        for (let wheel of this.wheels) {
            ctx.save();
            ctx.translate(wheel.x, wheel.y);
            ctx.rotate(wheel.rotation);
            ctx.beginPath();
            ctx.arc(0, 0, this.wheelRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Wheel spokes
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.wheelRadius * 0.7, 0);
            ctx.lineTo(this.wheelRadius * 0.7, 0);
            ctx.moveTo(0, -this.wheelRadius * 0.7);
            ctx.lineTo(0, this.wheelRadius * 0.7);
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw fuel indicator
        if (!this.isDead) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-20, -35, 40, 6);
            ctx.fillStyle = this.fuel > 30 ? '#4CAF50' : '#f44336';
            ctx.fillRect(-20, -35, (this.fuel / this.maxFuel) * 40, 6);
        }
        
        ctx.restore();
        
        // Draw score above vehicle
        if (!this.isDead) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.floor(this.score), this.position.x, this.position.y - 50);
        }
    }

    getWheelPositions() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        return this.wheels.map(wheel => ({
            x: this.position.x + wheel.x * cos - wheel.y * sin,
            y: this.position.y + wheel.x * sin + wheel.y * cos
        }));
    }
}