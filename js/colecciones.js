const contenedorColecciones =
    document.getElementById(
        "colecciones-contenido"
    );


const gruposColecciones = [
    {
        titulo: "🇦🇷 Efemérides",
        colecciones: [
            "Malvinas",
            "Revolución de Mayo",
            "20 de junio",
            "9 de julio",
            "17 de octubre",
            "Día de la Industria",
            "Día de la Soberanía Nacional",
            "Día de los Derechos Humanos",
            "Bicentenario",
            "Día Internacional de la Mujer",
        ]
    },
    {
        titulo: "🏛 Política argentina",
        colecciones: [
            "Evita",
            "Fuerzas Armadas",
            "YPF",
            "Aerolíneas Argentinas",
            "Universidades Nacionales",
            "Deporte",
        ]
    },
    {
        titulo: "🌎 Relaciones internacionales",
        colecciones: [
            "Visitas de mandatarios extranjeros",
            "Viajes al exterior",
            "Naciones Unidas",
            "UNASUR",
            "MERCOSUR",
            "G-20",
            "G-77",
            "CELAC",
            "Cumbre de las Américas",
            "Consejo de las Américas",
            "Cumbre América Latina y el Caribe",
            "Cumbre América Latina y el Caribe - Unión Europea",
            "Cumbre América del Sur - África",
            "Cumbre América del Sur - Países Árabes",
            "Cumbre CELAC - UE",
            "Cumbre BRICS - UNASUR",
            "Grupo de Río",
            "Cumbre Iberoamericana",
            "Organización Internacional del Trabajo",
            "FAO",
        ]
    },
    {
        titulo: "🎙 Actividades y ámbitos",
        colecciones: [
            "Asunciones y apertura de sesiones",
            "Cadena Nacional",
            "Conferencias de prensa y entrevistas",
            "Conferencias y disertaciones",
            "Acto partidario",
            "Patios Militantes",
            "Presentación de Sinceramente",
            "Inauguraciones de salas y salones en Casa de Gobierno",
            "Homenajes y conmemoraciones"
        ]
    }
];


cargarColecciones();


async function cargarColecciones() {
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

        const conteos =
            contarColecciones(discursos);

        mostrarColecciones(conteos);

    } catch (error) {
        console.error(
            "Error al cargar las colecciones:",
            error
        );

        mostrarError();
    }
}


function contarColecciones(discursos) {
    const conteos = new Map();

    discursos.forEach(discurso => {
        const colecciones =
            obtenerColecciones(
                discurso.colecciones
            );

        colecciones.forEach(coleccion => {
            const clave =
                normalizarTexto(coleccion);

            const registro =
                conteos.get(clave);

            if (registro) {
                registro.cantidad += 1;
                return;
            }

            conteos.set(clave, {
                nombre: coleccion,
                cantidad: 1
            });
        });
    });

    return conteos;
}


function mostrarColecciones(conteos) {
    contenedorColecciones.innerHTML = "";

    const coleccionesMostradas =
        new Set();

    gruposColecciones.forEach(grupo => {
        const coleccionesDelGrupo =
            grupo.colecciones
                .map(nombre => {
                    const clave =
                        normalizarTexto(nombre);

                    return conteos.get(clave);
                })
                .filter(Boolean);

        if (
            coleccionesDelGrupo.length === 0
        ) {
            return;
        }

        const seccion =
            crearGrupoColecciones(
                grupo.titulo,
                coleccionesDelGrupo
            );

        contenedorColecciones.appendChild(
            seccion
        );

        coleccionesDelGrupo.forEach(
            coleccion => {
                coleccionesMostradas.add(
                    normalizarTexto(
                        coleccion.nombre
                    )
                );
            }
        );
    });

    const otrasColecciones =
        [...conteos.values()]
            .filter(coleccion => {
                return !coleccionesMostradas.has(
                    normalizarTexto(
                        coleccion.nombre
                    )
                );
            })
            .sort((a, b) =>
                a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    {
                        sensitivity: "base"
                    }
                )
            );

    if (otrasColecciones.length > 0) {
        const seccionOtras =
            crearGrupoColecciones(
                "📚 Otras colecciones",
                otrasColecciones
            );

        contenedorColecciones.appendChild(
            seccionOtras
        );
    }
}


function crearGrupoColecciones(
    tituloGrupo,
    colecciones
) {
    const seccion =
        document.createElement("section");

    seccion.className =
        "grupo-colecciones";

    const titulo =
        document.createElement("h2");

    titulo.textContent =
        tituloGrupo;

    const grilla =
        document.createElement("div");

    grilla.className =
        "grilla-colecciones";

    colecciones.forEach(coleccion => {
        grilla.appendChild(
            crearTarjetaColeccion(
                coleccion
            )
        );
    });

    seccion.appendChild(titulo);
    seccion.appendChild(grilla);

    return seccion;
}


function crearTarjetaColeccion(coleccion) {
    const enlace =
        document.createElement("a");

    enlace.className =
        "tarjeta-coleccion";

    enlace.href =
        `coleccion.html?nombre=${
            encodeURIComponent(
                coleccion.nombre
            )
        }`;

    enlace.innerHTML = `
        <span class="tarjeta-coleccion-nombre">
            ${escaparHTML(
                coleccion.nombre
            )}
        </span>

        <span class="tarjeta-coleccion-cantidad">
            ${
                coleccion.cantidad === 1
                    ? "1 discurso"
                    : `${coleccion.cantidad} discursos`
            }
        </span>

        <span
            class="tarjeta-coleccion-flecha"
            aria-hidden="true"
        >
            →
        </span>
    `;

    return enlace;
}


function obtenerColecciones(colecciones) {
    if (Array.isArray(colecciones)) {
        return colecciones
            .map(coleccion =>
                String(
                    coleccion || ""
                ).trim()
            )
            .filter(Boolean);
    }

    const texto =
        String(colecciones || "").trim();

    return texto ? [texto] : [];
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
    contenedorColecciones.innerHTML = `
        <p class="mensaje-error">
            No se pudieron cargar las colecciones.
        </p>
    `;
}