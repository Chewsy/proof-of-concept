// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

// Middleware om JSON-body te parsen
app.use(express.json());

// Gebruik de map 'public' voor statische bestanden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
app.set("views", "./views");

// Stel het poortnummer in waar Express op moet gaan luisteren
app.set("port", process.env.PORT || 8000);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  console.log(`Project draait via http://localhost:${app.get('port')}`)
})

const baseURL = 'https://fdnd-agency.directus.app/items/f_'

// Haalt een ID uit de object
function extractFileId(img) {
  if (!img) return null;
  if (typeof img === 'string' || typeof img === 'number') return img;
  return img.directus_files_id || img.id || null;
}

// Creer een route voor de index en fetch en parse data
app.get('/', async function (request, response) {

  // https://fdnd-agency.directus.app/items/f_houses
  const housesResponse = await fetch(baseURL + "houses?fields=*.*");
  const housesResponseJson = await housesResponse.json();

  //  Maakt een object lijst van alle huizen
  const houses = housesResponseJson.data.map(house => {
    house.poster_image = extractFileId(house.poster_image)
    house.gallery = Array.isArray(house.gallery)
      ? house.gallery.map(extractFileId).filter(Boolean)
      : []
    house.thumbnail = house.gallery[0] || house.poster_image
    return house
  })

  // Exporteer data naar de index
  response.render('index.liquid', {
    houses: houses
  });
});

// Route voor de foto's/media pagina van een specifiek huis
app.get('/house/:city/:street/:house_slug/media/fotos', async function (request, response) {

  const housesResponse = await fetch(baseURL + "houses?fields=*.*");
  const housesResponseJson = await housesResponse.json();

  const house = housesResponseJson.data.find(house =>
    house.city.toLowerCase() === request.params.city.toLowerCase() &&
    house.street.trim().toLowerCase() === request.params.street.toLowerCase()
  );

  if (!house) {
    return response.status(404).send('Huis niet gevonden');
  }

  house.priceFormatted = house.price.toLocaleString('nl-NL');
  house.poster_image = extractFileId(house.poster_image)
  house.gallery = Array.isArray(house.gallery)
    ? house.gallery.map(extractFileId).filter(Boolean)
    : []
  house.thumbnail = house.gallery[0] || house.poster_image

  response.render('house-media.liquid', {
    house: house
  });
});