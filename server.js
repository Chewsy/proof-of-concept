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

// Creer een route voor de index en fetch en parse data
app.get('/', async function (request, response) {

  // https://fdnd-agency.directus.app/items/f_houses
  const housesResponse = await fetch(baseURL + "houses");
  const housesResponseJson = await housesResponse.json();

  // Change this URL to match your exact Directus lists endpoint if needed
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
  response.render('index.liquid', {
    houses: houses,
    favorieteHuizenIds: favorieteHuizenIds
  });
});

// Creer een route voor de favorieten pagina en fetch en parse data
app.get('/favorieten', async function (request, response) {

  // https://fdnd-agency.directus.app/items/f_list
  const listResponse = await fetch(baseURL + "list");
  const listResponseJson = await listResponse.json();

});

// POST functie voor het toevoegen van een huis aan f_list
app.post('/favorieten', async function (request, response) {
  // Haal mijn favorietenlijst (id 20) op
  const listResponse = await fetch(baseURL + 'list/20');
  const listData = await listResponse.json();

  // Haal het ID van het huis uit de body van het request en zet het om naar een getal
  const houseId = parseInt(request.body.id, 10);

  // Array aangemaakt voor de data
  let currentHouses = listData.data.houses || [];

  // Controleer of het huis-ID al in de lijst staat
  const houseIndex = currentHouses.indexOf(houseId);

  let added = false;
  if (houseIndex > -1) {
    // Als id al in favorieten staat, verwijder de id
    currentHouses.splice(houseIndex, 1);
  } else {
    // Als id niet in favorieten staat, voeg de id toe
    currentHouses.push(houseId);
    added = true;
  }

  // Update de lijst in Directus
  await fetch(baseURL + 'list/20', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      houses: currentHouses
    })
  });

  response.json({ success: true, added: added });
});