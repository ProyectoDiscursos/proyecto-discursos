const resumenEstadisticas =
    document.getElementById(
        "resumen-estadisticas"
    );

const contenedorAnios =
    document.getElementById(
        "estadisticas-anios"
    );

const contenedorPaises =
    document.getElementById(
        "estadisticas-paises"
    );

const contenedorProvincias =
    document.getElementById(
        "estadisticas-provincias"
    );

const contenedorLocalidades =
    document.getElementById(
        "estadisticas-localidades"
    );

const contenedorColecciones =
    document.getElementById(
        "estadisticas-colecciones"
    );


cargarEstadisticas();


async function cargarEstadisticas() {
    try {
        const respuesta =
            await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el JSON: ${
                    respuesta.status
                }`
            );
        }

        const discursos =
            await respuesta.json();

        mostrarResumen(discursos);
        mostrarEstadisticasPorAnio(discursos);

        const paisesInternacionales =
    contarCampo(discursos, "pais")
        .filter(
            pais =>
                normalizarTexto(
                    pais.nombre
                ) !== "argentina"
        );

        mostrarListaEstadistica(
            contenedorPaises,
            paisesInternacionales,
            24,
          "pais"
        );

        mostrarListaEstadistica(
            contenedorProvincias,
            contarCampo(
                discursos.filter(
                    discurso =>
                        normalizarTexto(
                            discurso.pais
                        ) === "argentina"
                ),
                "provincia"
            ),
            24,
            "provincia"
        );

        mostrarListaEstadistica(
    contenedorLocalidades,
    contarCampo(
        discursos.filter(
            discurso =>
                normalizarTexto(
                    discurso.pais
                ) === "argentina"
        ),
        "localidad"
    ),
    15,
    "localidad"
);

        mostrarListaEstadistica(
            contenedorColecciones,
            contarColecciones(discursos),
            15,
            "coleccion"
        );

    } catch (error) {
        console.error(
            "Error al cargar estadísticas:",
            error
        );

        mostrarError();
    }
}


function mostrarResumen(discursos) {
    const total = discursos.length;

    const conVideo =
        discursos.filter(
            discurso =>
                Boolean(
                    String(
                        discurso.video || ""
                    ).trim()
                )
        ).length;

    const conTranscripcion =
        discursos.filter(
            discurso =>
                discurso.tieneTranscripcion === true
        ).length;

    const anios = valoresUnicos(
        discursos.map(
            discurso => discurso.anio
        )
    ).sort((a, b) => a - b);

    const paises = valoresUnicos(
        discursos.map(
            discurso => discurso.pais
        )
    );

    const provincias = valoresUnicos(
        discursos
            .filter(
                discurso =>
                    normalizarTexto(
                        discurso.pais
                    ) === "argentina"
            )
            .map(
                discurso =>
                    discurso.provincia
            )
    );

    const localidades = valoresUnicos(
        discursos.map(
            discurso =>
                discurso.localidad
        )
    );

    const colecciones =
        contarColecciones(discursos).length;

    const primerAnio =
        anios.length > 0
            ? anios[0]
            : "—";

    const ultimoAnio =
        anios.length > 0
            ? anios[anios.length - 1]
            : "—";

    resumenEstadisticas.innerHTML = `
        ${crearTarjetaResumen(
            total,
            "Discursos"
        )}

        ${crearTarjetaResumen(
            conVideo,
            "Con video",
            calcularPorcentaje(
                conVideo,
                total
            )
        )}

        ${crearTarjetaResumen(
            conTranscripcion,
            "Con transcripción",
            calcularPorcentaje(
                conTranscripcion,
                total
            )
        )}

        ${crearTarjetaResumen(
            `${primerAnio}–${ultimoAnio}`,
            "Período registrado"
        )}

        ${crearTarjetaResumen(
            paises.length,
            "Países"
        )}

        ${crearTarjetaResumen(
            provincias.length,
            "Provincias argentinas"
        )}

        ${crearTarjetaResumen(
            localidades.length,
            "Localidades"
        )}

        ${crearTarjetaResumen(
            colecciones,
            "Colecciones"
        )}
    `;
}


function crearTarjetaResumen(
    valor,
    etiqueta,
    porcentaje = ""
) {
    return `
        <article class="estadistica-resumen-card">

            <strong>
                ${escaparHTML(valor)}
            </strong>

            <span>
                ${escaparHTML(etiqueta)}
            </span>

            ${
                porcentaje !== ""
                    ? `
                        <small>
                            ${porcentaje}% del archivo
                        </small>
                    `
                    : ""
            }

        </article>
    `;
}


function mostrarEstadisticasPorAnio(
    discursos
) {
    const conteos = new Map();

    discursos.forEach(discurso => {
        const anio =
            String(
                discurso.anio || ""
            ).trim();

        if (!anio) {
            return;
        }

        if (!conteos.has(anio)) {
            conteos.set(anio, {
                nombre: anio,
                cantidad: 0,
                videos: 0
            });
        }

        const registro =
            conteos.get(anio);

        registro.cantidad += 1;

        if (
            String(
                discurso.video || ""
            ).trim()
        ) {
            registro.videos += 1;
        }
    });

    const resultados =
        [...conteos.values()]
            .sort(
                (a, b) =>
                    Number(a.nombre) -
                    Number(b.nombre)
            );

    const maximo = Math.max(
        ...resultados.map(
            resultado =>
                resultado.cantidad
        ),
        1
    );

    contenedorAnios.innerHTML =
        resultados
            .map(resultado => {
                const ancho =
                    (
                        resultado.cantidad /
                        maximo
                    ) * 100;

                return `
                    <a
                        class="estadistica-barra-fila"
                        href="explorar.html?anio=${
                            encodeURIComponent(
                                resultado.nombre
                            )
                        }"
                    >

                        <span class="estadistica-barra-etiqueta">
                            ${resultado.nombre}
                        </span>

                        <span class="estadistica-barra-area">

                            <span
                                class="estadistica-barra"
                                style="width: ${ancho}%"
                            ></span>

                        </span>

                        <strong>
                            ${resultado.cantidad}
                        </strong>

                        <small>
                            ${resultado.videos} con video
                        </small>

                    </a>
                `;
            })
            .join("");
}


function contarCampo(
    discursos,
    nombreCampo
) {
    const conteos = new Map();

    discursos.forEach(discurso => {
        const valor =
            String(
                discurso[nombreCampo] || ""
            ).trim();

        if (!valor) {
            return;
        }

        const clave =
            normalizarTexto(valor);

        const registro =
            conteos.get(clave);

        if (registro) {
            registro.cantidad += 1;
            return;
        }

        conteos.set(clave, {
            nombre: valor,
            cantidad: 1
        });
    });

    return [...conteos.values()]
        .sort(
            (a, b) =>
                b.cantidad - a.cantidad ||
                a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    {
                        sensitivity: "base"
                    }
                )
        );
}


function contarColecciones(discursos) {
    const conteos = new Map();

    discursos.forEach(discurso => {
        const colecciones =
            Array.isArray(
                discurso.colecciones
            )
                ? discurso.colecciones
                : [];

        colecciones.forEach(coleccion => {
            const nombre =
                String(
                    coleccion || ""
                ).trim();

            if (!nombre) {
                return;
            }

            const clave =
                normalizarTexto(nombre);

            const registro =
                conteos.get(clave);

            if (registro) {
                registro.cantidad += 1;
                return;
            }

            conteos.set(clave, {
                nombre,
                cantidad: 1
            });
        });
    });

    return [...conteos.values()]
        .sort(
            (a, b) =>
                b.cantidad - a.cantidad ||
                a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    {
                        sensitivity: "base"
                    }
                )
        );
}


function mostrarListaEstadistica(
    contenedor,
    resultados,
    limite,
    tipo
) {
    if (!contenedor) {
        return;
    }

    const resultadosVisibles =
        resultados.slice(0, limite);

    const maximo =
        resultadosVisibles.length > 0
            ? resultadosVisibles[0].cantidad
            : 1;

    contenedor.innerHTML =
        resultadosVisibles
            .map(resultado => {
                const ancho =
                    (
                        resultado.cantidad /
                        maximo
                    ) * 100;

                return `
                    <a
                        class="estadistica-lista-fila"
                        href="${
                            crearEnlaceEstadistica(
                                tipo,
                                resultado.nombre
                            )
                        }"
                    >

                        <div class="estadistica-lista-cabecera">

                            <span>
                                ${escaparHTML(
                                    resultado.nombre
                                )}
                            </span>

                            <strong>
                                ${resultado.cantidad}
                            </strong>

                        </div>

                        <div class="estadistica-lista-barra">

                            <span
                                style="width: ${ancho}%"
                            ></span>

                        </div>

                    </a>
                `;
            })
            .join("");
}


function crearEnlaceEstadistica(
    tipo,
    nombre
) {
    const valor =
        encodeURIComponent(nombre);

    if (tipo === "pais") {
        return `explorar.html?pais=${valor}`;
    }

    if (tipo === "provincia") {
        return (
            "explorar.html?pais=Argentina" +
            `&provincia=${valor}`
        );
    }

    if (tipo === "localidad") {
        return (
            `explorar.html?localidad=${valor}`
        );
    }

    if (tipo === "coleccion") {
        return (
            `coleccion.html?nombre=${valor}`
        );
    }

    return "explorar.html";
}


function valoresUnicos(valores) {
    return [
        ...new Set(
            valores
                .map(valor =>
                    String(
                        valor || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];
}


function calcularPorcentaje(
    cantidad,
    total
) {
    if (!total) {
        return 0;
    }

    return Math.round(
        cantidad * 100 / total
    );
}


function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}


function escaparHTML(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarError() {
    resumenEstadisticas.innerHTML = `
        <p class="mensaje-error">
            No se pudieron cargar las estadísticas.
        </p>
    `;
}