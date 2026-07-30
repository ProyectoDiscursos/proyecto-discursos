const LIMITE_POR_CARRUSEL = 12;

const CONFIGURACION_CARRUSELES = [
    {
        contenedor: "carrusel-destacados",
        colecciones: [
            "Discursos destacados",
            "Destacados"
        ]
    },
    {
        contenedor: "carrusel-malvinas",
        colecciones: [
            "Malvinas"
        ]
    },
    {
        contenedor: "carrusel-25-mayo",
        colecciones: [
            "25 de Mayo",
            "25 de mayo"
        ]
    },
    {
        contenedor: "carrusel-asunciones",
        colecciones: [
            "Asunciones",
            "Asunción",
            "Asunciones y apertura de sesiones"
        ]
    },
    {
        contenedor: "carrusel-aperturas",
        colecciones: [
            "Aperturas del Congreso",
            "Apertura de sesiones",
            "Aperturas",
            "Asunciones y apertura de sesiones"
        ]
    },
    {
        contenedor: "carrusel-cadenas",
        colecciones: [
            "Cadenas Nacionales",
            "Cadena Nacional",
            "Cadenas nacionales"
        ]
    }
];

document.addEventListener("DOMContentLoaded", cargarHome);


async function cargarHome() {
    try {
        const respuesta = await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el JSON: ${respuesta.status}`
            );
        }

        const discursos = await respuesta.json();

        crearHeroDinamico(discursos);
        crearCarruselesPorColeccion(discursos);
        crearCarruselUltimos(discursos);
        prepararControlesCarrusel();

    } catch (error) {
        console.error("Error al cargar el home:", error);

        mostrarErrorEnCarruseles();
    }
}


function prepararControlesCarrusel() {
    const carruseles = document.querySelectorAll(
        ".carrusel-discursos"
    );

    carruseles.forEach(carrusel => {
        if (carrusel.closest(".carrusel-contenedor")) {
            return;
        }

        const contenedor = document.createElement("div");
        contenedor.classList.add("carrusel-contenedor");

        const botonIzquierda = crearBotonCarrusel(
            "izquierda",
            "‹",
            "Desplazar hacia la izquierda"
        );

        const botonDerecha = crearBotonCarrusel(
            "derecha",
            "›",
            "Desplazar hacia la derecha"
        );

        carrusel.parentNode.insertBefore(
            contenedor,
            carrusel
        );

        contenedor.appendChild(botonIzquierda);
        contenedor.appendChild(carrusel);
        contenedor.appendChild(botonDerecha);

        botonIzquierda.addEventListener("click", () => {
            desplazarCarrusel(carrusel, -1);
        });

        botonDerecha.addEventListener("click", () => {
            desplazarCarrusel(carrusel, 1);
        });

        carrusel.addEventListener("scroll", () => {
            actualizarBotonesCarrusel(
                carrusel,
                botonIzquierda,
                botonDerecha
            );
        });

        actualizarBotonesCarrusel(
            carrusel,
            botonIzquierda,
            botonDerecha
        );
    });

    window.addEventListener(
        "resize",
        actualizarTodosLosCarruseles
    );
}
function crearBotonCarrusel(direccion, simbolo, etiqueta) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.classList.add(
        "boton-carrusel",
        `boton-carrusel-${direccion}`
    );

    boton.innerHTML = `
        <span aria-hidden="true">${simbolo}</span>
    `;

    boton.setAttribute("aria-label", etiqueta);

    return boton;
}


function desplazarCarrusel(carrusel, direccion) {
    const distancia = Math.max(
        carrusel.clientWidth * 0.8,
        320
    );

    carrusel.scrollBy({
        left: direccion * distancia,
        behavior: "smooth"
    });
}


function actualizarBotonesCarrusel(
    carrusel,
    botonIzquierda,
    botonDerecha
) {
    const margen = 5;

    const estaAlInicio =
        carrusel.scrollLeft <= margen;

    const estaAlFinal =
        carrusel.scrollLeft + carrusel.clientWidth >=
        carrusel.scrollWidth - margen;

    const tieneDesplazamiento =
        carrusel.scrollWidth > carrusel.clientWidth + margen;

    botonIzquierda.disabled =
        !tieneDesplazamiento || estaAlInicio;

    botonDerecha.disabled =
        !tieneDesplazamiento || estaAlFinal;

    botonIzquierda.hidden = !tieneDesplazamiento;
    botonDerecha.hidden = !tieneDesplazamiento;
}


function actualizarTodosLosCarruseles() {
    const contenedores = document.querySelectorAll(
        ".carrusel-contenedor"
    );

    contenedores.forEach(contenedor => {
        const carrusel = contenedor.querySelector(
            ".carrusel-discursos"
        );

        const botonIzquierda = contenedor.querySelector(
            ".boton-carrusel-izquierda"
        );

        const botonDerecha = contenedor.querySelector(
            ".boton-carrusel-derecha"
        );

        if (
            carrusel &&
            botonIzquierda &&
            botonDerecha
        ) {
            actualizarBotonesCarrusel(
                carrusel,
                botonIzquierda,
                botonDerecha
            );
        }
    });
}
        mostrarErrorEnCarruseles();


function crearHeroDinamico(discursos) {
    if (!Array.isArray(discursos) || discursos.length === 0) {
        return;
    }

    const discursosOrdenados = [...discursos]
        .sort(ordenarPorFechaDescendente);

    const destacado = discursosOrdenados.find(discurso =>
        perteneceAColeccion(
            discurso,
            [
                "Discursos destacados",
                "Destacados"
            ]
        )
    );

    const discursoHero = destacado || discursosOrdenados[0];

    mostrarHero(discursoHero);
}


function mostrarHero(discurso) {
    const hero = document.getElementById("hero-principal");
    const fondo = document.getElementById("hero-fondo");
    const titulo = document.getElementById("hero-titulo");
    const datos = document.getElementById("hero-datos");
    const slogan = document.getElementById("hero-slogan");
    const descripcion = document.getElementById("hero-descripcion");
    const enlace = document.getElementById("hero-enlace");

    if (
        !hero ||
        !fondo ||
        !titulo ||
        !datos ||
        !slogan ||
        !descripcion ||
        !enlace
    ) {
        return;
    }

    titulo.textContent =
        discurso.titulo || "Discurso sin título";

    const datosHero = [
        formatearFecha(discurso.fecha),
        discurso.lugar
    ].filter(Boolean);

    datos.textContent = datosHero.join(" · ");

    const textoSlogan =
        discurso.slogan ||
        discurso.tagline ||
        "";

    slogan.textContent = textoSlogan;

    const textoDescripcion =
        discurso.descripcion ||
        discurso.description ||
        "";

    descripcion.textContent = textoDescripcion;

    slogan.hidden = !textoSlogan;
    descripcion.hidden = !textoDescripcion;

    if (discurso.id) {
        enlace.href =
            `discurso.html?id=${encodeURIComponent(discurso.id)}`;
    }

    const imagenHero =
        discurso.miniatura ||
        "images/miniaturas/sin-miniatura.jpg";

    fondo.style.backgroundImage = `
        linear-gradient(
            90deg,
            rgba(5, 8, 18, 0.98) 0%,
            rgba(5, 8, 18, 0.82) 38%,
            rgba(5, 8, 18, 0.35) 70%,
            rgba(5, 8, 18, 0.55) 100%
        ),
        linear-gradient(
            0deg,
            rgba(5, 8, 18, 1) 0%,
            rgba(5, 8, 18, 0) 45%
        ),
        url("${escaparURLCSS(imagenHero)}")
    `;
}


function escaparURLCSS(url) {
    return String(url || "")
        .replaceAll("\\", "\\\\")
        .replaceAll('"', '\\"')
        .replaceAll("\n", "");
}
function crearCarruselesPorColeccion(discursos) {
    CONFIGURACION_CARRUSELES.forEach(configuracion => {
        const coincidencias = discursos
            .filter(discurso =>
                perteneceAColeccion(
                    discurso,
                    configuracion.colecciones
                )
            )
            .sort(ordenarPorFechaDescendente)
            .slice(0, LIMITE_POR_CARRUSEL);

        mostrarCarrusel(
            configuracion.contenedor,
            coincidencias
        );
    });
}


function crearCarruselUltimos(discursos) {
    const ultimos = [...discursos]
        .sort(ordenarPorFechaDescendente)
        .slice(0, LIMITE_POR_CARRUSEL);

    mostrarCarrusel("carrusel-ultimos", ultimos);
}


function perteneceAColeccion(discurso, nombresBuscados) {
    const colecciones = Array.isArray(discurso.colecciones)
        ? discurso.colecciones
        : [];

    const coleccionesNormalizadas =
        colecciones.map(normalizarTexto);

    return nombresBuscados.some(nombreBuscado => {
        const nombreNormalizado =
            normalizarTexto(nombreBuscado);

        return coleccionesNormalizadas.some(coleccion =>
            coleccion === nombreNormalizado ||
            coleccion.includes(nombreNormalizado) ||
            nombreNormalizado.includes(coleccion)
        );
    });
}


function mostrarCarrusel(idContenedor, discursos) {
    const contenedor =
        document.getElementById(idContenedor);

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    const seccion = contenedor.closest(".row");

    if (discursos.length === 0) {
        if (seccion) {
            seccion.hidden = true;
        }

        return;
    }

    if (seccion) {
        seccion.hidden = false;
    }

    discursos.forEach(discurso => {
        contenedor.appendChild(
            crearTarjeta(discurso)
        );
    });
}


function crearTarjeta(discurso) {
    const tarjeta = document.createElement("article");

    tarjeta.classList.add("card");
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "link");

    const imagen = discurso.miniatura
        ? discurso.miniatura
        : `images/miniaturas/${discurso.id}.jpg`;

    tarjeta.innerHTML = `
        <img
            src="${escaparHTML(imagen)}"
            alt="${escaparHTML(
                discurso.titulo || "Discurso"
            )}"
            loading="lazy"
        >

        <div class="card-info">

            <h3>
                ${escaparHTML(
                    discurso.titulo ||
                    "Discurso sin título"
                )}
            </h3>

            <p>
                ${formatearFecha(discurso.fecha)}
                ${
                    discurso.lugar
                        ? ` · ${escaparHTML(
                            discurso.lugar
                        )}`
                        : ""
                }
            </p>

        </div>
    `;

    const imagenTarjeta =
        tarjeta.querySelector("img");

    imagenTarjeta.addEventListener(
        "error",
        () => {
            imagenTarjeta.src =
                "images/miniaturas/sin-miniatura.jpg";
        },
        { once: true }
    );

    tarjeta.addEventListener("click", () => {
        abrirDiscurso(discurso.id);
    });

    tarjeta.addEventListener("keydown", evento => {
        if (
            evento.key === "Enter" ||
            evento.key === " "
        ) {
            evento.preventDefault();
            abrirDiscurso(discurso.id);
        }
    });

    return tarjeta;
}


function ordenarPorFechaDescendente(a, b) {
    return String(b.fecha || "")
        .localeCompare(String(a.fecha || ""));
}


function abrirDiscurso(id) {
    if (!id) {
        return;
    }

    window.location.href =
        `discurso.html?id=${encodeURIComponent(id)}`;
}


function mostrarErrorEnCarruseles() {
    const contenedores = document.querySelectorAll(
        ".carrusel-discursos"
    );

    contenedores.forEach(contenedor => {
        contenedor.innerHTML = `
            <p class="mensaje-error">
                No se pudieron cargar los discursos.
            </p>
        `;
    });
}


function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
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