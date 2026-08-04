import argparse
import json
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

import requests


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent

JSON_DISCURSOS = (
    RAIZ_PROYECTO
    / "data"
    / "discursos.json"
)

CARPETA_VIDEOS = Path(
    r"D:\Nueva carpeta\OneDrive\Jellyfin"
)

IA_EXE = Path(
    r"C:\Users\macaf\AppData\Local\Python"
    r"\pythoncore-3.14-64\Scripts\ia.exe"
)

ARCHIVO_REGISTRO = (
    RAIZ_PROYECTO
    / "data"
    / "archive_subidas.jsonl"
)

EXTENSIONES_VIDEO = {
    ".mp4",
    ".mkv",
    ".m4v",
    ".mov",
    ".avi",
    ".webm",
}

ARCHIVO_ERRORES = (
    RAIZ_PROYECTO
    / "data"
    / "archive_errores.txt"
)
CREADOR = "Cristina Fernández de Kirchner"
COLECCION_ARCHIVE = "opensource_movies"
IDIOMA = "spa"


# ==========================================================
# FUNCIONES GENERALES
# ==========================================================

def limpiar(valor):
    if valor is None:
        return ""

    return str(valor).strip()


def obtener_lista(valor):
    if isinstance(valor, list):
        return [
            limpiar(elemento)
            for elemento in valor
            if limpiar(elemento)
        ]

    texto = limpiar(valor)

    return [texto] if texto else []


def cargar_discursos():
    if not JSON_DISCURSOS.exists():
        raise FileNotFoundError(
            f"No se encontró el JSON:\n{JSON_DISCURSOS}"
        )

    with JSON_DISCURSOS.open(
        "r",
        encoding="utf-8",
    ) as archivo:
        datos = json.load(archivo)

    if not isinstance(datos, list):
        raise ValueError(
            "discursos.json no contiene una lista."
        )

    discursos = {}

    for discurso in datos:
        id_discurso = limpiar(
            discurso.get("id")
        ).upper()

        if id_discurso:
            discursos[id_discurso] = discurso

    return discursos


def buscar_videos():
    if not CARPETA_VIDEOS.exists():
        raise FileNotFoundError(
            "No se encontró la carpeta de videos:\n"
            f"{CARPETA_VIDEOS}"
        )

    videos = {}
    duplicados = {}
    ignorados = []

    for ruta in CARPETA_VIDEOS.rglob("*"):
        if not ruta.is_file():
            continue

        if ruta.suffix.lower() not in EXTENSIONES_VIDEO:
            continue

        id_video = ruta.stem.strip().upper()

        if not re.fullmatch(
            r"CFK-\d{8}-\d{2}",
            id_video,
        ):
            ignorados.append(ruta)
            continue

        if id_video in videos:
            duplicados.setdefault(
                id_video,
                [videos[id_video]],
            ).append(ruta)

            continue

        videos[id_video] = ruta

    return videos, duplicados, ignorados


# ==========================================================
# METADATOS
# ==========================================================

def construir_lugar(discurso):
    resultado = []

    lugares_especificos = obtener_lista(
        discurso.get("lugaresEspecificos")
    )

    partes = (
        lugares_especificos
        + [
            limpiar(discurso.get("localidad")),
            limpiar(discurso.get("provincia")),
            limpiar(discurso.get("pais")),
        ]
    )

    for valor in partes:
        valor_limpio = limpiar(valor)

        if (
            valor_limpio
            and valor_limpio not in resultado
        ):
            resultado.append(valor_limpio)

    return ", ".join(resultado)

def construir_descripcion(discurso):
    id_discurso = limpiar(
        discurso.get("id")
    )

    titulo = limpiar(
        discurso.get("titulo")
    )

    fecha = limpiar(
        discurso.get("fecha")
    )

    lugar = construir_lugar(discurso)

    descripcion_original = limpiar(
        discurso.get("descripcion")
    )

    lineas = [
        "Proyecto Discursos",
        "",
        f"Título: {titulo}",
        f"Fecha: {fecha}",
    ]

    if lugar:
        lineas.append(
            f"Lugar: {lugar}"
        )

    lineas.extend([
        f"ID: {id_discurso}",
        "",
    ])

    if descripcion_original:
        lineas.extend([
            descripcion_original,
            "",
        ])

    lineas.extend([
        (
            "Este registro forma parte de Proyecto "
            "Discursos, un archivo digital dedicado "
            "a preservar, organizar y facilitar la "
            "consulta de los discursos públicos de "
            "Cristina."
        ),
        "",
        "Sitio web en desarrollo.",
    ])

    return "\n".join(lineas)


def construir_subjects(discurso):
    subjects = [
        "Cristina Fernández de Kirchner",
        "Argentina",
        "Discurso",
        "Proyecto Discursos",
    ]

    anio = limpiar(
        discurso.get("anio")
    )

    if anio:
        subjects.append(anio)

    for coleccion in obtener_lista(
        discurso.get("colecciones")
    ):
        if coleccion not in subjects:
            subjects.append(coleccion)

    return "; ".join(subjects)


def construir_metadatos(discurso):
    id_discurso = limpiar(
        discurso.get("id")
    )

    titulo = limpiar(
        discurso.get("titulo")
    )

    fecha = limpiar(
        discurso.get("fecha")
    )

    pais = limpiar(
        discurso.get("pais")
    )

    localidad = limpiar(
        discurso.get("localidad")
    )

    provincia = limpiar(
        discurso.get("provincia")
    )

    cobertura = ", ".join(
        parte
        for parte in [
            localidad,
            provincia,
            pais,
        ]
        if parte
    )

    metadatos = {
        "title": (
            f"{id_discurso} — {titulo}"
        ),
        "creator": CREADOR,
        "date": fecha,
        "mediatype": "movies",
        "collection": COLECCION_ARCHIVE,
        "language": IDIOMA,
        "subject": construir_subjects(
            discurso
        ),
        "description": construir_descripcion(
            discurso
        ),
        "publisher": "Proyecto Discursos",
    }

    if cobertura:
        metadatos["coverage"] = cobertura

    return {
        clave: valor
        for clave, valor in metadatos.items()
        if limpiar(valor)
    }


# ==========================================================
# INTERNET ARCHIVE
# ==========================================================

def item_completo(identifier, nombre_video):
    url = (
        "https://archive.org/metadata/"
        f"{identifier}"
    )

    try:
        respuesta = requests.get(
            url,
            timeout=20,
        )

        respuesta.raise_for_status()

        datos = respuesta.json()

        metadata = datos.get(
            "metadata",
            {},
        )

        if not metadata.get("identifier"):
            return False

        archivos = datos.get(
            "files",
            [],
        )

        nombres_archivos = {
            limpiar(archivo.get("name"))
            for archivo in archivos
            if archivo.get("name")
        }

        return nombre_video in nombres_archivos

    except requests.RequestException as error:
        print(
            "⚠️ No se pudo comprobar el ítem: "
            f"{error}"
        )

        return False
    
def construir_comando(
    identifier,
    video,
    metadatos,
):
    comando = [
        str(IA_EXE),
        "upload",
        identifier,
        str(video),
        "--verify",
        "--retries",
        "5",
        "--sleep",
        "10",
    ]

    for clave, valor in metadatos.items():
        comando.extend([
            "-m",
            f"{clave}:{valor}",
        ])

    return comando


def mostrar_vista_previa(
    identifier,
    video,
    metadatos,
):
    print("\n" + "=" * 70)
    print(f"ID:          {identifier}")
    print(f"VIDEO:       {video}")
    print(f"TÍTULO:      {metadatos.get('title', '')}")
    print(f"FECHA:       {metadatos.get('date', '')}")
    print(f"CREATOR:     {metadatos.get('creator', '')}")
    print(f"SUBJECTS:    {metadatos.get('subject', '')}")
    print("=" * 70)


def registrar_resultado(
    id_discurso,
    identifier,
    video,
    estado,
    mensaje="",
):
    ARCHIVO_REGISTRO.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    registro = {
        "fecha": datetime.now().isoformat(
            timespec="seconds"
        ),
        "id": id_discurso,
        "identifier": identifier,
        "video": str(video),
        "estado": estado,
        "mensaje": mensaje,
    }

    with ARCHIVO_REGISTRO.open(
        "a",
        encoding="utf-8",
    ) as archivo:
        archivo.write(
            json.dumps(
                registro,
                ensure_ascii=False,
            )
            + "\n"
        )

def registrar_error(id_discurso):
    ARCHIVO_ERRORES.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    errores_existentes = set()

    if ARCHIVO_ERRORES.exists():
        errores_existentes = {
            linea.strip()
            for linea in ARCHIVO_ERRORES.read_text(
                encoding="utf-8"
            ).splitlines()
            if linea.strip()
        }

    errores_existentes.add(id_discurso)

    ARCHIVO_ERRORES.write_text(
        "\n".join(
            sorted(errores_existentes)
        ) + "\n",
        encoding="utf-8",
    )

def subir_video(
    id_discurso,
    discurso,
    video,
    ejecutar,
    comprobar_existencia,
):
    identifier = id_discurso.lower()

    metadatos = construir_metadatos(
        discurso
    )

    mostrar_vista_previa(
        identifier,
        video,
        metadatos,
    )

    if comprobar_existencia:
        print("Comprobando Internet Archive...")

        if item_completo(
            identifier,
            video.name,
        ):
            print(
                "⏭️ Ya existe en Internet Archive:"
            )
            print(
                "https://archive.org/details/"
                f"{identifier}"
            )

            registrar_resultado(
                id_discurso,
                identifier,
                video,
                "omitido",
                "El ítem ya existe.",
            )

            return "omitido"

    comando = construir_comando(
        identifier,
        video,
        metadatos,
    )

    if not ejecutar:
        print(
            "🧪 SIMULACIÓN: no se subió ningún archivo."
        )
        print(
            "Para subirlo, agregá --upload."
        )
        return "simulado"

    intentos_maximos = 3

    for intento in range(
        1,
        intentos_maximos + 1,
    ):
        try:
            print(
                f"Intento {intento}/"
                f"{intentos_maximos}"
            )

            resultado = subprocess.run(
                comando,
                check=True,
                text=True,
            )

            print(
                "✅ Video subido correctamente:"
            )
            print(
                "https://archive.org/details/"
                f"{identifier}"
            )

            registrar_resultado(
                id_discurso,
                identifier,
                video,
                "subido",
                f"Código de salida: {resultado.returncode}",
            )

            quitar_error(id_discurso)

            return "subido"

        except subprocess.CalledProcessError as error:
            print(
                f"⚠️ Falló el intento "
                f"{intento} de "
                f"{intentos_maximos}."
            )

            if intento < intentos_maximos:
                espera = 30 * intento

                print(
                    f"Reintentando en "
                    f"{espera} segundos..."
                )

                time.sleep(espera)

    print(
        "❌ No se pudo subir "
        f"{id_discurso} después de "
        f"{intentos_maximos} intentos."
    )

    registrar_resultado(
        id_discurso,
        identifier,
        video,
        "error",
        (
            "La subida falló después de "
            f"{intentos_maximos} intentos."
        ),
    )
    registrar_error(id_discurso)
    return "error"

def quitar_error(id_discurso):
    if not ARCHIVO_ERRORES.exists():
        return

    errores = [
        linea.strip()
        for linea in ARCHIVO_ERRORES.read_text(
            encoding="utf-8"
        ).splitlines()
        if linea.strip()
        and linea.strip() != id_discurso
    ]

    contenido = "\n".join(errores)

    if contenido:
        contenido += "\n"

    ARCHIVO_ERRORES.write_text(
        contenido,
        encoding="utf-8",
    )

def cargar_errores():
    """
    Devuelve los IDs pendientes guardados
    en archive_errores.txt.
    """
    if not ARCHIVO_ERRORES.exists():
        return []

    return [
        linea.strip().upper()
        for linea in ARCHIVO_ERRORES.read_text(
            encoding="utf-8"
        ).splitlines()
        if linea.strip()
    ]

# ==========================================================
# PROGRAMA PRINCIPAL
# ==========================================================

def main():
    parser = argparse.ArgumentParser(
        description=(
            "Sube videos de Proyecto Discursos "
            "a Internet Archive."
        )
    )

    parser.add_argument(
        "--upload",
        action="store_true",
        help=(
            "Ejecuta las subidas. Sin esta opción "
            "solo se muestra una simulación."
        ),
    )

    parser.add_argument(
        "--id",
        dest="id_discurso",
        help=(
            "Procesa un único ID, por ejemplo "
            "CFK-20100402-01."
        ),
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help=(
            "Cantidad máxima de videos a procesar."
        ),
    )

    parser.add_argument(
        "--sin-comprobar",
        action="store_true",
        help=(
            "No consulta si el ítem ya existe "
            "en Internet Archive."
        ),
    )
    parser.add_argument(
    "--errores",
    action="store_true",
    help=(
        "Procesa únicamente los IDs guardados "
        "en data/archive_errores.txt."
    ),
)

    argumentos = parser.parse_args()

    if not IA_EXE.exists():
        print(
            "❌ No se encontró ia.exe:\n"
            f"{IA_EXE}"
        )
        sys.exit(1)

    try:
        discursos = cargar_discursos()

        videos, duplicados, ignorados = buscar_videos()

    except (
        FileNotFoundError,
        ValueError,
        json.JSONDecodeError,
    ) as error:
        print(f"❌ {error}")
        sys.exit(1)

    print("=" * 70)
    print("Proyecto Discursos — Internet Archive")
    print("=" * 70)
    print(f"Discursos en JSON: {len(discursos)}")
    print(f"Videos encontrados: {len(videos)}")
    print(f"IDs de video duplicados: {len(duplicados)}")
    print(f"Videos ignorados: {len(ignorados)}")

    if ignorados:
        print("\nVideos ignorados por nombre no válido:")

    for ruta in ignorados:
        print(f" - {ruta.name}")

    if argumentos.upload:
        print("MODO: SUBIDA REAL")
    else:
        print("MODO: SIMULACIÓN")

    ids_a_procesar = sorted(
        set(discursos) & set(videos)
    )
    if argumentos.errores: 
        ids_con_error = cargar_errores()

        if not ids_con_error:
            print(
                "✅ No hay errores pendientes "
                "para reintentar."
            )
            return

        ids_a_procesar = [
            id_discurso
            for id_discurso in ids_con_error
            if (
                id_discurso in discursos
                and id_discurso in videos
            )
        ]

        faltantes = [
            id_discurso
            for id_discurso in ids_con_error
            if (
                id_discurso not in discursos
                or id_discurso not in videos
            )
        ]

        if faltantes:
            print(
                "\n⚠️ Algunos IDs con error "
                "no pueden procesarse:"
            )

            for id_faltante in faltantes:
                print(f" - {id_faltante}")

    if argumentos.id_discurso:
        id_solicitado = (
            argumentos.id_discurso
            .strip()
            .upper()
        )

        if id_solicitado not in discursos:
            print(
                "❌ El ID no existe en "
                "discursos.json."
            )
            sys.exit(1)

        if id_solicitado not in videos:
            print(
                "❌ No se encontró el video "
                f"para {id_solicitado}."
            )
            sys.exit(1)

        ids_a_procesar = [
            id_solicitado
        ]

    if argumentos.limit is not None:
        ids_a_procesar = ids_a_procesar[
            :argumentos.limit
        ]

    if not ids_a_procesar:
        print(
            "No hay videos coincidentes "
            "para procesar."
        )
        return

    resultados = {
        "subido": 0,
        "omitido": 0,
        "simulado": 0,
        "error": 0,
    }

    total = len(ids_a_procesar)

    for posicion, id_discurso in enumerate(
        ids_a_procesar,
        start=1,
    ):
        print(
            f"\n[{posicion}/{total}] "
            f"{id_discurso}"
        )

        estado = subir_video(
            id_discurso=id_discurso,
            discurso=discursos[id_discurso],
            video=videos[id_discurso],
            ejecutar=argumentos.upload,
            comprobar_existencia=(
                not argumentos.sin_comprobar
            ),
        )

        resultados[estado] += 1

        if estado == "error":
            print(
                "➡️ Continuando con el "
                "siguiente video..."
            )

    print("\n" + "=" * 70)
    print("RESUMEN")
    print("=" * 70)
    print(f"✅ Subidos:    {resultados['subido']}")
    print(f"⏭️ Omitidos:   {resultados['omitido']}")
    print(f"🧪 Simulados:  {resultados['simulado']}")
    print(f"❌ Errores:    {resultados['error']}")

    if ARCHIVO_ERRORES.exists():
        errores = [
            linea.strip()
            for linea in ARCHIVO_ERRORES.read_text(
                encoding="utf-8"
            ).splitlines()
            if linea.strip()
        ]

        if errores:
            print()
            print("Videos pendientes:")

            for error in errores:
                print(f" - {error}")

if __name__ == "__main__":
    main()