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
            crearContinuarViendo(discursos);
            crearCarruselesPorColeccion(discursos);
            crearCarruselUltimos(discursos);
            prepararControlesCarrusel();

    } catch (error) {
        console.error("Error al cargar el home:", error);

        mostrarErrorEnCarruseles();
    }
}

function crearContinuarViendo(discursos) {
    const seccion = document.getElementById("seccion-continuar");
    const contenedor = document.getElementById("carrusel-continuar");

    if (!seccion || !contenedor) {
        return;
    }

    let ultimoGuardado;

    try {
        ultimoGuardado = JSON.parse(
            localStorage.getItem("ultimoDiscurso")
        );
    } catch (error) {
        console.error(
            "No se pudo leer el último discurso:",
            error
        );

        localStorage.removeItem("ultimoDiscurso");
        return;
    }

    if (!ultimoGuardado?.id) {
        return;
    }

    const discursoCompleto = discursos.find(
        discurso =>
            String(discurso.id) ===
            String(ultimoGuardado.id)
    );

    const discurso = discursoCompleto || ultimoGuardado;

    contenedor.innerHTML = "";
    contenedor.appendChild(crearTarjeta(discurso));

    seccion.hidden = false;
}

let discursosDelHero = [];
let indiceHeroActual = 0;
let intervaloHero = null;


function crearHeroDinamico(discursos) {
    if (!Array.isArray(discursos) || discursos.length === 0) {
        return;
    }

    const discursosOrdenados = [...discursos]
        .sort(ordenarPorFechaDescendente);

    const destacados = discursosOrdenados.filter(discurso =>
        perteneceAColeccion(
            discurso,
            [
                "Discursos destacados",
                "Destacados"
            ]
        )
    );

    discursosDelHero = destacados.length > 0
        ? destacados
        : discursosOrdenados.slice(0, 5);

    indiceHeroActual = 0;

    mostrarDiscursoHero(indiceHeroActual);
    crearIndicadoresHero();
    iniciarRotacionHero();
    configurarPausaHero();
}

function mostrarDiscursoHero(indice) {
    if (discursosDelHero.length === 0) {
        return;
    }

    const hero = document.getElementById("hero-principal");

    if (!hero) {
        return;
    }

    indiceHeroActual =
        (indice + discursosDelHero.length) %
        discursosDelHero.length;

    hero.classList.add("hero-cambiando");

    window.setTimeout(() => {
        mostrarHero(
            discursosDelHero[indiceHeroActual]
        );

        actualizarIndicadoresHero();

        hero.classList.remove("hero-cambiando");
    }, 250);
}


function iniciarRotacionHero() {
    detenerRotacionHero();

    if (discursosDelHero.length <= 1) {
        return;
    }

    intervaloHero = window.setInterval(() => {
        mostrarDiscursoHero(indiceHeroActual + 1);
    }, 10000);
}


function detenerRotacionHero() {
    if (intervaloHero) {
        window.clearInterval(intervaloHero);
        intervaloHero = null;
    }
}


function configurarPausaHero() {
    const hero = document.getElementById("hero-principal");

    if (!hero || hero.dataset.rotacionConfigurada === "true") {
        return;
    }

    hero.dataset.rotacionConfigurada = "true";

    hero.addEventListener("mouseenter", detenerRotacionHero);
    hero.addEventListener("mouseleave", iniciarRotacionHero);

    hero.addEventListener("focusin", detenerRotacionHero);
    hero.addEventListener("focusout", iniciarRotacionHero);
}


function crearIndicadoresHero() {
    const contenedor = document.getElementById(
        "hero-indicadores"
    );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (discursosDelHero.length <= 1) {
        contenedor.hidden = true;
        return;
    }

    contenedor.hidden = false;

    discursosDelHero.forEach((discurso, indice) => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "hero-indicador";

        boton.setAttribute(
            "aria-label",
            `Mostrar destacado ${indice + 1}: ${discurso.titulo}`
        );

        boton.addEventListener("click", () => {
            mostrarDiscursoHero(indice);
            iniciarRotacionHero();
        });

        contenedor.appendChild(boton);
    });

    actualizarIndicadoresHero();
}


function actualizarIndicadoresHero() {
    const indicadores = document.querySelectorAll(
        ".hero-indicador"
    );

    indicadores.forEach((indicador, indice) => {
        const activo = indice === indiceHeroActual;

        indicador.classList.toggle(
            "hero-indicador-activo",
            activo
        );

        indicador.setAttribute(
            "aria-current",
            activo ? "true" : "false"
        );
    });
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

function ordenarPorFechaDescendente(a, b) {
    return String(b.fecha || "")
        .localeCompare(String(a.fecha || ""));
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