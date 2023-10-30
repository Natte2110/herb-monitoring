require([
    "esri/Map", 
    "esri/views/MapView"
], function( 
    Map, 
    MapView) {

    const monitoringChoices = document.getElementById("monitoring-items");
    const map = new Map({
      basemap: "dark-gray-vector" // basemap styles service
    });

    const view = new MapView({
      map: map,
      center: [-4, 54], // Longitude, latitude
      zoom: 5, // Zoom level
      container: "monitoring-map" // Div element
    });

    view.ui.add(monitoringChoices, "bottom-right")
  });