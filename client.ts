import Nullstack from "nullstack";
import Application from "./src/Application";
import { CustomClientContext } from "./src/types/CustomContexts";
import { TableLandDB } from "./TableLandDB";

const context = Nullstack.start(Application) as CustomClientContext;

context.start = async function start() {
  // https://nullstack.app/application-startup

  const db = new TableLandDB();

  context.db = db;
};

export default context;
