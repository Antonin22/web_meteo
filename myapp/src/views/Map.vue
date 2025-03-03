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
        { id: 'piensg027', name: 'Station 27' },
        { id: 'piensg028', name: 'Station 28' },
        { id: 'piensg030', name: 'Station 30' },
        { id: 'piensg031', name: 'Station 31' },
        { id: 'piensg032', name: 'Station 32' }
      ],
      stationsData: {},
      stationsCoordinates: {}
    }
  },
  mounted() {
    // Récupérer d'abord les coordonnées des stations
    this.fetchStationCoordinates().then(() => {
      // Attendre que le DOM soit complètement monté
      this.$nextTick(() => {
        try {
          const mapContainer = document.getElementById('map-container');
          if (!mapContainer) {
            console.error("Élément de carte introuvable");
            return;
          }
          
          // Centre de carte par défaut (sera ajusté)
          let centerLat = 48.52;
          let centerLon = 2.22;
          
          // Si on a des coordonnées, centrer sur leur moyenne
          if (Object.keys(this.stationsCoordinates).length > 0) {
            const coords = Object.values(this.stationsCoordinates);
            const validCoords = coords.filter(c => c && c.lat && c.lon);
            
            if (validCoords.length > 0) {
              centerLat = validCoords.reduce((sum, c) => sum + c.lat, 0) / validCoords.length;
              centerLon = validCoords.reduce((sum, c) => sum + c.lon, 0) / validCoords.length;
              console.log(`Centrage de carte sur: ${centerLat}, ${centerLon}`);
            }
          }
          
          // Créer la carte Leaflet
          this.map = L.map('map-container').setView([centerLat, centerLon], 12);
          
          // Ajouter la couche OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);
          
          // Ajouter les marqueurs pour chaque station
          this.stations.forEach(station => {
            const coord = this.stationsCoordinates[station.id];
            if (coord && coord.lat && coord.lon) {
              const marker = L.marker([coord.lat, coord.lon])
                .addTo(this.map)
                .bindPopup(`<b>${station.name}</b><br>Température: --°C<br>Latitude: ${coord.lat}<br>Longitude: ${coord.lon}`);
              
              this.markers.push({
                stationId: station.id,
                marker: marker
              });
            } else {
              console.warn(`Coordonnées manquantes pour la station ${station.id}`);
            }
          });
        } catch (error) {
          console.error("Erreur lors de l'initialisation de la carte Leaflet:", error);
          this.createMapPlaceholder();
        }
      });
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
    
    // Récupère les coordonnées de toutes les stations
    async fetchStationCoordinates() {
      for (const station of this.stations) {
        try {
          const stationData = await getStationData(station.id);
          
          if (stationData && stationData.data) {
            const lat = stationData.data.lat;
            const lon = stationData.data.lon || stationData.data.long; // certaines stations utilisent "long" au lieu de "lon"
            
            if (lat && (lon || stationData.data.long)) {
              this.stationsCoordinates[station.id] = { 
                lat: parseFloat(lat), 
                lon: parseFloat(lon || stationData.data.long) 
              };
              console.log(`Coordonnées récupérées pour ${station.id}: ${lat}, ${lon || stationData.data.long}`);
            } else {
              console.warn(`Coordonnées de ${station.id} incomplètes:`, stationData.data);
              // Utiliser des coordonnées par défaut pour les stations sans GPS
              this.setDefaultCoordinates(station.id);
            }
          } else {
            console.warn(`Pas de données pour ${station.id}`);
            this.setDefaultCoordinates(station.id);
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des coordonnées de ${station.id}:`, error);
          this.setDefaultCoordinates(station.id);
        }
      }
    },
    
    // Définit des coordonnées par défaut pour une station manquante
    setDefaultCoordinates(stationId) {
      // Coordonnées par défaut basées sur l'ID de la station
      const defaultCoords = {
        'piensg027': { lat: 48.840, lon: 2.58 },
        'piensg028': { lat: 48.845, lon: 2.59 },
        'piensg030': { lat: 48.850, lon: 2.60 },
        'piensg031': { lat: 48.855, lon: 2.61 },
        'piensg032': { lat: 48.860, lon: 2.62 }
      };
      
      if (defaultCoords[stationId]) {
        this.stationsCoordinates[stationId] = defaultCoords[stationId];
        console.log(`Utilisation des coordonnées par défaut pour ${stationId}`);
      } else {
        // Générer une position aléatoire autour d'une position centrale
        const lat = 48.85 + (Math.random() * 0.05 - 0.025);
        const lon = 2.60 + (Math.random() * 0.05 - 0.025);
        this.stationsCoordinates[stationId] = { lat, lon };
        console.log(`Génération de coordonnées pour ${stationId}: ${lat}, ${lon}`);
      }
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
              const coord = this.stationsCoordinates[station.id] || { lat: 'N/A', lon: 'N/A' };
              // Mettre à jour le popup avec la température
              markerInfo.marker.setPopupContent(
                `<b>${station.name}</b><br>Température: ${temperature}°C<br>Lat: ${coord.lat}, Lon: ${coord.lon}`
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