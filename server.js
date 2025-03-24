const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const GOOGLE_MAPS_API_KEY = 'AIzaSyDblWgIRw2ErhZCm-dsVpxQOE4nZIcnh8w';

app.get('/api/route', async (req, res) => {
    try {
        const { origin, destination } = req.query;
        const [startLat, startLng] = origin.split(',');
        const [endLat, endLng] = destination.split(',');

        const requestBody = {
            origin: {
                location: {
                    latLng: {
                        latitude: parseFloat(startLat),
                        longitude: parseFloat(startLng)
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: parseFloat(endLat),
                        longitude: parseFloat(endLng)
                    }
                }
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            computeAlternativeRoutes: false,
            routeModifiers: {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false
            },
            languageCode: "en-US",
            units: "IMPERIAL"
        };

        const response = await axios.post('https://routes.googleapis.com/directions/v2:computeRoutes',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch route' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 