new Vue({
    el: '#app',
    data: {
      id: 0,
      unit: {
        temperature: '',
        pressure: '',
        humidity: '',
        rain: '',
        luminosity: '',
        wind_heading: '',
        wind_speed_avg: '',
        lat: '',
        lon: ''
      },
      data: {
        date: '',
        temperature: 0.0,
        pressure: 0,
        humidity: 0.0,
        luminosity: 0,
        wind_heading: 0,
        wind_speed_avg: 0,
        rain: 0.0,
        lat: 0.0,
        lon: 0.0
      },
      chart: null,
      timeLabels: [],
      temperatureData: []
    },
    mounted() {
      console.log("L'instance de Vue fonctionne bien avec les données par défaut: ", this.$data);
      this.fetchTestJSON(); // Récupérer les données initiales
      this.createChart(); // Créer le graphique initial
      this.startUpdatingData(); // Démarrer la mise à jour régulière des données
    },
    methods: {
      // Récupérer les données
      async fetchTestJSON() {
        try {
          const response = await fetch('/mock-data.json');
          if (!response.ok) {
            throw new Error('Erreur réseau: ' + response.status);
          }
          const json_data = await response.json();
          console.log('JSON de test récupéré avec succès : ', json_data);
  
          // Mettre à jour les données et les unités
          this.id = json_data.id;
          this.unit = json_data.unit;
          this.data = json_data.data;
  
          // Mise à jour du graphique après récupération des données
          this.timeLabels.push(new Date().toLocaleTimeString());
          this.temperatureData.push(this.data.temperature);
          this.chart.update();
  
          // Vérifier les coordonnées avant d'initialiser la carte
          if (this.data.lat && this.data.lon) {
            var map = L.map('map').setView([this.data.lat, this.data.lon], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
  
            L.marker([this.data.lat, this.data.lon]).addTo(map)
              .bindPopup('Position de la sonde')
              .openPopup();
          } else {
            console.error('Les coordonnées sont invalides');
          }
        } catch (error) {
          console.error('Erreur lors du fetch du JSON de test : ', error);
        }
      },
  
      // Créer le graphique
      createChart() {
        var graphique_temp = document.getElementById('myChart').getContext('2d');
        this.chart = new Chart(graphique_temp, {
          type: 'line',
          data: {
            labels: this.timeLabels,
            datasets: [{
              label: 'Température (°C)',
              data: this.temperatureData,
              backgroundColor: 'rgba(75, 192, 192, 1)',
              borderColor: 'rgba(25, 120, 120, 1)',
              borderWidth: 2,
              pointRadius: 5,
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                ticks: {
                  beginAtZero: false,
                  stepSize: 5
                }
              }
            }
          }
        });
      },
  
      // Mise à jour régulière des données
      startUpdatingData() {
        setInterval(() => {
          this.fetchTestJSON(); // Mettre à jour les données avec un nouvel appel fetch
  
          // Ajouter la nouvelle température et l'heure au graphique
          this.timeLabels.push(new Date().toLocaleTimeString());
          this.temperatureData.push(this.data.temperature);
  
          // Si le tableau dépasse une certaine taille, on peut enlever les valeurs les plus anciennes
          if (this.timeLabels.length > 10) {
            this.timeLabels.shift();
            this.temperatureData.shift();
          }
  
          this.chart.update(); // Mettre à jour le graphique
        }, 60000); // Mise à jour toutes les minutes
      }
    }
  });
  