import { Connection } from "@tableland/sdk";
import { TableLandDB } from "../../TableLandDB";
import { NullstackClientContext } from "nullstack";

export type CustomClientContext = NullstackClientContext & {
  __tableland: Connection & { signerAddress?: string };
  instances: Record<string, any>;
  db: TableLandDB;
};

export type WithNullstackContext<T> = Partial<CustomClientContext> & T;

export type CustomServerContext = NullstackClientContext & {};

export type WithCustomServerContext<T> = Partial<CustomServerContext> & T;
