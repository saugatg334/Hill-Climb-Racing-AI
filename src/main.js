import { GameManager } from './game/GameManager.js';
import { UIManager } from './ui/UIManager.js';
import { vehicles, stages } from './data/gameData.js';

class App {
    constructor() {
        this.gameManager = null;
        this.uiManager = new UIManager();
        this.currentScreen = 'loading';
        
        this.init();
    }

    async init() {
        // Initialize CrazyGames SDK
        this.initCrazyGamesSDK();
        
        // Show loading screen
        await this.loadGame();
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Show main menu
        this.showScreen('main-menu');
    }

    initCrazyGamesSDK() {
        if (window.CrazyGames && CrazyGames.SDK && CrazyGames.SDK.game) {
            if (typeof CrazyGames.SDK.game.loadingStart === 'function') {
                CrazyGames.SDK.game.loadingStart();
            }
            console.log('CrazyGames SDK initialized');
        } else {
            console.warn('CrazyGames SDK not available');
        }
    }

    async loadGame() {
        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        const loadingSteps = [
            { text: 'Loading game assets...', progress: 20 },
            { text: 'Initializing physics engine...', progress: 40 },
            { text: 'Setting up neural networks...', progress: 60 },
            { text: 'Preparing vehicles and stages...', progress: 80 },
            { text: 'Ready to play!', progress: 100 }
        ];

        for (let i = 0; i < loadingSteps.length; i++) {
            const step = loadingSteps[i];
            loadingText.textContent = step.text;
            loadingProgress.style.width = step.progress + '%';
            
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Notify CrazyGames that loading is finished
        if (window.CrazyGames && CrazyGames.SDK && CrazyGames.SDK.game) {
            if (typeof CrazyGames.SDK.game.loadingFinished === 'function') {
                CrazyGames.SDK.game.loadingFinished();
            }
        }
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('start-ai-btn').addEventListener('click', () => {
            this.startAITraining();
        });

        document.getElementById('play-human-btn').addEventListener('click', () => {
            this.startHumanPlay();
        });

        document.getElementById('vehicles-btn').addEventListener('click', () => {
            this.showVehicles();
        });

        document.getElementById('stages-btn').addEventListener('click', () => {
            this.showStages();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings-screen');
        });

        // Back buttons
        document.getElementById('vehicles-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('stages-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('settings-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Game controls
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.showScreen('main-menu');
            if (this.gameManager) {
                this.gameManager.pause();
            }
        });

        document.getElementById('pause-btn')?.addEventListener('click', () => {
            if (this.gameManager) {
                this.gameManager.togglePause();
            }
        });

        // Settings
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        const populationSlider = document.getElementById('population-size');
        const populationValue = document.getElementById('population-value');
        
        populationSlider.addEventListener('input', (e) => {
            populationValue.textContent = e.target.value;
        });

        const mutationSlider = document.getElementById('mutation-rate');
        const mutationValue = document.getElementById('mutation-value');
        
        mutationSlider.addEventListener('input', (e) => {
            mutationValue.textContent = e.target.value;
        });

        const speedSlider = document.getElementById('game-speed');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value + 'x';
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }

    showVehicles() {
        this.showScreen('vehicles-screen');
        this.populateVehicles();
    }

    showStages() {
        this.showScreen('stages-screen');
        this.populateStages();
    }

    populateVehicles() {
        const vehiclesGrid = document.getElementById('vehicles-grid');
        vehiclesGrid.innerHTML = '';

        vehicles.forEach((vehicle, index) => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = `vehicle-card ${vehicle.status.toLowerCase().replace(' ', '-')}`;
            
            const statusClass = vehicle.status === 'Unlocked' ? 'status-unlocked' : 
                               vehicle.status === 'Hidden Bonus' ? 'status-hidden' : 'status-locked';

            vehicleCard.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${vehicle.name}</div>
                    <div class="card-status ${statusClass}">${vehicle.status}</div>
                </div>
                <div class="card-type">${vehicle.type}</div>
                <div class="card-description">
                    ${this.getVehicleDescription(vehicle.name)}
                </div>
            `;

            if (vehicle.status === 'Unlocked') {
                vehicleCard.addEventListener('click', () => {
                    this.selectVehicle(index);
                });
            }

            vehiclesGrid.appendChild(vehicleCard);
        });
    }

    populateStages() {
        const stagesGrid = document.getElementById('stages-grid');
        stagesGrid.innerHTML = '';

        stages.forEach((stage, index) => {
            const stageCard = document.createElement('div');
            stageCard.className = `stage-card ${stage.status.toLowerCase().replace(' ', '-')}`;
            
            const statusClass = stage.status === 'Unlocked' ? 'status-unlocked' : 
                               stage.status === 'Hidden Bonus' ? 'status-hidden' : 'status-locked';

            stageCard.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${stage.name}</div>
                    <div class="card-status ${statusClass}">${stage.status}</div>
                </div>
                <div class="card-type">${stage.terrain}</div>
                <div class="card-description">
                    ${this.getStageDescription(stage.name)}
                </div>
            `;

            if (stage.status === 'Unlocked') {
                stageCard.addEventListener('click', () => {
                    this.selectStage(index);
                });
            }

            stagesGrid.appendChild(stageCard);
        });
    }

    getVehicleDescription(name) {
        const descriptions = {
            'Rickshaw': 'Traditional three-wheeler perfect for city navigation',
            'Brawan Jeep': 'Rugged off-road vehicle built for tough terrain',
            'Hot Rod': 'Classic racing machine with incredible speed',
            'Cycle': 'Simple and eco-friendly transportation',
            'Moonlander': 'Special vehicle designed for low-gravity environments'
        };
        return descriptions[name] || 'A unique vehicle with special characteristics';
    }

    getStageDescription(name) {
        const descriptions = {
            'Mahendra Highway': 'The main highway connecting east and west Nepal',
            'Kathmandu City': 'Navigate through the bustling capital city',
            'Lumbini': 'Peaceful cultural site, birthplace of Buddha',
            'Pokhara': 'Beautiful lakeside city with mountain views',
            'Moon': 'Low gravity environment with unique challenges'
        };
        return descriptions[name] || 'A challenging terrain with unique obstacles';
    }

    selectVehicle(index) {
        console.log('Selected vehicle:', vehicles[index]);
        // Store selected vehicle and return to menu
        localStorage.setItem('selectedVehicle', index.toString());
        this.showScreen('main-menu');
    }

    selectStage(index) {
        console.log('Selected stage:', stages[index]);
        // Store selected stage and return to menu
        localStorage.setItem('selectedStage', index.toString());
        this.showScreen('main-menu');
    }

    startAITraining() {
        this.showScreen('game-screen');
        
        if (!this.gameManager) {
            this.gameManager = new GameManager();
        }
        
        this.gameManager.startAITraining();
    }

    startHumanPlay() {
        this.showScreen('game-screen');
        
        if (!this.gameManager) {
            this.gameManager = new GameManager();
        }
        
        this.gameManager.startHumanPlay();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});