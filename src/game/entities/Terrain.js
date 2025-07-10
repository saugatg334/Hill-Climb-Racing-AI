export class Terrain {
    constructor() {
        this.points = [];
        this.width = 5000;
        this.segments = 200;
        this.maxHeight = 200;
        this.minHeight = 400;
        
        this.generateTerrain();
    }

    generateTerrain() {
        this.points = [];
        
        // Start with flat ground
        this.points.push({ x: 0, y: 500 });
        
        let currentHeight = 500;
        const segmentWidth = this.width / this.segments;
        
        for (let i = 1; i <= this.segments; i++) {
            const x = i * segmentWidth;
            
            // Add some randomness to height
            const heightChange = (Math.random() - 0.5) * 50;
            currentHeight += heightChange;
            
            // Keep within bounds
            currentHeight = Math.max(this.maxHeight, Math.min(this.minHeight, currentHeight));
            
            // Add some hills and valleys
            if (i % 20 === 0) {
                currentHeight += (Math.random() - 0.5) * 100;
            }
            
            this.points.push({ x, y: currentHeight });
        }
        
        // Smooth the terrain
        this.smoothTerrain();
    }

    smoothTerrain() {
        for (let i = 1; i < this.points.length - 1; i++) {
            const prev = this.points[i - 1];
            const current = this.points[i];
            const next = this.points[i + 1];
            
            current.y = (prev.y + current.y + next.y) / 3;
        }
    }

    getGroundHeight(x) {
        // Find the two points that x is between
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            
            if (x >= p1.x && x <= p2.x) {
                // Linear interpolation
                const t = (x - p1.x) / (p2.x - p1.x);
                return p1.y + (p2.y - p1.y) * t;
            }
        }
        
        // If x is beyond our terrain, return the last point's height
        return this.points[this.points.length - 1].y;
    }

    getGroundDistance(x, y) {
        const groundHeight = this.getGroundHeight(x);
        return Math.max(0, groundHeight - y);
    }

    draw(ctx) {
        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(-1000, -1000, 8000, 2000);
        
        // Draw terrain
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        // Close the shape by going to bottom and back
        ctx.lineTo(this.width, 1000);
        ctx.lineTo(0, 1000);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Draw grass on top
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.stroke();
        
        // Draw some decorative elements
        this.drawDecorations(ctx);
    }

    drawDecorations(ctx) {
        // Draw trees and rocks occasionally
        for (let i = 0; i < this.points.length; i += 10) {
            if (Math.random() < 0.3) {
                const point = this.points[i];
                
                if (Math.random() < 0.7) {
                    // Draw tree
                    this.drawTree(ctx, point.x, point.y);
                } else {
                    // Draw rock
                    this.drawRock(ctx, point.x, point.y);
                }
            }
        }
    }

    drawTree(ctx, x, y) {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 3, y - 30, 6, 30);
        
        // Tree leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x, y - 35, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRock(ctx, x, y) {
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.ellipse(x, y - 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}