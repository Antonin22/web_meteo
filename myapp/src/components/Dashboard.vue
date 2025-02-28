<template>
  <div class="dashboard">
    <div v-if="loading" class="loading">
      <p>Chargement des données...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>Erreur de chargement: {{ error }}</p>
      <button @click="fetchLiveData">Réessayer</button>
    </div>
    <div v-else class="weather-data">
      <h2>Station {{ stationId }}</h2>
      <p class="last-updated">Dernière mise à jour: {{ formatDate(data.date) }}</p>
      
      <div class="sensors-grid">
        <Sensor 
          v-if="data.temperature !== undefined"
          type="temperature"
          :value="data.temperature"
          :unit="unit.temperature"
          :min="0"
          :max="35"
        />
        
        <Sensor 
          v-if="data.pressure !== undefined"
          type="pressure"
          :value="data.pressure"
          :unit="unit.pressure"
          :min="970"
          :max="1050"
        />
        
        <Sensor 
          v-if="data.humidity !== undefined"
          type="humidity"
          :value="data.humidity"
          :unit="unit.humidity"
          :min="20"
          :max="80"
        />
        
        <Sensor 
          v-if="data.luminosity !== undefined"
          type="luminosity"
          :value="data.luminosity"
          :unit="unit.luminosity"
        />
        
        <Sensor 
          v-if="data.wind_heading !== undefined"
          type="wind_heading"
          :value="data.wind_heading"
          :unit="unit.wind_heading"
        />
        
        <Sensor 
          v-if="data.wind_speed_avg !== undefined"
          type="wind_speed_avg"
          :value="data.wind_speed_avg"
          :unit="unit.wind_speed_avg"
          :max="100"
        />
        
        <Sensor 
          v-if="data.rain !== undefined"
          type="rain"
          :value="data.rain"
          :unit="unit.rain"
        />
      </div>
      
      <div class="actions">
        <button @click="fetchLiveData" class="refresh-btn">Actualiser</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getLiveData } from '@/services/api';
import Sensor from '@/components/Sensor.vue';

export default {
  name: 'Dashboard',
  components: {
    Sensor
  },
  props: {
    stationId: {
      type: String,
      default: 'piensg032'
    }
  },
  data() {
    return {
      
      useRealApi: true, //  activer l'API
      loading: true,
      error: null,
      data: {
        date: new Date().toISOString(),
        temperature: 0,
        pressure: 0,
        humidity: 0,
        luminosity: 0,
        wind_heading: 0,
        wind_speed_avg: 0,
        rain: 0,
        lat: 0,
        long: 0
      },
      unit: {
        temperature: '°C',
        pressure: 'hPa',
        humidity: '%',
        luminosity: 'Lux',
        wind_heading: '°',
        wind_speed_avg: 'km/h',
        rain: 'mm/m²',
        lat: '',
        lon: ''
      },
      refreshInterval: null
    };
  },
  mounted() {
    this.fetchLiveData();
    
    this.refreshInterval = setInterval(() => {
      this.fetchLiveData();
    }, 60000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  watch: {
    stationId() {
      this.fetchLiveData();
    }
  },
  methods: {
    async fetchLiveData() {
      this.loading = true;
      this.error = null;

      
      if (this.useRealApi) {
        
        try {
          console.log('Tentative de récupération des données réelles');
          const liveData = await getLiveData();
          
          if (liveData && liveData.data) {
            this.data = liveData.data;
            this.unit = liveData.unit;
            console.log('Données réelles récupérées:', liveData);
            this.loading = false;
            return;
          } else {
            throw new Error('Données API invalides');
          }
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          this.error = "API indisponible - utilisation de données de secours";
          
        }
      }

      
      try {
        console.log('Chargement des données mockées');
        const response = await fetch('/mock-data.json');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const json_data = await response.json();
        
        
        const stationId = this.stationId.replace('piensg', '');
        const stationData = json_data.find(station => station.id.toString() === stationId) || json_data[0];
        
        if (stationData) {
          this.data = stationData.data;
          this.unit = stationData.unit;
          console.log('Données mockées chargées avec succès:', stationData);
          this.error = null;
        } else {
          throw new Error('Données mockées invalides');
        }
      } catch (mockError) {
        console.warn('Échec du chargement des données mockées:', mockError);
        this.error = "Impossible de charger les données météo";
        
        // En dernier recours, utiliser des valeurs aléatoires
        this.data.date = new Date().toISOString();
        this.data.temperature = Math.random() * 10 + 15; // 15-25°C
        this.data.humidity = Math.random() * 30 + 40; // 40-70%
        this.data.pressure = Math.random() * 20 + 1000; // 1000-1020 hPa
        console.log('Utilisation de valeurs aléatoires par défaut');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 40px;
}

.error {
  color: #dc3545;
}

.weather-data {
  margin-top: 20px;
}

.last-updated {
  color: #6c757d;
  font-size: 0.9rem;
  text-align: right;
}

.sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.sensor-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.sensor-card:hover {
  transform: translateY(-3px);
}

.sensor-card h3 {
  margin-top: 0;
  color: #343a40;
  font-size: 1.1rem;
}

.sensor-value {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-top: 10px;
}

.unit {
  font-size: 1rem;
  color: #6c757d;
  margin-left: 5px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #0069d9;
}
</style>