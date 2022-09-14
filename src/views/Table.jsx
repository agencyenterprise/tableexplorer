import Nullstack from "nullstack";
import { parseDeleteData } from "../utils/SQLParser";
import TableNav from "../components/TableNav";
import UpdateIcon from "../components/Update.jsx";
import DeleteIcon from "../components/Delete.jsx";
import Loader from "../components/Loader.jsx";
class Table extends Nullstack {
  name = "";
  query = "";
  data;
  err = "";
  loading = false;
  limit = 50;
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
    console.log(data);
  }

  initiate({ params }) {
    this.name = params.name;
    this.query = `SELECT * FROM ${this.name} LIMIT ${this.limit}`;
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
  async deleteRecord({ __tableland, recordId, instances }) {
    this.loading = true;
    this.err = "";
    try {
      await __tableland.write(parseDeleteData(this.name, recordId));
      this.data.rows = this.data.rows.filter((r) => r[0] != recordId);
      instances.toast._showInfoToast(`Row deleted from table ${this.name}`);
    } catch (err) {
      this.err = err.message;
      instances.toast._showErrorToast(this.err);
    } finally {
      this.loading = false;
    }
  }
  redirectToUpdatePage({ router, recordId }) {
    console.log("redirect");
    router.path = `/updateData?name=${this.name}&id=${recordId}`;
  }
  renderActionBtn({ row }) {
    const id = row[0];
    const deleteWrapper = () => this.deleteRecord({ recordId: id });
    const redirect = () => this.redirectToUpdatePage({ recordId: id });
    return (
      <>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex flex-row justify-between">
            <button class="text-green-300 hover:text-green-100" onclick={redirect} disabled={this.loading}>
              <UpdateIcon />
            </button>
          </div>
        </td>
        <td class="text-sm py-4 whitespace-nowrap">
          <div>
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
      <>
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12">
          <h1 class="text-2xl mb-6">{this.name}</h1>
          <textarea name="query" id="query" cols="30" rows="2" class="bg-background w-full" bind={this.query} />
          <button class="btn-primary my-4 w-32" onclick={this.runQuery} disabled={this.loading}>
            Run Query
          </button>
          <button class="btn-primary my-4 w-32" onclick={this.redirectToInsertData}>
            Insert Data
          </button>

          <div class="py-10">{this.loading ? <Loader width={50} height={50} /> : <TableData />}</div>
        </div>
      </>
    );
  }
}

export default Table;
