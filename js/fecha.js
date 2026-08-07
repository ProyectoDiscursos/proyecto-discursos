const selectorMes =
    document.getElementById(
        "fecha-mes"
    );

const selectorAnio =
    document.getElementById(
        "fecha-anio"
    );

const calendarioDias =
    document.querySelector(
        ".fecha-dias"
    );

const botonesNavegacionMes =
    [
        ...document.querySelectorAll(
            "#vista-calendario .fecha-navegacion"
        )
    ];

const tituloResultados =
    document.getElementById(
        "fecha-resultados-titulo"
    );

const cantidadResultados =
    document.getElementById(
        "fecha-resultados-cantidad"
    );

const listaResultados =
    document.getElementById(
        "fecha-resultados-lista"
    );

const botonesModo =
    [
        ...document.querySelectorAll(
            ".fecha-modo"
        )
    ];

const vistaCalendario =
    document.getElementById(
        "vista-calendario"
    );

const vistaAnio =
    document.getElementById(
        "vista-anio"
    );

const vistaEtapas =
    document.getElementById(
        "vista-etapas"
    );

const selectorAnioVista =
    document.getElementById(
        "fecha-anio-vista"
    );

const botonAnioAnterior =
    document.getElementById(
        "anio-anterior"
    );

const botonAnioSiguiente =
    document.getElementById(
        "anio-siguiente"
    );

const grillaMeses =
    document.getElementById(
        "fecha-meses-grilla"
    );


let discursos = [];
let fechaSeleccionada = null;
let modoActual = "dia";


iniciarFecha();


async function iniciarFecha() {
    try {
        const respuesta =
            await fetch(
                "data/discursos.json"
            );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar discursos.json"
            );
        }

        discursos =
            await respuesta.json();

        completarSelectoresDeAnio();

        prepararEventos();

        const fechaInicial =
            obtenerFechaInicial();

        selectorMes.value =
            String(
                fechaInicial.getMonth() + 1
            );

        selectorAnio.value =
            String(
                fechaInicial.getFullYear()
            );

        selectorAnioVista.value =
            String(
                fechaInicial.getFullYear()
            );

        mostrarVistaCorrespondiente();

        renderizarCalendario();

        mostrarEstadoDia();

    } catch (error) {
        console.error(
            "Error al cargar la página de fecha:",
            error
        );

        listaResultados.innerHTML = `
            <div class="fecha-resultados-vacio">

                <p>
                    No se pudieron cargar los discursos.
                </p>

            </div>
        `;
    }
}


function prepararEventos() {
    selectorMes.addEventListener(
        "change",
        () => {
            fechaSeleccionada = null;

            renderizarCalendario();

            if (modoActual === "mes") {
                mostrarResultadosMes();
            }
        }
    );


    selectorAnio.addEventListener(
        "change",
        () => {
            fechaSeleccionada = null;

            renderizarCalendario();

            if (modoActual === "mes") {
                mostrarResultadosMes();
            }
        }
    );


    botonesNavegacionMes.forEach(
        (boton, indice) => {
            boton.addEventListener(
                "click",
                () => {
                    cambiarMes(
                        indice === 0
                            ? -1
                            : 1
                    );
                }
            );
        }
    );


    botonesModo.forEach(
        boton => {
            boton.addEventListener(
                "click",
                () => {
                    cambiarModo(
                        boton.dataset.modo
                    );
                }
            );
        }
    );


    selectorAnioVista.addEventListener(
        "change",
        () => {
            renderizarVistaAnio();
        }
    );


    botonAnioAnterior.addEventListener(
        "click",
        () => {
            cambiarAnioVista(-1);
        }
    );


    botonAnioSiguiente.addEventListener(
        "click",
        () => {
            cambiarAnioVista(1);
        }
    );
}


function cambiarModo(
    nuevoModo
) {
    modoActual = nuevoModo;

    fechaSeleccionada = null;

    botonesModo.forEach(
        boton => {
            boton.classList.toggle(
                "activo",
                boton.dataset.modo
                === modoActual
            );
        }
    );

    mostrarVistaCorrespondiente();

    if (modoActual === "dia") {
        renderizarCalendario();
        mostrarEstadoDia();
        return;
    }

    if (modoActual === "mes") {
        renderizarCalendario();
        mostrarResultadosMes();
        return;
    }

    if (modoActual === "anio") {
        sincronizarAnioVista();
        renderizarVistaAnio();
        return;
    }

    if (modoActual === "etapas") {
        mostrarEstadoProximamente(
            "Etapas",
            "La navegación por etapas históricas estará disponible próximamente."
        );
    }
}


function mostrarVistaCorrespondiente() {
    vistaCalendario.hidden =
        modoActual === "anio"
        || modoActual === "etapas";

    vistaAnio.hidden =
        modoActual !== "anio";

    vistaEtapas.hidden =
        modoActual !== "etapas";
}


function mostrarEstadoDia() {
    tituloResultados.textContent =
        "Elegí una fecha";

    cantidadResultados.textContent =
        "Seleccioná un día del calendario.";

    listaResultados.innerHTML = `
        <div class="fecha-resultados-vacio">

            <p>
                Cuando elijas una fecha,
                los discursos aparecerán acá.
            </p>

        </div>
    `;
}


function mostrarEstadoProximamente(
    titulo,
    texto
) {
    tituloResultados.textContent =
        titulo;

    cantidadResultados.textContent =
        "";

    listaResultados.innerHTML = `
        <div class="fecha-resultados-vacio">

            <p>
                ${escaparHTML(texto)}
            </p>

        </div>
    `;
}


function completarSelectoresDeAnio() {
    const anios =
        obtenerAniosDisponibles();

    completarSelectorAnio(
        selectorAnio,
        anios
    );

    completarSelectorAnio(
        selectorAnioVista,
        anios
    );
}


function completarSelectorAnio(
    selector,
    anios
) {
    const valorAnterior =
        selector.value;

    selector.innerHTML = "";

    anios.forEach(
        anio => {
            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                String(anio);

            opcion.textContent =
                String(anio);

            selector.appendChild(
                opcion
            );
        }
    );

    if (
        anios.includes(
            Number(valorAnterior)
        )
    ) {
        selector.value =
            valorAnterior;
    }
}


function obtenerAniosDisponibles() {
    return [
        ...new Set(
            discursos
                .map(
                    discurso =>
                        obtenerAnioDiscurso(
                            discurso
                        )
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            b - a
    );
}


function obtenerAnioDiscurso(
    discurso
) {
    const anioDirecto =
        Number(
            discurso.anio
        );

    if (anioDirecto) {
        return anioDirecto;
    }

    const fecha =
        String(
            discurso.fecha || ""
        );

    return Number(
        fecha.slice(0, 4)
    ) || null;
}


function obtenerFechaInicial() {
    const aniosDisponibles =
        obtenerAniosDisponibles();

    const fechaHoy =
        new Date();

    const anioActual =
        fechaHoy.getFullYear();

    if (
        aniosDisponibles.includes(
            anioActual
        )
    ) {
        return fechaHoy;
    }

    const ultimoAnio =
        aniosDisponibles[0];

    return new Date(
        ultimoAnio,
        0,
        1
    );
}


function cambiarMes(
    desplazamiento
) {
    let mes =
        Number(
            selectorMes.value
        ) - 1;

    let anio =
        Number(
            selectorAnio.value
        );

    mes += desplazamiento;

    if (mes < 0) {
        mes = 11;
        anio -= 1;
    }

    if (mes > 11) {
        mes = 0;
        anio += 1;
    }

    const existeAnio =
        [
            ...selectorAnio.options
        ].some(
            opcion =>
                Number(
                    opcion.value
                ) === anio
        );

    if (!existeAnio) {
        return;
    }

    selectorMes.value =
        String(
            mes + 1
        );

    selectorAnio.value =
        String(anio);

    fechaSeleccionada = null;

    renderizarCalendario();

    if (modoActual === "mes") {
        mostrarResultadosMes();
    }
}


function renderizarCalendario() {
    const mes =
        Number(
            selectorMes.value
        );

    const anio =
        Number(
            selectorAnio.value
        );

    const primerDia =
        new Date(
            anio,
            mes - 1,
            1
        );

    const ultimoDia =
        new Date(
            anio,
            mes,
            0
        );

    const cantidadDias =
        ultimoDia.getDate();

    /*
     * JavaScript usa:
     * domingo = 0
     * lunes = 1
     *
     * El calendario comienza en lunes.
     */
    const desplazamiento =
        (
            primerDia.getDay() + 6
        ) % 7;

    calendarioDias.innerHTML = "";

    for (
        let indice = 0;
        indice < desplazamiento;
        indice += 1
    ) {
        const espacio =
            document.createElement(
                "button"
            );

        espacio.type = "button";
        espacio.disabled = true;

        calendarioDias.appendChild(
            espacio
        );
    }

    for (
        let dia = 1;
        dia <= cantidadDias;
        dia += 1
    ) {
        const boton =
            document.createElement(
                "button"
            );

        boton.type = "button";
        boton.textContent =
            String(dia);

        const fecha =
            construirFechaISO(
                anio,
                mes,
                dia
            );

        const cantidad =
            obtenerDiscursosPorFecha(
                fecha
            ).length;

        if (cantidad > 0) {
            boton.classList.add(
                "fecha-dia-con-discursos"
            );

            boton.title =
                `${cantidad} ${
                    cantidad === 1
                        ? "discurso"
                        : "discursos"
                }`;
        }

        if (
            fechaSeleccionada
            === fecha
        ) {
            boton.classList.add(
                "seleccionado"
            );
        }

        boton.addEventListener(
    "click",
    () => {
        if (
            modoActual !== "dia"
            && modoActual !== "mes"
        ) {
            return;
        }

        modoActual = "dia";

        fechaSeleccionada =
            fecha;

        botonesModo.forEach(
            botonModo => {
                botonModo.classList.toggle(
                    "activo",
                    botonModo.dataset.modo
                    === "dia"
                );
            }
        );

        mostrarVistaCorrespondiente();

        renderizarCalendario();

        mostrarResultadosFecha(
            fecha
        );
    }
);

        calendarioDias.appendChild(
            boton
        );
    }
}


/* ========================================
   MODO MES
======================================== */

function mostrarResultadosMes() {
    const mes =
        Number(
            selectorMes.value
        );

    const anio =
        Number(
            selectorAnio.value
        );

    const resultados =
        obtenerDiscursosPorMes(
            anio,
            mes
        );

    tituloResultados.textContent =
        formatearMesYAnio(
            anio,
            mes
        );

    cantidadResultados.textContent =
        `${resultados.length} ${
            resultados.length === 1
                ? "discurso registrado"
                : "discursos registrados"
        } en este mes`;

    listaResultados.innerHTML = `
        <div class="fecha-resultados-vacio">

            <p>
                Elegí un día del calendario
                para ver sus discursos.
            </p>

        </div>
    `;
}


function obtenerDiscursosPorMes(
    anio,
    mes
) {
    const prefijo =
        `${String(anio)}-${
            String(mes).padStart(
                2,
                "0"
            )
        }-`;

    return discursos.filter(
        discurso =>
            String(
                discurso.fecha || ""
            ).startsWith(
                prefijo
            )
    );
}


function formatearMesYAnio(
    anio,
    mes
) {
    const fecha =
        new Date(
            anio,
            mes - 1,
            1
        );

    const nombreMes =
        fecha.toLocaleDateString(
            "es-AR",
            {
                month: "long"
            }
        );

    return `${
        nombreMes.charAt(0)
            .toUpperCase()
        + nombreMes.slice(1)
    } de ${anio}`;
}


/* ========================================
   MODO AÑO
======================================== */

function sincronizarAnioVista() {
    const anioCalendario =
        Number(
            selectorAnio.value
        );

    const existe =
        [
            ...selectorAnioVista.options
        ].some(
            opcion =>
                Number(
                    opcion.value
                ) === anioCalendario
        );

    if (existe) {
        selectorAnioVista.value =
            String(anioCalendario);
    }
}


function cambiarAnioVista(
    desplazamiento
) {
    const opciones =
        [
            ...selectorAnioVista.options
        ];

    const indiceActual =
        selectorAnioVista
            .selectedIndex;

    /*
     * Los años están ordenados de mayor a menor.
     * Para ir al año anterior avanzamos una opción.
     */
    const nuevoIndice =
        indiceActual
        - desplazamiento;

    if (
        nuevoIndice < 0
        || nuevoIndice
            >= opciones.length
    ) {
        return;
    }

    selectorAnioVista.selectedIndex =
        nuevoIndice;

    renderizarVistaAnio();
}


function renderizarVistaAnio() {
    const anio =
        Number(
            selectorAnioVista.value
        );

    const resultadosAnio =
        obtenerDiscursosPorAnio(
            anio
        );

    tituloResultados.textContent =
        String(anio);

    cantidadResultados.textContent =
    `${resultadosAnio.length} ${
        resultadosAnio.length === 1
            ? "discurso registrado"
            : "discursos registrados"
    } en este año`;

    listaResultados.innerHTML = `
    <div class="fecha-resultados-vacio">

        <p>
            Elegí un mes para ver sus discursos.
        </p>

    </div>
`;

    const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    grillaMeses.innerHTML =
        nombresMeses
            .map(
                (
                    nombreMes,
                    indice
                ) => {
                    const mes =
                        indice + 1;

                    const cantidad =
                        obtenerDiscursosPorMes(
                            anio,
                            mes
                        ).length;

                    return `
                        <button
                            type="button"
                            class="
                                fecha-mes-tarjeta
                                ${
                                    cantidad > 0
                                        ? "con-discursos"
                                        : "sin-discursos"
                                }
                            "
                            data-mes="${mes}"
                            ${
                                cantidad === 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <span
                                class="fecha-mes-nombre"
                            >
                                ${
                                    escaparHTML(
                                        nombreMes
                                    )
                                }
                            </span>

                            <strong>
                                ${cantidad}
                            </strong>

                            <small>
                                ${
                                    cantidad === 1
                                        ? "discurso"
                                        : "discursos"
                                }
                            </small>

                        </button>
                    `;
                }
            )
            .join("");

    grillaMeses
        .querySelectorAll(
            ".fecha-mes-tarjeta:not(:disabled)"
        )
        .forEach(
            boton => {
                boton.addEventListener(
                    "click",
                    () => {
                        abrirMesDesdeVistaAnio(
                            Number(
                                boton.dataset.mes
                            ),
                            anio
                        );
                    }
                );
            }
        );
}


function obtenerDiscursosPorAnio(
    anio
) {
    return discursos.filter(
        discurso =>
            obtenerAnioDiscurso(
                discurso
            ) === anio
    );
}


function abrirMesDesdeVistaAnio(
    mes,
    anio
) {
    selectorMes.value =
        String(mes);

    selectorAnio.value =
        String(anio);

    modoActual = "mes";

    fechaSeleccionada = null;

    botonesModo.forEach(
        boton => {
            boton.classList.toggle(
                "activo",
                boton.dataset.modo
                === "mes"
            );
        }
    );

    mostrarVistaCorrespondiente();

    renderizarCalendario();

    mostrarResultadosMes();
}


/* ========================================
   MODO DÍA
======================================== */

function mostrarResultadosFecha(
    fecha
) {
    const resultados =
        obtenerDiscursosPorFecha(
            fecha
        );

    const fechaFormateada =
        formatearFechaLarga(
            fecha
        );

    tituloResultados.textContent =
        fechaFormateada;

    cantidadResultados.textContent =
        `${resultados.length} ${
            resultados.length === 1
                ? "discurso encontrado"
                : "discursos encontrados"
        }`;

    renderizarResultados(
        resultados,
        "No hay discursos registrados para esta fecha."
    );
}


function obtenerDiscursosPorFecha(
    fecha
) {
    return discursos.filter(
        discurso =>
            String(
                discurso.fecha || ""
            ) === fecha
    );
}


/* ========================================
   RESULTADOS
======================================== */

function renderizarResultados(
    resultados,
    mensajeVacio
) {
    if (!resultados.length) {
        listaResultados.innerHTML = `
            <div class="fecha-resultados-vacio">

                <p>
                    ${
                        escaparHTML(
                            mensajeVacio
                        )
                    }
                </p>

            </div>
        `;

        return;
    }

    listaResultados.innerHTML =
        [...resultados]
            .sort(
                (a, b) => {
                    const comparacionFecha =
                        String(
                            a.fecha || ""
                        ).localeCompare(
                            String(
                                b.fecha || ""
                            )
                        );

                    if (
                        comparacionFecha
                        !== 0
                    ) {
                        return comparacionFecha;
                    }

                    return String(
                        a.titulo || ""
                    ).localeCompare(
                        String(
                            b.titulo || ""
                        ),
                        "es"
                    );
                }
            )
            .map(
                crearTarjetaResultado
            )
            .join("");
}


function crearTarjetaResultado(
    discurso
) {
    const ubicacion =
        [
            discurso.localidad,
            discurso.provincia,
            discurso.pais
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
            discurso.colecciones
            || []
        ).join(", ");

    const fecha =
        formatearFechaCorta(
            discurso.fecha
        );

    return `
        <a
            class="fecha-resultado"
            href="discurso.html?id=${
                encodeURIComponent(
                    discurso.id
                )
            }"
        >

            <p class="fecha-resultado-id">
                ${
                    escaparHTML(
                        discurso.id
                    )
                }
            </p>

            <h3>
                ${
                    escaparHTML(
                        discurso.titulo
                    )
                }
            </h3>

            <div class="fecha-resultado-meta">

                ${
                    fecha
                        ? `
                            <span>
                                📅 ${
                                    escaparHTML(
                                        fecha
                                    )
                                }
                            </span>
                        `
                        : ""
                }

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

            </div>

        </a>
    `;
}


/* ========================================
   FECHAS
======================================== */

function construirFechaISO(
    anio,
    mes,
    dia
) {
    return [
        String(anio),

        String(mes)
            .padStart(
                2,
                "0"
            ),

        String(dia)
            .padStart(
                2,
                "0"
            )
    ].join("-");
}


function formatearFechaLarga(
    fecha
) {
    const [
        anio,
        mes,
        dia
    ] =
        String(fecha)
            .split("-")
            .map(Number);

    const objetoFecha =
        new Date(
            anio,
            mes - 1,
            dia
        );

    return objetoFecha
        .toLocaleDateString(
            "es-AR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


function formatearFechaCorta(
    fecha
) {
    const partes =
        String(
            fecha || ""
        ).split("-");

    if (partes.length !== 3) {
        return "";
    }

    return `${
        partes[2]
    }/${
        partes[1]
    }/${
        partes[0]
    }`;
}


/* ========================================
   UTILIDADES
======================================== */

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