# La planilla de I.Ag

La app guarda todo en cada equipo y lo sincroniza con una planilla de Google, a
través de un programa chico dentro de la planilla (Apps Script, `Code.gs`).
Lo que se carga en la app aparece en la planilla, y **lo que se corrige o se
agrega a mano en la planilla aparece en la app** (en un minuto, aprox.).

## Pestañas

| Pestaña | Una fila por | Qué se hace a mano |
|---|---|---|
| **Movimientos** | Cada entrada o salida de un depósito | Cargar el **stock previo** (Tipo «Stock inicial»), corregir cantidades, ajustes |
| **OT** | Cada orden de trabajo | Cargar **órdenes ya ejecutadas** (Estado «Aplicada»), corregir datos |
| **OT_Productos** | Cada producto de cada orden | Los productos de esas órdenes |
| **Productos** | Cada producto | Envase, unidad, mínimo |
| **Depósitos** | Cada depósito | Zona y tipo |
| **Campos** | Cada campo | «En sociedad»: Sí / No |

Las dos últimas columnas de cada pestaña, **id** y **rev**, las completa el
programa: no se tocan. La columna **datos** (oculta) tampoco.

### Movimientos

| Columna | Qué va |
|---|---|
| Fecha | `2026-10-20` |
| Tipo | Stock inicial · Compra · Traslado · Retiro para aplicar · Aplicado · Devolución · Ajuste · Venta · Reingreso al Rincón |
| Producto | El nombre, igual que en Productos (si es nuevo, se crea) |
| Depósito | El Mistol · Lartirigoyen · Siner · NECA · Barracón · METAGRI · Agrolajitas · En tránsito |
| Cantidad | **Con signo**: `+` entra al depósito, `−` sale. Un traslado son dos filas (− en uno, + en el otro) |
| Envase | Cerrado o Rincón (envase abierto) |
| OT · Remito | La orden y el remito, si corresponde |
| Verificado | En compras: Sí / No (si alguien la vio en el galpón) |

Con una **tabla dinámica** sobre esta pestaña (filas: Producto · columnas:
Depósito · valores: suma de Cantidad, filtrando Anulado vacío) sale el stock
de cada depósito y el total.

### OT · estados

**Solicitada** → **Producto retirado** → **Aplicación reportada** (por el equipo) → **Aplicada** (confirmada por el encargado) → **Remanente devuelto**

Una orden ya ejecutada antes de usar la app se carga con Estado «Aplicada»,
los lotes como `EM10 (68 ha), EM11` y sus productos en OT_Productos (misma
OT). No mueve stock: se supone que el stock previo ya lo descuenta.

### Reglas

- **No borrar filas.** Para sacar algo, poner **Sí** en la columna **Anulado**.
- Las columnas se buscan por nombre: se pueden reordenar o agregar columnas propias.
- Los nombres (productos, depósitos, lotes) tienen que coincidir con los de la app.
  Mayúsculas y acentos no importan.

## Armar la planilla (una vez)

1. En la planilla: **Extensiones → Apps Script**. Pegar todo `Code.gs` y poner
   la clave en `const CLAVE = "…"`. Guardar.
2. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: **Yo** ·
   Acceso: **Cualquier persona**. Autorizar.
3. Copiar la URL (termina en `/exec`).

**Si se cambia `Code.gs`:** Implementar → **Administrar implementaciones** → lápiz
→ Versión: **Nueva versión** → Implementar. Así la URL sigue siendo la misma.

## Conectar los equipos

Cada equipo abre el **enlace para conectar** (lo arma la página *Conectar con el
Drive* de la app, o lo pasa quien ya está conectado). Queda conectado y baja
solo los datos de la empresa. Abajo a la izquierda se ve el estado:
*Sincronizado 10:42*, *3 cambios por subir*, *Sin señal*.

## Cosas a saber

- Quien tiene el enlace (con la clave) puede leer y escribir. Para la prueba alcanza.
- Si dos personas cambian la misma fila a la vez, queda la última.
- El historial y el presupuesto base viven en la pestaña `_archivos` (no se toca).
  El presupuesto editado y los pedidos, en `_registros` (tampoco).
