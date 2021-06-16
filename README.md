# Decidim local NPM installer

This NPM package can be used to install the Decidim NPM packages locally in
Decidim instances that install the Decidim gems e.g. from GitHub when the
Decidim NPM packages might not match those available publicly in NPM. This can
happen when the Decidim version hasn't been released yet.

## How does it work?

This package:

1. Copies the Decidim's NPM `package.json` definitions to the local
   application's `tmp` folder from the Decidim folder.
   * If the `decidim` gem is available in the local bundle, the packages are
     copied from there.
   * If the `bundle show decidim` command does not report any installation path
     for the `decidim` gem, the dependencies are installed from the Decidim
     git repository instead.
2. Updates the local NPM package references in each package to point to the
   tarballs to be created in the next step.
3. Builds the NPM packages as tarballs to the `tmp` folder.

This package also ships with an NPM install script that will automatically
build the tarballs every time `npm install` is run in the application. This
ensures that the tarballs are available on every install.

## How to use?

Install the NPM package by running:

```bash
$ cd path/to/decidim-instance
$ npm i https://github.com/mainio/decidim-npm-local
$ npm exec decidiminstall .
```
