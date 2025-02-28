var express = require('express')
var router = express.Router()


const { InfluxDB, Point } = require('@influxdata/influxdb-client')

// process.env.INFLUXDB_TOKEN
const token = 'bwIx0QUhlQN2Ifvi2rS1pOgqZe9eqgsscBcPMqsQnlZCifNrGGyt8EzkfxwlXwt4U9DwVAS9njL2FRx1VnYiQg==';
const url = 'http://localhost:8086';
const client = new InfluxDB({ url, token });
let org = `ENSG`
let bucket = `db32`
let queryClient = client.getQueryApi(org)
let tableObjects = []
let data = {
  "id": 32, "unit": {
    "temperature": "C",
    "pressure": "hP",
    "humidity": "%",
    "rain": "mm/m2",
    "luminosity": "Lux",
    "wind_heading": "°",
    "wind_speed_avg": "km/h",
    "lat": "DD",
    "lon": "DD"
  },
  "data": {
    date: new Date().toISOString(),
    temperature: null,
    pressure: null,
    humidity: null,
    luminosity: null,
    wind_heading: null,
    wind_speed_avg: null,
    rain: 1,
    lat: null,
    lon: null
  }
};

/* GET users listing. */
router.get('/', function (req, res, next) {
  let queryClient = client.getQueryApi(org)
  let fluxQuery = `from(bucket: "${bucket}")
 |> range(start:  -1y)
 |> last() `

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      let req = tableMeta.toObject(row);
      if (req._measurement == "gps_data") {
        switch (req._field) {
          case 'latitude':
            data.data.lat = req._value;
            break;
          case 'longitude':
            data.data.lon = req._value;
            break;
        }
      }
      if (req._measurement == "weather_sensors") {
        switch (req.sensor) {
          case 'pressure':
            data.data.pressure = req._value;
            break;
          case 'wind_heading':
            data.data.wind_heading = req._value;
            break;
          case 'humidity':
            data.data.humidity = req._value;
            break;
          case 'wind_speed_avg':
            data.data.wind_speed_avg = req._value;
            break;
          case 'temperature':
            data.data.temperature = req._value;
            break;
          case 'luminosity':
            data.data.luminosity = req._value;
            break;
        }
      }
      if (req._measurement == "tph_sensors") {
        switch (req._field) {
          case 'pressure':
            data.data.pressure = req._value;
            break;
          case 'temperature':
            data.data.temperature = req._value;
            break;
          case 'humidity':
            data.data.humidity = req._value;
            break;
        }
      }
    },
    error: (error) => {
      console.error('\nError', error)
      res.header(500).send(error);
    },
    complete: () => {
      console.log(data);
      console.log('\nSuccess');
      res.send(data)
    },
  })
});

router.get('/:list_capteur', function (req, res, next) {
  const requestedSensors = req.params.list_capteur.split('-');

  let filteredData = {
    id: 32,
    unit: {},
    data: {
      date: new Date().toISOString()
    }
  };

  const possibleSensors = {
    'temperature': 'C',
    'pressure': 'hP',
    'humidity': '%',
    'rain': 'mm/m2',
    'luminosity': 'Lux',
    'wind_heading': '°',
    'wind_speed_avg': 'km/h',
    'lat': 'DD',
    'lon': 'DD'
  };

  requestedSensors.forEach(sensor => {
    if (possibleSensors[sensor]) {
      filteredData.unit[sensor] = possibleSensors[sensor];
    }
  });

  let queryClient = client.getQueryApi(org);
  let fluxQuery = `from(bucket: "${bucket}")
    |> range(start: -1y)
    |> last()`;

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      let req = tableMeta.toObject(row);

      if (req._measurement == "gps_data") {
        if (requestedSensors.includes('lat') && req._field == 'latitude') {
          filteredData.data.lat = req._value;
        }
        if (requestedSensors.includes('lon') && req._field == 'longitude') {
          filteredData.data.lon = req._value;
        }
      }

      if (req._measurement == "weather_sensors") {
        const sensorMappings = {
          'pressure': 'pressure',
          'wind_heading': 'wind_heading',
          'humidity': 'humidity',
          'wind_speed_avg': 'wind_speed_avg',
          'temperature': 'temperature',
          'luminosity': 'luminosity',
          'rain': 'rain'
        };

        Object.entries(sensorMappings).forEach(([key, value]) => {
          if (requestedSensors.includes(key) && req.sensor === value) {
            filteredData.data[key] = req._value;
          }
        });
      }

      if (req._measurement == "tph_sensors") {
        if (requestedSensors.includes('pressure') && req._field == 'pressure') {
          filteredData.data.pressure = req._value;
        }
        if (requestedSensors.includes('temperature') && req._field == 'temperature') {
          filteredData.data.temperature = req._value;
        }
        if (requestedSensors.includes('humidity') && req._field == 'humidity') {
          filteredData.data.humidity = req._value;
        }
      }
    },
    error: (error) => {
      console.error('\nError', error);
      res.status(500).send(error);
    },
    complete: () => {
      const validSensors = Object.keys(possibleSensors);
      const hasInvalidSensor = requestedSensors.some(sensor => !validSensors.includes(sensor));

      if (hasInvalidSensor) {
        res.status(400).json({
          message: "A query argument is invalid"
        });
        return;
      }

      console.log(filteredData);
      console.log('\nSuccess');
      res.send(filteredData);
    },
  });
});


module.exports = router