export interface Capacitador {
  // Posibles nombres según lo que devuelva el backend o las convenciones en JS
  ID_Capacitador?: number;
  ID?: number;
  id?: number;

  nombre?: string; // convención frontend
  Nombre?: string; // convención desde Sequelize/backend
}