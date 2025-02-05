new Vue({
    el: '#app',
    data: {
        id: 0,

        data: {
            date: '',
            temperature: 0.0,
            pressure: 0,
            humidity: 0.0,
            lux: 0,
            wind_heading: 0,
            wind_speed_avg: 0,
            hygro: 0.0,
            lat: 43.0,
            long: 2.0
        }
    },
    mounted() {
        console.log("L'instance de Vue fonctionne bien avec les données par défault: ", this.$data);
        this.fetchTestJSON();
        console.log("test de données: ", this.data.temperature)
        console.log("test de données: ", this.data.pressure)
        console.log("test de données: ", this.data.humidity)
        console.log("test de données: ", this.data.lux)
        console.log("test de données: ", this.data.hygro)
        console.log("test de données: ", this.data.lat)
        console.log("test de données: ", this.data.long)

        var map = L.map('map').setView([this.data.lat, this.data.long], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([this.data.lat, this.data.long]).addTo(map)
            .bindPopup('Position de la sonde')
            .openPopup();


        var graphique = document.getElementById('myChart').getContext('2d');
        this.chart = new Chart(graphique, {
            type: 'bar',
            data: {
                labels: ['Points 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
                datasets: [{
                    label: 'Température (°C)',
                    data:[this.data.temperature],
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(25, 120, 120, 1)',
                    borderWitdth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 50,
                            stepSize: 6

                        }
                    }]
                }
            }
        })
    },

    methods: {
        async fetchTestJSON() {
            try {
                const response = await fetch('/mock-data.json');
                if (!response.ok) {
                    throw new Error('Erreur réseau: ' + response.status);
                }
                const json_data = await response.json();
                console.log('JSON de test récupéré avec succès : ', json_data); 
                this.id = json_data.id;
                this.data = json_data.data;  
            } catch(error) {
                console.error('Erreur lors du fetch du JSON de test : ', error);
            }
        }
    }
})