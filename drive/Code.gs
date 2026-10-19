/**
 * I.Ag · intermediario entre la app y la planilla del Drive.
 *
 * Se pega en la planilla (Extensiones → Apps Script) y se publica como
 * aplicación web. La app no inicia sesión en Google: le habla a esta
 * dirección con una clave compartida. Ver drive/LEEME.md.
 *
 * Hojas que crea solo:
 *   registros  una fila por cambio: rev · tabla · id · actualizado · usuario · borrado · json
 *              Nunca se edita ni se borra una fila: se agrega otra. La última
 *              revisión de cada (tabla, id) es la que vale.
 *   archivos   los datos de la empresa (lotes, historial, presupuesto base),
 *              en partes de 45.000 caracteres (el límite de una celda es 50.000).
 */

// La clave que también va en la app. Cambiala antes de publicar.
const CLAVE = "cambiar-esta-clave";

const PARTE = 45000;

function hoja_(nombre, encabezado) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(nombre);
  if (!h) {
    h = libro.insertSheet(nombre);
    // Todo como texto: si no, la planilla convierte ids como "12e45" en número
    // y fechas ISO en fechas
    h.getRange(1, 1, h.getMaxRows(), encabezado.length).setNumberFormat("@");
    h.appendRow(encabezado);
    h.setFrozenRows(1);
  }
  return h;
}
const registros_ = () => hoja_("registros", ["rev", "tabla", "id", "actualizado", "usuario", "borrado", "json"]);
const archivos_ = () => hoja_("archivos", ["nombre", "parte", "contenido", "subido"]);

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Lectura: cambios desde una revisión, o un archivo de datos. */
function doGet(e) {
  const p = e.parameter || {};
  if (p.clave !== CLAVE) return respuesta_({ ok: false, error: "clave" });

  if (p.accion === "archivo") {
    const filas = archivos_().getDataRange().getValues().slice(1)
      .filter((f) => f[0] === p.nombre)
      .sort((a, b) => Number(a[1]) - Number(b[1]));
    if (!filas.length) return respuesta_({ ok: false, error: "no hay archivo " + p.nombre });
    return respuesta_({ ok: true, nombre: p.nombre, subido: filas[0][3], contenido: filas.map((f) => f[2]).join("") });
  }

  if (p.accion === "cambios") {
    const desde = Number(p.desde || 0);
    const h = registros_();
    const n = h.getLastRow() - 1;
    if (n <= 0) return respuesta_({ ok: true, rev: 0, registros: [] });
    // rev = número de fila − 1: lo nuevo está al final, no hace falta leer todo
    const desdeFila = Math.max(2, desde + 2);
    const filas = desdeFila > h.getLastRow() ? [] : h.getRange(desdeFila, 1, h.getLastRow() - desdeFila + 1, 7).getValues();
    return respuesta_({
      ok: true, rev: n,
      registros: filas.map((f) => ({ rev: Number(f[0]), tabla: f[1], id: String(f[2]), actualizado: f[3], usuario: f[4], borrado: String(f[5]).toUpperCase() === "TRUE", json: f[6] })),
    });
  }

  if (p.accion === "probar") return respuesta_({ ok: true, planilla: SpreadsheetApp.getActiveSpreadsheet().getName() });
  return respuesta_({ ok: false, error: "acción desconocida" });
}

/**
 * Escritura. El cuerpo llega como texto (Content-Type text/plain): así el
 * navegador no hace la consulta previa de CORS, que Apps Script no contesta.
 */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return respuesta_({ ok: false, error: "json" }); }
  if (d.clave !== CLAVE) return respuesta_({ ok: false, error: "clave" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.accion === "guardar") {
      const h = registros_();
      let rev = h.getLastRow() - 1;
      const filas = (d.registros || []).map((r) => {
        rev += 1;
        const json = r.borrado ? "" : JSON.stringify(r.valor);
        if (json.length > 49000) throw new Error("registro demasiado grande: " + r.tabla + " " + r.id);
        return [String(rev), r.tabla, String(r.id), r.actualizado || new Date().toISOString(), d.usuario || "", r.borrado ? "TRUE" : "FALSE", json];
      });
      if (filas.length) h.getRange(h.getLastRow() + 1, 1, filas.length, 7).setNumberFormat("@").setValues(filas);
      return respuesta_({ ok: true, rev: rev });
    }

    if (d.accion === "archivo") {
      const h = archivos_();
      // Se reemplaza entero: primero se borran las partes viejas de ese archivo
      const vals = h.getDataRange().getValues();
      for (let i = vals.length - 1; i >= 1; i--) if (vals[i][0] === d.nombre) h.deleteRow(i + 1);
      const texto = String(d.contenido || "");
      const ahora = new Date().toISOString();
      const partes = [];
      for (let i = 0, n = 0; i < texto.length; i += PARTE, n++) partes.push([d.nombre, String(n), texto.slice(i, i + PARTE), ahora]);
      if (partes.length) h.getRange(h.getLastRow() + 1, 1, partes.length, 4).setNumberFormat("@").setValues(partes);
      return respuesta_({ ok: true, nombre: d.nombre, partes: partes.length, caracteres: texto.length });
    }

    return respuesta_({ ok: false, error: "acción desconocida" });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}
