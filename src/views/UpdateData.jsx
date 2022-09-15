import Nullstack from "nullstack";
import { parseUpdateData } from "../utils/SQLParser.js";
import Loader from "../components/Loader.jsx";
class UpdateData extends Nullstack {
  loading = false;
  recordId = "";
  tableName = "";
  schema = [];
  columns = [];
  tableInput = [];
  insertQuery = "";
  record = {};
  initialValues = [];
  prepare({ params }) {
    this.tableName = params.name;
    this.recordId = params.id;
    this.pkColumn = params.column;
  }
  async hydrate({ instances }) {
    try {
      await this.getTableSchema();
      await this.getRecord();
      this.parseColumns();
      this.insertQuery = parseUpdateData(this.tableInput, this.tableName, this.recordId, this.pkColumn);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  parseColumns() {
    const { columns, rows } = this.record;
    this.initialValues = columns.map((column, index) => {
      this.tableInput[index].value = rows[0][index];
      return { name: column.name, value: rows[0][index] };
    });
  }
  populateInputFields({ columns }) {
    return columns.map((column) => {
      column.value = "";
      return column;
    });
  }
  async getRecord({ __tableland, instances }) {
    try {
      const record = await __tableland.read(`SELECT * FROM ${this.tableName} WHERE ${this.pkColumn} = ${this.recordId}`);
      this.record = record;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async getTableSchema({ __tableland, instances }) {
    try {
      const schema = await __tableland.schema(this.tableName);
      this.tableInput = this.populateInputFields({ columns: schema?.columns });
      this.schema = schema;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async updateTable({ __tableland, instances }) {
    this.loading = true;
    try {
      await __tableland.write(this.insertQuery);
      instances.toast._showInfoToast(`Record updated!`);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }

  updateQuery() {
    this.insertQuery = parseUpdateData(this.tableInput, this.tableName, this.recordId, this.pkColumn);
  }

  renderColumn({ index }) {
    const column = this.tableInput[index];

    const columnName = column.name;
    const columnType = column.type;
    return columnName != this.pkColumn ? (
      <>
        <p class="font-bold">{columnName}</p>
        <li class="flex gap-5 items-center">
          <div class="flex">
            <input
              class="bg-background h-10"
              placeholder="Column name"
              type="text"
              value={this.tableInput[index].value}
              oninput={({ event }) => {
                this.tableInput[index].value = event.target.value;
                this.updateQuery();
              }}
            />
            <div class="pl-5">
              <div class="w-24 h-10 border-solid border-b-gray-400 border">
                <div class="flex items-center w-full h-full  justify-center">
                  <p class="text-white">{columnType}</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      </>
    ) : (
      <></>
    );
  }

  render() {
    return (
      <div class="w-full min-h-full pt-8 px-12 overflow-y-scroll pb-10">
        <h1 class="text-2xl mb-4 font-bold">Update Data</h1>
        <textarea name="query" id="query" cols="30" rows="8" class="bg-background w-full" bind={this.insertQuery} disabled />
        <h2 class="text-xl mb-4 font-bold pt-5">Columns</h2>
        <ul class="flex flex-col gap-5 my-4 pl-5">
          {this.tableInput.map((_, index) => (
            <Column index={index} />
          ))}
        </ul>
        <div class=" pt-10">
          <button class="btn-primary h-12  w-36" disabled={this.loading} onclick={this.updateTable}>
            {this.loading ? <Loader width={38} height={38} /> : "Update Data"}
          </button>
        </div>
      </div>
    );
  }
}

export default UpdateData;
