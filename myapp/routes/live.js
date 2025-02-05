var express = require('express')
var router = express.Router()


const { InfluxDB, Point } = require('@influxdata/influxdb-client')

// process.env.INFLUXDB_TOKEN
const token = process.env.INFLUXDB_TOKEN
const url = 'http://localhost:8086'
const client = new InfluxDB({ url, token })
let org = `ENSG`
let bucket = `db32`
let queryClient = client.getQueryApi(org)
let tableObjects = []
let data = { "id": 32 ,"unit": {
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
  "data":{
  date:new Date().toISOString(),
  temperature:null,
  pressure:null,
  humidity:null,
  luminosity:null,
  wind_heading:null,
  wind_speed_avg:null,
  lat:null,
  long:null
}};

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
            data.data.long = req._value;
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

module.exports = router