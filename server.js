const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());

// Basic test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.get('/api/route', async (req, res) => {
    try {
        const { origin, destination } = req.query;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status === 'OK' && response.data.routes?.[0]) {
            const route = response.data.routes[0];
            res.json({
                routes: [{
                    polyline: {
                        encodedPolyline: route.overview_polyline.points
                    },
                    legs: route.legs
                }]
            });
        } else {
            res.status(404).json({ error: 'No route found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch route' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/test`);
    console.log(`Route endpoint: http://localhost:${PORT}/api/route`);
}); 