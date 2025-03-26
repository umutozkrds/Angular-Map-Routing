import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouteService } from '../services/route.service';
import * as polyline from '@mapbox/polyline';
import { RouteOptions } from '../interfaces/route-options.interface';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  private map: any;
  private L: any;
  private routeLayers: any[] = [];
  private customIcon: any;
  markers: any[] = [];
  private value = 1;

  // Route options
  routeOptions: RouteOptions = {
    routingPreference: 'TRAFFIC_AWARE',
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    languageCode: 'en-US',
    units: 'IMPERIAL'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private routeService: RouteService
  ) { }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap();
    }
  }

  private async initializeMap() {
    this.L = await import('leaflet');
    this.map = this.L.map('map').setView([41.0082, 28.9784], 13);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.customIcon = this.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.map.on('click', (e: any) => {
      if (this.value <= 2) {
        const label = this.value === 1 ? 'Start' : 'End';
        this.addMarker(e.latlng, label);
        if (this.markers.length === 2) {
          this.createRoute();
        }
      }
    });
  }

  private fetchRoute(start: string, end: string) {
    this.routeService.getRoute(start, end, this.routeOptions).subscribe({
      next: (res: any) => {
        if (res.routes && res.routes.length > 0) {
          this.drawRoutes(res.routes);
        }
      },
      error: (error) => console.error('Error fetching route:', error)
    });
  }

  updateRoutingPreference(preference: string) {
    if (preference === 'TRAFFIC_AWARE' || preference === 'TRAFFIC_UNAWARE') {
      this.routeOptions.routingPreference = preference;
      if (this.markers.length === 2) {
        this.createRoute();
      }
    }
  }

  updateComputeAlternatives(compute: boolean) {
    this.routeOptions.computeAlternativeRoutes = compute;
    if (this.markers.length === 2) {
      this.createRoute();
    }
  }

  updateRouteModifiers(modifier: 'avoidTolls' | 'avoidHighways' | 'avoidFerries', value: boolean) {
    this.routeOptions.routeModifiers[modifier] = value;
    if (this.markers.length === 2) {
      this.createRoute();
    }
  }

  updateUnits(units: string) {
    if (units === 'IMPERIAL' || units === 'METRIC') {
      this.routeOptions.units = units;
      if (this.markers.length === 2) {
        this.createRoute();
      }
    }
  }

  private drawRoutes(routes: any[]) {
    // Clear existing routes
    this.clearRoutes();

    // Draw each route with a different color
    routes.forEach((route, index) => {
      if (route.polyline?.encodedPolyline) {
        try {
          const decodedPolyline = polyline.decode(route.polyline.encodedPolyline);
          const latLngs = decodedPolyline.map((coord: number[]) =>
            this.L.latLng(coord[0], coord[1])
          );

          // Use different colors for alternative routes
          const colors = ['#6FA1EC', '#FF6B6B', '#4CAF50', '#FFC107'];
          const color = colors[index % colors.length];

          const routeLayer = this.L.polyline(latLngs, {
            color: color,
            weight: 4,
            opacity: 0.8
          }).addTo(this.map);

          this.routeLayers.push(routeLayer);
        } catch (error) {
          console.error('Error drawing route:', error);
        }
      }
    });

    // Fit bounds to show all routes
    if (this.routeLayers.length > 0) {
      const bounds = this.L.latLngBounds(this.routeLayers.map(layer => layer.getBounds()));
      this.map.fitBounds(bounds);
    }
  }

  private clearRoutes() {
    this.routeLayers.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.routeLayers = [];
  }

  private addMarker(location: any, label: string) {
    let latLng;

    if (location instanceof this.L.LatLng) {
      latLng = location;
    } else if (location?.lat && location?.lng) {
      latLng = this.L.latLng(location.lat, location.lng);
    }

    if (latLng) {
      const marker = this.L.marker(latLng, {
        icon: this.customIcon
      })
        .bindPopup(label)
        .addTo(this.map);

      this.markers.push(marker);
      this.value++;
    }
  }

  private createRoute() {
    const locations = this.markers.map((marker) => {
      const latLng = marker.getLatLng();
      return `${latLng.lat},${latLng.lng}`;
    });

    this.fetchRoute(locations[0], locations[1]);
  }

  clearMarkers() {
    // Remove all markers from the map
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });

    // Clear the markers array
    this.markers = [];

    // Clear all routes
    this.clearRoutes();

    // Reset the marker counter
    this.value = 1;
  }
}
