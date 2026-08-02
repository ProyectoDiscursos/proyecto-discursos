# Proyecto Discursos

Proyecto Discursos es un archivo digital dedicado a preservar, organizar y facilitar la consulta de los discursos públicos de Cristina Kirchner entre 2003 y la actualidad.

# ¿Qué es Proyecto Discursos?

Proyecto Discursos es un archivo documental en desarrollo cuyo objetivo es reunir, organizar y poner a disposición los discursos públicos de Cristina en una plataforma moderna, accesible y de fácil navegación.

Cada discurso constituye la unidad principal del archivo y reúne, cuando está disponible:

🎥 Video
📝 Transcripción completa
🖼 Miniatura
📍 Información del lugar
🏷 Colecciones temáticas
📅 Fecha
🆔 Identificador único

El sitio está pensado para funcionar como un archivo histórico navegable, inspirado en la experiencia de plataformas audiovisuales como Netflix o HBO Max, pero orientado a la consulta documental.

## Objetivos

- Preservar los discursos públicos de Cristina en un único archivo.
- Facilitar la búsqueda y la consulta mediante filtros y colecciones.
- Organizar el material audiovisual con información normalizada.
- Contribuir a la conservación y difusión del patrimonio documental reciente de la Argentina.

## Características

Archivo cronológico completo.
Búsqueda por texto.
Exploración mediante filtros.
Colecciones temáticas.
Información geográfica normalizada.
Página individual para cada discurso.
Estadísticas del archivo.
Transcripciones individuales.
Navegación entre discursos relacionados.
Tecnologías
HTML5
CSS3
JavaScript
Python
Git
GitHub Pages
Notion (gestión de datos)

## Organización del proyecto

Proyecto Discursos
│
├── index.html
├── explorar.html
├── discurso.html
├── coleccion.html
├── colecciones.html
├── estadisticas.html
│
├── css/
├── js/
├── data/
├── images/
├── input/
└── tools/

## Flujo de trabajo

Toda la información se administra desde una base de datos en Notion.

Notion
        ↓
Exportación CSV
        ↓
convertir_notion.py
        ↓
discursos.json
        ↓
Sitio web

Las transcripciones se exportan como archivos Markdown y el conversor genera automáticamente una versión limpia para cada discurso.

## Estructura de cada discurso

Cada registro contiene, entre otros, los siguientes campos:

ID
Título
Fecha
Año
País
Provincia
Localidad
Lugar específico
Colecciones
Estado audiovisual
Video
Miniatura
Slogan
Descripción
Transcripción
Estado del proyecto

Actualmente se encuentran implementados:

Página principal.
Explorador de discursos.
Ficha individual.
Colecciones.
Página de colecciones.
Página de estadísticas.
Sistema de filtros.
Organización geográfica.
Conversor automático desde Notion.
Próximas etapas
Incorporación de miniaturas.
Incorporación de videos.
Descripciones y slogans.
Integración con Internet Archive.
Nuevas visualizaciones estadísticas.
Mapas interactivos.
Línea de tiempo.

## Cómo ejecutar

git clone https://github.com/...

cd proyecto-discursos

Abrir el proyecto con Visual Studio Code y ejecutar mediante Live Server.

Para regenerar los datos:

py tools/convertir_notion.py

## Licencia

Este proyecto tiene fines de preservación, investigación y consulta histórica.