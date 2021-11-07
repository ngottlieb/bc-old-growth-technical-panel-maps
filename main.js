mapboxgl.accessToken = 'pk.eyJ1IjoibmdvdHRsaWViIiwiYSI6ImNrdm9vNGh3ODB3ZTkybm1vdHFmajVsNXIifQ.O3HhHIdFv0L_5FreT4GLjA';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: [-125.701, 54.916], // starting position [lng, lat]
  zoom: 5 // starting zoom
});

map.on('load', async () => {
  let layerDefinitions;
  layerDefinitions = await fetch("./layerDefinitions.json").then(response => response.json());

  // set up mouseover popup
  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });


  // add data layers
  layerDefinitions.forEach((layer, index) => {
    map.addSource(layer.name, {
      type: 'vector',
      url: `mapbox://${layer.tilesetId}`
    });

    map.addLayer({
      id: layer.name,
      type: 'fill',
      source: layer.name,
      'source-layer': layer.sourceLayer,
      paint: {
        'fill-color': layer.layerColor,
        'fill-opacity': 0.4
      },
      layout: {
        visibility: index === 0 ? 'visible' : 'none'
      }
    });

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
  

  // configure accordion to show and hide layers when they are toggled
  const layerAccordion = document.getElementById("accordionMapData");
  layerAccordion.addEventListener('show.bs.collapse', function (e) {
    const layer = e.target.dataset.layerName;

    map.setLayoutProperty(layer, 'visibility', 'visible');
  });
  layerAccordion.addEventListener('hide.bs.collapse', function (e) {
    const layer = e.target.dataset.layerName;

    map.setLayoutProperty(layer, 'visibility', 'none');
  });
});