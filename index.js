const fse = require("fs-extra");
const path = require("path");
const setValue = require("set-value");

function findAllPackages(projectDir, depth) {
  const packagePathList = [];

  function filterPath(list) {
    var a = list.filter((item) => {
      // 排除隐藏目录
      if (/^\./.test(item)) {
        return false;
      }
      // 排除重复包
      if (/^\_/.test(item)) {
        return false;
      }
      return true;
    });
    return a;
  }

  function findPackages(rootDir) {
    const nodeModulesPath = path.join(rootDir, "node_modules");
    const packagePath = path.join(rootDir, "package.json");

    let basename = path.basename(rootDir);
    let dirname = path.dirname(rootDir);
    if (dirname.indexOf(`/node_modules/${basename}/`) > -1) {
      return false;
    }
    const matchs = rootDir.match(/node_modules/g);
    if (Array.isArray(matchs) && matchs.length > depth) {
      return false;
    }

    if (fse.existsSync(packagePath)) {
      packagePathList.push(packagePath);
    }
    const hasNodeModules = fse.existsSync(nodeModulesPath);
    const isPernalPackagePrefix =
      /node_modules$/.test(dirname) && /^\@/.test(basename);

    if (hasNodeModules) {
      let pathList = filterPath(fse.readdirSync(nodeModulesPath));
      pathList.forEach((item) => {
        findPackages(path.join(nodeModulesPath, item));
      });
    }
    if (isPernalPackagePrefix) {
      let pathList = filterPath(fse.readdirSync(rootDir));
      pathList.forEach((item) => {
        findPackages(path.join(rootDir, item));
      });
    }
  }

  findPackages(projectDir);

  return packagePathList;
}

function readPackages(entries, projectDir) {
  let tree = {};
  let temp = null;
  const placeholder = "{{BEE}}";

  for (let i = 0; i < entries.length; i++) {
    try {
      let item = entries[i];
      temp = require(item);
      if (!temp.name) {
        break;
      }

      // 去除工程目录前缀
      item = item.replace(projectDir + "/", "").replace("/?package.json", "");

      // 匹配 @ali/xx  @babel/xx 等私有包，将/做特殊处理
      let matchs = item.match(/\@.*?\//g);
      if (Array.isArray(matchs)) {
        matchs.forEach((match) => {
          let excaped = match.replace("/", placeholder);
          item = item.replace(match, excaped);
        });
      }
      // 1、路径中的.转义；2、将/替换为.便于 setValue；3、还原私有包的/
      item = item
        .replace(/\./g, "\\.")
        .replace(/\//g, ".")
        .replace(new RegExp(placeholder, "g"), "/");

      setValue(tree, item, {
        name: temp.name,
        version: temp.version,
      });
      temp = null;
    } catch (e) {}
  }
  return tree;
}

function transformToSchema(tree, dependenciesKey) {
  function tree2Schema(tree) {
    let schema = {};
    if (tree["node_modules"]) {
      schema[dependenciesKey] = Object.keys(tree["node_modules"]).map(
        (item) => {
          return tree2Schema(tree["node_modules"][item]);
        }
      );
    } else {
      schema[dependenciesKey] = [];
    }
    if (tree["package.json"]) {
      const item = tree["package.json"];
      schema.name = item.name;
      schema.version = item.version;
    }
    return schema;
  }
  return tree2Schema(tree);
}

/**
 * traverse package from node_modules and return json schema
 * @param {*} projectDir project directory
 * @param {*} depth  node_modules max depth
 * @returns  {
      "dependencies": [
        {
          "name": "isexe",
          "version": "2.0.0",
          "dependencies": []
        }
      ],
      "name": "which",
      "version": "2.0.2"
    }
 */
function nodeModules2Schema(projectDir, options = {}) {
  if (!projectDir) {
    throw new Error("projectDir must be provided");
  }
  console.time("NodeModulesToSchemaTime");
  const depth = options.depth || 5;
  const dependenciesKey = options.dependenciesKey || "dependencies";
  const absoluteDir = path.resolve(projectDir);
  const packageList = findAllPackages(absoluteDir, depth);
  const tree = readPackages(packageList, absoluteDir);
  const schema = transformToSchema(tree, dependenciesKey);
  console.timeEnd("NodeModulesToSchemaTime");
  return schema;
}

module.exports = nodeModules2Schema;
