<template>
  <div class="sensor-card" :class="{ 'sensor-card--alert': isValueCritical }">
    <div class="sensor-icon">
      <i :class="getIconClass()"></i>
    </div>
    <div class="sensor-content">
      <h3 class="sensor-title">{{ sensorTitle }}</h3>
      <div class="sensor-value">{{ formatValue(value) }}<span class="sensor-unit">{{ unit }}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sensor',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => [
        'temperature',
        'humidity',
        'pressure',
        'luminosity',
        'wind_heading',
        'wind_speed_avg',
        'rain'
      ].includes(value)
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    }
  },
  computed: {
    sensorTitle() {
      const titles = {
        temperature: 'Température',
        humidity: 'Humidité',
        pressure: 'Pression',
        luminosity: 'Luminosité',
        wind_heading: 'Direction du vent',
        wind_speed_avg: 'Vitesse du vent',
        rain: 'Précipitations'
      };
      return titles[this.type] || this.type;
    },
    isValueCritical() {
      if (this.min !== null && this.value < this.min) return true;
      if (this.max !== null && this.value > this.max) return true;
      return false;
    }
  },
  methods: {
    getIconClass() {
      // Ces classes sont fictives - dans un projet réel, utilisez une bibliothèque d'icônes comme Font Awesome
      const icons = {
        temperature: 'icon-temperature',
        humidity: 'icon-humidity',
        pressure: 'icon-pressure',
        luminosity: 'icon-luminosity',
        wind_heading: 'icon-wind-direction',
        wind_speed_avg: 'icon-wind-speed',
        rain: 'icon-rain'
      };
      
      return icons[this.type] || 'icon-default';
    },
    formatValue(value) {
      // Formater la valeur selon le type de capteur
      switch (this.type) {
        case 'temperature':
        case 'humidity':
        case 'pressure':
          // Arrondir à une décimale
          return Number(value).toFixed(1);
        case 'wind_heading':
          // Direction du vent en degrés, arrondi à l'entier
          return Math.round(value);
        case 'wind_speed_avg':
          // Vitesse du vent arrondie à l'entier
          return Math.round(value);
        case 'rain':
          // Précipitations avec deux décimales
          return Number(value).toFixed(2);
        default:
          return value;
      }
    }
  }
};
</script>

<style scoped>
.sensor-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sensor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sensor-card--alert {
  border-left: 4px solid #dc3545;
}

.sensor-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #f8f9fa;
  border-radius: 50%;
  margin-right: 15px;
}

.sensor-content {
  flex: 1;
}

.sensor-title {
  margin: 0 0 8px 0;
  color: #343a40;
  font-size: 1.1rem;
}

.sensor-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #007bff;
}

.sensor-unit {
  font-size: 0.9rem;
  color: #6c757d;
  margin-left: 5px;
  font-weight: normal;
}
</style>