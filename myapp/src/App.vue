<template>
    <div id="app">
      <header>
        <h1>Dashboard Météo</h1>
        <nav>
          <router-link to="/">Accueil</router-link> |
          <router-link to="/stations">Stations</router-link> |
          <router-link to="/map">Carte</router-link>
        </nav>
      </header>
      <main>
        <router-view></router-view>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App'
  }
  </script>
  
  <style>
  /* Vous pouvez importer vos styles globaux ici */
  @import '../public/stylesheets/style.css';
  </style>