export const TABLE_TYPES = ["text", "integer", "blob", "any"];
export const TABLE_CONSTRAINTS = ["PRIMARY KEY", "NOT NULL", "UNIQUE"];
export function inputTypeByType(type) {
  switch (type) {
    case "text":
      return "text";
    case "integer":
      return "number";
    case "blob":
      return "file";
    case "any":
      return "text";
    default:
      return "text";
  }
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
