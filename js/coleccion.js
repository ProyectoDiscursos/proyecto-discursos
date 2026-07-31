const tituloColeccion =
    document.getElementById("titulo-coleccion");

const cantidadColeccion =
    document.getElementById("cantidad-coleccion");

const contenedorColeccion =
    document.getElementById("discursos-coleccion");


cargarColeccion();


async function cargarColeccion() {
    try {
        const parametros =
            new URLSearchParams(window.location.search);

        const nombreColeccion =
            String(parametros.get("nombre") || "").trim();

        if (!nombreColeccion) {
            mostrarError(
                "No se indicó qué colección mostrar."
            );

            return;
        }

        const respuesta =
            await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el JSON: ${respuesta.status}`
            );
        }

        const discursos = await respuesta.json();

        const resultados = discursos
            .filter(discurso => {
                const colecciones =
                    obtenerColecciones(
                        discurso.colecciones
                    );

                return colecciones.some(
                    coleccion =>
                        normalizarTexto(coleccion) ===
                        normalizarTexto(nombreColeccion)
                );
            })
            .sort((a, b) =>
                String(b.fecha || "").localeCompare(
                    String(a.fecha || "")
                )
            );

        mostrarColeccion(
            nombreColeccion,
            resultados
        );

    } catch (error) {
        console.error(
            "Error al cargar la colección:",
            error
        );

        mostrarError(
            "No se pudo cargar esta colección."
        );
    }
}


function mostrarColeccion(
    nombreColeccion,
    discursos
) {
    tituloColeccion.textContent =
        nombreColeccion;

    document.title =
        `${nombreColeccion} | Proyecto Discursos`;

    cantidadColeccion.textContent =
        discursos.length === 1
            ? "1 discurso"
            : `${discursos.length} discursos`;

    contenedorColeccion.innerHTML = "";

    if (discursos.length === 0) {
        contenedorColeccion.innerHTML = `
            <p class="sin-resultados">
                No se encontraron discursos en esta colección.
            </p>
        `;

        return;
    }

    discursos.forEach(discurso => {
        contenedorColeccion.appendChild(
            crearTarjeta(discurso)
        );
    });
}


function obtenerColecciones(colecciones) {
    if (Array.isArray(colecciones)) {
        return colecciones
            .map(coleccion =>
                String(coleccion || "").trim()
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
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


function mostrarError(mensaje) {
    tituloColeccion.textContent =
        "Colección no disponible";

    cantidadColeccion.textContent = "";

    contenedorColeccion.innerHTML = `
        <p class="mensaje-error">
            ${escaparHTML(mensaje)}
        </p>
    `;
}


function escaparHTML(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}