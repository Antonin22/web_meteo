/**
 * Service API pour communiquer avec le backend météo
 */

// Définir l'URL de base pour l'API
// En développement, le proxy de Vite s'occupera de rediriger les requêtes
const API_BASE_URL = '';

/**
 * Récupère les données en temps réel de tous les capteurs
 * @returns {Promise} Données météo en temps réel
 */
export async function getLiveData() {
  try {
    const response = await fetch(`${API_BASE_URL}/live`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données en temps réel:', error);
    throw error;
  }
}

/**
 * Récupère les données en temps réel pour des capteurs spécifiques
 * @param {Array} sensors - Liste des capteurs (temperature, pressure, humidity, etc.)
 * @returns {Promise} Données des capteurs spécifiés
 */
export async function getLiveSensorData(sensors) {
  try {
    const sensorList = Array.isArray(sensors) ? sensors.join('-') : sensors;
    const response = await fetch(`${API_BASE_URL}/live/${sensorList}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données capteurs:', error);
    throw error;
  }
}

/**
 * Récupère les données historiques à partir d'une date jusqu'à maintenant
 * @param {string} startDate - Date de départ au format ISO
 * @returns {Promise} Données historiques
 */
export async function getSampleData(startDate) {
  try {
    const response = await fetch(`${API_BASE_URL}/sample/${startDate}/now`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données historiques:', error);
    throw error;
  }
}

/**
 * Récupère les données historiques pour des capteurs spécifiques à partir d'une date jusqu'à maintenant
 * @param {string} startDate - Date de départ au format ISO
 * @param {Array} sensors - Liste des capteurs (temperature, pressure, humidity, etc.)
 * @returns {Promise} Données historiques des capteurs spécifiés
 */
export async function getSampleSensorData(startDate, sensors) {
  try {
    const sensorList = Array.isArray(sensors) ? sensors.join('-') : sensors;
    const response = await fetch(`${API_BASE_URL}/sample/${startDate}/now/${sensorList}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données historiques capteurs:', error);
    throw error;
  }
}

/**
 * Récupère les données historiques entre deux dates
 * @param {string} startDate - Date de départ au format ISO
 * @param {string} endDate - Date de fin au format ISO
 * @returns {Promise} Données historiques
 */
export async function getSampleRangeData(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE_URL}/sample/${startDate}/${endDate}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données historiques:', error);
    throw error;
  }
}

/**
 * Récupère les données historiques pour des capteurs spécifiques entre deux dates
 * @param {string} startDate - Date de départ au format ISO
 * @param {string} endDate - Date de fin au format ISO
 * @param {Array} sensors - Liste des capteurs (temperature, pressure, humidity, etc.)
 * @returns {Promise} Données historiques des capteurs spécifiés
 */
export async function getSampleRangeSensorData(startDate, endDate, sensors) {
  try {
    const sensorList = Array.isArray(sensors) ? sensors.join('-') : sensors;
    const response = await fetch(`${API_BASE_URL}/sample/${startDate}/${endDate}/${sensorList}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données historiques capteurs:', error);
    throw error;
  }
}