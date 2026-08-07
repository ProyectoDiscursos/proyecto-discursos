const botonesModo = [
    ...document.querySelectorAll(
        ".lugar-modo"
    )
];

const contenedorOpciones =
    document.getElementById(
        "lugar-opciones"
    );

const campoBusqueda =
    document.getElementById(
        "lugar-busqueda"
    );

const contenedorMigas =
    document.getElementById(
        "lugar-migas"
    );

const tituloResultados =
    document.getElementById(
        "lugar-resultados-titulo"
    );

const cantidadResultados =
    document.getElementById(
        "lugar-resultados-cantidad"
    );

const listaResultados =
    document.getElementById(
        "lugar-resultados-lista"
    );


const VALOR_SIN_PAIS =
    "__SIN_PAIS__";

const VALOR_SIN_PROVINCIA =
    "__SIN_PROVINCIA__";

const VALOR_SIN_LOCALIDAD =
    "__SIN_LOCALIDAD__";

const VALOR_SIN_LUGAR =
    "__SIN_LUGAR__";


let discursos = [];

let nivelActual = "pais";

let seleccion = {
    pais: "",
    provincia: "",
    localidad: "",
    lugar: ""
};

let opcionesActuales = [];


iniciarLugar();


async function iniciarLugar() {
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

        prepararEventos();

        mostrarPaises();

    } catch (error) {
        console.error(
            "Error al cargar los lugares:",
            error
        );

        contenedorOpciones.innerHTML = `
            <div class="lugar-opciones-vacio">

                <p>
                    No se pudieron cargar los lugares.
                </p>

            </div>
        `;
    }
}


/* ========================================
   EVENTOS
======================================== */

function prepararEventos() {
    botonesModo.forEach(
        boton => {
            boton.addEventListener(
                "click",
                () => {
                    if (boton.disabled) {
                        return;
                    }

                    navegarANivel(
                        boton.dataset.modo
                    );
                }
            );
        }
    );


    campoBusqueda.addEventListener(
        "input",
        () => {
            renderizarOpciones(
                filtrarOpciones(
                    opcionesActuales,
                    campoBusqueda.value
                )
            );
        }
    );


    contenedorMigas.addEventListener(
        "click",
        evento => {
            const boton =
                evento.target.closest(
                    "button[data-nivel]"
                );

            if (!boton) {
                return;
            }

            navegarANivel(
                boton.dataset.nivel
            );
        }
    );
}


/* ========================================
   NAVEGACIÓN
======================================== */

function navegarANivel(
    nivel
) {
    if (nivel === "pais") {
        seleccion = {
            pais: "",
            provincia: "",
            localidad: "",
            lugar: ""
        };

        mostrarPaises();
        return;
    }


    if (
        nivel === "provincia"
        && seleccion.pais
    ) {
        seleccion.provincia = "";
        seleccion.localidad = "";
        seleccion.lugar = "";

        mostrarProvincias();
        return;
    }


    if (
        nivel === "localidad"
        && seleccion.pais
    ) {
        seleccion.localidad = "";
        seleccion.lugar = "";

        if (
            seleccion.provincia
            && seleccion.provincia
                !== VALOR_SIN_PROVINCIA
        ) {
            mostrarLocalidades();
        } else {
            mostrarLocalidadesSinProvincia();
        }

        return;
    }


    if (
        nivel === "lugar"
        && esCapitalFederalSeleccionada()
    ) {
        seleccion.lugar = "";

        mostrarLugaresCapitalFederal();
    }
}


function actualizarNivelActivo() {
    botonesModo.forEach(
        boton => {
            const nivel =
                boton.dataset.modo;

            boton.classList.toggle(
                "activo",
                nivel === nivelActual
            );

            if (nivel === "pais") {
                boton.disabled = false;
            }

            if (nivel === "provincia") {
                boton.disabled =
                    !seleccion.pais
                    || !paisTieneProvincias(
                        seleccion.pais
                    );
            }

            if (nivel === "localidad") {
                boton.disabled =
                    !seleccion.pais
                    || esCapitalFederalSeleccionada();
            }

            /*
             * El nivel Lugar no es general.
             * Solo se habilita si todavía existe
             * ese botón en el HTML y estamos
             * recorriendo Capital Federal.
             */
            if (nivel === "lugar") {
                boton.disabled =
                    !esCapitalFederalSeleccionada();

                boton.hidden =
                    !esCapitalFederalSeleccionada();
            }
        }
    );
}


function actualizarMigas() {
    const migas = [
        {
            nivel: "pais",
            etiqueta: "Países"
        }
    ];


    if (seleccion.pais) {
        migas.push({
            nivel:
                paisTieneProvincias(
                    seleccion.pais
                )
                    ? "provincia"
                    : "localidad",

            etiqueta:
                obtenerEtiquetaSeleccion(
                    seleccion.pais,
                    "País no identificado"
                )
        });
    }


    if (seleccion.provincia) {
        migas.push({
            nivel:
                esCapitalFederalSeleccionada()
                    ? "lugar"
                    : "localidad",

            etiqueta:
                obtenerEtiquetaSeleccion(
                    seleccion.provincia,
                    "Provincia no identificada"
                )
        });
    }


    if (seleccion.localidad) {
        migas.push({
            nivel: "resultado",

            etiqueta:
                obtenerEtiquetaSeleccion(
                    seleccion.localidad,
                    "Localidad no identificada"
                )
        });
    }


    if (seleccion.lugar) {
        migas.push({
            nivel: "resultado",

            etiqueta:
                obtenerEtiquetaSeleccion(
                    seleccion.lugar,
                    "Lugar específico no identificado"
                )
        });
    }


    contenedorMigas.innerHTML =
        migas.map(
            (
                miga,
                indice
            ) => `
                <button
                    type="button"
                    data-nivel="${
                        escaparHTML(
                            miga.nivel
                        )
                    }"
                    class="${
                        indice
                        === migas.length - 1
                            ? "activo"
                            : ""
                    }"
                    ${
                        miga.nivel === "resultado"
                            ? "disabled"
                            : ""
                    }
                >
                    ${
                        escaparHTML(
                            miga.etiqueta
                        )
                    }
                </button>
            `
        ).join("");
}


/* ========================================
   PAÍSES
======================================== */

function mostrarPaises() {
    nivelActual = "pais";

    campoBusqueda.value = "";

    opcionesActuales =
        agruparValores(
            discursos,
            discurso =>
                discurso.pais,
            {
                incluirVacios: true,
                etiquetaVacio:
                    "País no identificado",
                valorVacio:
                    VALOR_SIN_PAIS
            }
        );


    opcionesActuales.sort(
        (a, b) => {
            if (
                normalizarTexto(
                    a.nombre
                ) === "argentina"
            ) {
                return -1;
            }

            if (
                normalizarTexto(
                    b.nombre
                ) === "argentina"
            ) {
                return 1;
            }

            if (
                a.valor === VALOR_SIN_PAIS
            ) {
                return 1;
            }

            if (
                b.valor === VALOR_SIN_PAIS
            ) {
                return -1;
            }

            return compararTexto(
                a.nombre,
                b.nombre
            );
        }
    );


    actualizarNivelActivo();
    actualizarMigas();

    renderizarOpciones(
        opcionesActuales
    );

    actualizarResumen(
        "Elegí un país",
        `${discursos.length} discursos distribuidos por país.`,
        "Seleccioná un país para comenzar la exploración geográfica."
    );
}


/* ========================================
   PROVINCIAS
======================================== */

function mostrarProvincias() {
    nivelActual = "provincia";

    campoBusqueda.value = "";

    const registros =
        filtrarDiscursosPorSeleccion({
            pais: seleccion.pais
        });


    opcionesActuales =
        agruparValores(
            registros,
            discurso =>
                discurso.provincia,
            {
                incluirVacios: true,
                etiquetaVacio:
                    "Provincia no identificada",
                valorVacio:
                    VALOR_SIN_PROVINCIA
            }
        );


    actualizarNivelActivo();
    actualizarMigas();

    renderizarOpciones(
        opcionesActuales
    );


    actualizarResumen(
        obtenerEtiquetaSeleccion(
            seleccion.pais,
            "País no identificado"
        ),

        `${registros.length} ${
            registros.length === 1
                ? "discurso registrado"
                : "discursos registrados"
        }.`,

        "Elegí una provincia o región."
    );
}


/* ========================================
   LOCALIDADES CON PROVINCIA
======================================== */

function mostrarLocalidades() {
    nivelActual = "localidad";

    campoBusqueda.value = "";

    const registros =
        filtrarDiscursosPorSeleccion({
            pais:
                seleccion.pais,

            provincia:
                seleccion.provincia
        });


    opcionesActuales =
        agruparValores(
            registros,
            discurso =>
                discurso.localidad,
            {
                incluirVacios: true,
                etiquetaVacio:
                    "Localidad no identificada",
                valorVacio:
                    VALOR_SIN_LOCALIDAD
            }
        );


    actualizarNivelActivo();
    actualizarMigas();

    renderizarOpciones(
        opcionesActuales
    );


    actualizarResumen(
        obtenerEtiquetaSeleccion(
            seleccion.provincia,
            "Provincia no identificada"
        ),

        `${registros.length} ${
            registros.length === 1
                ? "discurso registrado"
                : "discursos registrados"
        }.`,

        "Elegí una localidad para ver sus discursos."
    );
}


/* ========================================
   LOCALIDADES SIN PROVINCIA
======================================== */

function mostrarLocalidadesSinProvincia() {
    nivelActual = "localidad";

    campoBusqueda.value = "";

    const filtros = {
        pais: seleccion.pais
    };

    /*
     * Si se eligió expresamente
     * “Provincia no identificada”,
     * solo usamos registros sin provincia.
     */
    if (
        seleccion.provincia
        === VALOR_SIN_PROVINCIA
    ) {
        filtros.provincia =
            VALOR_SIN_PROVINCIA;
    }


    const registros =
        filtrarDiscursosPorSeleccion(
            filtros
        );


    opcionesActuales =
        agruparValores(
            registros,
            discurso =>
                discurso.localidad,
            {
                incluirVacios: true,
                etiquetaVacio:
                    "Localidad no identificada",
                valorVacio:
                    VALOR_SIN_LOCALIDAD
            }
        );


    actualizarNivelActivo();
    actualizarMigas();

    renderizarOpciones(
        opcionesActuales
    );


    const titulo =
        seleccion.provincia
        === VALOR_SIN_PROVINCIA
            ? "Provincia no identificada"
            : obtenerEtiquetaSeleccion(
                seleccion.pais,
                "País no identificado"
            );


    actualizarResumen(
        titulo,

        `${registros.length} ${
            registros.length === 1
                ? "discurso registrado"
                : "discursos registrados"
        }.`,

        "Elegí una localidad para ver sus discursos."
    );
}


/* ========================================
   CAPITAL FEDERAL:
   LUGARES ESPECÍFICOS
======================================== */

function mostrarLugaresCapitalFederal() {
    nivelActual = "lugar";

    campoBusqueda.value = "";

    const registros =
        filtrarDiscursosPorSeleccion({
            pais:
                seleccion.pais,

            provincia:
                seleccion.provincia
        });


    opcionesActuales =
        agruparLugaresEspecificos(
            registros
        );


    actualizarNivelActivo();
    actualizarMigas();

    renderizarOpciones(
        opcionesActuales
    );


    actualizarResumen(
        "Capital Federal",

        `${registros.length} ${
            registros.length === 1
                ? "discurso registrado"
                : "discursos registrados"
        }.`,

        "Elegí un lugar específico para ver sus discursos."
    );
}


/* ========================================
   OPCIONES
======================================== */

function renderizarOpciones(
    opciones
) {
    if (!opciones.length) {
        contenedorOpciones.innerHTML = `
            <div class="lugar-opciones-vacio">

                <p>
                    No encontramos opciones
                    para esta selección.
                </p>

            </div>
        `;

        return;
    }


    contenedorOpciones.innerHTML =
        opciones.map(
            opcion => `
                <button
                    type="button"
                    class="
                        lugar-opcion
                        ${
                            nivelActual === "pais"
                            && normalizarTexto(
                                opcion.nombre
                            ) === "argentina"
                                ? "destacada"
                                : ""
                        }
                    "
                    data-valor="${
                        escaparHTML(
                            opcion.valor
                        )
                    }"
                >

                    <span
                        class="lugar-opcion-nombre"
                    >
                        ${
                            escaparHTML(
                                opcion.nombre
                            )
                        }
                    </span>

                    <strong>
                        ${opcion.cantidad}
                    </strong>

                    <small>
                        ${
                            opcion.cantidad === 1
                                ? "discurso"
                                : "discursos"
                        }
                    </small>

                </button>
            `
        ).join("");


    contenedorOpciones
        .querySelectorAll(
            ".lugar-opcion"
        )
        .forEach(
            boton => {
                boton.addEventListener(
                    "click",
                    () => {
                        seleccionarOpcion(
                            boton.dataset.valor
                        );
                    }
                );
            }
        );
}


function seleccionarOpcion(
    valor
) {
    if (nivelActual === "pais") {
        seleccion.pais = valor;
        seleccion.provincia = "";
        seleccion.localidad = "";
        seleccion.lugar = "";


        if (
            paisTieneProvincias(
                seleccion.pais
            )
        ) {
            mostrarProvincias();
        } else {
            mostrarLocalidadesSinProvincia();
        }

        return;
    }


    if (
        nivelActual === "provincia"
    ) {
        seleccion.provincia =
            valor;

        seleccion.localidad = "";
        seleccion.lugar = "";


        if (
            esCapitalFederalSeleccionada()
        ) {
            mostrarLugaresCapitalFederal();
            return;
        }


        if (
            valor === VALOR_SIN_PROVINCIA
        ) {
            mostrarLocalidadesSinProvincia();
            return;
        }


        mostrarLocalidades();
        return;
    }


    if (
        nivelActual === "localidad"
    ) {
        seleccion.localidad =
            valor;

        seleccion.lugar = "";

        actualizarMigas();

        mostrarDiscursosLocalidad();

        return;
    }


    if (
        nivelActual === "lugar"
    ) {
        seleccion.lugar =
            valor;

        actualizarMigas();

        mostrarDiscursosLugarCapitalFederal();
    }
}


/* ========================================
   RESULTADOS POR LOCALIDAD
======================================== */

function mostrarDiscursosLocalidad() {
    const resultados =
        filtrarDiscursosPorSeleccion({
            pais:
                seleccion.pais,

            provincia:
                seleccion.provincia,

            localidad:
                seleccion.localidad
        });


    tituloResultados.textContent =
        obtenerEtiquetaSeleccion(
            seleccion.localidad,
            "Localidad no identificada"
        );


    cantidadResultados.textContent =
        `${resultados.length} ${
            resultados.length === 1
                ? "discurso encontrado"
                : "discursos encontrados"
        }`;


    renderizarDiscursos(
        resultados,
        "No hay discursos registrados para esta localidad."
    );
}


/* ========================================
   RESULTADOS DE CAPITAL FEDERAL
======================================== */

function mostrarDiscursosLugarCapitalFederal() {
    const registrosCapital =
        filtrarDiscursosPorSeleccion({
            pais:
                seleccion.pais,

            provincia:
                seleccion.provincia
        });


    const resultados =
        registrosCapital.filter(
            discurso => {
                const lugares =
                    obtenerLugaresDiscurso(
                        discurso
                    );

                if (
                    seleccion.lugar
                    === VALOR_SIN_LUGAR
                ) {
                    return lugares.length === 0;
                }

                return lugares.some(
                    lugar =>
                        coincidenTextos(
                            lugar,
                            seleccion.lugar
                        )
                );
            }
        );


    tituloResultados.textContent =
        obtenerEtiquetaSeleccion(
            seleccion.lugar,
            "Lugar específico no identificado"
        );


    cantidadResultados.textContent =
        `${resultados.length} ${
            resultados.length === 1
                ? "discurso encontrado"
                : "discursos encontrados"
        }`;


    renderizarDiscursos(
        resultados,
        "No hay discursos registrados para este lugar."
    );
}


function renderizarDiscursos(
    resultados,
    mensajeVacio
) {
    if (!resultados.length) {
        listaResultados.innerHTML = `
            <div class="lugar-resultados-vacio">

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
                (a, b) =>
                    String(
                        a.fecha || ""
                    ).localeCompare(
                        String(
                            b.fecha || ""
                        )
                    )
            )
            .map(
                crearTarjetaResultado
            )
            .join("");
}


function actualizarResumen(
    titulo,
    cantidad,
    indicacion
) {
    tituloResultados.textContent =
        titulo;

    cantidadResultados.textContent =
        cantidad;

    listaResultados.innerHTML = `
        <div class="lugar-resultados-vacio">

            <p>
                ${
                    escaparHTML(
                        indicacion
                    )
                }
            </p>

        </div>
    `;
}


/* ========================================
   AGRUPACIÓN
======================================== */

function agruparValores(
    registros,
    obtenerValor,
    opciones = {}
) {
    const grupos =
        new Map();

    const incluirVacios =
        Boolean(
            opciones.incluirVacios
        );

    const etiquetaVacio =
        opciones.etiquetaVacio
        || "No identificado";

    const valorVacio =
        opciones.valorVacio
        || "__SIN_DATO__";


    registros.forEach(
        registro => {
            const valorOriginal =
                String(
                    obtenerValor(
                        registro
                    ) || ""
                ).trim();

            const estaVacio =
                !valorOriginal;

            if (
                estaVacio
                && !incluirVacios
            ) {
                return;
            }

            const nombre =
                estaVacio
                    ? etiquetaVacio
                    : valorOriginal;

            const valor =
                estaVacio
                    ? valorVacio
                    : valorOriginal;

            const clave =
                estaVacio
                    ? valorVacio
                    : normalizarTexto(
                        valorOriginal
                    );


            if (!grupos.has(clave)) {
                grupos.set(
                    clave,
                    {
                        nombre,
                        valor,
                        ids: new Set()
                    }
                );
            }


            grupos
                .get(clave)
                .ids.add(
                    String(
                        registro.id || ""
                    )
                );
        }
    );


    return [
        ...grupos.values()
    ]
        .map(
            grupo => ({
                nombre:
                    grupo.nombre,

                valor:
                    grupo.valor,

                cantidad:
                    grupo.ids.size
            })
        )
        .sort(
            (
                a,
                b
            ) => {
                const aSinDato =
                    esValorSinDato(
                        a.valor
                    );

                const bSinDato =
                    esValorSinDato(
                        b.valor
                    );

                if (
                    aSinDato
                    && !bSinDato
                ) {
                    return 1;
                }

                if (
                    !aSinDato
                    && bSinDato
                ) {
                    return -1;
                }

                return compararTexto(
                    a.nombre,
                    b.nombre
                );
            }
        );
}


function agruparLugaresEspecificos(
    registros
) {
    const grupos =
        new Map();

    let idsSinLugar =
        new Set();


    registros.forEach(
        registro => {
            const lugares =
                obtenerLugaresDiscurso(
                    registro
                );


            if (!lugares.length) {
                idsSinLugar.add(
                    String(
                        registro.id || ""
                    )
                );

                return;
            }


            lugares.forEach(
                lugar => {
                    const clave =
                        normalizarTexto(
                            lugar
                        );


                    if (!grupos.has(clave)) {
                        grupos.set(
                            clave,
                            {
                                nombre:
                                    lugar,

                                valor:
                                    lugar,

                                ids:
                                    new Set()
                            }
                        );
                    }


                    grupos
                        .get(clave)
                        .ids.add(
                            String(
                                registro.id || ""
                            )
                        );
                }
            );
        }
    );


    const opciones =
        [
            ...grupos.values()
        ].map(
            grupo => ({
                nombre:
                    grupo.nombre,

                valor:
                    grupo.valor,

                cantidad:
                    grupo.ids.size
            })
        );


    opciones.sort(
        (a, b) =>
            compararTexto(
                a.nombre,
                b.nombre
            )
    );


    if (idsSinLugar.size > 0) {
        opciones.push({
            nombre:
                "Lugar específico no identificado",

            valor:
                VALOR_SIN_LUGAR,

            cantidad:
                idsSinLugar.size
        });
    }


    return opciones;
}


/* ========================================
   FILTRADO
======================================== */

function filtrarDiscursosPorSeleccion(
    filtros
) {
    return discursos.filter(
        discurso => {
            if (
                filtros.pais
                && !coincideCampo(
                    discurso.pais,
                    filtros.pais,
                    VALOR_SIN_PAIS
                )
            ) {
                return false;
            }


            if (
                filtros.provincia
                && !coincideCampo(
                    discurso.provincia,
                    filtros.provincia,
                    VALOR_SIN_PROVINCIA
                )
            ) {
                return false;
            }


            if (
                filtros.localidad
                && !coincideCampo(
                    discurso.localidad,
                    filtros.localidad,
                    VALOR_SIN_LOCALIDAD
                )
            ) {
                return false;
            }


            return true;
        }
    );
}


function coincideCampo(
    valorRegistro,
    valorFiltro,
    valorSinDato
) {
    const registroVacio =
        !String(
            valorRegistro || ""
        ).trim();


    if (
        valorFiltro
        === valorSinDato
    ) {
        return registroVacio;
    }


    return coincidenTextos(
        valorRegistro,
        valorFiltro
    );
}


/* ========================================
   REGLAS GEOGRÁFICAS
======================================== */

function paisTieneProvincias(
    pais
) {
    const registros =
        filtrarDiscursosPorSeleccion({
            pais
        });


    return registros.some(
        discurso =>
            Boolean(
                String(
                    discurso.provincia
                    || ""
                ).trim()
            )
    );
}


function esCapitalFederalSeleccionada() {
    const valores = [
        seleccion.provincia,
        seleccion.localidad
    ]
        .map(
            normalizarTexto
        )
        .filter(Boolean);


    return valores.some(
        valor =>
            valor === "capital federal"
            || valor ===
                "ciudad autonoma de buenos aires"
            || valor === "caba"
            || valor.includes(
                "capital federal"
            )
    );
}


function obtenerLugaresDiscurso(
    discurso
) {
    const posiblesValores = [
        discurso.lugaresEspecificos,
        discurso.lugarEspecifico,
        discurso.lugar_especifico,
        discurso.lugar
    ];

    const lugares = [];


    posiblesValores.forEach(
        valor => {
            if (Array.isArray(valor)) {
                lugares.push(
                    ...valor
                );

                return;
            }


            if (
                typeof valor === "string"
                && valor.trim()
            ) {
                valor
                    .split(/[,;|]/)
                    .forEach(
                        parte => {
                            lugares.push(
                                parte
                            );
                        }
                    );
            }
        }
    );


    return [
        ...new Set(
            lugares
                .map(
                    lugar =>
                        String(
                            lugar || ""
                        ).trim()
                )
                .filter(Boolean)
        )
    ];
}


/* ========================================
   TARJETAS
======================================== */

function crearTarjetaResultado(
    discurso
) {
    const fecha =
        formatearFecha(
            discurso.fecha
        );


    const ubicacion = [
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


    return `
        <a
            class="lugar-resultado"
            href="discurso.html?id=${
                encodeURIComponent(
                    discurso.id
                )
            }"
        >

            <p class="lugar-resultado-id">
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

            <div class="lugar-resultado-meta">

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
   UTILIDADES
======================================== */

function filtrarOpciones(
    opciones,
    consulta
) {
    const consultaNormalizada =
        normalizarTexto(
            consulta
        );


    if (!consultaNormalizada) {
        return opciones;
    }


    return opciones.filter(
        opcion =>
            normalizarTexto(
                opcion.nombre
            ).includes(
                consultaNormalizada
            )
    );
}


function obtenerEtiquetaSeleccion(
    valor,
    etiquetaSinDato
) {
    if (
        esValorSinDato(
            valor
        )
    ) {
        return etiquetaSinDato;
    }

    return valor;
}


function esValorSinDato(
    valor
) {
    return [
        VALOR_SIN_PAIS,
        VALOR_SIN_PROVINCIA,
        VALOR_SIN_LOCALIDAD,
        VALOR_SIN_LUGAR
    ].includes(
        valor
    );
}


function coincidenTextos(
    valorA,
    valorB
) {
    return normalizarTexto(
        valorA
    ) === normalizarTexto(
        valorB
    );
}


function compararTexto(
    a,
    b
) {
    return String(a).localeCompare(
        String(b),
        "es",
        {
            sensitivity: "base",
            numeric: true
        }
    );
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


function formatearFecha(
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