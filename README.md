# Proyecto Discursos

**Proyecto Discursos** es un archivo digital dedicado a preservar, organizar y facilitar la consulta de los discursos públicos de Cristina.

El proyecto busca reunir en un único espacio transcripciones, registros audiovisuales y metadatos documentales, permitiendo recorrer el archivo por texto, fecha, lugar, colecciones y otros criterios.

> El archivo se encuentra en desarrollo permanente y continúa incorporando, corrigiendo y verificando material.

---

## ¿Qué es Proyecto Discursos?

Proyecto Discursos es un archivo documental digital orientado a la preservación y consulta de intervenciones públicas de Cristina.

Cada discurso constituye una unidad documental independiente y puede reunir, según la disponibilidad del material:

- 🎥 Registro audiovisual
- 📝 Transcripción completa
- 🖼 Miniatura
- 📅 Fecha
- 📍 País, provincia y localidad
- 🏛 Lugar específico
- 🗂 Colecciones temáticas
- 💬 Slogan o frase destacada
- 📄 Descripción
- 🆔 Identificador único

La propuesta combina criterios propios de un archivo documental con una interfaz inspirada en plataformas audiovisuales contemporáneas.

El objetivo es que el material pueda ser recorrido tanto por una persona que busca un discurso determinado como por quien quiere explorar una etapa, un territorio, una temática o una palabra pronunciada dentro de las transcripciones.

---

## Objetivos

- Preservar los discursos públicos de Cristina en un archivo unificado.
- Facilitar el acceso a las fuentes primarias.
- Permitir búsquedas dentro del contenido completo de las transcripciones.
- Organizar el material mediante metadatos normalizados.
- Vincular transcripciones y registros audiovisuales.
- Facilitar distintas formas de exploración cronológica, geográfica y temática.
- Contribuir a la conservación y difusión del patrimonio documental político reciente de la Argentina.

---

# Funcionalidades

## 🔎 Búsqueda dentro de los discursos

El archivo cuenta con un buscador de texto completo que permite localizar palabras y frases dentro de las transcripciones.

Por ejemplo, una búsqueda como:

`manejo del fuego`

puede recuperar discursos en los que esa expresión fue pronunciada aunque no aparezca en el título, la descripción o los metadatos del registro.

La búsqueda permite además refinar los resultados mediante filtros como:

- Año
- País
- Provincia
- Localidad
- Lugar
- Colección
- Disponibilidad de video
- Disponibilidad de transcripción

Las coincidencias exactas reciben mayor relevancia que las coincidencias parciales por términos.

---

## 📅 Exploración por fecha

`fecha.html` permite recorrer el archivo cronológicamente sin necesidad de realizar una búsqueda.

La navegación está organizada en distintos niveles:

**Año → Mes → Día → Discursos**

La vista anual muestra la distribución de discursos por mes.

La vista mensual permite recorrer el calendario y detectar visualmente qué días tienen registros.

Al seleccionar un día se muestran directamente los discursos correspondientes a esa fecha.

También está prevista una futura navegación por **etapas históricas**.

---

## 📍 Exploración por lugar

`lugar.html` permite navegar el archivo geográficamente.

La estructura se adapta a los datos disponibles:

**Argentina**

`País → Provincia → Localidad → Discursos`

**Otros países**

`País → Localidad → Discursos`

En Capital Federal se habilita además un nivel de **lugar específico** cuando corresponde.

El sistema conserva también categorías como:

- Provincia no identificada
- Localidad no identificada
- Lugar específico no identificado

Esto evita que registros incompletos desaparezcan de la navegación y permite detectar datos pendientes de revisión.

---

## 🗂 Colecciones

Los discursos pueden formar parte de una o varias colecciones temáticas o documentales.

Entre las colecciones del archivo se encuentran o se encuentran previstas:

- Malvinas
- Aperturas del Congreso
- Cadenas Nacionales
- Naciones Unidas
- Efemérides
- Actos y eventos
- Mercosur
- Industria
- Educación
- Ciencia y tecnología
- Derechos humanos
- Energía
- Economía

La estructura de colecciones continúa ampliándose y normalizándose.

---

## 📚 Archivo completo

`explorar.html` funciona como catálogo general del archivo.

Permite recorrer todos los discursos y utilizar filtros sin necesidad de comenzar por una búsqueda textual.

De esta manera, Proyecto Discursos ofrece distintas formas de acceso según el objetivo del visitante:

- **Buscar** → encontrar palabras, frases o conceptos.
- **Fecha** → recorrer cronológicamente.
- **Lugar** → recorrer geográficamente.
- **Colecciones** → explorar temáticamente.
- **Archivo completo** → recorrer todos los registros.

---

## 🗺 Mapa

El proyecto cuenta con una primera implementación experimental de exploración mediante mapa.

Las localidades son geocodificadas y vinculadas a coordenadas para permitir futuras visualizaciones territoriales.

Esta sección continúa en desarrollo.

---

## 📊 Estadísticas

El sitio incluye una sección de estadísticas destinada a visualizar la composición y cobertura del archivo.

Entre los indicadores disponibles o en desarrollo se encuentran:

- cantidad de discursos;
- distribución anual;
- cobertura audiovisual;
- países;
- provincias;
- localidades;
- colecciones;
- evolución del archivo.

---

# Organización del proyecto

```text
proyecto-discursos/
│
├── index.html
├── archivo.html
├── buscar.html
├── explorar.html
├── fecha.html
├── lugar.html
├── mapa.html
├── discurso.html
├── coleccion.html
├── colecciones.html
├── estadisticas.html
├── acerca.html
│
├── css/
│   ├── styles.css
│   ├── archivo.css
│   ├── buscar.css
│   ├── fecha.css
│   ├── lugar.css
│   ├── mapa.css
│   ├── home.css
│   └── acerca.css
│
├── js/
│   ├── buscar.js
│   ├── coleccion.js
│   ├── colecciones.js
│   ├── componentes.js
│   ├── discurso.js
│   ├── estadisticas.js
│   ├── fecha.js
│   ├── home.js
│   ├── lugar.js
│   ├── mapa.js
│   └── script.js
│
├── data/
│   ├── discursos.json
│   ├── busqueda/
│   └── transcripciones/
│
├── images/
│   └── miniaturas/
│
├── input/
│   ├── trasnscripciones/
│   └── discursos.csv
│
├── tools/
│   ├── convertir_notion.py
│   ├── generar_lugares.py
│   ├── generar_indice_busqueda.py
│   ├── generar_archive_disponibles.py
│   └── subir_archive.py
│
├── TODO.md
└── README.md

# Datos y flujo de trabajo

La base principal de información se administra en Notion, que funciona como fuente de verdad del proyecto.

El flujo general es:

Notion
   ↓
Exportación CSV
   ↓
input/discursos.csv
   ↓
tools/convertir_notion.py
   ↓
data/discursos.json
   ↓
Sitio web

A partir de esos datos se ejecutan otros procesos auxiliares.

Conversión de datos
py tools\convertir_notion.py

Genera el archivo principal utilizado por el sitio:

data/discursos.json
Información geográfica
py tools\generar_lugares.py

Procesa y mantiene la información necesaria para la exploración geográfica y el mapa.

Índice de búsqueda
py tools\generar_indice_busqueda.py

Genera índices divididos por año para evitar cargar todas las transcripciones en un único archivo de gran tamaño.

data/
└── busqueda/
    ├── indice.json
    ├── 2008.json
    ├── 2009.json
    ├── ...
    └── 2025.json

Las transcripciones individuales se almacenan con el identificador del discurso:

data/transcripciones/CFK-20130723-01.txt
Identificadores

Cada discurso posee un identificador único con el formato:

CFK-AAAAMMDD-XX

Por ejemplo:

CFK-20071210-01
CFK-20130723-01

Este identificador permite vincular de manera consistente:

metadatos;
transcripción;
miniatura;
video;
enlaces externos;
archivos derivados.
Estructura de los registros

Los registros pueden contener, entre otros, los siguientes campos:

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

No todos los registros cuentan todavía con todos los campos completos.

La revisión, normalización y ampliación de los metadatos forma parte del trabajo permanente del archivo.

# Material audiovisual

Proyecto Discursos busca vincular cada discurso con su registro audiovisual cuando este se encuentra disponible.

El proyecto utiliza distintas copias de preservación y trabaja progresivamente en la incorporación del material audiovisual a Internet Archive.

Los discursos sin video permanecen igualmente disponibles cuando existe transcripción u otra documentación suficiente.

# Tecnologías

El proyecto utiliza principalmente:

HTML5
CSS3
JavaScript
Python
Git
GitHub
GitHub Pages
Notion
Internet Archive
OpenStreetMap / herramientas de geocodificación

No utiliza un backend tradicional: el sitio está pensado para funcionar principalmente como una aplicación web estática basada en archivos JSON.

Ejecutar el proyecto localmente

Clonar el repositorio:

git clone https://github.com/...

Entrar en la carpeta:

cd proyecto-discursos

Abrir el proyecto en Visual Studio Code y ejecutarlo mediante Live Server.

No se recomienda abrir directamente los archivos HTML mediante file://, ya que algunas funciones utilizan fetch() para cargar los datos.

Actualizar los datos

Después de realizar modificaciones en Notion:

Exportar nuevamente la base.
Reemplazar:
input/discursos.csv
Ejecutar:
py tools\convertir_notion.py
py tools\generar_lugares.py
py tools\generar_indice_busqueda.py
Revisar los resultados.
Probar el sitio localmente.
Confirmar los cambios mediante Git.
Estado del proyecto

# La versión 2.1 consolidó la arquitectura principal de navegación del archivo.

Actualmente se encuentran implementados:

 Página principal.
 Centro de navegación del archivo.
 Búsqueda dentro de las transcripciones.
 Búsqueda avanzada mediante filtros.
 Archivo completo.
 Exploración cronológica por año, mes y día.
 Exploración geográfica por país, provincia y localidad.
 Tratamiento especial de lugares de Capital Federal.
 Colecciones.
 Página individual de cada discurso.
 Sistema de transcripciones individuales.
 Índice de búsqueda dividido por año.
 Estadísticas.
 Primera implementación del mapa.
 Conversión automática de datos desde Notion.

El desarrollo continúa principalmente en cuatro áreas:

incorporación de nuevos registros;
carga de transcripciones y videos;
revisión y normalización de metadatos;
mejora progresiva de las herramientas de consulta.

El detalle de tareas pendientes se encuentra en TODO.md.

# Desarrollo futuro

Entre las líneas de trabajo previstas se encuentran:

mejorar la visualización mediante mapa;
navegación por etapas históricas;
“Un día como hoy”;
línea de tiempo;
discursos relacionados;
nuevas estadísticas;
mejoras de accesibilidad y experiencia móvil;
automatización del pipeline de actualización;
ampliación de colecciones temáticas;
incorporación progresiva de nuevos tipos documentales.

En una etapa posterior, Proyecto Discursos podrá incorporar además otros materiales públicos de Cristina, como:

cartas;
prólogos;
publicaciones de Facebook;
publicaciones en redes sociales;
otros documentos escritos.

El objetivo es que puedan convivir dentro del mismo archivo documental manteniendo identificadores, metadatos y herramientas de consulta consistentes.

# Preservación

El proyecto busca mantener distintas copias del material y evitar depender de una única plataforma.

La estrategia de preservación contempla progresivamente:

copia local;
copia de respaldo;
almacenamiento en la nube;
publicación audiovisual en Internet Archive;
código y datos públicos mediante GitHub.

# Contribuciones y correcciones

Proyecto Discursos se encuentra en construcción permanente.

Las correcciones de fechas, lugares, transcripciones, identificaciones de videos u otros datos documentales son especialmente valiosas para mejorar la calidad del archivo.

Las formas de colaboración se detallarán en la sección correspondiente del sitio.

# Licencia y uso

Proyecto Discursos tiene fines de preservación, investigación, documentación y consulta histórica.

Los materiales audiovisuales, fotografías, textos y demás documentos conservan los derechos que correspondan a sus autores, productores, organismos o fuentes originales.

El código y los datos elaborados específicamente para el proyecto podrán contar con condiciones de uso propias, detalladas en el repositorio cuando corresponda.