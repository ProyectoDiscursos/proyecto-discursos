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

        crearCarruselesPorColeccion(discursos);
        crearCarruselUltimos(discursos);

    } catch (error) {
        console.error("Error al cargar el home:", error);

        mostrarErrorEnCarruseles();
    }
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