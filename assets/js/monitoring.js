require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",
  "esri/core/reactiveUtils",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/Search",
  "esri/widgets/Expand"
], function (
  Map,
  MapView,
  FeatureLayer,
  Point,
  reactiveUtils,
  GeoJSONLayer,
  BasemapToggle,
  Home,
  Locate,
  Search,
  Expand) {
  
  const getData = (url) => {
    return fetch(url)
      .then((response) => response.json())
      .then((responseData) => {
        return responseData;
      })
      .catch(error => console.warn(error));
  };

  const updateInfo = (info) => {
    let div = document.getElementById("information");
    div.innerHTML = info;
  };
  const cardClasses = ["top-card", "bottom-card"];
  const monitoringChoices = document.getElementById("monitoring-items");

  document.getElementById('site-nav').style.backgroundColor = "rgb(40, 45, 50)";
  
  const displayMap = (id) => {
    /**
     * This function creates a map with the given monitoring layer and displays it in the "monitoring-map" div.
     */
   
    const addInfoDiv = () => {
      let screenWidth = screen.width;
      let infoExpanded = false;
      
      if (screenWidth <= 720 && infoExpanded === false ) {
        view.ui.remove(infoDiv);
        view.ui.add(expandInfo, "top-right");
        infoDiv.style.width = "100%";
        infoExpanded = true;
      } else {
        view.ui.remove(expandInfo);
        view.ui.add(infoDiv, "top-right");
        infoDiv.style.width = "35%";
        infoExpanded = false;
      }
      infoDiv.style.display = "block";
    };

    const map = new Map({
      basemap: "dark-gray-vector" // basemap styles service
    });

    const view = new MapView({
      map: map,
      center: [-4, 54], // Longitude, latitude
      zoom: 5, // Zoom level
      container: "monitoring-map" // Div element
    });

    let basemapToggle = new BasemapToggle({
      view: view,
      nextBasemap: "satellite"
    });
    view.ui.add(basemapToggle, "bottom-left");

    let viewReset = new Home({
      view: view
    });
    view.ui.add(viewReset, "top-left");

    let locateWidget = new Locate({
      view: view,   // Attaches the Locate button to the view
    });
    view.ui.add(locateWidget, "top-left");

    const searchWidget = new Search({
      view: view
    });
    view.ui.add(searchWidget, {
      position: "top-left",
      index: 0
    });

    view.ui.add(monitoringChoices, "bottom-right");
    
    window.addEventListener('resize', addInfoDiv);
    let infoDiv = document.getElementById("information");

    const expandInfo = new Expand({
      view: view,
      content: infoDiv,
      expanded: false,
      expandIconClass: "esri-icon-notice-round"
    });
    addInfoDiv();
    monitoringChoices.style.display = "block";

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
              updateInfo(`
                <h1>Flood Alerts</h1>
                <p>This map displays potential flood alerts</p>
                <p>Click on any monitoring station on the map to display it's information and to show the potential flooding area</p>
              `);
              let itemsSeverity = response.items;
              let merged = [];

              for (let i = 0; i < itemsSeverity.length; i++) {
                if (itemsSeverity[i].severityLevel) {
                  itemsLocation.forEach(item => {
                    if (item.fwdCode === itemsSeverity[i].floodAreaID) {
                      item.severityLevel = itemsSeverity[i].severityLevel;
                      item.severity = itemsSeverity[i].severity;
                      item.timeMessageChanged = itemsSeverity[i].timeMessageChanged;
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
                    timeMessageChanged: item.timeMessageChanged
                  }
                });
                x++; // Increment for the object ID's
              });

              const popupCreation = (feature) => {
                const div = document.createElement("div");
                div.innerHTML =
                  `
                  <p>Click the buttons above to display the possible flood area</p>
                  <p>${feature.graphic.attributes.description}</p>
                  <p>This station has a severity level of <b>${feature.graphic.attributes.severityLevel}</b>, with a desciption of <b>"${feature.graphic.attributes.severity}".</b></p>
                  <p>This warning was last updated - <b>${feature.graphic.attributes.timeMessageChanged}</b></p>
                  `;
                return div;
              };

              reactiveUtils.on(
                () => view.popup,
                "trigger-action",
                (event) => {
                  if (event.action.id === "show-polygon") {
                    showPolygon();
                  }
                }
              ); // ESRI Reactive utils, processes a click on the esri popup window within the map

              const showPolygon = () => {
                /**
                 * This function will be used to display the flood area of the alert to the user.
                 */
                let polygon = (view.popup.features[0].attributes.polygon).replace(/^http:/, "https:");
                getData(polygon).then(response => {
                  // create a new blob from geojson to be used in the layer
                  const blob = new Blob([JSON.stringify(response)], {
                    type: "application/json"
                  });
                  const url = URL.createObjectURL(blob);
                  // create new geojson layer using the blob url
                  const floodArea = new GeoJSONLayer({
                    url: url,
                    renderer: {
                      type: "simple",
                      symbol: {
                        type: "simple-fill",
                        color: [52, 235, 232, 0.3],
                      }
                    }
                  });

                  view.goTo({
                    target: view.popup.features[0],
                    zoom: 12
                  }, {
                    duration: 1000
                  }); // Zooms to selected flood alert station
                  map.layers.removeAll();
                  map.layers.add(floodArea);
                  map.layers.add(layer);
                });
              };
              // Represents the way that this action will be displayed on the popup window
              const showPolygonAction = {
                title: "Show Flood Area",
                id: "show-polygon",
                className: "esri-icon-polygon"
              };

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
                },
                {
                  name: "timeMessageChanged",
                  alias: "timeMessageChanged",
                  type: "string"
                }],
                popupTemplate: {
                  title: "{eaAreaName}",
                  content: popupCreation,
                  outFields: ["*"],
                  actions: [showPolygonAction]
                },
                opacity: 0.5
              });

              layer.renderer = {
                type: "unique-value",
                field: "severityLevel",
                defaultSymbol: { type: "simple-marker" },
                uniqueValueInfos: [{
                  value: "4",
                  symbol: {
                    type: "simple-marker",
                    color: "green"
                  }
                }, {
                  value: "3",
                  symbol: {
                    type: "simple-marker",
                    color: "yellow"
                  }
                }, {
                  value: "2",
                  symbol: {
                    type: "simple-marker",
                    color: "orange"
                  }
                }],
              };
              map.layers.add(layer);
            });
        });
    };

    const trafficMap = () => {
      updateInfo(`
                <h1>Traffic Incidents</h1>
                <p>This map displays reports of traffic incidents</p>
                <p>To begin, zoom in to the location you wish to check</p>
                <p>Then, click on any report to view further information about it</p>
              `);
      getData("https://dev.virtualearth.net/REST/v1/Traffic/Incidents/49.053718,%20-10.617814,59.750557,%201.719574?key=AuM3m0_KAmQfqGO_JP0EZxptg28hb51uKRQBmECaiMnaiw0IPPjF1KlQ77JWPTU4")
        .then(response => {
          const incidentTypes = {
            1: "Accident",
            2: "Congestion",
            3: "Disabled Vehicle",
            4: "Mass Transit",
            5: "Miscellaneous",
            6: "Other News",
            7: "Planned Event",
            8: "Road Hazard",
            9: "Construction",
            10: "Alert",
            11: "Weather",
          };
          const incidentSeverity = {
            1: "Low Impact",
            2: "Minor",
            3: "Moderate",
            4: "Serious",
          };
          let trafficReports = response.resourceSets[0].resources;
          let features = [];
          let x = 1;
          trafficReports.forEach(item => {
            features.push({
              geometry: new Point({ x: item.point.coordinates[1], y: item.point.coordinates[0] }),
              attributes: {
                ObjectID: x,
                description: item.description,
                roadClosed: item.roadClosed,
                severity: item.severity,
                severityScore: incidentSeverity[item.severity],
                type: incidentTypes[item.type],
                title: item.title,
                icon: item.icon
              }
            });
            x++; // Increment for the object ID's
          });
          let heatmapLayer = new FeatureLayer({
            source: features,
            objectIdField: "ObjectID",
            fields: [{
              name: "ObjectID",
              alias: "ObjectID",
              type: "oid"
            },
            {
              name: "severity",
              alias: "severity",
              type: "string"
            }],
            renderer: {
              type: "heatmap",
              field: "severity",
              colorStops: [
                { ratio: 0, color: "rgba(255, 255, 255, 0)" },
                { ratio: 1, color: "rgba(255, 67, 14, 0.7)" },
                { ratio: 0.8, color: "rgba(255, 145, 14, 0.7)" },
                { ratio: 0.5, color: "rgba(246, 207, 8, 0.7)" },
                { ratio: 0.2, color: "rgba(237, 243, 2, 0.7)" }
              ],
              minDensity: 0,
              maxDensity: 0.3,
              radius: 15,
              legendOptions: {
                title: "Traffic",
                minLabel: "Less Traffic",
                maxLabel: "More Traffic"
              }
            }
          });
          map.layers.add(heatmapLayer);

          const popupCreation = (feature) => {
            const div = document.createElement("div");
            div.innerHTML =
              `<p>${feature.graphic.attributes.description}</p>
              <p>This report has been declared as <b>${feature.graphic.attributes.type}</b>, with a severity of <b>${feature.graphic.attributes.severityScore}.</b></p>
              <p>Road Closed - <b>${feature.graphic.attributes.roadClosed}</b></p>
              `;
            return div;
          };

          let layer = new FeatureLayer({
            source: features,
            objectIdField: "ObjectID",
            fields: [{
              name: "ObjectID",
              alias: "ObjectID",
              type: "oid"
            }, {
              name: "description",
              alias: "description",
              type: "string"
            },
            {
              name: "roadClosed",
              alias: "roadClosed",
              type: "string"
            },
            {
              name: "severity",
              alias: "severity",
              type: "string"
            },
            {
              name: "severityScore",
              alias: "severityScore",
              type: "string"
            },
            {
              name: "type",
              alias: "type",
              type: "string"
            },
            {
              name: "title",
              alias: "title",
              type: "string"
            },
            {
              name: "icon",
              alias: "icon",
              type: "string"
            }],
            minScale: 1000000,
            popupTemplate: {
              title: "{title}",
              content: popupCreation,
              outFields: ["*"]
            },
            renderer: {
              type: "unique-value",
              field: "severity",
              defaultSymbol: { type: "simple-marker" },
              uniqueValueInfos: [{
                value: "4",
                symbol: {
                  type: "simple-marker",
                  color: "red"
                }
              }, {
                value: "3",
                symbol: {
                  type: "simple-marker",
                  color: "orange"
                }
              }, {
                value: "2",
                symbol: {
                  type: "simple-marker",
                  color: "yellow"
                }
              }, {
                value: "1",
                symbol: {
                  type: "simple-marker",
                  color: "green"
                }
              }],
            },
            opacity: 0.5
          });
          map.layers.add(layer);
        });
    };
    if (id === "flood") { floodMap(); }
    if (id === "traffic") { trafficMap(); }
  };
  monitoringChoices.addEventListener("click", function (event) {
    /**
     * This section creates an event listener for the entire card stack.
     * If any of these cards within the stack are clicked, the exact card's ID is used.
     * The next part removes the card organisation classes from each card, before reordering and reapplying 
     * the organisation classes afterwards.
     */
    let clickedID = event.target.parentElement;
    let orderItems = document.getElementsByClassName("monitoring-switch");
    let newOrder = [clickedID.id];
    for (let i = 0; i < orderItems.length; i++) {
      if (orderItems[i].id != newOrder[0]) {
        newOrder.push(orderItems[i].id);
      }
    }
    newOrder.forEach(id => {
      let card = document.getElementById(id);
      card.classList.remove(card.classList[1]);
      card.classList.add(cardClasses[newOrder.indexOf(id)]);
    });

    displayMap(clickedID.id);
  });

  displayMap("flood");
});