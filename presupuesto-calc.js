// Cálculo del presupuesto, compartido por presupuesto.html y flujo.html.
// Es código, no datos: los datos están en presupuesto-tarpuy.js (la base de
// los Excel) y en el navegador (lo editado), con la clave iag_presupuesto_v1.
(function (g) {
  "use strict";

  var KEY = "iag_presupuesto_v1";
  var num = function (v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; };
  var copia = function (x) { return JSON.parse(JSON.stringify(x)); };
  var otra = function (r) { return r === "NORTE" ? "RESTO" : "NORTE"; };

  /** El presupuesto editado en este equipo o, si no hay, la base de los Excel. */
  function cargar() {
    var base = g.PRESUPUESTO_BASE || { lotes: [], modelos: {}, precios: {}, siembra: {} };
    var P = null;
    try { P = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { P = null; }
    if (!P || !P.lotes) P = { lotes: copia(base.lotes), modelos: copia(base.modelos), precios: copia(base.precios) };
    if (!P.siembra) P.siembra = copia(base.siembra || {});
    P.lotes.forEach(function (l, i) {
      if (!l.uid) l.uid = "p" + i;
      l.modelos = l.modelos || {};
      l.siembra = l.siembra || {};
    });
    return P;
  }

  /** Modelo de un cultivo en una región; si esa región no lo tiene, el de la otra. */
  function claveModelo(P, cultivo, region) {
    if (P.modelos[cultivo + "|" + region]) return cultivo + "|" + region;
    if (P.modelos[cultivo + "|" + otra(region)]) return cultivo + "|" + otra(region);
    return "";
  }
  function precioDe(P, pa) { return P.precios[pa] ? num(P.precios[pa].precio) : 0; }
  function porHa(x) { return num(x.sup) * num(x.dosis) * (num(x.apl) || 1); }

  /** Manejo de un cultivo en un lote: su versión propia, o el modelo general. */
  function lineasDe(P, l, c) {
    if (l.modelos && l.modelos[c]) return l.modelos[c];
    var k = claveModelo(P, c, l.region);
    return k ? P.modelos[k] : [];
  }

  /** Lo que lleva un lote: el manejo de cada uno de sus cultivos × su superficie. */
  function detalleLote(P, l) {
    var items = [];
    [l.c1, l.c2].filter(Boolean).forEach(function (c) {
      lineasDe(P, l, c).forEach(function (x) {
        var cant = porHa(x) * num(l.ha);
        items.push({ pa: x.pa, unidad: x.unidad, familia: x.familia, momento: x.momento, cultivo: c,
                     cant: cant, costo: cant * precioDe(P, x.pa), propio: !!(l.modelos && l.modelos[c]) });
      });
    });
    var costo = items.reduce(function (s, x) { return s + x.costo; }, 0);
    return { items: items, costo: costo, porHa: num(l.ha) ? costo / num(l.ha) : 0 };
  }

  /** Fecha de siembra de un cultivo en un lote: la del lote, o la del cultivo en su región. */
  function fechaSiembra(P, l, c) {
    if (l.siembra && l.siembra[c]) return l.siembra[c];
    var s = P.siembra || {};
    var x = s[c + "|" + l.region] || s[c + "|" + otra(l.region)];
    return x ? x.fecha : "";
  }

  // Días entre la siembra y el desecante, por cultivo (METODO del Excel de manejo)
  var DESECANTE = { "Poroto": 75, "Mungo": 60, "Soja": 100, "Chía": 100, "Maíz": 120, "Maíz+brachiaria": 120 };

  /**
   * Cuántos días antes (−) o después (+) de la siembra se necesita el producto
   * de un momento del modelo. Se toma el COMIENZO de la ventana: es la fecha en
   * que el producto ya tiene que estar.
   *   "−60 a −7 d · Presiembra" → −60     "Más de +30 d · Post tardío" → +30
   *   "Desecantes · Precosecha" → días al desecante del cultivo
   *   "Toda la campaña" → semilla a la siembra (0); coadyuvantes desde la primera aplicación (−60)
   */
  function diasDesdeSiembra(momento, familia, cultivo) {
    var m = String(momento || "").replace(/−/g, "-");
    if (/desecante|precosecha/i.test(m)) return DESECANTE[cultivo] || 100;
    if (/toda la campa/i.test(m)) return familia === "Semilla" ? 0 : -60;
    var n = m.match(/[+-]?\d+/);
    return n ? parseInt(n[0], 10) : 0;
  }

  function sumarDias(iso, dias) {
    if (!iso) return "";
    var d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  /**
   * Cada insumo del presupuesto con la fecha en que se necesita:
   * [{pa, unidad, familia, fecha, cant, costo, lote, cultivo, region}].
   * Sin fecha de siembra, la fecha queda vacía.
   */
  function necesidades(P) {
    var out = [];
    P.lotes.forEach(function (l) {
      detalleLote(P, l).items.forEach(function (it) {
        if (!it.pa || it.cant <= 0) return;
        var siembra = fechaSiembra(P, l, it.cultivo);
        out.push({ pa: it.pa, unidad: it.unidad, familia: it.familia, cant: it.cant, costo: it.costo,
                   fecha: sumarDias(siembra, diasDesdeSiembra(it.momento, it.familia, it.cultivo)),
                   lote: l.nombre, cultivo: it.cultivo, region: l.region });
      });
    });
    return out;
  }

  g.IAgPresupuesto = {
    KEY: KEY, cargar: cargar, claveModelo: claveModelo, precioDe: precioDe, porHa: porHa,
    lineasDe: lineasDe, detalleLote: detalleLote, fechaSiembra: fechaSiembra,
    diasDesdeSiembra: diasDesdeSiembra, sumarDias: sumarDias, necesidades: necesidades,
  };
})(window);
