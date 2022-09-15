import Nullstack from "nullstack";
import { TABLE_TYPES, TABLE_CONSTRAINTS } from "../utils/TableTypes.js";
import {
  parseCreateTable,
  hasPK,
  hasColumnTypeAsColumnName,
} from "../utils/SQLParser.js";
import DeleteIcon from "../components/Delete.jsx";
import Loader from "../components/Loader.jsx";
class AddTable extends Nullstack {
  prefix = "";
  query = "id integer";
  loading = false;
  err = "";

  tableToImport = "";

  columns = [{ type: "integer", name: "id", constraints: [] }];

  static async insertDbTable({ prisma, signerAddress, tableName }) {
    await prisma.tableUser.create({
      data: {
        tableName,
        userAddress: signerAddress,
      },
    });
    return true;
  }

  async importTable({ __tableland }) {
    this.loading = true;
    try {
      await this.insertDbTable({
        signerAddress: __tableland.signerAddress,
        tableName: this.tableToImport,
      });
    } catch (err) {
      console.log("Error", err);
    } finally {
      this.loading = false;
    }
  }

  async createTable({ __tableland, instances }) {
    if (!this.prefix) {
      instances.toast._showErrorToast("You must choose a table prefix");
      return;
    }
    this.loading = true;

    try {
      hasPK(this.columns, this.prefix);
      hasColumnTypeAsColumnName(this.columns);
      await __tableland.create(this.query, {
        prefix: this.prefix,
      });
      await instances.sidebar.getDatabases();
      instances.toast._showInfoToast(
        `Table ${this.prefix} created with success!`
      );
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }

  updateQuery() {
    this.query = parseCreateTable(this.columns);
  }

  renderColumn({ index }) {
    return (
      <li class="flex gap-5 items-center">
        <button
          class="hover:underline cursor-pointer text-red-900"
          onclick={() => {
            this.columns.splice(index, 1);
            this.updateQuery();
          }}
        >
          <DeleteIcon />
        </button>
        <div class="flex">
          <input
            class="bg-background"
            placeholder="Column name"
            type="text"
            value={this.columns[index].name}
            oninput={({ event }) => {
              this.columns[index].name = event.target.value;
              this.updateQuery();
            }}
          />
          <div class="pl-3">
            <select
              class="bg-background"
              name="type"
              id={`type-${index}`}
              value={this.columns[index].type}
              onchange={({ event }) => {
                this.columns[index].type = event.target.value;
                this.updateQuery();
              }}
            >
              {TABLE_TYPES.map((type) => (
                <option class="bg-background" value={type}>
                  {type.toLocaleUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        {TABLE_CONSTRAINTS.map((constraint) => (
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              name={`check-${constraint}-${index}`}
              checked={
                !!this.columns[index].constraints.find((c) => c === constraint)
              }
              onchange={({ event }) => {
                if (event.target.checked) {
                  if (constraint === "PRIMARY KEY") {
                    // Remove all the other primary keys
                    let newColumns = this.columns.map((col) => ({
                      ...col,
                      constraints: col.constraints.filter(
                        (c) => c !== constraint
                      ),
                    }));
                    newColumns[index].constraints.push(constraint);
                    this.columns = newColumns;
                  } else {
                    this.columns[index].constraints.push(constraint);
                  }
                } else {
                  this.columns[index].constraints = this.columns[
                    index
                  ].constraints.filter((c) => c !== constraint);
                }
                this.updateQuery();
              }}
            />
            <label htmlFor={`check-${constraint}-${index}`}>{constraint}</label>
          </div>
        ))}
      </li>
    );
  }

  render() {
    return (
      <div class="w-full min-h-full pt-8 px-12 overflow-y-scroll pb-10">
        <h1 class="text-2xl mb-4 font-bold">Create Table</h1>
        <textarea
          name="query"
          id="query"
          cols="30"
          rows="8"
          class="bg-background w-full"
          disabled
          bind={this.query}
        />
        <h2 class="text-xl mb-4 font-bold pt-5">Columns</h2>
        <ul class="flex flex-col gap-5 my-4">
          {this.columns.map((col, index) => (
            <Column index={index} />
          ))}
        </ul>
        <button
          onclick={() => {
            this.columns.push({ type: "integer", name: "", constraints: [] });
            this.updateQuery();
          }}
          class="btn-primary"
        >
          + Add Column
        </button>
        <hr class="my-10" />
        <h2 class="text-xl mb-4 font-bold py-2">
          <span
            class="border-dotted border-b"
            title="Prefix format: [A-Za-z0-9_]+"
          >
            Table Prefix
          </span>
        </h2>
        <input
          type="text"
          bind={this.prefix}
          placeholder="Table Prefix"
          class="bg-background mb-4"
        />
        <button
          class="btn-primary h-12  w-36"
          disabled={this.loading}
          onclick={this.createTable}
        >
          {this.loading ? <Loader width={38} height={38} /> : "Create Table"}
        </button>
        <hr class="my-6" />
        <h1 class="text-2xl mb-4 font-bold">Import Table</h1>
        <input
          type="text"
          bind={this.tableToImport}
          placeholder="Table name"
          class="bg-background mb-4"
        />
        <button
          class="btn-primary"
          disabled={this.loading}
          onclick={this.importTable}
        >
          {this.loading ? <Loader width={38} height={38} /> : "Import"}
        </button>
      </div>
    );
  }
}

export default AddTable;
