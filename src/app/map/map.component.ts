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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private routeService: RouteService
  ) { }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap();
      this.createLocation(this.markers);
      console.log("Markers", this.markers);
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
      console.log(e);
      console.log(this.markers);
      this.addMarker(e.latlng, 'Custom Marker');
      this.createLocation(this.markers);
    });
  }

  private fetchRoute(start: string, end: string) {
    this.routeService.getRoute(start, end).subscribe({
      next: (res: any) => {
        if (res.routes?.[0]?.polyline?.encodedPolyline) {
          const route = res.routes[0];
          this.drawRoute(route.polyline.encodedPolyline);

          if (route.legs?.[0]) {
            const leg = route.legs[0];
            this.addMarker(leg.start_location, 'Start');
            this.addMarker(leg.end_location, 'End');
          }
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
  private value = 1;
  private addMarker(location: any, label: string) {
    if (this.value <= 4) {
      let latLng;

      if (location instanceof this.L.LatLng) {
        // Handle click events
        latLng = location;
      } else if (location?.lat && location?.lng) {
        // Handle route endpoints
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
  }

  private createLocation(markers: any[]) {
    const locations = markers.map((marker) => {
      return {
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
      }
    })
    const start = locations[0].lat + "," + locations[0].lng;
    const end = locations[1].lat + "," + locations[1].lng;
    console.log("Locations", locations);
    if (locations.length == 2) {
      this.fetchRoute(start, end);
    }
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
