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
let tableObject


/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log("oui")
  let queryClient = client.getQueryApi(org)
  let fluxQuery = `from(bucket: "${bucket}")
 |> range(start: -6h)
 |> filter(fn: (r) => r._measurement == "measurement1")`

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      tableObject = tableMeta.toObject(row)
      console.log(tableObject)
    },
    error: (error) => {
      console.error('\nError', error)
      res.header(500).send(error);
    },
    complete: () => {
      console.log('\nSuccess')
      res.send(tableObject);
    },
  })
  
});

module.exports = router