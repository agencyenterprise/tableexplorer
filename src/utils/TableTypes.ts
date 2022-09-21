export const TABLE_TYPES: string[] = ["text", "integer", "blob", "any"];
export const TABLE_CONSTRAINTS: string[] = ["PRIMARY KEY", "NOT NULL", "UNIQUE"];
export const TABLE_PERMISSIONS: string[] = ["INSERT", "UPDATE", "DELETE"];

export function inputTypeByType(type: string) {
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

