from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path


# ============================================================
# RUTAS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

DISCURSOS_JSON = (
    ROOT
    / "data"
    / "discursos.json"
)

TRANSCRIPCIONES_DIR = (
    ROOT
    / "data"
    / "transcripciones"
)

AUDITORIA_DIR = (
    ROOT
    / "data"
    / "auditoria"
)

REPORTE_CSV = (
    AUDITORIA_DIR
    / "revision_prioritaria.csv"
)

RESUMEN_TXT = (
    AUDITORIA_DIR
    / "resumen.txt"
)


# ============================================================
# CONFIGURACIÓN
# ============================================================

PATRON_ID = re.compile(
    r"^CFK-\d{8}-\d{2}$"
)

NOMBRES_ARGENTINA = {
    "argentina",
    "republica argentina",
}

NOMBRES_CAPITAL_FEDERAL = {
    "capital federal",
    "caba",
    "ciudad autonoma de buenos aires",
    "ciudad de buenos aires",
}


# ============================================================
# UTILIDADES
# ============================================================

def texto(valor) -> str:
    if valor is None:
        return ""

    return str(valor).strip()


def normalizar(valor) -> str:
    """
    Convierte:
    'Ciudad Autónoma de Buenos Aires'
    en:
    'ciudad autonoma de buenos aires'
    """

    valor = texto(valor)

    valor = unicodedata.normalize(
        "NFD",
        valor
    )

    valor = "".join(
        caracter
        for caracter in valor
        if unicodedata.category(
            caracter
        ) != "Mn"
    )

    return " ".join(
        valor
        .lower()
        .strip()
        .split()
    )


def obtener_valor(
    registro: dict,
    *claves: str,
):
    """
    Busca un mismo dato usando distintas
    variantes posibles del nombre de la propiedad.
    """

    for clave in claves:
        if clave not in registro:
            continue

        valor = registro.get(
            clave
        )

        if isinstance(
            valor,
            list
        ):
            if valor:
                return valor

            continue

        if texto(valor):
            return valor

    return ""


# ============================================================
# DATOS DEL DISCURSO
# ============================================================

def obtener_id(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "id",
            "ID",
        )
    ).upper()


def obtener_titulo(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "titulo",
            "Título",
            "title",
        )
    )


def obtener_fecha(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "fecha",
            "Fecha",
        )
    )


def obtener_pais(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "pais",
            "País",
        )
    )


def obtener_provincia(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "provincia",
            "Provincia",
        )
    )


def obtener_localidad(
    registro: dict,
) -> str:
    return texto(
        obtener_valor(
            registro,
            "localidad",
            "Localidad",
        )
    )


# ============================================================
# REGLAS GEOGRÁFICAS
# ============================================================

def es_argentina(
    pais: str,
) -> bool:
    return (
        normalizar(pais)
        in NOMBRES_ARGENTINA
    )


def es_capital_federal(
    provincia: str,
) -> bool:
    valor = normalizar(
        provincia
    )

    if valor in NOMBRES_CAPITAL_FEDERAL:
        return True

    return (
        "capital federal"
        in valor
    )


# ============================================================
# TRANSCRIPCIONES
# ============================================================

def tiene_transcripcion(
    id_discurso: str,
) -> bool:
    if not id_discurso:
        return False

    posibles_rutas = [
        TRANSCRIPCIONES_DIR
        / f"{id_discurso}.txt",

        TRANSCRIPCIONES_DIR
        / f"{id_discurso}.md",
    ]

    for ruta in posibles_rutas:
        if (
            ruta.exists()
            and ruta.is_file()
            and ruta.stat().st_size > 0
        ):
            return True

    return False


# ============================================================
# AUDITORÍA INDIVIDUAL
# ============================================================

def auditar_registro(
    registro: dict,
) -> list[str]:
    problemas = []

    id_discurso = obtener_id(
        registro
    )

    pais = obtener_pais(
        registro
    )

    provincia = obtener_provincia(
        registro
    )

    localidad = obtener_localidad(
        registro
    )


    # --------------------------------------------------------
    # ID
    # --------------------------------------------------------

    if not id_discurso:
        problemas.append(
            "ID faltante"
        )

    elif not PATRON_ID.match(
        id_discurso
    ):
        problemas.append(
            "Formato de ID inválido"
        )


    # --------------------------------------------------------
    # TRANSCRIPCIÓN
    # --------------------------------------------------------

    if (
        id_discurso
        and not tiene_transcripcion(
            id_discurso
        )
    ):
        problemas.append(
            "Transcripción faltante"
        )


    # --------------------------------------------------------
    # GEOGRAFÍA
    # --------------------------------------------------------

    pais_normalizado = normalizar(
        pais
    )


    # CASO 1
    #
    # Tiene país extranjero,
    # pero no localidad.
    #
    # Ejemplo:
    # Alemania + localidad vacía

    if (
        pais
        and not es_argentina(
            pais
        )
        and not localidad
    ):
        problemas.append(
            "País extranjero sin localidad"
        )


    # CASO 2
    #
    # Argentina,
    # pero provincia vacía.

    if (
        es_argentina(
            pais
        )
        and not provincia
    ):
        problemas.append(
            "Argentina sin provincia"
        )


    # CASO 3
    #
    # Argentina,
    # tiene provincia,
    # NO es Capital Federal,
    # y no tiene localidad.

    if (
        es_argentina(
            pais
        )
        and provincia
        and not es_capital_federal(
            provincia
        )
        and not localidad
    ):
        problemas.append(
            "Argentina con provincia pero sin localidad"
        )


    return problemas


# ============================================================
# CARGAR DATOS
# ============================================================

def cargar_discursos() -> list[dict]:
    if not DISCURSOS_JSON.exists():
        raise FileNotFoundError(
            f"No existe:\n"
            f"{DISCURSOS_JSON}"
        )

    with DISCURSOS_JSON.open(
        "r",
        encoding="utf-8"
    ) as archivo:
        datos = json.load(
            archivo
        )

    if not isinstance(
        datos,
        list
    ):
        raise ValueError(
            "discursos.json no contiene "
            "una lista de registros."
        )

    return datos


# ============================================================
# GENERAR AUDITORÍA
# ============================================================

def generar_auditoria(
    discursos: list[dict],
):
    ids = [
        obtener_id(
            registro
        )
        for registro in discursos
        if obtener_id(
            registro
        )
    ]

    conteo_ids = Counter(
        ids
    )

    ids_duplicados = {
        id_discurso
        for (
            id_discurso,
            cantidad
        )
        in conteo_ids.items()
        if cantidad > 1
    }


    filas = []

    contador_problemas = (
        Counter()
    )


    for indice, registro in enumerate(
        discursos,
        start=1
    ):
        id_discurso = obtener_id(
            registro
        )

        problemas = auditar_registro(
            registro
        )


        if (
            id_discurso
            and id_discurso
            in ids_duplicados
        ):
            problemas.append(
                "ID duplicado"
            )


        if not problemas:
            continue


        for problema in problemas:
            contador_problemas[
                problema
            ] += 1


        filas.append({
            "fila": indice,

            "id":
                id_discurso,

            "titulo":
                obtener_titulo(
                    registro
                ),

            "fecha":
                obtener_fecha(
                    registro
                ),

            "pais":
                obtener_pais(
                    registro
                ),

            "provincia":
                obtener_provincia(
                    registro
                ),

            "localidad":
                obtener_localidad(
                    registro
                ),

            "cantidad_problemas":
                len(
                    problemas
                ),

            "problemas":
                " | ".join(
                    problemas
                ),
        })


    return (
        filas,
        contador_problemas,
        ids_duplicados,
    )


# ============================================================
# GUARDAR CSV
# ============================================================

def guardar_csv(
    filas: list[dict],
):
    AUDITORIA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    columnas = [
        "fila",
        "id",
        "titulo",
        "fecha",
        "pais",
        "provincia",
        "localidad",
        "cantidad_problemas",
        "problemas",
    ]

    with REPORTE_CSV.open(
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as archivo:
        escritor = csv.DictWriter(
    archivo,
    fieldnames=columnas,
    delimiter=";",
)

        escritor.writeheader()

        escritor.writerows(
            filas
        )


# ============================================================
# GUARDAR RESUMEN
# ============================================================

def guardar_resumen(
    total_discursos: int,
    filas: list[dict],
    contador_problemas: Counter,
    ids_duplicados: set[str],
) -> str:
    lineas = [
        (
            "Proyecto Discursos — "
            "Auditoría prioritaria"
        ),
        "=" * 60,
        (
            f"Total de discursos: "
            f"{total_discursos}"
        ),
        (
            "Registros que requieren "
            f"revisión: {len(filas)}"
        ),
        "",
        "PROBLEMAS DETECTADOS",
        "-" * 60,
    ]


    orden = [
        "Transcripción faltante",
        "País extranjero sin localidad",
        "Argentina sin provincia",
        (
            "Argentina con provincia "
            "pero sin localidad"
        ),
        "ID faltante",
        "Formato de ID inválido",
        "ID duplicado",
    ]


    for problema in orden:
        cantidad = (
            contador_problemas.get(
                problema,
                0
            )
        )

        lineas.append(
            f"{problema}: "
            f"{cantidad}"
        )


    if ids_duplicados:
        lineas.extend([
            "",
            "IDs DUPLICADOS",
            "-" * 60,
        ])

        for id_discurso in sorted(
            ids_duplicados
        ):
            lineas.append(
                f"- {id_discurso}"
            )


    resumen = "\n".join(
        lineas
    )


    with RESUMEN_TXT.open(
        "w",
        encoding="utf-8"
    ) as archivo:
        archivo.write(
            resumen
        )


    return resumen


# ============================================================
# MOSTRAR RESULTADOS
# ============================================================

def imprimir_resultados(
    total_discursos: int,
    filas: list[dict],
    contador_problemas: Counter,
):
    print()
    print(
        "=" * 70
    )

    print(
        "RESULTADOS"
    )

    print(
        "=" * 70
    )

    print()

    print(
        f"Total de discursos: "
        f"{total_discursos}"
    )

    print(
        "Registros que requieren "
        f"revisión: {len(filas)}"
    )

    print()


    orden = [
        "Transcripción faltante",
        "País extranjero sin localidad",
        "Argentina sin provincia",
        (
            "Argentina con provincia "
            "pero sin localidad"
        ),
        "ID faltante",
        "Formato de ID inválido",
        "ID duplicado",
    ]


    for problema in orden:
        cantidad = (
            contador_problemas.get(
                problema,
                0
            )
        )

        print(
            f"{problema:<50}"
            f"{cantidad:>6}"
        )


# ============================================================
# PRINCIPAL
# ============================================================

def main():
    print(
        "=" * 70
    )

    print(
        "PROYECTO DISCURSOS — "
        "AUDITORÍA PRIORITARIA"
    )

    print(
        "=" * 70
    )


    try:
        discursos = (
            cargar_discursos()
        )

    except Exception as error:
        print()
        print(
            f"ERROR: {error}"
        )

        return


    print()
    print(
        f"Discursos cargados: "
        f"{len(discursos)}"
    )

    print(
        "Directorio de "
        "transcripciones:"
    )

    print(
        TRANSCRIPCIONES_DIR
    )


    (
        filas,
        contador_problemas,
        ids_duplicados,
    ) = generar_auditoria(
        discursos
    )


    guardar_csv(
        filas
    )


    guardar_resumen(
        len(discursos),
        filas,
        contador_problemas,
        ids_duplicados,
    )


    imprimir_resultados(
        len(discursos),
        filas,
        contador_problemas,
    )


    print()
    print(
        "=" * 70
    )

    print(
        "ARCHIVOS GENERADOS"
    )

    print(
        "=" * 70
    )

    print(
        REPORTE_CSV
    )

    print(
        RESUMEN_TXT
    )

    print(
        "=" * 70
    )


if __name__ == "__main__":
    main()