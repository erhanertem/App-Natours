/* eslint-disable */

// console.log('hello from the client side');

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations); //JSON parse returns an array output

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWVydGVtIiwiYSI6ImNsYmV6ZGp1cTAxZzAzbm1yMDhkMDlua3gifQ.LjMS3IuZMtTHukPUs4JFCg'; //custom token for the nators project

const map = new mapboxgl.Map({
  container: 'map', //container ID - corresponds to #map id in PUG file
  style: 'mapbox://styles/eertem/civ5lb7xf00352ilcu63hwzuz', // my custom style URL
  scrollZoom: false,
  // center: [-118.113491, 34.111745], // Starting point [lng,lat]
  // zoom: 4, // starting zoom level
  // interactive: false, //disallow interraction with map
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  //Create marker DOM element
  const el = document.createElement('div');
  el.className = 'marker';

  //Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //Add popup
  new mapboxgl.Popup({
    offset: 30,
    closeOnClick: false,
  })
    .setLngLat(loc.coordinates)
    .setHTML(
      `<p>
      Day ${loc.day}: ${loc.description}
    </p>`
    )
    .addTo(map);

  //Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  //Mapbox Boundary padding option. Since the sckewed CSS design of the map elements are overlapping eachother - the bondry of locations is not available entirely, By providing a padding we may get over the sckewness related issue.
  padding: {
    top: 250,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
