const formulario =
    document.querySelector(
        ".busqueda-formulario"
    );

const campoConsulta =
    document.getElementById(
        "consulta-busqueda"
    );

const tituloResultados =
    document.querySelector(
        ".busqueda-barra-superior h2"
    );

const cantidadResultados =
    document.querySelector(
        ".busqueda-cantidad"
    );

const desgloseResultados =
    document.getElementById(
        "busqueda-desglose"
    );

const listaResultados =
    document.querySelector(
        ".busqueda-lista"
    );

const selectorOrden =
    document.getElementById(
        "orden-resultados"
    );

const selectorCantidad =
    document.getElementById(
        "resultados-por-pagina"
    );

const resumenPaginacion =
    document.getElementById(
        "resumen-paginacion"
    );

const paginasResultados =
    document.getElementById(
        "paginas-resultados"
    );

const botonAnterior =
    document.getElementById(
        "pagina-anterior"
    );

const botonSiguiente =
    document.getElementById(
        "pagina-siguiente"
    );

const botonAbrirFiltros =
    document.getElementById(
        "abrir-filtros"
    );

const panelFiltros =
    document.getElementById(
        "panel-filtros"
    );

const contadorFiltros =
    document.getElementById(
        "cantidad-filtros-activos"
    );

const filtroAnio =
    document.getElementById(
        "filtro-anio"
    );

const filtroPais =
    document.getElementById(
        "filtro-pais"
    );

const filtroProvincia =
    document.getElementById(
        "filtro-provincia"
    );

const filtroLocalidad =
    document.getElementById(
        "filtro-localidad"
    );

const filtroLugarEspecifico =
    document.getElementById(
        "filtro-lugar-especifico"
    );

const filtroColeccion =
    document.getElementById(
        "filtro-coleccion"
    );

const filtroVideo =
    document.getElementById(
        "filtro-video"
    );

const filtroTranscripcion =
    document.getElementById(
        "filtro-transcripcion"
    );

const botonAplicarFiltros =
    document.getElementById(
        "aplicar-filtros"
    );

const botonLimpiarFiltros =
    document.getElementById(
        "limpiar-filtros"
    );

const contenedorFiltrosActivos =
    document.getElementById(
        "filtros-activos"
    );


let resultadosOriginales = [];
let resultadosFiltrados = [];
let videosDisponibles = new Set();

let consultaActual = "";
let paginaActual = 1;
let resultadosPorPagina = 10;

let filtrosAplicados = {
    anio: "",
    pais: "",
    provincia: "",
    localidad: "",
    lugarEspecifico: "",
    coleccion: "",
    video: false,
    transcripcion: false
};


iniciarBusqueda();


async function iniciarBusqueda() {
    const parametros =
        new URLSearchParams(
            window.location.search
        );

    consultaActual =
        String(
            parametros.get("q") || ""
        ).trim();

    filtrosAplicados = {
        anio:
            parametros.get("anio") || "",
        pais:
            parametros.get("pais") || "",
        provincia:
            parametros.get("provincia") || "",
        localidad:
            parametros.get("localidad") || "",
        lugarEspecifico:
            parametros.get(
                "lugar"
            ) || "",
        coleccion:
            parametros.get(
                "coleccion"
            ) || "",
        video:
            parametros.get("video")
                === "1",
        transcripcion:
            parametros.get(
                "transcripcion"
            ) === "1"
    };

    campoConsulta.value =
        consultaActual;

    prepararEventos();

    const hayFiltros =
        Object.values(
            filtrosAplicados
        ).some(Boolean);

    if (
        !consultaActual
        && !hayFiltros
    ) {
        mostrarEstadoInicial();
        return;
    }

    tituloResultados.textContent =
        consultaActual
            ? `“${consultaActual}”`
            : "Resultados filtrados";

    cantidadResultados.textContent =
        "Buscando en el archivo...";

    listaResultados.innerHTML = `
        <div class="busqueda-cargando">

            <div class="cargando-circulo"></div>

            <p>
                Consultando el archivo...
            </p>

        </div>
    `;

    try {
        await cargarVideosDisponibles();

        resultadosOriginales =
            await buscarEnTodosLosAnios(
                consultaActual
            );

        completarFiltros(
            resultadosOriginales
        );

        trasladarFiltrosAlFormulario();

        aplicarFiltrosYOrden();

    } catch (error) {
        console.error(
            "Error al realizar la búsqueda:",
            error
        );

        mostrarError();
    }
}


function prepararEventos() {
    formulario.addEventListener(
        "submit",
        evento => {
            evento.preventDefault();

            const consulta =
                campoConsulta.value.trim();

            consultaActual =
    consulta;

leerFiltrosDelFormulario();

actualizarURL(
    true
);
        }
    );

    selectorOrden.addEventListener(
        "change",
        () => {
            paginaActual = 1;
            aplicarFiltrosYOrden();
        }
    );

    selectorCantidad.addEventListener(
        "change",
        () => {
            resultadosPorPagina =
                Number(
                    selectorCantidad.value
                ) || 10;

            paginaActual = 1;

            renderizarPagina();
        }
    );

    botonAnterior.addEventListener(
        "click",
        () => {
            if (paginaActual <= 1) {
                return;
            }

            paginaActual -= 1;
            renderizarPagina();
            irAResultados();
        }
    );

    botonSiguiente.addEventListener(
        "click",
        () => {
            const totalPaginas =
                obtenerTotalPaginas();

            if (
                paginaActual
                >= totalPaginas
            ) {
                return;
            }

            paginaActual += 1;
            renderizarPagina();
            irAResultados();
        }
    );

    botonAbrirFiltros?.addEventListener(
    "click",
    () => {
        const estaAbierto =
            botonAbrirFiltros
                .getAttribute(
                    "aria-expanded"
                ) === "true";

        botonAbrirFiltros.setAttribute(
            "aria-expanded",
            String(!estaAbierto)
        );

        panelFiltros.hidden =
            estaAbierto;
    }
);


filtroPais?.addEventListener(
    "change",
    () => {
        actualizarProvincias();
        actualizarLocalidades();
    }
);


filtroProvincia?.addEventListener(
    "change",
    () => {
        actualizarLocalidades();
    }
);


botonAplicarFiltros?.addEventListener(
    "click",
    () => {
        leerFiltrosDelFormulario();

        paginaActual = 1;

        actualizarURL();

        aplicarFiltrosYOrden();

        panelFiltros.hidden = true;

        botonAbrirFiltros.setAttribute(
            "aria-expanded",
            "false"
        );
    }
);


botonLimpiarFiltros?.addEventListener(
    "click",
    () => {
        limpiarFiltros();

        paginaActual = 1;

        actualizarURL();

        aplicarFiltrosYOrden();
    }
);
}


async function cargarVideosDisponibles() {
    try {
        const respuesta =
            await fetch(
                "data/archive_disponibles.json"
            );

        if (!respuesta.ok) {
            return;
        }

        const lista =
            await respuesta.json();

        videosDisponibles =
            new Set(
                lista.map(
                    id =>
                        String(id)
                            .trim()
                            .toUpperCase()
                )
            );
    } catch (error) {
        console.warn(
            "No se pudo cargar la lista de videos.",
            error
        );
    }
}


async function buscarEnTodosLosAnios(
    consulta
) {
    const respuestaIndice =
        await fetch(
            "data/busqueda/indice.json"
        );

    if (!respuestaIndice.ok) {
        throw new Error(
            "No se pudo cargar indice.json"
        );
    }

    const indice =
        await respuestaIndice.json();

    const consultaNormalizada =
        normalizarTexto(
            consulta
        );

    const terminos =
    obtenerTerminosSignificativos(
        consultaNormalizada
    );

    const resultados = [];

    const archivos =
        indice.anios || [];

    let archivosProcesados = 0;

    for (const item of archivos) {
        const respuesta =
            await fetch(
                item.archivo
            );

        if (!respuesta.ok) {
            console.warn(
                `No se pudo cargar ${
                    item.archivo
                }`
            );

            continue;
        }

        const registros =
            await respuesta.json();

        registros.forEach(
    registro => {
        const texto =
            String(
                registro
                    .textoNormalizado
                || ""
            );

        let evaluacion = {
            coincide: true,
            fraseExacta: false,
            terminosEncontrados: 0,
            proximidad: 0
        };

        if (consultaNormalizada) {
            evaluacion =
                evaluarCoincidencia(
                    texto,
                    consultaNormalizada,
                    terminos
                );

            if (!evaluacion.coincide) {
                return;
            }
        }

        resultados.push({
            ...registro,

            tieneVideo:
                videosDisponibles.has(
                    String(
                        registro.id
                    )
                        .trim()
                        .toUpperCase()
                ),

            relevancia:
                consultaNormalizada
                    ? calcularRelevancia(
                        texto,
                        consultaNormalizada,
                        terminos,
                        evaluacion
                    )
                    : 0,

            coincidenciaExacta:
                evaluacion.fraseExacta
        });
    }
);
        archivosProcesados += 1;

        cantidadResultados.textContent =
            `Consultando ${
                archivosProcesados
            } de ${
                archivos.length
            } períodos`;
    }

    return resultados;
}

const PALABRAS_VACIAS = new Set([
    "a",
    "al",
    "ante",
    "bajo",
    "con",
    "contra",
    "de",
    "del",
    "desde",
    "durante",
    "e",
    "el",
    "ella",
    "ellas",
    "ellos",
    "en",
    "entre",
    "hacia",
    "hasta",
    "la",
    "las",
    "lo",
    "los",
    "o",
    "para",
    "por",
    "que",
    "se",
    "sin",
    "sobre",
    "su",
    "sus",
    "un",
    "una",
    "unas",
    "unos",
    "y"
]);


function obtenerTerminosSignificativos(
    consulta
) {
    return normalizarTexto(consulta)
        .split(/\s+/)
        .map(
            termino =>
                termino.trim()
        )
        .filter(Boolean)
        .filter(
            termino =>
                termino.length >= 3
                && !PALABRAS_VACIAS.has(
                    termino
                )
        );
}


function evaluarCoincidencia(
    texto,
    consultaNormalizada,
    terminos
) {
    const fraseExacta =
        Boolean(
            consultaNormalizada
            && texto.includes(
                consultaNormalizada
            )
        );

    if (fraseExacta) {
        return {
            coincide: true,
            fraseExacta: true,
            terminosEncontrados:
                terminos.length,
            proximidad:
                calcularProximidad(
                    texto,
                    terminos
                )
        };
    }

    if (!terminos.length) {
        return {
            coincide: false,
            fraseExacta: false,
            terminosEncontrados: 0,
            proximidad: 0
        };
    }

    const encontrados =
        terminos.filter(
            termino =>
                contienePalabraCompleta(
                    texto,
                    termino
                )
        );

    /*
     * Para búsquedas de varias palabras exigimos
     * que aparezcan todos los términos importantes.
     *
     * "manejo del fuego" pasa a:
     * ["manejo", "fuego"]
     */
    const coincide =
        encontrados.length
        === terminos.length;

    return {
        coincide,
        fraseExacta: false,
        terminosEncontrados:
            encontrados.length,
        proximidad:
            coincide
                ? calcularProximidad(
                    texto,
                    terminos
                )
                : 0
    };
}


function contienePalabraCompleta(
    texto,
    termino
) {
    const patron =
        crearPatronPalabraCompleta(
            termino
        );

    return patron.test(texto);
}


function calcularProximidad(
    texto,
    terminos
) {
    if (terminos.length < 2) {
        return 0;
    }

    const posiciones =
        terminos
            .map(
                termino =>
                    texto.indexOf(
                        termino
                    )
            )
            .filter(
                posicion =>
                    posicion >= 0
            );

    if (
        posiciones.length
        !== terminos.length
    ) {
        return 0;
    }

    const distancia =
        Math.max(...posiciones)
        - Math.min(...posiciones);

    /*
     * Cuanto más cerca estén los términos,
     * mayor será el puntaje.
     */
    return Math.max(
        0,
        500 - distancia
    );
}

function calcularRelevancia(
    texto,
    consulta,
    terminos,
    evaluacion
) {
    let puntuacion = 0;

    if (evaluacion.fraseExacta) {
        puntuacion += 10000;

        puntuacion +=
            contarApariciones(
                texto,
                consulta
            ) * 100;
    }

    terminos.forEach(
        termino => {
            puntuacion +=
                contarApariciones(
                    texto,
                    termino
                ) * 10;
        }
    );

    puntuacion +=
        evaluacion.proximidad;

    return puntuacion;
}

function contarApariciones(
    texto,
    termino
) {
    if (!termino) {
        return 0;
    }

    let cantidad = 0;
    let posicion = 0;

    while (
        (
            posicion =
                texto.indexOf(
                    termino,
                    posicion
                )
        ) !== -1
    ) {
        cantidad += 1;
        posicion += termino.length;
    }

    return cantidad;
}


function aplicarFiltrosYOrden() {
    resultadosFiltrados =
        resultadosOriginales.filter(
            resultado => {
                if (
                    filtrosAplicados.anio
                    && String(
                        resultado.anio
                    )
                    !== filtrosAplicados.anio
                ) {
                    return false;
                }

                if (
                    filtrosAplicados.pais
                    && normalizarTexto(
                        resultado.pais
                    )
                    !== normalizarTexto(
                        filtrosAplicados.pais
                    )
                ) {
                    return false;
                }

                if (
                    filtrosAplicados.provincia
                    && normalizarTexto(
                        resultado.provincia
                    )
                    !== normalizarTexto(
                        filtrosAplicados.provincia
                    )
                ) {
                    return false;
                }

                if (
                    filtrosAplicados.localidad
                    && normalizarTexto(
                        resultado.localidad
                    )
                    !== normalizarTexto(
                        filtrosAplicados.localidad
                    )
                ) {
                    return false;
                }

                if (
                    filtrosAplicados
                        .lugarEspecifico
                ) {
                    const lugares =
                        resultado
                            .lugaresEspecificos
                        || [];

                    const coincideLugar =
                        lugares.some(
                            lugar =>
                                normalizarTexto(
                                    lugar
                                )
                                ===
                                normalizarTexto(
                                    filtrosAplicados
                                        .lugarEspecifico
                                )
                        );

                    if (!coincideLugar) {
                        return false;
                    }
                }

                if (
                    filtrosAplicados.coleccion
                ) {
                    const colecciones =
                        resultado.colecciones
                        || [];

                    const coincideColeccion =
                        colecciones.some(
                            coleccion =>
                                normalizarTexto(
                                    coleccion
                                )
                                ===
                                normalizarTexto(
                                    filtrosAplicados
                                        .coleccion
                                )
                        );

                    if (
                        !coincideColeccion
                    ) {
                        return false;
                    }
                }

                if (
                    filtrosAplicados.video
                    && !resultado.tieneVideo
                ) {
                    return false;
                }

                if (
                    filtrosAplicados
                        .transcripcion
                    && !resultado
                        .tieneTranscripcion
                ) {
                    return false;
                }

                return true;
            }
        );

    ordenarResultados();

    paginaActual = 1;

    actualizarContadorFiltros();

    renderizarPagina();
}


function ordenarResultados() {
    const orden =
        selectorOrden.value;

    resultadosFiltrados.sort(
        (a, b) => {
            if (
                orden === "recientes"
            ) {
                return String(
                    b.fecha || ""
                ).localeCompare(
                    String(
                        a.fecha || ""
                    )
                );
            }

            if (
                orden === "antiguos"
            ) {
                return String(
                    a.fecha || ""
                ).localeCompare(
                    String(
                        b.fecha || ""
                    )
                );
            }

            return (
                Number(
                    b.relevancia || 0
                )
                -
                Number(
                    a.relevancia || 0
                )
            );
        }
    );
}


async function renderizarPagina() {
    const total =
        resultadosFiltrados.length;

    actualizarEncabezado(
        total
    );

    if (!total) {
        mostrarSinResultados();
        actualizarPaginacion();
        return;
    }

    const inicio =
        (
            paginaActual - 1
        )
        * resultadosPorPagina;

    const fin =
        Math.min(
            inicio
            + resultadosPorPagina,
            total
        );

    const resultadosPagina =
        resultadosFiltrados.slice(
            inicio,
            fin
        );

    listaResultados.innerHTML = `
        <div class="busqueda-cargando">
            <div class="cargando-circulo"></div>
            <p>
                Preparando resultados...
            </p>
        </div>
    `;

    const tarjetas =
        await Promise.all(
            resultadosPagina.map(
                crearTarjetaResultado
            )
        );

    listaResultados.innerHTML =
        tarjetas.join("");

    actualizarPaginacion();
}


async function crearTarjetaResultado(
    resultado
) {
    const fecha =
        descomponerFecha(
            resultado.fecha
        );

    const ubicacion =
        [
            resultado.localidad,
            resultado.provincia,
            resultado.pais
        ]
            .filter(Boolean)
            .filter(
                (
                    valor,
                    indice,
                    lista
                ) =>
                    lista.indexOf(
                        valor
                    ) === indice
            )
            .join(", ");

    const colecciones =
        (
            resultado.colecciones
            || []
        ).join(", ");

    const fragmento =
        await obtenerFragmento(
            resultado
        );

    return `
        <article class="resultado-busqueda">

            <div class="resultado-fecha">

                <span>
                    ${fecha.dia}
                </span>

                <small>
                    ${fecha.mes} ${fecha.anio}
                </small>

            </div>

            <div class="resultado-contenido">

                <p class="resultado-id">
                    ${
                        escaparHTML(
                            resultado.id
                        )
                    }
                </p>
${
    consultaActual
        ? `
            <span
                class="
                    resultado-tipo-coincidencia
                    ${
                        resultado
                            .coincidenciaExacta
                            ? "exacta"
                            : "relacionada"
                    }
                "
            >
                ${
                    resultado
                        .coincidenciaExacta
                        ? "Frase exacta"
                        : "Coincidencia por términos"
                }
            </span>
        `
        : ""
}
                <h3>
                    <a
                        href="discurso.html?id=${
                            encodeURIComponent(
                                resultado.id
                            )
                        }"
                    >
                        ${
                            escaparHTML(
                                resultado.titulo
                            )
                        }
                    </a>
                </h3>

                <div class="resultado-metadatos">

                    ${
                        ubicacion
                            ? `
                                <span>
                                    📍 ${
                                        escaparHTML(
                                            ubicacion
                                        )
                                    }
                                </span>
                            `
                            : ""
                    }

                    ${
                        colecciones
                            ? `
                                <span>
                                    🗂️ ${
                                        escaparHTML(
                                            colecciones
                                        )
                                    }
                                </span>
                            `
                            : ""
                    }

                    ${
                        resultado.tieneVideo
                            ? `
                                <span>
                                    🎥 Video disponible
                                </span>
                            `
                            : ""
                    }

                </div>

                ${
                    fragmento
                        ? `
                            <blockquote
                                class="resultado-fragmento"
                            >
                                ${fragmento}
                            </blockquote>
                        `
                        : ""
                }

                <a
                    class="resultado-enlace"
                    href="discurso.html?id=${
                        encodeURIComponent(
                            resultado.id
                        )
                    }"
                >
                    Ver discurso →
                </a>

            </div>

        </article>
    `;
}


async function obtenerFragmento(
    resultado
) {
    if (
        !resultado.tieneTranscripcion
    ) {
        return "";
    }

    try {
        const respuesta =
            await fetch(
                `data/transcripciones/${
                    encodeURIComponent(
                        resultado.id
                    )
                }.txt`
            );

        if (!respuesta.ok) {
            return "";
        }

        const texto =
            await respuesta.text();

        return crearFragmento(
            texto,
            consultaActual
        );
    } catch (error) {
        console.warn(
            `No se pudo cargar la transcripción de ${
                resultado.id
            }`
        );

        return "";
    }
}


function crearFragmento(
    textoOriginal,
    consulta
) {
    const consultaNormalizada =
        normalizarTexto(consulta);

    if (
        !textoOriginal
        || !consultaNormalizada
    ) {
        return "";
    }

    const {
        textoNormalizado,
        mapa
    } = normalizarConMapa(
        textoOriginal
    );

    const coincidencia =
        buscarCoincidenciaExacta(
            textoNormalizado,
            consultaNormalizada
        )
        ||
        buscarCoincidenciaPorTerminos(
            textoNormalizado,
            consultaNormalizada
        );

    if (!coincidencia) {
        return "";
    }

    const inicioNormalizado =
        coincidencia.inicio;

    const finNormalizado =
        coincidencia.fin;

    const inicioOriginal =
        mapa[inicioNormalizado];

    const ultimoIndiceNormalizado =
        Math.max(
            inicioNormalizado,
            finNormalizado - 1
        );

    const ultimoIndiceOriginal =
        mapa[ultimoIndiceNormalizado];

    if (
        inicioOriginal === undefined
        || ultimoIndiceOriginal === undefined
    ) {
        return "";
    }

    const finOriginal =
        ultimoIndiceOriginal + 1;

    const margenAnterior = 220;
    const margenPosterior = 260;

    let inicioFragmento =
        Math.max(
            0,
            inicioOriginal
            - margenAnterior
        );

    let finFragmento =
        Math.min(
            textoOriginal.length,
            finOriginal
            + margenPosterior
        );

    inicioFragmento =
        buscarInicioPalabra(
            textoOriginal,
            inicioFragmento
        );

    finFragmento =
        buscarFinPalabra(
            textoOriginal,
            finFragmento
        );

    const antes =
        textoOriginal.slice(
            inicioFragmento,
            inicioOriginal
        );

    const textoCoincidencia =
        textoOriginal.slice(
            inicioOriginal,
            finOriginal
        );

    const despues =
        textoOriginal.slice(
            finOriginal,
            finFragmento
        );

    return `
        ${
            inicioFragmento > 0
                ? "…"
                : ""
        }${
            escaparHTML(antes)
        }<mark>${
            escaparHTML(
                textoCoincidencia
            )
        }</mark>${
            escaparHTML(despues)
        }${
            finFragmento
            < textoOriginal.length
                ? "…"
                : ""
        }
    `;
}


function buscarCoincidenciaExacta(
    texto,
    consulta
) {
    const patron =
        crearPatronPalabraCompleta(
            consulta
        );

    const coincidencia =
        patron.exec(texto);

    if (!coincidencia) {
        return null;
    }

    const prefijo =
        coincidencia[1] || "";

    const inicio =
        coincidencia.index
        + prefijo.length;

    return {
        inicio,
        fin:
            inicio
            + consulta.length
    };
}


function buscarCoincidenciaPorTerminos(
    texto,
    consulta
) {
    const terminos =
        obtenerTerminosSignificativos(
            consulta
        ).sort(
            (a, b) =>
                b.length - a.length
        );

    let mejorCoincidencia = null;

    for (
        const termino
        of terminos
    ) {
        const patron =
            crearPatronPalabraCompleta(
                termino
            );

        const coincidencia =
            patron.exec(texto);

        if (!coincidencia) {
            continue;
        }

        const prefijo =
            coincidencia[1] || "";

        const inicio =
            coincidencia.index
            + prefijo.length;

        const resultado = {
            inicio,
            fin:
                inicio
                + termino.length,
            longitud:
                termino.length
        };

        if (
            !mejorCoincidencia
            || resultado.inicio
                < mejorCoincidencia.inicio
            || (
                resultado.inicio
                === mejorCoincidencia.inicio
                && resultado.longitud
                    > mejorCoincidencia.longitud
            )
        ) {
            mejorCoincidencia =
                resultado;
        }
    }

    return mejorCoincidencia;
}


function crearPatronPalabraCompleta(
    texto
) {
    const textoSeguro =
        escaparExpresionRegular(
            texto
        );

    return new RegExp(
        `(^|[^a-z0-9])(${textoSeguro})(?=[^a-z0-9]|$)`,
        "i"
    );
}


function escaparExpresionRegular(
    texto
) {
    return String(texto)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
}


function normalizarConMapa(
    texto
) {
    let textoNormalizado = "";
    const mapa = [];

    let ultimoFueEspacio = false;

    for (
        let indice = 0;
        indice < texto.length;
        indice += 1
    ) {
        const caracterOriginal =
            texto[indice];

        const caracteresNormalizados =
            caracterOriginal
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase();

        for (
            const caracter
            of caracteresNormalizados
        ) {
            const esEspacio =
                /\s/.test(caracter);

            if (esEspacio) {
                if (
                    ultimoFueEspacio
                    || textoNormalizado.length
                        === 0
                ) {
                    continue;
                }

                textoNormalizado += " ";
                mapa.push(indice);

                ultimoFueEspacio = true;
                continue;
            }

            textoNormalizado +=
                caracter;

            mapa.push(indice);

            ultimoFueEspacio = false;
        }
    }

    if (
        textoNormalizado.endsWith(" ")
    ) {
        textoNormalizado =
            textoNormalizado.slice(
                0,
                -1
            );

        mapa.pop();
    }

    return {
        textoNormalizado,
        mapa
    };
}

function buscarInicioPalabra(
    texto,
    posicion
) {
    while (
        posicion > 0
        && !/\s/.test(
            texto[posicion - 1]
        )
    ) {
        posicion -= 1;
    }

    return posicion;
}


function buscarFinPalabra(
    texto,
    posicion
) {
    while (
        posicion < texto.length
        && !/\s/.test(
            texto[posicion]
        )
    ) {
        posicion += 1;
    }

    return posicion;
}


function actualizarEncabezado(
    total
) {
    tituloResultados.textContent =
        consultaActual
            ? `“${consultaActual}”`
            : "Resultados filtrados";

    cantidadResultados.textContent =
        `${total} ${
            total === 1
                ? "discurso encontrado"
                : "discursos encontrados"
        }`;

    if (
        !desgloseResultados
        || !consultaActual
        || total === 0
    ) {
        if (desgloseResultados) {
            desgloseResultados.hidden =
                true;

            desgloseResultados.textContent =
                "";
        }

        return;
    }

    const coincidenciasExactas =
        resultadosFiltrados.filter(
            resultado =>
                resultado
                    .coincidenciaExacta
        ).length;

    const coincidenciasRelacionadas =
        total
        - coincidenciasExactas;

    desgloseResultados.textContent =
        `${
            coincidenciasExactas
        } ${
            coincidenciasExactas === 1
                ? "coincidencia exacta"
                : "coincidencias exactas"
        } · ${
            coincidenciasRelacionadas
        } ${
            coincidenciasRelacionadas === 1
                ? "coincidencia relacionada"
                : "coincidencias relacionadas"
        }`;

    desgloseResultados.hidden =
        false;
}


function actualizarPaginacion() {
    const total =
        resultadosFiltrados.length;

    const totalPaginas =
        obtenerTotalPaginas();

    if (!total) {
        resumenPaginacion.textContent =
            "Sin resultados";

        paginasResultados.innerHTML = "";

        botonAnterior.disabled = true;
        botonSiguiente.disabled = true;

        return;
    }

    const inicio =
        (
            paginaActual - 1
        )
        * resultadosPorPagina
        + 1;

    const fin =
        Math.min(
            paginaActual
            * resultadosPorPagina,
            total
        );

    resumenPaginacion.textContent =
        `Mostrando ${
            inicio
        }–${
            fin
        } de ${
            total
        } resultados`;

    botonAnterior.disabled =
        paginaActual === 1;

    botonSiguiente.disabled =
        paginaActual >= totalPaginas;

    renderizarBotonesPaginas(
        totalPaginas
    );
}


function renderizarBotonesPaginas(
    totalPaginas
) {
    paginasResultados.innerHTML = "";

    const paginas =
        obtenerPaginasVisibles(
            totalPaginas
        );

    paginas.forEach(
        pagina => {
            if (
                pagina === "..."
            ) {
                const separador =
                    document.createElement(
                        "span"
                    );

                separador.textContent =
                    "…";

                paginasResultados.appendChild(
                    separador
                );

                return;
            }

            const boton =
                document.createElement(
                    "button"
                );

            boton.type = "button";
            boton.textContent =
                pagina;

            if (
                pagina
                === paginaActual
            ) {
                boton.classList.add(
                    "activo"
                );

                boton.setAttribute(
                    "aria-current",
                    "page"
                );
            }

            boton.addEventListener(
                "click",
                () => {
                    paginaActual =
                        pagina;

                    renderizarPagina();
                    irAResultados();
                }
            );

            paginasResultados.appendChild(
                boton
            );
        }
    );
}


function obtenerPaginasVisibles(
    totalPaginas
) {
    if (totalPaginas <= 7) {
        return Array.from(
            {
                length:
                    totalPaginas
            },
            (_, indice) =>
                indice + 1
        );
    }

    if (paginaActual <= 4) {
        return [
            1,
            2,
            3,
            4,
            5,
            "...",
            totalPaginas
        ];
    }

    if (
        paginaActual
        >= totalPaginas - 3
    ) {
        return [
            1,
            "...",
            totalPaginas - 4,
            totalPaginas - 3,
            totalPaginas - 2,
            totalPaginas - 1,
            totalPaginas
        ];
    }

    return [
        1,
        "...",
        paginaActual - 1,
        paginaActual,
        paginaActual + 1,
        "...",
        totalPaginas
    ];
}


function obtenerTotalPaginas() {
    return Math.max(
        1,
        Math.ceil(
            resultadosFiltrados.length
            / resultadosPorPagina
        )
    );
}

function completarFiltros(
    registros
) {
    completarSelect(
        filtroAnio,
        obtenerValoresUnicos(
            registros.map(
                registro =>
                    String(
                        registro.anio || ""
                    )
            )
        ),
        "Todos los años"
    );

    completarSelect(
        filtroPais,
        obtenerValoresUnicos(
            registros.map(
                registro =>
                    registro.pais
            )
        ),
        "Todos los países"
    );

    completarSelect(
        filtroLugarEspecifico,
        obtenerValoresUnicos(
            registros.flatMap(
                registro =>
                    registro
                        .lugaresEspecificos
                    || []
            )
        ),
        "Todos los lugares"
    );

    completarSelect(
        filtroColeccion,
        obtenerValoresUnicos(
            registros.flatMap(
                registro =>
                    registro.colecciones
                    || []
            )
        ),
        "Todas las colecciones"
    );

    actualizarProvincias();
    actualizarLocalidades();
}


function completarSelect(
    select,
    valores,
    textoInicial
) {
    if (!select) {
        return;
    }

    const valorActual =
        select.value;

    select.innerHTML = "";

    const opcionInicial =
        document.createElement(
            "option"
        );

    opcionInicial.value = "";
    opcionInicial.textContent =
        textoInicial;

    select.appendChild(
        opcionInicial
    );

    valores.forEach(
        valor => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value = valor;
            opcion.textContent = valor;

            select.appendChild(
                opcion
            );
        }
    );

    if (
        valores.includes(
            valorActual
        )
    ) {
        select.value =
            valorActual;
    }
}


function obtenerValoresUnicos(
    valores
) {
const lista = [
    ...new Set(
        valores
            .map(
                valor =>
                    String(
                        valor || ""
                    ).trim()
            )
            .filter(Boolean)
    )
];

lista.sort(
    (a, b) => {

        if (a === "Argentina") {
            return -1;
        }

        if (b === "Argentina") {
            return 1;
        }

        return a.localeCompare(
            b,
            "es",
            {
                sensitivity: "base",
                numeric: true
            }
        );

    }
);

return lista;
}


function actualizarProvincias() {
    const pais =
        filtroPais?.value || "";

    const provincias =
        obtenerValoresUnicos(
            resultadosOriginales
                .filter(
                    registro =>
                        !pais
                        ||
                        normalizarTexto(
                            registro.pais
                        )
                        ===
                        normalizarTexto(
                            pais
                        )
                )
                .map(
                    registro =>
                        registro.provincia
                )
        );

    completarSelect(
        filtroProvincia,
        provincias,
        "Todas las provincias"
    );

    filtroProvincia.disabled =
        provincias.length === 0;
}


function actualizarLocalidades() {
    const pais =
        filtroPais?.value || "";

    const provincia =
        filtroProvincia?.value
        || "";

    const localidades =
        obtenerValoresUnicos(
            resultadosOriginales
                .filter(
                    registro => {
                        const coincidePais =
                            !pais
                            ||
                            normalizarTexto(
                                registro.pais
                            )
                            ===
                            normalizarTexto(
                                pais
                            );

                        const coincideProvincia =
                            !provincia
                            ||
                            normalizarTexto(
                                registro.provincia
                            )
                            ===
                            normalizarTexto(
                                provincia
                            );

                        return (
                            coincidePais
                            && coincideProvincia
                        );
                    }
                )
                .map(
                    registro =>
                        registro.localidad
                )
        );

    completarSelect(
        filtroLocalidad,
        localidades,
        "Todas las localidades"
    );

    filtroLocalidad.disabled =
        localidades.length === 0;
}


function leerFiltrosDelFormulario() {
    filtrosAplicados = {
        anio:
            filtroAnio?.value || "",

        pais:
            filtroPais?.value || "",

        provincia:
            filtroProvincia?.value
            || "",

        localidad:
            filtroLocalidad?.value
            || "",

        lugarEspecifico:
            filtroLugarEspecifico
                ?.value
            || "",

        coleccion:
            filtroColeccion?.value
            || "",

        video:
            Boolean(
                filtroVideo?.checked
            ),

        transcripcion:
            Boolean(
                filtroTranscripcion
                    ?.checked
            )
    };
}


function trasladarFiltrosAlFormulario() {
    filtroAnio.value =
        filtrosAplicados.anio;

    filtroPais.value =
        filtrosAplicados.pais;

    actualizarProvincias();

    filtroProvincia.value =
        filtrosAplicados.provincia;

    actualizarLocalidades();

    filtroLocalidad.value =
        filtrosAplicados.localidad;

    filtroLugarEspecifico.value =
        filtrosAplicados
            .lugarEspecifico;

    filtroColeccion.value =
        filtrosAplicados.coleccion;

    filtroVideo.checked =
        filtrosAplicados.video;

    filtroTranscripcion.checked =
        filtrosAplicados
            .transcripcion;

    actualizarContadorFiltros();
}


function limpiarFiltros() {
    filtrosAplicados = {
        anio: "",
        pais: "",
        provincia: "",
        localidad: "",
        lugarEspecifico: "",
        coleccion: "",
        video: false,
        transcripcion: false
    };

    filtroAnio.value = "";
    filtroPais.value = "";

    actualizarProvincias();
    actualizarLocalidades();

    filtroLugarEspecifico.value =
        "";

    filtroColeccion.value = "";
    filtroVideo.checked = false;

    filtroTranscripcion.checked =
        false;

    actualizarContadorFiltros();
}


function actualizarContadorFiltros() {
    const filtros = obtenerFiltrosActivos();

    contadorFiltros.textContent =
        String(filtros.length);

    contadorFiltros.hidden =
        filtros.length === 0;

    renderizarFiltrosActivos(
        filtros
    );
}

function obtenerFiltrosActivos() {
    const filtros = [];

    if (filtrosAplicados.anio) {
        filtros.push({
            clave: "anio",
            etiqueta:
                `Año: ${filtrosAplicados.anio}`
        });
    }

    if (filtrosAplicados.pais) {
        filtros.push({
            clave: "pais",
            etiqueta:
                filtrosAplicados.pais
        });
    }

    if (filtrosAplicados.provincia) {
        filtros.push({
            clave: "provincia",
            etiqueta:
                filtrosAplicados.provincia
        });
    }

    if (filtrosAplicados.localidad) {
        filtros.push({
            clave: "localidad",
            etiqueta:
                filtrosAplicados.localidad
        });
    }

    if (
        filtrosAplicados
            .lugarEspecifico
    ) {
        filtros.push({
            clave: "lugarEspecifico",
            etiqueta:
                filtrosAplicados
                    .lugarEspecifico
        });
    }

    if (filtrosAplicados.coleccion) {
        filtros.push({
            clave: "coleccion",
            etiqueta:
                filtrosAplicados.coleccion
        });
    }

    if (filtrosAplicados.video) {
        filtros.push({
            clave: "video",
            etiqueta: "Con video"
        });
    }

    if (
        filtrosAplicados
            .transcripcion
    ) {
        filtros.push({
            clave: "transcripcion",
            etiqueta:
                "Con transcripción"
        });
    }

    return filtros;
}


function renderizarFiltrosActivos(
    filtros
) {
    if (
        !contenedorFiltrosActivos
    ) {
        return;
    }

    if (!filtros.length) {
        contenedorFiltrosActivos
            .innerHTML = "";

        contenedorFiltrosActivos
            .hidden = true;

        return;
    }

    contenedorFiltrosActivos
        .hidden = false;

    contenedorFiltrosActivos
        .innerHTML =
            filtros.map(
                filtro => `
                    <button
                        type="button"
                        class="busqueda-chip-filtro"
                        data-filtro="${
                            escaparHTML(
                                filtro.clave
                            )
                        }"
                        aria-label="Quitar filtro ${
                            escaparHTML(
                                filtro.etiqueta
                            )
                        }"
                    >
                        <span>
                            ${
                                escaparHTML(
                                    filtro.etiqueta
                                )
                            }
                        </span>

                        <span
                            aria-hidden="true"
                        >
                            ×
                        </span>
                    </button>
                `
            ).join("");

    contenedorFiltrosActivos
        .querySelectorAll(
            ".busqueda-chip-filtro"
        )
        .forEach(
            boton => {
                boton.addEventListener(
                    "click",
                    () => {
                        quitarFiltro(
                            boton.dataset
                                .filtro
                        );
                    }
                );
            }
        );
}


function quitarFiltro(
    clave
) {
    if (
        clave === "video"
        || clave === "transcripcion"
    ) {
        filtrosAplicados[clave] =
            false;
    } else {
        filtrosAplicados[clave] =
            "";
    }

    trasladarFiltrosAlFormulario();

    paginaActual = 1;

    actualizarURL();

    aplicarFiltrosYOrden();
}

function actualizarURL(
    recargar = false
) {
    const parametros =
        new URLSearchParams();

    const consulta =
        campoConsulta.value.trim();

    if (consulta) {
        parametros.set(
            "q",
            consulta
        );
    }

    if (filtrosAplicados.anio) {
        parametros.set(
            "anio",
            filtrosAplicados.anio
        );
    }

    if (filtrosAplicados.pais) {
        parametros.set(
            "pais",
            filtrosAplicados.pais
        );
    }

    if (
        filtrosAplicados.provincia
    ) {
        parametros.set(
            "provincia",
            filtrosAplicados
                .provincia
        );
    }

    if (
        filtrosAplicados.localidad
    ) {
        parametros.set(
            "localidad",
            filtrosAplicados
                .localidad
        );
    }

    if (
        filtrosAplicados
            .lugarEspecifico
    ) {
        parametros.set(
            "lugar",
            filtrosAplicados
                .lugarEspecifico
        );
    }

    if (
        filtrosAplicados.coleccion
    ) {
        parametros.set(
            "coleccion",
            filtrosAplicados
                .coleccion
        );
    }

    if (filtrosAplicados.video) {
        parametros.set(
            "video",
            "1"
        );
    }

    if (
        filtrosAplicados
            .transcripcion
    ) {
        parametros.set(
            "transcripcion",
            "1"
        );
    }

    const url =
        `buscar.html${
            parametros.toString()
                ? `?${
                    parametros.toString()
                }`
                : ""
        }`;

    if (recargar) {
        window.location.href = url;
        return;
    }

    window.history.replaceState(
        {},
        "",
        url
    );
}

function descomponerFecha(
    fecha
) {
    const meses = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC"
    ];

    const partes =
        String(fecha || "")
            .split("-");

    if (
        partes.length !== 3
    ) {
        return {
            dia: "—",
            mes: "",
            anio: ""
        };
    }

    const anio =
        partes[0];

    const mes =
        meses[
            Number(
                partes[1]
            ) - 1
        ] || "";

    const dia =
        partes[2];

    return {
        dia,
        mes,
        anio
    };
}


function normalizarTexto(
    texto
) {
    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}


function escaparHTML(
    texto
) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll(
            "'",
            "&#039;"
        );
}


function mostrarEstadoInicial() {
    tituloResultados.textContent =
        "Ingresá una búsqueda";

    cantidadResultados.textContent =
        "Escribí una palabra o frase para consultar el archivo.";

    listaResultados.innerHTML = `
        <div class="busqueda-sin-resultados">
            <h3>
                Buscá dentro de casi dos mil discursos
            </h3>

            <p>
                Podés buscar nombres, conceptos,
                políticas públicas o frases completas.
            </p>
        </div>
    `;

    resumenPaginacion.textContent = "";
    paginasResultados.innerHTML = "";

    botonAnterior.disabled = true;
    botonSiguiente.disabled = true;
}


function mostrarSinResultados() {
    listaResultados.innerHTML = `
        <div class="busqueda-sin-resultados">

            <h3>
                No encontramos coincidencias
            </h3>

            <p>
                Probá con menos palabras,
                otra expresión o una variante
                del término buscado.
            </p>

        </div>
    `;
}


function mostrarError() {
    cantidadResultados.textContent =
        "No se pudo completar la búsqueda.";

    listaResultados.innerHTML = `
        <div class="busqueda-sin-resultados">

            <h3>
                Ocurrió un problema
            </h3>

            <p>
                Revisá que los archivos del índice
                estén disponibles e intentá nuevamente.
            </p>

        </div>
    `;
}


function irAResultados() {
    document
        .querySelector(
            ".busqueda-resultados"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}