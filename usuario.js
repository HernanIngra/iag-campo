// Identidad y permisos, compartidos por los tres módulos.
// Generado a mano — es código, no datos.
(function (g) {
  "use strict";

  // Revisados con el cliente el 23/10.
  var USUARIOS = [
    { id: "juanjo",  nombre: "Juanjo Arias",  rol: "gerente",  titulo: "Gerente de campo",
      hace: "Puede hacer todo: recetar, retirar, confirmar, comprar y presupuestar" },
    { id: "ruben",   nombre: "Rubén Navajas", rol: "encargado", titulo: "Encargado · Lajitas", zona: "LAJITAS",
      hace: "Crea las órdenes de Lajitas y confirma su realización y la devolución del remanente" },
    { id: "ramiro",  nombre: "Ramiro",        rol: "encargado", titulo: "Encargado · Norte", zona: "NORTE",
      hace: "Crea las órdenes de El Mistol y La Iluminada y confirma su realización y la devolución del remanente" },
    { id: "eq-lajitas", nombre: "Equipo pulverización Lajitas", rol: "equipo", titulo: "Pulverización · Lajitas", zona: "LAJITAS",
      hace: "Recibe las órdenes pendientes de Lajitas y reporta la aplicación para que la confirme el encargado" },
    { id: "eq-norte", nombre: "Equipo pulverización Norte", rol: "equipo", titulo: "Pulverización · Norte", zona: "NORTE",
      hace: "Recibe las órdenes pendientes del Norte y reporta la aplicación para que la confirme el encargado" },
    { id: "oficina", nombre: "Oficina Salta", rol: "oficina",  titulo: "Oficina",
      hace: "Carga las compras y arma el presupuesto" },
  ];

  // Circuito de una orden: el encargado (o el gerente) la emite; el equipo o
  // el encargado retira el producto (remito); el equipo reporta la aplicación
  // y el encargado la confirma (o la reporta y confirma él, si el equipo no lo
  // hizo); el encargado confirma la devolución del remanente. Cada uno en su zona.
  // borrarOT = borrar una orden pendiente (sólo el gerente; ver stock.html).
  // verificar = poner el tilde de que la compra está físicamente en el galpón.
  var PERMISOS = {
    gerente:   { borrarOT: 1, verPresupuesto: 1, emitirOT: 1, remitir: 1, reportar: 1, confirmarOT: 1, confirmarRetorno: 1, comprar: 1, verificar: 1, trasladar: 1 },
    encargado: { verPresupuesto: 0, emitirOT: 1, remitir: 1, reportar: 1, confirmarOT: 1, confirmarRetorno: 1, comprar: 0, verificar: 1, trasladar: 1 },
    equipo:    { verPresupuesto: 0, emitirOT: 0, remitir: 1, reportar: 1, confirmarOT: 0, confirmarRetorno: 0, comprar: 0, verificar: 0, trasladar: 0 },
    oficina:   { verPresupuesto: 1, emitirOT: 0, remitir: 0, reportar: 0, confirmarOT: 0, confirmarRetorno: 0, comprar: 1, verificar: 1, trasladar: 1 },
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
      return '<a class="hbtn" href="' + (destinoInicio || "index.html?v=25") +
             '" style="text-decoration:none">Identificarse</a>';
    }
    return '<span class="quien" title="' + u.hace + '">' +
             '<b>' + u.nombre + '</b><span class="rol">' + u.titulo + '</span>' +
           '</span>' +
           '<a class="hbtn" href="' + (destinoInicio || "index.html?v=25") +
           '" style="text-decoration:none" title="Cambiar de usuario">Cambiar</a>';
  }

  g.IAgUsuario = {
    USUARIOS: USUARIOS, PERMISOS: PERMISOS,
    actual: actual, entrar: entrar, salir: salir, puede: puede, puedeEnZona: puedeEnZona, barra: barra,
  };
})(window);
