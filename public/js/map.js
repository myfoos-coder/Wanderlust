if (!window.mapToken) {
  console.error('MapTiler API key missing in browser. Set MAPTILER_KEY in your server environment and render it to the page.');
} else {
  maptilersdk.config.apiKey = window.mapToken;
  const listingCoordinates = coordinates?.coordinates || coordinates;
  const center = Array.isArray(listingCoordinates) ? listingCoordinates : [75.3999, 14.0546];

  const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center,
    zoom: 10
  });

  if (Array.isArray(listingCoordinates)) {
    new maptilersdk.Marker({color:'black'})
      .setLngLat(listingCoordinates)
      .setPopup(new maptilersdk.Popup({offset:25}).setHTML("<h4>Exact Location</h4>"))
      .addTo(map);
  } else {
    console.error('Invalid coordinates format for map marker:', coordinates);
  }
}

     