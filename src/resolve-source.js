const { parse: parseGemfile } = require("@snyk/gemfile");
const path = require("path");

const resolveGemfileSource = (projectPath) => {
  return new Promise((resolve, reject) => {
    parseGemfile(`${projectPath}/Gemfile.lock`).then((gemfile) => {
      for (const [type, defs] of Object.entries(gemfile)) {
        if (type.match(/^GIT[0-9]*/)) {
          if (defs.specs["decidim"]) {
            resolve(`${defs.remote.path}/packages#${defs.revision.sha}`);
            return;
          }
        } else if (type.match(/^PATH[0-9]*/)) {
          if (defs.specs["decidim"]) {
            let gemPath = defs.remote.path;
            if (!gemPath) {
              continue;
            }
            if (!gemPath.match(/^\//)) {
              gemPath = path.resolve(projectPath, gemPath);
            }
            if (gemPath) {
              resolve(`${gemPath}/packages`);
              return;
            }
          }
        }
      }
    }, reject);
  });
};

module.exports = (projectPath) => {
  return new Promise((resolve, _reject) => {
    resolveGemfileSource(projectPath).then(
      (source) => resolve(source),
      () => {
        // Default to Decidim git repository
        resolve("https://github.com/decidim/decidim/packages#develop");
      }
    );
  });
}
