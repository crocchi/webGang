# WebGang 🗺️

WebGang is an interactive GPS-based 2D browser game where players compete to claim territories based on their real-world location. The game features a GTA-style map rendered on HTML5 Canvas using OpenStreetMap concepts, where players can conquer tiles to build their virtual gang empire!

## Features ✨

- **GPS-Based Gameplay**: Use your real GPS location to play
- **GTA-Style Graphics**: Procedurally generated map with streets, buildings, and parks
- **Territory Conquest**: Claim tiles based on your physical location
- **Real-Time Updates**: See your conquered territories in real-time
- **Multiplayer Ready**: Backend supports multiple players claiming different tiles
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used 🛠️

- **Backend**: Node.js + Express
- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Map System**: GPS coordinates + OpenStreetMap tile concept
- **Styling**: CSS3 with gradient backgrounds

## Installation 📦

1. Clone the repository:
```bash
git clone https://github.com/crocchi/webGang.git
cd webGang
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play 🎮

1. **Allow GPS Access**: When prompted, allow the browser to access your location
2. **View the Map**: The canvas displays a GTA-style map centered on your location
3. **Claim Tiles**: Click "Claim This Tile" to conquer the tile you're currently on
4. **Expand Territory**: Move to different locations and claim more tiles
5. **Compete**: Your tiles are marked with "YOU", while other players' tiles show "ENEMY"

## Game Mechanics 🎯

- **Tile System**: The map is divided into tiles, each representing approximately 100m x 100m
- **GPS Coordinates**: Each tile corresponds to real GPS coordinates (0.001 degrees per tile)
- **Color Coding**: Each player gets a unique vibrant color for their territories
- **Map Style**: Procedurally generated GTA-style terrain (streets, buildings, parks)

## API Endpoints 🔌

- `GET /api/tiles/:x/:y` - Get status of a specific tile
- `POST /api/tiles/claim` - Claim a tile (requires x, y, playerId, color)
- `GET /api/tiles` - Get all claimed tiles

## Project Structure 📁

```
webGang/
├── server.js           # Express server
├── package.json        # Dependencies
├── public/
│   ├── index.html     # Main game page
│   ├── game.js        # Game logic and Canvas rendering
│   └── style.css      # Styling
└── README.md          # This file
```

## Screenshots 📸

### Game View with GTA-Style Map
The map shows different terrain types with green areas (parks), dark areas (streets), and buildings.

### Claimed Territory
Your claimed tiles are highlighted in your player color with "YOU" marker.

## Future Enhancements 💡

- Database persistence (MongoDB/PostgreSQL)
- User authentication
- Real-time multiplayer updates with WebSockets
- Leaderboards
- Gang/team mechanics
- Mobile app version
- Additional map styles
- Tile battles/contests

## License 📄

ISC

## Contributing 🤝

Contributions are welcome! Feel free to submit issues and pull requests.

## Author ✍️

Created for the webGang project
