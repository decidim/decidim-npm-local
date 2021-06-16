const degit = require("degit");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const packageDefinitions = {};

const packageJsonFor = (packagePath) => {
  if (packageDefinitions[packagePath]) {
    return packageDefinitions[packagePath];
  }

  packageDefinitions[packagePath] = JSON.parse(
    fs.readFileSync(path.join(packagePath, "package.json"), "utf8")
  )

  return packageDefinitions[packagePath]
}

const resolvePackageTarball = (packagePath) => {
  const packageJson = packageJsonFor(packagePath);

  return `${packageJson.name.replace("@", "").replace(/\//, "-")}-${packageJson.version}.tgz`;
}

const createBuildDir = (source, targetPath) => {
  if (source.match(/^([\.]{1,2}|~)?\//)) {
    // File path
    return fse.copy(source, targetPath);
  } else {
    // Git
    const emitter = degit(source, {
      cache: false,
      force: true,
      verbose: true
    });

    return emitter.clone(targetPath);
  }
}

module.exports = (source, buildDir) => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }

  // Make sure the parent dir exists
  const parentDir = path.dirname(buildDir);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    createBuildDir(source, buildDir).then(() => {
      // Build all Decidim NPM packages with `npm pack` and change the file
      // references of each pack to point to the correct tarball.
      (async () => {
        try {
          // Get the files as an array
          const packageDirs = await fs.promises.readdir(buildDir);

          // Loop through all packages
          const packages = [];
          packageDirs.forEach((file) => {
            const packagePath = path.join(buildDir, file);
            const packageJson = packageJsonFor(packagePath);

            // Resolve the local dependencies
            [
              "dependencies",
              "devDependencies",
              "peerDependencies",
              "optionalDependencies"
            ].forEach((dependencyCat) => {
              const deps = packageJson[dependencyCat];
              if (!deps) {
                return;
              }

              Object.keys(deps).forEach((key) => {
                const val = deps[key];
                if (!val.match(/^file:/)) {
                  return;
                }

                const refPath = path.join(packagePath, val.replace(/^file:/, ""));
                const refPackageFile = resolvePackageTarball(refPath);
                deps[key] = `file:${refPackageFile}`;
              });
            });
            fs.writeFileSync(`${packagePath}/package.json`, JSON.stringify(packageJson, null, 2));

            execSync("npm pack", { cwd: packagePath, stdio: "pipe" });

            const packageFile = resolvePackageTarball(packagePath);
            fs.renameSync(`${packagePath}/${packageFile}`, `${buildDir}/${packageFile}`);
            fs.rmdirSync(packagePath, { recursive: true });

            packages.push({
              name: packageJson.name,
              version: packageJson.version,
              file: `${buildDir}/${packageFile}`
            });
          });

          resolve(packages);
        } catch (e) {
          reject(e);
        }
      })();
    });
  });
}
