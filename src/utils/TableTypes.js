export const TABLE_TYPES = ["text", "integer", "blob", "any"];
export const TABLE_CONSTRAINTS = ["PRIMARY KEY", "NOT NULL", "UNIQUE"];
export const TABLE_PERMISSIONS = ["INSERT", "UPDATE", "DELETE"];

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
