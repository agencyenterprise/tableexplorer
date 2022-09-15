import Nullstack from "nullstack";
import { parseDeleteData, getPKColumn, getPKColumnIndex } from "../utils/SQLParser";
import TableNav from "../components/TableNav";
import UpdateIcon from "../components/Update.jsx";
import DeleteIcon from "../components/Delete.jsx";
import Loader from "../components/Loader.jsx";
class Table extends Nullstack {
  name = "";
  query = "";
  data;
  loading = false;
  limit = 50;
  schema = [];
  pkColumn = "";
  pkColumnIndex = ""
  async runQuery({ __tableland }) {
    this.loading = true;
    const data = await __tableland.read(this.query);
    this.data = data;
    this.loading = false;
  }

  async hydrate({ __tableland }) {
    if (!this.name) return;

    const data = await __tableland.read(this.query);
    this.data = data;
    this.getTableSchema();
  }

  initiate({ params }) {
    this.name = params.name;
    this.query = `SELECT * FROM ${this.name} LIMIT ${this.limit}`;
  }
  async getTableSchema({ __tableland, instances }) {
    try {
      this.schema = await __tableland.schema(this.name);
      this.pkColumn = getPKColumn(this.schema.columns, this.name);
      this.pkColumnIndex = getPKColumnIndex(this.schema.columns)
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  renderTableHeader() {
    return (
      <thead class="border-b">
        <tr>
          {this.data.columns.map((column) => (
            <th scope="col" class="text-sm font-medium px-6 py-4 text-left">
              {column.name}
            </th>
          ))}
          <th scope="col" class="text-sm font-medium py-4 text-left">
            Update
          </th>
          <th scope="col" class="text-sm font-medium py-4 text-left">
            Delete
          </th>
        </tr>
      </thead>
    );
  }
  async deleteRecord({ __tableland, recordId, recordIndex, instances }) {
    this.loading = true;
    try {
      await __tableland.write(parseDeleteData(this.name, recordId, this.pkColumn));
      this.data.rows = this.data.rows.filter((r) => r[recordIndex] != recordId);
      instances.toast._showInfoToast(`Row deleted from table ${this.name}`);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }
  redirectToUpdatePage({ router, recordId }) {
    router.path = `/updateData?name=${this.name}&id=${recordId}&column=${this.pkColumn}`;
  }
  renderActionBtn({ row }) {
    const deleteWrapper = () => this.deleteRecord({ recordId: row[this.pkColumnIndex], recordIndex: this.pkColumnIndex });
    const redirect = () => this.redirectToUpdatePage({ recordId: row[this.pkColumnIndex] });
    return (
      <>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-green-300 hover:text-green-100" onclick={redirect} disabled={this.loading}>
              <UpdateIcon />
            </button>
          </div>
        </td>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-red-600 hover:text-red-400" onclick={deleteWrapper} disabled={this.loading}>
              <DeleteIcon />
            </button>
          </div>
        </td>
      </>
    );
  }
  renderTableBody() {
    return (
      <tbody>
        {this.data.rows.map((row) => (
          <tr class="border-b">
            {row.map((item) => (
              <td class="text-sm px-6 py-4 whitespace-nowrap">{item}</td>
            ))}
            <ActionBtn row={row} />
          </tr>
        ))}
      </tbody>
    );
  }
  renderTableData() {
    return this.data ? (
      <table class="min-w-full">
        <TableHeader />
        <TableBody />
      </table>
    ) : (
      <Loader width={50} height={50} />
    );
  }
  redirectToInsertData({ router }) {
    router.path = "/insertData";
  }
  render() {
    if (!this.name) return null;
    return (
      <div class="overflow-y-scroll">
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12 overflow-y-scroll">
          <h1 class="text-2xl mb-6">{this.name}</h1>
          <textarea name="query" id="query" cols="30" rows="2" class="bg-background w-full" bind={this.query} />
          <button class="btn-primary my-4 w-32" onclick={this.runQuery} disabled={this.loading}>
            Run Query
          </button>
          <button class="btn-primary my-4 w-32" onclick={this.redirectToInsertData}>
            Insert Data
          </button>

          <div class="py-10 overflow-scroll border-solid border border-slate-300" style="max-width: calc(100% - 10px); max-height: 800px">
            {this.loading ? <Loader width={50} height={50} /> : <TableData />}
          </div>
        </div>
      </div>
    );
  }
}

export default Table;
