import Nullstack from "nullstack";
import querystring from "query-string";
import { Connection } from "@tableland/sdk";
import TableNav from "../components/TableNav";

class Table extends Nullstack {
  name = "";
  query = "";
  data;

  loading = false;

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
  }

  initiate() {
    const query = querystring.parse(window.location.search);
    this.name = query.name;
    this.query = `SELECT * FROM ${this.name} LIMIT 50`;
  }

  render() {
    if (!this.name) return null;
    return (
      <>
        <TableNav />
        <div class="w-full min-h-full pt-8 px-12">
          <h1 class="text-2xl mb-6">{this.name}</h1>
          <textarea
            name="query"
            id="query"
            cols="30"
            rows="2"
            class="bg-background w-full"
            bind={this.query}
          />
          <button
            class="btn-primary my-4"
            onclick={this.runQuery}
            disabled={this.loading}
          >
            {this.loading ? "Loading..." : "Run Query"}
          </button>

          <h1 class="text-2xl mb-6">Data:</h1>
          {this.data ? (
            <table class="min-w-full">
              <thead class="border-b">
                <tr>
                  {this.data.columns.map((column) => (
                    <th
                      scope="col"
                      class="text-sm font-medium px-6 py-4 text-left"
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.data.rows.map((row) => (
                  <tr class="border-b">
                    {row.map((item) => (
                      <td class="text-sm px-6 py-4 whitespace-nowrap">
                        {item}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>Loading Data...</>
          )}
        </div>
      </>
    );
  }
}

export default Table;
