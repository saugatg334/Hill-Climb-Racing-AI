export class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // This will be called from main.js
        // Keeping this class for future UI management needs
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }

    updateGameStats(stats) {
        const elements = {
            'current-score': stats.score,
            'current-gen': stats.generation,
            'alive-count': stats.aliveCount,
            'best-score': stats.bestScore,
            'generation': stats.generation,
            'species-count': stats.speciesCount
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                element.textContent = value;
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}