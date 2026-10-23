// Campos de Tarpuy y su zona. Público: no tiene datos de producción.
// Sirve para que la app ande (zonas, mapa) sin el historial de aplicaciones,
// que es privado y se baja de la planilla del Drive.
window.CAMPOS_TARPUY = {"Tarpuy-LI": {"nombre": "La Iluminada", "zona": "NORTE"}, "Tarpuy-EM": {"nombre": "El Mistol", "zona": "NORTE"}, "Tarpuy-ML": {"nombre": "Media Luna", "zona": "LAJITAS"}, "Tarpuy-BE": {"nombre": "Buenaesperanza", "zona": "LAJITAS"}, "Tarpuy-SE": {"nombre": "Santa Escolastica", "zona": "LAJITAS"}, "Tarpuy-SF": {"nombre": "San Florian", "zona": "LAJITAS"}, "Tarpuy-EG": {"nombre": "El Guayacan", "zona": "LAJITAS"}};
// Si el historial no se cargó, se arma su parte pública con esto
window.APLIC_META = window.APLIC_META || { campos: window.CAMPOS_TARPUY };

// Lotes sin dibujo en el mapa (23/10): las banquinas de La Iluminada y de El
// Mistol. Sin superficie fija: la orden pide las hectáreas a mano.
window.LOTES_SIN_MAPA = [
  { id: "LIBANQ", nombre: "LIBANQ", campo: "Tarpuy-LI", ha: 0, anillos: [], sinMapa: true, detalle: "Banquinas de La Iluminada" },
  { id: "EMBANQ", nombre: "EMBANQ", campo: "Tarpuy-EM", ha: 0, anillos: [], sinMapa: true, detalle: "Banquinas de El Mistol" },
];
if (Array.isArray(window.LOTES)) {
  window.LOTES_SIN_MAPA.forEach(function (l) {
    if (!window.LOTES.some(function (x) { return x.id === l.id; })) window.LOTES.push(l);
  });
}
