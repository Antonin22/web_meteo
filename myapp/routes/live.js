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
//let data = { "id": 27 ,"data":{}}

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log("oui")
  let queryClient = client.getQueryApi(org)

  let fluxQuery = `from(bucket: "${bucket}")
 |> range(start:  -1m)
 |> filter(fn: (r) => r["_measurement"] == "gps_data")`
  console.log("test");



  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      let req = tableMeta.toObject(row);
      if (req._measurement == "gps_data") {
        switch (req._field) {
          case 'latitude':
            tableObjects.push(req._value);
            break;
        }
        switch (req._field) {
          case 'longitude':
            tableObjects.push(req._value);
            break;
        }
        switch (req._field) {
          case 'speed':
            tableObjects.push(req._value);
            break;
        }
      }

    },
    error: (error) => {
      console.error('\nError', error)
      res.header(500).send(error);
    },
    complete: () => {
      console.log(tableObjects);
      console.log('\nSuccess');
      res.send(tableObjects);
    },
  })

});

module.exports = router