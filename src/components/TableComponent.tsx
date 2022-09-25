import Nullstack, { NullstackNode } from "nullstack";
import { range } from "../utils/TableUtils";
import UpdateIcon from "../assets/Update";
import DeleteIcon from "../assets/Delete";
import Loader from "../assets/Loader";
import { CustomClientContext } from "../types/CustomContexts";
import { ConnectOptions, ReadQueryResult, SchemaColumns } from "@tableland/sdk";
import PaginationSettings, { IPagination } from "../types/pagination";

declare function TableHeader(): NullstackNode;
declare function ActionBtn(): NullstackNode;
declare function TableData(): NullstackNode;
declare function TableBody(): NullstackNode;
declare function TablePagination(): NullstackNode;
declare function TablePaginationButton(): NullstackNode;
declare function PaginatedTable(): NullstackNode;
class TableComponent extends Nullstack {
  name = "";
  rowsPerPageOptions = ["5", "10", "20", "30"];
  rowsPerPageOption = "5";
  initiate({ params }: CustomClientContext) {
    this.name = params.name as string;
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
  renderActionBtn({ row, addUpdateQuery, deleteRecord, loading, pkColumn, pkColumnIndex, shouldMutate }) {
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
    const mutate = shouldMutate();
    const disabled = loading || mutate;
    return (
      <>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button
              class="text-green-standard hover:text-green-100"
              style={disabled ? "opacity: 0.5;" : ""}
              onclick={updateQuery}
              disabled={disabled}
            >
              <UpdateIcon />
            </button>
          </div>
        </td>
        <td class="text-sm py-4 whitespace-nowrap">
          <div class="flex items-center h-full">
            <button class="text-red-standard hover:text-red-400" style={disabled ? "opacity: 0.5;" : ""} onclick={deleteWrapper} disabled={disabled}>
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
    runQuery,
    instances,
    baseQuery,
    shouldPaginate,
  }: CustomClientContext & {
    paginationSettings: IPagination;
    item: any;
    runQuery: (context?: CustomClientContext) => Promise<void>;
    baseQuery: (context?: CustomClientContext & PaginationSettings) => string;
    shouldPaginate: () => boolean;
  }) {
    const changePage = async () => {
      paginationSettings.currentPage = item.page;
      instances.code_editor.setEditorValue({ query: baseQuery() });
      await runQuery();
    };
    const disablePagination = !shouldPaginate();
    return (
      <div class="">
        <button
          class="min-w-[30px] min-h-[30px] items-center px-1 rounded-md"
          onclick={changePage}
          disabled={disablePagination}
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
      baseQuery: (context?: CustomClientContext & PaginationSettings) => string;
      paginationSettings: IPagination;
    }
  ) {
    const { instances, runQuery, paginationSettings, baseQuery } = context!;
    if (paginationSettings.totalPages && paginationSettings.currentPage <= paginationSettings.totalPages) {
      paginationSettings.currentPage++;
      instances.code_editor.setEditorValue({ query: baseQuery() });
      await runQuery();
    }
  }
  async prevPaginationButton(
    context?: CustomClientContext & {
      runQuery: (context?: CustomClientContext) => Promise<void>;
      baseQuery: (context?: CustomClientContext & PaginationSettings) => string;
      paginationSettings: IPagination;
    }
  ) {
    const { instances, runQuery, paginationSettings, baseQuery } = context!;
    if (paginationSettings.currentPage >= 0) {
      paginationSettings.currentPage--;
      instances.code_editor.setEditorValue({ query: baseQuery() });
      await runQuery();
    }
  }
  renderTablePagination(context?: CustomClientContext & { paginationSettings: IPagination; shouldPaginate: () => boolean }) {
    const { paginationSettings, shouldPaginate } = context!;
    const reachedFinalPage = !shouldPaginate() ? true : paginationSettings.currentPage == paginationSettings.totalPages;
    const inFirstPage = !shouldPaginate() ? true : !paginationSettings.currentPage;
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
    data,
    runQuery,
  }: CustomClientContext & {
    paginationSettings: IPagination;
    data: ReadQueryResult<any[]>;
    runQuery: (context?: CustomClientContext) => Promise<void>;
  }) {
    return (
      <div>
        <div class="py-3">
          <span class="pr-5">Show</span>
          <select
            class="bg-background"
            name="type"
            value={this.rowsPerPageOption}
            onchange={({ event }) => {
              paginationSettings.rowsPerPage = Number(event.target.value);
              paginationSettings.currentPage = 0;
              this.rowsPerPageOption = event.target.value;
              runQuery();
            }}
          >
            {this.rowsPerPageOptions.map((type) => (
              <option class="bg-background" value={type}>
                {type.toLocaleUpperCase()}
              </option>
            ))}
          </select>
          <span class="pl-5">Entries</span>
        </div>
        <div class="py-10 overflow-auto border-solid border border-slate-300" style="max-width: calc(100% - 10px); max-height: 800px">
          {children}
        </div>
        {data && (
          <div class="flex justify-between items-center h-full px-2 pt-3">
            <div>
              <p>
                {data.rows?.length || 0} of {paginationSettings.totalCount} Entries
              </p>
            </div>
            <div class="pt-3 px-1">
              <TablePagination />
            </div>
          </div>
        )}
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
  render({ loading }: CustomClientContext & { loading: boolean }) {
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
