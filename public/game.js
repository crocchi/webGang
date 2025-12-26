// Game Configuration
const TILE_SIZE = 100; // pixels
const MAP_TILE_SIZE = 0.001; // degrees (approximately 100m)
const ZOOM_LEVEL = 16;

// Procedural generation constants for map styling
const HASH_PRIME_1 = 73856093;
const HASH_PRIME_2 = 19349663;

class WebGangGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerId = this.generatePlayerId();
        this.playerColor = this.generatePlayerColor();
        this.currentLocation = null;
        this.tiles = {};
        this.tilesOwned = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.startGPSTracking();
        this.loadTiles();
        this.gameLoop();
    }
    
    setupCanvas() {
        // Set canvas size
        const container = document.getElementById('canvas-container');
        const size = Math.min(container.clientWidth - 20, container.clientHeight - 20, 800);
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    generatePlayerId() {
        const id = 'Player_' + Math.random().toString(36).substring(2, 11);
        document.getElementById('player-id-value').textContent = id;
        return id;
    }
    
    generatePlayerColor() {
        // Generate vibrant GTA-style colors
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52D681', '#FF7979', '#6C5CE7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    setupEventListeners() {
        document.getElementById('claim-tile-btn').addEventListener('click', () => {
            this.claimCurrentTile();
        });
        
        document.getElementById('recenter-btn').addEventListener('click', () => {
            this.startGPSTracking();
        });
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    startGPSTracking() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            // Use default location for testing
            this.currentLocation = { lat: 41.9028, lon: 12.4964 }; // Rome
            this.updateLocationDisplay();
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.updateLocationDisplay();
            },
            (error) => {
                console.error('GPS Error:', error);
                // Use default location for testing
                this.currentLocation = { lat: 41.9028, lon: 12.4964 }; // Rome
                this.updateLocationDisplay();
            }
        );
        
        // Watch position for updates
        navigator.geolocation.watchPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.updateLocationDisplay();
            },
            (error) => console.error('GPS Watch Error:', error),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );
    }
    
    updateLocationDisplay() {
        if (this.currentLocation) {
            const locText = `${this.currentLocation.lat.toFixed(6)}, ${this.currentLocation.lon.toFixed(6)}`;
            document.getElementById('location-value').textContent = locText;
            
            const tile = this.getTileFromLocation(this.currentLocation);
            document.getElementById('current-tile').textContent = `${tile.x}, ${tile.y}`;
        }
    }
    
    getTileFromLocation(location) {
        // Convert GPS coordinates to tile coordinates
        const x = Math.floor(location.lon / MAP_TILE_SIZE);
        const y = Math.floor(location.lat / MAP_TILE_SIZE);
        return { x, y };
    }
    
    getLocationFromTile(x, y) {
        return {
            lat: (y + 0.5) * MAP_TILE_SIZE,
            lon: (x + 0.5) * MAP_TILE_SIZE
        };
    }
    
    async claimCurrentTile() {
        if (!this.currentLocation) {
            alert('GPS location not available yet!');
            return;
        }
        
        const tile = this.getTileFromLocation(this.currentLocation);
        const key = `${tile.x},${tile.y}`;
        
        // Check if already owned by this player
        if (this.tiles[key] && this.tiles[key].owner === this.playerId) {
            alert('You already own this tile!');
            return;
        }
        
        try {
            const response = await fetch('/api/tiles/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    x: tile.x,
                    y: tile.y,
                    playerId: this.playerId,
                    color: this.playerColor
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.tiles[key] = data.tile;
                this.updateTilesOwned();
                alert('Tile claimed successfully!');
            }
        } catch (error) {
            console.error('Error claiming tile:', error);
            alert('Failed to claim tile');
        }
    }
    
    async loadTiles() {
        try {
            const response = await fetch('/api/tiles');
            const tiles = await response.json();
            this.tiles = tiles;
            this.updateTilesOwned();
        } catch (error) {
            console.error('Error loading tiles:', error);
        }
    }
    
    updateTilesOwned() {
        this.tilesOwned = Object.values(this.tiles).filter(
            tile => tile.owner === this.playerId
        ).length;
        document.getElementById('tiles-owned').textContent = this.tilesOwned;
    }
    
    drawMap() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(0, 0, width, height);
        
        if (!this.currentLocation) {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for GPS...', width / 2, height / 2);
            return;
        }
        
        // Draw grid representing map tiles
        const centerTile = this.getTileFromLocation(this.currentLocation);
        const tilesPerSide = Math.ceil(width / TILE_SIZE);
        const halfTiles = Math.floor(tilesPerSide / 2);
        
        // Draw OpenStreetMap-inspired background with GTA style
        this.drawGTAStyleMap(centerTile, halfTiles);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(52, 73, 94, 0.5)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= tilesPerSide; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * TILE_SIZE, 0);
            ctx.lineTo(i * TILE_SIZE, height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * TILE_SIZE);
            ctx.lineTo(width, i * TILE_SIZE);
            ctx.stroke();
        }
        
        // Draw claimed tiles
        for (let i = -halfTiles; i <= halfTiles; i++) {
            for (let j = -halfTiles; j <= halfTiles; j++) {
                const tileX = centerTile.x + i;
                const tileY = centerTile.y + j;
                const key = `${tileX},${tileY}`;
                
                if (this.tiles[key]) {
                    const screenX = (i + halfTiles) * TILE_SIZE;
                    const screenY = (j + halfTiles) * TILE_SIZE;
                    
                    // Draw claimed tile with GTA style
                    ctx.fillStyle = this.tiles[key].color + '80'; // 50% opacity
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    
                    // Draw border
                    ctx.strokeStyle = this.tiles[key].color;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    
                    // Draw owner indicator
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    const ownerText = this.tiles[key].owner === this.playerId ? 'YOU' : 'ENEMY';
                    ctx.fillText(ownerText, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
                }
            }
        }
        
        // Draw player position (center)
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw player marker
        ctx.fillStyle = this.playerColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw crosshair for current tile
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const currentTileScreenX = halfTiles * TILE_SIZE;
        const currentTileScreenY = halfTiles * TILE_SIZE;
        
        ctx.strokeRect(currentTileScreenX, currentTileScreenY, TILE_SIZE, TILE_SIZE);
        ctx.setLineDash([]);
    }
    
    drawGTAStyleMap(centerTile, halfTiles) {
        const ctx = this.ctx;
        
        // Draw streets and blocks GTA-style
        for (let i = -halfTiles; i <= halfTiles; i++) {
            for (let j = -halfTiles; j <= halfTiles; j++) {
                const screenX = (i + halfTiles) * TILE_SIZE;
                const screenY = (j + halfTiles) * TILE_SIZE;
                
                // Create pseudo-random but consistent pattern based on tile coordinates
                const tileX = centerTile.x + i;
                const tileY = centerTile.y + j;
                const seed = (tileX * HASH_PRIME_1) ^ (tileY * HASH_PRIME_2);
                const random = Math.abs(Math.sin(seed)) * 10;
                
                // Base block color (building-like)
                if (random > 7) {
                    ctx.fillStyle = '#34495E'; // Building
                } else if (random > 4) {
                    ctx.fillStyle = '#27AE60'; // Park
                } else {
                    ctx.fillStyle = '#2C3E50'; // Street
                }
                
                ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                
                // Draw street lines
                if (random <= 4) {
                    ctx.strokeStyle = '#F39C12';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([10, 5]);
                    
                    // Horizontal line
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY + TILE_SIZE / 2);
                    ctx.lineTo(screenX + TILE_SIZE, screenY + TILE_SIZE / 2);
                    ctx.stroke();
                    
                    ctx.setLineDash([]);
                }
            }
        }
    }
    
    gameLoop() {
        this.drawMap();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new WebGangGame();
});
