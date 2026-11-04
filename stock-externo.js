// Stock real que TPA pega en la planilla «Stock Tarpuy» (4/11). La app la lee
// (por el Apps Script, acción «stockExterno») y la usa para ver el stock al
// armar una orden de trabajo. El resto de la app sigue con sus movimientos.
//
// La planilla tiene una fila de encabezado que empieza con «Producto», «Tipo»,
// «Unid» y después una columna por depósito de Lajitas hasta «Total Tarpuy
// Lajitas». Más a la derecha están el aporte del socio pendiente de retirar
// y el stock de El Mistol. Las columnas se buscan por nombre: si TPA agrega
// un depósito entre «Unid» y «Total Tarpuy Lajitas», entra solo.
(function (g) {
  "use strict";

  var slug = function (t) {
    return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };
  /** 4140 · «4.140,00» · «-» (cero) · «» → número. */
  var num = function (v) {
    if (typeof v === "number") return v;
    var t = String(v == null ? "" : v).trim();
    if (!t || /^-+$/.test(t)) return 0;
    if (t.indexOf(",") !== -1) t = t.replace(/\./g, "").replace(",", ".");
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  };

  var TIPOS = {
    herbicida: "Herbicida", insecticida: "Insecticida", fungicida: "Fungicida", coadyuvante: "Coadyuvante",
    curasemilla: "Curasemilla", semilla: "Semilla", fertilizante: "Fertilizante", inoculante: "Inoculante",
  };
  function tipoDe(t) { return TIPOS[slug(t)] || "Otro"; }
  function unidadDe(u) {
    var s = slug(u);
    if (/^(l|lt|lts|litro|litros)$/.test(s)) return "L";
    if (/^(kg|kgs|kilo|kilos)$/.test(s)) return "kg";
    if (/^bolsa/.test(s)) return "bolsa";
    if (/^(u|un|unidad|unidades)$/.test(s)) return "unidad";
    return "L";
  }

  /**
   * Las filas de la planilla (getValues) → {depositos, productos}.
   *   depositos: nombres de las columnas de Lajitas («LYC», «BAYA CASAL», …)
   *   productos: [{nombre, tipo, unidad, lajitas: {columna: cant}, aporteLajitas, mistol}]
   */
  function leer(valores) {
    var filas = valores || [];
    var h = -1;
    for (var i = 0; i < filas.length; i++) {
      if (slug(filas[i][0]) === "producto") { h = i; break; }
    }
    if (h < 0) return { depositos: [], productos: [], error: "No encontré la fila de encabezado («Producto» en la columna A)" };
    var enc = filas[h].map(function (c) { return String(c || "").trim(); });
    var col = function (nombre) {
      var s = slug(nombre);
      for (var j = 0; j < enc.length; j++) if (slug(enc[j]) === s) return j;
      return -1;
    };
    var cTipo = col("Tipo"), cUnid = col("Unid"), cTotal = col("Total Tarpuy Lajitas");
    var cAporte = col("Pendiente retirar Lajitas"), cMistol = col("Stock Deposito El Mistol");
    var desde = Math.max(cTipo, cUnid) + 1, hasta = cTotal > 0 ? cTotal : desde;
    var deps = [];
    for (var k = desde; k < hasta; k++) if (enc[k]) deps.push({ col: k, nombre: enc[k] });

    var productos = [];
    filas.slice(h + 1).forEach(function (f) {
      var nombre = String(f[0] == null ? "" : f[0]).trim();
      if (!nombre) return;
      var lajitas = {};
      deps.forEach(function (d) { var v = num(f[d.col]); if (v) lajitas[d.nombre] = v; });
      productos.push({
        nombre: nombre, tipo: tipoDe(cTipo >= 0 ? f[cTipo] : ""), unidad: unidadDe(cUnid >= 0 ? f[cUnid] : ""),
        lajitas: lajitas, aporteLajitas: cAporte >= 0 ? num(f[cAporte]) : 0, mistol: cMistol >= 0 ? num(f[cMistol]) : 0,
      });
    });
    return { depositos: deps.map(function (d) { return d.nombre; }), productos: productos };
  }

  g.IAgStockExterno = { leer: leer, slug: slug, num: num };
})(window);
