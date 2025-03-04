<template>
    <div class="station-selector">
      <label for="station">Sélectionner une station:</label>
      <select id="station" v-model="selected" @change="onChange">
        <option v-for="station in stations" :key="station.id" :value="station.id">
          {{ station.name }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StationSelector',
    data() {
      return {
        selected: 'piensg032',
        stations: [
          { id: 'piensg027', name: 'Station 27' },
          { id: 'piensg028', name: 'Station 28' },
          { id: 'piensg030', name: 'Station 30' },
          { id: 'piensg031', name: 'Station 31' },
          { id: 'piensg032', name: 'Station 32' }
        ]
      }
    },
    methods: {
      onChange(event) {
        this.$emit('change', this.selected)
      }
    }
  }
  </script>