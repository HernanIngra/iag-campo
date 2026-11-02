// Identidad y permisos, compartidos por los tres módulos.
// Generado a mano — es código, no datos.
(function (g) {
  "use strict";

  // Revisados con el cliente el 23/10.
  var USUARIOS = [
    { id: "gerencia-general", nombre: "Gerencia General", rol: "gerente", titulo: "Gerencia General",
      hace: "Ve y carga todo: recetar, retirar, confirmar, comprar y presupuestar, en las dos zonas" },
    { id: "juanjo",  nombre: "Juanjo Arias",  rol: "gerente",  titulo: "Gerencia Producción",
      hace: "Puede hacer todo: recetar, retirar, confirmar, comprar y presupuestar" },
    { id: "ruben",   nombre: "Rubén Navajas", rol: "encargado", titulo: "Encargado · Lajitas", zona: "LAJITAS",
      hace: "Crea las órdenes de Lajitas, registra la salida del producto y confirma la aplicación y la devolución del remanente" },
    { id: "ramiro",  nombre: "Ramiro",        rol: "encargado", titulo: "Encargado · Norte", zona: "NORTE",
      hace: "Crea las órdenes de El Mistol y La Iluminada, registra la salida del producto y confirma la aplicación y la devolución del remanente" },
    { id: "oficina", nombre: "Oficina Salta", rol: "oficina",  titulo: "Oficina",
      hace: "Carga las compras y arma el presupuesto" },
  ];

  // Circuito de una orden: el encargado (o la gerencia) la emite y elige el
  // aplicador, que la recibe en PDF por WhatsApp (los aplicadores no usan la
  // app, desde el 2/11). El encargado registra la salida del producto, confirma
  // la aplicación y la devolución del remanente. Cada encargado en su zona.
  // borrarOT = borrar una orden pendiente (sólo el rol gerente: Gerencia General
  // y Gerencia Producción; ver stock.html).
  // verificar = poner el tilde de que la compra está físicamente en el galpón.
  var PERMISOS = {
    gerente:   { borrarOT: 1, verPresupuesto: 1, emitirOT: 1, remitir: 1, confirmarOT: 1, confirmarRetorno: 1, comprar: 1, verificar: 1, trasladar: 1 },
    encargado: { verPresupuesto: 0, emitirOT: 1, remitir: 1, confirmarOT: 1, confirmarRetorno: 1, comprar: 0, verificar: 1, trasladar: 1 },
    oficina:   { verPresupuesto: 1, emitirOT: 0, remitir: 0, confirmarOT: 0, confirmarRetorno: 0, comprar: 1, verificar: 1, trasladar: 1 },
  };

  // Aplicadores por zona (2/11). No usan la app: reciben la orden en PDF.
  // En la orden se elige uno de la lista o «Otro» y se escribe el nombre.
  var APLICADORES = {
    LAJITAS: ["Ferracuti", "Nito", "Segovia", "Odorico"],
    NORTE: ["Tarpuy", "Supertino", "Drone"],
  };

  var CLAVE = "iag_usuario";

  function actual() {
    try {
      var id = localStorage.getItem(CLAVE);
      var u = null;
      for (var i = 0; i < USUARIOS.length; i++) if (USUARIOS[i].id === id) u = USUARIOS[i];
      return u;
    } catch (e) { return null; }
  }

  function entrar(id) {
    try { localStorage.setItem(CLAVE, id); } catch (e) {}
  }

  function salir() {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
  }

  function puede(accion) {
    var u = actual();
    if (!u) return true;                    // sin identificar no se bloquea nada
    if (u.permisos && u.permisos[accion] != null) return !!u.permisos[accion];
    return !!(PERMISOS[u.rol] || {})[accion];
  }

  /**
   * Como puede(), pero además la zona tiene que ser la del usuario: Ramiro
   * (Norte) no confirma una aplicación de Lajitas. Sin zona = cualquiera.
   */
  function puedeEnZona(accion, zona) {
    var u = actual();
    if (!puede(accion)) return false;
    return !u || !u.zona || !zona || u.zona === zona;
  }

  /** Barra con quién sos, para poner en el encabezado de cada módulo. */
  function barra(destinoInicio) {
    var u = actual();
    if (!u) {
      return '<a class="hbtn" href="' + (destinoInicio || "index.html?v=28") +
             '" style="text-decoration:none">Identificarse</a>';
    }
    return '<span class="quien" title="' + u.hace + '">' +
             '<b>' + u.nombre + '</b><span class="rol">' + u.titulo + '</span>' +
           '</span>' +
           '<a class="hbtn" href="' + (destinoInicio || "index.html?v=28") +
           '" style="text-decoration:none" title="Cambiar de usuario">Cambiar</a>';
  }

  g.IAgUsuario = {
    USUARIOS: USUARIOS, PERMISOS: PERMISOS, APLICADORES: APLICADORES,
    actual: actual, entrar: entrar, salir: salir, puede: puede, puedeEnZona: puedeEnZona, barra: barra,
  };
})(window);
