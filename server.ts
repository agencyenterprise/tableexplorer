import { PrismaClient } from "@prisma/client";
import Nullstack from "nullstack";
import Application from "./src/Application";
import { CustomServerContext } from "./src/types/CustomContexts";

const context = Nullstack.start(Application) as CustomServerContext;

context.start = async function start() {
  // https://nullstack.app/application-startup
  const prisma = new PrismaClient();
  context.prisma = prisma;
};

export default context;
