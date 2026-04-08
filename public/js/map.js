try {
  const coordinates = window.coordinates;
  const listingLocation = window.listingLocation || "";
  console.log('Map script starting, coordinates:', coordinates, 'location:', listingLocation, 'mapToken:', !!window.mapToken);

  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.warn('Map container not found.');
  } else {
    const listingCoordinates = coordinates?.coordinates || coordinates;
    const coordsValid = Array.isArray(listingCoordinates) && listingCoordinates.length === 2;

    console.log('Listing coordinates:', listingCoordinates, 'valid:', coordsValid);

    if (coordsValid) {
      renderMap(mapContainer, listingCoordinates);
    } else if (listingLocation.trim()) {
      console.warn('No geometry found; geocoding listing location fallback:', listingLocation);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listingLocation)}&format=geojson&limit=1`, {
        headers: { 'User-Agent': 'Wanderlust/1.0' }
      })
        .then((response) => response.json())
        .then((data) => {
          const feature = data.features?.[0];
          if (feature?.geometry?.coordinates && feature.geometry.coordinates.length === 2) {
            renderMap(mapContainer, feature.geometry.coordinates);
          } else {
            mapContainer.innerHTML = '<p style="color:#555; padding:1rem; text-align:center;">Map is unavailable because the location could not be resolved.</p>';
            console.error('Location fallback failed to geocode:', listingLocation, data);
          }
        })
        .catch((err) => {
          mapContainer.innerHTML = '<p style="color:#555; padding:1rem; text-align:center;">Map is unavailable because the location lookup failed.</p>';
          console.error('Nominatim lookup failed:', err);
        });
    } else {
      mapContainer.innerHTML = '<p style="color:#555; padding:1rem; text-align:center;">Map is unavailable because the coordinates are invalid.</p>';
      console.error('Invalid coordinates format and no location fallback available:', coordinates);
    }
  }
} catch (globalError) {
  console.error('Map script failed completely:', globalError);
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.innerHTML = '<p style="color:#f00; padding:1rem; text-align:center;">Map failed to load due to a script error.</p>';
  }
}

function renderMap(container, listingCoordinates) {
  const [lng, lat] = listingCoordinates;

  if (!window.mapToken) {
    console.warn('MapTiler API key missing in browser. Using OpenStreetMap fallback.');
    showOSMFallback(container, lng, lat);
    return;
  }

  try {
    maptilersdk.config.apiKey = window.mapToken;
    const map = new maptilersdk.Map({
      container: 'map',
      style: maptilersdk.MapStyle.STREETS,
      center: [lng, lat],
      zoom: 10
    });

    new maptilersdk.Marker({color:'black'})
      .setLngLat([lng, lat])
      .setPopup(new maptilersdk.Popup({offset:25}).setHTML("<h4>Exact Location</h4>"))
      .addTo(map);

    console.log('MapTiler map loaded successfully.');
  } catch (error) {
    console.error('MapTiler map failed to load:', error);
    console.warn('Falling back to OpenStreetMap.');
    showOSMFallback(container, lng, lat);
  }
}

function showOSMFallback(container, lng, lat) {
  const bbox = `${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  container.innerHTML = `
    <iframe width="100%" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${osmUrl}" style="border:1px solid #ccc; border-radius:0.75rem;"></iframe>
    <p style="font-size:0.9rem; color:#555; text-align:center; margin-top:0.75rem;">Map shown using OpenStreetMap (MapTiler API key not available or invalid).</p>
  `;
  console.log('OSM fallback loaded.');
}

     