import Nullstack, { NullstackClientContext } from "nullstack";
import Sidebar from "./components/Sidebar";
import AddTable from "./views/AddTable";
import Home from "./views/Home";
import Login from "./views/Login";
import Table from "./views/Table";
// import "./styles.css";
import TableSchema from "./views/TableSchema";
import TablePermissions from "./views/TablePermissions";
import Toast from "./components/Toast";
import { CustomClientContext } from "./types/CustomContexts";
import "../tailwind.css";

class Application extends Nullstack {
  prepare({ page }: NullstackClientContext) {
    page.locale = "en-US";
  }

  render({ __tableland }: CustomClientContext) {
    return (
      <main class="w-full h-screen">
        {__tableland?.token?.token ? (
          <div class="w-full h-full">
            <div
              class="w-full flex justify-between"
              style="height: calc(100% - 50px)"
            >
              <Sidebar key="sidebar" />
              <div
                class="flex flex-col w-full h-full"
                style="height: calc(100% - 50px); min-width: calc(100% - 300px);"
              >
                <Home route="/" />
                <Table route="/table" />
                <TableSchema route="/schema" />
                <AddTable route="/addTable" />
                <TablePermissions route="/permissions" />
              </div>
            </div>
            <Toast key="toast" />
            <div class="flex  justify-center border-t items-center h-12">
              <div class="flex relative items-baseline">
                <p class="text-center flex items-center relative">Made with </p>
                <span class="heart" />
                <a href="https://ae.studio" target="_blank" class="px-1">
                  by AE Studio
                </a>
              </div>
            </div>
          </div>
        ) : (
          <Login />
        )}
      </main>
    );
  }
}

export default Application;
