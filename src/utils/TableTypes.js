export const TABLE_TYPES = ["text", "integer", "blob", "any"];

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
