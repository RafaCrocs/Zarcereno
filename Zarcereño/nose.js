import { database } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

function mostrarVentana() {
    crearTabla();
    const ventana = document.getElementById('dialog_ventanaConfirmacion');
    ventana.style.display = 'flex';
    ventana.showModal();
}

function cerrarVentana(dialogId) {
    const dialog = document.getElementById(dialogId);
    const lechesDialog = document.getElementById('dialog_ventanaLeches');
    if (dialog) {
        dialog.style.display = 'none';
        lechesDialog.style.display = 'none';
        lechesDialog.close();
        dialog.close();
    }
}

function confirmarEnvio() {
    const btn = document.getElementById('btnconfirmarEnvio');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerText = 'Enviando...';
    }

    const nombreCliente = document.getElementById('nombreCliente').value || "";
    const inputNota = document.getElementById('notaPedido');
    const notaPedido = inputNota ? inputNota.value : "";

    const tipoPedidoElement = document.querySelector('input[name="tipoPedido"]:checked');
    const tipoPedido = tipoPedidoElement ? tipoPedidoElement.value : "No especificado";
    
    // Si el carrito está vacío, no enviar nada
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'Confirmar';
        }
        return;
    }

    const pedidosRef = ref(database, 'pedidos');
    const nuevoPedidoRef = push(pedidosRef);
    
    set(nuevoPedidoRef, {
        cliente: nombreCliente,
        nota: notaPedido,
        tipo: tipoPedido,
        items: carrito,
        fecha: new Date().toISOString()
    })
    .then(() => {
        limpiarCarrito();
        document.getElementById('nombreCliente').value = ''; 
        if (inputNota) inputNota.value = '';
        cerrarVentana('dialog_ventanaConfirmacion');
    })
    .catch((error) => {
        console.error("Error al enviar pedido:", error);
        alert("Hubo un error al enviar el pedido. Intenta nuevamente.");
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'Confirmar';
        }
    });
}

function limpiarCarrito() {
    carrito = [];
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
}

//Logica para agregar productos al carrito

// Bloquear el botón de retroceso
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

let carrito = [];
let bebida;
let leche;
let saborizante;

function agregar(botonPulsado) {
    bebida = botonPulsado.value;
    abrirLeches();
}

function abrirTamaños() {
    const ventanaTamaño = document.getElementById('dialog_ventanaTamaños');
    ventanaTamaño.style.display = 'block';
    ventanaTamaño.showModal();
}

function elegirTamaño(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaTamaño = document.getElementById('dialog_ventanaTamaños');
    ventanaTamaño.style.display = 'none';
    ventanaTamaño.close();
}


function abrirLeches() {
    const leches = document.getElementById('dialog_ventanaLeches');
    leches.style.display = 'block';
    leches.showModal();
}

function agregarLeche(botonPulsado) {
    leche = botonPulsado.value;
    
    const ventanaLeches = document.getElementById('dialog_ventanaLeches');
    ventanaLeches.style.display = 'none';
    ventanaLeches.close();
    abrirSaborizantes();
    }


function abrirSaborizantes() {
    if(bebida.includes(',')) {
        saborizante = '';
        agregarCarrito();
        return;
    }
    const saborizantes = document.getElementById('dialog_ventanaSaborizantes');
    saborizantes.style.display = 'block';
    saborizantes.showModal();
}

function agregarSaborizante(botonPulsado) {
    saborizante = botonPulsado.value;
    const ventanaSaborizantes = document.getElementById('dialog_ventanaSaborizantes');
    ventanaSaborizantes.style.display = 'none';
    ventanaSaborizantes.close();
    
    agregarCarrito();
}

function abrirHelados() {
    const helados = document.getElementById('dialog_ventanaHelados');
    helados.style.display = 'block';
    helados.showModal();
}

function agregarHelado(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaHelados = document.getElementById('dialog_ventanaHelados');
    ventanaHelados.style.display = 'none';
    ventanaHelados.close();
}

function agregarCarrito() {
    let producto = {
        bebida: bebida,
        leche: leche,
        saborizante: saborizante
    };
    carrito.push(producto);
}

function agregarBatido() {
    let batido = [];
    const checkboxes = document.querySelectorAll('.checkbox-batido');
    checkboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
        const producto = checkbox.value;
        batido.push(producto);
    }
    });
    bebida = batido.join(', ');
    checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    });
    abrirLeches();
}




let Indice = 0;

function crearTabla() {
    let htmlTabla = "";
    for (let i = Indice; i < carrito.length; i++) {
        htmlTabla += `
            <tr>
                <td>${carrito[i].bebida}</td>
                <td>${carrito[i].leche}</td>
                <td>${carrito[i].saborizante}</td>
                <td><button onclick="eliminarProducto(${i})" id="btnEliminar">Eliminar</button></td>
            </tr>`;}
        Indice = carrito.length;
    
    document.getElementById('listaEnTabla').insertAdjacentHTML('beforeend', htmlTabla);
    
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
    crearTabla();
}

function abrirPantallaCompleta() {
    const pantallaCompleta = document.getElementById('dialog_pantallaCompletada');
    pantallaCompleta.style.display = 'block';
    pantallaCompleta.showModal();
}


window.mostrarVentana = mostrarVentana;
window.agregar = agregar;
window.abrirTamaños = abrirTamaños;
window.cerrarVentana = cerrarVentana;
window.confirmarEnvio = confirmarEnvio;
window.elegirTamaño = elegirTamaño;
window.abrirLeches = abrirLeches;
window.agregarLeche = agregarLeche;
window.abrirSaborizantes = abrirSaborizantes;
window.agregarSaborizante = agregarSaborizante;
window.abrirHelados = abrirHelados;
window.agregarHelado = agregarHelado;
window.agregarCarrito = agregarCarrito;
window.agregarBatido = agregarBatido;
window.eliminarProducto = eliminarProducto;
window.crearTabla = crearTabla;
window.limpiarCarrito = limpiarCarrito;
window.abrirPantallaCompleta = abrirPantallaCompleta;