// Base URLs pour les différentes stations
const STATION_BASE_URLS = {
  'piensg027': 'http://piensg027.ensg.eu:3000',
  'piensg028': 'http://piensg028.ensg.eu:3000',
  'piensg030': 'http://piensg030.ensg.eu:3000',
  'piensg031': 'http://piensg031.ensg.eu:3000',
  'piensg032': ''
};

const STATION_ENDPOINTS = {
  'piensg027': `${STATION_BASE_URLS['piensg027']}/live`,
  'piensg028': `${STATION_BASE_URLS['piensg028']}/live`,
  'piensg030': `${STATION_BASE_URLS['piensg030']}/live`,
  'piensg031': `${STATION_BASE_URLS['piensg031']}/live`,
  'piensg032': '/live'
};


import mockData from '../../public/mock-data.json';

export async function getStationData(stationId) {

  if (stationId && stationId.target && stationId.target.value) {
    stationId = stationId.target.value;
  }

  if (!stationId) {
    stationId = 'piensg032';
  }


  if (typeof stationId !== 'string') {
    console.error("stationId n'est pas une chaîne valide:", stationId);
    stationId = 'piensg032';
  }

  const stationUrl = STATION_ENDPOINTS[stationId];
  if (!stationUrl) {
    console.error(`Aucune URL définie pour la station ${stationId}`);
    return getMockData(stationId);
  }

  try {
    const response = await fetch(stationUrl);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la requête pour ${stationId}:`, error);
    return getMockData(stationId);
  }
}


export async function getSampleData(stationId, start, end, sensors = '') {

  if (stationId && stationId.target && stationId.target.value) {
    stationId = stationId.target.value;
  }

  if (!stationId || typeof stationId !== 'string') {
    stationId = 'piensg032';
  }

  const baseUrl = STATION_BASE_URLS[stationId] || '';
  let sampleUrl;

  if (end === 'now') {
    sampleUrl = `${baseUrl}/sample/${start}/now`;
  } else {
    sampleUrl = `${baseUrl}/sample/${start}/${end}`;
  }


  if (sensors) {
    sampleUrl += `/${sensors}`;
  }

  try {
    const response = await fetch(sampleUrl);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la requête sample pour ${stationId}:`, error);

    return {
      id: stationId.replace('piensg', ''),
      unit: {},
      data: []
    };
  }
}


function getMockData(stationId) {

  if (typeof stationId !== 'string') {
    console.error("stationId n'est pas une chaîne de caractères:", stationId);
    stationId = 'piensg032';
  }

  const stationNumber = stationId.replace('piensg', '');

  const stationData = mockData.find(station => station.id === parseInt(stationNumber, 10));

  return stationData || {
    id: stationNumber,
    unit: {
      temperature: "C",
      pressure: "hP",
      humidity: "%",
      rain: "mm/m2",
      luminosity: "Lux",
      wind_heading: "°",
      wind_speed_avg: "km/h"
    },
    data: {
      date: new Date().toISOString(),
      temperature: 20,
      pressure: 1013,
      humidity: 50,
      luminosity: 5000,
      wind_heading: 180,
      wind_speed_avg: 10,
      rain: 0
    }
  };
}