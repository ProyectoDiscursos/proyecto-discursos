const contenedor = document.getElementById("discursos");
const buscador = document.getElementById("buscar-discursos");
const contador = document.getElementById("cantidad-resultados");

const filtroAnio = document.getElementById("filtro-anio");
const filtroColeccion = document.getElementById("filtro-coleccion");
const filtroPais =
    document.getElementById("filtro-pais");

const filtroProvincia =
    document.getElementById("filtro-provincia");

const filtroLocalidad =
    document.getElementById("filtro-localidad");

const filtroLugarEspecifico =
    document.getElementById("filtro-lugar-especifico");
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
        aplicarFiltrosDesdeURL();
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
    cargarPaises();
    cargarEstados();

    filtroProvincia.disabled = true;
    filtroLocalidad.disabled = true;
    filtroLugarEspecifico.disabled = true;
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

function cargarPaises() {
    cargarOpcionesEnSelector(
        filtroPais,
        todosLosDiscursos.map(
            discurso => discurso.pais
        ),
        "Todos los países"
    );
}


function actualizarFiltroProvincias() {
    const paisSeleccionado =
        filtroPais.value;

    const discursosFiltrados =
        todosLosDiscursos.filter(discurso => {
            return (
                !paisSeleccionado ||
                normalizarTexto(discurso.pais) ===
                normalizarTexto(paisSeleccionado)
            );
        });

    cargarOpcionesEnSelector(
        filtroProvincia,
        discursosFiltrados.map(
            discurso => discurso.provincia
        ),
        "Todas las provincias"
    );

    filtroProvincia.disabled =
        !paisSeleccionado ||
        filtroProvincia.options.length <= 1;
}


function actualizarFiltroLocalidades() {
    const paisSeleccionado =
        filtroPais.value;

    const provinciaSeleccionada =
        filtroProvincia.value;

    const discursosFiltrados =
        todosLosDiscursos.filter(discurso => {
            const coincidePais =
                !paisSeleccionado ||
                normalizarTexto(discurso.pais) ===
                normalizarTexto(paisSeleccionado);

            const coincideProvincia =
                !provinciaSeleccionada ||
                normalizarTexto(discurso.provincia) ===
                normalizarTexto(provinciaSeleccionada);

            return (
                coincidePais &&
                coincideProvincia
            );
        });

    cargarOpcionesEnSelector(
        filtroLocalidad,
        discursosFiltrados.map(
            discurso => discurso.localidad
        ),
        "Todas las localidades"
    );

    filtroLocalidad.disabled =
        !paisSeleccionado ||
        filtroLocalidad.options.length <= 1;
}


function actualizarFiltroLugaresEspecificos() {
    const paisSeleccionado =
        filtroPais.value;

    const provinciaSeleccionada =
        filtroProvincia.value;

    const localidadSeleccionada =
        filtroLocalidad.value;

    const discursosFiltrados =
        todosLosDiscursos.filter(discurso => {
            const coincidePais =
                !paisSeleccionado ||
                normalizarTexto(discurso.pais) ===
                normalizarTexto(paisSeleccionado);

            const coincideProvincia =
                !provinciaSeleccionada ||
                normalizarTexto(discurso.provincia) ===
                normalizarTexto(provinciaSeleccionada);

            const coincideLocalidad =
                !localidadSeleccionada ||
                normalizarTexto(discurso.localidad) ===
                normalizarTexto(localidadSeleccionada);

            return (
                coincidePais &&
                coincideProvincia &&
                coincideLocalidad
            );
        });

    const lugares = [];

    discursosFiltrados.forEach(discurso => {
        const lugaresDelDiscurso =
            Array.isArray(
                discurso.lugaresEspecificos
            )
                ? discurso.lugaresEspecificos
                : [];

        lugares.push(...lugaresDelDiscurso);
    });

    cargarOpcionesEnSelector(
        filtroLugarEspecifico,
        lugares,
        "Todos los lugares específicos"
    );

    filtroLugarEspecifico.disabled =
        !paisSeleccionado ||
        filtroLugarEspecifico.options.length <= 1;
}


function cargarOpcionesEnSelector(
    selector,
    valores,
    etiquetaInicial
) {
    const valorAnterior = selector.value;

    selector.innerHTML = "";

    const opcionInicial =
        document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent =
        etiquetaInicial;

    selector.appendChild(opcionInicial);

    const opciones = [
        ...new Set(
            valores
                .map(valor =>
                    String(valor || "").trim()
                )
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(
            b,
            "es",
            {
                sensitivity: "base"
            }
        )
    );

    opciones.forEach(valor => {
        const opcion =
            document.createElement("option");

        opcion.value = valor;
        opcion.textContent = valor;

        selector.appendChild(opcion);
    });

    const valorSigueExistiendo =
        [...selector.options].some(
            opcion =>
                opcion.value === valorAnterior
        );
    selector.value =
        valorSigueExistiendo
            ? valorAnterior
            : "";
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
    const paisSeleccionado = filtroPais.value;
    const provinciaSeleccionada = filtroProvincia.value;
    const localidadSeleccionada = filtroLocalidad.value;
    const lugarEspecificoSeleccionado = filtroLugarEspecifico.value;
    const estadoSeleccionado = filtroEstado.value;
    const ordenSeleccionado = ordenDiscursos.value;

    let resultados = todosLosDiscursos.filter(discurso => {

    const colecciones = Array.isArray(discurso.colecciones)
        ? discurso.colecciones
        : [];

    const lugaresEspecificos =
        Array.isArray(discurso.lugaresEspecificos)
            ? discurso.lugaresEspecificos
            : [];

    const textoCompleto = normalizarTexto(`
        ${discurso.id || ""}
        ${discurso.titulo || ""}
        ${discurso.fecha || ""}
        ${discurso.anio || ""}
        ${discurso.pais || ""}
        ${discurso.provincia || ""}
        ${discurso.localidad || ""}
        ${lugaresEspecificos.join(" ")}
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

const coincidePais =
    !paisSeleccionado ||
    normalizarTexto(discurso.pais || "") ===
        normalizarTexto(paisSeleccionado);

const coincideProvincia =
    !provinciaSeleccionada ||
    normalizarTexto(discurso.provincia || "") ===
        normalizarTexto(provinciaSeleccionada);

const coincideLocalidad =
    !localidadSeleccionada ||
    normalizarTexto(discurso.localidad || "") ===
        normalizarTexto(localidadSeleccionada);

const coincideLugarEspecifico =
    !lugarEspecificoSeleccionado ||
    lugaresEspecificos.some(lugar =>
        normalizarTexto(lugar) ===
        normalizarTexto(lugarEspecificoSeleccionado)
    );

const coincideEstado =
    !estadoSeleccionado ||
    String(discurso.estadoVideo || "") ===
        estadoSeleccionado;

return (
    coincideBusqueda &&
    coincideAnio &&
    coincideColeccion &&
    coincidePais &&
    coincideProvincia &&
    coincideLocalidad &&
    coincideLugarEspecifico &&
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
    discurso.localidad
        ? ` · ${escaparHTML(discurso.localidad)}`
        : discurso.provincia
            ? ` · ${escaparHTML(discurso.provincia)}`
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
    filtroPais.value = "";
    filtroProvincia.value = "";
    filtroLocalidad.value = "";
    filtroLugarEspecifico.value = "";
    filtroEstado.value = "";
    ordenDiscursos.value = "recientes";

    cargarOpcionesEnSelector(
        filtroProvincia,
        [],
        "Todas las provincias"
    );

    cargarOpcionesEnSelector(
        filtroLocalidad,
        [],
        "Todas las localidades"
    );

    cargarOpcionesEnSelector(
        filtroLugarEspecifico,
        [],
        "Todos los lugares específicos"
    );

    filtroProvincia.disabled = true;
    filtroLocalidad.disabled = true;
    filtroLugarEspecifico.disabled = true;

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
function aplicarFiltrosDesdeURL() {
    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const pais =
        parametros.get("pais") || "";

    const provincia =
        parametros.get("provincia") || "";

    const localidad =
        parametros.get("localidad") || "";

    const lugarEspecifico =
        parametros.get(
            "lugarEspecifico"
        ) || "";

    if (pais) {
        filtroPais.value = pais;
    }

    actualizarFiltroProvincias();

    if (provincia) {
        filtroProvincia.value = provincia;
    }

    actualizarFiltroLocalidades();

    if (localidad) {
        filtroLocalidad.value = localidad;
    }

    actualizarFiltroLugaresEspecificos();

    if (lugarEspecifico) {
        filtroLugarEspecifico.value =
            lugarEspecifico;
    }
}

buscador.addEventListener("input", aplicarFiltros);
filtroAnio.addEventListener("change", aplicarFiltros);
filtroColeccion.addEventListener("change", aplicarFiltros);
filtroPais.addEventListener(
    "change",
    () => {
        filtroProvincia.value = "";
        filtroLocalidad.value = "";
        filtroLugarEspecifico.value = "";

        actualizarFiltroProvincias();
        actualizarFiltroLocalidades();
        actualizarFiltroLugaresEspecificos();
        aplicarFiltros();
    }
);


filtroProvincia.addEventListener(
    "change",
    () => {
        filtroLocalidad.value = "";
        filtroLugarEspecifico.value = "";

        actualizarFiltroLocalidades();
        actualizarFiltroLugaresEspecificos();
        aplicarFiltros();
    }
);


filtroLocalidad.addEventListener(
    "change",
    () => {
        filtroLugarEspecifico.value = "";

        actualizarFiltroLugaresEspecificos();
        aplicarFiltros();
    }
);


filtroLugarEspecifico.addEventListener("change", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
ordenDiscursos.addEventListener("change", aplicarFiltros);
botonLimpiar.addEventListener("click", limpiarFiltros);