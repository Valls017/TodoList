const inputTitulo = document.getElementById("titulo");
const btnAgregar = document.getElementById("btnAgregar");
const tablaTareas = document.getElementById("tablaTareas");
const inputArchivoDrive = document.getElementById("archivoDrive");
const btnSubirArchivo = document.getElementById("btnSubirArchivo");
const tablaArchivos = document.getElementById("tablaArchivos");
const totalTareas = document.getElementById("totalTareas");
const tareasPendientes = document.getElementById("tareasPendientes");
const tareasCompletadas = document.getElementById("tareasCompletadas");
const totalArchivos = document.getElementById("totalArchivos");
const estadoVacioTareas = document.getElementById("estadoVacioTareas");
const estadoVacioArchivos = document.getElementById("estadoVacioArchivos");

btnAgregar.addEventListener("click", agregarTarea);
btnSubirArchivo.addEventListener("click", subirArchivo);

inputTitulo.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    agregarTarea();
  }
});

function textoCantidad(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

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
  const tareas = resultado.data || [];
  const metadata = resultado.metadata || {};
  const total = metadata.totalGeneral ?? tareas.length;
  const pendientes = metadata.pendientes ?? 0;
  const completadas = metadata.completadas ?? 0;

  tablaTareas.innerHTML = "";
  totalTareas.textContent = textoCantidad(total, "tarea", "tareas");
  tareasPendientes.textContent = textoCantidad(pendientes, "pendiente", "pendientes");
  tareasCompletadas.textContent = textoCantidad(completadas, "completada", "completadas");
  estadoVacioTareas.hidden = tareas.length > 0;

  tareas.forEach(function (tarea) {
    const fila = document.createElement("tr");

    const estado = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarea.completado;
    checkbox.addEventListener("change", function () {
      cambiarEstado(tarea.id, tarea.completado);
    });
    estado.appendChild(checkbox);

    const titulo = document.createElement("td");
    titulo.textContent = tarea.titulo;

    if (tarea.completado) {
      titulo.classList.add("tarea-completada");
    }

    const acciones = document.createElement("td");
    const botonEditar = document.createElement("button");
    botonEditar.className = "btn-editar";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", function () {
      editarTarea(tarea.id);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.className = "btn-eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", function () {
      eliminarTarea(tarea.id);
    });

    const grupoAcciones = document.createElement("div");
    grupoAcciones.className = "actions";
    grupoAcciones.appendChild(botonEditar);
    grupoAcciones.appendChild(botonEliminar);
    acciones.appendChild(grupoAcciones);
    fila.appendChild(estado);
    fila.appendChild(titulo);
    fila.appendChild(acciones);
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
  const archivos = resultado.data || [];

  tablaArchivos.innerHTML = "";
  totalArchivos.textContent = textoCantidad(archivos.length, "archivo", "archivos");
  estadoVacioArchivos.hidden = archivos.length > 0;

  archivos.forEach(function (archivo) {
    const fila = document.createElement("tr");

    const id = document.createElement("td");
    id.textContent = archivo.id;

    const nombre = document.createElement("td");
    nombre.textContent = archivo.originalName;

    const tamano = document.createElement("td");
    tamano.textContent = formatearTamano(archivo.size);

    const acciones = document.createElement("td");
    const botonEditar = document.createElement("button");
    botonEditar.className = "btn-editar";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", function () {
      editarArchivo(archivo.id, archivo.originalName);
    });

    const enlaceDescarga = document.createElement("a");
    enlaceDescarga.className = "btn-descargar";
    enlaceDescarga.href = archivo.downloadUrl;
    enlaceDescarga.textContent = "Descargar";

    const botonEliminar = document.createElement("button");
    botonEliminar.className = "btn-eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", function () {
      eliminarArchivo(archivo.id);
    });

    const grupoAcciones = document.createElement("div");
    grupoAcciones.className = "actions";
    grupoAcciones.appendChild(botonEditar);
    grupoAcciones.appendChild(enlaceDescarga);
    grupoAcciones.appendChild(botonEliminar);
    acciones.appendChild(grupoAcciones);
    fila.appendChild(id);
    fila.appendChild(nombre);
    fila.appendChild(tamano);
    fila.appendChild(acciones);
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
    alert("El nombre del archivo no puede estar vacío");
    return;
  }

  const reemplazar = confirm("¿Quieres reemplazar también el contenido del archivo? Presiona Cancelar si solo quieres cambiar el nombre.");

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
