// ============================
// Juego de Memoria - script.js
// ============================

// Elementos del DOM
const pantallaConfiguracion = document.getElementById("pantalla-configuracion");
const inputJugador1 = document.getElementById("jugador1");
const inputJugador2 = document.getElementById("jugador2");
const activarMemoriaCheckbox = document.getElementById("activarMemoriaPerfecta");
const temaOscuroCheckbox = document.getElementById("temaOscuro");
const tablero = document.getElementById("tablero");
const turnoTexto = document.getElementById("turnoActual");
const intentosTexto = document.getElementById("intentos");
const cronometroTotalTexto = document.getElementById("cronometroTotal");
const victoria = document.getElementById("victoria");
const mensajeVictoria = document.getElementById("mensajeVictoria");
const temporizadorTexto = document.getElementById("temporizador");

// Variables del juego
let modo = 1;
let nombres = [];
let puntos = [0, 0];
let turno = 0;
let totalParejas = 15;
let imagenReverso = "imagenes/reverso.png"; // Imagen fija para el reverso
let primera = null;
let segunda = null;
let bloqueado = false;
let jugadaIniciada = false;
let tiempoLimite = 5000;
let cronometro;
let cuentaRegresiva;
let cronometroTotalSegundos = 0;
let intervaloCrono;
let modoMemoriaPerfecta = false;
let erroresPermitidos = 5;
let erroresActuales = 0;
let victoriasConsecutivas = { 0: 0, 1: 0 };
let ganador = null;

// Niveles de dificultad
const niveles = {
  facil: { pares: 6 },
  medio: { pares: 10 },
  dificil: { pares: 15 }
};
let nivelActual = niveles.dificil;

// Escucha cambios de modo para mostrar/ocultar nombre del Jugador 2
document.querySelectorAll('input[name="modo"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const modoSeleccionado = document.querySelector('input[name="modo"]:checked').value;
    inputJugador2.style.display = modoSeleccionado === "2" ? "inline-block" : "none";
  });
});

// Cargar preferencias guardadas al iniciar
function cargarPreferencias() {
  const prefs = JSON.parse(localStorage.getItem("memoria-preferencias"));
  if (!prefs) return;

  const modoRadio = document.querySelector(`input[name="modo"][value="${prefs.modo}"]`);
  if (modoRadio) modoRadio.checked = true;
  inputJugador2.style.display = prefs.modo === 2 ? "inline-block" : "none";
  inputJugador1.value = prefs.jugador1 || "";
  inputJugador2.value = prefs.jugador2 || "";
  activarMemoriaCheckbox.checked = prefs.memoriaPerfecta || false;
  temaOscuroCheckbox.checked = prefs.temaOscuro || false;
  document.body.classList.add(prefs.temaOscuro ? "oscuro" : "claro");
}

// Inicia el juego con las configuraciones actuales
function iniciarDesdeConfiguracion() {
  const modoSeleccionado = parseInt(document.querySelector('input[name="modo"]:checked').value);
  modo = modoSeleccionado;

  const j1 = inputJugador1.value.trim();
  const j2 = inputJugador2.value.trim();

  if (!j1 || (modo === 2 && !j2)) {
    alert("Por favor ingresa los nombres.");
    return;
  }

  nombres = modo === 1 ? [j1] : [j1, j2];
  modoMemoriaPerfecta = activarMemoriaCheckbox.checked;

  document.body.classList.remove("claro", "oscuro");
  document.body.classList.add(temaOscuroCheckbox.checked ? "oscuro" : "claro");

  const preferencias = {
    modo: modo,
    jugador1: j1,
    jugador2: j2,
    memoriaPerfecta: modoMemoriaPerfecta,
    temaOscuro: temaOscuroCheckbox.checked
  };
  localStorage.setItem("memoria-preferencias", JSON.stringify(preferencias));

  pantallaConfiguracion.style.display = "none";
  juego.style.display = "block";

  nivelActual = niveles.dificil;
  puntos = [0, 0];
  intentos = 0;
  erroresActuales = 0;
  totalParejas = nivelActual.pares;

  barajadas = barajar(generarImagenes(nivelActual.pares));
  actualizarTurno();
  crearTarjetas();

  if (modo === 1) iniciarCronometroTotal();
  if (modo === 2) iniciarCronometro();
}

// Generar arreglo de imágenes duplicadas
function generarImagenes(numPares) {
  const imgs = [];
  for (let i = 1; i <= numPares; i++) {
    imgs.push(`img${i}.png`, `img${i}.png`);
  }
  return imgs;
}

// Barajar imágenes
function barajar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Crear las tarjetas en el tablero
function crearTarjetas() {
  tablero.innerHTML = "";
  barajadas.forEach((imagen) => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta', 'volteada');
    tarjeta.dataset.imagen = imagen;
    tarjeta.innerHTML = `
      <div class="cara trasera" style="background-image: url('${imagenReverso}'); background-size: cover;"></div>
      <div class="cara frontal">
        <img src="imagenes/${imagen}" alt="imagen" width="100%" height="100%">
      </div>
    `;
    tarjeta.addEventListener('click', () => manejarClick(tarjeta));
    tablero.appendChild(tarjeta);
  });

  // Mostrar todas las cartas por 5 segundos
  bloqueado = true;
  setTimeout(() => {
    document.querySelectorAll('.tarjeta').forEach(t => t.classList.remove('volteada'));
    bloqueado = false;
    if (modo === 2) iniciarCronometro();
  }, 5000);
}

// Lógica al hacer clic en una tarjeta
function manejarClick(tarjeta) {
  if (bloqueado || tarjeta.classList.contains('volteada') || tarjeta === primera) return;

  if (modo === 2 && !jugadaIniciada) {
    jugadaIniciada = true;
    clearTimeout(cronometro);
    clearInterval(cuentaRegresiva);
    iniciarCronometro();
  }

  tarjeta.classList.add('volteada');

  if (!primera) {
    primera = tarjeta;
  } else {
    segunda = tarjeta;
    bloqueado = true;

    if (modo === 1) {
      intentos++;
      actualizarTurno();
    }

    const img1 = primera.dataset.imagen;
    const img2 = segunda.dataset.imagen;

    if (img1 === img2) {
      puntos[turno]++;
      totalParejas--;

      if (totalParejas === 0) mostrarGanador();

      primera = null;
      segunda = null;
      bloqueado = false;

      if (modo === 2) {
        clearTimeout(cronometro);
        clearInterval(cuentaRegresiva);
        jugadaIniciada = false;
        iniciarCronometro();
      }

      if (modo === 1 && (intentos <= 18 || cronometroTotalSegundos <= 40)) {
        if (nivelActual === niveles.facil) nivelActual = niveles.medio;
        else if (nivelActual === niveles.medio) nivelActual = niveles.dificil;
      }
    } else {
      if (modoMemoriaPerfecta && modo === 1) {
        erroresActuales++;
        if (erroresActuales > erroresPermitidos) {
          setTimeout(() => {
            alert("¡Juego terminado! Has fallado más de 5 veces.");
            location.reload();
          }, 500);
          return;
        }
      }

      setTimeout(() => {
        primera.classList.remove('volteada');
        segunda.classList.remove('volteada');
        primera = null;
        segunda = null;
        bloqueado = false;

        if (modo === 2) {
          clearTimeout(cronometro);
          clearInterval(cuentaRegresiva);
          turno = 1 - turno;
          actualizarTurno();
          jugadaIniciada = false;
          iniciarCronometro();
        }
      }, 1000);
    }
  }
}

// Actualizar texto de turno e intentos
function actualizarTurno() {
  if (modo === 1) {
    turnoTexto.textContent = `Pares encontrados: ${puntos[0]}`;
    intentosTexto.textContent = `Intentos: ${intentos}`;
  } else {
    turnoTexto.textContent = `Turno de: ${nombres[turno]} — Puntos: ${nombres[0]} (${puntos[0]}) | ${nombres[1]} (${puntos[1]})`;
    intentosTexto.textContent = "";
  }
}

// Mostrar mensaje de victoria, guardar récords, reproducir confetti o burla
function mostrarGanador() {
  if (modo === 1) clearInterval(intervaloCrono);

  juego.style.display = 'none';
  victoria.style.display = 'block';

  if (modo === 1) {
    mensajeVictoria.textContent = `🎉 ¡Has encontrado los ${nivelActual.pares} pares!`;
  } else if (puntos[0] !== puntos[1]) {
    ganador = puntos[0] > puntos[1] ? 0 : 1;
    let perdedor = 1 - ganador;
    victoriasConsecutivas[ganador]++;
    victoriasConsecutivas[perdedor] = 0;
    mensajeVictoria.textContent = `🎉 ¡${nombres[ganador]} ha ganado con ${puntos[ganador]} pares!`;

    if (victoriasConsecutivas[ganador] >= 3) {
      mostrarBurla();
    }
  } else {
    mensajeVictoria.textContent = `🤝 ¡Empate! Ambos tienen ${puntos[0]} pares.`;
  }

  // Confetti al ganar
  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

  // Guardar récord en localStorage
  let score = {
    modo: modo,
    nombre: modo === 1 ? nombres[0] : nombres.join(" vs "),
    tiempo: cronometroTotalSegundos || 0,
    intentos: intentos,
    fecha: new Date().toLocaleString()
  };

  let records = JSON.parse(localStorage.getItem("memoria-records")) || [];
  records.push(score);
  localStorage.setItem("memoria-records", JSON.stringify(records));
  mostrarRecords();
}

// Mostrar pantalla de burla por 3 victorias seguidas
function mostrarBurla() {
  const burla = document.getElementById("pantalla-burla");
  const textoBurla = document.getElementById("texto-burla");
  const audioBurla = document.getElementById("audio-burla");

  const perdedorNombre = nombres[1 - ganador];
  textoBurla.textContent = `${perdedorNombre.toUpperCase()}, LOOOOSER`;

  burla.style.display = "flex";
  audioBurla.currentTime = 0;
  audioBurla.play();

  burla.addEventListener("click", () => {
    burla.style.display = "none";
    audioBurla.pause();
    audioBurla.currentTime = 0;
    victoriasConsecutivas[0] = 0;
    victoriasConsecutivas[1] = 0;
  }, { once: true });
}



// Cronómetro total para modo 1 jugador
function iniciarCronometroTotal() {
  cronometroTotalSegundos = 0;
  cronometroTotalTexto.textContent = `⏱ Tiempo: 0s`;
  intervaloCrono = setInterval(() => {
    cronometroTotalSegundos++;
    cronometroTotalTexto.textContent = `⏱ Tiempo: ${cronometroTotalSegundos}s`;
  }, 1000);
}

// Mostrar historial de partidas
function mostrarRecords() {
  const tabla = document.querySelector("#tabla-records tbody");
  tabla.innerHTML = "";
  const records = JSON.parse(localStorage.getItem("memoria-records")) || [];

  records.slice().reverse().forEach(record => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${record.fecha}</td>
      <td>${record.modo === 1 ? "1 Jugador" : "2 Jugadores"}</td>
      <td>${record.nombre}</td>
      <td>${record.modo === 1 ? record.intentos : "—"}</td>
      <td>${record.modo === 1 ? record.tiempo + "s" : "—"}</td>
    `;
    tabla.appendChild(fila);
  });
}

// Elimina el historial de partidas
function borrarHistorial() {
  if (confirm("¿Estás seguro de que deseas borrar el historial de partidas?")) {
    localStorage.removeItem("memoria-records");
    mostrarRecords();
  }
}

// Reinicia el juego completamente
function reiniciarJuego() {
  location.reload();
}

// Revancha rápida sin cambiar configuración
function revanchaRapida() {
  victoria.style.display = "none";
  juego.style.display = "block";

  primera = null;
  segunda = null;
  bloqueado = false;
  jugadaIniciada = false;
  turno = 0;
  puntos = [0, 0];
  intentos = 0;
  totalParejas = nivelActual.pares;
  erroresActuales = 0;

  barajadas = barajar(generarImagenes(nivelActual.pares));
  tablero.innerHTML = '';
  actualizarTurno();
  crearTarjetas();

  if (modo === 1) iniciarCronometroTotal();
  if (modo === 2) iniciarCronometro();
}

// Restablece preferencias guardadas
function resetearPreferencias() {
  if (confirm("¿Seguro que deseas restablecer las preferencias?")) {
    localStorage.removeItem("memoria-preferencias");
    document.querySelector('input[name="modo"][value="1"]').checked = true;
    inputJugador1.value = "";
    inputJugador2.value = "";
    inputJugador2.style.display = "none";
    activarMemoriaCheckbox.checked = false;
    temaOscuroCheckbox.checked = false;
    document.body.classList.remove("oscuro");
    document.body.classList.add("claro");
  }
}

// Cargar preferencias al inicio
cargarPreferencias();
