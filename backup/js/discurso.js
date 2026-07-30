const contenedorFicha = document.getElementById("ficha-discurso");

cargarDiscurso();


async function cargarDiscurso() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const idDiscurso = parametros.get("id");

        if (!idDiscurso) {
            mostrarError("No se indicó qué discurso cargar.");
            return;
        }

        const respuesta = await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el archivo JSON: ${respuesta.status}`
            );
        }

        const discursos = await respuesta.json();

        const discurso = discursos.find(
            item => String(item.id) === String(idDiscurso)
        );

        if (!discurso) {
            mostrarError("No se encontró el discurso solicitado.");
            return;
        }

        mostrarDiscurso(discurso);

    } catch (error) {
        console.error("Error al cargar el discurso:", error);

        mostrarError(
            "Ocurrió un error al cargar la información del discurso."
        );
    }
}


function mostrarDiscurso(discurso) {
    const imagen = discurso.miniatura
        ? discurso.miniatura
        : `images/miniaturas/${discurso.id}.jpg`;

    const colecciones = obtenerColecciones(discurso.colecciones);

    const botonVideo = discurso.video
        ? `
            <a
                class="boton-video"
                href="${escaparAtributo(discurso.video)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ▶ Ver discurso
            </a>
        `
        : `
            <p class="video-no-disponible">
                Video no disponible
            </p>
        `;

    contenedorFicha.innerHTML = `
        <article class="detalle-discurso">

            <div class="detalle-imagen">

                <img
                    id="imagen-discurso"
                    src="${escaparAtributo(imagen)}"
                    alt="${escaparHTML(discurso.titulo)}"
                >

            </div>

            <div class="detalle-contenido">

                <p class="detalle-id">
                    ${escaparHTML(discurso.id)}
                </p>

                <h1>
                    ${escaparHTML(discurso.titulo)}
                </h1>

                ${
                    discurso.slogan
                        ? `
                            <p class="detalle-slogan">
                                “${escaparHTML(discurso.slogan)}”
                            </p>
                        `
                        : ""
                }

                <div class="detalle-datos">

                    <p>
                        <strong>Fecha:</strong>
                        ${formatearFecha(discurso.fecha)}
                    </p>

                    ${
                        discurso.lugar
                            ? `
                                <p>
                                    <strong>Lugar:</strong>
                                    ${escaparHTML(discurso.lugar)}
                                </p>
                            `
                            : ""
                    }

                    ${
                        colecciones
                            ? `
                                <p>
                                    <strong>Colecciones:</strong>
                                    ${escaparHTML(colecciones)}
                                </p>
                            `
                            : ""
                    }

                    ${
                        discurso.estadoVideo
                            ? `
                                <p>
                                    <strong>Estado audiovisual:</strong>
                                    ${escaparHTML(discurso.estadoVideo)}
                                </p>
                            `
                            : ""
                    }

                </div>

                ${
                    discurso.descripcion
                        ? `
                            <section class="detalle-descripcion">

                                <h2>Descripción</h2>

                                <p>
                                    ${escaparHTML(discurso.descripcion)}
                                </p>

                            </section>
                        `
                        : ""
                }

                <div class="detalle-acciones">
                    ${botonVideo}
                </div>

            </div>

        </article>
    `;

    configurarImagenAlternativa();
}


function configurarImagenAlternativa() {
    const imagen = document.getElementById("imagen-discurso");

    if (!imagen) {
        return;
    }

    imagen.addEventListener(
        "error",
        () => {
            imagen.src = "images/miniaturas/sin-miniatura.jpg";
        },
        { once: true }
    );
}


function obtenerColecciones(colecciones) {
    if (Array.isArray(colecciones)) {
        return colecciones.filter(Boolean).join(", ");
    }

    return String(colecciones || "").trim();
}


function mostrarError(mensaje) {
    if (!contenedorFicha) {
        console.error(mensaje);
        return;
    }

    contenedorFicha.innerHTML = `
        <section class="mensaje-error">

            <h1>No se pudo cargar el discurso</h1>

            <p>${escaparHTML(mensaje)}</p>

            <a href="index.html">
                ← Volver al inicio
            </a>

        </section>
    `;
}


function formatearFecha(fecha) {
    if (!fecha) {
        return "Fecha no disponible";
    }

    const partes = String(fecha).split("-");

    if (partes.length !== 3) {
        return escaparHTML(fecha);
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


function escaparAtributo(texto) {
    return escaparHTML(texto);
}