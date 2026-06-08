// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

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

  // Array aangemaakt voor de data
  let houses = []

  // Voor elke price property Value, maak een custom property voor en pas Numberformat() aan toe
  housesResponseJson.data.forEach(function (house) {
    house.customPrice = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(house.price)

    const customDates = ['Een week', 'Twee weken', 'Langer dan drie weken']
    house.customDate = customDates[Math.floor(Math.random() * customDates.length)]

    const customAanvaarding = ['Kan snel', 'In overleg', 'Leeg en ontruimd']
    house.customAanvaarding = customAanvaarding[Math.floor(Math.random() * customAanvaarding.length)]

    const customVraagprijsPerM = '€ 4.774';
    house.customVraagprijsPerM = customVraagprijsPerM;

    const customStatus = ['Beschikbaar', 'Niet beschikbaar']
    house.customStatus = customStatus[Math.floor(Math.random() * customStatus.length)]

    houses.push(house)
  })


  // Exporteer data naar de index
  response.render('index.liquid', {
    houses: houses
  });
});