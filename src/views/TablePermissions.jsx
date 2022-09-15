import Nullstack from "nullstack";
import TableNav from "../components/TableNav";
import { TABLE_PERMISSIONS } from "../utils/TableTypes";

class TablePermissions extends Nullstack {
  name = "";
  query = "";
  controller = "";

  error = "";

  addressPermission = "";

  permissions = [];

  loadingQuery = false;
  loadingController = false;

  async hydrate({ __tableland }) {
    // There is no getter for roles right now :(
    this.controller = await __tableland.getController(this.name);
  }

  initiate({ params }) {
    this.name = params.name;
  }

  parseRoleUpdate({ type }) {
    this.query = `${type} ${this.permissions.join(", ")} ON ${this.name} ${
      type === "GRANT" ? "TO" : "FROM"
    } '${this.addressPermission}'`;
  }

  async runQuery({ __tableland }) {
    this.loadingQuery = true;
    try {
      const response = await __tableland.write(this.query);
      console.log("response", response);
    } catch (err) {
      console.log(err);
      this.error = err.message;
    } finally {
      this.loadingQuery = false;
    }
  }

  async changeController({ __tableland }) {
    this.loadingController = true;
    try {
      const response = await __tableland.setController(
        this.controller,
        this.name
      );
      console.log(response);
    } catch (err) {
      console.log(err);
      this.error = err.message;
    } finally {
      this.loadingController = false;
    }
  }

  async lockController({ __tableland }) {
    this.loadingController = true;
    try {
      const response = await __tableland.lockController(this.name);
      console.log(response);
    } catch (err) {
      console.log(err);
      this.error = err.message;
    } finally {
      this.loadingController = false;
    }
  }

  render() {
    return (
      <>
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12">
          <h1 class="text-2xl mb-6">{this.name} Permissions</h1>
          <textarea
            name="query"
            id="query"
            cols="30"
            rows="2"
            class="bg-background w-full mb-2"
            bind={this.query}
          />
          {this.err && <p class="text-red-600 my-4">{this.err}</p>}
          <button
            class="btn-primary"
            disabled={this.loadingQuery}
            onclick={this.runQuery}
          >
            {this.loadingQuery ? "Loading..." : "Run query"}
          </button>
          <h2 class="text-xl my-4 font-bold">Roles</h2>
          <input
            type="text"
            bind={this.addressPermission}
            placeholder="Address"
            class="bg-background mb-4 w-full"
          />
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
                      this.permissions = this.permissions.filter(
                        (p) => p !== permission
                      );
                    }
                  }}
                />
                <label htmlFor={permission}>{permission}</label>
              </div>
            ))}
          </div>
          <div class="flex gap-5">
            <button
              class="btn-primary"
              onclick={() => this.parseRoleUpdate({ type: "GRANT" })}
            >
              Generate GRANT query
            </button>
            <button
              class="btn-primary"
              onclick={() => this.parseRoleUpdate({ type: "REVOKE" })}
            >
              Generate REVOKE query
            </button>
          </div>
          <hr class="my-6" />
          <h2 class="text-xl my-4 font-bold">Table Controller Address</h2>
          <input
            type="text"
            bind={this.controller}
            placeholder="Address"
            class="bg-background mb-4 w-full"
          />
          <div class="flex gap-5">
            <button
              class="btn-primary"
              disabled={this.loadingController}
              onclick={this.changeController}
            >
              {this.loadingController ? "Loading... " : "Change Controller"}
            </button>
            <button
              class="btn-primary"
              disabled={this.loadingController}
              onclick={this.lockController}
            >
              {this.loadingController ? "Loading... " : "Lock Controller"}
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default TablePermissions;
