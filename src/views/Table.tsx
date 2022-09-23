import Nullstack, { NullstackNode } from "nullstack";
import {
  parseDeleteData,
  getPKColumn,
  getPKColumnIndex,
  parseTableName,
  parseInsertData,
  isReadQuery,
  parseUpdateData,
  countQuery,
  buildSelectQuery,
} from "../utils/SQLParser";
import { range } from "../utils/TableUtils";
import TableNav from "../components/TableNav";
import UpdateIcon from "../assets/Update";
import DeleteIcon from "../assets/Delete";
import ReadIcon from "../assets/Read";
import InsertIcon from "../assets/Insert";
import Loader from "../assets/Loader";
import CodeEditor from "../components/CodeEditor";
import { CustomClientContext, WithNullstackContext } from "../types/CustomContexts";
import { ConnectOptions, SchemaColumns } from "@tableland/sdk";
import { SchemaQueryResult } from "@tableland/sdk";
import TableComponent from "../components/TableComponent";

declare function TableHeader(): NullstackNode;
declare function ActionBtn(): NullstackNode;
declare function TableData(): NullstackNode;
declare function TableBody(): NullstackNode;
declare function TablePagination(): NullstackNode;
declare function TablePaginationButton(): NullstackNode;
declare function PaginatedTable(): NullstackNode;
class Table extends Nullstack {
  name = "";
  query = "";
  data;
  loading = false;
  limit = 50;
  schema: SchemaQueryResult | null = null;
  pkColumn = "";
  pkColumnIndex = -1;
  tableInput: SchemaColumns;
  insertString = "Insert";
  readString = "Read";
  readOrInsert = "";
  paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number } = {
    currentPage: 0,
    totalPages: 0,
    rowsPerPage: 2,
    totalCount: 0,
  };
  options: ConnectOptions;

  async readQuery(context?: CustomClientContext) {
    const { __tableland, instances } = context!;
    try {
      const data = await __tableland.read(this.query);
      this.data = data;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async runQuery(context?: CustomClientContext) {
    const { instances } = context!;
    this.loading = true;
    try {
      this.query = instances.code_editor.getEditorValue();
      const isRead = isReadQuery(this.query);
      if (isRead) {
        await this.readQuery();
      } else {
        await this.insertData();
      }
      await this.getInitialPaginationSettings();
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }
  async insertData(context?: CustomClientContext) {
    const { __tableland, instances } = context!;
    try {
      await __tableland.write(this.query);
      const data = await __tableland.read(this.baseQuery());
      this.data = data;
      instances.toast._showInfoToast(`Table ${this.name} updated with success!`);
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async hydrate({ __tableland }: CustomClientContext) {
    if (!this.name) return;
    this.options = __tableland?.options;
    const data = await __tableland.read(this.query);
    this.data = data;
    this.getInitialSettings();
  }

  initiate({ params }) {
    this.name = params.name;
    this.readOrInsert = this.insertString;
    this.query = this.baseQuery();
  }
  baseQuery() {
    const offset = this.paginationSettings.currentPage * this.paginationSettings.rowsPerPage;
    const limit = this.paginationSettings.rowsPerPage;
    const query = `SELECT * FROM ${this.name};`;
    const newQuery = buildSelectQuery(query, limit, offset);
    return newQuery;
  }
  async getInitialPaginationSettings(context?: CustomClientContext) {
    const { __tableland } = context!;
    try {
      const countQuery_ = await __tableland.read(countQuery(this.schema?.columns!, this.name));
      const rowCount = (countQuery_.rows || [[]])[0][0] || 0;
      const count = rowCount ? rowCount - 1 : rowCount;
      this.paginationSettings.totalPages = Math.floor(count / this.paginationSettings.rowsPerPage);
      this.paginationSettings.totalCount = rowCount;
    } catch (err) {}
  }
  async getInitialSettings(context?: CustomClientContext) {
    const { instances } = context!;
    try {
      await this.getTableSchema();
      await this.getInitialPaginationSettings();
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async getTableSchema(context?: CustomClientContext) {
    const { __tableland, instances } = context!;
    try {
      this.schema = await __tableland.schema(this.name);
      this.pkColumn = getPKColumn(this.schema.columns, this.name);
      this.pkColumnIndex = getPKColumnIndex(this.schema.columns);
      this.tableInput = this.populateInputFields({
        columns: this.schema?.columns,
      });
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  renderTableHeader() {
    return (
      <thead class="border-b">
        <tr>
          {this.data.columns?.map((column) => (
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
  async deleteRecord({ __tableland, recordId, recordIndex, instances }: WithNullstackContext<{ recordId: number; recordIndex: number }>) {
    this.loading = true;
    try {
      await __tableland!.write(parseDeleteData(this.name, recordId, this.pkColumn));
      this.data.rows = this.data.rows.filter((r) => r[recordIndex] != recordId);
      instances!.toast._showInfoToast(`Row deleted from table ${this.name}`);
    } catch (err) {
      instances!.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }
  redirectToUpdatePage({ router, recordId }) {
    router.path = `/updateData?name=${this.name}&id=${recordId}&column=${this.pkColumn}`;
  }
  renderActionBtn({ row }) {
    const deleteWrapper = () =>
      this.deleteRecord({
        recordId: row[this.pkColumnIndex],
        recordIndex: this.pkColumnIndex,
      });
    const updateQuery = () =>
      this.addUpdateQuery({
        recordId: row[this.pkColumnIndex],
        pkColumn: this.pkColumn,
        row: row,
      });
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
        {this.data.rows?.map((row) => (
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
  renderTablePaginationButton({ item }) {
    const changePage = () => {
      this.paginationSettings.currentPage = item.page;
    };
    return (
      <div class="">
        <button
          class="min-w-[30px] min-h-[30px] items-center px-1 rounded-md"
          onclick={changePage}
          style={this.paginationSettings.currentPage == item.page ? "background-color: #E1C2D8" : ""}
        >
          {item.page + 1}
        </button>
      </div>
    );
  }
  async nextPaginationButton(context?: CustomClientContext) {
    const { instances } = context!;
    if (this.paginationSettings.totalPages && this.paginationSettings.currentPage <= this.paginationSettings.totalPages) {
      this.paginationSettings.currentPage++;
      instances.code_editor.setEditorValue({ query: this.baseQuery() });
      await this.runQuery();
    }
  }
  async prevPaginationButton(context?: CustomClientContext) {
    const { instances } = context!;
    if (this.paginationSettings.currentPage >= 0) {
      this.paginationSettings.currentPage--;
      instances.code_editor.setEditorValue({ query: this.baseQuery() });
      await this.runQuery();
    }
  }
  renderTablePagination() {
    const reachedFinalPage = this.paginationSettings.currentPage == this.paginationSettings.totalPages;
    const inFirstPage = !this.paginationSettings.currentPage;
    const selectLimit = (index: number, limit: number = 2): boolean =>
      this.paginationSettings.currentPage <= index + limit && this.paginationSettings.currentPage >= index - limit;
    return (
      <div class="flex flex-row">
        <div class="flex min-w-[30px] min-h-[30px] items-center pr-3">
          <button class="items-center" onclick={this.prevPaginationButton} disabled={inFirstPage} style={inFirstPage ? "opacity: 0.5;" : ""}>
            Previous
          </button>
        </div>
        {range(this.paginationSettings.totalPages)
          .map((v) => ({ page: v }))
          .map((v) => <TablePaginationButton item={v} />)
          .reduce((acc: NullstackNode[], v: NullstackNode, index: number) => (selectLimit(index, 2) ? [...acc, v] : acc), [] as NullstackNode[])}
        <div class="flex min-w-[30px] min-h-[30px] items-center pl-3">
          <button
            class="items-center"
            onclick={this.nextPaginationButton}
            disabled={reachedFinalPage}
            style={reachedFinalPage ? "opacity: 0.5;" : ""}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  renderPaginatedTable({ children }: { children: NullstackNode }) {
    return (
      <div>
        <div class="py-10 overflow-auto border-solid border border-slate-300" style="max-width: calc(100% - 10px); max-height: 800px">
          {children}
        </div>
        <div class="flex justify-between items-center h-full px-2 pt-3">
          <div>
            <p>
              {this.paginationSettings.rowsPerPage} of {this.paginationSettings.totalCount} Entries
            </p>
          </div>
          <div class="pt-3 px-1">
            <TablePagination />
          </div>
        </div>
      </div>
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
  addInsertQuery(context?: CustomClientContext) {
    const { instances } = context!;
    const removePkColumns = () =>
      Object.entries(this.tableInput).reduce((acc: any[], v) => {
        return v[1].name == this.pkColumn && v[1].type == "integer" ? acc : [{ ...v[1], value: "" }, ...acc];
      }, []);
    const pkColumn = () =>
      Object.entries(this.tableInput).reduce((acc: any[], v) => {
        return v[1].name != this.pkColumn ? acc : [{ ...v[1], value: "" }, ...acc];
      }, []);
    const filteredColumns = removePkColumns();
    const columnInputs = filteredColumns.length ? filteredColumns : pkColumn();
    this.query = parseInsertData(columnInputs, this.name);
    instances.code_editor.setEditorValue({ query: this.query });
  }
  addUpdateQuery({ instances, recordId, pkColumn, row }: WithNullstackContext<{ recordId: number; pkColumn: string; row: any }>) {
    const updateInput = Object.keys(this.tableInput).map((v) => {
      this.tableInput[v].value = row[v];
      return this.tableInput[v];
    });
    this.query = parseUpdateData(updateInput, this.name, recordId, pkColumn);
    instances!.code_editor.setEditorValue({ query: this.query });
  }
  updateToBaseQuery(context?: CustomClientContext) {
    const { instances } = context!;
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
          <h1 class="text-2xl mb-6">{parseTableName(this.options?.chainId!, this.name)}</h1>
          <CodeEditor key="code_editor" value={this.query} onchange={this.onEditorChange} />
          <div class="flex flex-col items-start justify-start">
            <span class="my-4 w-44 cursor-pointer" onclick={this.insertOrRead} title={this.readOrInsert}>
              {this.readOrInsert == this.readString ? <ReadIcon width={25} height={25} /> : <InsertIcon width={25} height={25} />}
            </span>
            <button class="btn-primary my-4" onclick={this.runQuery} disabled={this.loading}>
              Run Query
            </button>
          </div>

          {/* <div>
            {this.loading ? (
              <Loader width={50} height={50} />
            ) : (
              <PaginatedTable>
                <TableData />
              </PaginatedTable>
            )}
          </div> */}
          <TableComponent
            addUpdateQuery={this.addUpdateQuery}
            deleteRecord={this.deleteRecord}
            schema={this.schema}
            runQuery={this.runQuery}
            data={this.data}
            loading={this.loading}
            paginationSettings={this.paginationSettings}
          />
        </div>
      </div>
    );
  }
}

export default Table;
