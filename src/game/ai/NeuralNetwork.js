export class NeuralNetwork {
    constructor(inputSize, hiddenSizes, outputSize) {
        this.layers = [];
        this.weights = [];
        this.biases = [];
        
        // Create layer structure
        const sizes = [inputSize, ...hiddenSizes, outputSize];
        
        for (let i = 0; i < sizes.length; i++) {
            this.layers.push(new Array(sizes[i]).fill(0));
        }
        
        // Initialize weights and biases
        for (let i = 0; i < sizes.length - 1; i++) {
            const weightMatrix = [];
            const biasArray = [];
            
            for (let j = 0; j < sizes[i + 1]; j++) {
                const neuronWeights = [];
                for (let k = 0; k < sizes[i]; k++) {
                    neuronWeights.push(this.randomWeight());
                }
                weightMatrix.push(neuronWeights);
                biasArray.push(this.randomWeight());
            }
            
            this.weights.push(weightMatrix);
            this.biases.push(biasArray);
        }
    }

    randomWeight() {
        return (Math.random() - 0.5) * 2;
    }

    feedForward(inputs) {
        // Set input layer
        for (let i = 0; i < inputs.length; i++) {
            this.layers[0][i] = inputs[i];
        }
        
        // Forward propagation
        for (let l = 1; l < this.layers.length; l++) {
            for (let n = 0; n < this.layers[l].length; n++) {
                let sum = this.biases[l - 1][n];
                
                for (let p = 0; p < this.layers[l - 1].length; p++) {
                    sum += this.layers[l - 1][p] * this.weights[l - 1][n][p];
                }
                
                this.layers[l][n] = this.activate(sum);
            }
        }
        
        return [...this.layers[this.layers.length - 1]];
    }

    activate(x) {
        // Sigmoid activation function
        return 1 / (1 + Math.exp(-x));
    }

    mutate(mutationRate = 0.1, mutationStrength = 0.5) {
        // Mutate weights
        for (let l = 0; l < this.weights.length; l++) {
            for (let n = 0; n < this.weights[l].length; n++) {
                for (let w = 0; w < this.weights[l][n].length; w++) {
                    if (Math.random() < mutationRate) {
                        this.weights[l][n][w] += (Math.random() - 0.5) * mutationStrength;
                        this.weights[l][n][w] = Math.max(-2, Math.min(2, this.weights[l][n][w]));
                    }
                }
            }
        }
        
        // Mutate biases
        for (let l = 0; l < this.biases.length; l++) {
            for (let n = 0; n < this.biases[l].length; n++) {
                if (Math.random() < mutationRate) {
                    this.biases[l][n] += (Math.random() - 0.5) * mutationStrength;
                    this.biases[l][n] = Math.max(-2, Math.min(2, this.biases[l][n]));
                }
            }
        }
    }

    crossover(partner) {
        const child = new NeuralNetwork(
            this.layers[0].length,
            this.layers.slice(1, -1).map(layer => layer.length),
            this.layers[this.layers.length - 1].length
        );
        
        // Crossover weights
        for (let l = 0; l < this.weights.length; l++) {
            for (let n = 0; n < this.weights[l].length; n++) {
                for (let w = 0; w < this.weights[l][n].length; w++) {
                    child.weights[l][n][w] = Math.random() < 0.5 ? 
                        this.weights[l][n][w] : partner.weights[l][n][w];
                }
            }
        }
        
        // Crossover biases
        for (let l = 0; l < this.biases.length; l++) {
            for (let n = 0; n < this.biases[l].length; n++) {
                child.biases[l][n] = Math.random() < 0.5 ? 
                    this.biases[l][n] : partner.biases[l][n];
            }
        }
        
        return child;
    }

    copy() {
        const copy = new NeuralNetwork(
            this.layers[0].length,
            this.layers.slice(1, -1).map(layer => layer.length),
            this.layers[this.layers.length - 1].length
        );
        
        // Copy weights
        for (let l = 0; l < this.weights.length; l++) {
            for (let n = 0; n < this.weights[l].length; n++) {
                for (let w = 0; w < this.weights[l][n].length; w++) {
                    copy.weights[l][n][w] = this.weights[l][n][w];
                }
            }
        }
        
        // Copy biases
        for (let l = 0; l < this.biases.length; l++) {
            for (let n = 0; n < this.biases[l].length; n++) {
                copy.biases[l][n] = this.biases[l][n];
            }
        }
        
        return copy;
    }
}