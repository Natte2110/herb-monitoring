require([
  "esri/Map",
  "esri/views/MapView"
], function (
  Map,
  MapView) {
  
  const cardClasses = ["top-card","middle-card","bottom-card"]
  const monitoringChoices = document.getElementById("monitoring-items");

  const displayMap = (layer) => {
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
  }
  monitoringChoices.addEventListener("click", function (event) {
    let clickedID = event.target.parentElement
    let orderItems = document.getElementsByClassName("monitoring-switch")
    let newOrder = [clickedID.id];
    for (let i = 0; i < orderItems.length; i++) {
      
      if (orderItems[i].id != newOrder[0]) {
        newOrder.push(orderItems[i].id);
      }
    }
    newOrder.forEach(id => {
      let card = document.getElementById(id)
      card.classList.remove(card.classList[1])
      card.classList.add(cardClasses[newOrder.indexOf(id)])
    });
    displayMap(clickedID.id);
  });
  
  displayMap("flood")
});