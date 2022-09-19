import Nullstack from "nullstack";
import { parseDeleteData, getPKColumn, getPKColumnIndex, parseTableName, parseInsertData, isReadQuery, parseUpdateData } from "../utils/SQLParser";
import TableNav from "../components/TableNav";
import UpdateIcon from "../components/Update.jsx";
import DeleteIcon from "../components/Delete.jsx";
import ReadIcon from "../components/Read.jsx";
import InsertIcon from "../components/Insert.jsx";
import Loader from "../components/Loader.jsx";
import CodeEditor from "../components/CodeEditor";
class Table extends Nullstack {
  name = "";
  query = "";
  data;
  loading = false;
  limit = 50;
  schema = [];
  pkColumn = "";
  pkColumnIndex = "";
  tableInput = "";
  insertString = "Insert";
  readString = "Read";
  readOrInsert = "";
  async readQuery({ __tableland, instances }) {
    try {
      const data = await __tableland.read(this.query);
      this.data = data;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async runQuery({ instances }) {
    this.loading = true;
    try {
      this.query = instances.code_editor.getEditorValue();
      const isRead = isReadQuery(this.query);
      if (isRead) {
        await this.readQuery();
      } else {
        await this.insertData();
        this.updateToBaseQuery();
      }
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }
  async insertData({ __tableland, instances }) {
    try {
      await __tableland.write(this.query);
      const data = await __tableland.read(this.baseQuery());
      this.data = data;
      instances.toast._showInfoToast(`Table ${this.name} updated with success!`);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async hydrate({ __tableland }) {
    if (!this.name) return;
    this.options = __tableland?.options;
    const data = await __tableland.read(this.query);
    this.data = data;
    this.getTableSchema();
  }

  initiate({ params }) {
    this.name = params.name;
    this.readOrInsert = this.insertString;
    this.query = this.baseQuery();
  }
  baseQuery() {
    return `SELECT * FROM ${this.name} LIMIT ${this.limit}`;
  }
  async getTableSchema({ __tableland, instances }) {
    try {
      this.schema = await __tableland.schema(this.name);
      this.pkColumn = getPKColumn(this.schema.columns, this.name);
      this.pkColumnIndex = getPKColumnIndex(this.schema.columns);
      this.tableInput = this.populateInputFields({ columns: this.schema?.columns });
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
    const updateQuery = () => this.addUpdateQuery({ recordId: row[this.pkColumnIndex], pkColumn: this.pkColumn, row: row });
    return (
      <>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-green-standard hover:text-green-100" onclick={updateQuery} disabled={this.loading}>
              <UpdateIcon />
            </button>
          </div>
        </td>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-red-standard hover:text-red-400" onclick={deleteWrapper} disabled={this.loading}>
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
  insertOrRead() {
    if (this.readOrInsert == this.insertString) {
      this.addInsertQuery();
      this.readOrInsert = this.readString;
    } else {
      this.updateToBaseQuery();
      this.readOrInsert = this.insertString;
    }
  }
  onEditorChange({ query }) {
    this.query = query;
  }
  addInsertQuery({ instances }) {
    const removePkColumns = () =>
      Object.entries(this.tableInput).reduce((acc, v) => {
        return v[1].name == this.pkColumn ? acc : [{ ...v[1], value: "" }, ...acc];
      }, []);
    const pkColumn = () =>
      Object.entries(this.tableInput).reduce((acc, v) => {
        return v[1].name != this.pkColumn ? acc : [{ ...v[1], value: "" }, ...acc];
      }, []);
    const filteredColumns = removePkColumns();
    const columnInputs = filteredColumns.length ? filteredColumns : pkColumn();
    this.query = parseInsertData(columnInputs, this.name);
    instances.code_editor.setEditorValue({ query: this.query });
  }
  addUpdateQuery({ instances, recordId, pkColumn, row }) {
    const updateInput = Object.keys(this.tableInput).map((v) => {
      this.tableInput[v].value = row[v];
      return this.tableInput[v];
    });
    this.query = parseUpdateData(updateInput, this.name, recordId, pkColumn);
    instances.code_editor.setEditorValue({ query: this.query });
  }
  updateToBaseQuery({ instances }) {
    instances.code_editor.setEditorValue({ query: this.baseQuery() });
  }
  populateInputFields({ columns }) {
    const r = columns.reduce((acc, column, index) => {
      column.value = "";
      column.index = index;
      return [...acc, column];
    }, []);
    return r;
  }
  render() {
    if (!this.name) return null;
    return (
      <div class="overflow-y-auto h-full">
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12 overflow-y-auto">
          <h1 class="text-2xl mb-6">{parseTableName(this.options?.chainId, this.name)}</h1>
          <CodeEditor key="code_editor" value={this.query} onchange={this.onEditorChange} />
          <div class="flex flex-col items-start justify-start">
            <span class="my-4 w-44 cursor-pointer" onclick={this.insertOrRead} title={this.readOrInsert}>
              {this.readOrInsert == this.readString ? <ReadIcon width={25} height={25} /> : <InsertIcon width={25} height={25} />}
            </span>
            <button class="btn-primary my-4" onclick={this.runQuery} disabled={this.loading}>
              Run Query
            </button>
          </div>

          <div class="py-10 overflow-auto border-solid border border-slate-300" style="max-width: calc(100% - 10px); max-height: 800px">
            {this.loading ? <Loader width={50} height={50} /> : <TableData />}
          </div>
        </div>
      </div>
    );
  }
}

export default Table;
