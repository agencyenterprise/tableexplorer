import Nullstack from "nullstack";
import Header from "./components/Header/Header";
import Sidebar from "./components/Header/Sidebar";
import AddTable from "./views/AddTable";
import Home from "./views/Home";
import Login from "./views/Login";
import Table from "./views/Table";
import "./styles.css";


class Application extends Nullstack {
  prepare({ page }) {
    page.locale = "en-US";
  }
  renderHead() {
    return (
      <head>
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Crete+Round&family=Roboto&display=swap"
          rel="stylesheet"
        />
        {/* <link href="/styles.css" rel="stylesheet" /> */}
      </head>
    );
  }

  render({ __tableland }) {
    return (
      <main class="w-full h-screen">
        <Head />
        {__tableland?.token?.token ? (
          <div class="w-full h-full">
            <div
              class="w-full flex justify-between"
              style="height: calc(100% - 40px)"
            >
              <Sidebar id="sidebar" />
              <Home route="/" />
              <Table route="/table" />
              <AddTable route="/addTable" />
            </div>
            <p class="border-t text-center p-2">
              Documentation can be found{" "}
              <a
                class="font-bold hover:underline text-primary"
                target="blank"
                href="https://docs.tableland.xyz/"
              >
                here
              </a>
            </p>
          </div>
        ) : (
          <Login />
        )}
      </main>
    );
  }
}

export default Application;
