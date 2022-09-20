import { TABLE_TYPES } from "./TableTypes";

export function parseCreateTable(columns) {
  let query = "";

  const cols = columns.map(
    (column) =>
      `"${column.name}" ${column.type} ${column.constraints
        .map((c) => c.toLocaleLowerCase())
        .join(" ")}`
  );

  query += cols.join(", ");
  
  return query;
}

export const parseCreateTableSQL = (columns, tableName) => {
  return `CREATE TABLE ${tableName} ${parseCreateTable(columns)}`
}

export const parseValues = (column) => {
  let value = null;
  switch (column.type) {
    case "integer":
      value = column.value ? parseInt(column.value) : "NULL";
      break;
    default:
      value = column.value ? `'${column.value}'` : "NULL";
  }
  return value;
}

export const parseInsertData = (columns, tableName) => {
  const values = `(${columns.map((column) => parseValues(column)).join(", ")})`;
  const cols = columns.map((column) => column.name).join(", ");
  const insertTemplate = `INSERT INTO ${tableName} (${cols}) VALUES ${values};`;
  return insertTemplate;
}

export const parseUpdateData = (columns, tableName, id, idColumn) => {
  const values = `${columns.map((column) => `${column.name} = ${parseValues(column)}`).join(", ")}`;
  const updateTemplate = `UPDATE ${tableName} SET ${values}  WHERE ${idColumn} = ${id};`;
  return updateTemplate;
}

export const parseDeleteData = (tableName, id, idColumn) => {
 const deleteTemplate = `DELETE FROM ${tableName} WHERE ${idColumn} = ${id};`
 return deleteTemplate
}

export const hasPK = (columns, tableName) => {
  const pkFields = columns.filter(v => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1)
  if (pkFields.length > 1){
    throw new Error(`Table ${tableName} must have only one primary key`)
  }
  if (!pkFields.length) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields[0]
}

export const getPKColumn = (columns, tableName) => {
  const pkFields = (columns||[]).find(v => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1)
  if (!pkFields) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields.name
}

export const getPKColumnIndex = (columns) => {
  const index = (columns||[]).map(v => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1).indexOf(true)
  return index
}

export const hasColumnTypeAsColumnName = (columns) => {
  const table_types = TABLE_TYPES.map(v => v.toLocaleLowerCase())
  const hasColumnTypeAsName = (columns||[]).find(v => table_types.indexOf(v.name.toLocaleLowerCase()) != -1)
  if (hasColumnTypeAsName) {
    throw new Error(`Column ${hasColumnTypeAsName.name} has an invalid column name. Column names should not be equal to column types`)
  }
}
export const parseTableName = (chainId, tableName) => {
    return [(tableName || "").replace(new RegExp(`_[${chainId}]+[0-9A-Za-z_]+`,"g"), "")].reduce((acc, v) => v ? v : acc, tableName)
}


export const isReadQuery = (query) => {
  return !! ((query||"").toLocaleLowerCase().match(/select/) || []).length
}