require([
  "esri/Map",
  "esri/views/MapView"
], function (
  Map,
  MapView) {

  const getData = (url) => {
    return fetch(url)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .catch(error => console.warn(error));
  }

  getData("https://environment.data.gov.uk/flood-monitoring/id/floods").then(response => console.log(response));
  const cardClasses = ["top-card", "middle-card", "bottom-card"]
  const monitoringChoices = document.getElementById("monitoring-items");

  const displayMap = (layer) => {
    /**
     * This function creates a map with the given monitoring layer and displays it in the "monitoring-map" div.
     */
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
    /**
     * This section creates an event listener for the entire card stack.
     * If any of these cards within the stack are clicked, the exact card's ID is used.
     * The next part removes the card organisation classes from each card, before reordering and reapplying 
     * the organisation classes afterwards.
     */
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