try {
  console.log('Map script starting, coordinates:', coordinates, 'mapToken:', !!window.mapToken);

  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.warn('Map container not found.');
    return;
  }

  const listingCoordinates = coordinates?.coordinates || coordinates;
  const coordsValid = Array.isArray(listingCoordinates) && listingCoordinates.length === 2;

  console.log('Listing coordinates:', listingCoordinates, 'valid:', coordsValid);

  if (!coordsValid) {
    mapContainer.innerHTML = '<p style="color:#555; padding:1rem; text-align:center;">Map is unavailable because the coordinates are invalid.</p>';
    console.error('Invalid coordinates format:', coordinates);
    return;
  }

  const [lng, lat] = listingCoordinates;

  if (!window.mapToken) {
    console.warn('MapTiler API key missing in browser. Using OpenStreetMap fallback.');
    showOSMFallback(mapContainer, lng, lat);
  } else {
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
      showOSMFallback(mapContainer, lng, lat);
    }
  }
} catch (globalError) {
  console.error('Map script failed completely:', globalError);
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.innerHTML = '<p style="color:#f00; padding:1rem; text-align:center;">Map failed to load due to a script error.</p>';
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

     