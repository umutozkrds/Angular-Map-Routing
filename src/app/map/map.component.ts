import { AfterViewInit, Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouteService } from '../services/route.service';
import * as polyline from '@mapbox/polyline';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

// AIzaSyDblWgIRw2ErhZCm-dsVpxQOE4nZIcnh8w
export class MapComponent implements OnInit, AfterViewInit {
  // Map related properties
  private map: any;
  private L: any;
  private routeLayer: any;
  private customIcon: any;

  // Marker related properties
  private value = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private routeService: RouteService
  ) { }

  // Lifecycle hooks
  ngOnInit(): void {
    this.fetchRoute();
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap();
    }
  }

  // Map initialization methods
  private async initializeMap() {
    // Import Leaflet dynamically for SSR compatibility
    this.L = await import('leaflet');

    // Initialize map with default view
    this.map = this.L.map('map').setView([41.0082, 28.9784], 13);

    // Add OpenStreetMap tile layer
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Initialize custom icon for markers
    this.initializeCustomIcon();

    // Add click event listener
    this.map.on('click', this.mapClick.bind(this));
  }

  private initializeCustomIcon() {
    this.customIcon = this.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  // Route handling methods
  private fetchRoute() {
    this.routeService.getRoute('41.2042549,28.7655952', '41.0645863,28.894345').subscribe(
      (res: any) => {
        if (res.routes && res.routes[0]) {
          const encodedPolyline = res.routes[0].polyline.encodedPolyline;
          this.drawRoute(encodedPolyline);
        }
      },
      (error) => {
        console.error('Error fetching route:', error);
      }
    );
  }

  private drawRoute(encodedPolyline: string) {
    // Remove existing route if any
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    // Decode and create route polyline
    const decodedPolyline = polyline.decode(encodedPolyline);
    const latLngs = decodedPolyline.map((coord: number[]) =>
      this.L.latLng(coord[0], coord[1])
    );

    // Create and add new route layer
    this.routeLayer = this.L.polyline(latLngs, {
      color: '#6FA1EC',
      weight: 4,
      opacity: 0.8
    }).addTo(this.map);

    // Adjust map view to show entire route
    this.map.fitBounds(this.routeLayer.getBounds());
  }

  // Event handlers
  private mapClick(e: any) {
    if (this.value <= 2) {
      const marker = this.L.marker(e.latlng, { icon: this.customIcon }).addTo(this.map);
      this.value++;
    }
  }
}
