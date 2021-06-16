#!/usr/bin/env node

const { exec, execSync } = require("child_process");
const createBuilds = require("../src/create-builds");

const projectPath = process.argv[2];
if (!projectPath) {
  throw new Error("Please provide the project path as the first argument!");
}

const resolveSource = () => {
  return new Promise((resolve, _reject) => {
    exec("bundle show decidim", { stdio: "pipe" }, (error, stdout) => {
      if (error) {
        resolve("https://github.com/decidim/decidim/packages#develop");
      } else {
        resolve(`${stdout.trim()}/packages`);
      }
    });
  });
}

const buildDir = `${projectPath}/tmp/npmbuild`;

resolveSource().then((source) => {
  console.log("Creating Decidim NPM builds...");
  createBuilds(source, buildDir).then((packages) => {
    console.log("Builds created:");
    packages.forEach((pkg) => {
      console.log(pkg.file)
    });
  });
});
