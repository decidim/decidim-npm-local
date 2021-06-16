#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectPath = process.argv[2];
if (!projectPath) {
  throw new Error("Please provide the project path as the first argument!");
}

const buildDir = `${projectPath}/tmp/npmbuild`;

(async () => {
  const packageFiles = await fs.promises.readdir(buildDir);
  packageFiles.forEach((file) => {
    const packagePath = path.join(buildDir, file);

    if (file.match(/decidim-all-/)) {
      console.log("Installing @decidim/all...");
      execSync(`npm install ${packagePath}`, { cwd: projectPath, stdio: "inherit" });
    } else if (file.match(/decidim-dev-/)) {
      console.log("Installing @decidim/dev...");
      execSync(`npm install -D ${packagePath}`, { cwd: projectPath, stdio: "inherit" });
    }
  });
})();
