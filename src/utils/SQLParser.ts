import { SchemaColumns } from "@tableland/sdk";
import { TABLE_TYPES } from "./TableTypes";
import {Column} from "../types/columns"


export function parseCreateTable(columns: Column[]) {
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

export const parseCreateTableSQL = (columns: Column[], tableName: string) => {
  return `CREATE TABLE ${tableName} ${parseCreateTable(columns)}`;
};

export const parseId = (column: Column, id: any): number | string => {
  let parseId: number | string | null = null
  switch (column.type) {
    case "integer":
      parseId = (parseInt(id) || "NULL");
      break;
    default:
      parseId = (`'${id}'` || "NULL");
  }
  return parseId;
}


export const parseValues = (column) => {
  let value: number | string | null = null;
  switch (column.type) {
    case "integer":
      value = column.value ? parseInt(column.value) : "NULL";
      break;
    default:
      value = column.value ? `'${column.value}'` : "NULL";
  }
  return value;
};

export const parseInsertData = (columns: Column[], tableName: string) => {
  const values = `(${columns.map((column) => parseValues(column)).join(", ")})`;
  const cols = columns.map((column) => column.name).join(", ");
  const insertTemplate = `INSERT INTO ${tableName} (${cols}) VALUES ${values};`;
  return insertTemplate;
};

export const parseUpdateData = (
  columns: Column[],
  tableName: string,
  id: number,
  idColumn: string
) => {
  const values = `${columns
    .map((column) => `${column.name} = ${parseValues(column)}`)
    .join(", ")}`;
  const idField = columns.find(col => col.name == idColumn)
  const updateTemplate = `UPDATE ${tableName} SET ${values}  WHERE ${idColumn} = ${parseId(idField!, id)};`;
  return updateTemplate;
};

export const parseDeleteData = (
  tableName: string,
  id: number,
  idColumn: string
) => {
  const deleteTemplate = `DELETE FROM ${tableName} WHERE ${idColumn} = ${id};`;
  return deleteTemplate;
};

export const hasPK = (columns: Column[], tableName: string) => {
  const pkFields = columns.filter(
    (v) => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1
  );
  if (pkFields.length > 1) {
    throw new Error(`Table ${tableName} must have only one primary key`);
  }
  if (!pkFields.length) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields[0];
};

export const getPKColumn = (columns: SchemaColumns, tableName: string) => {
  const pkFields = (columns || []).find(
    (v) => (v.constraints || []).indexOf("PRIMARY KEY") != -1
  );
  if (!pkFields) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields.name;
};

export const getPKColumnIndex = (columns: SchemaColumns) => {
  const index = (columns || [])
    .map((v) => (v.constraints || []).indexOf("PRIMARY KEY") != -1)
    .indexOf(true);
  return index;
};

export const hasColumnTypeAsColumnName = (columns: Column[]) => {
  const table_types = TABLE_TYPES.map((v) => v.toLocaleLowerCase());
  const hasColumnTypeAsName = (columns || []).find(
    (v) => table_types.indexOf(v.name.toLocaleLowerCase()) != -1
  );
  if (hasColumnTypeAsName) {
    throw new Error(
      `Column ${hasColumnTypeAsName.name} has an invalid column name. Column names should not be equal to column types`
    );
  }
};
export const parseTableName = (chainId: number, tableName: string) => {
  return [
    (tableName || "").replace(
      new RegExp(`_[${chainId}]+[0-9A-Za-z_]+`, "g"),
      ""
    ),
  ].reduce((acc, v) => (v ? v : acc), tableName);
};

export const isReadQuery = (query: string) => {
  return !!((query || "").toLocaleLowerCase().match(/select/) || []).length;
};


export const countQuery = (columns: SchemaColumns, tableName: string) => {
  const column = columns[0]
  const name = column.name
  return `SELECT count(${name}) from ${tableName};`
}