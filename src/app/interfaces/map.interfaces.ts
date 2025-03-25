export interface RouteResponse {
    routes: Route[];
}

export interface Route {
    polyline: {
        encodedPolyline: string;
    };
    summary: string;
    legs: RouteLeg[];
}

export interface RouteLeg {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    start_location: Location;
    end_location: Location;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface MapOptions {
    center: Location;
    zoom: number;
}

export interface MarkerOptions {
    location: Location;
    label: string;
} 