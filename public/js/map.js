const mapContainer = document.getElementById('map');
if (!mapContainer) {
  console.warn('Map container not found.');
} else {
  const listingCoordinates = coordinates?.coordinates || coordinates;
  const coordsValid = Array.isArray(listingCoordinates) && listingCoordinates.length === 2;

  if (!window.mapToken) {
    console.warn('MapTiler API key missing in browser. Using OpenStreetMap fallback.');
    if (coordsValid) {
      const [lng, lat] = listingCoordinates;
      const bbox = `${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}`;
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
      mapContainer.innerHTML = `
        <iframe width="100%" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${osmUrl}" style="border:1px solid #ccc; border-radius:0.75rem;"></iframe>
        <p style="font-size:0.9rem; color:#555; text-align:center; margin-top:0.75rem;">OpenStreetMap fallback map shown because the MapTiler API key is not configured.</p>
      `;
    } else {
      mapContainer.innerHTML = '<p style="color:#555; padding:1rem; text-align:center;">Map is unavailable because the coordinates are invalid.</p>';
      console.error('Invalid coordinates format for fallback map:', coordinates);
    }
  } else {
    maptilersdk.config.apiKey = window.mapToken;
    const center = coordsValid ? listingCoordinates : [75.3999, 14.0546];

    const map = new maptilersdk.Map({
      container: 'map',
      style: maptilersdk.MapStyle.STREETS,
      center,
      zoom: 10
    });

    if (coordsValid) {
      new maptilersdk.Marker({color:'black'})
        .setLngLat(listingCoordinates)
        .setPopup(new maptilersdk.Popup({offset:25}).setHTML("<h4>Exact Location</h4>"))
        .addTo(map);
    } else {
      console.error('Invalid coordinates format for map marker:', coordinates);
    }
  }
}

     