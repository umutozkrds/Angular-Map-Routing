import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit,AfterViewInit{
  private map!: L.Map;


  ngOnInit(): void {

  }

  async ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');
      const map = L.map('map').setView([41.0082, 28.9784], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      
      const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png', // Özel bir ikon URL'si
      iconSize: [32, 32],  // İkonun genişlik ve yüksekliği (px cinsinden)
      iconAnchor: [16, 32], // İkonun haritadaki merkez noktası
      popupAnchor: [0, -32] // Popup açılırsa nereden açılacağı
      });


      L.marker([41.0082, 28.9784], { icon: customIcon })
        .addTo(map)
        .bindPopup('Burası İstanbul!')
        .openPopup()
    }
  }
  
}
