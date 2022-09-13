import Nullstack from "nullstack";
import querystring from "query-string";

class Sidebar extends Nullstack {
  list = null;

  async getDatabases({ __tableland }) {
    this.list = await __tableland.list();
  }

  hydrate() {
    this.getDatabases();
  }

  renderListItem({ name }) {
    const query = querystring.parse(window.location.search);
    const style = query.name === name ? "font-weight: bold;" : "";
    return (
      <a style={style} href={`/table?name=${name}`}>
        {name}
      </a>
    );
  }

  render() {
    console.log("List", this.list);
    return (
      <aside class="w-full max-w-[300px] px-8 py-8 flex flex-col gap-12 border-r h-full">
        {this.list && (
          <nav class="flex flex-col gap-2">
            {this.list.map((list) => (
              <ListItem name={list.name} />
            ))}
          </nav>
        )}
        <a href="/addTable" class="btn-primary">
          + Add Table
        </a>
      </aside>
    );
  }
}

export default Sidebar;
