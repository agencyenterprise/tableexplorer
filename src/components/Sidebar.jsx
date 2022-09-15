import Nullstack from "nullstack";
import HomeIcon from "./Home";

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
      <a style={style} href={`/table?name=${name}`} class="px-3">
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
      <aside class="w-full max-w-[350px] px-6 pt-2 pb-6 flex flex-col border-r h-full justify-between overflow-x-scroll">
        <div class="flex flex-col gap-12 pr-3">
          <div class="flex justify-center py-0">
            <p class="flex flow-row">
              <a href="/" class="pr-3">
                <HomeIcon width={35} height={35} />
              </a>
            </p>
          </div>
          {this.list && (
            <nav class="flex flex-col gap-2 max-h-[300px] h-[300px] overflow-y-scroll border-solid border-slate-400 border py-2">
              {this.list.map((list) => (
                <ListItem name={list.name} />
              ))}
            </nav>
          )}
          <a href="/addTable" class="btn-primary w-56">
            + Add Table
          </a>
        </div>
        <button class="btn-primary w-56" onclick={this.logout}>
          Logout
        </button>
      </aside>
    );
  }
}

export default Sidebar;
