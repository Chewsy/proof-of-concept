Ontwerp en maak een data driven online concept voor een opdrachtgever

De instructies voor deze opdracht staan in: [docs/INSTRUCTIONS.md](https://github.com/fdnd-task/proof-of-concept/blob/main/docs/INSTRUCTIONS.md)

# Titel
Funda

## Inhoudsopgave

  * [Beschrijving](#beschrijving)
  * [Gebruik](#gebruik)
  * [Kenmerken](#kenmerken)
  * [Installatie](#installatie)
  * [Bronnen](#bronnen)
  * [Licentie](#licentie)

## Beschrijving
<img width="1920" height="1440" alt="654shots_so" src="https://github.com/user-attachments/assets/b6199099-8f7f-4fa8-9317-0acb7ba4c19d" />

Funda is het grootste Nederlandse online platform voor het kopen, huren en verkopen van woningen. Funda wil een data-gedreven woningdetailpagina en een favorietenoverzichtspagina, zodat gebruikers woningen kunnen opslaan en terugvinden. 

## Gebruik
Via funda.nl kunnen woningzoekenden door een uitgebreid aanbod van koopwoningen bladeren, details per woning bekijken en woningen opslaan als favoriet en die terugvinden op de favorieten pagina.

## Kenmerken
<!-- Bij Kenmerken staat welke technieken zijn gebruikt en hoe. Wat is de HTML structuur? Wat zijn de belangrijkste dingen in CSS? Wat is er met JS gedaan en hoe? Misschien heb je iets met NodeJS gedaan, of heb je een framwork of library gebruikt? -->

- De applicatie draait op Node.js met Express en Liquid. De server haalt woningdata op uit Directus en renderd de detailpagina.

```js
app.get('/', async function (request, response) {
  const housesResponse = await fetch(baseURL + "houses");
  const listResponse = await fetch(baseURL + "list/20");

  response.render('index.liquid', {
   houses: houses,
   favorieteHuizenIds: favorieteHuizenIds
  });
});
```

- De woningdetailpagina is opgebouwd uit categorieen zoals details, omschrijving, kenmerken en populariteit. Op de website wordt data direct uit de API gefetched en getoond. Ontbrekende data wordt aangevuld met willekeurige mock data.

```js
const customStatus = ['Beschikbaar', 'Niet beschikbaar']
    house.customStatus = customStatus[Math.floor(Math.random() * customStatus.length)]

    const customBouwJaar = ['1998', '2024', '2000', '2001', '1993', '1999']
    house.customBouwJaar = customBouwJaar[Math.floor(Math.random() * customBouwJaar.length)]

    const customHHuisType = ['Appartement', 'Vrijstaande woning', 'Rijtjeshuis', 'Eengezinswoning', 'Portiekflat']
    house.customHHuisType = customHHuisType[Math.floor(Math.random() * customHHuisType.length)]

    const customBouwType = ['Nieuwbouw', 'Bestaande bouw']
    house.customBouwType = customBouwType[Math.floor(Math.random() * customBouwType.length)]
```

- De favorietenfunctie bevat een pleasurable animatie waarbij de hart icoon binnen de knop een vulling krijgt en geanimeerd wordt als de gebruiker er op klikt.
<img width="720" height="390" alt="Screen Recording 2026-06-21 at 12 52 41" src="https://github.com/user-attachments/assets/aaa3fd4d-348b-46fa-9a11-c71ee4861e9c" />

```js
if (result.added) {
   favorietenKnop.classList.add('favoriet');
} else {
   favorietenKnop.classList.remove('favoriet');
}
```

```js
const favorietenKnop = document.querySelector("#favorietKnop");

favorietenKnop.addEventListener("click", voegAanFavorieten)

async function voegAanFavorieten() {
   const houseId = favorietenKnop.dataset.houseId;
   const data = { id: houseId };
}
```

## Installatie
<!-- Bij Instalatie staat hoe een andere developer aan jouw repo kan werken -->
Om het project op te starten volg je de volgende stappen

1. clone het project
2. installeer de packages benodigd voor het project
   ```bash
   npm install
   ```
3. start het project lokaal op
   ```bash
   npm start
   ```

## Bronnen

## Licentie

This project is licensed under the terms of the [MIT license](./LICENSE).
