// initialize info modal and show it on pageload
const modal = new bootstrap.Modal(document.getElementById('infoModal'));
modal.show();

mapboxgl.accessToken = 'pk.eyJ1IjoibmdvdHRsaWViIiwiYSI6ImNrdm9vNGh3ODB3ZTkybm1vdHFmajVsNXIifQ.O3HhHIdFv0L_5FreT4GLjA';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/ngottlieb/ckvon6g8z3zkn14nlih101iiv', // style URL
  center: [-125.701, 54.916], // starting position [lng, lat]
  zoom: 7 // starting zoom
});

let layerDefinitions;
let activeLayer;
let popup;

// set up basemap toggler
document.getElementById('btnTopo').addEventListener('click', () => {
  map.setStyle("mapbox://styles/ngottlieb/ckvon6g8z3zkn14nlih101iiv");
});
document.getElementById('btnSatellite').addEventListener('click', () => {
  map.setStyle("mapbox://styles/ngottlieb/ckvr2twtx00dc14tbqmwjrgt0");
});

// set up overlay caret to flip when main area is hidden (on small screens)
document.getElementById('overlayCollapse').addEventListener('hide.bs.collapse', () => {
  document.getElementById('downCaret').style = "";
  document.getElementById('upCaret').style = "display: none;";
});

document.getElementById('overlayCollapse').addEventListener('show.bs.collapse', () => {
  document.getElementById('downCaret').style = "display: none;";
  document.getElementById('upCaret').style = "";
});

map.on('load', async () => {
  layerDefinitions = await fetch("./layerDefinitions.json").then(response => response.json());

  activeLayer = layerDefinitions[0];

  // set up mouseover popup
  // Create a popup, but don't add it to the map yet.
  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // show zoom help text when layer is invisible
  map.on('zoomend', updateZoomWarning);

  // configure accordion to show and hide layers when they are toggled
  const mapSelector = document.getElementById("mapSelector");
  mapSelector.addEventListener('change', function () {
    switchToLayer(this.value);
  });

  layerDefinitions.forEach(layer => {
    map.on('mouseenter', layer.name, (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
  
      // Copy coordinates array.
      const coordinates = e.lngLat;
      const description = `<strong>${layer.layerLabel}</strong><br/> ${e.features[0].properties.label}`;
      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });
  
    map.on('mouseleave', layer.name, () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });  
  });

  map.on('style.load', initializeLayers);
  initializeLayers();
});


function switchToLayer(layerName) {
  activeLayer = layerDefinitions.find(x => x.name === layerName);

  // load the map description
  const mapDescription = document.getElementById("mapDescription");
  var newDescription = "";
  if (activeLayer.shortDescription) {
    newDescription += `<p><strong>${activeLayer.shortDescription}</strong></p>`;
  }
  newDescription += activeLayer.description;

  mapDescription.innerHTML = newDescription;

  // set visibility appropriately
  initializeLayers();

  updateZoomWarning();
}

function updateZoomWarning() {
  const currZoom = map.getZoom();
  const minZoom = activeLayer.minzoom;
  const zoomHelpText = document.getElementById('zoomHelpText');

  if (currZoom < minZoom) {
    zoomHelpText.style = "";
  } else {
    zoomHelpText.style = "display: none !important;";
  }
}

function initializeLayers() {
  styleLayers();
  filterLayers();
}

function filterLayers() {
  // add data layers
  layerDefinitions.forEach((layer, index) => {
    map.setLayoutProperty(layer.name, 'visibility', layer === activeLayer ? 'visible' : 'none'); 
  });
}

function styleLayers() {
  layerDefinitions.forEach((layer) => {
    map.setPaintProperty(layer.name, 'fill-color', mapboxColorCondition);
    map.setPaintProperty(layer.name, 'fill-opacity', 0.6);
  });
}

const colorPalette = [
  "#FF99C8",
  "#BA6E6E",
  "#A1674A",
  "#A63A50",
  "#767522",
  "#F4B942",
  "#C6C983",
  "#97D8C4",
  "#6B9AC4",
  "#4059AD"
];

const mapboxColorCondition = ['match', ['get', 'value']];
colorPalette.forEach((c,index) => {
  mapboxColorCondition.push(index + 1);
  mapboxColorCondition.push(c);
});
mapboxColorCondition.push(colorPalette[0]);