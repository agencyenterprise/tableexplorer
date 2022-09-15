import Nullstack from "nullstack";
import HomeIcon from "./Home";

class Sidebar extends Nullstack {
  list = null;

  static async getTablesFromDb({ prisma, signerAddress }) {
    const list = await prisma.tableUser.findMany({
      where: {
        userAddress: signerAddress,
      },
    });

    return list.map((item) => ({
      name: item.tableName,
      imported: true,
    }));
  }

  async getDatabases({ __tableland }) {
    const listFromDB = this.getTablesFromDb({
      signerAddress: __tableland.signerAddress,
    });
    const listFromChain = await __tableland.list();

    const lists = await Promise.all([listFromDB, listFromChain]);

    this.list = lists.flat().sort((a, b) => a.name.localeCompare(b.name));
  }

  hydrate() {
    this.getDatabases();
  }

  renderListItem({ name, params }) {
    const style =
      params.name === name ? "color: #762fbe; font-weight: bold;" : "";
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

  render({ __tableland }) {
    return (
      <aside class="w-full max-w-[350px] px-6 pt-2 pb-6 flex flex-col border-r h-full justify-between overflow-x-scroll">
        <div class="flex flex-col gap-12 pr-3">
          <a href="/">
            <div class="flex justify-center items-center flex-col py-0">
              <p class="flex flow-row">
                <HomeIcon class="pr-3" width={35} height={35} />
              </p>
              {[
                __tableland.signerAddress.substring(0, 4),
                __tableland.signerAddress.substring(
                  __tableland.signerAddress.length - 5,
                  __tableland.signerAddress - 1
                ),
              ].join("...")}
            </div>
          </a>

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
