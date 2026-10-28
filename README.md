# Mi día

## Acceso por cuentas

- Al abrir la web se solicita usuario y PIN de 4 dígitos.
- La cuenta **Administrador** se crea automáticamente con el PIN **1608**.
- El administrador puede crear, editar, ordenar y eliminar cuentas desde el botón **Cuentas**.
- Cada cuenta guarda sus propias tareas y proyectos en este navegador. La información que existía antes de incorporar cuentas se migra a Administrador.
- El PIN es una barrera local y no equivale a autenticación segura mediante servidor.

Aplicación personal en español para organizar tareas, metas semanales, coordinaciones y proyectos. Sin instalación de dependencias ni servicios externos.

## Ejecutar

Con Node.js 20 o posterior, abre una terminal en esta carpeta:

```sh
npm start
```

Abre http://127.0.0.1:4173 en el navegador. También puedes usar `iniciar.cmd` en Windows: detecta Node.js, inicia el servidor en segundo plano, espera a que responda y abre el navegador. Puedes cerrar la ventana del iniciador. Si usas npm start, mantén su terminal abierta mientras utilizas la aplicación. No abras directamente index.html: los módulos requieren HTTP. Para detener el servidor, pulsa Ctrl+C en su terminal.

## Arquitectura y datos

- HTML, CSS y módulos JavaScript sin bibliotecas. `model.js` concentra las reglas; `app.js` gestiona interfaz y persistencia; `art.js` selecciona ocho fotogramas de una hoja de sprites transparente para las cinco etapas y los coloca sobre un paisaje ilustrado. Los recursos se encuentran en assets; sus prompts se documentan en assets/GENERACION.md.
- Un registro por tarea, con identificador estable, relaciones opcionales de área/proyecto/semana y subtareas vinculadas. Las secciones son consultas superpuestas del mismo conjunto. Finalizar conserva la planificación y el estado anterior; restaurar conserva el checklist.
- Guardado automático en `localStorage`. Pertenece al navegador, perfil, dispositivo, origen y cuenta utilizados. Borrar los datos del navegador elimina este almacenamiento. No hay sincronización entre dispositivos.
- Respaldos JSON con versión, validación y confirmación antes de reemplazar. Exporta periódicamente y antes de importar. Si falla el guardado, se muestra el error y se ofrece reintentar/exportar. Si los datos existentes son ilegibles, se bloquea su sobrescritura automática y se permite descargar el original.
- Progreso diario = tareas principales finalizadas del conjunto diario / total de ese conjunto. El conjunto diario incluye pendientes programados para hoy o atrasados, tareas planificadas para hoy ya finalizadas y cualquier actividad finalizada hoy según America/Lima. Excluye historial de días anteriores, pendientes futuros y subtareas, y no depende de los filtros. Los identificadores evitan conteos duplicados. El porcentaje se calcula con precisión real; se redondea al mostrarlo sin anticipar el 100 %.
- Fechas de planificación sin conversión de zona horaria; marcas de creación/finalización ISO. Hoy usa America/Lima; semana de lunes a domingo. Se comprueba el cambio de día cada 15 segundos y al volver a la pestaña.
- Orden mediante arrastre desde el asa de cada fila y mediante Subir/Bajar. Al soltar sobre otra prioridad se adopta esa prioridad. Soltar sobre una sección del menú mueve el mismo registro; soltar sobre Finalizados lo completa. Compatible con puntero de ratón y táctil; Enter o Espacio en el asa abre Mover a. El menú accesible se conserva.

## Verificación

```sh
npm test
```

Veintiocho pruebas automatizadas cubren fechas y semanas, progreso vacío y con 3/4/8 tareas, identificadores únicos, finalización/restauración, independencia de subtareas, movimiento, duplicación rechazo de respaldos inválidos y estructura consistente de las cinco poses.

Revisión de navegador realizada en escritorio y móvil de 390 × 844: creación y persistencia tras recarga, checklist al 100 % sin finalizar la tarea principal, finalización con pasos pendientes, cancelación y confirmación, restauración, movimiento semanal conservando programación diaria, eliminación cancelada y confirmada. Sin desbordamiento horizontal de la página en móvil. La ilustración usa proporción 16:9 y respeta movimiento reducido mediante CSS.

Las pruebas del navegador utilizaron una tarea marcada PRUEBA temporal, eliminada al terminar. No se incluyen tareas ficticias iniciales.

Limitaciones: no se hizo una auditoría exhaustiva de lectores de pantalla ni de todos los navegadores. Importación/exportación y fallos de cuota tienen validación y manejo de errores implementados, pero no se simularon todos sus escenarios en el navegador. El almacenamiento local está pensado para uso personal; los cambios simultáneos desde varias pestañas no tienen resolución de conflictos.

## Cambios del 27 de octubre

Cada sección incluye un bloque inferior Finalizados con títulos tachados y restauración mediante checkbox. Hoy muestra las planificadas para hoy y las atrasadas completadas hoy; Semana respeta la semana elegida; Área respeta su selector; Pendientes conserva sus criterios de planificación. No se crean copias. Limpiar finalizados aplica solo a finalizadas visibles según los filtros y exige confirmación. Retira esas actividades de los bloques de trabajo, conservando su registro completo en el archivo general Finalizados. Las finalizadas no tienen eliminación permanente en la interfaz.

Verificado por navegador: reordenamiento de dos tareas por el asa, movimiento al menú Metas pendientes, persistencia del orden al recargar, finalizados de una tarea compartida entre Hoy/Semana/Área, título tachado y cancelación/confirmación de borrado agrupado de tareas temporales. La nueva ilustración se revisó en las cinco poses. El movimiento reducido mantiene una pose estática; el 0 % permanece inmóvil. No se hizo una prueba física en pantalla táctil.

Ajuste de velocidad: entre 50 % y 74 % se utilizan poses de carrera con ciclo de 0,32 s; desde 75 % hasta menos de 100 %, carrera más rápida con ciclo de 0,24 s. Se añadió una prueba con dos de tres tareas completadas (67 % mostrado).


## Reporte diario y actualización de la animación

En Tareas de hoy, Generar reporte produce la fecha en negrita Markdown y una línea por actividad. Incluye las completadas durante el día según America/Lima, aunque estuvieran programadas para otra fecha, y las activas programadas para hoy o atrasadas con (PENDIENTE). No depende de los filtros. Copiar reporte utiliza el portapapeles; si se deniega el acceso, selecciona el texto y explica cómo copiarlo manualmente. No envía mensajes ni modifica tareas.

La carrera utiliza cuatro fotogramas alternados; el reposo permanece inmóvil. La posición del personaje cambia con el porcentaje real de tareas completadas. Se añadieron versiones a los archivos JS/CSS y se desactivó la caché del servidor local para evitar cargar ilustraciones antiguas.


Corrección del avance diario: incluye las actividades del día, también las conservadas en el historial después de limpiar las listas. Tres actividades atrasadas completadas hoy y una aún pendiente dan 3 de 4 (75 %), sin cambiar fechas ni duplicar datos. Se añadieron pruebas para ese caso y para finalizadas sin programación, historial anterior y pendientes futuros.


## Conservación de finalizados

Limpiar finalizados y Quitar de las listas archivan las actividades completadas mediante una fecha archivedAt; no borran registros ni subtareas. Los registros siguen visibles en Finalizados, con la fecha de finalización original y la opción de restaurar. El avance diario, los proyectos y el reporte siguen incluyéndolos. Restaurar limpia la marca de archivo; duplicar crea una tarea activa sin esa marca. Los respaldos anteriores siguen siendo válidos porque archivedAt es opcional al importar. Los datos eliminados permanentemente antes de este cambio solo pueden recuperarse desde un respaldo previo.


## Avance ilustrado por sección

La ilustración cambia su título, total, porcentaje, posición y movimiento según la ventana: Hoy incluye tareas diarias, atrasadas y finalizadas hoy; Semana incluye la semana seleccionada de lunes a domingo; Metas pendientes usa sus propios criterios de planificación; Áreas incluye todas las áreas o la elegida en su selector. Todos los cálculos incluyen los registros archivados conservados en Finalizados y cuentan cada identificador una sola vez. Búsqueda y filtros secundarios no alteran el indicador. En el archivo Finalizados se conserva el indicador de Hoy. Las barras de proyectos siguen mostrando el avance total de cada proyecto.


## Arrastrar entre secciones

En escritorio puedes agarrar el título, el espacio libre de la fila o su asa. En táctil se utiliza el asa para conservar el desplazamiento normal de la página. Mientras arrastras, el menú lateral se resalta y aparecen bloques flotantes de destino. Al soltar se abre la sección elegida. Arrastrar a Semana asigna la semana seleccionada y retira la programación diaria; a Pendientes retira día y semana. Se conserva el identificador, contenido y checklist. Los checkbox y menús siguen siendo controles independientes. También se conserva Mover a para teclado. Verificado por navegador: clic para expandir, arrastre del título Hoy → Semana → Pendientes, identificador estable y persistencia tras recarga. La tarea temporal se retiró al finalizar.
