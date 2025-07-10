import { PhysicsEngine } from './PhysicsEngine.js';
import { NeuralNetwork } from './ai/NeuralNetwork.js';
import { Population } from './ai/Population.js';
import { Vehicle } from './entities/Vehicle.js';
import { Terrain } from './entities/Terrain.js';

export class GameManager {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nnCanvas = document.getElementById('nn-canvas');
        this.nnCtx = this.nnCanvas.getContext('2d');
        
        this.physics = new PhysicsEngine();
        this.population = null;
        this.terrain = null;
        
        this.gameState = 'menu'; // menu, training, playing, paused
        this.generation = 1;
        this.bestScore = 0;
        this.currentScore = 0;
        this.aliveCount = 0;
        
        this.camera = { x: 0, y: 0 };
        this.gameSpeed = 1;
        this.showBest = false;
        this.isPaused = false;
        
        this.setupCanvas();
        this.setupControls();
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight - 100; // Account for UI
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    setupControls() {
        // Keyboard controls for human player
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Game controls
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyB':
                    this.showBest = !this.showBest;
                    break;
                case 'KeyR':
                    if (this.gameState === 'training') {
                        this.restartTraining();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    startAITraining() {
        this.gameState = 'training';
        this.generation = 1;
        this.bestScore = 0;
        
        // Initialize population
        const populationSize = parseInt(document.getElementById('population-size').value);
        this.population = new Population(populationSize);
        
        // Create terrain
        this.terrain = new Terrain();
        this.terrain.generateTerrain();
        
        // Start game loop
        this.gameLoop();
        
        this.updateUI();
    }

    startHumanPlay() {
        this.gameState = 'playing';
        this.currentScore = 0;
        
        // Create single vehicle for human player
        this.humanVehicle = new Vehicle(100, 300);
        
        // Create terrain
        this.terrain = new Terrain();
        this.terrain.generateTerrain();
        
        // Start game loop
        this.gameLoop();
        
        this.updateUI();
    }

    gameLoop(currentTime = 0) {
        if (this.isPaused) {
            requestAnimationFrame(this.gameLoop);
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update physics
        this.physics.update(deltaTime * this.gameSpeed);

        if (this.gameState === 'training') {
            this.updateAITraining(deltaTime);
        } else if (this.gameState === 'playing') {
            this.updateHumanPlay(deltaTime);
        }

        // Render
        this.render();
        
        // Update UI
        this.updateUI();

        requestAnimationFrame(this.gameLoop);
    }

    updateAITraining(deltaTime) {
        if (!this.population) return;

        // Update all vehicles in population
        let aliveCount = 0;
        let bestVehicle = null;
        let bestScore = 0;

        for (let vehicle of this.population.vehicles) {
            if (!vehicle.isDead) {
                // Get sensor inputs
                const inputs = this.getSensorInputs(vehicle);
                
                // Get neural network output
                const outputs = vehicle.brain.feedForward(inputs);
                
                // Apply controls
                vehicle.applyControls(outputs);
                
                // Update vehicle
                vehicle.update(deltaTime);
                
                aliveCount++;
                
                if (vehicle.score > bestScore) {
                    bestScore = vehicle.score;
                    bestVehicle = vehicle;
                }
            }
        }

        this.aliveCount = aliveCount;
        this.currentScore = bestScore;
        
        if (bestScore > this.bestScore) {
            this.bestScore = bestScore;
        }

        // Update camera to follow best vehicle
        if (bestVehicle) {
            this.camera.x = bestVehicle.position.x - this.canvas.width / 2;
            this.camera.y = bestVehicle.position.y - this.canvas.height / 2;
        }

        // Check if generation is complete
        if (aliveCount === 0) {
            this.nextGeneration();
        }

        // Draw neural network of best vehicle
        if (bestVehicle && document.getElementById('show-neural-network').checked) {
            this.drawNeuralNetwork(bestVehicle.brain);
        }
    }

    updateHumanPlay(deltaTime) {
        if (!this.humanVehicle || this.humanVehicle.isDead) return;

        // Apply human controls
        const controls = {
            accelerate: this.keys['ArrowRight'] || this.keys['KeyD'],
            brake: this.keys['ArrowLeft'] || this.keys['KeyA'],
            lean: 0
        };

        if (this.keys['ArrowUp'] || this.keys['KeyW']) controls.lean = -1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) controls.lean = 1;

        this.humanVehicle.applyHumanControls(controls);
        this.humanVehicle.update(deltaTime);

        this.currentScore = this.humanVehicle.score;

        // Update camera to follow human vehicle
        this.camera.x = this.humanVehicle.position.x - this.canvas.width / 2;
        this.camera.y = this.humanVehicle.position.y - this.canvas.height / 2;
    }

    getSensorInputs(vehicle) {
        const inputs = [];
        
        // Vehicle angle
        inputs.push(Math.sin(vehicle.angle));
        inputs.push(Math.cos(vehicle.angle));
        
        // Vehicle velocity
        inputs.push(vehicle.velocity.x / 20); // Normalize
        inputs.push(vehicle.velocity.y / 20);
        
        // Angular velocity
        inputs.push(vehicle.angularVelocity / 5);
        
        // Ground sensors (5 rays ahead)
        for (let i = 0; i < 5; i++) {
            const angle = vehicle.angle + (i - 2) * 0.3;
            const distance = this.terrain.getGroundDistance(
                vehicle.position.x + Math.cos(angle) * 50 * (i + 1),
                vehicle.position.y
            );
            inputs.push(Math.min(distance / 100, 1)); // Normalize to 0-1
        }
        
        return inputs;
    }

    nextGeneration() {
        this.generation++;
        this.population.evolve();
        
        // Reset terrain
        this.terrain.generateTerrain();
        
        console.log(`Generation ${this.generation} - Best Score: ${this.bestScore}`);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw terrain
        if (this.terrain) {
            this.terrain.draw(this.ctx);
        }

        // Draw vehicles
        if (this.gameState === 'training' && this.population) {
            for (let vehicle of this.population.vehicles) {
                if (!vehicle.isDead) {
                    vehicle.draw(this.ctx);
                }
            }
        } else if (this.gameState === 'playing' && this.humanVehicle) {
            this.humanVehicle.draw(this.ctx);
        }

        // Restore context
        this.ctx.restore();

        // Draw UI elements
        this.drawUI();
    }

    drawUI() {
        // Draw score and generation info (already handled by HTML UI)
        
        // Draw controls hint for human play
        if (this.gameState === 'playing') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, this.canvas.height - 80, 300, 70);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText('Controls:', 20, this.canvas.height - 60);
            this.ctx.fillText('Arrow Keys or WASD to control', 20, this.canvas.height - 40);
            this.ctx.fillText('Space to pause', 20, this.canvas.height - 20);
        }
    }

    drawNeuralNetwork(brain) {
        if (!brain || !this.nnCtx) return;

        const ctx = this.nnCtx;
        const width = this.nnCanvas.width;
        const height = this.nnCanvas.height;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        // Draw network visualization
        const layers = brain.layers;
        const layerWidth = width / layers.length;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillStyle = 'white';

        for (let l = 0; l < layers.length; l++) {
            const layer = layers[l];
            const nodeHeight = height / layer.length;
            
            for (let n = 0; n < layer.length; n++) {
                const x = l * layerWidth + layerWidth / 2;
                const y = n * nodeHeight + nodeHeight / 2;
                
                // Draw node
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw connections to next layer
                if (l < layers.length - 1) {
                    const nextLayer = layers[l + 1];
                    const nextNodeHeight = height / nextLayer.length;
                    
                    for (let nn = 0; nn < nextLayer.length; nn++) {
                        const nextX = (l + 1) * layerWidth + layerWidth / 2;
                        const nextY = nn * nextNodeHeight + nextNodeHeight / 2;
                        
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(nextX, nextY);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    updateUI() {
        // Update game stats
        document.getElementById('current-score').textContent = Math.floor(this.currentScore);
        document.getElementById('current-gen').textContent = this.generation;
        document.getElementById('alive-count').textContent = this.aliveCount;
        
        // Update main menu stats
        document.getElementById('best-score').textContent = Math.floor(this.bestScore);
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('species-count').textContent = this.population ? this.population.species.length : 0;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        }
    }

    pause() {
        this.isPaused = true;
    }

    restartTraining() {
        this.startAITraining();
    }
}