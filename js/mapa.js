const contenedorEstado =
    document.getElementById(
        "mapa-estado"
    );

cargarMapa();


async function cargarMapa() {
    try {
        const [
            respuestaDiscursos,
            respuestaLugares
        ] = await Promise.all([
            fetch("data/discursos.json"),
            fetch("data/lugares.json")
        ]);

        if (!respuestaDiscursos.ok) {
            throw new Error(
                "No se pudo cargar discursos.json"
            );
        }

        if (!respuestaLugares.ok) {
            throw new Error(
                "No se pudo cargar lugares.json"
            );
        }

        const discursos =
            await respuestaDiscursos.json();

        const lugares =
            await respuestaLugares.json();

        const conteos =
            contarDiscursosPorLugar(
                discursos
            );

        crearMapa(
            lugares,
            conteos
        );

    } catch (error) {
        console.error(
            "Error al cargar el mapa:",
            error
        );

        if (contenedorEstado) {
            contenedorEstado.textContent =
                "No se pudo cargar el mapa.";
        }
    }
}


function crearMapa(
    lugares,
    conteos
) {
    const mapa = L.map(
        "mapa",
        {
            worldCopyJump: true
        }
    ).setView(
        [-38.4, -63.6],
        4
    );

    L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
        maxZoom: 20,
        attribution:
            "&copy; OpenStreetMap &copy; CARTO"
    }
    ).addTo(mapa);

    L.marker(
    [-51.75, -59.0],
    {
        interactive: false,
        opacity: 0
    }
)
.bindTooltip(
    "Islas Malvinas",
    {
        permanent: true,
        direction: "center",
        className: "etiqueta-malvinas"
    }
)
.addTo(mapa);
    let marcadoresAgregados = 0;

    lugares.forEach(lugar => {
        const clave =
            crearClaveLugar(
                lugar.pais,
                lugar.provincia,
                lugar.localidad
            );

        const cantidad =
            conteos.get(clave) || 0;

        if (
            !cantidad ||
            !Number.isFinite(
                Number(lugar.lat)
            ) ||
            !Number.isFinite(
                Number(lugar.lng)
            )
        ) {
            return;
        }

        const marcador =
            L.marker([
                Number(lugar.lat),
                Number(lugar.lng)
            ]);

        marcador.bindPopup(
            crearPopup(
                lugar,
                cantidad
            )
        );

        marcador.addTo(mapa);

        marcadoresAgregados += 1;
    });

    if (contenedorEstado) {
        contenedorEstado.textContent =
            `${marcadoresAgregados} localidades`;

        window.setTimeout(() => {
            contenedorEstado.hidden = true;
        }, 2500);
    }
}


function contarDiscursosPorLugar(
    discursos
) {
    const conteos = new Map();

    discursos.forEach(discurso => {
        const clave =
            crearClaveLugar(
                discurso.pais,
                discurso.provincia,
                discurso.localidad
            );

        if (!clave) {
            return;
        }

        conteos.set(
            clave,
            (
                conteos.get(clave) || 0
            ) + 1
        );
    });

    return conteos;
}


function crearPopup(
    lugar,
    cantidad
) {
    const enlace =
        crearEnlaceExplorar(
            lugar
        );

    const ubicacion =
        [
            lugar.provincia,
            lugar.pais
        ]
            .filter(Boolean)
            .join(", ");

    return `
        <div class="mapa-popup">

            <h3>
                ${escaparHTML(
                    lugar.localidad
                )}
            </h3>

            <p>
                ${
                    escaparHTML(
                        ubicacion
                    )
                }
            </p>

            <p>
                <strong>
                    ${cantidad}
                </strong>
                ${
                    cantidad === 1
                        ? "discurso"
                        : "discursos"
                }
            </p>

            <a href="${enlace}">
                Ver discursos
            </a>

        </div>
    `;
}


function crearEnlaceExplorar(
    lugar
) {
    const parametros =
        new URLSearchParams();

    if (lugar.pais) {
        parametros.set(
            "pais",
            lugar.pais
        );
    }

    if (lugar.provincia) {
        parametros.set(
            "provincia",
            lugar.provincia
        );
    }

    if (lugar.localidad) {
        parametros.set(
            "localidad",
            lugar.localidad
        );
    }

    return (
        "explorar.html?" +
        parametros.toString()
    );
}


function crearClaveLugar(
    pais,
    provincia,
    localidad
) {
    const partes = [
        pais,
        provincia,
        localidad
    ]
        .map(normalizarTexto);

    if (!partes[2]) {
        return "";
    }

    return partes.join("|");
}


function normalizarTexto(
    texto
) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
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
        .replaceAll("'", "&#039;");
}