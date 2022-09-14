import Nullstack from "nullstack";
import { TABLE_TYPES, parseInsertData } from "../utils/TableTypes.js";

class InsertData extends Nullstack {
  loading = false;
  err = "";
  tableName = "tableTestC_80001_1839";
  schema = [];
  columns = [];
  tableInput = [];
  insertQuery = "";
  prepare({ params }) {
    this.tableName = params.name;
  }
  async hydrate() {
    await this.getTableSchema();
  }
  populateInputFields({ columns }) {
    return columns.map((column) => {
      column.value = "";
      return column;
    });
  }
  async getTableSchema({ __tableland }) {
    try {
      const schema = await __tableland.schema(this.tableName);
      this.tableInput = this.populateInputFields({ columns: schema?.columns });
      this.schema = schema;
      console.log(schema);
    } catch (err) {
      this.err = err.message;
      console.log(err);
    }
  }
  async updateTable({ __tableland }) {
    this.loading = true;
    this.err = "";
    try {
      await __tableland.write(this.insertQuery);
    } catch (err) {
      this.err = err.message;
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  updateQuery() {
    this.insertQuery = parseInsertData(this.tableInput, this.tableName);
  }

  renderColumn({ index }) {
    return (
      <li class="flex gap-5 items-center">
        <div class="flex">
          <input
            class="bg-background"
            placeholder="Column name"
            type="text"
            value={this.tableInput[index].value}
            oninput={({ event }) => {
              this.tableInput[index].value = event.target.value;
              this.updateQuery();
            }}
          />
          <select
            class="bg-background"
            name="type"
            id={`type-${index}`}
            value={this.tableInput[index].type}
            disabled
            onchange={({ event }) => {
              this.tableInput[index].type = event.target.value;
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
      </li>
    );
  }

  render() {
    return (
      <div class="w-full min-h-full pt-8 px-12">
        <h1 class="text-2xl mb-4 font-bold">Insert Data</h1>
        <textarea name="query" id="query" cols="30" rows="8" class="bg-background w-full" bind={this.insertQuery} disabled />
        <h2 class="text-xl mb-4 font-bold">Columns</h2>
        <ul class="flex flex-col gap-5 my-4">
          {this.tableInput.map((_, index) => (
            <Column index={index} />
          ))}
        </ul>
        {this.err && <p class="text-red-600 my-4">{this.err}</p>}
        <button class="btn-primary" disabled={this.loading} onclick={this.updateTable}>
          {this.loading ? "Loading..." : "Insert Data"}
        </button>
      </div>
    );
  }
}

export default InsertData;
