const fs = require('fs');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';
const client = new InfluxDB({ url, token });
const writeClient = client.getWriteApi('ENSG', 'db32', 'ns');


function readSensorsFile() {
    console.log("oui readSensorsFile");
    fs.readFile('./dev/shm/sensors', 'utf8', (error, data) => {  
        if (error) {
            console.error('Erreur lecture sensors:', error);
            return;
        }

        try {
            const sensors = JSON.parse(data);
            sensors.measure.forEach(measure => {
                const point = new Point('weather_sensors')
                    .tag('sensor', measure.name)
                    .floatField('value', parseFloat(measure.value))
                    .timestamp(new Date(sensors.date));
                writeClient.writePoint(point);
            });
        } catch (parseError) {
            console.error('Erreur parsing sensors:', parseError);
        }
    });
}

function readRainCounterFile() {
    console.log("oui readRainCounterFile");
    fs.readFile('./dev/shm/rainCounter.log', 'utf8', (error, data) => {
        if (error) {
            console.error('Erreur lecture rainCounter:', error);
            return;
        }

        try {
            const timestamp = new Date(data.trim());
            const point = new Point('rain_counter')
                .floatField('event', 1)
                .timestamp(timestamp);
            writeClient.writePoint(point);
        } catch (parseError) {
            console.error('Erreur parsing rainCounter:', parseError);
        }
    });
}

function readGPSFile() {
    console.log("oui readGPSFile");
    fs.readFile('./dev/shm/gpsNmea', 'utf8', (error, data) => {
        if (error) {
            console.error('Erreur lecture GPS:', error);
            return;
        }

        try {
            const lines = data.split('\n');
            for (const line of lines) {
                if (line.startsWith('$GPRMC')) {
                    const parts = line.split(',');
                    if (parts[2] === 'A') { 
                        const latitude = parseFloat(parts[3]) / 100;
                        const longitude = parseFloat(parts[5]) / 100;
                        const speed = parseFloat(parts[7]);
                        
                        const point = new Point('gps_data')
                            .floatField('latitude', latitude)
                            .floatField('longitude', longitude)
                            .floatField('speed', speed)
                            .timestamp(new Date());
                        writeClient.writePoint(point);
                    }
                }
            }
        } catch (parseError) {
            console.error('Erreur parsing GPS:', parseError);
        }
    });
}

function readTPGFile() {
    console.log("oui readTPGFile");
    fs.readFile('./dev/shm/tpg.log', 'utf8', (error, data) => {
        if (error) {
            console.error('Erreur lecture TPG:', error);
            return;
        }

        try {
            const tpg = JSON.parse(data);
            const point = new Point('tpg_sensors')
                .floatField('temperature', tpg.temp)
                .floatField('humidity', tpg.hygro)
                .floatField('pressure', tpg.press)
                .timestamp(new Date(tpg.date));
            writeClient.writePoint(point);
        } catch (parseError) {
            console.error('Erreur parsing TPG:', parseError);
        }
    });
}

function checkFiles() {
    console.log("oui checkFiles");
    readSensorsFile();

    readRainCounterFile();

    readGPSFile();

    //readTPGFile();
}

setInterval(checkFiles, 30000);

checkFiles();