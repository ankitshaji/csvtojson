#!/usr/bin/env node

import * as Tracer from "tracer";
import { Arguments } from "yargs";
import { Main } from "../lib/main";
import yargs from "yargs/yargs";

const logLevel: string = process.env.TRACER_LEVEL || "info";
const logger: Tracer.Tracer.Logger = Tracer.colorConsole({
  level: logLevel,
});

const parameters: Arguments = yargs(process.argv.slice(2))
  .options({
    i: { type: `string`, alias: `id`, description: `School ID`, demand: true },
    f: {
      type: `string`,
      description: `Path to CSV file`,
      demand: true,
      alias: "file",
    },
    d: {
      type: `string`,
      default: `|`,
      alias: `delim`,
      description: `File Separator, Defaults to "|"`,
    },
    e: { type: `string`, default: `prod`, alias: `env`, description: `` },
  })
  .parseSync();
if (!parameters.id && parameters.id === "") {
  logger.error("SchoolID cannot be empty");
} else if (!parameters.file && parameters.file === "") {
  logger.error("File field cannot be empty");
} else {
  const main = new Main(parameters);
  main.init();
}
