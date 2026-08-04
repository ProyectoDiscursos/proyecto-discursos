import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

ENTRADA = RAIZ / "data" / "archive_subidas.jsonl"
SALIDA = RAIZ / "data" / "archive_disponibles.json"

estados = {}

with ENTRADA.open("r", encoding="utf-8") as f:
    for linea in f:
        linea = linea.strip()
        if not linea:
            continue

        registro = json.loads(linea)

        estados[
            registro["id"].upper()
        ] = registro["estado"].lower()

disponibles = sorted([
    id_
    for id_, estado in estados.items()
    if estado in ("subido", "omitido")
])

with SALIDA.open("w", encoding="utf-8") as f:
    json.dump(
        disponibles,
        f,
        ensure_ascii=False,
        indent=2
    )

print(f"Videos disponibles: {len(disponibles)}")
print(f"Archivo generado: {SALIDA}")