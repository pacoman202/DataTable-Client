# DataTable

Proyecto DataTable realizado con jQuery..

Su proposito es que en base a una tabla ya definida alterar su forma y generar un paginador, busqueda instantanea, ordenamiento por columna, diseño responsive y diferentes temas de colores para su visualización.

Debido a que esta realizado puramente desde el cliente, no utiliza una api para funcionar por lo que no es recomendable utilizarse en tablas con gran cantidad de datos.

## Generación del DataTable

```javascript
// @param id Id de la tabla a la que se le aplicara el DataTable
// @param theme Tema de colores para aplicar a la tabla, por defecto es gray
const dataTable = new DataTable("#idTabla");
```
