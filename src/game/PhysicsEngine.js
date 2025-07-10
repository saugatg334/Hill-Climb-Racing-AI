export class PhysicsEngine {
    constructor() {
        this.gravity = { x: 0, y: 9.81 };
        this.bodies = [];
        this.constraints = [];
    }

    addBody(body) {
        this.bodies.push(body);
        return body;
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    update(deltaTime) {
        // Simple physics simulation
        for (let body of this.bodies) {
            if (!body.isStatic) {
                // Apply gravity
                body.velocity.y += this.gravity.y * deltaTime;
                
                // Update position
                body.position.x += body.velocity.x * deltaTime;
                body.position.y += body.velocity.y * deltaTime;
                
                // Update rotation
                body.angle += body.angularVelocity * deltaTime;
                
                // Apply damping
                body.velocity.x *= 0.99;
                body.velocity.y *= 0.99;
                body.angularVelocity *= 0.95;
            }
        }
        
        // Handle collisions (simplified)
        this.handleCollisions();
    }

    handleCollisions() {
        // Simple ground collision detection
        for (let body of this.bodies) {
            if (body.position.y > 500) { // Ground level
                body.position.y = 500;
                body.velocity.y = Math.min(0, body.velocity.y * -0.3); // Bounce
                body.onGround = true;
            } else {
                body.onGround = false;
            }
        }
    }

    createBody(options = {}) {
        return {
            position: options.position || { x: 0, y: 0 },
            velocity: options.velocity || { x: 0, y: 0 },
            angle: options.angle || 0,
            angularVelocity: options.angularVelocity || 0,
            mass: options.mass || 1,
            isStatic: options.isStatic || false,
            onGround: false,
            width: options.width || 20,
            height: options.height || 20,
            type: options.type || 'rectangle'
        };
    }
}