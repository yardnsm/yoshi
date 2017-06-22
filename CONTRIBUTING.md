# contributing to yoshi

## before you start

 - for a simple fix - write a failing test, fix it, do a PR;
 - for an extension/change - open issue to discuss it with maintainers first;

# set-up

yoshi is a mono-repo that uses [octopus](https://github.com/wix/octopus) to manage modules within. Once you clone the repo, you should:

```bash
npm install && npm start bootstrap
```

to set-up project, meaning install dependencies for all modules. Once you done that, did your change and want to push a PR, it's recommended to run tests for all modules (as change might break a downstream module/dependency) which you can do with:

```bash
npm start test
```

`npm start` commands are change-aware, meaning that next run will execute only for modules with changes from last run.

Have fun!

# other useful commands

 - `npm start clean` - removes `node_modules` for all modules;
 - `npm start unbuild` - marks all modules unbuilt - other npm start commands will run for all modules;
 - `npm start lint` - runs lint for all modules;
 - `npm start idea` - generates intellij idea project for all modules;

 Oh, and have fun:)