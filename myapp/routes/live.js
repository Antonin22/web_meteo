var express = require('express')
var router = express.Router()


const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = 'http://localhost:8086'
const client = new InfluxDB({ url, token })
let org = `thomas_et_antonin`
let bucket = `db32`
let queryClient = client.getQueryApi(org)
let tableObject
let fluxQuery = `from(bucket: "db32")
...  |> range(start: -10m)
...  |> filter(fn: (r) => r._measurement == "measurement1")`


/* GET users listing. */
router.get('/', function (req, res, next) {
  let queryClient = client.getQueryApi(org)
  let fluxQuery = `from(bucket: "my-bucket")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")`

  queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      tableObject = tableMeta.toObject(row)
      console.log(tableObject)
    },
    error: (error) => {
      console.error('\nError', error)
      res.send(error);
    },
    complete: () => {
      console.log('\nSuccess')
      res.send(tableObject);
    },
  })
  
});




/**
router.get('/init', function(req, res, next) {
  MongoClient.connect(url, function(err, client) {
    if (err) {throw err}
    console.log("Connected successfully to server")
    const db = client.db(dbName)
    db.collection('restaurants').createIndex({ "location" : "2dsphere" }).then((result)=>{
      res.json("Index " + result + " created")
      client.close()
    })
  })
})


router.get('/', function(req, res, next) {
  console.log("test / router");
  MongoClient.connect(url, function(err, client) {
    console.log("Connected successfully to server");
    if (err) {throw err}
    console.log("Connected successfully to server")
    const db = client.db(dbName)
    db.collection('restaurants').find().toArray(function(err, result) {
      if (err) {throw err}
      res.json(result)
      client.close()
    })
  })
  
})




router.get('/intersect/:bbox', function(req, res, next) {
  MongoClient.connect(url, function(err, client) {
    if (err) {throw err}

    let [y1,x1,y2,x2] = req.params.bbox.split(",").map(n=>Number(n))

    let find = { location: { $geoWithin: { $box: [ [ y1,x1 ],[ y2,x2 ] ] } } }

    console.log("look for this bbox : ",find)
    const db = client.db(dbName);

    db.collection('restaurants').find(find).toArray(function(err, result) {
      if (err) {throw err}
      res.json(result)
      client.close()
    })
  })
})

**/


module.exports = router