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
            elemento => String(elemento.id) === String(idDiscurso)
        );

        if (!discurso) {
            mostrarError("No se encontró el discurso solicitado.");
            return;
        }

mostrarDiscurso(discurso);
guardarUltimoDiscurso(discurso);

    } catch (error) {
        console.error("Error al cargar el discurso:", error);

        mostrarError(
            "Ocurrió un error al cargar la información del discurso."
        );
    }
}


function mostrarDiscurso(discurso) {
    const imagen = obtenerImagen(discurso);

    const colecciones = obtenerColecciones(discurso.colecciones);

    const descripcion = discurso.descripcion
        ? escaparHTML(discurso.descripcion)
        : "La descripción de este discurso todavía no está disponible.";

    const slogan = discurso.slogan
        ? `
            <p class="detalle-slogan">
                “${escaparHTML(discurso.slogan)}”
            </p>
        `
        : "";

    const lugar = discurso.lugar
        ? `
            <span class="detalle-dato">
                <span class="detalle-icono">📍</span>
                ${escaparHTML(discurso.lugar)}
            </span>
        `
        : "";

    const estado = discurso.estadoVideo
        ? `
            <span class="detalle-chip">
                ${escaparHTML(discurso.estadoVideo)}
            </span>
        `
        : "";

    const etiquetasColecciones = colecciones
        .map(coleccion => {
            return `
                <span class="detalle-chip">
                    ${escaparHTML(coleccion)}
                </span>
            `;
        })
        .join("");

    const botonVideo = discurso.video
        ? `
            <a
                class="boton-reproducir"
                href="${escaparAtributo(discurso.video)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span class="icono-reproducir">▶</span>
                Reproducir discurso
            </a>
        `
        : `
            <button
                class="boton-reproducir boton-deshabilitado"
                type="button"
                disabled
            >
                Video no disponible
            </button>
        `;

    contenedorFicha.innerHTML = `
        <article class="detalle-pagina">

            <section
                class="detalle-hero"
                style="--imagen-fondo: url('${escaparAtributo(imagen)}')"
            >

                <div class="detalle-fondo"></div>

                <div class="detalle-degradado"></div>

                <div class="detalle-hero-contenido">

                    <a class="volver-inicio" href="index.html">
                        ← Volver al archivo
                    </a>

                    <div class="detalle-informacion">

                        <p class="detalle-id">
                            ${escaparHTML(discurso.id)}
                        </p>

                        <h1>
                            ${escaparHTML(discurso.titulo)}
                        </h1>

                        ${slogan}

                        <div class="detalle-metadatos">

                            <span class="detalle-dato">
                                <span class="detalle-icono">📅</span>
                                ${formatearFecha(discurso.fecha)}
                            </span>

                            ${lugar}

                        </div>

                        <div class="detalle-chips">

                            ${estado}

                            ${etiquetasColecciones}

                        </div>

                        <div class="detalle-acciones">

                            ${botonVideo}

                            <a
                                class="boton-secundario"
                                href="#descripcion"
                            >
                                Más información
                            </a>

                        </div>

                    </div>

                </div>

            </section>


            <section
                id="descripcion"
                class="detalle-seccion"
            >

                <div class="detalle-contenedor">

                    <div class="detalle-columna-principal">

                        <p class="detalle-sobrelinea">
                            Sobre este discurso
                        </p>

                        <h2>Descripción</h2>

                        <p class="detalle-descripcion">
                            ${descripcion}
                        </p>

                    </div>


                    <aside class="detalle-panel">

                        <h3>Información</h3>

                        <dl class="detalle-lista">

                            <div>
                                <dt>Fecha</dt>
                                <dd>
                                    ${formatearFecha(discurso.fecha)}
                                </dd>
                            </div>

                            ${
                                discurso.lugar
                                    ? `
                                        <div>
                                            <dt>Lugar</dt>
                                            <dd>
                                                ${escaparHTML(discurso.lugar)}
                                            </dd>
                                        </div>
                                    `
                                    : ""
                            }

                            <div>
                                <dt>ID del archivo</dt>
                                <dd>
                                    ${escaparHTML(discurso.id)}
                                </dd>
                            </div>

                            ${
                                discurso.estadoVideo
                                    ? `
                                        <div>
                                            <dt>Estado audiovisual</dt>
                                            <dd>
                                                ${escaparHTML(
                                                    discurso.estadoVideo
                                                )}
                                            </dd>
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                colecciones.length > 0
                                    ? `
                                        <div>
                                            <dt>Colecciones</dt>
                                            <dd>
                                                ${colecciones
                                                    .map(escaparHTML)
                                                    .join(", ")}
                                            </dd>
                                        </div>
                                    `
                                    : ""
                            }

                        </dl>

                    </aside>

                </div>

            </section>


            <section class="detalle-transcripcion">

                <div class="detalle-contenedor">

                    <p class="detalle-sobrelinea">
                        Archivo documental
                    </p>

                    <h2>Transcripción</h2>

                    <div class="transcripcion-pendiente">

                        <span class="transcripcion-icono">≡</span>

                        <div>
                            <h3>Transcripción próximamente</h3>

                            <p>
                                En una próxima etapa, el texto completo del
                                discurso se mostrará en esta sección.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

        </article>
    `;

    configurarImagenAlternativa(imagen);
    actualizarTituloPagina(discurso.titulo);
}


function obtenerImagen(discurso) {
    if (discurso.miniatura) {
        return discurso.miniatura;
    }

    return `images/miniaturas/${discurso.id}.jpg`;
}


function obtenerColecciones(colecciones) {
    if (Array.isArray(colecciones)) {
        return colecciones
            .map(elemento => String(elemento || "").trim())
            .filter(Boolean);
    }

    const texto = String(colecciones || "").trim();

    return texto ? [texto] : [];
}


function configurarImagenAlternativa(imagenOriginal) {
    const fondo = document.querySelector(".detalle-hero");

    if (!fondo) {
        return;
    }

    const imagenPrueba = new Image();

    imagenPrueba.src = imagenOriginal;

    imagenPrueba.addEventListener("error", () => {
        fondo.style.setProperty(
            "--imagen-fondo",
            "url('../images/miniaturas/sin-miniatura.jpg')"
        );
    });
}


function actualizarTituloPagina(titulo) {
    document.title = `${titulo} | Proyecto Discursos`;
}


function mostrarError(mensaje) {
    if (!contenedorFicha) {
        console.error(mensaje);
        return;
    }

    contenedorFicha.innerHTML = `
        <section class="detalle-error">

            <span class="detalle-error-icono">!</span>

            <h1>No se pudo cargar el discurso</h1>

            <p>${escaparHTML(mensaje)}</p>

            <a class="boton-reproducir" href="index.html">
                Volver al inicio
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

    const fechaLocal = new Date(
        Number(anio),
        Number(mes) - 1,
        Number(dia)
    );

    return fechaLocal.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
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
function guardarUltimoDiscurso(discurso) {
    try {
        const ultimoDiscurso = {
            id: discurso.id,
            titulo: discurso.titulo,
            fecha: discurso.fecha,
            lugar: discurso.lugar,
            miniatura: obtenerImagen(discurso)
        };

        localStorage.setItem(
            "ultimoDiscurso",
            JSON.stringify(ultimoDiscurso)
        );

    } catch (error) {
        console.error(
            "No se pudo guardar el último discurso:",
            error
        );
    }
}