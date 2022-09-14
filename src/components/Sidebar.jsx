import Nullstack from "nullstack";

class Sidebar extends Nullstack {
  list = null;

  async getDatabases({ __tableland }) {
    this.list = await __tableland.list();
  }

  hydrate() {
    this.getDatabases();
  }

  renderListItem({ name, params }) {
    const style = params.name === name ? "color: #762fbe; font-weight: bold;" : "";
    return (
      <a style={style} href={`/schema?name=${name}`}>
        {name}
      </a>
    );
  }

  logout(context) {
    localStorage.clear();
    context.__tableland = undefined;
  }

  render() {
    return (
      <aside class="w-full max-w-[350px] px-8 py-8 flex flex-col border-r h-full justify-between overflow-x-scroll">
        <div class="flex flex-col gap-12 pr-5">
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
        </div>
        <button class="btn-primary" onclick={this.logout}>
          Logout
        </button>
      </aside>
    );
  }
}

export default Sidebar;
