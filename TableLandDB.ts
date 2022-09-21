import Dixie, { Table } from "dexie";
import { TableUserCollection } from "./src/types/DatabaseTypes";

export class TableLandDB extends Dixie {
  public tableUser!: Table<TableUserCollection, number>;

  public constructor() {
    super("tableland_admin");
    this.version(1).stores({
      tableUser: "++id,tableName,userAddress",
    });
  }
}
