export interface RouteOptions {
    travelMode: 'DRIVE' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
    routingPreference: 'TRAFFIC_AWARE' | 'TRAFFIC_UNAWARE';
    computeAlternativeRoutes: boolean;
    routeModifiers: {
        avoidTolls: boolean;
        avoidHighways: boolean;
        avoidFerries: boolean;
    };
    languageCode: string;
    units: 'IMPERIAL' | 'METRIC';
    // We can add more options based on the API documentation
} 