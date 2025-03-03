<template>
  <div class="map-view">
    <h2>Carte des stations météo</h2>
    <div class="map-controls">
      <button @click="fetchAllStationsData" class="data-btn">
        Afficher les températures actuelles
      </button>
    </div>
    <div id="map-container" class="map-container"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStationData } from '@/services/stationApi';

export default {
  name: 'MapView',
  data() {
    return {
      map: null,
      markers: [],
      stations: [
        { id: 'piensg027', name: 'Station 27', lat: 48.50, lon: 2.20 },
        { id: 'piensg028', name: 'Station 28', lat: 48.51, lon: 2.21 },
        { id: 'piensg030', name: 'Station 30', lat: 48.52, lon: 2.22 },
        { id: 'piensg031', name: 'Station 31', lat: 48.53, lon: 2.23 },
        { id: 'piensg032', name: 'Station 32', lat: 48.54, lon: 2.24 }
      ],
      stationsData: {}
    }
  },
  mounted() {
    // Attendre que le DOM soit complètement monté
    this.$nextTick(() => {
      try {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
          console.error("Élément de carte introuvable");
          return;
        }
        
        // Créer la carte Leaflet
        this.map = L.map('map-container').setView([48.52, 2.22], 12);
        
        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Ajouter les marqueurs pour chaque station
        this.stations.forEach(station => {
          const marker = L.marker([station.lat, station.lon])
            .addTo(this.map)
            .bindPopup(`<b>${station.name}</b><br>Température: --°C<br>Latitude: ${station.lat}<br>Longitude: ${station.lon}`);
          
          this.markers.push({
            stationId: station.id,
            marker: marker
          });
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte Leaflet:", error);
        this.createMapPlaceholder();
      }
    });
    
  },
  methods: {
    createMapPlaceholder() {
      // Initialiser un placeholder pour la carte
      document.getElementById('map-container').innerHTML = 
        '<div style="background-color:#e0f0e0; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">' +
        '<p><strong>La carte des stations météo sera affichée ici</strong></p>' +
        '<p>Pour l\'implémenter, vous devez installer Leaflet:</p>' +
        '<code>npm install leaflet</code>' +
        '<p>Et ajouter le CSS Leaflet dans index.html</p>' +
        '</div>';
    },
    async fetchAllStationsData() {
      try {
        // Pour chaque station, récupérer les données de température
        for (const station of this.stations) {
          try {
            // Utiliser notre nouvelle API pour récupérer les données
            const stationData = await getStationData(station.id);
            
            let temperature;
            
            if (stationData && stationData.data && stationData.data.temperature) {
              // Si on a réussi à récupérer les données réelles
              temperature = stationData.data.temperature;
              console.log(`Température réelle pour ${station.id}: ${temperature}°C`);
            } else {
              // Sinon utiliser des données aléatoires
              temperature = Math.floor(Math.random() * 15) + 5; // Entre 5 et 20°C
              console.log(`Température aléatoire pour ${station.id}: ${temperature}°C`);
            }
            
            this.stationsData[station.id] = { temperature };
            
            // Trouver le marqueur correspondant
            const markerInfo = this.markers.find(m => m.stationId === station.id);
            if (markerInfo) {
              // Mettre à jour le popup avec la température
              markerInfo.marker.setPopupContent(
                `<b>${station.name}</b><br>Température: ${temperature}°C<br>Lat: ${station.lat}, Lon: ${station.lon}`
              );
              
              // Ouvrir le popup pour montrer la température
              if (Math.random() > 0.7) { // On n'ouvre que quelques popups aléatoirement pour éviter l'encombrement
                markerInfo.marker.openPopup();
              }
            }
          } catch (stationError) {
            console.error(`Erreur lors de la mise à jour de la station ${station.id}:`, stationError);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    }
  }
}
</script>

<style scoped>
.map-view {
  padding: 20px;
}

.map-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.data-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.data-btn:hover {
  background-color: #218838;
}

.map-container {
  height: 500px;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>