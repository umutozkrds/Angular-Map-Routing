const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Route endpoint
app.post('/api/route', async (req, res) => {
    try {
        const { origin, destination, ...options } = req.body;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        if (!origin?.location?.latLng || !destination?.location?.latLng) {
            return res.status(400).json({ error: 'Invalid origin or destination coordinates' });
        }

        // Log the request for debugging
        console.log('Route request:', {
            origin,
            destination,
            options
        });

        const response = await axios.post(
            `https://routes.googleapis.com/directions/v2:computeRoutes`,
            {
                origin,
                destination,
                ...options
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
                }
            }
        );

        // Log the response for debugging
        console.log('API Response:', response.data);

        // Check if we have any routes
        if (!response.data.routes || response.data.routes.length === 0) {
            return res.status(404).json({ error: 'No routes found' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);

        // Handle specific API errors
        if (error.response?.data?.error?.message) {
            return res.status(error.response.status || 500).json({
                error: error.response.data.error.message
            });
        }

        // Handle network errors
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Could not connect to Google Maps API'
            });
        }

        // Handle other errors
        res.status(500).json({
            error: 'Failed to fetch route'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test endpoint: http://localhost:${port}/test`);
    console.log(`Route endpoint: http://localhost:${port}/api/route`);
}); 