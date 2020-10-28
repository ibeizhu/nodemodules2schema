const fse = require("fs-extra");

const nodeModules2Schema = require("../index");

const projectDir = "./";

const schema = nodeModules2Schema(projectDir, {
  // depth: 5,
  // dependenciesKey: "children",
});

fse.outputFileSync("./test/schema.json", JSON.stringify(schema));
