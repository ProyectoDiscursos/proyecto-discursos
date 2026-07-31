import csv
import json
import re
from datetime import datetime
from pathlib import Path


# --------------------------------------------------
# RUTAS DEL PROYECTO
# --------------------------------------------------

BASE = Path(__file__).resolve().parent.parent

CSV_FILE = BASE / "input" / "discursos.csv"
JSON_FILE = BASE / "data" / "discursos.json"
MD_DIR = BASE / "input" / "transcripciones"
TRANSCRIPCIONES_DIR = BASE / "data" / "transcripciones"


# --------------------------------------------------
# FUNCIONES
# --------------------------------------------------

def limpiar(valor):
    """Convierte valores vacíos en texto vacío y elimina espacios sobrantes."""
    if valor is None:
        return ""

    return str(valor).strip()


def convertir_fecha(fecha_original):
    """
    Convierte una fecha como 10/12/2007 al formato 2007-12-10.
    Si la fecha no puede convertirse, devuelve el texto original.
    """
    fecha_original = limpiar(fecha_original)

    if not fecha_original:
        return ""

    formatos_posibles = [
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%d-%m-%Y",
    ]

    for formato in formatos_posibles:
        try:
            fecha = datetime.strptime(fecha_original, formato)
            return fecha.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return fecha_original


def obtener_video(fila):
    """
    Busca el enlace en este orden:
    1. Video
    2. URL
    3. Videoxxx
    """
    return (
        limpiar(fila.get("Video"))
        or limpiar(fila.get("URL"))
        or limpiar(fila.get("Videoxxx"))
    )


def obtener_colecciones(valor):
    """
    Convierte las colecciones separadas por comas
    en una lista para el archivo JSON.
    """
    valor = limpiar(valor)

    if not valor:
        return []

    return [
        coleccion.strip()
        for coleccion in valor.split(",")
        if coleccion.strip()
    ]

def obtener_id_markdown(contenido):
    """
    Extrae el ID de un archivo Markdown.

    Ejemplo:
    ID: CFK-20100323-01
    """
    coincidencia = re.search(
        r"(?im)^ID:\s*(CFK-\d{8}-\d+)\s*$",
        contenido,
    )

    if not coincidencia:
        return ""

    return coincidencia.group(1).strip()


def extraer_transcripcion(contenido):
    """
    Elimina el título y las propiedades iniciales exportadas
    por Notion, conservando el cuerpo completo del discurso.
    """
    contenido = contenido.replace("\r\n", "\n").replace("\r", "\n")
    lineas = contenido.split("\n")

    propiedades_notion = {
        "id",
        "titulo",
        "título",
        "fecha",
        "lugar",
        "coleccion",
        "colección",
        "colecciones",
        "estado audiovisual",
        "ax video",
        "ax video (estado)",
        "verificado",
        "video",
        "videoxxx",
        "url",
        "url od",
        "miniatura",
        "slogan",
        "descripcion",
        "descripción",
        "evento",
        "evento/colecciones",
    }

    indice = 0

    # Quitar líneas vacías iniciales.
    while indice < len(lineas) and not lineas[indice].strip():
        indice += 1

    # Quitar el título Markdown.
    if (
        indice < len(lineas)
        and lineas[indice].lstrip().startswith("#")
    ):
        indice += 1

    # Recorrer únicamente las propiedades reconocidas.
    while indice < len(lineas):
        linea = lineas[indice].strip()

        # Permitir líneas vacías entre propiedades.
        if not linea:
            indice += 1
            continue

        coincidencia = re.match(
            r"^(?:[-*]\s*)?(?:\*\*)?([^:]+?)(?:\*\*)?\s*:\s*(.*)$",
            linea,
        )

        if not coincidencia:
            break

        nombre_propiedad = coincidencia.group(1)

        nombre_propiedad = (
            nombre_propiedad
            .replace("*", "")
            .strip()
            .lower()
        )

        if nombre_propiedad not in propiedades_notion:
            break

        indice += 1

    transcripcion = "\n".join(lineas[indice:]).strip()

    transcripcion = re.sub(
        r"\n{3,}",
        "\n\n",
        transcripcion,
    )

    return transcripcion

def cargar_transcripciones():
    """
    Lee todos los Markdown, extrae su ID y devuelve un diccionario:

    {
        "CFK-20100323-01": "Texto completo...",
        ...
    }
    """
    transcripciones = {}
    archivos_sin_id = []
    ids_duplicados = []

    if not MD_DIR.exists():
        print("\n⚠️ No se encontró la carpeta de transcripciones:")
        print(MD_DIR)

        return transcripciones, archivos_sin_id, ids_duplicados

    archivos_md = list(MD_DIR.rglob("*.md"))

    for archivo_md in archivos_md:
        try:
            contenido = archivo_md.read_text(
                encoding="utf-8-sig"
            )
        except UnicodeDecodeError:
            contenido = archivo_md.read_text(
                encoding="utf-8",
                errors="replace",
            )

        id_discurso = obtener_id_markdown(contenido)

        if not id_discurso:
            archivos_sin_id.append(str(archivo_md))
            continue

        if id_discurso in transcripciones:
            ids_duplicados.append(id_discurso)
            continue

        transcripcion = extraer_transcripcion(contenido)

        if transcripcion:
            transcripciones[id_discurso] = transcripcion

    return transcripciones, archivos_sin_id, ids_duplicados


def guardar_transcripciones(transcripciones):
    """
    Guarda una transcripción individual por discurso.
    """
    TRANSCRIPCIONES_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Eliminar TXT anteriores para evitar archivos obsoletos.
    for archivo_anterior in TRANSCRIPCIONES_DIR.glob("*.txt"):
        archivo_anterior.unlink()

    for id_discurso, transcripcion in transcripciones.items():
        archivo_salida = (
            TRANSCRIPCIONES_DIR /
            f"{id_discurso}.txt"
        )

        archivo_salida.write_text(
            transcripcion,
            encoding="utf-8",
        )

def convertir_fila(fila, ids_con_transcripcion):
    """Transforma una fila del CSV de Notion en un discurso limpio."""

    fecha = convertir_fecha(fila.get("Fecha"))
    id_discurso = limpiar(fila.get("ID"))

    anio = ""

    if fecha and len(fecha) >= 4 and fecha[:4].isdigit():
        anio = int(fecha[:4])

    return {
        "id": id_discurso,
        "titulo": limpiar(fila.get("Título")),
        "fecha": fecha,
        "anio": anio,
        "lugar": limpiar(fila.get("Lugar")),
        "colecciones": obtener_colecciones(fila.get("Colecciones")),
        "estadoVideo": limpiar(fila.get("Estado audiovisual")),
        "video": obtener_video(fila),
        "miniatura": limpiar(fila.get("Miniatura")),
        "slogan": limpiar(fila.get("Slogan")),
        "descripcion": limpiar(fila.get("Descripción")),
        "tieneTranscripcion": (
            id_discurso in ids_con_transcripcion
        ),
    }


# --------------------------------------------------
# PROGRAMA PRINCIPAL
# --------------------------------------------------

def main():
    print("=" * 50)
    print("Proyecto Discursos - Conversor de Notion")
    print("=" * 50)

    if not CSV_FILE.exists():
        print("\n❌ No se encontró el archivo:")
        print(CSV_FILE)
        return

    print("\nLeyendo transcripciones Markdown...")

    (
        transcripciones,
        markdown_sin_id,
        ids_markdown_duplicados,
    ) = cargar_transcripciones()

    guardar_transcripciones(transcripciones)

    ids_con_transcripcion = set(transcripciones.keys())

    discursos = []

    with open(CSV_FILE, encoding="utf-8-sig", newline="") as archivo:
        lector = csv.DictReader(archivo)

        for fila in lector:
            discursos.append(
                convertir_fila(
                    fila,
                    ids_con_transcripcion,
                )
            )

    # Ordenar cronológicamente.
    # Los registros sin fecha quedan al final.
    discursos.sort(
        key=lambda discurso: (
            discurso["fecha"] == "",
            discurso["fecha"],
            discurso["id"],
        )
    )

    # Crear la carpeta data si no existiera.
    JSON_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(JSON_FILE, "w", encoding="utf-8") as archivo_json:
        json.dump(
            discursos,
            archivo_json,
            ensure_ascii=False,
            indent=2,
        )

    # Estadísticas generales
    con_video = sum(
        1
        for discurso in discursos
        if discurso["video"]
    )

    sin_video = len(discursos) - con_video

    sin_id = sum(
        1
        for discurso in discursos
        if not discurso["id"]
    )

    sin_fecha = sum(
        1
        for discurso in discursos
        if not discurso["fecha"]
    )

    sin_lugar = sum(
        1
        for discurso in discursos
        if not discurso["lugar"]
    )

    sin_miniatura = sum(
        1
        for discurso in discursos
        if not discurso["miniatura"]
    )

    sin_slogan = sum(
        1
        for discurso in discursos
        if not discurso["slogan"]
    )

    sin_descripcion = sum(
        1
        for discurso in discursos
        if not discurso["descripcion"]
    )

    # Estadísticas de transcripciones
    con_transcripcion = sum(
        1
        for discurso in discursos
        if discurso["tieneTranscripcion"]
    )

    sin_transcripcion = (
        len(discursos) - con_transcripcion
    )

    ids_csv = {
        discurso["id"]
        for discurso in discursos
        if discurso["id"]
    }

    markdown_sin_coincidencia = (
        ids_con_transcripcion - ids_csv
    )

    # IDs duplicados en el CSV
    ids = [
        discurso["id"]
        for discurso in discursos
        if discurso["id"]
    ]

    ids_duplicados = len(ids) - len(set(ids))

    print("\n✅ JSON generado correctamente:")
    print(JSON_FILE)

    print("\n📊 RESUMEN")
    print("-" * 50)
    print(f"📚 Discursos: {len(discursos)}")
    print(f"🎬 Con video: {con_video}")
    print(f"🔍 Sin video: {sin_video}")
    print(f"🆔 Sin ID: {sin_id}")
    print(f"⚠️ IDs duplicados: {ids_duplicados}")
    print(f"📅 Sin fecha: {sin_fecha}")
    print(f"📍 Sin lugar: {sin_lugar}")
    print(f"🖼️ Sin miniatura: {sin_miniatura}")
    print(f"💬 Sin slogan: {sin_slogan}")
    print(f"📝 Sin descripción: {sin_descripcion}")
    print(f"📄 Con transcripción: {con_transcripcion}")
    print(f"📭 Sin transcripción: {sin_transcripcion}")
    print(f"⚠️ Markdown sin ID: {len(markdown_sin_id)}")
    print(
        "⚠️ IDs Markdown duplicados: "
        f"{len(ids_markdown_duplicados)}"
    )
    print(
        "⚠️ Markdown sin coincidencia en CSV: "
        f"{len(markdown_sin_coincidencia)}"
    )
    if markdown_sin_id:
        print("\n📂 ARCHIVOS MARKDOWN SIN ID")
        print("-" * 50)

        for ruta in markdown_sin_id:
            print(ruta)

    discursos_sin_transcripcion = [
        discurso
        for discurso in discursos
        if not discurso["tieneTranscripcion"]
    ]

    if discursos_sin_transcripcion:
        print("\n📭 DISCURSOS SIN TRANSCRIPCIÓN")
        print("-" * 50)

        for discurso in discursos_sin_transcripcion:
            print(
                f'{discurso["id"]} | '
                f'{discurso["titulo"]}'
            )
    print("\nProceso finalizado.")


if __name__ == "__main__":
    main()