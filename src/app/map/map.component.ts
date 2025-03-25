import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouteService } from '../services/route.service';
import * as polyline from '@mapbox/polyline';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  private map: any;
  private L: any;
  private routeLayer: any;
  private customIcon: any;
  markers: any[] = [];
  private value = 1;

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
    this.routeService.getRoute(start, end).subscribe({
      next: (res: any) => {
        if (res.routes?.[0]?.polyline?.encodedPolyline) {
          const route = res.routes[0];
          this.drawRoute(route.polyline.encodedPolyline);
        }
      },
      error: (error) => console.error('Error fetching route:', error)
    });
  }

  private drawRoute(encodedPolyline: string) {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    try {
      const decodedPolyline = polyline.decode(encodedPolyline);
      const latLngs = decodedPolyline.map((coord: number[]) =>
        this.L.latLng(coord[0], coord[1])
      );

      this.routeLayer = this.L.polyline(latLngs, {
        color: '#6FA1EC',
        weight: 4,
        opacity: 0.8
      }).addTo(this.map);

      this.map.fitBounds(this.routeLayer.getBounds());
    } catch (error) {
      console.error('Error drawing route:', error);
    }
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

    // Remove the route layer if it exists
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }

    // Reset the marker counter
    this.value = 1;
  }
}
