// public/js/map.js

document.addEventListener('DOMContentLoaded', () => {
  if (listing.geometry && listing.geometry.coordinates) {
    const coordinates = [listing.geometry.coordinates[1], listing.geometry.coordinates[0]];

    const map = L.map('map').setView(coordinates, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker(coordinates).addTo(map)
      .bindPopup(`<h5>${listing.title}</h5><p>Exact location provided after booking</p>`)
      .openPopup();
  } else {
    console.error("Listing geometry coordinates are not defined or incorrect format.");
  }
});
