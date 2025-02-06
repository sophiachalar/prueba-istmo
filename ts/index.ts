// campo de busqueda del pokemon
const inputBuscar = document.querySelector<HTMLInputElement>("#input-buscar")!;
const listaGeneral = document.querySelector<HTMLDivElement>("#lista-general")!;
const listaSugerencias = document.querySelector<HTMLDivElement>("#lista-sugerencias")!;
const pokemonModal = document.querySelector<HTMLDivElement>("#pokemon-modal")!;
const modalCompleto = document.querySelector<HTMLDivElement>("#modal-completo")!;

// aqui se almacenan todos los pokemones que traemos de la api
let todosPokemones: any[] = [];
// este url es el que permite traer la informacion
let pokeURL: string = "https://pokeapi.co/api/v2/pokemon/";

// ciclo para solicitar el id de cada pokemon
for (let i = 1; i <= 160; i++) {
    // se hace la solicitud a la api y se agregar los datos al array
    fetch(pokeURL + i)
        .then((response) => response.json())
        .then(data => {
            todosPokemones.push(data);

            // cuando ya obtuvo los datos de los pokemoes
            if (todosPokemones.length === 160) {
                // aqui se ordenan los id para que aparezcan de menor a mayor
                todosPokemones.sort((a, b) => a.id - b.id);
                todosPokemones.forEach(itemPokemon);
            }
        });
}

// cargar pokemones en el main
function itemPokemon(data: any): void {
    let tipos = data.types.map((type: any) => {
        // aqui va a guardar el nombre del tipo o tipos de pokemon
        const tipoNombre = type.type.name;
        // va a crear un parrafo con el nombre
        return `<p class="tipo ${tipoNombre}">${tipoNombre}</p>`;
    }).join('');

    // esto crea un div en donde va a ir cada pokemon individualmente
    const div = document.createElement("div");
    div.classList.add("pokemon-individual");
    div.dataset.id = data.id.toString();

    // ver si el pokemon ya esta favorito
    const isFavorito = getFavoritos().some(pokemon => pokemon.id === data.id);
    // si esta guardado como favorito va a poner la estrella amarilla
    const estrellaSrc = isFavorito ? "../assets/estrella-despues.png" : "../assets/estrella-antes.png";

    // este es el bloque con el html de la informacion del pokemon
    div.innerHTML = `
        <div class="favoritos" id="favoritos">
            <div class="idPokemon" id="idPokemon">
                <p>#${data.id}</p>
            </div>
            <div class="estrella" id="estrella">
                <button onclick="toggleFavorito(${data.id})">
                    <img src="${estrellaSrc}" alt="estrella">
                </button>
            </div>
        </div>
        <div class="img-pokemon" id="img-pokemon">
            <img src="${data.sprites.other.dream_world.front_default}" alt="${data.name}">
        </div>
        <div class="sobre-pokemon">
            <div class="nombre-pokemon" id="nombre-pokemon">
                <p class="nombre">${data.name}</p>
            </div>
            <div class="tipo-pokemon" id="tipo-pokemon">
                ${tipos}
            </div>
        </div>
    `;
    // esto se va a agregar a la lista con todos los pokemones
    listaGeneral.append(div);
}

// para agregar o quitar de favoritos
function toggleFavorito(id: number): void {
    let favoritos = getFavoritos();

    // verifica si el pokemon esta como favorito
    const existe = favoritos.some(pokemon => pokemon.id === id);

    if (existe) {
        // si ya estaba como favorito lo elimina de la lista
        favoritos = favoritos.filter(pokemon => pokemon.id !== id);
    } else {
        // si no lo agrega como favorito
        const pokemon = todosPokemones.find(pokemon => pokemon.id === id);
        favoritos.push({ id: pokemon!.id, name: pokemon!.name, img: pokemon!.sprites.other.dream_world.front_default });
    }

    // actualiza la lista de pokemones favoritos del local storage
    localStorage.setItem('pokemonesFavs', JSON.stringify(favoritos));

    // y actualiza la vista de la estrella
    actualizarEstrella(id);
}

// esta funcion permite obtener la lista de favoritos del local storage
function getFavoritos(): { id: number, name: string, img: string }[] {
    const favoritos = localStorage.getItem('pokemonesFavs');
    return favoritos ? JSON.parse(favoritos) : [];
}

// esta funcion actualiza la estrella dependiendo de su estado
function actualizarEstrella(id: number): void {
    // busca el elemento en el pokemon que se esta seleccionando
    const pokemonElement = document.querySelector(`.pokemon-individual[data-id="${id}"]`) as HTMLElement;
    const estrella = pokemonElement.querySelector(".estrella button img") as HTMLImageElement;
    // realiza el cambio de imagen segun su estado
    const isFavorito = getFavoritos().some(pokemon => pokemon.id === id);
    estrella.src = isFavorito ? "../assets/estrella-despues.png" : "../assets/estrella-antes.png";
}

// barra de busqueda
inputBuscar.addEventListener("input", function () {
    // toma el texto que ingresa el usuario y lo convierte a minuscula
    const textoBuscar = inputBuscar.value.trim().toLowerCase();
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
    const pokemonFiltro = todosPokemones.filter(pokemon => {
        // convierte a minusculas
        const nombre = pokemon.name.toLowerCase();
        const tipos = pokemon.types.map((type : { type : { name: string} }) => type.type.name.toLowerCase());
        // verifica que el texto coincida
        return nombre.includes(textoBuscar) || tipos.some((tipo: string) => tipo.includes(textoBuscar));    
    });

    // genera sugerencias basadas en el filtro anterior
    listaSugerencias.innerHTML = pokemonFiltro
        // agrega el bloque con el nombre del pokemon que sugiere segun el texto de la busqueda
        .map(pokemon => `<p class="sugerencia" data-name="${pokemon.name}">${pokemon.name}</p>`)
        .join("");

    // oculta la lista de sugerencias si no hay resultado
    listaSugerencias.style.display = pokemonFiltro.length > 0 ? 'block' : 'none';
    // vacia la lista con todos los pokemones
    listaGeneral.innerHTML = "";

    // para cuando no tiene resultados
    if (pokemonFiltro.length === 0) {
        // crea un parrafo que indica que no se encontro el pokemon
        const sinResultado = document.createElement("p");
        sinResultado.textContent = "No se ha encontrado el pokemon";
        // le asigna esta clase, que aplica estilos en el css
        sinResultado.classList.add("sin-resultado");
        // se agrega al bloque donde van todos los pokemones
        listaGeneral.appendChild(sinResultado);
    } else {
        // cuando si hay resultados muestra los pokemones segun el filtro
        pokemonFiltro.forEach(itemPokemon);
    }
});

// para cuando se le hace click a alguna sugerencia
listaSugerencias.addEventListener("click", function (event) {
    const target = event.target as HTMLElement;

    // ve si el elemento al que se le dio click es una sugerencia
    if (target.classList.contains("sugerencia")) {
        // trae el nombre del pokemon
        const nombrePokemon = target.getAttribute("data-name");

        // busca todos los datos del pokemon que selecciona
        const pokemonSeleccionado = todosPokemones.find(pokemon => pokemon.name === nombrePokemon);

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
pokemonModal.addEventListener("click", function (event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest(".pokemon-card")) {
        pokemonModal.style.display = "none";
    }
});
// funcion para mostrar el modal con la informacion
function verModal(pokemon: any): void {
    // trae los tipos del pokemon y crea el bloque con el nombre del tipo
    let tipos = pokemon.types.map((type: any) => {
        const tipoNombre = type.type.name;
        return `<p class="tipo-modal ${tipoNombre}">${tipoNombre}</p>`;
    }).join('');

    // trae las habilidades del pokemon y crea el bloque con el nombre de la habilidad
    let habilidades = pokemon.abilities.map((ability: any, index: number, array: any) => {
        const habilidadNombre = ability.ability.name;
        const coma = index < array.length - 1 ? ',' : '';
        return `<p class="habilidad-modal ${habilidadNombre}">${habilidadNombre}${coma}</p>`;
    }).join('');

    // trae las estadisticas, trae su nombre y el valor de cada una, luego genera un bloque 
    // que muestra el nombre, el valor y en base a eso una barra de progreso
    let estadisticas = pokemon.stats.map((stat: any) => {
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

    // verifica si es favorito o no para cargar la estrella que corresponde
    const esFavorito = getFavoritos().some(pokemonFavorito => pokemonFavorito.id === pokemon.id);
    const estrellaSrc = esFavorito ? '../assets/estrella-despues.png' : '../assets/estrella-antes.png';  // Cambiar la imagen según el estado del favorito

    // crea el html para el modal
    const modal = `
        <div class="pokemon-card">
            <div class="favoritos" id="favoritos">
                <div class="idPokemon-modal" id="idPokemon-modal">
                    <p>#${pokemon.id}</p>
                </div>
                <div class="estrella" id="estrella">
                    <button onclick="toggleFavorito(${pokemon.id})">
                        <img src="${estrellaSrc}" alt="estrella" id="estrella-modal">
                    </button>
                </div>
            </div>
            <div class="img-pokemon-modal" id="img-pokemon-modal">
                <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
            </div>
            <div class="sobre-modal">
                <div class="nombre-modal" id="nombre-modal">
                    <p class="nombre">${pokemon.name}</p>
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
    // carga y muestra el modal
    modalCompleto.innerHTML = modal;
    pokemonModal.style.display = "flex";
}

// abre el modal cuando se le hace click al pokemon
listaGeneral.addEventListener("click", function (event) {
    const target = event.target as HTMLElement;

    // si el click es en el boton de la estrella no lo abre
    if (target.closest('.estrella button')) {
        return;
    }

    // si el click no es en la estrella si lo abre
    if (target.closest('.pokemon-individual')) {
        const pokemonElement = target.closest('.pokemon-individual') as HTMLElement; // Aseguramos que es un HTMLElement
        const idPokemon = pokemonElement.dataset.id;  // Ahora dataset no da error
        const pokemon = todosPokemones.find(p => p.id == idPokemon);
    
        if (pokemon) {
            verModal(pokemon);
        }
    }
});

// modo nocturno
const isNocturno = localStorage.getItem("nocturno") === "true";

// si esta activado se aplica el tema nocturno
if (isNocturno) {
    document.body.classList.add("nocturno");
}

const botonNocturno = document.querySelector("#boton-nocturno") as HTMLElement;

botonNocturno.addEventListener("click", function () {
    document.body.classList.toggle("nocturno");
    localStorage.setItem("nocturno", document.body.classList.contains("nocturno") ? "true" : "false");
});
