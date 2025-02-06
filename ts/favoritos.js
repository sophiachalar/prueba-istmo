// cargar y mostrar los Pokémon favoritos en la página de favoritos
const contenedorFavs = document.getElementById('lista-general');
const pokemonModal = document.querySelector("#pokemon-modal");
// bbtener los favoritos de localStorage
const lsPokemonesFavs = getFavoritos();
let  todosPokemones= [];

// obtener los favoritos del localStorage
function getFavoritos() {
    const favoritos = localStorage.getItem('pokemonesFavs');
    return favoritos ? JSON.parse(favoritos) : [];
}

function cargarFavs() {
    // vaciar el contenedor de favoritos antes de agregar nuevos pokemones
    contenedorFavs.innerHTML = ''; 

    const urlApi = "https://pokeapi.co/api/v2/pokemon/";    

    if (lsPokemonesFavs.length > 0) {

        lsPokemonesFavs.sort((a, b) => a.id - b.id);
        const pokemonesFavs = lsPokemonesFavs.map(pokemon => 
            fetch(urlApi + pokemon.id).then(response => response.json())
        );
        
        Promise.all(pokemonesFavs)    
        // espera a que todas las promeses esten listas        
        .then(datosPokemones => {  
            datosPokemones.sort((a, b) => a.id - b.id);
            datosPokemones.forEach(itemPokemonFavorito);
            todosPokemones = datosPokemones;
        });

    } else {
        document.body.classList.add("no-favoritos");
        contenedorFavs.innerHTML = `<p>No hay pokemon favoritos guardados.</p>`;
    }
}

// función para crear el HTML de cada Pokémon favorito
function itemPokemonFavorito(datosPokemon) {
    let tipos = datosPokemon.types.map((type) => {
        const tipoNombre = type.type.name;
        return `<p class="tipo ${tipoNombre}">${tipoNombre}</p>`;
    }).join('');

    const div = document.createElement("div");
    div.classList.add("pokemon-individual");
    div.dataset.id = datosPokemon.id;

    // estrella ya marcada como favorito
    const estrellaSrc = "/assets/estrella-despues.png";

    div.innerHTML = `
        <div class="favoritos" id="favoritos">
            <div class="idPokemon" id="idPokemon">
                <p>#${datosPokemon.id}</p> <!-- Usamos "data" en lugar de "pokemon" -->
            </div>
            <div class="estrella" id="estrella">
                <button onclick="toggleFavorito(${datosPokemon.id})"> <!-- Usamos "data.id" en lugar de "pokemon.id" -->
                    <img src="${estrellaSrc}" alt="estrella">
                </button>
            </div>
        </div>
        <div class="img-pokemon" id="img-pokemon">
            <img src="${datosPokemon.sprites.other.dream_world.front_default}" alt="${datosPokemon.name}">
        </div>
        <div class="sobre-pokemon">
            <div class="nombre-pokemon" id="nombre-pokemon">
                <p class="nombre">${datosPokemon.name}</p>
            </div>
            <div class="tipo-pokemon" id="tipo-pokemon">
                ${tipos}
            </div>
        </div>
    `;
    contenedorFavs.append(div);
}


// al hacer click en la lista donde estan todos y abrir el modal si se hace click a un pokemon especifico
contenedorFavs.addEventListener("click", function (event) {
    const target = event.target;

    // si el click es dentro de un botón de estrella, no hacemos nada para abrir el modal
    if (target.closest('.estrella button')) {
        return;
    }

    // si el click no fue en la estrella, procedemos a abrir el modal
    if (target.closest('.pokemon-individual')) {
        const idPokemon = target.closest('.pokemon-individual').dataset.id;
        const pokemon = todosPokemones.find(p => p.id == idPokemon);   

        if (pokemon) {
            verModal(pokemon);
        }
    }
});

// evento que cierra el modal haciendo click afuera
pokemonModal.addEventListener("click", function (event) {
    if (!event.target.closest(".pokemon-card")) {
        pokemonModal.style.display = "none";
    }
});

// función para mostrar el modal con los detalles del pokemon
function verModal(datosPokemon) {
    // Obtener los tipos del Pokémon
    let tipos = datosPokemon.types.map((type) => {
        const tipoNombre = type.type.name;
        return `<p class="tipo ${tipoNombre}">${tipoNombre}</p>`;
    }).join('');


    // obtener las habilidades del pokemon
    let habilidades = datosPokemon.abilities.map((ability, index, array) => {
        const habilidadNombre = ability.ability.name;
        const coma = index < array.length - 1 ? ',' : '';
        return `<p class="habilidad-modal ${habilidadNombre}">${habilidadNombre}${coma}</p>`;
    }).join('');

    // obtener las estadísticas del pokemon
    let estadisticas = datosPokemon.stats.map((stat) => {
        const estadisticaNombre = stat.stat.name;
        const numeroEstadistica = stat.base_stat;
        return `
            <div class="estadistica-progreso">
                <span class="estadistica-nombre">${estadisticaNombre}</span>
                <span class="estadistica-valor">${numeroEstadistica}</span>
                <div class="barra-progreso">
                    <div class="progreso" style="width: ${numeroEstadistica}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // verificar si el pokemon esta en los favoritos
    const esFavorito = getFavoritos().some(pokemonFavorito => pokemonFavorito.id === datosPokemon.id);
    const estrellaSrc = esFavorito ? '/assets/estrella-despues.png' : '/assets/estrella-antes.png';  // Cambiar la imagen según el estado del favorito

    const modal = `
        <div class="pokemon-card">
            <div class="favoritos" id="favoritos">
                <div class="idPokemon-modal" id="idPokemon-modal">
                    <p>#${datosPokemon.id}</p>
                </div>
                <div class="estrella" id="estrella">
                    <button onclick="toggleFavorito(${datosPokemon.id}, '${datosPokemon.name}', '${datosPokemon.sprites.other.dream_world.front_default}')">
                        <img src="${estrellaSrc}" alt="estrella" id="estrella-modal">
                    </button>
                </div>
            </div>
            <div class="img-pokemon-modal" id="img-pokemon-modal">
                <img src="${datosPokemon.sprites.other.dream_world.front_default}" alt="${datosPokemon.name}">
            </div>
            <div class="sobre-modal">
                <div class="nombre-modal" id="nombre-modal">
                    <p class="nombre">${datosPokemon.name}</p>
                </div>
                <div class="tipo-modal" id="tipo-modal">
                    <div class="titulo-tipos">Tipos</div>
                    <div class="tipos">
                        ${tipos}
                    </div>
                </div>
                <div class="habilidades-modal">
                    <div class="titulo-habilidades">Habilidades</div>
                    <div class="habilidades">
                        ${habilidades}
                    </div>
                </div>
                <div class="estadisticas-modal">
                    ${estadisticas}
                </div>
            </div>
        </div>
    `;

    const modalCompleto = document.querySelector("#modal-completo");
    modalCompleto.innerHTML = modal;
    const pokemonModal = document.querySelector("#pokemon-modal");
    pokemonModal.style.display = "flex";

    // cambiar la imagen de la estrella cuando se hace click en ella dentro del modal
    const estrellaModal = document.getElementById('estrella-modal');
    
    // actualizar la imagen de la estrella
    estrellaModal.addEventListener('click', function() {
        toggleFavorito(pokemon.id);

        // actualizamos la imagen de la estrella dependiendo del nuevo estado
        const esFavoritoNuevo = getFavoritos().some(pokemonFavorito => pokemonFavorito.id === datosPokemon.id);
        estrellaModal.src = esFavoritoNuevo ? '/assets/estrella-despues.png' : '/assets/estrella-antes.png';
    });
}

// funcion para eliminar un pokemon de los favoritos y de la vista
function eliminarFavorito(idPokemon) {
    // Obtener los favoritos actuales desde el localStorage
    const favoritos = getFavoritos();
    
    // filtrar los favoritos para eliminar el Pokémon con el id dado
    const nuevosFavoritos = favoritos.filter(pokemon => pokemon.id !== idPokemon);
    
    // guardar los nuevos favoritos en el localStorage
    localStorage.setItem('pokemonesFavs', JSON.stringify(nuevosFavoritos));

    // volver a cargar los favoritos para actualizar la vista
    cargarFavs();
}

// funcion para alternar el estado de favorito
function toggleFavorito(idPokemon, name, image) {
    const favoritos = getFavoritos();
    const pokemonIndex = favoritos.findIndex(pokemon => pokemon.id === idPokemon);

    if (pokemonIndex === -1) {
        // si no esta en favoritos se anade como favortio
        favoritos.push({ id: idPokemon, name: name, image: image });
    } else {
        // si esta en los favoritos se elimina
        eliminarFavorito(idPokemon); // Llamamos a eliminarFavorito para quitarlo de la lista
    }

    localStorage.setItem('pokemonesFavs', JSON.stringify(favoritos));
}
// cargar los favoritos al iniciar la página */
document.addEventListener('DOMContentLoaded', cargarFavs);

// funcion para modo nocturno
function aplicarModoNocturno() {
    // si en el local storage estaba como nocturno entonces
    // el toggle va a estar en su estado de seleccionado y el body va a tener la clase .active
    if (isNocturno) {
        document.body.classList.add("active");
        toggle.checked = true;
    }
    // de no ser asi entonces no va a estar el toggle marcado por lo que no habilita esa clase .active
}

// cuando hay un cambio en el toggle
toggle.addEventListener("change", () => {
    const isActive = toggle.checked;
    // guarda la seleccion si se activo el toggle, para que se guarde en el local storage
    document.body.classList.toggle("active", isActive);
    localStorage.setItem('isNocturno', isActive);
});
// llama a la funcion que ve la seleccion guardada en el local storage
aplicarModoNocturno();

// barra de busqueda
inputBuscar.addEventListener("input", function () {
    const textoBuscar = inputBuscar.value.trim().toLowerCase();
    listaSugerencias.innerHTML = ""; 

    if (!textoBuscar) {
        listaGeneral.innerHTML = "";
        todosPokemones.forEach(itemPokemon);
        listaSugerencias.style.display = "none";
        return;
    }

    // Filtrar pokemones solo cuando todosPokemones tiene datos
    if (todosPokemones.length > 0) {
        const pokemonFiltro = todosPokemones.filter(pokemon => {
            const nombre = pokemon.name.toLowerCase();
            const tipos = pokemon.types.map(type => type.type.name.toLowerCase());
            return nombre.includes(textoBuscar) || tipos.some(tipo => tipo.includes(textoBuscar));
        });

        listaSugerencias.innerHTML = pokemonFiltro
            .map(pokemon => `<p class="sugerencia" data-name="${pokemon.name}">${pokemon.name}</p>`)
            .join("");

        listaSugerencias.style.display = pokemonFiltro.length > 0 ? 'block' : 'none';
        listaGeneral.innerHTML = "";

        if (pokemonFiltro.length === 0) {
            const sinResultado = document.createElement("p");
            sinResultado.textContent = "No se ha encontrado el pokemon";
            sinResultado.classList.add("sin-resultado");
            listaGeneral.appendChild(sinResultado);
        } else {
            pokemonFiltro.forEach(itemPokemon);
        }
    }
});

