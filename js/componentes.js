/* =========================================================
   COMPONENTES COMPARTIDOS
   Tarjetas y carruseles
   ========================================================= */

(function () {

    const IMAGEN_ALTERNATIVA =
        "images/miniaturas/sin-miniatura.jpg";


    /* =====================================================
       TARJETAS
       ===================================================== */

    function crearTarjeta(discurso) {
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("card");
        tarjeta.tabIndex = 0;
        tarjeta.setAttribute("role", "link");

        const imagen =
            discurso.miniatura ||
            `images/miniaturas/${discurso.id}.jpg`;

        tarjeta.innerHTML = `
            <img
                src="${escaparHTMLComponente(imagen)}"
                alt="${escaparHTMLComponente(
                    discurso.titulo || "Discurso"
                )}"
                loading="lazy"
            >

            <div class="card-info">

                <h3>
                    ${escaparHTMLComponente(
                        discurso.titulo ||
                        "Discurso sin título"
                    )}
                </h3>

                <p>
                    ${formatearFechaTarjeta(discurso.fecha)}
                    ${
                        discurso.lugar
                            ? ` · ${escaparHTMLComponente(
                                discurso.lugar
                            )}`
                            : ""
                    }
                </p>

            </div>
        `;

        const imagenTarjeta =
            tarjeta.querySelector("img");

        if (imagenTarjeta) {
            imagenTarjeta.addEventListener(
                "error",
                () => {
                    imagenTarjeta.src = IMAGEN_ALTERNATIVA;
                },
                { once: true }
            );
        }

        tarjeta.addEventListener("click", () => {
            abrirDiscursoComponente(discurso.id);
        });

        tarjeta.addEventListener("keydown", evento => {
            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {
                evento.preventDefault();

                abrirDiscursoComponente(discurso.id);
            }
        });

        return tarjeta;
    }


    /* =====================================================
       CONTROLES DE CARRUSEL
       ===================================================== */

    function prepararControlesCarrusel() {
        const carruseles = document.querySelectorAll(
            ".carrusel-discursos"
        );

        carruseles.forEach(carrusel => {
            prepararCarrusel(carrusel);
        });

        if (
            document.body.dataset
                .carruselesResizeConfigurado !== "true"
        ) {
            document.body.dataset
                .carruselesResizeConfigurado = "true";

            window.addEventListener(
                "resize",
                actualizarTodosLosCarruseles
            );
        }
    }


    function prepararCarrusel(carrusel) {
        let contenedor =
            carrusel.closest(".carrusel-contenedor");

        /*
         * Si el carrusel todavía no tiene contenedor,
         * lo creamos.
         */
        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.className = "carrusel-contenedor";

            carrusel.parentNode.insertBefore(
                contenedor,
                carrusel
            );

            contenedor.appendChild(carrusel);
        }

        /*
         * Evita crear dos veces los botones del
         * mismo carrusel.
         */
        let botonIzquierda = contenedor.querySelector(
            ".boton-carrusel-izquierda"
        );

        let botonDerecha = contenedor.querySelector(
            ".boton-carrusel-derecha"
        );

        if (!botonIzquierda) {
            botonIzquierda = crearBotonCarrusel(
                "izquierda",
                "‹",
                "Desplazar hacia la izquierda"
            );

            contenedor.insertBefore(
                botonIzquierda,
                carrusel
            );
        }

        if (!botonDerecha) {
            botonDerecha = crearBotonCarrusel(
                "derecha",
                "›",
                "Desplazar hacia la derecha"
            );

            contenedor.appendChild(botonDerecha);
        }

        if (
            carrusel.dataset.controlesConfigurados !== "true"
        ) {
            carrusel.dataset.controlesConfigurados = "true";

            botonIzquierda.addEventListener(
                "click",
                () => {
                    desplazarCarrusel(carrusel, -1);
                }
            );

            botonDerecha.addEventListener(
                "click",
                () => {
                    desplazarCarrusel(carrusel, 1);
                }
            );

            carrusel.addEventListener(
                "scroll",
                () => {
                    actualizarBotonesCarrusel(
                        carrusel,
                        botonIzquierda,
                        botonDerecha
                    );
                }
            );
        }

        actualizarBotonesCarrusel(
            carrusel,
            botonIzquierda,
            botonDerecha
        );
    }


    function crearBotonCarrusel(
        direccion,
        simbolo,
        etiqueta
    ) {
        const boton = document.createElement("button");

        boton.type = "button";

        boton.classList.add(
            "boton-carrusel",
            `boton-carrusel-${direccion}`
        );

        boton.innerHTML = `
            <span aria-hidden="true">
                ${simbolo}
            </span>
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
            carrusel.scrollLeft +
                carrusel.clientWidth >=
            carrusel.scrollWidth - margen;

        const tieneDesplazamiento =
            carrusel.scrollWidth >
            carrusel.clientWidth + margen;

        botonIzquierda.disabled =
            !tieneDesplazamiento || estaAlInicio;

        botonDerecha.disabled =
            !tieneDesplazamiento || estaAlFinal;

        botonIzquierda.hidden =
            !tieneDesplazamiento;

        botonDerecha.hidden =
            !tieneDesplazamiento;
    }


    function actualizarTodosLosCarruseles() {
        const carruseles = document.querySelectorAll(
            ".carrusel-discursos"
        );

        carruseles.forEach(carrusel => {
            const contenedor =
                carrusel.closest(".carrusel-contenedor");

            if (!contenedor) {
                return;
            }

            const botonIzquierda =
                contenedor.querySelector(
                    ".boton-carrusel-izquierda"
                );

            const botonDerecha =
                contenedor.querySelector(
                    ".boton-carrusel-derecha"
                );

            if (
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


    /* =====================================================
       FUNCIONES INTERNAS
       ===================================================== */

    function abrirDiscursoComponente(id) {
        if (!id) {
            return;
        }

        window.location.href =
            `discurso.html?id=${encodeURIComponent(id)}`;
    }


    function formatearFechaTarjeta(fecha) {
        if (!fecha) {
            return "Fecha no disponible";
        }

        const partes = String(fecha).split("-");

        if (partes.length !== 3) {
            return escaparHTMLComponente(fecha);
        }

        const [anio, mes, dia] = partes;

        return `${dia}/${mes}/${anio}`;
    }


    function escaparHTMLComponente(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /*
     * Estas son las únicas funciones que quedan
     * disponibles para home.js y discurso.js.
     */

    window.crearTarjeta = crearTarjeta;

    window.prepararControlesCarrusel =
        prepararControlesCarrusel;

    window.actualizarTodosLosCarruseles =
        actualizarTodosLosCarruseles;

})();