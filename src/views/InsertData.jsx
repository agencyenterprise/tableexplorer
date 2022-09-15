import Nullstack from "nullstack";
import { parseInsertData, getPKColumn } from "../utils/SQLParser";
import Loader from "../components/Loader.jsx";

class InsertData extends Nullstack {
  loading = false;
  tableName = "";
  schema = [];
  columns = [];
  tableInput = [];
  insertQuery = "";
  prepare({ params }) {
    this.tableName = params.name;
  }
  async hydrate() {
    this.getTableSchema();
  }
  populateInputFields({ columns }) {
    const pk = getPKColumn(columns);
    const r = columns.reduce((acc, column) => {
      if (column.name != pk) {
        column.value = "";
        return [...acc, column];
      }
      return acc;
    }, []);
    return r;
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
  async insertData({ __tableland, instances }) {
    this.loading = true;
    try {
      await __tableland.write(this.insertQuery);
      instances.toast._showInfoToast(
        `Table ${this.tableName} updated with success!`
      );
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }

  updateQuery() {
    this.insertQuery = parseInsertData(this.tableInput, this.tableName);
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
              class="bg-background"
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
        <h1 class="text-2xl mb-4 font-bold">Insert Data</h1>
        <textarea
          name="query"
          id="query"
          cols="30"
          rows="8"
          class="bg-background w-full"
          bind={this.insertQuery}
          disabled
        />
        <h2 class="text-xl mb-4 font-bold">Columns</h2>
        <ul class="flex flex-col gap-5 my-4 pl-5">
          {this.tableInput.map((_, index) => (
            <Column index={index} />
          ))}
        </ul>
        <div class=" pt-10">
          <button
            class="btn-primary h-12  w-32"
            disabled={this.loading}
            onclick={this.insertData}
          >
            {this.loading ? <Loader width={38} height={38} /> : "Insert Data"}
          </button>
        </div>
      </div>
    );
  }
}

export default InsertData;
