# TODO — Proyecto Discursos

Lista de mejoras, ideas y tareas pendientes del proyecto.

---

## Prioridad alta

### Mapa

- [ ] Terminar la primera versión de `mapa.html`.
- [ ] Mostrar un marcador por localidad.
- [ ] Mostrar cantidad de discursos por localidad.
- [ ] Enlazar cada marcador con `explorar.html`.
- [ ] Revisar manualmente coordenadas ambiguas.
- [ ] Agregar agrupación de marcadores cuando haya muchos puntos cercanos.
- [ ] Agregar filtros por año, colección y país.
- [ ] Resolver el mapa base para evitar etiquetas inadecuadas sobre las Islas Malvinas.
- [ ] Evaluar un mapa sin etiquetas o una solución con MapLibre.
- [ ] Mostrar recorridos internacionales en una futura versión.

### Calendario

- [ ] Crear `calendario.html`.
- [ ] Permitir elegir año y mes.
- [ ] Resaltar los días que tienen discursos.
- [ ] Mostrar varios discursos cuando coincidan en una misma fecha.
- [ ] Crear una vista “Un día como hoy”.
- [ ] Permitir explorar una misma efeméride a través de distintos años.
- [ ] Agregar filtros por colección y lugar.

### Publicación y revisión general

- [ ] Probar todas las páginas desde celular.
- [ ] Revisar enlaces rotos.
- [ ] Revisar discursos sin descripción.
- [ ] Revisar discursos sin slogan.
- [ ] Revisar miniaturas faltantes.
- [ ] Confirmar que los discursos sin video no muestren reproductor.
- [ ] Confirmar que los discursos con video aparezcan en `archive_disponibles.json`.
- [ ] Revisar el formulario de correcciones.
- [ ] Revisar ortografía y consistencia de títulos.

---

## Archivo y navegación

### Explorar

- [ ] Mejorar la página de archivo completo.
- [ ] Agregar filtro por año.
- [ ] Agregar filtro por país.
- [ ] Agregar filtro por provincia.
- [ ] Agregar filtro por localidad.
- [ ] Agregar filtro por colección.
- [ ] Agregar filtro “con video / sin video”.
- [ ] Permitir combinar varios filtros.
- [ ] Mostrar el total de resultados filtrados.
- [ ] Mejorar la búsqueda por varias palabras.

### Página de cada discurso

- [ ] Agregar navegación “discurso anterior / discurso siguiente”.
- [ ] Mostrar discursos relacionados por colección.
- [ ] Mostrar discursos relacionados por localidad.
- [ ] Mostrar discursos relacionados por fecha o año.
- [ ] Evaluar una sección de fuentes.
- [ ] Evaluar una sección de créditos o colaboraciones.
- [ ] Mejorar el mensaje cuando no existe transcripción.
- [ ] Mejorar el mensaje cuando no existe video.
- [ ] Revisar la experiencia móvil del reproductor.
- [ ] Revisar la carga diferida de videos y transcripciones.

### Colecciones

- [ ] Revisar y normalizar todas las etiquetas de colección.
- [ ] Crear nuevas colecciones temáticas.
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

## Estadísticas

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
- [ ] Evaluar una vista de línea de tiempo.

---

## Página Acerca

- [ ] Revisar el diseño final de la cita inicial.
- [ ] Integrar correctamente la foto de Cristina con Osvaldo Bayer.
- [ ] Verificar el degradé del hero en celular.
- [ ] Revisar el tamaño de la cita en pantallas pequeñas.
- [ ] Mantener el texto principal en una sola columna.
- [ ] Agregar una sección clara sobre cómo colaborar.
- [ ] Enlazar la colaboración al formulario.
- [ ] Revisar la redacción final.
- [ ] Agregar créditos de fotografías cuando corresponda.

---

## Videos e Internet Archive

- [ ] Resolver los videos que todavía fallan al subir.
- [ ] Revisar los archivos con nombres no válidos.
- [ ] Renombrar videos que no siguen el formato `CFK-AAAAMMDD-XX`.
- [ ] Revisar IDs duplicados.
- [ ] Regenerar `archive_disponibles.json` después de nuevas subidas.
- [ ] Automatizar la actualización de `archive_disponibles.json`.
- [ ] Hacer que `subir_archive.py` actualice la lista al finalizar.
- [ ] Revisar si los videos procesaron correctamente en Internet Archive.
- [ ] Comprobar que cada video abra desde el ID correcto.
- [ ] Mantener fuera de GitHub los registros locales de subida.
- [ ] Revisar metadatos de los ítems subidos.

---

## Datos y Notion

- [ ] Mantener Notion como fuente principal de verdad.
- [ ] Revisar fechas.
- [ ] Revisar títulos.
- [ ] Revisar país, provincia y localidad.
- [ ] Revisar lugares específicos.
- [ ] Revisar colecciones.
- [ ] Revisar estados audiovisuales.
- [ ] Completar descripciones.
- [ ] Completar slogans.
- [ ] Completar miniaturas.
- [ ] Revisar transcripciones.
- [ ] Normalizar nombres geográficos.
- [ ] Revisar localidades duplicadas o mal ubicadas.
- [ ] Revisar las entradas corregidas antes de volver a exportar.

---

## Scripts y automatización

- [ ] Crear `actualizar_proyecto.py`.
- [ ] Ejecutar desde un solo comando:
  - [ ] `convertir_notion.py`
  - [ ] `generar_lugares.py`
  - [ ] `generar_archive_disponibles.py`
- [ ] Mostrar un resumen final de la actualización.
- [ ] Detectar errores antes de modificar archivos.
- [ ] Crear copias de seguridad antes de regenerar datos.
- [ ] Detectar localidades nuevas.
- [ ] Detectar IDs duplicados.
- [ ] Detectar discursos sin fecha.
- [ ] Detectar discursos sin título.
- [ ] Detectar discursos sin transcripción.
- [ ] Detectar discursos con video local pero sin Archive.
- [ ] Agregar una opción de simulación.
- [ ] Documentar todos los scripts en el README.

---

## Diseño y experiencia móvil

- [ ] Revisar menú móvil.
- [ ] Evaluar un menú hamburguesa.
- [ ] Revisar tamaños de títulos.
- [ ] Revisar espaciados.
- [ ] Revisar carruseles.
- [ ] Revisar tarjetas.
- [ ] Revisar formularios.
- [ ] Revisar el mapa en celular.
- [ ] Revisar el calendario en celular.
- [ ] Revisar el reproductor en celular.
- [ ] Revisar las páginas con textos largos.
- [ ] Agregar animaciones sutiles.
- [ ] Mantener buena accesibilidad y contraste.

---

## Seguridad y mantenimiento

- [ ] Mantener activado 2FA en GitHub.
- [ ] Guardar los códigos de recuperación.
- [ ] No subir contraseñas ni claves.
- [ ] Mantener `.gitignore` actualizado.
- [ ] No publicar archivos de log.
- [ ] No publicar rutas locales.
- [ ] Revisar `git status` antes de cada commit.
- [ ] Hacer commits después de cada mejora estable.
- [ ] Mantener una copia local.
- [ ] Mantener una copia en OneDrive.
- [ ] Mantener una copia pública en Internet Archive.

---

## Ideas futuras

- [ ] Vista calendario.
- [ ] Vista mapa.
- [ ] Línea de tiempo.
- [ ] “Un día como hoy”.
- [ ] Recorridos presidenciales.
- [ ] Comparación de discursos por tema.
- [ ] Búsqueda dentro de transcripciones.
- [ ] Nube de temas o palabras.
- [ ] Filtros por período presidencial.
- [ ] Página especial por efemérides.
- [ ] Página especial por viajes internacionales.
- [ ] Página especial por provincias.
- [ ] Página especial por discursos destacados.
- [ ] Dominio propio.
- [ ] Versión instalable como PWA.
- [ ] Mejorar SEO y vista previa al compartir enlaces.
- [ ] Agregar imagen social para cada discurso.
- [ ] Crear una versión 1.0 documentada en GitHub Releases.
- [ ] Sumar otro tipo de material (tweets, posts de facebook, prólogos, cartas, etc.)