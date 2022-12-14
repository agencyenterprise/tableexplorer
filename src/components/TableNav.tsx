import Nullstack from "nullstack";
import { CustomServerContext } from "../types/CustomContexts";

function getActiveStyle(path, route) {
  if (path === route) return "border-bottom: 4px solid #404040;";
  return "";
}

class TableNav extends Nullstack {
  route = "";
  query = "";

  initiate({ router }: CustomServerContext) {
    let splittedRoute = router.url.split("?");
    this.route = splittedRoute[0];
    this.query = splittedRoute[1] || "";
  }

  render() {
    return (
      <nav class="flex justify-around w-full bg-background-secondary">
        <a class="py-4 w-full text-center" style={getActiveStyle("/table", this.route)} href={`/table?${this.query}`}>
          Data
        </a>
        <a class="py-4 w-full text-center" style={getActiveStyle("/schema", this.route)} href={`/schema?${this.query}`}>
          Schema
        </a>
        <a
          class="py-4 w-full text-center"
          style={getActiveStyle("/permissions", this.route)}
          href={`/permissions?${this.query}`}
        >
          Permissions
        </a>
      </nav>
    );
  }
}

export default TableNav;
