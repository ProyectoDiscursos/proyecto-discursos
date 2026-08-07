# TODO — Proyecto Discursos

> La versión 2.1 cerró la arquitectura principal del archivo.
> Los pendientes actuales se concentran en limpieza, carga de contenido,
> calidad de datos y mejoras incrementales.

Pendientes posteriores a la versión 2.1.

---

# PRIORIDAD ACTUAL

## Contenido y datos

- [ ] Continuar carga de transcripciones.
- [ ] Continuar carga de videos.
- [ ] Agregar nuevos registros al archivo.
- [ ] Completar localidades no identificadas.
- [ ] Completar provincias no identificadas.
- [ ] Completar países no identificados.
- [ ] Completar lugares específicos no identificados de Capital Federal.
- [ ] Revisar localidades duplicadas o mal ubicadas.
- [ ] Revisar fechas.
- [ ] Revisar títulos.
- [ ] Revisar colecciones.
- [ ] Revisar estados audiovisuales.
- [ ] Completar descripciones.
- [ ] Completar slogans.
- [ ] Completar miniaturas faltantes.
- [ ] Revisar transcripciones.
- [ ] Mantener Notion como fuente principal de verdad.

---

## Revisión general de la versión 2.1

- [ ] Probar todas las páginas desde celular.
- [ ] Revisar menú móvil.
- [ ] Evaluar menú hamburguesa.
- [ ] Revisar tamaños de títulos.
- [ ] Revisar espaciados.
- [ ] Revisar tarjetas.
- [ ] Revisar formularios.
- [ ] Revisar páginas con textos largos.
- [ ] Revisar enlaces rotos.
- [ ] Revisar ortografía y consistencia de títulos.
- [ ] Revisar accesibilidad.
- [ ] Revisar contraste.
- [ ] Eliminar CSS sin uso.
- [ ] Eliminar JavaScript sin uso.
- [ ] Revisar código duplicado.
- [ ] Revisar nombres de clases y archivos.
- [ ] Revisar comportamiento de errores y estados vacíos.

---

# ARCHIVO Y NAVEGACIÓN

## Buscar

- [ ] Seguir refinando el ranking de relevancia.
- [ ] Mejorar búsqueda por varias palabras.
- [ ] Evaluar sinónimos.
- [ ] Mejorar resaltado de coincidencias.
- [ ] Revisar filtros avanzados.
- [ ] Revisar combinación de filtros.
- [ ] Revisar búsqueda sin texto.
- [ ] Evaluar compartir búsquedas mediante URL.

---

## Fecha

### Año / Mes / Día

- [x] Crear exploración por año.
- [x] Crear exploración por mes.
- [x] Crear exploración por día.
- [x] Resaltar días con discursos.
- [x] Mostrar discursos de una fecha sin salir de la página.

### Etapas

- [ ] Implementar vista “Etapas”.
- [ ] 2005–2007 — Senadora nacional.
- [ ] 2007–2011 — Primer mandato presidencial.
- [ ] 2011–2015 — Segundo mandato presidencial.
- [ ] 2017–2019 — Senadora nacional.
- [ ] 2019–2023 — Vicepresidenta de la Nación.
- [ ] Definir etapa 2024–.
- [ ] Mostrar cantidad de discursos por etapa.

### Futuras mejoras temporales

- [ ] Crear “Un día como hoy”.
- [ ] Explorar una misma efeméride a través de distintos años.
- [ ] Evaluar una línea de tiempo.

---

## Lugar

- [x] Navegación por país.
- [x] Navegación por provincia cuando corresponde.
- [x] Navegación por localidad.
- [x] Saltear provincia en países donde no existe ese dato.
- [x] Mostrar “Provincia no identificada”.
- [x] Mostrar “Localidad no identificada”.
- [x] Habilitar lugar específico para Capital Federal.
- [x] Mostrar “Lugar específico no identificado”.

### Pendientes

- [ ] Completar datos detectados como no identificados.
- [ ] Revisar normalización de países.
- [ ] Revisar normalización de provincias.
- [ ] Revisar normalización de localidades.
- [ ] Revisar experiencia móvil de `lugar.html`.

---

## Archivo completo

- [ ] Seguir mejorando `explorar.html`.
- [ ] Revisar filtros existentes.
- [ ] Revisar combinación de filtros.
- [ ] Revisar total de resultados filtrados.
- [ ] Revisar experiencia móvil.

---

## Colecciones

- [ ] Revisar y normalizar etiquetas existentes.
- [ ] Mantener la estructura actual por ahora.
- [ ] Evaluar nuevas colecciones temáticas.

### Posibles colecciones

- [ ] Industria.
- [ ] Educación.
- [ ] Salud.
- [ ] Ciencia y tecnología.
- [ ] Derechos humanos.
- [ ] Energía.
- [ ] Economía.
- [ ] Mercosur.
- [ ] G20.
- [ ] Naciones Unidas.
- [ ] Malvinas.
- [ ] Cadenas nacionales.
- [ ] Aperturas del Congreso.
- [ ] Efemérides.
- [ ] Actos y eventos.

---

# MAPA

- [ ] Mejorar `mapa.html`.
- [ ] Revisar diseño general.
- [ ] Mostrar un marcador por localidad.
- [ ] Mostrar cantidad de discursos por localidad.
- [ ] Revisar coordenadas ambiguas.
- [ ] Agregar clustering de marcadores.
- [ ] Agregar filtros por año.
- [ ] Agregar filtros por colección.
- [ ] Agregar filtros por país.
- [ ] Resolver etiquetas inadecuadas sobre las Islas Malvinas.
- [ ] Evaluar mapa sin etiquetas.
- [ ] Evaluar MapLibre.
- [ ] Evaluar integración del mapa dentro de `lugar.html`.
- [ ] Evaluar recorridos internacionales.

---

# PÁGINA DE CADA DISCURSO

- [ ] Agregar navegación “anterior / siguiente”.
- [ ] Mostrar discursos relacionados por colección.
- [ ] Mostrar discursos relacionados por localidad.
- [ ] Mostrar discursos relacionados por fecha o año.
- [ ] Evaluar sección de fuentes.
- [ ] Evaluar sección de créditos o colaboraciones.
- [ ] Mejorar mensaje cuando no existe transcripción.
- [ ] Mejorar mensaje cuando no existe video.
- [ ] Revisar reproductor en celular.
- [ ] Revisar carga diferida de videos.
- [ ] Revisar carga diferida de transcripciones.
- [ ] Confirmar que discursos sin video no muestren reproductor.

---

# ESTADÍSTICAS

- [ ] Revisar que “Alcance internacional” no incluya Argentina.
- [ ] Revisar que “Principales localidades” muestre solo localidades argentinas.
- [ ] Mostrar cantidad de discursos con video disponible en Internet Archive.
- [ ] Mostrar porcentaje de cobertura audiovisual.
- [ ] Agregar ranking de provincias.
- [ ] Agregar ranking de localidades.
- [ ] Agregar ranking de países.
- [ ] Agregar estadísticas por colección.
- [ ] Agregar evolución por año.
- [ ] Agregar estadísticas geográficas vinculadas al mapa.
- [ ] Evaluar una línea de tiempo.

---

# PÁGINA ACERCA

- [ ] Revisar diseño final de la cita inicial.
- [ ] Integrar correctamente la foto de Cristina con Osvaldo Bayer.
- [ ] Revisar degradé del hero en celular.
- [ ] Revisar tamaño de la cita en pantallas pequeñas.
- [ ] Mantener texto principal en una sola columna.
- [ ] Agregar sección clara sobre cómo colaborar.
- [ ] Enlazar colaboración al formulario.
- [ ] Revisar redacción final.
- [ ] Agregar créditos fotográficos cuando corresponda.

---

# VIDEOS E INTERNET ARCHIVE

- [ ] Continuar subida de videos.
- [ ] Resolver videos que todavía fallan al subir.
- [ ] Revisar archivos con nombres no válidos.
- [ ] Renombrar videos que no sigan `CFK-AAAAMMDD-XX`.
- [ ] Revisar IDs duplicados.
- [ ] Regenerar `archive_disponibles.json` después de nuevas subidas.
- [ ] Automatizar actualización de `archive_disponibles.json`.
- [ ] Hacer que `subir_archive.py` actualice la lista al finalizar.
- [ ] Revisar procesamiento de videos en Internet Archive.
- [ ] Comprobar que cada video abra desde el ID correcto.
- [ ] Mantener fuera de GitHub los registros locales de subida.
- [ ] Revisar metadatos de ítems subidos.

---

# SCRIPTS Y AUTOMATIZACIÓN

## Actualización general

- [ ] Crear `actualizar_proyecto.py`.

Debe ejecutar:

- [ ] `convertir_notion.py`
- [ ] `generar_lugares.py`
- [ ] `generar_indice_busqueda.py`
- [ ] `generar_archive_disponibles.py`

### Validaciones

- [ ] Mostrar resumen final de actualización.
- [ ] Detectar errores antes de modificar archivos.
- [ ] Crear copias de seguridad antes de regenerar datos.
- [ ] Detectar localidades nuevas.
- [ ] Detectar IDs duplicados.
- [ ] Detectar discursos sin fecha.
- [ ] Detectar discursos sin título.
- [ ] Detectar discursos sin transcripción.
- [ ] Detectar discursos con video local pero sin Archive.
- [ ] Agregar modo de simulación.
- [ ] Documentar scripts en README.

---

# SEGURIDAD Y MANTENIMIENTO

- [ ] Mantener activado 2FA en GitHub.
- [ ] Guardar códigos de recuperación.
- [ ] No subir contraseñas ni claves.
- [ ] Mantener `.gitignore` actualizado.
- [ ] No publicar logs.
- [ ] No publicar rutas locales.
- [ ] Revisar `git status` antes de commits.
- [ ] Hacer commits después de cada mejora estable.
- [ ] Mantener copia local.
- [ ] Mantener copia en OneDrive.
- [ ] Mantener copia pública en Internet Archive.

---

# FUTURAS VERSIONES

## Nuevos tipos de documentos

- [ ] Diseñar arquitectura para múltiples tipos de contenido.
- [ ] Tweets.
- [ ] Publicaciones de Facebook.
- [ ] Cartas.
- [ ] Prólogos.
- [ ] Agregar campo “Tipo de documento”.
- [ ] Adaptar búsqueda para filtrar por tipo.
- [ ] Adaptar Archivo para distintos tipos de material.

---

## Otras ideas

- [ ] Línea de tiempo.
- [ ] “Un día como hoy”.
- [ ] Recorridos presidenciales.
- [ ] Comparación de discursos por tema.
- [ ] Nube de palabras o temas.
- [ ] Página especial por efemérides.
- [ ] Página especial por viajes internacionales.
- [ ] Página especial por provincias.
- [ ] Página especial por discursos destacados.
- [ ] Dominio propio.
- [ ] Versión PWA.
- [ ] Mejorar SEO.
- [ ] Mejorar vistas previas al compartir.
- [ ] Imagen social para cada discurso.