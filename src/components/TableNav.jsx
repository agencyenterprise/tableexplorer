import Nullstack from "nullstack";

function getActiveStyle(path, route) {
  if (path === route) return "border-bottom: 1px solid #fff;";
  return "";
}

class TableNav extends Nullstack {
  route = "";
  query = "";

  initiate({ router }) {
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
