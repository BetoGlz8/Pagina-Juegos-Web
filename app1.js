let numeroSecreto = 0;
let intentos = 0;
let listaNumerosSorteados = [];
let numeroMaximo = 10;

function asignarTextoElemento (elemento,texto) {
    let elementoHTML = document.querySelector (elemento);
    elementoHTML.innerHTML = texto;
    return;
}

function verificarIntento() {
    let numeroDeUsuario = parseInt(document.getElementById ('valorUsuario').value);
    
    //se utiliza el === como una validacion para que evalue si es igual en valor y en tipo de dato sino devolvera un FALSE
    console.log(intentos);
    if (numeroDeUsuario === numeroSecreto) {
        asignarTextoElemento('p', `Acertaste el numero en ${intentos} ${(intentos === 1) ? 'vez' : 'veces'}`);
        document.getElementById('reiniciar').removeAttribute ('disabled');
    } else{
        //El usuario no acerto
        if(numeroDeUsuario > numeroSecreto){
            asignarTextoElemento('p','El número secreto es menor');
        } else {
            asignarTextoElemento('p','El número secreto es mayor');
        }
        intentos++;
        limpiarCaja	();
    }
    return;
}

function limpiarCaja () {
    let valorCaja = document.querySelector ('#valorUsuario');
    valorCaja.value = '';
}

function generarNumeroSecreto() {
    let numeroGenerado =  Math.floor(Math.random() * numeroMaximo) + 1;
    
    console.log(listaNumerosSorteados);
    console.log(numeroGenerado);
    //si ya sorteamos todos los numeros posibles
    //linea de codigo para solucionar el problema de recursividad
    if (listaNumerosSorteados.length == numeroMaximo) {
        asignarTextoElemento ('p','Se han sorteado todos los numeros posibles');
    } else {
        
        //Si el numero generado esta incluido en la lista
       if (listaNumerosSorteados.includes(numeroGenerado)) {
         return generarNumeroSecreto();
        } else {
            listaNumerosSorteados.push(numeroGenerado);
            return numeroGenerado;
          }
    }    
}

function condicionesIniciales () {
    asignarTextoElemento('h1','¡Bienvenido al juego del número secreto!');
    asignarTextoElemento('p', `Indica un numero del 1 al ${numeroMaximo}`);  
    
    numeroSecreto = generarNumeroSecreto();
    intentos = 1;
}

function reiniciarJuego() {
    //limpiar caja
    limpiarCaja();
    //inidicar mensaje de intervalo de numeros
    //generar el numero aleatorio / secreto
    //inicializar el numero de intentos
    condicionesIniciales();
    //deshabilitar el boton de nuevo juego
    document.querySelector ('#reiniciar').setAttribute('disabled','true');
}

condicionesIniciales();


