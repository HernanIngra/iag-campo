// Campos de Tarpuy y su zona. Público: no tiene datos de producción.
// Sirve para que la app ande (zonas, mapa) sin el historial de aplicaciones,
// que es privado y se baja de la planilla del Drive.
window.CAMPOS_TARPUY = {"Tarpuy-LI": {"nombre": "La Iluminada", "zona": "NORTE"}, "Tarpuy-EM": {"nombre": "El Mistol", "zona": "NORTE"}, "Tarpuy-ML": {"nombre": "Media Luna", "zona": "LAJITAS"}, "Tarpuy-BE": {"nombre": "Buenaesperanza", "zona": "LAJITAS"}, "Tarpuy-SE": {"nombre": "Santa Escolastica", "zona": "LAJITAS"}, "Tarpuy-SF": {"nombre": "San Florian", "zona": "LAJITAS"}, "Tarpuy-EG": {"nombre": "El Guayacan", "zona": "LAJITAS"}};
// Si el historial no se cargó, se arma su parte pública con esto
window.APLIC_META = window.APLIC_META || { campos: window.CAMPOS_TARPUY };
