import { NeuralNetwork } from './NeuralNetwork.js';
import { Vehicle } from '../entities/Vehicle.js';

export class Population {
    constructor(size) {
        this.size = size;
        this.vehicles = [];
        this.generation = 1;
        this.bestFitness = 0;
        this.species = [];
        
        this.initializePopulation();
    }

    initializePopulation() {
        this.vehicles = [];
        
        for (let i = 0; i < this.size; i++) {
            const vehicle = new Vehicle(100, 300);
            vehicle.brain = new NeuralNetwork(12, [16, 12], 3); // 12 inputs, 3 outputs
            this.vehicles.push(vehicle);
        }
    }

    evolve() {
        // Calculate fitness for all vehicles
        this.calculateFitness();
        
        // Sort by fitness
        this.vehicles.sort((a, b) => b.fitness - a.fitness);
        
        // Update best fitness
        if (this.vehicles[0].fitness > this.bestFitness) {
            this.bestFitness = this.vehicles[0].fitness;
        }
        
        // Create new generation
        const newVehicles = [];
        
        // Keep top 10% as elites
        const eliteCount = Math.floor(this.size * 0.1);
        for (let i = 0; i < eliteCount; i++) {
            const elite = new Vehicle(100, 300);
            elite.brain = this.vehicles[i].brain.copy();
            newVehicles.push(elite);
        }
        
        // Fill rest with offspring
        while (newVehicles.length < this.size) {
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            const child = new Vehicle(100, 300);
            child.brain = parent1.brain.crossover(parent2.brain);
            child.brain.mutate(0.1, 0.3);
            
            newVehicles.push(child);
        }
        
        this.vehicles = newVehicles;
        this.generation++;
        
        console.log(`Generation ${this.generation}, Best Fitness: ${this.bestFitness.toFixed(2)}`);
    }

    calculateFitness() {
        for (let vehicle of this.vehicles) {
            // Fitness based on distance traveled and time survived
            vehicle.fitness = vehicle.score;
            
            // Bonus for staying alive longer
            vehicle.fitness += vehicle.timeAlive * 0.1;
            
            // Penalty for flipping
            if (vehicle.isFlipped) {
                vehicle.fitness *= 0.5;
            }
            
            // Ensure minimum fitness
            vehicle.fitness = Math.max(vehicle.fitness, 0.1);
        }
    }

    selectParent() {
        // Tournament selection
        const tournamentSize = 5;
        let best = null;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }

    getBestVehicle() {
        let best = this.vehicles[0];
        for (let vehicle of this.vehicles) {
            if (vehicle.fitness > best.fitness) {
                best = vehicle;
            }
        }
        return best;
    }

    getAliveCount() {
        return this.vehicles.filter(v => !v.isDead).length;
    }
}