mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: campground.geometry.coordinates,
    zoom: 12,
});

map.addControl(new mapboxgl.NavigationControl());


const marker = new mapboxgl.Marker({
    color: "red",
    draggable: true
})
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h6>${campground.title}</h6>`
            )
    )
    .addTo(map);