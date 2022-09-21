import { Prisma, PrismaClient } from "@prisma/client";
import { Connection } from "@tableland/sdk";
import { NullstackClientContext } from "nullstack";

export type CustomClientContext = NullstackClientContext & {
  __tableland: Connection & { signerAddress?: string };
  instances: Record<string, any>;
};

export type WithNullstackContext<T> = Partial<CustomClientContext> & T;

export type CustomServerContext = NullstackClientContext & {
  prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
};

export type WithCustomServerContext<T> = Partial<CustomServerContext> & T;



