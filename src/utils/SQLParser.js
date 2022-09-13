//const columns = [{ type: "integer", name: "id" }];

export function parseCreateTable(columns) {
  let query = "";

  const cols = columns.map((column) => `${column.name} ${column.type}`);

  query += cols.join(",");

  return query;
}
