const app = document.getElementById('app');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');

let allPokemons = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchPokemons(limit = 40) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();
  const pokemonDetails = await Promise.all(
    data.results.map(p => fetch(p.url).then(res => res.json()))
  );
  allPokemons = pokemonDetails;
  renderPokemonList(allPokemons);
  populateTypeFilter();
}

function renderPokemonList(pokemonList) {
  app.innerHTML = '';
  pokemonList.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
      <h3>${pokemon.name}</h3>
      <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
      <button class="fav-btn">${favorites.includes(pokemon.name) ? '❤️' : '🤍'}</button>
    `;

    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => {
      toggleFavorite(pokemon.name);
      favBtn.textContent = favorites.includes(pokemon.name) ? '❤️' : '🤍';
    });

    app.appendChild(card);
  });
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(n => n !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function populateTypeFilter() {
  const types = new Set();
  allPokemons.forEach(p => {
    p.types.forEach(t => types.add(t.type.name));
  });

  [...types].sort().forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

searchInput.addEventListener('input', () => {
  const value = searchInput.value.toLowerCase();
  const filtered = allPokemons.filter(p => p.name.includes(value));
  renderPokemonList(filtered);
});

typeFilter.addEventListener('change', () => {
  const value = typeFilter.value;
  if (!value) {
    renderPokemonList(allPokemons);
    return;
  }
  const filtered = allPokemons.filter(p =>
    p.types.some(t => t.type.name === value)
  );
  renderPokemonList(filtered);
});

fetchPokemons();
