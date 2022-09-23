import Nullstack, { NullstackNode } from "nullstack";
import { buildSelectQuery } from "../utils/SQLParser";
import { range } from "../utils/TableUtils";
import UpdateIcon from "../assets/Update";
import DeleteIcon from "../assets/Delete";
import Loader from "../assets/Loader";
import { CustomClientContext } from "../types/CustomContexts";
import { ConnectOptions, ReadQueryResult, SchemaColumns } from "@tableland/sdk";
import { SchemaQueryResult } from "@tableland/sdk";

declare function TableHeader(): NullstackNode;
declare function ActionBtn(): NullstackNode;
declare function TableData(): NullstackNode;
declare function TableBody(): NullstackNode;
declare function TablePagination(): NullstackNode;
declare function TablePaginationButton(): NullstackNode;
declare function PaginatedTable(): NullstackNode;
class TableComponent extends Nullstack {
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

  initiate({ params, schema }: CustomClientContext & { schema: SchemaQueryResult | null }) {
    this.name = params.name as string;
    this.readOrInsert = this.insertString;
    this.schema = schema;
  }
  baseQuery(
    context?: CustomClientContext & { paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number } }
  ) {
    const { paginationSettings } = context!;
    const offset = paginationSettings.currentPage * paginationSettings.rowsPerPage;
    const limit = paginationSettings.rowsPerPage;
    const query = `SELECT * FROM ${this.name};`;
    const newQuery = buildSelectQuery(query, limit, offset);
    return newQuery;
  }

  renderTableHeader(context?: CustomClientContext & { data: ReadQueryResult<any[]> }) {
    const { data } = context!;
    return (
      <thead class="border-b">
        <tr>
          {data.columns?.map((column) => (
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
  renderActionBtn({ row, addUpdateQuery, deleteRecord, loading, pkColumn, pkColumnIndex }) {
    const deleteWrapper = () =>
      deleteRecord({
        recordId: row[pkColumnIndex],
        recordIndex: pkColumnIndex,
      });
    const updateQuery = () =>
      addUpdateQuery({
        recordId: row[pkColumnIndex],
        pkColumn: pkColumn,
        row: row,
      });
    return (
      <>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-green-standard hover:text-green-100" onclick={updateQuery} disabled={loading}>
              <UpdateIcon />
            </button>
          </div>
        </td>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-red-standard hover:text-red-400" onclick={deleteWrapper} disabled={loading}>
              <DeleteIcon />
            </button>
          </div>
        </td>
      </>
    );
  }
  renderTableBody(context?: CustomClientContext & { data: ReadQueryResult<any[]> }) {
    const { data } = context!;
    return (
      <tbody>
        {data.rows?.map((row) => (
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
  renderTablePaginationButton({
    item,
    paginationSettings,
  }: {
    paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number };
    item: any;
  }) {
    const changePage = () => {
      paginationSettings.currentPage = item.page;
    };
    return (
      <div class="">
        <button
          class="min-w-[30px] min-h-[30px] items-center px-1 rounded-md"
          onclick={changePage}
          style={paginationSettings.currentPage == item.page ? "background-color: #E1C2D8" : ""}
        >
          {item.page + 1}
        </button>
      </div>
    );
  }
  async nextPaginationButton(
    context?: CustomClientContext & {
      runQuery: (context?: CustomClientContext) => Promise<void>;
      paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number };
    }
  ) {
    const { instances, runQuery, paginationSettings } = context!;
    if (paginationSettings.totalPages && paginationSettings.currentPage <= paginationSettings.totalPages) {
      paginationSettings.currentPage++;
      instances.code_editor.setEditorValue({ query: this.baseQuery() });
      await runQuery();
    }
  }
  async prevPaginationButton(
    context?: CustomClientContext & {
      runQuery: (context?: CustomClientContext) => Promise<void>;
      paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number };
    }
  ) {
    const { instances, runQuery, paginationSettings } = context!;
    if (paginationSettings.currentPage >= 0) {
      paginationSettings.currentPage--;
      instances.code_editor.setEditorValue({ query: this.baseQuery() });
      await runQuery();
    }
  }
  renderTablePagination(
    context?: CustomClientContext & { paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number } }
  ) {
    const { paginationSettings } = context!;
    const reachedFinalPage = paginationSettings.currentPage == paginationSettings.totalPages;
    const inFirstPage = !paginationSettings.currentPage;
    const selectLimit = (index: number, limit: number = 2): boolean =>
      paginationSettings.currentPage <= index + limit && paginationSettings.currentPage >= index - limit;
    return (
      <div class="flex flex-row">
        <div class="flex min-w-[30px] min-h-[30px] items-center pr-3">
          <button class="items-center" onclick={this.prevPaginationButton} disabled={inFirstPage} style={inFirstPage ? "opacity: 0.5;" : ""}>
            Previous
          </button>
        </div>
        {range(paginationSettings.totalPages)
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
  renderPaginatedTable({
    children,
    paginationSettings,
  }: {
    children: NullstackNode;
    paginationSettings: { currentPage: number; totalPages: number; rowsPerPage: number; totalCount: number };
  }) {
    return (
      <div>
        <div class="py-10 overflow-auto border-solid border border-slate-300" style="max-width: calc(100% - 10px); max-height: 800px">
          {children}
        </div>
        <div class="flex justify-between items-center h-full px-2 pt-3">
          <div>
            <p>
              {paginationSettings.rowsPerPage} of {paginationSettings.totalCount} Entries
            </p>
          </div>
          <div class="pt-3 px-1">
            <TablePagination />
          </div>
        </div>
      </div>
    );
  }
  renderTableData(context?: CustomClientContext & { data: ReadQueryResult<any[]> }) {
    const { data } = context!;
    return data ? (
      <table class="min-w-full">
        <TableHeader />
        <TableBody />
      </table>
    ) : (
      <Loader width={50} height={50} />
    );
  }
  render({ loading }: CustomClientContext & { loading: boolean; schema: SchemaQueryResult | null }) {
    if (!this.name) return null;
    return (
      <div>
        {loading ? (
          <Loader width={50} height={50} />
        ) : (
          <PaginatedTable>
            <TableData />
          </PaginatedTable>
        )}
      </div>
    );
  }
}

export default TableComponent;
