const inputTitulo = document.getElementById("titulo");
const btnAgregar = document.getElementById("btnAgregar");
const tablaTareas = document.getElementById("tablaTareas");
const inputArchivoDrive = document.getElementById("archivoDrive");
const btnSubirArchivo = document.getElementById("btnSubirArchivo");
const tablaArchivos = document.getElementById("tablaArchivos");

btnAgregar.addEventListener("click", agregarTarea);
btnSubirArchivo.addEventListener("click", subirArchivo);

inputTitulo.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    agregarTarea();
  }
});

async function agregarTarea() {
  const titulo = inputTitulo.value.trim();

  if (titulo.length < 3) {
    alert("La tarea debe tener al menos 3 caracteres");
    return;
  }

  const tarea = {
    titulo: titulo,
    descripcion: "",
    prioridad: "media",
    categoria: "General"
  };

  await fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(tarea)
  });

  inputTitulo.value = "";
  cargarTareas();
}

async function cargarTareas() {
  const respuesta = await fetch("/todos");
  const resultado = await respuesta.json();

  tablaTareas.innerHTML = "";

  resultado.data.forEach(function (tarea) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        <input
          type="checkbox"
          ${tarea.completado ? "checked" : ""}
          onchange="cambiarEstado(${tarea.id}, ${tarea.completado})"
        >
      </td>

      <td class="${tarea.completado ? "tarea-completada" : ""}">
        ${tarea.titulo}
      </td>

      <td>
        <button class="btn-editar" onclick="editarTarea(${tarea.id})">
          Editar
        </button>

        <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})">
          Eliminar
        </button>
      </td>
    `;

    tablaTareas.appendChild(fila);
  });
}

async function cambiarEstado(id, estadoActual) {
  await fetch(`/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      completado: !estadoActual
    })
  });

  cargarTareas();
}

async function editarTarea(id) {
  const respuesta = await fetch(`/todos/${id}`);
  const resultado = await respuesta.json();

  const tituloActual = resultado.data.titulo;

  const nuevoTitulo = prompt("Editar tarea:", tituloActual);

  if (nuevoTitulo === null) {
    return;
  }

  const tituloLimpio = nuevoTitulo.trim();

  if (tituloLimpio.length < 3) {
    alert("La tarea debe tener al menos 3 caracteres");
    return;
  }

  await fetch(`/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      titulo: tituloLimpio
    })
  });

  cargarTareas();
}

async function eliminarTarea(id) {
  await fetch(`/todos/${id}`, {
    method: "DELETE"
  });

  cargarTareas();
}

function formatearTamano(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function subirArchivo() {
  const archivo = inputArchivoDrive.files[0];

  if (!archivo) {
    alert("Selecciona un archivo para subir");
    return;
  }

  const contenido = await archivo.arrayBuffer();

  await fetch(`/files?filename=${encodeURIComponent(archivo.name)}`, {
    method: "POST",
    headers: {
      "Content-Type": archivo.type || "application/octet-stream"
    },
    body: contenido
  });

  inputArchivoDrive.value = "";
  cargarArchivos();
}

async function cargarArchivos() {
  const respuesta = await fetch("/files");
  const resultado = await respuesta.json();

  tablaArchivos.innerHTML = "";

  resultado.data.forEach(function (archivo) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${archivo.id}</td>
      <td>${archivo.originalName}</td>
      <td>${formatearTamano(archivo.size)}</td>
      <td>
        <button class="btn-editar" onclick="editarArchivo(${archivo.id}, '${archivo.originalName.replace(/'/g, "\\'")}')">
          Editar
        </button>

        <a class="btn-descargar" href="${archivo.downloadUrl}">
          Descargar
        </a>

        <button class="btn-eliminar" onclick="eliminarArchivo(${archivo.id})">
          Eliminar
        </button>
      </td>
    `;

    tablaArchivos.appendChild(fila);
  });
}

async function editarArchivo(id, nombreActual) {
  const nuevoNombre = prompt("Nuevo nombre del archivo:", nombreActual);

  if (nuevoNombre === null) {
    return;
  }

  const nombreLimpio = nuevoNombre.trim();

  if (nombreLimpio.length < 1) {
    alert("El nombre del archivo no puede estar vacio");
    return;
  }

  const reemplazar = confirm("¿Quieres reemplazar tambien el contenido del archivo? Presiona Cancelar si solo quieres cambiar el nombre.");

  if (reemplazar) {
    const inputTemporal = document.createElement("input");
    inputTemporal.type = "file";

    inputTemporal.onchange = async function () {
      const archivoNuevo = inputTemporal.files[0];

      if (!archivoNuevo) {
        return;
      }

      const contenido = await archivoNuevo.arrayBuffer();

      await fetch(`/files/${id}?filename=${encodeURIComponent(nombreLimpio)}`, {
        method: "PUT",
        headers: {
          "Content-Type": archivoNuevo.type || "application/octet-stream"
        },
        body: contenido
      });

      cargarArchivos();
    };

    inputTemporal.click();
    return;
  }

  await fetch(`/files/${id}?filename=${encodeURIComponent(nombreLimpio)}`, {
    method: "PUT"
  });

  cargarArchivos();
}

async function eliminarArchivo(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este archivo?");

  if (!confirmar) {
    return;
  }

  await fetch(`/files/${id}`, {
    method: "DELETE"
  });

  cargarArchivos();
}

cargarTareas();
cargarArchivos();
