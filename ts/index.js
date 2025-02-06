// campo de busqueda del pokemon
var inputBuscar = document.querySelector("#input-buscar");
var listaGeneral = document.querySelector("#lista-general");
var listaSugerencias = document.querySelector("#lista-sugerencias");
var pokemonModal = document.querySelector("#pokemon-modal");
var modalCompleto = document.querySelector("#modal-completo");
// aqui se almacenan todos los pokemones que traemos de la api
var todosPokemones = [];
// este url es el que permite traer la informacion
var pokeURL = "https://pokeapi.co/api/v2/pokemon/";
// ciclo para solicitar el id de cada pokemon
for (var i = 1; i <= 160; i++) {
    // se hace la solicitud a la api y se agregar los datos al array
    fetch(pokeURL + i)
        .then(function (response) { return response.json(); })
        .then(function (data) {
        todosPokemones.push(data);
        // cuando ya obtuvo los datos de los pokemoes
        if (todosPokemones.length === 160) {
            // aqui se ordenan los id para que aparezcan de menor a mayor
            todosPokemones.sort(function (a, b) { return a.id - b.id; });
            todosPokemones.forEach(itemPokemon);
        }
    });
}
// cargar pokemones en el main
function itemPokemon(data) {
    var tipos = data.types.map(function (type) {
        // aqui va a guardar el nombre del tipo o tipos de pokemon
        var tipoNombre = type.type.name;
        // va a crear un parrafo con el nombre
        return "<p class=\"tipo ".concat(tipoNombre, "\">").concat(tipoNombre, "</p>");
    }).join('');
    // esto crea un div en donde va a ir cada pokemon individualmente
    var div = document.createElement("div");
    div.classList.add("pokemon-individual");
    div.dataset.id = data.id.toString();
    // ver si el pokemon ya esta favorito
    var isFavorito = getFavoritos().some(function (pokemon) { return pokemon.id === data.id; });
    // si esta guardado como favorito va a poner la estrella amarilla
    var estrellaSrc = isFavorito ? "/assets/estrella-despues.png" : "/assets/estrella-antes.png";
    // este es el bloque con el html de la informacion del pokemon
    div.innerHTML = "\n        <div class=\"favoritos\" id=\"favoritos\">\n            <div class=\"idPokemon\" id=\"idPokemon\">\n                <p>#".concat(data.id, "</p>\n            </div>\n            <div class=\"estrella\" id=\"estrella\">\n                <button onclick=\"toggleFavorito(").concat(data.id, ")\">\n                    <img src=\"").concat(estrellaSrc, "\" alt=\"estrella\">\n                </button>\n            </div>\n        </div>\n        <div class=\"img-pokemon\" id=\"img-pokemon\">\n            <img src=\"").concat(data.sprites.other.dream_world.front_default, "\" alt=\"").concat(data.name, "\">\n        </div>\n        <div class=\"sobre-pokemon\">\n            <div class=\"nombre-pokemon\" id=\"nombre-pokemon\">\n                <p class=\"nombre\">").concat(data.name, "</p>\n            </div>\n            <div class=\"tipo-pokemon\" id=\"tipo-pokemon\">\n                ").concat(tipos, "\n            </div>\n        </div>\n    ");
    // esto se va a agregar a la lista con todos los pokemones
    listaGeneral.append(div);
}
// para agregar o quitar de favoritos
function toggleFavorito(id) {
    var favoritos = getFavoritos();
    // verifica si el pokemon esta como favorito
    var existe = favoritos.some(function (pokemon) { return pokemon.id === id; });
    if (existe) {
        // si ya estaba como favorito lo elimina de la lista
        favoritos = favoritos.filter(function (pokemon) { return pokemon.id !== id; });
    }
    else {
        // si no lo agrega como favorito
        var pokemon = todosPokemones.find(function (pokemon) { return pokemon.id === id; });
        favoritos.push({ id: pokemon.id, name: pokemon.name, img: pokemon.sprites.other.dream_world.front_default });
    }
    // actualiza la lista de pokemones favoritos del local storage
    localStorage.setItem('pokemonesFavs', JSON.stringify(favoritos));
    // y actualiza la vista de la estrella
    actualizarEstrella(id);
}
// esta funcion permite obtener la lista de favoritos del local storage
function getFavoritos() {
    var favoritos = localStorage.getItem('pokemonesFavs');
    return favoritos ? JSON.parse(favoritos) : [];
}
// esta funcion actualiza la estrella dependiendo de su estado
function actualizarEstrella(id) {
    // busca el elemento en el pokemon que se esta seleccionando
    var pokemonElement = document.querySelector(".pokemon-individual[data-id=\"".concat(id, "\"]"));
    var estrella = pokemonElement.querySelector(".estrella button img");
    // realiza el cambio de imagen segun su estado
    var isFavorito = getFavoritos().some(function (pokemon) { return pokemon.id === id; });
    estrella.src = isFavorito ? "/assets/estrella-despues.png" : "/assets/estrella-antes.png";
}
// barra de busqueda
inputBuscar.addEventListener("input", function () {
    // toma el texto que ingresa el usuario y lo convierte a minuscula
    var textoBuscar = inputBuscar.value.trim().toLowerCase();
    // limpia las sugerencias que habian
    listaSugerencias.innerHTML = "";
    // si no tiene ningun texto en el campo de busqueda
    if (!textoBuscar) {
        // muestra todos los pokemones y oculta la lista de sugerencias
        listaGeneral.innerHTML = "";
        todosPokemones.forEach(itemPokemon);
        listaSugerencias.style.display = "none";
        return;
    }
    // es un filtro para buscar segun nombre y tipo
    var pokemonFiltro = todosPokemones.filter(function (pokemon) {
        // convierte a minusculas
        var nombre = pokemon.name.toLowerCase();
        var tipos = pokemon.types.map(function (type) { return type.type.name.toLowerCase(); });
        // verifica que el texto coincida
        return nombre.includes(textoBuscar) || tipos.some(function (tipo) { return tipo.includes(textoBuscar); });
    });
    // oculta la lista de sugerencias si no hay resultado
    listaSugerencias.style.display = pokemonFiltro.length > 0 ? 'block' : 'none';
    // vacia la lista con todos los pokemones
    listaGeneral.innerHTML = "";
    // para cuando no tiene resultados
    if (pokemonFiltro.length === 0) {
        // crea un parrafo que indica que no se encontro el pokemon
        var sinResultado = document.createElement("p");
        sinResultado.textContent = "No se ha encontrado el pokemon";
        // le asigna esta clase, que aplica estilos en el css
        sinResultado.classList.add("sin-resultado");
        // se agrega al bloque donde van todos los pokemones
        listaGeneral.appendChild(sinResultado);
    }
    else {
        // cuando si hay resultados muestra los pokemones segun el filtro
        pokemonFiltro.forEach(itemPokemon);
    }
});
// para cuando se le hace click a alguna sugerencia
listaSugerencias.addEventListener("click", function (event) {
    var target = event.target;
    // ve si el elemento al que se le dio click es una sugerencia
    if (target.classList.contains("sugerencia")) {
        // trae el nombre del pokemon
        var nombrePokemon_1 = target.getAttribute("data-name");
        // busca todos los datos del pokemon que selecciona
        var pokemonSeleccionado = todosPokemones.find(function (pokemon) { return pokemon.name === nombrePokemon_1; });
        if (pokemonSeleccionado) {
            listaGeneral.innerHTML = "";
            // muestra el pokemon que selecciono
            itemPokemon(pokemonSeleccionado);
        }
        listaSugerencias.innerHTML = "";
        inputBuscar.value = "";
        listaSugerencias.style.display = 'none';
    }
});
// modal del pokemon
// el modal se cierra si hace click fuera de la clase pokemon-card
pokemonModal.addEventListener("click", function (event) {
    var target = event.target;
    if (!target.closest(".pokemon-card")) {
        pokemonModal.style.display = "none";
    }
});
// funcion para mostrar el modal con la informacion
function verModal(pokemon) {
    // trae los tipos del pokemon y crea el bloque con el nombre del tipo
    var tipos = pokemon.types.map(function (type) {
        var tipoNombre = type.type.name;
        return "<p class=\"tipo-modal ".concat(tipoNombre, "\">").concat(tipoNombre, "</p>");
    }).join('');
    // trae las habilidades del pokemon y crea el bloque con el nombre de la habilidad
    var habilidades = pokemon.abilities.map(function (ability, index, array) {
        var habilidadNombre = ability.ability.name;
        var coma = index < array.length - 1 ? ',' : '';
        return "<p class=\"habilidad-modal ".concat(habilidadNombre, "\">").concat(habilidadNombre).concat(coma, "</p>");
    }).join('');
    // trae las estadisticas, trae su nombre y el valor de cada una, luego genera un bloque 
    // que muestra el nombre, el valor y en base a eso una barra de progreso
    var estadisticas = pokemon.stats.map(function (stat) {
        var estadisticaNombre = stat.stat.name;
        var numeroEstadistica = stat.base_stat;
        return "\n            <div class=\"estadistica-progreso\">\n                <span class=\"estadistica-nombre\">".concat(estadisticaNombre, "</span>\n                <span class=\"estadistica-valor\">").concat(numeroEstadistica, "</span>\n                <div class=\"barra-progreso\">\n                    <div class=\"progreso\" style=\"width: ").concat(numeroEstadistica, "%\"></div>\n                </div>\n            </div>\n        ");
    }).join('');
    // verifica si es favorito o no para cargar la estrella que corresponde
    var esFavorito = getFavoritos().some(function (pokemonFavorito) { return pokemonFavorito.id === pokemon.id; });
    var estrellaSrc = esFavorito ? '/assets/estrella-despues.png' : '/assets/estrella-antes.png'; // Cambiar la imagen según el estado del favorito
    // crea el html para el modal
    var modal = "\n        <div class=\"pokemon-card\">\n            <div class=\"favoritos\" id=\"favoritos\">\n                <div class=\"idPokemon-modal\" id=\"idPokemon-modal\">\n                    <p>#".concat(pokemon.id, "</p>\n                </div>\n                <div class=\"estrella\" id=\"estrella\">\n                    <button onclick=\"toggleFavorito(").concat(pokemon.id, ")\">\n                        <img src=\"").concat(estrellaSrc, "\" alt=\"estrella\" id=\"estrella-modal\">\n                    </button>\n                </div>\n            </div>\n            <div class=\"img-pokemon-modal\" id=\"img-pokemon-modal\">\n                <img src=\"").concat(pokemon.sprites.other.dream_world.front_default, "\" alt=\"").concat(pokemon.name, "\">\n            </div>\n            <div class=\"sobre-modal\">\n                <div class=\"nombre-modal\" id=\"nombre-modal\">\n                    <p class=\"nombre\">").concat(pokemon.name, "</p>\n                </div>\n                <div class=\"tipo-modal\" id=\"tipo-modal\">\n                    <div class=\"titulo-tipos\">Tipos</div>\n                    <div class=\"tipos\">\n                        ").concat(tipos, "\n                    </div>\n                </div>\n                <div class=\"habilidades-modal\">\n                    <div class=\"titulo-habilidades\">Habilidades</div>\n                    <div class=\"habilidades\">\n                        ").concat(habilidades, "\n                    </div>\n                </div>\n                <div class=\"estadisticas-modal\">\n                    ").concat(estadisticas, "\n                </div>\n            </div>\n        </div>\n    ");
    // carga y muestra el modal
    modalCompleto.innerHTML = modal;
    pokemonModal.style.display = "flex";
}
// abre el modal cuando se le hace click al pokemon
listaGeneral.addEventListener("click", function (event) {
    var target = event.target;
    // si el click es en el boton de la estrella no lo abre
    if (target.closest('.estrella button')) {
        return;
    }
    // si el click no es en la estrella si lo abre
    if (target.closest('.pokemon-individual')) {
        var pokemonElement = target.closest('.pokemon-individual'); // Aseguramos que es un HTMLElement
        var idPokemon_1 = pokemonElement.dataset.id; // Ahora dataset no da error
        var pokemon = todosPokemones.find(function (p) { return p.id == idPokemon_1; });
        if (pokemon) {
            verModal(pokemon);
        }
    }
});
// modo nocturno
// modo nocturno
// isNocurno va a tener el valor de si esta seleccionado como modo nocturno o no en el local storage
let isNocturno = localStorage.getItem('isNocturno') === 'true';

const toggle = document.getElementById("toggle");

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