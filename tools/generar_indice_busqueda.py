import json
import shutil
import unicodedata
from collections import defaultdict
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]

ARCHIVO_DISCURSOS = RAIZ / "data" / "discursos.json"
CARPETA_TRANSCRIPCIONES = RAIZ / "data" / "transcripciones"
CARPETA_SALIDA = RAIZ / "data" / "busqueda"
ARCHIVO_INDICE = CARPETA_SALIDA / "indice.json"


def normalizar_texto(texto):
    texto = str(texto or "").lower()

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


def cargar_json(ruta):
    return json.loads(
        ruta.read_text(
            encoding="utf-8",
        )
    )


def guardar_json(ruta, datos):
    ruta.write_text(
        json.dumps(
            datos,
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )


def leer_transcripcion(id_discurso):
    ruta = (
        CARPETA_TRANSCRIPCIONES
        / f"{id_discurso}.txt"
    )

    if not ruta.exists():
        return ""

    return ruta.read_text(
        encoding="utf-8",
        errors="replace",
    ).strip()


def preparar_carpeta_salida():
    if CARPETA_SALIDA.exists():
        shutil.rmtree(
            CARPETA_SALIDA
        )

    CARPETA_SALIDA.mkdir(
        parents=True,
        exist_ok=True,
    )


def crear_registro(
    discurso,
    texto_transcripcion,
):
    titulo = str(
        discurso.get("titulo", "")
    ).strip()

    descripcion = str(
        discurso.get("descripcion", "")
    ).strip()

    slogan = str(
        discurso.get("slogan", "")
    ).strip()

    pais = str(
        discurso.get("pais", "")
    ).strip()

    provincia = str(
        discurso.get("provincia", "")
    ).strip()

    localidad = str(
        discurso.get("localidad", "")
    ).strip()

    lugares_especificos = (
        discurso.get(
            "lugaresEspecificos",
            [],
        )
        or []
    )

    colecciones = (
        discurso.get(
            "colecciones",
            [],
        )
        or []
    )

    contenido_busqueda = " ".join([
        titulo,
        descripcion,
        slogan,
        pais,
        provincia,
        localidad,
        " ".join(
            str(elemento)
            for elemento
            in lugares_especificos
        ),
        " ".join(
            str(elemento)
            for elemento
            in colecciones
        ),
        texto_transcripcion,
    ])

    return {
        "id": str(
            discurso.get("id", "")
        ).strip(),
        "titulo": titulo,
        "fecha": str(
            discurso.get("fecha", "")
        ).strip(),
        "anio": discurso.get(
            "anio",
            "",
        ),
        "pais": pais,
        "provincia": provincia,
        "localidad": localidad,
        "lugaresEspecificos":
            lugares_especificos,
        "colecciones":
            colecciones,
        "tieneTranscripcion":
            bool(texto_transcripcion),
        "textoNormalizado":
            normalizar_texto(
                contenido_busqueda
            ),
    }


def main():
    if not ARCHIVO_DISCURSOS.exists():
        raise FileNotFoundError(
            f"No se encontró:\n"
            f"{ARCHIVO_DISCURSOS}"
        )

    if not CARPETA_TRANSCRIPCIONES.exists():
        raise FileNotFoundError(
            f"No se encontró:\n"
            f"{CARPETA_TRANSCRIPCIONES}"
        )

    preparar_carpeta_salida()

    discursos = cargar_json(
        ARCHIVO_DISCURSOS
    )

    registros_por_anio = defaultdict(list)

    sin_archivo = []
    total_con_transcripcion = 0

    for discurso in discursos:
        id_discurso = str(
            discurso.get("id", "")
        ).strip()

        if not id_discurso:
            continue

        texto_transcripcion = ""

        if discurso.get(
            "tieneTranscripcion"
        ):
            texto_transcripcion = (
                leer_transcripcion(
                    id_discurso
                )
            )

            if not texto_transcripcion:
                sin_archivo.append(
                    id_discurso
                )
            else:
                total_con_transcripcion += 1

        anio = discurso.get(
            "anio"
        )

        if not anio:
            fecha = str(
                discurso.get(
                    "fecha",
                    "",
                )
            )

            if len(fecha) >= 4:
                anio = fecha[:4]
            else:
                anio = "sin-fecha"

        anio = str(anio)

        registro = crear_registro(
            discurso,
            texto_transcripcion,
        )

        registros_por_anio[
            anio
        ].append(
            registro
        )

    resumen_anios = []

    for anio in sorted(
        registros_por_anio.keys()
    ):
        registros = (
            registros_por_anio[anio]
        )

        archivo_anio = (
            CARPETA_SALIDA
            / f"{anio}.json"
        )

        guardar_json(
            archivo_anio,
            registros,
        )

        resumen_anios.append({
            "anio": anio,
            "archivo":
                f"data/busqueda/{anio}.json",
            "cantidad":
                len(registros),
        })

    indice_general = {
        "totalDiscursos": sum(
            len(registros)
            for registros
            in registros_por_anio.values()
        ),
        "totalConTranscripcion":
            total_con_transcripcion,
        "anios":
            resumen_anios,
    }

    guardar_json(
        ARCHIVO_INDICE,
        indice_general,
    )

    print("=" * 70)
    print("ÍNDICE DE BÚSQUEDA POR AÑO")
    print("=" * 70)

    print(
        f"Discursos indexados: "
        f"{indice_general['totalDiscursos']}"
    )

    print(
        f"Con transcripción:   "
        f"{total_con_transcripcion}"
    )

    print(
        "Marcados con transcripción "
        f"pero sin archivo: "
        f"{len(sin_archivo)}"
    )

    print(
        f"Archivos por año:    "
        f"{len(resumen_anios)}"
    )

    print()

    for item in resumen_anios:
        ruta = (
            RAIZ
            / item["archivo"]
        )

        tamanio_mb = (
            ruta.stat().st_size
            / 1024
            / 1024
        )

        print(
            f" - {item['anio']}: "
            f"{item['cantidad']} discursos "
            f"({tamanio_mb:.2f} MB)"
        )

    if sin_archivo:
        print()
        print("IDs sin archivo:")

        for id_discurso in sin_archivo:
            print(
                f" - {id_discurso}"
            )

    print()
    print(
        f"Índice general:\n"
        f"{ARCHIVO_INDICE}"
    )


if __name__ == "__main__":
    main()