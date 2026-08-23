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

  // Lijst ID 20 is mijn persoonlijke lijkst
  const favListResponse = await fetch(baseURL + "list/20");
  const favListResponseJson = await favListResponse.json();

  const favorieteHuizenIds = favListResponseJson.data ? favListResponseJson.data.houses : [];

  //  Maakt een object lijst van alle huizen
  const houses = housesResponseJson.data.map(house => {
    const customEnergielabel = ['A++++', 'A+++', 'A++', 'A+', 'B', 'C', 'D', 'E', 'F', 'G']

    house.customEnergielabel = customEnergielabel[Math.floor(Math.random() * customEnergielabel.length)]
    house.poster_image = extractFileId(house.poster_image)
    house.gallery = Array.isArray(house.gallery)
      ? house.gallery.map(extractFileId).filter(Boolean)
      : []
    house.thumbnail = house.gallery[0] || house.poster_image
    return house
  })

  // Exporteer data naar de index
  response.render('index.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds
  });
});

// Deze functie wordt dus uitgevoerd als de browser naar /goedkoopste gaat
app.get('/goedkoopste', async function (request, response) {

  // Haal alle huizen uit de WHOIS API op, gesorteerd op prijs
  const params = {
    'sort': 'price',
    'fields': '*.*',
  }

  // Response opslaan in variabele
  const goedkoopsteResponse = await fetch('https://fdnd-agency.directus.app/items/f_houses/?' + new URLSearchParams(params));

  // Response omzetten naar JSON
  const goedkoopsteResponseJSON = await goedkoopsteResponse.json();

  const favListResponse = await fetch(baseURL + 'list/20');
  const favListResponseJson = await favListResponse.json();
  const favorieteHuizenIds = favListResponseJson.data ? favListResponseJson.data.houses : [];

  // Haal alle afbeeldingen op net zoals in de index
  const houses = goedkoopsteResponseJSON.data.map(house => {
    house.poster_image = extractFileId(house.poster_image)
    house.gallery = Array.isArray(house.gallery)
      ? house.gallery.map(extractFileId).filter(Boolean)
      : []
    house.thumbnail = house.gallery[0] || house.poster_image
    return house
  })

  // responseJSON renderen naar de pagina
  response.render('index.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds
  });
});

// Deze functie wordt dus uitgevoerd als de browser naar /duurste gaat
app.get('/duurste', async function (request, response) {

  // Haal alle huizen uit de WHOIS API op, gesorteerd op prijs
  const params = {
    'sort': '-price',
    'fields': '*.*',
  }

  // Response opslaan in variabele
  const duursteResponse = await fetch('https://fdnd-agency.directus.app/items/f_houses/?' + new URLSearchParams(params));

  // Response omzetten naar JSON
  const duursteResponseJSON = await duursteResponse.json();

  const favListResponse = await fetch(baseURL + 'list/20');
  const favListResponseJson = await favListResponse.json();
  const favorieteHuizenIds = favListResponseJson.data ? favListResponseJson.data.houses : [];

  // Haal alle afbeeldingen op net zoals in de index
  const houses = duursteResponseJSON.data.map(house => {
    house.poster_image = extractFileId(house.poster_image)
    house.gallery = Array.isArray(house.gallery)
      ? house.gallery.map(extractFileId).filter(Boolean)
      : []
    house.thumbnail = house.gallery[0] || house.poster_image
    return house
  })

  // responseJSON renderen naar de pagina
  response.render('index.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds
  });
});

// Deze functie wordt dus uitgevoerd als ik op de hart icoon klik
app.post('/favoriet', async function (request, response) {
  const houseId = Number(request.body.house_id);

  const listResponse = await fetch(baseURL + 'list/20');
  const listResponseJson = await listResponse.json();

  let favorieteHuizenIds = [];

  if (
    listResponseJson.data &&
    listResponseJson.data.houses
  ) {
    favorieteHuizenIds = listResponseJson.data.houses;
  }

  let nieuweFavorieteHuizenIds = [];

  if (favorieteHuizenIds.includes(houseId)) {
    nieuweFavorieteHuizenIds =
      favorieteHuizenIds.filter(id => id !== houseId);
  } else {

    nieuweFavorieteHuizenIds = favorieteHuizenIds.slice();

    nieuweFavorieteHuizenIds.push(houseId);
  }

  await fetch(baseURL + 'list/20', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      houses: nieuweFavorieteHuizenIds
    })
  });

  response.redirect('/');
});

// Deze functie wordt dus uitgevoerd als ik op een woning klik uit de overzichtspagina (index)
app.get('/huis/:id', async function (request, response) {

  // https://fdnd-agency.directus.app/items/f_houses
  const housesResponse = await fetch(baseURL + "houses");
  const housesResponseJson = await housesResponse.json();

  const listResponse = await fetch(baseURL + "list/20");
  const listResponseJson = await listResponse.json();

  const favorieteHuizenIds = listResponseJson.data ? listResponseJson.data.houses : [];

  // Array aangemaakt voor de data
  let houses = []

  // Voor elke price property Value, maak een custom property voor en pas Numberformat() aan toe
  housesResponseJson.data.forEach(function (house) {
    house.customPrice = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(house.price)

    const customDatum = ['Een week', 'Twee weken', 'Langer dan drie weken']
    house.customDatum = customDatum[Math.floor(Math.random() * customDatum.length)]

    const customAanvaarding = ['Kan snel', 'In overleg', 'Leeg en ontruimd']
    house.customAanvaarding = customAanvaarding[Math.floor(Math.random() * customAanvaarding.length)]

    const customVraagprijsPerM = '€ 4.774';
    house.customVraagprijsPerM = customVraagprijsPerM;

    const customStatus = ['Beschikbaar', 'Niet beschikbaar']
    house.customStatus = customStatus[Math.floor(Math.random() * customStatus.length)]

    const customBouwJaar = ['1998', '2024', '2000', '2001', '1993', '1999']
    house.customBouwJaar = customBouwJaar[Math.floor(Math.random() * customBouwJaar.length)]

    const customHHuisType = ['Appartement', 'Vrijstaande woning', 'Rijtjeshuis', 'Eengezinswoning', 'Portiekflat']
    house.customHHuisType = customHHuisType[Math.floor(Math.random() * customHHuisType.length)]

    const customBouwType = ['Nieuwbouw', 'Bestaande bouw']
    house.customBouwType = customBouwType[Math.floor(Math.random() * customBouwType.length)]

    const customDakType = 'Zadeldak';
    house.customDakType = customDakType;

    const customEnergielabel = ['A++++', 'A+++', 'A++', 'A+', 'B', 'C', 'D', 'E', 'F', 'G']
    house.customEnergielabel = customEnergielabel[Math.floor(Math.random() * customEnergielabel.length)]

    const maxBekeken = 10000;
    const maxBewaard = 50;

    function getRandomInt(max) {
      return Math.floor(Math.random() * max) + 1;
    }

    function getRandomInt(maxBekeken) {
      return Math.floor(Math.random() * maxBekeken) + 1;
    }

    function getRandomInt(maxBewaard) {
      return Math.floor(Math.random() * maxBewaard) + 1;
    }

    house.randomBekeken = getRandomInt(maxBekeken);
    house.randomBewaard = getRandomInt(maxBewaard);

    houses.push(house)
  })


  // Exporteer data naar de index
  response.render('huis.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds,
  });
});





// Deze functie wordt dus uitgevoerd als ik op de favorieten knop klik in de nav
app.get('/favorieten', async function (request, response) {

  // https://fdnd-agency.directus.app/items/f_houses
  const housesResponse = await fetch(baseURL + "houses?fields=*.*");
  const housesResponseJson = await housesResponse.json();

  const listResponse = await fetch(baseURL + 'list/20');
  const listResponseJson = await listResponse.json();

  let favorieteHuizenIds = [];

  if (
    listResponseJson.data &&
    listResponseJson.data.houses
  ) {
    favorieteHuizenIds = listResponseJson.data.houses;
  }

  //  Maakt een object lijst van alle huizen
  const houses = housesResponseJson.data
    .filter(house => favorieteHuizenIds.includes(Number(house.id)))
    .map(house => {
      const customEnergielabel = ['A++++', 'A+++', 'A++', 'A+', 'B', 'C', 'D', 'E', 'F', 'G']

      house.customEnergielabel = customEnergielabel[Math.floor(Math.random() * customEnergielabel.length)]
      house.poster_image = extractFileId(house.poster_image)
      house.gallery = Array.isArray(house.gallery)
        ? house.gallery.map(extractFileId).filter(Boolean)
        : []
      house.thumbnail = house.gallery[0] || house.poster_image
      return house
    })

  // Exporteer data naar de index
  response.render('favorieten.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds
  });
});