import Nullstack, { NullstackClientContext } from "nullstack";
import Sidebar from "./components/Sidebar";
import AddTable from "./views/AddTable";
import Home from "./views/Home";
import Login from "./views/Login";
import Table from "./views/Table";
// import "./styles.css";
import "../tailwind.css";
import Toast from "./components/Toast";
import { CustomClientContext } from "./types/CustomContexts";
import TablePermissions from "./views/TablePermissions";
import TableSchema from "./views/TableSchema";
class Application extends Nullstack {
  prepare({ page }: NullstackClientContext) {
    page.locale = "en-US";
    page.title = "TableExplorer - An Admin tool for TableLand";
    page.image = "/og.png";
    page.description =
      "A permissionless relational database for web3 natives. Built for devs, NFT creators, and web3 visionaries.";
  }

  render(context: NullstackClientContext) {
    const { __tableland } = context as CustomClientContext;

    return (
      <main class="w-full h-screen">
        <head>
          <title>TableExplorer - An Admin tool for TableLand</title>

          <meta
            name="keywords"
            content="tableland, database, web3, blockchain"
          />
          <meta name="author" content="AE Studio" />

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://tableexplorer.com/" />
          <meta
            property="og:title"
            content="TableExplorer - An Admin tool for TableLand"
          />
          <meta
            property="og:description"
            content="A permissionless relational database for web3 natives. Built for devs, NFT creators, and web3 visionaries."
          />
          <meta
            property="og:image"
            content="https://tableexplorer.com/og.png"
          />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://tableexplorer.com/" />
          <meta
            property="twitter:title"
            content="TableExplorer - An Admin tool for TableLand"
          />
          <meta
            property="twitter:description"
            content="A permissionless relational database for web3 natives. Built for devs, NFT creators, and web3 visionaries."
          />
          <meta
            property="twitter:image"
            content="https://tableexplorer.com/og.png"
          />
        </head>
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
                by
                <a href="https://ae.studio" target="_blank" class="px-1">
                  AE Studio
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
