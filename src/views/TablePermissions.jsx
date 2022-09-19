import Nullstack from "nullstack";
import TableNav from "../components/TableNav";
import { TABLE_PERMISSIONS } from "../utils/TableTypes";
import { parseTableName } from "../utils/SQLParser";
import CodeEditor from "../components/CodeEditor";
import Loader from "../components/Loader";

class TablePermissions extends Nullstack {
  name = "";
  query = "";
  controller = "";

  error = "";

  addressPermission = "";

  permissions = [];

  loadingQuery = false;
  loadingController = false;

  async hydrate({ __tableland, instances }) {
    try {
      this.options = __tableland?.options;
      this.controller = await __tableland.getController(this.name);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }

  initiate({ params }) {
    this.name = params.name;
  }

  parseRoleUpdate({ type, instances }) {
    const query = `${type} ${this.permissions.join(", ")} ON ${this.name} ${type === "GRANT" ? "TO" : "FROM"} '${this.addressPermission}'`;
    instances.permissions_editor.setEditorValue({ query });
  }

  async runQuery({ __tableland, instances }) {
    this.loadingQuery = true;
    try {
      await __tableland.write(this.query);
      instances.toast._showInfoToast("Permission executed with success!");
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loadingQuery = false;
    }
  }

  async changeController({ __tableland, instances }) {
    this.loadingController = true;
    try {
      await __tableland.setController(this.controller, this.name);
      instances.toast._showInfoToast("Controller changed with success!");
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loadingController = false;
    }
  }

  async lockController({ __tableland, instances }) {
    this.loadingController = true;
    try {
      await __tableland.lockController(this.name);
      instances.toast._showInfoToast("Controller locked with success!");
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loadingController = false;
    }
  }
  onEditorChange({ query }) {
    this.query = query;
  }
  render() {
    return (
      <div class="overflow-y-auto h-full">
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12">
          <h1 class="text-2xl mb-6">{parseTableName(this.options?.chainId, this.name)}</h1>
          {/* <textarea name="query" id="query" cols="30" rows="2" class="bg-background w-full mb-2" bind={this.query} /> */}
          <CodeEditor key="permissions_editor" value={this.query} onchange={this.onEditorChange} disabled={true} />
          <div class="py-5">
            <button class="btn-primary h-12  w-44" disabled={this.loadingQuery} onclick={this.runQuery}>
              {this.loadingQuery ? <Loader width={38} height={38} /> : "Run query"}
            </button>
          </div>
          <h2 class="text-xl my-4 font-bold">Roles</h2>
          <input type="text" bind={this.addressPermission} placeholder="Address" class="bg-background mb-4 w-full" />
          <div class="flex gap-5 mb-4">
            {TABLE_PERMISSIONS.map((permission) => (
              <div class="flex gap-1 items-center">
                <input
                  type="checkbox"
                  name={permission}
                  id={permission}
                  checked={!!this.permissions.find((p) => p === { permission })}
                  onchange={({ event }) => {
                    if (event.target.checked) {
                      this.permissions.push(permission);
                    } else {
                      this.permissions = this.permissions.filter((p) => p !== permission);
                    }
                  }}
                />
                <label htmlFor={permission}>{permission}</label>
              </div>
            ))}
          </div>
          <div class="flex gap-5">
            <button class="btn-primary" onclick={() => this.parseRoleUpdate({ type: "GRANT" })}>
              Generate GRANT query
            </button>
            <button class="btn-primary" onclick={() => this.parseRoleUpdate({ type: "REVOKE" })}>
              Generate REVOKE query
            </button>
          </div>
          <hr class="my-6" />
          <h2 class="text-xl my-4 font-bold">Table Controller Address</h2>
          <input type="text" bind={this.controller} placeholder="Address" class="bg-background mb-4 w-full" />
          <div class="flex gap-5">
            <button class="btn-primary" disabled={this.loadingController} onclick={this.changeController}>
              {this.loadingController ? "Loading... " : "Change Controller"}
            </button>
            <button class="btn-primary" disabled={this.loadingController} onclick={this.lockController}>
              {this.loadingController ? "Loading... " : "Lock Controller"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default TablePermissions;
