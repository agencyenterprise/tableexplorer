import Nullstack from "nullstack";
import Sidebar from "./components/Sidebar";
/* import AddTable from "./views/AddTable";
import Table from "./views/Table";
import TableSchema from "./views/TableSchema";
import TablePermissions from "./views/TablePermissions"; */
import Home from "./views/Home";
import Login from "./views/Login";

import "./styles.css";
import Toast from "./components/Toast";
class Application extends Nullstack {
  prepare({ page }) {
    page.locale = "en-US";
  }
  renderHead() {
    return (
      <head>
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Crete+Round&family=Roboto&display=swap" rel="stylesheet" />
      </head>
    );
  }

  render({ __tableland }) {
    return (
      <>
        <main class="w-full h-screen">
          <Head />
          {__tableland?.token?.token ? (
            <div class="w-full h-full">
              <div class="w-full flex justify-between" style="height: calc(100% - 50px)">
                <Sidebar key="sidebar" />
                <div class="flex flex-col w-full h-full" style="height: calc(100% - 50px); min-width: calc(100% - 300px);">
                  <Home route="/" />
                  {/* <Table route="/table" />
                  <TableSchema route="/schema" />
                  <AddTable route="/addTable" />
                  <TablePermissions route="/permissions" /> */}
                </div>
              </div>
              <Toast key="toast" />
              <div class="flex  justify-center border-t items-center h-12">
                <p class="text-center flex items-center">
                  Made with <span class="pl-2 pr-1">❤️</span>
                  <a href="https://ae.studio" target="_blank" class="px-1">
                    by AE Studio
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <Login />
          )}
        </main>
      </>
    );
  }
}

export default Application;
