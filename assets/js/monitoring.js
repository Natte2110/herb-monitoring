require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point"
], function (
  Map,
  MapView,
  FeatureLayer,
  Point) {

  const getData = (url) => {
    return fetch(url)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .catch(error => console.warn(error));
  }

  const cardClasses = ["top-card", "middle-card", "bottom-card"]
  const monitoringChoices = document.getElementById("monitoring-items");

  const displayMap = (id) => {
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

    const floodMap = () => {
      /**
       * This function is used to create the layers and required items for the flood monitoring map
       * The reason two fetch API calls are used is due to the location and severity data being on different URLs
       */
      getData("https://environment.data.gov.uk/flood-monitoring/id/floodAreas")
        .then(response => {
          let itemsLocation = response.items;

          getData("https://environment.data.gov.uk/flood-monitoring/id/floods")
            .then(response => {
              let itemsSeverity = response.items;
              // console.log(itemsSeverity)
              let merged = [];

              for(let i=0; i<itemsSeverity.length; i++) {
                if (itemsSeverity[i].severityLevel) {
                  itemsLocation.forEach(item => {
                    if (item.fwdCode === itemsSeverity[i].floodAreaID) {
                      item.severityLevel = itemsSeverity[i].severityLevel
                      item.severity = itemsSeverity[i].severity
                      item.timeMessageChanged = itemsSeverity[i].timeMessageChanged
                      merged.push(item);
                    } 
                  });
                }
              }
              
              let features = []; // Empty array that the points will be put into
              let x = 1; //Used for incrementing object ID's

              merged.forEach(item => {
                features.push({
                  geometry: new Point({ x: item.long, y: item.lat }),
                  attributes: { 
                    ObjectID: x, 
                    County: item.County, 
                    description: item.description,
                    eaAreaName: item.eaAreaName,
                    fwdCode: item.fwdCode, 
                    severityLevel: item.severityLevel,
                    severity: item.severity,
                    polygon: item.polygon,
                  }
                })
                x++ // Increment for the object ID's
              })

              const popupCreation = (feature) => {
                const div = document.createElement("div");
                div.innerHTML =
                  `<p>${feature.graphic.attributes.description}</p>
                  <p>This station has a severity level of <b>${feature.graphic.attributes.severityLevel}</b>, with a desciption of <b>${feature.graphic.attributes.severityLevel}</b></p>
                  `
                return div;
              }

              let layer = new FeatureLayer({
                source: features,  // autocast as a Collection of new Graphic()
                objectIdField: "ObjectID",
                fields: [{
                  name: "ObjectID",
                  alias: "ObjectID",
                  type: "oid"
              }, {
                  name: "County",
                  alias: "County",
                  type: "string"
              },
              {
                  name: "description",
                  alias: "description",
                  type: "string"
              },
              {
                  name: "eaAreaName",
                  alias: "eaAreaName",
                  type: "string"
              },
              {
                  name: "fwdCode",
                  alias: "fwdCode",
                  type: "string"
              },
              {
                  name: "severityLevel",
                  alias: "severityLevel",
                  type: "string"
              },
              {
                  name: "severity",
                  alias: "severity",
                  type: "string"
              },
              {
                  name: "polygon",
                  alias: "polygon",
                  type: "string"
              }],
                
              });
              map.layers.add(layer);
            })


        });
    }
    if (id === "flood") {
      floodMap();
    }


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