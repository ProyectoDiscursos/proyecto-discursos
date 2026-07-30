const contenedor = document.getElementById("discursos");
const buscador = document.getElementById("buscar-discursos");
const contador = document.getElementById("cantidad-resultados");

let todosLosDiscursos = [];

cargarDiscursos();


async function cargarDiscursos() {
    try {
        const respuesta = await fetch("data/discursos.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el JSON: ${respuesta.status}`
            );
        }

        todosLosDiscursos = await respuesta.json();

        mostrarDiscursos(todosLosDiscursos);

    } catch (error) {
        console.error("Error al cargar los discursos:", error);

        if (contenedor) {
            contenedor.innerHTML = `
                <p class="mensaje-error">
                    No se pudo cargar el archivo de discursos.
                </p>
            `;
        }
    }
}


function mostrarDiscursos(discursos) {
    if (!contenedor) {
        console.error('No existe el elemento con id="discursos".');
        return;
    }

    contenedor.innerHTML = "";

    actualizarContador(discursos.length);

    if (discursos.length === 0) {
        contenedor.innerHTML = `
            <p class="sin-resultados">
                No se encontraron discursos.
            </p>
        `;

        return;
    }

    discursos.forEach(discurso => {
        const tarjeta = crearTarjeta(discurso);

        contenedor.appendChild(tarjeta);
    });
}


function crearTarjeta(discurso) {
    const tarjeta = document.createElement("article");

    tarjeta.classList.add("card");
    tarjeta.tabIndex = 0;

    const imagen = discurso.miniatura
        ? discurso.miniatura
        : `images/miniaturas/${discurso.id}.jpg`;

    tarjeta.innerHTML = `
        <img
            src="${imagen}"
            alt="${escaparHTML(discurso.titulo)}"
            loading="lazy"
        >

        <div class="card-info">

            <h3>${escaparHTML(discurso.titulo)}</h3>

            <p>
                ${formatearFecha(discurso.fecha)}
                ${
                    discurso.lugar
                        ? ` · ${escaparHTML(discurso.lugar)}`
                        : ""
                }
            </p>

        </div>
    `;

    const imagenTarjeta = tarjeta.querySelector("img");

    imagenTarjeta.addEventListener("error", () => {
        imagenTarjeta.src =
            "images/miniaturas/sin-miniatura.jpg";
    }, { once: true });

    tarjeta.addEventListener("click", () => {
        abrirDiscurso(discurso.id);
    });

    tarjeta.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirDiscurso(discurso.id);
        }
    });

    return tarjeta;
}


function abrirDiscurso(id) {
    window.location.href =
        `discurso.html?id=${encodeURIComponent(id)}`;
}


if (buscador) {
    buscador.addEventListener("input", () => {
        const consulta = normalizarTexto(buscador.value);

        if (!consulta) {
            mostrarDiscursos(todosLosDiscursos);
            return;
        }

        const resultados = todosLosDiscursos.filter(discurso => {
            const colecciones = Array.isArray(discurso.colecciones)
                ? discurso.colecciones.join(" ")
                : "";

            const textoDelDiscurso = normalizarTexto(`
                ${discurso.id || ""}
                ${discurso.titulo || ""}
                ${discurso.fecha || ""}
                ${discurso.anio || ""}
                ${discurso.lugar || ""}
                ${colecciones}
            `);

            return textoDelDiscurso.includes(consulta);
        });

        mostrarDiscursos(resultados);
    });
}


function actualizarContador(cantidad) {
    if (!contador) {
        return;
    }

    if (cantidad === 1) {
        contador.textContent = "1 discurso encontrado";
        return;
    }

    contador.textContent = `${cantidad} discursos encontrados`;
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

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
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