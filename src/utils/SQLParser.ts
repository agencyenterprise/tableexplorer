import { SchemaColumns } from "@tableland/sdk";
import { TABLE_TYPES } from "./TableTypes";
import { Column } from "../types/columns";
import { Parser } from "node-sql-parser";
import { ColumnRef, Select, Column as SQLColumn, AST } from "node-sql-parser/types";

export function parseCreateTable(columns: Column[]) {
  let query = "";

  const cols = columns.map((column) => `"${column.name}" ${column.type} ${column.constraints.map((c) => c.toLocaleLowerCase()).join(" ")}`);

  query += cols.join(", ");

  return query;
}

export const parseCreateTableSQL = (columns: Column[], tableName: string) => {
  return `CREATE TABLE ${tableName} ${parseCreateTable(columns)}`;
};

export const parseId = (column: Column, id: any): number | string => {
  let parseId: number | string | null = null;
  switch (column.type) {
    case "integer":
      parseId = parseInt(id) || "NULL";
      break;
    default:
      parseId = `'${id}'` || "NULL";
  }
  return parseId;
};

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

export const parseUpdateData = (columns: Column[], tableName: string, id: number, idColumn: string) => {
  const values = `${columns.map((column) => `${column.name} = ${parseValues(column)}`).join(", ")}`;
  const idField = columns.find((col) => col.name == idColumn);
  const updateTemplate = `UPDATE ${tableName} SET ${values}  WHERE ${idColumn} = ${parseId(idField!, id)};`;
  return updateTemplate;
};

export const parseDeleteData = (tableName: string, id: number, idColumn: string) => {
  const deleteTemplate = `DELETE FROM ${tableName} WHERE ${idColumn} = ${id};`;
  return deleteTemplate;
};

export const hasPK = (columns: Column[], tableName: string) => {
  const pkFields = columns.filter((v) => Object.values(v.constraints).indexOf("PRIMARY KEY") != -1);
  if (pkFields.length > 1) {
    throw new Error(`Table ${tableName} must have only one primary key`);
  }
  if (!pkFields.length) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields[0];
};

export const getPKColumn = (columns: SchemaColumns, tableName: string) => {
  const pkFields = (columns || []).find((v) => (v.constraints || []).indexOf("PRIMARY KEY") != -1);
  if (!pkFields) {
    throw new Error(`Table '${tableName}' must have a primary key`);
  }
  return pkFields.name;
};

export const getPKColumnIndex = (columns: SchemaColumns) => {
  const index = (columns || []).map((v) => (v.constraints || []).indexOf("PRIMARY KEY") != -1).indexOf(true);
  return index;
};

export const hasColumnTypeAsColumnName = (columns: Column[]) => {
  const table_types = TABLE_TYPES.map((v) => v.toLocaleLowerCase());
  const hasColumnTypeAsName = (columns || []).find((v) => table_types.indexOf(v.name.toLocaleLowerCase()) != -1);
  if (hasColumnTypeAsName) {
    throw new Error(`Column ${hasColumnTypeAsName.name} has an invalid column name. Column names should not be equal to column types`);
  }
};
export const parseTableName = (chainId: number, tableName: string) => {
  return [(tableName || "").replace(new RegExp(`_[${chainId}]+[0-9A-Za-z_]+`, "g"), "")].reduce((acc, v) => (v ? v : acc), tableName);
};

export const isReadQuery = (query: string) => {
  return !!((query || "").toLocaleLowerCase().match(/\s*select\s+/) || []).length;
};

export const countQuery = (columns: SchemaColumns, tableName: string) => {
  const column = columns[0];
  const name = column.name;
  return `SELECT count(${name}) from ${tableName};`;
};

export const parseSelectQuery = (query: string) => {
  const OFFSET = "OFFSET";
  const LIMIT = "LIMIT";
  const qTrim = query.trim();
  const lastSemiColon = qTrim.lastIndexOf(";");
  const shouldDeleteLastSemiColon = lastSemiColon == qTrim.length - 1 ? ";" : "";
  const keywords = [...[OFFSET, LIMIT].map((v) => v), ...[OFFSET, LIMIT].map((v) => v.toLocaleLowerCase())];
  const removeOffsetLimit = () =>
    keywords.reduce((acc, v) => {
      acc = acc.replace(new RegExp(`${v}+\\s*[0-9]+`), "");
      return acc;
    }, query);
  return removeOffsetLimit().replace(shouldDeleteLastSemiColon, "").trim();
};

export const buildSelectQuery = (query: string, limit: number = 5, offset: number = 0) => {
  if (!isReadQuery(query)) {
    return query;
  }
  const parser = new Parser();
  const ast: AST | AST[] = parser.astify(query, { database: "sqlite" }) as Select;
  const limit_offset = {
    seperator: "offset",
    value: [
      { type: "number", value: limit },
      { type: "number", value: offset },
    ],
  };
  ast.limit = limit_offset;
  const sql = removeReplaceStatements(parser.sqlify(ast));
  const originalSQLHasJoin = !!removeReplaceStatements(query).match(/\s+JOIN\s+/g);
  const newSqlHasInnerJoin = !!sql.match(/\s+INNER\s+JOIN\s+/g);
  return originalSQLHasJoin && newSqlHasInnerJoin ? removeReplaceStatements(sql, true) : sql;
};

export const hasCountStatement = (query: string) => {
  return !!query.match(/count\s*\(/g);
};

export const hasSumStatement = (query: string) => {
  return !!query.match(/sum\s*\(/g);
};

export const hasJoinStatment = (query: string) => {
  return !!query.toLocaleUpperCase().match(/\s+JOIN\s+/g);
};

export const rawRecords = (query: string) => {
  const hasCount = () => hasCountStatement(query);
  const hasJoin = () => hasJoinStatment(query);
  const hasSum = () => hasSumStatement(query);
  const rules = [hasCount, hasJoin, hasSum];
  return rules.reduce((acc: boolean, v: () => boolean) => {
    acc = acc && !v();
    return acc;
  }, true);
};

export const removeReplaceStatements = (query: string, simpleJoin: boolean = false) => {
  let keywords = [
    { pattern: /COUNT\(/g, value: "count(" },
    { pattern: /AVG\(/g, value: "avg(" },
    { pattern: /SUM\(/g, value: "sum(" },
    { pattern: /MIN\(/g, value: "min(" },
    { pattern: /MAX\(/g, value: "max(" },
    { pattern: /\s+join\s+/g, value: " JOIN " },
  ];
  keywords = simpleJoin ? [...keywords, { pattern: /\s+INNER\s+JOIN\s+/g, value: " JOIN " }] : keywords;
  return keywords.reduce((acc: string, v: { pattern: RegExp; value: string }) => {
    acc = acc.replace(v.pattern, v.value);
    return acc;
  }, query);
};

export const isInsertRecord = (query: string) => {
  return !!query.match(/INSERT\s*/g);
};

export const isUpdateRecord = (query: string) => {
  return !!query.match(/UPDATE\s*/g);
};

export const isAggregatorOnly = (query: string) => {
  const parser = new Parser();
  const ast: AST | AST[] = parser.astify(query, { database: "sqlite" }) as Select;
  const hasColumnRef =
    ast.columns == "*"
      ? false
      : (Array.isArray(ast.columns) ? ast.columns : []).reduce((acc: boolean, v: SQLColumn) => {
          acc = v.expr.type == "aggr_func" && acc;
          return acc;
        }, true);
  return hasColumnRef;
};

export const parseCountQuery = (query: string) => {
  const parser = new Parser();
  const ast: AST | AST[] = parser.astify(query, { database: "sqlite" }) as Select;
  const colRefexpr = ((Array.isArray(ast.columns) ? ast.columns : []).find((v: SQLColumn) => v.expr.type == "column_ref") as ColumnRef) || {
    expr: {
      type: "star",
      value: "*",
    },
  };
  const countAst = {
    expr: {
      type: "aggr_func",
      name: "COUNT",
      args: colRefexpr,
    },
  } as SQLColumn;
  ast.columns = [countAst];
  ast.limit = null;
  const sql = removeReplaceStatements(parser.sqlify(ast));
  const originalSQLHasJoin = !!removeReplaceStatements(query).match(/\s+JOIN\s+/g);
  const newSqlHasInnerJoin = !!sql.match(/\s+INNER\s+JOIN\s+/g);
  return originalSQLHasJoin && newSqlHasInnerJoin ? removeReplaceStatements(sql, true) : sql;
};
