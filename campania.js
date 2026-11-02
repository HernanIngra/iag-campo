// Campaña agrícola y cultivo de cada lote, compartidos por el mapa y las órdenes.
// Es código, no datos: va público.
(function (g) {
  "use strict";

  // TPA corta la campaña el 1/10 (cierre de ejercicio, 2/11). Otro productor
  // puede usar otra fecha: se cambia acá y vale para toda la app.
  var INICIO = { mes: 10, dia: 1 };

  var dos = function (n) { return String(((n % 100) + 100) % 100).padStart(2, "0"); };

  /** «2026-10-05» → «26-27»; «2026-09-30» → «25-26». */
  function de(fecha) {
    var f = String(fecha || "");
    if (!/^\d{4}-\d{2}-\d{2}/.test(f)) return "";
    var y = +f.slice(0, 4), m = +f.slice(5, 7), d = +f.slice(8, 10);
    var ini = m > INICIO.mes || (m === INICIO.mes && d >= INICIO.dia) ? y : y - 1;
    return dos(ini) + "-" + dos(ini + 1);
  }
  function hoy() {
    var d = new Date();
    return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
  }
  function actual() { return de(hoy()); }
  /** «26-27» → «2026-10-01»: el primer día de esa campaña. */
  function inicio(c) {
    var y = 2000 + Number(String(c || actual()).slice(0, 2));
    return y + "-" + dos(INICIO.mes) + "-" + dos(INICIO.dia);
  }

  /**
   * El cultivo sembrado en un lote esta campaña: el de su última orden de
   * siembra ya aplicada. Antes de sembrar no hay (vale el presupuestado).
   * S es el estado del stock (iag_stock_v2).
   */
  function sembrado(S, loteId) {
    var desde = inicio(actual()), mejor = null;
    ((S && S.ordenes) || []).forEach(function (o) {
      if (o.prueba || o.estado !== "aplicada" || !/siembra/i.test(o.labor || "")) return;
      if (!(o.lotes || []).some(function (x) { return x.loteId === loteId; })) return;
      var f = o.fechaAplicacion || o.fecha || "";
      if (f < desde || (mejor && f <= mejor.fecha)) return;
      mejor = { cultivo: o.cultivo || "", variedad: o.variedad || "", fecha: f, ot: o.numero };
    });
    return mejor && mejor.cultivo ? mejor : null;
  }

  g.IAgCampania = { INICIO: INICIO, de: de, actual: actual, inicio: inicio, sembrado: sembrado };
})(window);
