<template>
  <div class="stations">
    <h2>Comparaison entre stations</h2>
    
    <div class="filters">
      <div class="filter-group">
        <label for="dataType">Donnée à comparer:</label>
        <select id="dataType" v-model="selectedData" class="filter-select">
          <option value="temperature">Température</option>
          <option value="humidity">Humidité</option>
          <option value="pressure">Pression</option>
          <option value="wind_speed_avg">Vitesse du vent</option>
          <option value="luminosity">Luminosité</option>
          <option value="rain">Précipitations</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="timeRange">Période:</label>
        <select id="timeRange" v-model="timeRange" class="filter-select">
          <option value="hour">Dernière heure</option>
          <option value="day">Dernières 24 heures</option>
          <option value="week">Dernière semaine</option>
          <option value="month">Dernier mois</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="chartType">Type de graphique:</label>
        <select id="chartType" v-model="chartType" class="filter-select">
          <option value="line">Linéaire</option>
          <option value="bar">Bâtons</option>
        </select>
      </div>
      
      <button @click="fetchComparisonData" class="compare-btn">Comparer</button>
    </div>
    
    <div class="stations-selection">
      <h3>Stations à comparer:</h3>
      <div class="station-checkboxes">
        <div v-for="station in stations" :key="station.id" class="station-checkbox">
          <input
            type="checkbox"
            :id="station.id"
            v-model="selectedStations"
            :value="station.id"
          />
          <label :for="station.id">{{ station.name }}</label>
        </div>
      </div>
    </div>
    
    <div class="loading-indicator" v-if="loading">
      <p>Chargement des données...</p>
    </div>
    
    <div class="comparison-container" v-if="!loading">
      <div v-if="chartData.labels.length === 0" class="no-data">
        <p>Aucune donnée à afficher. Veuillez sélectionner au moins une station et cliquez sur Comparer.</p>
      </div>
      
      <div v-else class="chart-wrapper">
        <h3>{{ getChartTitle() }}</h3>
        
        <div class="chart-container">
          <canvas :key="chartType" ref="chartCanvas" height="400"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSampleData } from '@/services/api';
import Chart from 'chart.js/auto';



export default {
  name: 'Stations',
  data() {
    return {
      
      useRealApi: false, // activer l'API
      selectedData: 'temperature',
      timeRange: 'day',
      chartType: 'line', // 'line' ou 'bar'
      chart: null, // Référence à l'instance du graphique
      loading: false,
      stations: [
        { id: 'piensg027', name: 'Station 27' },
        { id: 'piensg028', name: 'Station 28' },
        { id: 'piensg030', name: 'Station 30' },
        { id: 'piensg031', name: 'Station 31' },
        { id: 'piensg032', name: 'Station 32' }
      ],
      selectedStations: ['piensg027', 'piensg032'], 
      chartData: {
        labels: [],
        datasets: []
      },
      chartColors: [
        '#007bff', // bleu
        '#28a745', // vert
        '#dc3545', // rouge
        '#ffc107', // jaune
        '#17a2b8'  // cyan
      ]
    }
  },
  mounted() {
    // Charger les données initiales
    this.fetchComparisonData();
  },
  beforeUnmount() {
    // Détruire le graphique quand le composant est démonté
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  watch: {
    // Mettre à jour le graphique quand le type de graphique change
    chartType() {
      if (this.chartData.labels.length > 0) {
        this.updateChart();
      }
    }
  },
  methods: {
    async fetchComparisonData() {
      if (this.selectedStations.length === 0) {
        alert('Veuillez sélectionner au moins une station');
        return;
      }

      this.loading = true;
      
      try {
        // Déterminer la date de début basée sur la période sélectionnée
        const now = new Date();
        let startDate = new Date();
        
        switch (this.timeRange) {
          case 'hour':
            startDate.setHours(now.getHours() - 1);
            break;
          case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        // Décider si on utilise l'API réelle ou les données mockées
        if (this.useRealApi) {
          try {
            // Utilisation de l'API réelle
            const startDateIso = startDate.toISOString();
            console.log('Tentative de récupération des données depuis', startDateIso);
            
            
            const realDatasets = [];
            let apiSuccess = false;
            
            for (const stationId of this.selectedStations) {
              try {
                const response = await getSampleData(startDateIso);
                console.log('Réponse API pour', stationId, response);
                
                
                if (response && response.data && response.data.length > 0) {
                  
                  const dataset = {
                    label: this.getStationName(stationId),
                    data: response.data.map(item => item[this.selectedData] || 0),
                    borderColor: this.getChartColor(this.selectedStations.indexOf(stationId)),
                    backgroundColor: this.getChartColor(this.selectedStations.indexOf(stationId))
                  };
                  
                  realDatasets.push(dataset);
                  apiSuccess = true;
                }
              } catch (error) {
                console.warn(`Erreur pour ${stationId}:`, error);
              }
            }
            
            
            if (apiSuccess && realDatasets.length > 0) {
              
              const labels = [];
              const points = 10;
              
              for (let i = 0; i < points; i++) {
                const date = new Date(startDate);
                const increment = (now.getTime() - startDate.getTime()) / (points - 1) * i;
                date.setTime(startDate.getTime() + increment);
                
                labels.push(date.toLocaleString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short'
                }));
              }
              
              this.chartData = {
                labels,
                datasets: realDatasets
              };
              
              return; 
            }
          } catch (apiError) {
            console.error('Erreur API générale:', apiError);
          }
          
          
          console.warn('L\'API a échoué, utilisation de données simulées');
        }
        
        // Utiliser des données simulées (par défaut ou en cas d'échec de l'API)
        this.generateMockChartData();
      } catch (error) {
        console.error('Erreur lors de la récupération des données de comparaison:', error);
      } finally {
        this.loading = false;
      }
    },
    
    generateMockChartData() {
      
      const labels = [];
      const now = new Date();
      const points = 10;
      
      for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now);
        switch (this.timeRange) {
          case 'hour':
            date.setMinutes(now.getMinutes() - (i * 6)); 
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            break;
          case 'day':
            date.setHours(now.getHours() - (i * 2)); 
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            break;
          case 'week':
            date.setDate(now.getDate() - i); 
            labels.push(date.toLocaleDateString([], { weekday: 'short', day: 'numeric' }));
            break;
          case 'month':
            date.setDate(now.getDate() - (i * 3)); 
            labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            break;
        }
      }
      
      
      const datasets = this.selectedStations.map((stationId, index) => {
        const data = Array(points).fill().map(() => {
          
          switch (this.selectedData) {
            case 'temperature':
              return Math.random() * 10 + 10; // 10-20°C
            case 'humidity':
              return Math.random() * 40 + 40; // 40-80%
            case 'pressure':
              return Math.random() * 20 + 990; // 990-1010 hPa
            case 'wind_speed_avg':
              return Math.random() * 30; // 0-30 km/h
            case 'luminosity':
              return Math.random() * 800 + 200; // 200-1000 Lux
            case 'rain':
              return Math.random() * 20; // 0-20 mm
            default:
              return Math.random() * 100;
          }
        });
        
        return {
          label: this.getStationName(stationId),
          data: data,
          borderColor: this.getChartColor(index),
          backgroundColor: this.getChartColor(index)
        };
      });
      
      this.chartData = {
        labels,
        datasets
      };
      
      // Mettre à jour le graphique
      this.updateChart();
    },
    
    getStationName(stationId) {
      const station = this.stations.find(s => s.id === stationId);
      return station ? station.name : stationId;
    },
    
    getChartColor(index) {
      return this.chartColors[index % this.chartColors.length];
    },
    
    getChartTitle() {
      const dataTypeLabels = {
        temperature: 'Température (°C)',
        humidity: 'Humidité (%)',
        pressure: 'Pression atmosphérique (hPa)',
        wind_speed_avg: 'Vitesse du vent (km/h)',
        luminosity: 'Luminosité (Lux)',
        rain: 'Précipitations (mm)'
      };
      
      const timeLabels = {
        hour: 'dernière heure',
        day: 'dernières 24 heures',
        week: 'dernière semaine',
        month: 'dernier mois'
      };
      
      return `${dataTypeLabels[this.selectedData] || this.selectedData} - ${timeLabels[this.timeRange] || this.timeRange}`;
    },
    
    updateChart() {
      // Attendre que le DOM soit mis à jour
      this.$nextTick(() => {
        try {
          const chartElement = this.$refs.chartCanvas;
          if (!chartElement) {
            console.error("Élément canvas introuvable");
            return;
          }
          
          // Détruire le graphique existant s'il y en a un
          if (this.chart) {
            this.chart.destroy();
            this.chart = null;
          }
          
          // Créer un nouveau graphique avec le type sélectionné (bar ou line)
          const ctx = chartElement.getContext('2d');
          
          // S'assurer que les données sont valides
          if (!this.chartData || !this.chartData.datasets || this.chartData.datasets.length === 0) {
            console.warn("Pas de données disponibles pour le graphique");
            return;
          }
          
          this.chart = new Chart(ctx, {
            type: this.chartType,
            data: this.chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: this.getChartTitle()
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: this.getYAxisTitle()
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date/Heure'
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error("Erreur lors de la création du graphique:", error);
        }
      });
    },
    
    // Retourne le titre de l'axe Y en fonction du type de donnée sélectionné
    getYAxisTitle() {
      const units = {
        temperature: '°C',
        humidity: '%',
        pressure: 'hPa',
        wind_speed_avg: 'km/h',
        luminosity: 'Lux',
        rain: 'mm'
      };
      
      return units[this.selectedData] || '';
    }
  }
}
</script>

<style scoped>
.stations {
  padding: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  min-width: 160px;
}

.compare-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 38px;
  transition: background-color 0.2s;
}

.compare-btn:hover {
  background-color: #0069d9;
}

.stations-selection {
  margin-bottom: 20px;
}

.station-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.station-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
}

.loading-indicator {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.chart-wrapper {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  margin-top: 20px;
  height: 400px;
  position: relative;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #ced4da;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder-content {
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-placeholder-graph {
  flex-grow: 1;
  position: relative;
  border-bottom: 1px solid #ced4da;
  border-left: 1px solid #ced4da;
}

.chart-bar {
  position: absolute;
  bottom: 0;
  transition: height 0.5s ease;
}

.chart-placeholder-note {
  text-align: center;
  margin-top: 20px;
  color: #6c757d;
  font-size: 0.9rem;
}
</style>