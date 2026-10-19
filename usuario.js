// Identidad y permisos, compartidos por los tres módulos.
// Generado a mano — es código, no datos.
(function (g) {
  "use strict";

  var USUARIOS = [
    { id: "juanjo",  nombre: "Juanjo",  rol: "campo",      titulo: "Campo",
      hace: "Recorre los lotes y emite las órdenes de trabajo" },
    { id: "ruben",   nombre: "Rubén",   rol: "aplicacion", titulo: "Aplicación · Lajitas", zona: "LAJITAS",
      hace: "Emite órdenes, retira el producto, confirma las aplicaciones y el retorno de envases en Lajitas",
      permisos: { emitirOT: 1 } },
    { id: "ramiro",  nombre: "Ramiro",  rol: "aplicacion", titulo: "Aplicación · Norte", zona: "NORTE",
      hace: "Retira el producto, confirma las aplicaciones y el retorno de envases en El Mistol y La Iluminada" },
    { id: "oficina", nombre: "Oficina", rol: "oficina",    titulo: "Oficina",
      hace: "Carga las compras, las distribuye entre depósitos y arma el presupuesto" },
  ];
  // `permisos` en un usuario corrige los de su rol: Rubén emite órdenes
  // aunque Aplicación en general no lo hace (Ramiro, por ahora, no).

  // Los traslados entre depósitos los hace cualquiera: mover un bidón de un
  // galpón a otro no es una decisión que haya que autorizar.
  // Aplicación hace el circuito físico del producto: lo retira (remito),
  // confirma la aplicación y confirma lo que vuelve. Cada uno en su zona.
  // verificar = poner el tilde de que la compra está físicamente en el galpón.
  var PERMISOS = {
    campo:      { verPresupuesto: 1, emitirOT: 1, remitir: 0, confirmarOT: 0, confirmarRetorno: 0, comprar: 0, verificar: 1, trasladar: 1 },
    aplicacion: { verPresupuesto: 0, emitirOT: 0, remitir: 1, confirmarOT: 1, confirmarRetorno: 1, comprar: 0, verificar: 1, trasladar: 1 },
    oficina:    { verPresupuesto: 1, emitirOT: 0, remitir: 0, confirmarOT: 0, confirmarRetorno: 0, comprar: 1, verificar: 1, trasladar: 1 },
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
      return '<a class="hbtn" href="' + (destinoInicio || "index.html?v=6") +
             '" style="text-decoration:none">Identificarse</a>';
    }
    return '<span class="quien" title="' + u.hace + '">' +
             '<b>' + u.nombre + '</b><span class="rol">' + u.titulo + '</span>' +
           '</span>' +
           '<a class="hbtn" href="' + (destinoInicio || "index.html?v=6") +
           '" style="text-decoration:none" title="Cambiar de usuario">Cambiar</a>';
  }

  g.IAgUsuario = {
    USUARIOS: USUARIOS, PERMISOS: PERMISOS,
    actual: actual, entrar: entrar, salir: salir, puede: puede, puedeEnZona: puedeEnZona, barra: barra,
  };
})(window);
