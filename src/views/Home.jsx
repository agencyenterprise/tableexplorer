import Nullstack from "nullstack";

class Home extends Nullstack {
  rawQuery = ""
  redirectToAddTableRoute({router}) {
    router.path = "/add-table"
  }
  render() {
    return (
      <div class="flex flex-col mt-10 w-full px-10 py-10 bg-slate-800 rounded-md">
        <textarea
          bind={this.rawQuery}
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          data-gramm="false"
          style="background: none; padding-top: 10px; padding-bottom: 10px; padding-left: 5px"
        ></textarea>
        <div class="my-10 pt-10">
          <button
            class="bg-primary w-32 mx-10 h-12 text-white"
          >
            Make Query
          </button>
          <button
            class="bg-primary w-32 mx-10 h-12 text-white"
            onclick={this.redirectToAddTableRoute}
          >
            Add Table
          </button>
        </div>
      </div>
    );
  }
}

export default Home;
