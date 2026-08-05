import json
import time
import unicodedata
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError


RAIZ = Path(__file__).resolve().parents[1]

ARCHIVO_DISCURSOS = RAIZ / "data" / "discursos.json"
ARCHIVO_LUGARES = RAIZ / "data" / "lugares.json"
ARCHIVO_NO_ENCONTRADOS = RAIZ / "data" / "lugares_no_encontrados.json"

URL_NOMINATIM = "https://nominatim.openstreetmap.org/search"

# Poné acá un correo del proyecto.
USER_AGENT = (
    "ProyectoDiscursos/1.0 "
    "(contacto: archivoproyectodiscursos@gmail.com)"
)

ESPERA_ENTRE_CONSULTAS = 1.2


def normalizar(texto):
    texto = str(texto or "").strip().lower()

    texto = unicodedata.normalize(
        "NFD",
        texto,
    )

    texto = "".join(
        caracter
        for caracter in texto
        if unicodedata.category(caracter) != "Mn"
    )

    return " ".join(texto.split())


def clave_lugar(
    pais,
    provincia,
    localidad,
):
    return "|".join([
        normalizar(pais),
        normalizar(provincia),
        normalizar(localidad),
    ])


def cargar_json(ruta, valor_por_defecto):
    if not ruta.exists():
        return valor_por_defecto

    try:
        return json.loads(
            ruta.read_text(
                encoding="utf-8",
            )
        )
    except json.JSONDecodeError:
        print(
            f"⚠️ JSON inválido: {ruta}"
        )

        return valor_por_defecto


def guardar_json(ruta, datos):
    ruta.write_text(
        json.dumps(
            datos,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def construir_consulta(
    pais,
    provincia,
    localidad,
):
    partes = [
        localidad,
        provincia,
        pais,
    ]

    return ", ".join(
        str(parte).strip()
        for parte in partes
        if str(parte or "").strip()
    )


def buscar_coordenadas(
    pais,
    provincia,
    localidad,
):
    consulta = construir_consulta(
        pais,
        provincia,
        localidad,
    )

    parametros = urlencode({
        "q": consulta,
        "format": "jsonv2",
        "limit": 1,
        "addressdetails": 1,
    })

    url = f"{URL_NOMINATIM}?{parametros}"

    solicitud = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "es",
        },
    )

    try:
        with urlopen(
            solicitud,
            timeout=30,
        ) as respuesta:
            resultados = json.loads(
                respuesta.read().decode(
                    "utf-8",
                )
            )

    except HTTPError as error:
        print(
            f"❌ HTTP {error.code}: {consulta}"
        )

        return None

    except URLError as error:
        print(
            f"❌ Error de conexión: "
            f"{consulta} — {error}"
        )

        return None

    except TimeoutError:
        print(
            f"❌ Tiempo agotado: {consulta}"
        )

        return None

    if not resultados:
        return None

    resultado = resultados[0]

    return {
        "lat": float(resultado["lat"]),
        "lng": float(resultado["lon"]),
        "nombreEncontrado":
            resultado.get(
                "display_name",
                "",
            ),
    }


def obtener_lugares_unicos(discursos):
    lugares = {}

    for discurso in discursos:
        pais = str(
            discurso.get(
                "pais",
                "",
            )
        ).strip()

        provincia = str(
            discurso.get(
                "provincia",
                "",
            )
        ).strip()

        localidad = str(
            discurso.get(
                "localidad",
                "",
            )
        ).strip()

        if not localidad:
            continue

        clave = clave_lugar(
            pais,
            provincia,
            localidad,
        )

        if clave not in lugares:
            lugares[clave] = {
                "pais": pais,
                "provincia": provincia,
                "localidad": localidad,
            }

    return lugares


def main():
    if not ARCHIVO_DISCURSOS.exists():
        raise FileNotFoundError(
            f"No se encontró:\n"
            f"{ARCHIVO_DISCURSOS}"
        )

    discursos = cargar_json(
        ARCHIVO_DISCURSOS,
        [],
    )

    lugares_existentes = cargar_json(
        ARCHIVO_LUGARES,
        [],
    )

    no_encontrados_existentes = cargar_json(
        ARCHIVO_NO_ENCONTRADOS,
        [],
    )

    lugares_por_clave = {
        clave_lugar(
            lugar.get("pais"),
            lugar.get("provincia"),
            lugar.get("localidad"),
        ): lugar
        for lugar in lugares_existentes
    }

    no_encontrados_por_clave = {
        clave_lugar(
            lugar.get("pais"),
            lugar.get("provincia"),
            lugar.get("localidad"),
        ): lugar
        for lugar in no_encontrados_existentes
    }

    lugares_unicos = obtener_lugares_unicos(
        discursos
    )

    claves_actuales = set(
        lugares_unicos.keys()
    )

    lugares_por_clave = {
        clave: lugar
        for clave, lugar
        in lugares_por_clave.items()
        if clave in claves_actuales
    }

    no_encontrados_por_clave = {
        clave: lugar
        for clave, lugar
        in no_encontrados_por_clave.items()
        if clave in claves_actuales
    }

    guardar_json(
    ARCHIVO_LUGARES,
    sorted(
        lugares_por_clave.values(),
        key=lambda lugar: (
            normalizar(
                lugar.get("pais", "")
            ),
            normalizar(
                lugar.get("provincia", "")
            ),
            normalizar(
                lugar.get("localidad", "")
            ),
        ),
    ),
)

    guardar_json(
        ARCHIVO_NO_ENCONTRADOS,
        sorted(
            no_encontrados_por_clave.values(),
            key=lambda lugar: (
                normalizar(
                    lugar.get("pais", "")
                ),
                normalizar(
                    lugar.get("provincia", "")
                ),
                normalizar(
                    lugar.get("localidad", "")
                ),
            ),
        ),
    )

    pendientes = [
        lugar
        for clave, lugar
        in lugares_unicos.items()
        if clave not in lugares_por_clave
        and clave not in no_encontrados_por_clave
    ]

    print("=" * 70)
    print("Proyecto Discursos — Geocodificación de lugares")
    print("=" * 70)
    print(
        f"Lugares únicos:       "
        f"{len(lugares_unicos)}"
    )
    print(
        f"Ya geocodificados:    "
        f"{len(lugares_por_clave)}"
    )
    print(
        f"No encontrados:       "
        f"{len(no_encontrados_por_clave)}"
    )
    print(
        f"Pendientes:           "
        f"{len(pendientes)}"
    )
    print("=" * 70)

    if not pendientes:
        print(
            "No hay lugares nuevos para consultar."
        )

        return

    total = len(pendientes)

    for indice, lugar in enumerate(
        pendientes,
        start=1,
    ):
        pais = lugar["pais"]
        provincia = lugar["provincia"]
        localidad = lugar["localidad"]

        consulta = construir_consulta(
            pais,
            provincia,
            localidad,
        )

        print(
            f"[{indice}/{total}] "
            f"{consulta}"
        )

        resultado = buscar_coordenadas(
            pais,
            provincia,
            localidad,
        )

        clave = clave_lugar(
            pais,
            provincia,
            localidad,
        )

        if resultado:
            registro = {
                "pais": pais,
                "provincia": provincia,
                "localidad": localidad,
                "lat": resultado["lat"],
                "lng": resultado["lng"],
                "nombreEncontrado":
                    resultado[
                        "nombreEncontrado"
                    ],
            }

            lugares_por_clave[
                clave
            ] = registro

            print(
                "   ✅ "
                f"{registro['lat']}, "
                f"{registro['lng']}"
            )

        else:
            registro = {
                "pais": pais,
                "provincia": provincia,
                "localidad": localidad,
            }

            no_encontrados_por_clave[
                clave
            ] = registro

            print(
                "   ⚠️ No encontrado"
            )

        guardar_json(
            ARCHIVO_LUGARES,
            sorted(
                lugares_por_clave.values(),
                key=lambda lugar: (
                    normalizar(
                        lugar.get(
                            "pais",
                            "",
                        )
                    ),
                    normalizar(
                        lugar.get(
                            "provincia",
                            "",
                        )
                    ),
                    normalizar(
                        lugar.get(
                            "localidad",
                            "",
                        )
                    ),
                ),
            ),
        )

        guardar_json(
            ARCHIVO_NO_ENCONTRADOS,
            sorted(
                no_encontrados_por_clave.values(),
                key=lambda lugar: (
                    normalizar(
                        lugar.get(
                            "pais",
                            "",
                        )
                    ),
                    normalizar(
                        lugar.get(
                            "provincia",
                            "",
                        )
                    ),
                    normalizar(
                        lugar.get(
                            "localidad",
                            "",
                        )
                    ),
                ),
            ),
        )

        time.sleep(
            ESPERA_ENTRE_CONSULTAS
        )

    print()
    print("=" * 70)
    print("RESUMEN")
    print("=" * 70)
    print(
        f"✅ Geocodificados: "
        f"{len(lugares_por_clave)}"
    )
    print(
        f"⚠️ No encontrados: "
        f"{len(no_encontrados_por_clave)}"
    )
    print()
    print(
        f"Archivo generado:\n"
        f"{ARCHIVO_LUGARES}"
    )


if __name__ == "__main__":
    main()