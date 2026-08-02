const contenedorFicha = document.getElementById("ficha-discurso");
let discursoActual = null;
let transcripcionVisible = false;
let transcripcionCargada = false;
let textoTranscripcion = "";

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

discursoActual = discurso;

mostrarDiscurso(discurso);
guardarUltimoDiscurso(discurso);
crearRelacionados(discurso, discursos);

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

    const lugaresEspecificos = obtenerColecciones(discurso.lugaresEspecificos);

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

const pais = discurso.pais
    ? `
        <a
            class="detalle-dato detalle-dato-enlace"
            href="explorar.html?pais=${
                encodeURIComponent(discurso.pais)
            }"
        >
            <span class="detalle-icono">🌎</span>
            ${escaparHTML(discurso.pais)}
        </a>
    `
    : "";

const provincia = discurso.provincia
    ? `
        <a
            class="detalle-dato detalle-dato-enlace"
            href="explorar.html?pais=${
                encodeURIComponent(discurso.pais || "")
            }&provincia=${
                encodeURIComponent(discurso.provincia)
            }"
        >
            <span class="detalle-icono">🏛️</span>
            ${escaparHTML(discurso.provincia)}
        </a>
    `
    : "";

const localidad = discurso.localidad
    ? `
        <a
            class="detalle-dato detalle-dato-enlace"
            href="explorar.html?pais=${
                encodeURIComponent(discurso.pais || "")
            }&provincia=${
                encodeURIComponent(discurso.provincia || "")
            }&localidad=${
                encodeURIComponent(discurso.localidad)
            }"
        >
            <span class="detalle-icono">📍</span>
            ${escaparHTML(discurso.localidad)}
        </a>
    `
    : "";

const etiquetasLugaresEspecificos =
    lugaresEspecificos
        .map(lugarEspecifico => {
            const enlaceLugar =
                `explorar.html?pais=${
                    encodeURIComponent(
                        discurso.pais || ""
                    )
                }&provincia=${
                    encodeURIComponent(
                        discurso.provincia || ""
                    )
                }&localidad=${
                    encodeURIComponent(
                        discurso.localidad || ""
                    )
                }&lugarEspecifico=${
                    encodeURIComponent(
                        lugarEspecifico
                    )
                }`;

            return `
                <a
                    class="
                        detalle-chip
                        detalle-chip-lugar
                        detalle-chip-enlace
                    "
                    href="${enlaceLugar}"
                >
                    🏢 ${escaparHTML(
                        lugarEspecifico
                    )}
                </a>
            `;
        })
        .join("");

        const estado = discurso.estadoVideo
        ? `
            <span class="detalle-chip">
                ${escaparHTML(discurso.estadoVideo)}
            </span>
        `
        : "";

    const etiquetasColecciones = colecciones
    .map(coleccion => {
        const enlaceColeccion =
            `coleccion.html?nombre=${
                encodeURIComponent(coleccion)
            }`;

        return `
            <a
                class="detalle-chip detalle-chip-enlace"
                href="${enlaceColeccion}"
            >
                ${escaparHTML(coleccion)}
            </a>
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

    ${pais}
    ${provincia}
    ${localidad}

</div>

                        <div class="detalle-chips">

    ${estado}

    ${etiquetasLugaresEspecificos}

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
    discurso.pais
        ? `
            <div>
                <dt>País</dt>
                <dd>
                    ${escaparHTML(discurso.pais)}
                </dd>
            </div>
        `
        : ""
}

${
    discurso.provincia
        ? `
            <div>
                <dt>Provincia / Estado</dt>
                <dd>
                    ${escaparHTML(discurso.provincia)}
                </dd>
            </div>
        `
        : ""
}

${
    discurso.localidad
        ? `
            <div>
                <dt>Localidad</dt>
                <dd>
                    ${escaparHTML(discurso.localidad)}
                </dd>
            </div>
        `
        : ""
}

${
    lugaresEspecificos.length > 0
        ? `
            <div>
                <dt>Lugar específico</dt>
                <dd>
                    ${lugaresEspecificos
                        .map(escaparHTML)
                        .join(", ")}
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


            <section
    id="transcripcion"
    class="detalle-transcripcion"
>

    <div class="detalle-contenedor">

        <p class="detalle-sobrelinea">
            Archivo documental
        </p>

        <div class="transcripcion-encabezado">

            <h2>Transcripción</h2>

            <div class="transcripcion-botones">

                <button
                    id="boton-transcripcion"
                    class="boton-reproducir"
                    type="button"
                >
                    ▶ Mostrar
                </button>

                <button
                    id="boton-copiar-transcripcion"
                    class="boton-copiar-transcripcion"
                    type="button"
                    hidden
                >
                    Copiar texto
                </button>

            </div>

        </div>

        <div
            id="transcripcion-contenido"
            class="transcripcion-contenido"
        ></div>

    </div>

</section>

        </article>
    `;

    configurarImagenAlternativa(imagen);
actualizarTituloPagina(discurso.titulo);
configurarBotonTranscripcion();
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
function crearRelacionados(
    discursoActual,
    todosLosDiscursos
) {
    const seccion =
        document.getElementById("relacionados");

    const contenedor =
        document.getElementById(
            "relacionados-contenido"
        );

    if (!seccion || !contenedor) {
        return;
    }

    contenedor.innerHTML = "";
    seccion.hidden = true;

    const colecciones = obtenerColecciones(
        discursoActual.colecciones
    );

    if (colecciones.length === 0) {
        return;
    }

    let hayContenido = false;

    colecciones.forEach(nombreColeccion => {
        const relacionados = todosLosDiscursos
            .filter(discurso => {
                if (
                    String(discurso.id) ===
                    String(discursoActual.id)
                ) {
                    return false;
                }

                const coleccionesDelDiscurso =
                    obtenerColecciones(
                        discurso.colecciones
                    );

                return coleccionesDelDiscurso.some(
                    coleccion =>
                        normalizarColeccion(coleccion) ===
                        normalizarColeccion(
                            nombreColeccion
                        )
                );
            })
            .sort((a, b) =>
                String(b.fecha || "").localeCompare(
                    String(a.fecha || "")
                )
            )
            .slice(0, 12);

        if (relacionados.length === 0) {
            return;
        }

        hayContenido = true;

        const bloque =
            document.createElement("div");

        bloque.className =
            "relacionados-bloque";

        const titulo =
    document.createElement("h2");

const enlaceTitulo =
    document.createElement("a");

enlaceTitulo.className =
    "relacionados-titulo-enlace";

enlaceTitulo.href =
    `coleccion.html?nombre=${
        encodeURIComponent(nombreColeccion)
    }`;

enlaceTitulo.textContent =
    `Más de ${nombreColeccion} →`;

titulo.appendChild(enlaceTitulo);

        const contenedorCarrusel =
            document.createElement("div");

        contenedorCarrusel.className =
            "carrusel-contenedor";

        const carrusel =
            document.createElement("div");

        carrusel.className =
            "cards carrusel-discursos";

        relacionados.forEach(discurso => {
            carrusel.appendChild(
                crearTarjeta(discurso)
            );
        });

        contenedorCarrusel.appendChild(carrusel);

        bloque.appendChild(titulo);
        bloque.appendChild(contenedorCarrusel);

        contenedor.appendChild(bloque);
    });

    if (!hayContenido) {
        return;
    }

    seccion.hidden = false;

    prepararControlesCarrusel();
}


function normalizarColeccion(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}
async function cargarTranscripcion(discurso) {
    const contenedor = document.getElementById(
        "transcripcion-contenido"
    );

    const botonCopiar = document.getElementById(
        "boton-copiar-transcripcion"
    );

    if (!contenedor) {
        return false;
    }

    if (botonCopiar) {
        botonCopiar.hidden = true;
    }

    if (!discurso.tieneTranscripcion) {
        mostrarTranscripcionNoDisponible(
            contenedor
        );

        return true;
    }

    try {
        const ruta =
            `data/transcripciones/${
                encodeURIComponent(discurso.id)
            }.txt`;

        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar la transcripción: ${
                    respuesta.status
                }`
            );
        }

        const texto =
            (await respuesta.text()).trim();

        if (!texto) {
            mostrarTranscripcionNoDisponible(
                contenedor
            );

            return true;
        }

        textoTranscripcion = texto;

        contenedor.innerHTML = `
            <article class="transcripcion-texto">
                ${convertirTranscripcionEnHTML(texto)}
            </article>
        `;

        if (botonCopiar) {
            botonCopiar.hidden = false;

            botonCopiar.onclick = () => {
                copiarTranscripcion(
                    textoTranscripcion,
                    botonCopiar
                );
            };
        }

        return true;

    } catch (error) {
        console.error(
            "Error al cargar la transcripción:",
            error
        );

        contenedor.innerHTML = `
            <div class="transcripcion-pendiente">

                <span class="transcripcion-icono">
                    !
                </span>

                <div>
                    <h3>
                        No se pudo cargar la transcripción
                    </h3>

                    <p>
                        Ocurrió un problema al abrir
                        el archivo. Podés cerrar esta
                        sección e intentarlo nuevamente.
                    </p>
                </div>

            </div>
        `;

        return false;
    }
}


function convertirTranscripcionEnHTML(texto) {
    const textoNormalizado = String(texto || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

    const parrafos = textoNormalizado
        .split(/\n\s*\n/)
        .map(parrafo => parrafo.trim())
        .filter(Boolean);

    return parrafos
        .map(parrafo => {
            const contenido = escaparHTML(parrafo)
                .replace(/\n/g, "<br>");

            return `
                <p>
                    ${contenido}
                </p>
            `;
        })
        .join("");
}


function mostrarTranscripcionNoDisponible(contenedor) {
    contenedor.innerHTML = `
        <div class="transcripcion-pendiente">

            <span class="transcripcion-icono">≡</span>

            <div>
                <h3>Transcripción no disponible</h3>

                <p>
                    Este discurso todavía no posee una
                    transcripción incorporada al archivo.
                </p>
            </div>

        </div>
    `;
}


async function copiarTranscripcion(
    texto,
    boton
) {
    const textoOriginal = boton.textContent;

    try {
        await navigator.clipboard.writeText(texto);

        boton.textContent = "Texto copiado";

        window.setTimeout(() => {
            boton.textContent = textoOriginal;
        }, 2000);

    } catch (error) {
        console.error(
            "No se pudo copiar la transcripción:",
            error
        );

        boton.textContent = "No se pudo copiar";

        window.setTimeout(() => {
            boton.textContent = textoOriginal;
        }, 2000);
    }
}
function configurarBotonTranscripcion() {
    const boton = document.getElementById(
        "boton-transcripcion"
    );

    if (!boton) {
        return;
    }

    boton.addEventListener(
        "click",
        alternarTranscripcion
    );
}
async function alternarTranscripcion() {
    const boton = document.getElementById(
        "boton-transcripcion"
    );

    const contenedor = document.getElementById(
        "transcripcion-contenido"
    );

    if (
        !boton ||
        !contenedor ||
        !discursoActual
    ) {
        return;
    }

    if (transcripcionVisible) {
        contenedor.classList.remove(
    "transcripcion-contenido-visible"
);

        boton.textContent =
            "▶ Mostrar";

        transcripcionVisible = false;
        return;
    }

    if (!transcripcionCargada) {
        boton.disabled = true;
        boton.textContent =
            "Cargando transcripción…";

        const resultado =
            await cargarTranscripcion(
                discursoActual
            );

        transcripcionCargada = resultado;

        boton.disabled = false;
    }

    contenedor.classList.add(
    "transcripcion-contenido-visible"
);

    boton.textContent =
        "▼ Ocultar";

    transcripcionVisible = true;
}