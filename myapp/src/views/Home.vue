<template>
    <div class="home">
      <h2>Données météo en temps réel</h2>
      <station-selector @change="onStationChange"></station-selector>
      <Dashboard :stationId="selectedStation" />
    </div>
  </template>
  
  <script>
  import Dashboard from '@/components/Dashboard.vue'
  import StationSelector from '@/components/StationSelector.vue'
  
  export default {
    name: 'Home',
    components: {
      Dashboard,
      StationSelector
    },
    data() {
      return {
        selectedStation: 'piensg032'
      }
    },
    methods: {
      onStationChange(station) {
        this.selectedStation = station
      }
    }
  }
  </script>