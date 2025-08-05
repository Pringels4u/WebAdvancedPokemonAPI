const app = document.getElementById('app');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const genFilter = document.getElementById('genFilter');

let allPokemons = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const genRanges = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025]
};

async function fetchPokemons() {
  // Haal alle Pokémon op (geen limit)
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
  const data = await res.json();
  const pokemonDetails = await Promise.all(
    data.results.map(p => fetch(p.url).then(res => res.json()))
  );
  allPokemons = pokemonDetails.sort((a, b) => a.id - b.id);
  renderPokemonList(allPokemons);
  populateTypeFilter();
}

let softLimit = 198;
let currentLimit = softLimit;

function renderPokemonList(pokemonList) {
  app.innerHTML = '';
  const limitedList = pokemonList.slice(0, currentLimit);
  limitedList.forEach(pokemon => {
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
  if (pokemonList.length > currentLimit) {
    // Maak een container onder de grid voor de knop
    let loadMoreContainer = document.getElementById('loadMoreContainer');
    if (!loadMoreContainer) {
      loadMoreContainer = document.createElement('div');
      loadMoreContainer.id = 'loadMoreContainer';
      loadMoreContainer.style.width = '100%';
      loadMoreContainer.style.display = 'flex';
      loadMoreContainer.style.justifyContent = 'center';
      loadMoreContainer.style.margin = '2rem 0';
      app.parentElement.appendChild(loadMoreContainer);
    }
    loadMoreContainer.innerHTML = '';
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Laad meer';
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.addEventListener('click', () => {
      currentLimit += 102;
      renderPokemonList(pokemonList);
    });
    loadMoreContainer.appendChild(loadMoreBtn);
  } else {
    // Verwijder de knop als er geen extra Pokémon zijn
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) loadMoreContainer.remove();
  }
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(n => n !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Dynamisch vullen van typeFilter en genFilter als checkboxen
function populateTypeFilter() {
  typeFilter.innerHTML = '';
  const types = new Set();
  allPokemons.forEach(p => {
    p.types.forEach(t => types.add(t.type.name));
  });
  [...types].sort().forEach(type => {
    const label = document.createElement('label');
    label.style.marginRight = '8px';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = type;
    checkbox.className = 'type-checkbox';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(type));
    typeFilter.appendChild(label);
  });
}

function populateGenFilter() {
  genFilter.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    const label = document.createElement('label');
    label.style.marginRight = '8px';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = i;
    checkbox.className = 'gen-checkbox';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(`Gen ${i}`));
    genFilter.appendChild(label);
  }
}

// Dropdown functionaliteit toevoegen
function setupDropdowns() {
  const typeDropdownBtn = document.getElementById('typeDropdownBtn');
  const typeDropdown = typeDropdownBtn.parentElement;
  typeDropdownBtn.addEventListener('click', () => {
    typeDropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!typeDropdown.contains(e.target)) {
      typeDropdown.classList.remove('show');
    }
  });

  const genDropdownBtn = document.getElementById('genDropdownBtn');
  const genDropdown = genDropdownBtn.parentElement;
  genDropdownBtn.addEventListener('click', () => {
    genDropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!genDropdown.contains(e.target)) {
      genDropdown.classList.remove('show');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateGenFilter();
  setupDropdowns();
});

// Call this after DOM is loaded
populateGenFilter();

function filterPokemons() {
  let filtered = allPokemons;
  const searchValue = searchInput.value.toLowerCase();
  // Types
  const checkedTypes = Array.from(typeFilter.querySelectorAll('.type-checkbox:checked')).map(cb => cb.value);
  // Generaties
  const checkedGens = Array.from(genFilter.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);

  if (searchValue) {
    filtered = filtered.filter(p => p.name.includes(searchValue));
  }
  if (checkedTypes.length > 0) {
    filtered = filtered.filter(p => p.types.some(t => checkedTypes.includes(t.type.name)));
  }
  if (checkedGens.length > 0) {
    filtered = filtered.filter(p => {
      return checkedGens.some(gen => {
        const [start, end] = genRanges[gen];
        return p.id >= start && p.id <= end;
      });
    });
  }
  currentLimit = softLimit;
  renderPokemonList(filtered);
}

searchInput.addEventListener('input', filterPokemons);
typeFilter.addEventListener('change', filterPokemons);
genFilter.addEventListener('change', filterPokemons);

fetchPokemons();
