// infopokemon.js
// Detailpagina voor een Pokémon

// Haal de naam of id uit de querystring
const params = new URLSearchParams(window.location.search);
const pokemonName = params.get('name');

const app = document.getElementById('info-app');

async function fetchPokemonData(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) {
    app.innerHTML = '<div class="error">Pokémon niet gevonden.</div>';
    return;
  }
  const data = await res.json();
  renderPokemonInfo(data);
}

async function fetchTypeData(typeName) {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
  return res.json();
}

async function renderPokemonInfo(pokemon) {
  // Basis info
  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const id = pokemon.id;
  const types = pokemon.types.map(t => t.type.name);
  const sprite = pokemon.sprites.front_default;

  // Type info ophalen voor weaknesses/resistances
  const typeDataArr = await Promise.all(types.map(fetchTypeData));

  // Damage multipliers per type
  const allTypes = [
    'normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
  ];
  const multipliers = {};
  allTypes.forEach(type => multipliers[type] = 1);

  typeDataArr.forEach(typeData => {
    typeData.damage_relations.double_damage_from.forEach(t => {
      multipliers[t.name] *= 2;
    });
    typeData.damage_relations.half_damage_from.forEach(t => {
      multipliers[t.name] *= 0.5;
    });
    typeData.damage_relations.no_damage_from.forEach(t => {
      multipliers[t.name] *= 0;
    });
  });

  // Weaknesses: multiplier > 1, Resistances: multiplier > 0 && < 1, Immunities: multiplier == 0
  const weaknesses = allTypes.filter(t => multipliers[t] > 1);
  const resistances = allTypes.filter(t => multipliers[t] > 0 && multipliers[t] < 1);
  const immunities = allTypes.filter(t => multipliers[t] === 0);
  const quadWeaknesses = allTypes.filter(t => multipliers[t] >= 4);
  const quadResistances = allTypes.filter(t => multipliers[t] <= 0.25 && multipliers[t] > 0);

  // Stats
  const stats = pokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat }));

  app.innerHTML = `
    <div class="info-header">
      <img src="${sprite}" alt="${name}" class="info-sprite" />
      <div>
        <h1>${name} <span class="info-id">#${id}</span></h1>
        <div class="info-types">
          ${types.map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ')}
        </div>
      </div>
    </div>
    <div class="info-section">
      <h2>Zwaktes</h2>
      <div class="info-types">
        ${quadWeaknesses.length ? `<b>4x:</b> ` + quadWeaknesses.map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ') + '<br>' : ''}
        ${weaknesses.length ? `<b>2x:</b> ` + weaknesses.filter(t => !quadWeaknesses.includes(t)).map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ') : 'Geen'}
      </div>
      <h2>Resistenties</h2>
      <div class="info-types">
        ${quadResistances.length ? `<b>0.25x:</b> ` + quadResistances.map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ') + '<br>' : ''}
        ${resistances.length ? `<b>0.5x:</b> ` + resistances.filter(t => !quadResistances.includes(t)).map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ') : 'Geen'}
      </div>
      <h2>Immuniteiten</h2>
      <div class="info-types">${immunities.length ? immunities.map(t => `<span class="type-label type-${t}">${t}</span>`).join(' ') : 'Geen'}</div>
    </div>
    <div class="info-section">
      <h2>Stats</h2>
      <div class="info-stats">
        ${stats.map(s => `
          <div class="stat-row">
            <span class="stat-name">${s.name}</span>
            <div class="stat-bar-bg"><div class="stat-bar" style="width:${s.value/2}%"></div></div>
            <span class="stat-value">${s.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

if (pokemonName) {
  fetchPokemonData(pokemonName);
} else {
  app.innerHTML = '<div class="error">Geen Pokémon gespecificeerd.</div>';
}
