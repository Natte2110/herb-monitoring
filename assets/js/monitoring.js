require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",
  "esri/core/reactiveUtils",
  "esri/layers/GeoJSONLayer",
  "esri/symbols/WebStyleSymbol"
], function (
  Map,
  MapView,
  FeatureLayer,
  Point,
  reactiveUtils,
  GeoJSONLayer,
  WebStyleSymbol) {

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
    let infoDiv = document.getElementById("information");
    view.ui.add(infoDiv, "top-right");
    infoDiv.style.display = "block";
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
              let itemsSeverity = response.items;
              // console.log(itemsSeverity)
              let merged = [];

              for (let i = 0; i < itemsSeverity.length; i++) {
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
                    timeMessageChanged: item.timeMessageChanged
                  }
                })
                x++ // Increment for the object ID's
              })

              const popupCreation = (feature) => {
                const div = document.createElement("div");
                div.innerHTML =
                  `<p>${feature.graphic.attributes.description}</p>
                  <p>This station has a severity level of <b>${feature.graphic.attributes.severityLevel}</b>, with a desciption of <b>"${feature.graphic.attributes.severity}".</b></p>
                  <p>This warning was last updated - <b>${feature.graphic.attributes.timeMessageChanged}</b></p>
                  `
                return div;
              }

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
                let polygon = view.popup.features[0].attributes.polygon
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
                      type: "simple",  // autocasts as new SimpleRenderer()
                      symbol: {
                        type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
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
                  map.layers.removeAll()
                  map.layers.add(floodArea)
                  map.layers.add(layer)
                });
              }
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
            })


        });
    }

    const weatherMap = () => {
      const apiKey = 'cd728bac-11c4-48d4-b7d1-42248c13f9fe'
      getData(`http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/sitelist?key=${apiKey}`).then(response => {

        const stationsData = response.Locations.Location;
        console.log(stationsData)

        let features = []; // Empty array that the points will be put into
        let x = 1; //Used for incrementing object ID's

        stationsData.forEach(item => {
          features.push({
            geometry: new Point({ x: item.longitude, y: item.latitude }),
            attributes: {
              ObjectID: x,
              id: item.id,
              name: item.name,
              unitaryAuthArea: item.unitaryAuthArea,
            }
          })
          x++ // Increment for the object ID's
        })

        const popupCreation = (feature) => {
          const div = document.createElement("div");
          getData(`http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/${feature.graphic.attributes.id}?res=daily&key=${apiKey}`).then(response => {
            let params = response.SiteRep.Wx.Param;
            let reports = response.SiteRep.DV.Location.Period

            let todayDay = response.SiteRep.DV.Location.Period[0].Rep[0];
            let todayNight = response.SiteRep.DV.Location.Period[0].Rep[1];
            let unitReplace = {"C":"°C","compass":"","mph":" mph","%":"%","":""}
            function generateTableRow(param) {
              if (todayDay[param.name]) {
                return `
                <tr>
                  <td>${param.$}</td>
                  <td>${todayDay[param.name]}${unitReplace[param.units]}</td>
                </tr>
              `;
              }
            }
            
            const rows = params.map(generateTableRow).join("");
            
            div.innerHTML = `
                <p>Please see today's weather report below</p>
                <table class="weather-table">
                  <tr>
                    <th>Title</th>
                    <th>Value</th>
                  </tr>
                  ${rows}
                </table>
              `;
          }).catch(error => { div.innerHTML = "<p>Cannot gather weather information" })

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
            name: "id",
            alias: "id",
            type: "string"
          },
          {
            name: "name",
            alias: "name",
            type: "string"
          },
          {
            name: "unitaryAuthArea",
            alias: "unitaryAuthArea",
            type: "string"
          }],
          popupTemplate: {
            title: "{name}",
            content: popupCreation,
            outFields: ["*"]
          },
          renderer: {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              size: 10,
              color: [50,211,211],
              outline: {  // autocasts as new SimpleLineSymbol()
                width: 0.5,
                color: "white"
              }
            }
          },
          opacity: 0.5
        });
        map.layers.add(layer);
      })
    }

    const trafficMap = () => {
      getData("https://dev.virtualearth.net/REST/v1/Traffic/Incidents/49.053718,%20-10.617814,59.750557,%201.719574?key=AuM3m0_KAmQfqGO_JP0EZxptg28hb51uKRQBmECaiMnaiw0IPPjF1KlQ77JWPTU4")
      .then(response => {
        let trafficReports = response.resourceSets[0].resources
        let features = [];
        let x = 1;
        trafficReports.forEach(item => {
          // console.log(item)
          features.push({
            geometry: new Point({ x: item.point.coordinates[1], y: item.point.coordinates[0] }),
            attributes: {
              ObjectID: x,
              description: item.description,
              start: item.start,
              end: item.end,
              lastModified: item.lastModified,
              roadClosed: item.roadClosed,
              severity: item.severity,
              severityScore: item.severityScore,
              type: item.type,
              title: item.title,
              icon: item.icon,
            }
          })
          x++ // Increment for the object ID's
        })
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
            name: "start",
            alias: "start",
            type: "string"
          },
          {
            name: "end",
            alias: "end",
            type: "string"
          },
          {
            name: "lastModified",
            alias: "lastModified",
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
      })
    }
    if (id === "flood") { floodMap() };
    if (id === "weather") { weatherMap() };
    if (id === "traffic") { trafficMap() };
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