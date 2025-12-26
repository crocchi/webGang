const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json());

// In-memory storage for tiles (in production, use a database)
const tiles = {};

// Get tile status
app.get('/api/tiles/:x/:y', (req, res) => {
    const key = `${req.params.x},${req.params.y}`;
    res.json(tiles[key] || { owner: null, color: null });
});

// Claim a tile
app.post('/api/tiles/claim', (req, res) => {
    const { x, y, playerId, color } = req.body;
    
    // Validate input
    if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({ success: false, error: 'Invalid tile coordinates' });
    }
    
    if (!playerId || typeof playerId !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid player ID' });
    }
    
    if (!color || typeof color !== 'string' || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
        return res.status(400).json({ success: false, error: 'Invalid color format' });
    }
    
    const key = `${x},${y}`;
    
    tiles[key] = {
        owner: playerId,
        color: color,
        timestamp: Date.now()
    };
    
    res.json({ success: true, tile: tiles[key] });
});

// Get all claimed tiles
app.get('/api/tiles', (req, res) => {
    res.json(tiles);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
