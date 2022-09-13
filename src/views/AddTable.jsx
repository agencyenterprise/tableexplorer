import Nullstack from "nullstack";
import { Connection } from "@tableland/sdk";

class AddTable extends Nullstack {
  prefix = "";
  query = "id integer, name text, primary key (id)";
  loading = false;
  err = "";

  async createTable({ __tableland, context }) {
    if (!this.prefix) return;

    // const tl =  __tableland as Connection;

    this.loading = true;
    this.err = "";
    try {
      await __tableland.create(
        this.query, // Table schema definition
        {
          prefix: this.prefix, // Optional `prefix` used to define a human-readable string
        }
      );
      await context.sidebar.getDatabases();
      this.loading = false;
    } catch (err) {
      this.err = err.message;
      console.error("err", err);
    } finally {
      this.loading = false;
    }
  }

  render() {
    return (
      <div class="w-full min-h-full pt-8 px-12">
        <h1 class="text-2xl mb-4 font-bold">Create Table</h1>
        {this.err && <p class="text-red-600 my-4">{this.err}</p>}
        <textarea
          name="query"
          id="query"
          cols="30"
          rows="8"
          class="bg-background w-full"
          bind={this.query}
        />
        <input
          type="text"
          bind={this.prefix}
          placeholder="Table Prefix"
          class="bg-background mb-4"
        />
        <button
          class="btn-primary"
          disabled={this.loading}
          onclick={this.createTable}
        >
          {this.loading ? "Loading..." : "Create Table"}{" "}
        </button>
      </div>
    );
  }
}

export default AddTable;
