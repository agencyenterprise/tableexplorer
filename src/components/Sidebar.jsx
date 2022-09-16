import Nullstack from "nullstack";
import HomeIcon from "./Home";
import { parseTableName } from "../utils/SQLParser";
import Loader from "../components/Loader";
class Sidebar extends Nullstack {
  tables = [];
  showInput = false;
  loading = false;
  tableToImport = "";

  static async tablesFromDb({ prisma, signerAddress }) {
    try {
      const tables = await prisma.tableUser.findMany({
        where: {
          userAddress: signerAddress,
        },
      });
      return tables.map((item) => ({
        name: item.tableName,
        imported: true,
      }));
    } catch (err) {
      console.log(err);
    }
    return [];
  }

  static async insertDbTable({ prisma, signerAddress, tableName }) {
    try {
      await prisma.tableUser.upsert({
        where: { tableName_userAddress: { tableName, userAddress: signerAddress } },
        create: {
          tableName,
          userAddress: signerAddress,
        },
        update: {},
      });
      return true;
    } catch (err) {
      console.log(err);
    }
    return false;
  }
  async importTable({ __tableland, instances }) {
    this.loading = true;
    this.showInput = !this.showInput;
    try {
      if (!this.showInput && this.tableToImport) {
        await this.insertDbTable({
          signerAddress: __tableland.signerAddress,
          tableName: this.tableToImport,
        });
        await this.getDatabases();
        instances.toast._showInfoToast(`Table imported with success!`);
      }
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }

  async getDatabases({ __tableland, instances }) {
    try {
      const listFromDB = this.tablesFromDb({
        signerAddress: __tableland.signerAddress,
      });
      const listFromChain = await __tableland.list();

      const tableList = await Promise.all([listFromDB, listFromChain]);
      this.tables = tableList
        .flat()
        .sort((a, b) => a?.name.localeCompare(b?.name))
        .filter((v) => !!v);
      return;
    } catch (err) {
      instances.toast._showErrorToast("Unexpected Error!");
    }
    this.tables = [];
  }

  hydrate({ __tableland }) {
    this.options = __tableland?.options;
    this.getDatabases();
  }

  renderListItem({ name, params }) {
    const style = params.name === name ? "color: #762fbe; font-weight: bold;" : "";
    return (
      <a style={style} href={`/table?name=${name}`} class="px-3">
        {parseTableName(this.options?.chainId, name)}
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
            <div class="flex justify-center items-center flex-col py-0" title={__tableland.signerAddress}>
              <p class="flex flow-row">
                <HomeIcon class="pr-3" width={35} height={35} />
              </p>
              {[
                __tableland.signerAddress.substring(0, 4),
                __tableland.signerAddress.substring(__tableland.signerAddress.length - 5, __tableland.signerAddress - 1),
              ].join("...")}
            </div>
          </a>

          {this.tables && (
            <nav class="flex flex-col gap-2 max-h-[300px] h-[300px] overflow-y-scroll border-solid border-slate-400 border py-2">
              {this.tables.map((list) => (
                <ListItem name={list.name} />
              ))}
            </nav>
          )}
          <a href="/addTable" class="btn-primary w-56">
            + Add Table
          </a>
          <div class="py-1">
            <input type="text" bind={this.tableToImport} placeholder="Table name" class="bg-background mb-4 w-56" hidden={!this.showInput} />
            <button class="btn-primary w-56" onclick={this.importTable} disabled={this.loading}>
              {this.loading ? <Loader width={38} height={38} /> : "Import Table"}
            </button>
          </div>
        </div>
        <button class="btn-primary w-56" onclick={this.logout}>
          Logout
        </button>
      </aside>
    );
  }
}

export default Sidebar;
