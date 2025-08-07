const app = document.getElementById('app');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const genFilter = document.getElementById('genFilter');
const sortSelect = document.getElementById('sortSelect');

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

let softLimit = 16;
let currentLimit = softLimit;

function renderPokemonList(pokemonList) {
  // Verwijder grid tijdelijk als er geen resultaten zijn
  if (pokemonList.length === 0) {
    app.classList.remove('pokemon-grid');
    app.innerHTML = '';
    const msg = document.createElement('div');
    msg.className = 'no-results-msg';
    msg.textContent = 'Geen Pokémon gevonden. Probeer minder filters of een andere zoekterm.';
    app.appendChild(msg);
    // Verwijder eventueel de laad meer knop
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) loadMoreContainer.remove();
    return;
  } else {
    if (!app.classList.contains('pokemon-grid')) {
      app.classList.add('pokemon-grid');
    }
  }
  app.innerHTML = '';
  const limitedList = pokemonList.slice(0, currentLimit);
  limitedList.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
      <h3>${pokemon.name}</h3>
      <p>
        ${pokemon.types.map(t => `<span class="type-label type-${t.type.name}">${t.type.name}</span>`).join(' ')}
      </p>
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
      // Voeg toe aan de parent van de grid (de section erboven)
      const section = app.parentElement;
      section.appendChild(loadMoreContainer);
    }
    loadMoreContainer.innerHTML = '';
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Laad meer';
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.addEventListener('click', () => {
      currentLimit += 8;
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

function sortPokemons(pokemonList) {
  const sortBy = sortSelect.value;
  if (sortBy === 'idLaag') {
    return pokemonList.slice().sort((a, b) => a.id - b.id);
  }
  if (sortBy === 'idHoog') {
    return pokemonList.slice().sort((a, b) => b.id - a.id);
  }
  if (sortBy === 'nameAz') {
    return pokemonList.slice().sort((a, b) => b.name.localeCompare(a.name));
    
  }
  if (sortBy === 'nameZa') {
    return pokemonList.slice().sort((a, b) => a.name.localeCompare(b.name));
  }
  return pokemonList;
}

function filterPokemons() {
  let filtered = allPokemons;
  const searchValue = searchInput.value.toLowerCase();
  const checkedTypes = Array.from(typeFilter.querySelectorAll('.type-checkbox:checked')).map(cb => cb.value);
  const checkedGens = Array.from(genFilter.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);

  if (searchValue) {
    filtered = filtered.filter(p => p.name.includes(searchValue));
  }
  if (checkedTypes.length > 0) {
    filtered = filtered.filter(p =>
      checkedTypes.every(type => p.types.some(t => t.type.name === type))
    );
  }
  if (checkedGens.length > 0) {
    filtered = filtered.filter(p => {
      return checkedGens.some(gen => {
        const [start, end] = genRanges[gen];
        return p.id >= start && p.id <= end;
      });
    });
  }
  filtered = sortPokemons(filtered);
  currentLimit = softLimit;
  renderPokemonList(filtered);
}

searchInput.addEventListener('input', filterPokemons);
typeFilter.addEventListener('change', filterPokemons);
genFilter.addEventListener('change', filterPokemons);
sortSelect.addEventListener('change', filterPokemons);

fetchPokemons();
