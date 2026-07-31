const contenedor = document.getElementById("discursos");
const buscador = document.getElementById("buscar-discursos");
const contador = document.getElementById("cantidad-resultados");

const filtroAnio = document.getElementById("filtro-anio");
const filtroColeccion = document.getElementById("filtro-coleccion");
const filtroLugar = document.getElementById("filtro-lugar");
const filtroEstado = document.getElementById("filtro-estado");
const ordenDiscursos = document.getElementById("orden-discursos");
const botonLimpiar = document.getElementById("limpiar-filtros");

let todosLosDiscursos = [];

cargarDiscursos();


async function cargarDiscursos() {
    try {
        const respuesta = await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el JSON: ${respuesta.status}`
            );
        }

        todosLosDiscursos = await respuesta.json();

        cargarOpcionesDeFiltros();
        aplicarFiltros();

    } catch (error) {
        console.error("Error al cargar los discursos:", error);

        if (contenedor) {
            contenedor.innerHTML = `
                <p class="mensaje-error">
                    No se pudo cargar el archivo de discursos.
                </p>
            `;
        }
    }
}


function cargarOpcionesDeFiltros() {
    cargarAnios();
    cargarColecciones();
    cargarLugares();
    cargarEstados();
}


function cargarAnios() {
    const anios = [
        ...new Set(
            todosLosDiscursos
                .map(discurso => discurso.anio)
                .filter(Boolean)
        )
    ].sort((a, b) => b - a);

    anios.forEach(anio => {
        const opcion = document.createElement("option");

        opcion.value = String(anio);
        opcion.textContent = anio;

        filtroAnio.appendChild(opcion);
    });
}


function cargarColecciones() {
    const colecciones = new Set();

    todosLosDiscursos.forEach(discurso => {
        if (Array.isArray(discurso.colecciones)) {
            discurso.colecciones.forEach(coleccion => {
                const nombre = String(coleccion || "").trim();

                if (nombre) {
                    colecciones.add(nombre);
                }
            });
        }
    });

    [...colecciones]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach(coleccion => {
            const opcion = document.createElement("option");

            opcion.value = coleccion;
            opcion.textContent = coleccion;

            filtroColeccion.appendChild(opcion);
        });
}

function cargarLugares() {
    const lugares = new Set();

    todosLosDiscursos.forEach(discurso => {
        const lugaresDelDiscurso = String(
            discurso.lugar || ""
        )
            .split(",")
            .map(lugar => lugar.trim())
            .filter(Boolean);

        lugaresDelDiscurso.forEach(lugar => {
            lugares.add(lugar);
        });
    });

    [...lugares]
        .sort((a, b) =>
            a.localeCompare(b, "es", {
                sensitivity: "base"
            })
        )
        .forEach(lugar => {
            const opcion = document.createElement("option");

            opcion.value = lugar;
            opcion.textContent = lugar;

            filtroLugar.appendChild(opcion);
        });
}

function cargarEstados() {
    const estados = [
        ...new Set(
            todosLosDiscursos
                .map(discurso => String(discurso.estadoVideo || "").trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "es"));

    estados.forEach(estado => {
        const opcion = document.createElement("option");

        opcion.value = estado;
        opcion.textContent = estado;

        filtroEstado.appendChild(opcion);
    });
}


function aplicarFiltros() {
    const consulta = normalizarTexto(buscador.value);
    const anioSeleccionado = filtroAnio.value;
    const coleccionSeleccionada = filtroColeccion.value;
    const lugarSeleccionado = filtroLugar.value;
    const estadoSeleccionado = filtroEstado.value;
    const ordenSeleccionado = ordenDiscursos.value;

    let resultados = todosLosDiscursos.filter(discurso => {
        const colecciones = Array.isArray(discurso.colecciones)
            ? discurso.colecciones
            : [];

        const textoCompleto = normalizarTexto(`
            ${discurso.id || ""}
            ${discurso.titulo || ""}
            ${discurso.fecha || ""}
            ${discurso.anio || ""}
            ${discurso.lugar || ""}
            ${colecciones.join(" ")}
        `);

        const coincideBusqueda =
            !consulta || textoCompleto.includes(consulta);

        const coincideAnio =
            !anioSeleccionado ||
            String(discurso.anio || "") === anioSeleccionado;

        const coincideColeccion =
    !coleccionSeleccionada ||
    colecciones.includes(coleccionSeleccionada);

const lugaresDelDiscurso = String(
    discurso.lugar || ""
)
    .split(",")
    .map(lugar => normalizarTexto(lugar))
    .filter(Boolean);

const coincideLugar =
    !lugarSeleccionado ||
    lugaresDelDiscurso.includes(
        normalizarTexto(lugarSeleccionado)
    );
    
const coincideEstado =
    !estadoSeleccionado ||
    String(discurso.estadoVideo || "") === estadoSeleccionado;

return (
    coincideBusqueda &&
    coincideAnio &&
    coincideColeccion &&
    coincideLugar &&
    coincideEstado
);
    });

    resultados = ordenarResultados(resultados, ordenSeleccionado);

    mostrarDiscursos(resultados);
}


function ordenarResultados(discursos, tipoOrden) {
    const copia = [...discursos];

    if (tipoOrden === "antiguos") {
        return copia.sort((a, b) =>
            String(a.fecha || "").localeCompare(String(b.fecha || ""))
        );
    }

    if (tipoOrden === "az") {
        return copia.sort((a, b) =>
            String(a.titulo || "").localeCompare(
                String(b.titulo || ""),
                "es"
            )
        );
    }

    if (tipoOrden === "za") {
        return copia.sort((a, b) =>
            String(b.titulo || "").localeCompare(
                String(a.titulo || ""),
                "es"
            )
        );
    }

    return copia.sort((a, b) =>
        String(b.fecha || "").localeCompare(String(a.fecha || ""))
    );
}


function mostrarDiscursos(discursos) {
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    actualizarContador(discursos.length);

    if (discursos.length === 0) {
        contenedor.innerHTML = `
            <p class="sin-resultados">
                No se encontraron discursos.
            </p>
        `;

        return;
    }

    discursos.forEach(discurso => {
        const tarjeta = crearTarjeta(discurso);

        contenedor.appendChild(tarjeta);
    });
}


function crearTarjeta(discurso) {
    const tarjeta = document.createElement("article");

    tarjeta.classList.add("card");
    tarjeta.tabIndex = 0;

    const imagen = discurso.miniatura
        ? discurso.miniatura
        : `images/miniaturas/${discurso.id}.jpg`;

    tarjeta.innerHTML = `
        <img
            src="${escaparHTML(imagen)}"
            alt="${escaparHTML(discurso.titulo)}"
            loading="lazy"
        >

        <div class="card-info">

            <h3>${escaparHTML(discurso.titulo)}</h3>

            <p>
                ${formatearFecha(discurso.fecha)}
                ${
                    discurso.lugar
                        ? ` · ${escaparHTML(discurso.lugar)}`
                        : ""
                }
            </p>

        </div>
    `;

    const imagenTarjeta = tarjeta.querySelector("img");

    imagenTarjeta.addEventListener(
        "error",
        () => {
            imagenTarjeta.src =
                "images/miniaturas/sin-miniatura.jpg";
        },
        { once: true }
    );

    tarjeta.addEventListener("click", () => {
        abrirDiscurso(discurso.id);
    });

    tarjeta.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirDiscurso(discurso.id);
        }
    });

    return tarjeta;
}


function abrirDiscurso(id) {
    window.location.href =
        `discurso.html?id=${encodeURIComponent(id)}`;
}


function limpiarFiltros() {
    buscador.value = "";
    filtroAnio.value = "";
    filtroColeccion.value = "";
    filtroLugar.value = "";
    filtroEstado.value = "";
    ordenDiscursos.value = "recientes";

    aplicarFiltros();
}


function actualizarContador(cantidad) {
    if (!contador) {
        return;
    }

    contador.textContent =
        cantidad === 1
            ? "1 discurso encontrado"
            : `${cantidad} discursos encontrados`;
}


function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


function formatearFecha(fecha) {
    if (!fecha) {
        return "Fecha no disponible";
    }

    const partes = String(fecha).split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}


function escaparHTML(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


buscador.addEventListener("input", aplicarFiltros);
filtroAnio.addEventListener("change", aplicarFiltros);
filtroColeccion.addEventListener("change", aplicarFiltros);
filtroLugar.addEventListener("change", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
ordenDiscursos.addEventListener("change", aplicarFiltros);
botonLimpiar.addEventListener("click", limpiarFiltros);