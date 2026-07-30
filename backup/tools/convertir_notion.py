import csv
import json
from datetime import datetime
from pathlib import Path


# --------------------------------------------------
# RUTAS DEL PROYECTO
# --------------------------------------------------

BASE = Path(__file__).resolve().parent.parent

CSV_FILE = BASE / "input" / "discursos.csv"
JSON_FILE = BASE / "data" / "discursos.json"


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


def convertir_fila(fila):
    """Transforma una fila del CSV de Notion en un discurso limpio."""

    fecha = convertir_fecha(fila.get("Fecha"))

    anio = ""

    if fecha and len(fecha) >= 4 and fecha[:4].isdigit():
        anio = int(fecha[:4])

    return {
        "id": limpiar(fila.get("ID")),
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

    discursos = []

    with open(CSV_FILE, encoding="utf-8-sig", newline="") as archivo:
        lector = csv.DictReader(archivo)

        for fila in lector:
            discursos.append(convertir_fila(fila))

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

    # Estadísticas
    con_video = sum(1 for discurso in discursos if discurso["video"])
    sin_video = len(discursos) - con_video

    sin_id = sum(1 for discurso in discursos if not discurso["id"])
    sin_fecha = sum(1 for discurso in discursos if not discurso["fecha"])
    sin_lugar = sum(1 for discurso in discursos if not discurso["lugar"])
    sin_miniatura = sum(
        1 for discurso in discursos if not discurso["miniatura"]
    )
    sin_slogan = sum(
        1 for discurso in discursos if not discurso["slogan"]
    )
    sin_descripcion = sum(
        1 for discurso in discursos if not discurso["descripcion"]
    )

    ids = [
        discurso["id"]
        for discurso in discursos
        if discurso["id"]
    ]

    ids_duplicados = len(ids) - len(set(ids))

    print(f"\n✅ JSON generado correctamente:")
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

    print("\nProceso finalizado.")


if __name__ == "__main__":
    main()