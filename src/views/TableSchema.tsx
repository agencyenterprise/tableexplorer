import { ConnectOptions } from "@tableland/sdk";
import Nullstack from "nullstack";
import TableNav from "../components/TableNav";
import { CustomClientContext } from "../types/CustomContexts";
import { parseTableName } from "../utils/SQLParser";
class TableSchema extends Nullstack {
  name = "";
  data = { columns: [], table_constraints: [] };
  options: ConnectOptions;

  async hydrate({ __tableland }: CustomClientContext) {
    this.options = __tableland?.options;

    this.getSchema();
  }

  initiate({ params }) {
    this.name = params.name;
  }
  async getSchema(context?: CustomClientContext) {
    const { __tableland, instances } = context;
    try {
      const schema = await __tableland.schema(this.name);
      if ((schema as any)?.message) {
        throw new Error((schema as any).message);
      }
      this.data = schema;
    } catch (err) {
      instances.toast._showErrorToast(err.message);
    }
  }
  render() {
    return (
      <div class="h-full overflow-y-auto">
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12">
          <h1 class="text-2xl mb-6">
            {parseTableName(this.options?.chainId, this.name)}
          </h1>
          {this.data && (
            <>
              <table class="min-w-full">
                <thead class="border-b">
                  <tr>
                    <th
                      scope="col"
                      class="text-sm font-bold px-6 py-4 text-left"
                    >
                      Column
                    </th>
                    <th
                      scope="col"
                      class="text-sm font-bold px-6 py-4 text-left"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      class="text-sm font-bold px-6 py-4 text-left"
                    >
                      Constraints
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.data?.columns.map((col, index) => (
                    <tr
                      class="border-b"
                      style={index % 2 === 0 ? "background-color: #2d2c33" : ""}
                    >
                      <td class="text-sm px-6 py-4 whitespace-nowrap">
                        {col.name}
                      </td>
                      <td class="text-sm px-6 py-4 whitespace-nowrap">
                        {col.type}
                      </td>
                      <td class="text-sm px-6 py-4 whitespace-nowrap">
                        {col.constraints.join(" | ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {this.data.table_constraints.length > 0 && (
                <>
                  <h2 class="text-xl my-6">Table Constraints</h2>
                  <ul>
                    {this.data.table_constraints.map((cons, index) => (
                      <li
                        class="border-b text-md px-6 py-4 whitespace-nowrap"
                        style={
                          index % 2 === 0 ? "background-color: #2d2c33" : ""
                        }
                      >
                        {cons}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default TableSchema;
