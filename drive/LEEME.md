# Conectar I.Ag con el Drive

La app guarda todo en cada equipo y lo sincroniza con **una planilla de Google** en
tu Drive, a través de un Apps Script (un programa chico dentro de la planilla).
La app no inicia sesión en Google: le habla al Apps Script con una clave.

## Una sola vez: armar la planilla (5 minutos)

1. En drive.google.com: **Nuevo → Hojas de cálculo de Google**. Ponele de nombre
   `I.Ag · datos`.
2. En la planilla: **Extensiones → Apps Script**.
3. Borrá lo que aparece y pegá todo el contenido de [`Code.gs`](Code.gs).
4. En la línea `const CLAVE = "cambiar-esta-clave";` poné una clave tuya
   (por ejemplo, tres palabras: `soja-mistol-2027`). Guardá (ícono del disquete).
5. **Implementar → Nueva implementación**. En el engranaje elegí **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. **Implementar**. Google pide autorizar: elegí tu cuenta → *Configuración avanzada*
   → *Ir a (no seguro)* → *Permitir*. Es tu propio script.
7. Copiá la **URL de la aplicación web** (termina en `/exec`).

## En la Mac

1. Abrí la app con `servir.command` y entrá a **Conectar con el Drive**
   (al pie del inicio).
2. Pegá la URL y la clave → **Guardar y probar**. Tiene que decir
   «Conectado a la planilla I.Ag · datos».
3. **Subir los datos de este equipo al Drive**: sube lotes, historial y presupuesto
   base (no van a GitHub).
4. Copiá el **enlace para conectar otro equipo** y mandalo por WhatsApp.

## En los otros equipos

Abren el enlace. Queda conectado, baja los datos de la empresa una vez y desde ahí
sincroniza solo. Abajo a la izquierda se ve el estado: *Sincronizado 10:42*,
*3 cambios por subir*, *Sin señal*…

## Cosas a saber

- **Quien tiene el enlace (con la clave) puede leer y escribir.** Para la prueba alcanza;
  para producción, ver el plan (Cloudflare Access).
- La hoja `registros` nunca se edita: cada cambio es una fila nueva. Se puede mirar,
  pero **no la toques a mano**.
- Si cambiás `Code.gs`: **Implementar → Administrar implementaciones → editar →
  Versión: nueva**. Así la URL no cambia.
- Si cambiás la clave, hay que volver a conectar todos los equipos (nuevo enlace).
