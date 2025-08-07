# WebAdvancedPokemonAPI
Opdracht herexamen Web Advanced met gebruik van PokeAPI

# PokéDex SPA – Web Advanced Herexamen

Een interactieve Pokédex Single Page Application (SPA) gebouwd met Vite en de PokéAPI. De app laat gebruikers Pokémon verkennen, filteren, zoeken, sorteren, en favorieten opslaan.

## 🔗 Live demo
> Voeg hier je link toe indien je het ook host via Netlify, Vercel, ...

## ⚙️ Installatie

```bash
npm install
npm run dev
```

## ✨ Features
- Bekijk alle Pokémon uit alle generaties
- Filter op type (meerdere tegelijk, AND-filter)
- Filter op generatie (meerdere tegelijk)
- Zoek op naam
- Sorteer op Pokédex-nummer, naam of type (oplopend/aflopend)
- Favorieten opslaan (lokaal)
- Responsive design
- "Laad meer" knop om extra Pokémon te tonen
- Type-labels met kleur per type
- Duidelijk bericht als er geen resultaten zijn

## 📦 Gebruikte technologieën
- [Vite](https://vitejs.dev/) (build tool)
- [PokéAPI](https://pokeapi.co/) (data)
- HTML, CSS, JavaScript (SPA zonder framework)

## 📁 Projectstructuur
- `index.html` – Hoofdpagina
- `src/main.js` – Hoofdlogica (filteren, sorteren, laden)
- `src/style/style.css` – Styling
- `public/` – Assets

## 📝 Opmerkingen
- De app werkt volledig client-side en gebruikt alleen de PokéAPI.
- Favorieten worden opgeslagen in localStorage.
- Voor performance worden Pokémon in batches geladen met een "Laad meer" knop.