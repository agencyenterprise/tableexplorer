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

export const parseValues = (column) => {
  let value = null;
  switch (column.type) {
    case "integer":
      value = parseInt(column.value);
      break;
    default:
      value = `'${column.value}'`;
  }
  return value;
}

export const parseInsertData = (columns, tableName) => {
  const values = `(${columns.map((column) => parseValues(column)).join(", ")})`;
  const cols = columns.map((column) => column.name).join(", ");
  const insertTemplate = `INSERT INTO ${tableName} (${cols}) VALUES ${values};`;
  return insertTemplate;
}

export const parseUpdateData = (columns, tableName, id) => {
  const values = `${columns.map((column) => `${column.name} = ${parseValues(column)}`).join(", ")}`;
  const updateTemplate = `UPDATE ${tableName} SET ${values}  WHERE id = ${id};`;
  return updateTemplate;
}

export const parseDeleteData = (tableName, id) => {
 const deleteTemplate = `DELETE FROM ${tableName} WHERE id = ${id};`
 return deleteTemplate
}

export const hasPK = (columns, tableName) => {
  console.log(columns)
  const pkFields = columns.filter(v => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1)
  if (pkFields.length > 1){
    throw new Error(`Table ${tableName} must have only one primary key`)
  }
  if (!pkFields.length) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields[0]
}