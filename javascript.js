var map = L.map('map').setView([47.410552, -122.399484], 7);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZWpzbGdyIiwiYSI6ImNrMnBtbDF0YzA1d2UzbnJtbHMxcWltOTIifQ.MY_BZXu-EPtwTlxsI_zgcQ'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var cartoData = L.layerGroup().addTo(map);
var url = "https://tbrade.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT * FROM lab_7_taylor_1";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>Description of Location:</b><br>" + feature.properties.input_desc + "<br>" +
        "<b>Time of Observation:</b><br>" + feature.properties.observation_time + "<br>" +
        "<b>Size of Tracks:</b><br>" + feature.properties.size_tracks + "<br>" +
        "<b>Fisher Fur in Snare:</b><br>" + feature.properties.fur_snare + "<br>" +
        "<b>Other Fur in Snare (Animal Name):</b><br>" + feature.properties.description_other_fur + "<br>" +
        "<b>Shape of Scat:</b><br>" + feature.properties.shape_scat + "<br>" +
        "<b>Size of Scat:</b><br>" + feature.properties.size_scat + "<br>"
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });

new L.Control.Draw({
    draw : {
        polygon : true,
        polyline : true,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {     //Create a form pop-up with the following information (The content inside the form is written in HTML).
    var popupContent =
    '<form>' +
          '<label for="size_tracks">Size of Tracks (if applicable):</label><br>' +
          '<select id="size_tracks" name="size_tracks">' +
             '<option value="NA"></option>' +
             '<option value="Less than 2.5 inches long">Less than 2.5 inches long</option>' +
             '<option value="About 2.5 inches long">About 2.5 inches long</option>' +
             '<option value="Greater than 2.5 inches long">Greater than 2.5 inches long</option>' +
          '</select><br>' +
          '<label for="fur_snare">Fisher fur in hair snare? (If you are not a scientist, leave blank)</label><br>' +  //Source for Hair Snare: https://www.fs.fed.us/rm/wildlife-terrestrial/docs/genetics/reports-protocols/Fisher_Survey_Protocol.pdf
          '<select id="fur_snare" name="fur_snare">' +
             '<option value="NA"></option>' +
             '<option value="Yes">Yes</option>' +
             '<option value="No">No</option>' +
             '<option value="Other_Fur">Other Fur</option>' +
          '</select><br>' +
          'If you answered "Other Fur" to the question above, type the name of the animal the fur belongs to below (If you are not a scientist, write "NA" in the text box below):<input type="text" id="description_other_fur">' +
          '</label><br>' +
          '<label for="shape_scat">Shape of scat (if applicable):</label><br>' +
          '<select id="shape_scat" name="shape_scat">' +
             '<option value="NA"></option>' +
             '<option value="Tapered at one end">Tapered at one end</option>' +
             '<option value="Not tapered at one end">Not tapered at one end</option>' +
          '</select><br>' +
          '<label for="size_scat">Size of scat (if applicable):</label><br>' +
          '<select id="size_scat" name="size_scat">' +
             '<option value="NA"></option>' +
             '<option value="Less than 3/8 of an inch in width">Less than 3/8 of an inch in width</option>' +
             '<option value="Between 3/8 inch and 5/8 inch in width">Between 3/8 inch and 5/8 inch in width</option>' +
             '<option value="Greater than 5/8 of an inch in width">Greater than 5/8 of an inch in width</option>' +
          '</select><br>' +
    'Describe the location of the sign(s) (Type of surrounding vegetation, nearby land features, open or closed canopy, etc.):<br><input type="text" id="input_desc"><br>' +
    'Date sign was observed:<br><input type="datetime-local" id="observation_time"' +
           'name="Observation_time" value="2022-02-14T15:30"' +
           'min="2022-02-14T15:30" max="2200-02-14T15:30"> <br></input>' +
    'Enter your name, nickname, or alias (If you are filling out multiple forms, please use the same name, nickname, or alias for each form):<br><input type="text" id="input_name"><br>' +
    '<center><input type="button" value="Submit" id="submit"></center>' +
    '</form>'
    drawnItems.bindPopup(popupContent, {maxHeight:340, minWidth:900}).openPopup();
}


map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get user name and description
      var size_tracks = document.getElementById("size_tracks").value;
      var fur_snare = document.getElementById("fur_snare").value;
      var description_other_fur = document.getElementById("description_other_fur").value;
      var shape_scat = document.getElementById("shape_scat").value;
      var size_scat = document.getElementById("size_scat").value;
      var description = document.getElementById("input_desc").value;
      var observation_time = document.getElementById("observation_time").value;
      var name = document.getElementById("input_name").value;
        // For each drawn layer
    drawnItems.eachLayer(function(layer) {

                        // Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_7_taylor_1 (the_geom, size_tracks, fur_snare, description_other_fur, shape_scat, size_scat, input_desc, observation_time, input_name) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                size_tracks + "', '" +
                fur_snare + "', '" +
                description_other_fur + "', '" +
                shape_scat + "', '" +
                size_scat + "', '" +
                description + "', '" +
                observation_time + "', '" +
                name + "')";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });
        // Transfer submitted drawing to the CARTO layer
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.size_tracks = size_tracks;
        newData.properties.fur_snare = fur_snare;
        newData.properties.description_other_fur = description_other_fur;
        newData.properties.shape_scat = shape_scat;
        newData.properties.size_scat = size_scat;
        newData.properties.description = description;
        newData.properties.observation_time = observation_time;
        newData.properties.name = name;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);
    });
        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
