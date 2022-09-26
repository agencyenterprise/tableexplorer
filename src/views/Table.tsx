import Nullstack from "nullstack";
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
  rawRecords,
  parseCountQuery,
  isAggregatorOnly,
  isInsertRecord,
  isUpdateRecord,
} from "../utils/SQLParser";
import TableNav from "../components/TableNav";
import ReadIcon from "../assets/Read";
import InsertIcon from "../assets/Insert";
import CodeEditor from "../components/CodeEditor";
import { CustomClientContext, WithNullstackContext } from "../types/CustomContexts";
import { ConnectOptions, ReadQueryResult, SchemaColumns } from "@tableland/sdk";
import { SchemaQueryResult } from "@tableland/sdk";
import TableComponent from "../components/TableComponent";

class Table extends Nullstack {
  name = "";
  query = "";
  data: ReadQueryResult<any[]> | null = null;
  loading = false;
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
    rowsPerPage: 5,
    totalCount: 0,
  };
  options: ConnectOptions;
  hasPk: boolean = true;
  async readQuery(context?: CustomClientContext) {
    const { __tableland, instances } = context!;
    try {
      const query = this.baseQuery();
      instances.code_editor.setEditorValue({ query });
      const data = await __tableland.read(query);
      this.data = data;
      if (this.pkColumn) {
        this.hasPk = !!data.columns.find((c) => c.name === this.pkColumn);
      }
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async runQuery(context?: WithNullstackContext<{ resetPagination: boolean }>) {
    const { instances, resetPagination } = context!;
    this.loading = true;
    try {
      this.query = instances?.code_editor.getEditorValue();

      const isRead = isReadQuery(this.query);
      if (isRead) {
        if (resetPagination) {
          this.paginationSettings.currentPage = 0;
        }
        await this.readQuery();
      } else {
        await this.insertData();
      }
      await this.getInitialPaginationSettings();
    } catch (err) {
      instances?.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
  }
  async request(context?: CustomClientContext) {
    const { instances } = context!;
    await this.runQuery();
    instances.code_editor.setEditorValue({ query: this.baseQuery() });
  }
  async insertData(context?: CustomClientContext) {
    const { __tableland, instances } = context!;
    try {
      await __tableland.write(this.query);
      this.paginationSettings.currentPage = 0;
      const fallbackSQL = buildSelectQuery(this.fallbackQuery(), 5, 0);
      instances.code_editor.setEditorValue({ query: fallbackSQL });
      const data = await __tableland.read(fallbackSQL);
      this.data = data;
      instances.toast._showInfoToast(`Table ${this.name} updated with success!`);
      this.readOrInsert = this.readString;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  async hydrate({ __tableland }: CustomClientContext) {
    if (!this.name) return;
    this.options = __tableland?.options;
    const data = await __tableland.read(this.baseQuery());
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
    const query = this.query ? this.query : `SELECT * FROM ${this.name};`;
    const newQuery = buildSelectQuery(query, limit, offset);
    return newQuery;
  }
  fallbackQuery() {
    const offset = this.paginationSettings.currentPage * this.paginationSettings.rowsPerPage;
    const limit = this.paginationSettings.rowsPerPage;
    const query = `SELECT * FROM ${this.name};`;
    const newQuery = buildSelectQuery(query, limit, offset);
    return newQuery;
  }
  async getInitialPaginationSettings(context?: CustomClientContext) {
    const { __tableland } = context!;
    try {
      let rowCount: number = 0;
      const query = parseCountQuery(this.query);
      const countQuery_ = await __tableland.read(query);
      rowCount = (countQuery_.rows || [[]])[0][0] || 0;
      if (countQuery_.rows?.length > 1) {
        rowCount = countQuery_.rows?.length;
      }
      const count = rowCount ? rowCount - 1 : rowCount;
      const totalPages = Math.floor(count / this.paginationSettings.rowsPerPage);
      const aggregatorOnly = isAggregatorOnly(this.query);
      this.paginationSettings.totalPages = aggregatorOnly ? 0 : totalPages;
      if (countQuery_.rows?.length >= this.data?.rows?.length! && totalPages == 0) {
        this.paginationSettings.totalCount = this.data?.rows.length!;
      } else {
        this.paginationSettings.totalCount = aggregatorOnly ? this.data?.rows.length || 0 : rowCount;
      }

      this.paginationSettings.currentPage = aggregatorOnly ? 0 : this.paginationSettings.currentPage;
    } catch (err) {
      console.log(err);
    }
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
          {this.data!.columns?.map((column) => (
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
      this.paginationSettings.currentPage = 0;
      const fallbackSQL = buildSelectQuery(this.fallbackQuery(), 5, 0);
      instances!.code_editor.setEditorValue({ query: fallbackSQL });
      const data = await __tableland!.read(fallbackSQL);
      this.data = data;
      instances!.toast._showInfoToast(`Row deleted from table ${this.name}`);
    } catch (err) {
      instances!.toast._showErrorToast(err.message);
    } finally {
      this.loading = false;
    }
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
  addUpdateQuery({ instances, recordId, pkColumn, row, ...rest }: WithNullstackContext<{ recordId: number; pkColumn: string; row: any }>) {
    const updateInput = Object.keys(this.tableInput).map((v) => {
      this.tableInput[v].value = row[v];
      return this.tableInput[v];
    });
    document?.getElementById("editor")?.scrollIntoView();
    this.query = parseUpdateData(updateInput, this.name, recordId, pkColumn);

    instances!.code_editor.setEditorValue({ query: this.query });
  }
  updateToBaseQuery(context?: CustomClientContext) {
    const { instances } = context!;
    instances.code_editor.setEditorValue({ query: this.fallbackQuery() });
  }
  populateInputFields({ columns }) {
    const r = columns.reduce((acc, column, index) => {
      column.value = "";
      column.index = index;
      return [...acc, column];
    }, []);
    return r;
  }
  shouldMutate() {
    return !rawRecords(this.query) || isInsertRecord(this.query) || !this.hasPk;
  }
  shouldPaginate() {
    return !isInsertRecord(this.query);
  }
  render() {
    if (!this.name) return null;
    const runQueryPaginationReset = () => this.runQuery({ resetPagination: true });
    return (
      <div class="overflow-y-auto h-full">
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12 overflow-y-auto" id="editor">
          <h1 class="text-2xl mb-6">{parseTableName(this.options?.chainId!, this.name)}</h1>
          <div>
            <CodeEditor key="code_editor" value={this.query} onchange={this.onEditorChange} />
          </div>
          <div class="flex flex-col items-start justify-start">
            <span class="my-4 w-6 cursor-pointer" onclick={this.insertOrRead} title={this.readOrInsert} disabled={this.loading}>
              {this.readOrInsert == this.readString ? <ReadIcon width={25} height={25} /> : <InsertIcon width={25} height={25} />}
            </span>
            <button class="btn-primary my-4" onclick={runQueryPaginationReset} disabled={this.loading}>
              Run Query
            </button>
          </div>
          <TableComponent
            addUpdateQuery={this.addUpdateQuery}
            deleteRecord={this.deleteRecord}
            schema={this.schema}
            runQuery={this.request}
            data={this.data}
            loading={this.loading}
            paginationSettings={this.paginationSettings}
            pkColumn={this.pkColumn}
            pkColumnIndex={this.pkColumnIndex}
            shouldMutate={this.shouldMutate}
            baseQuery={this.baseQuery}
            shouldPaginate={this.shouldPaginate}
          />
        </div>
      </div>
    );
  }
}

export default Table;
