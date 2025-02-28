# Dashboard Météo 

Ce projet est une application web qui affiche des données météorologiques en temps réel et historiques, récupérées à partir d'un backend Express.js.

## Structure du projet

- `/src` : Code source du frontend Vue.js
  - `/components` : Composants réutilisables
  - `/views` : Pages principales de l'application
  - `/services` : Services pour les appels API
- `/public` : Fichiers statiques
- `/routes` : Routes du backend (Express.js)

## Installation

```bash
# Installer les dépendances
npm install

# Installer les bibliothèques pour les graphiques et cartes
npm install chart.js vue-chartjs leaflet
```

## Commandes disponibles

```bash
# Lancer le serveur de développement Vue.js (frontend uniquement)
npm run dev

# Lancer le serveur backend Express.js
npm run start

# Lancer à la fois le frontend et le backend
npm run dev:all

# Construire l'application pour la production
npm run build
```

## Développement

### Interface utilisateur
Le frontend est construit avec Vue.js 3 et comprend les pages suivantes :
- **Accueil** : Affiche les données météo en temps réel d'une station sélectionnée
- **Stations** : Compare les données entre différentes stations
- **Carte** : Affiche l'emplacement des stations sur une carte

### API backend
L'API backend est documentée dans le fichier Swagger (`pimeteo.yaml`). Les principaux endpoints sont :

- `/live` : Données météo en temps réel
- `/live/{list_capteur}` : Données en temps réel de capteurs spécifiques
- `/sample/{start}/now` : Données historiques à partir d'une date jusqu'à maintenant
- `/sample/{start}/{stop}` : Données historiques entre deux dates

### Bibliothèques utilisées
- **Vue.js** : Framework JavaScript pour l'interface utilisateur
- **Vue Router** : Routage côté client
- **Chart.js** : Création de graphiques
- **Leaflet** : Cartes interactives
- **Express.js** : Framework backend pour l'API

## Déploiement
Pour déployer l'application en production :

1. Exécutez `npm run build` pour générer les fichiers statiques dans le dossier `/public/dist`
2. Le serveur Express est configuré pour servir ces fichiers statiques

## Notes importantes
- Pour l'intégration avec le backend, assurez-vous que les appels API dans `/services/api.js` sont correctement configurés
- La carte utilise Leaflet qui nécessite l'ajout d'une feuille de style CSS (voir commentaires dans Map.vue)
- En développement, certaines fonctionnalités utilisent des données mockées pour faciliter les tests