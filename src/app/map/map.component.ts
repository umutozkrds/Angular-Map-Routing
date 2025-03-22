import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit,AfterViewInit {
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

      map.on('click', mapClick)

      let value = 1
      function mapClick(e: any) {
        if (value <= 2) {
          var marker = L.marker(e.latlng, { icon: customIcon }).addTo(map)
          value++
        }

      }
      const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png', // Özel bir ikon URL'si
      iconSize: [32, 32],  // İkonun genişlik ve yüksekliği (px cinsinden)
      iconAnchor: [16, 32], // İkonun haritadaki merkez noktası
      popupAnchor: [0, -32] // Popup açılırsa nereden açılacağı
      });



    }
  }
}
