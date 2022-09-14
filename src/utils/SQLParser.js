// const columns = [{ type: "integer", name: "id", constraints: [] }];

export function parseCreateTable(columns) {
  let query = "";

  const cols = columns.map(
    (column) =>
      `${column.name} ${column.type} ${column.constraints
        .map((c) => c.toLocaleLowerCase())
        .join(" ")}`
  );

  query += cols.join(", ");

  return query;
}
