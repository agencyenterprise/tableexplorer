import Nullstack, { NullstackNode } from "nullstack";
import { TABLE_TYPES, TABLE_CONSTRAINTS } from "../utils/TableTypes";
import { parseCreateTable, hasPK, hasColumnTypeAsColumnName, parseCreateTableSQL } from "../utils/SQLParser";
import DeleteIcon from "../assets/Delete";
import Loader from "../assets/Loader";
import CodeEditor from "../components/CodeEditor";
import { CustomClientContext } from "../types/CustomContexts";
import { Column } from "../types/columns";

declare function Column(): NullstackNode;

class AddTable extends Nullstack {
  prefix = "";
  query = "id integer";
  parsedQuery = "";
  loading = false;
  err = "";

  tableToImport = "";

  columns: Column[] = [{ type: "integer", name: "id", constraints: [] }];

  async hydrate() {
    try {
      this.updateQuery();
    } catch (err) {}
  }

  async createTable({ __tableland, instances }: CustomClientContext) {
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
      instances.toast._showInfoToast(`Table ${this.prefix} created with success!`);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }

  updateQuery(context?: CustomClientContext) {
    const { instances } = context!;
    this.query = parseCreateTable(this.columns);
    this.parsedQuery = parseCreateTableSQL(this.columns, this.prefix || '""');
    instances.addtableeditor.setEditorValue({ query: this.parsedQuery });
  }

  renderColumn({ index }: CustomClientContext & { index: number }) {
    return (
      <li class="flex gap-5 items-center">
        <button
          class="hover:underline cursor-pointer text-red-standard"
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
              this.columns[index].name = (event.target as any).value;
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
        {TABLE_CONSTRAINTS.map((constraint: string) => (
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              name={`check-${constraint}-${index}`}
              checked={!!this.columns[index].constraints.find((c) => c === constraint)}
              onchange={({ event }) => {
                if (event.target.checked) {
                  if (constraint === "PRIMARY KEY") {
                    // Remove all the other primary keys
                    let newColumns: Column[] = this.columns.map((col) => ({
                      ...col,
                      constraints: col.constraints.filter((c) => c !== constraint),
                    }));
                    newColumns[index].constraints.push(constraint);
                    this.columns = newColumns;
                  } else {
                    this.columns[index].constraints.push(constraint);
                  }
                } else {
                  this.columns[index].constraints = this.columns[index].constraints.filter((c) => c !== constraint);
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
      <div class="w-full min-h-full pt-8 px-12 overflow-y-auto pb-10">
        <h1 class="text-2xl mb-4 font-bold">Create Table</h1>
        <CodeEditor key="addtableeditor" value={this.parsedQuery} disabled={true} />
        <h2 class="text-xl mb-4 font-bold pt-5">Columns</h2>
        <ul class="flex flex-col gap-5 my-4">
          {this.columns.map((_, index) => (
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
          <span class="border-dotted border-b" title="Prefix format: [A-Za-z0-9_]+">
            Table Prefix
          </span>
        </h2>
        <input type="text" bind={this.prefix} placeholder="Table Prefix" class="bg-background mb-4" oninput={this.updateQuery} />
        <button class="btn-primary h-12 w-44" disabled={this.loading} onclick={this.createTable}>
          {this.loading ? <Loader width={38} height={38} /> : "Create Table"}
        </button>
      </div>
    );
  }
}

export default AddTable;
