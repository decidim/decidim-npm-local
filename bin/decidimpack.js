#!/usr/bin/env node

const createBuilds = require("../src/create-builds");
const resolveSource = require("../src/resolve-source");
const path = require("path");

let projectPath = process.argv[2];
if (!projectPath) {
  throw new Error("Please provide the project path as the first argument!");
}

// Normalize the path to remove any relative references
projectPath = path.resolve(projectPath);

const buildDir = `${projectPath}/tmp/npmbuild`;

resolveSource(projectPath).then((source) => {
  console.log("Creating Decidim NPM builds...");
  console.log(`  source: ${source}`);
  createBuilds(source, buildDir).then((packages) => {
    console.log("Builds created:");
    packages.forEach((pkg) => {
      console.log(pkg.file)
    });
  });
});
