var express = require('express');
var router = express.Router();

const { InfluxDB } = require('@influxdata/influxdb-client');

// Configuration InfluxDB
const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
const client = new InfluxDB({ url, token });
const org = `ENSG`;
const bucket = `db32`;

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

function isValidISODate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toISOString() === dateString;
    } catch (e) {
        return false;
    }
}

function processSensorData(row, tableMeta, requestedSensors, filteredData) {
    const req = tableMeta.toObject(row);

    if (req._measurement == "gps_data") {
        if (requestedSensors.includes('lat') && req._field == 'latitude') {
            filteredData.data.push({
                time: req._time,
                lat: req._value
            });
        }
        if (requestedSensors.includes('lon') && req._field == 'longitude') {
            filteredData.data.push({
                time: req._time,
                lon: req._value
            });
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
                filteredData.data.push({
                    time: req._time,
                    [key]: req._value
                });
            }
        });
    }

    if (req._measurement == "tph_sensors") {
        const sensorMappings = {
            'pressure': 'pressure',
            'temperature': 'temperature',
            'humidity': 'humidity'
        };

        Object.entries(sensorMappings).forEach(([key, value]) => {
            if (requestedSensors.includes(key) && req._field === value) {
                filteredData.data.push({
                    time: req._time,
                    [key]: req._value
                });
            }
        });
    }
}

function organizeTimeSeriesData(data) {
    const timeMap = new Map();

    data.forEach(item => {
        const time = item.time;
        if (!timeMap.has(time)) {
            timeMap.set(time, {});
        }

        Object.keys(item).forEach(key => {
            if (key !== 'time') {
                timeMap.get(time)[key] = item[key];
            }
        });
    });

    const result = [];
    timeMap.forEach((values, time) => {
        result.push({
            time: time,
            ...values
        });
    });

    result.sort((a, b) => new Date(a.time) - new Date(b.time));

    return result;
}

router.get('/:start/now/:list_capteur?', function (req, res, next) {
    const start = req.params.start;
    const sensorList = req.params.list_capteur;

    if (!isValidISODate(start)) {
        return res.status(400).json({
            message: "Invalid start date format. Use ISO format (e.g., 2015-08-23T18:45:00.000Z)"
        });
    }

    let requestedSensors;
    if (sensorList) {
        requestedSensors = sensorList.split('-');
    } else {
        requestedSensors = Object.keys(possibleSensors);
    }

    const validSensors = Object.keys(possibleSensors);
    const hasInvalidSensor = requestedSensors.some(sensor => !validSensors.includes(sensor));

    if (hasInvalidSensor) {
        return res.status(400).json({
            message: "A query argument is invalid"
        });
    }

    let filteredData = {
        id: 32,
        unit: {},
        data: []
    };

    requestedSensors.forEach(sensor => {
        if (possibleSensors[sensor]) {
            filteredData.unit[sensor] = possibleSensors[sensor];
        }
    });

    let queryClient = client.getQueryApi(org);
    let fluxQuery = `from(bucket: "${bucket}")
    |> range(start: ${start})
    |> filter(fn: (r) => r._measurement == "weather_sensors" or r._measurement == "tph_sensors" or r._measurement == "gps_data")`;

    queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
            processSensorData(row, tableMeta, requestedSensors, filteredData);
        },
        error: (error) => {
            console.error('\nError', error);
            res.status(500).send(error);
        },
        complete: () => {
            filteredData.data = organizeTimeSeriesData(filteredData.data);

            console.log('\nSuccess');
            res.send(filteredData);
        },
    });
});

router.get('/:start/:stop/:list_capteur?', function (req, res, next) {
    const start = req.params.start;
    const stop = req.params.stop;
    const sensorList = req.params.list_capteur;

    if (stop === 'now') {
        return next();
    }

    if (!isValidISODate(start) || !isValidISODate(stop)) {
        return res.status(400).json({
            message: "Invalid date format. Use ISO format (e.g., 2015-08-23T18:45:00.000Z)"
        });
    }

    if (new Date(start) >= new Date(stop)) {
        return res.status(400).json({
            message: "Stop date must be after start date"
        });
    }

    let requestedSensors;
    if (sensorList) {
        requestedSensors = sensorList.split('-');
    } else {
        requestedSensors = Object.keys(possibleSensors);
    }

    const validSensors = Object.keys(possibleSensors);
    const hasInvalidSensor = requestedSensors.some(sensor => !validSensors.includes(sensor));

    if (hasInvalidSensor) {
        return res.status(400).json({
            message: "A query argument is invalid"
        });
    }

    let filteredData = {
        id: 32,
        unit: {},
        data: []
    };

    requestedSensors.forEach(sensor => {
        if (possibleSensors[sensor]) {
            filteredData.unit[sensor] = possibleSensors[sensor];
        }
    });

    let queryClient = client.getQueryApi(org);
    let fluxQuery = `from(bucket: "${bucket}")
    |> range(start: ${start}, stop: ${stop})
    |> filter(fn: (r) => r._measurement == "weather_sensors" or r._measurement == "tph_sensors" or r._measurement == "gps_data")`;

    queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
            processSensorData(row, tableMeta, requestedSensors, filteredData);
        },
        error: (error) => {
            console.error('\nError', error);
            res.status(500).send(error);
        },
        complete: () => {
            filteredData.data = organizeTimeSeriesData(filteredData.data);

            console.log('\nSuccess');
            res.send(filteredData);
        },
    });
});

module.exports = router;