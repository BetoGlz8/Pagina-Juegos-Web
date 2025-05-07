// Actividad 1: Crear array para almacenar los nombres
let amigos = [];

// Actividad 2: Implementa una función para agregar amigos
function agregarAmigo() {
  const nombreInput = document.getElementById('amigo'); // Se obtiene el valor del input
  const nombre = nombreInput.value.trim(); // Se elimina espacios en blanco al inicio y al final

  if (nombre === "") {
    alert("Por favor, inserte un nombre.");
    return;
  }

  // Añade el nombre al array
  amigos.push(nombre);

  // Limpia/Vacia el campo de texto
  nombreInput.value = "";

  // Actualiza la lista de amigos en la pantalla
  actualizarLista();
}

// Actividad 3: Implementa una función para actualizar la lista de amigos
function actualizarLista() {
  const lista = document.getElementById('listaAmigos');
  lista.innerHTML = ""; // Limpia la lista antes de actualizarla

  amigos.forEach((amigo) => {
    const li = document.createElement('li');
    li.textContent = amigo;
    lista.appendChild(li);
  });
}

// Actividad 4: Implementa una función para sortear los amigos
function sortearAmigo() {
  if (amigos.length === 0) {
    alert("Agrega al menos un nombre antes de realizar el sorteo.");
    return;
  }

// Genera el índice aleatorio
  const indiceAleatorio = Math.floor(Math.random() * amigos.length);
  const amigoSorteado = amigos[indiceAleatorio];

// Muestra el resultado en la pantalla
  const resultado = document.getElementById('resultado');
  resultado.innerHTML = `<li>🎉 El amigo secreto es: <strong>${amigoSorteado}</strong></li>`;

// Limpia la lista y el array de amigos para que solo sea visible el amigo secreto
amigos = []; // Vaciar el array
document.getElementById('listaAmigos').innerHTML = ""; // Borrar la lista en pantalla
}