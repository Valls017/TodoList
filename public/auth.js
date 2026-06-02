const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const mensaje = document.getElementById("mensajeAuth");

const TOKEN_KEY = "token";
const USUARIO_KEY = "usuario";

function mostrarMensaje(texto, tipo = "error") {
  mensaje.textContent = texto;
  mensaje.className = `auth-message ${tipo}`;
  mensaje.hidden = false;
}

function obtenerValor(id) {
  return document.getElementById(id).value.trim();
}

async function enviarJSON(url, datos) {
  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.error || resultado.message || resultado.errores?.join(", ") || "Error en la solicitud");
  }

  return resultado;
}

async function iniciarSesion(event) {
  event.preventDefault();

  try {
    const resultado = await enviarJSON("/auth/login", {
      email: obtenerValor("email"),
      password: obtenerValor("password")
    });

    localStorage.setItem(TOKEN_KEY, resultado.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify({ nombre: resultado.nombre }));
    window.location.href = "/app/";
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function registrarUsuario(event) {
  event.preventDefault();

  try {
    await enviarJSON("/auth/register", {
      nombre: obtenerValor("nombre"),
      email: obtenerValor("email"),
      password: obtenerValor("password")
    });

    mostrarMensaje("Usuario registrado correctamente. Inicia sesion.", "success");

    setTimeout(function () {
      window.location.href = "/app/login.html";
    }, 900);
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

if (localStorage.getItem(TOKEN_KEY) && formLogin) {
  window.location.href = "/app/";
}

if (formLogin) {
  formLogin.addEventListener("submit", iniciarSesion);
}

if (formRegistro) {
  formRegistro.addEventListener("submit", registrarUsuario);
}
