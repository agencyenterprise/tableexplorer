import Nullstack from "nullstack";
import querystring from "query-string";

class TableSchema extends Nullstack {
  name = "";
  data;

  async hydrate({ __tableland }) {
    const data = await __tableland.schema(this.name);
    this.data = data;
  }

  initiate() {
    const query = querystring.parse(window.location.search);
    this.name = query.name;
  }

  render() {
    return (
      <div class="w-full min-h-full pt-8 px-12">
        <h1 class="text-2xl mb-6">{this.name} Schema</h1>
        {this.data && (
          <>
            <table class="min-w-full">
              <thead class="border-b">
                <tr>
                  <th scope="col" class="text-sm font-bold px-6 py-4 text-left">
                    Column
                  </th>
                  <th scope="col" class="text-sm font-bold px-6 py-4 text-left">
                    Type
                  </th>
                  <th scope="col" class="text-sm font-bold px-6 py-4 text-left">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.data.columns.map((col, index) => (
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
                      style={index % 2 === 0 ? "background-color: #2d2c33" : ""}
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
    );
  }
}

export default TableSchema;
