const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  prepush = require('octopus-start-preset-prepush'),
  dependencies = require('octopus-start-preset-dependencies'),
  modules = require('octopus-start-preset-modules'),
  idea = require('octopus-start-preset-idea'),
  depcheck = require('octopus-start-preset-depcheck');

const start = Start(reporter());

module.exports['modules:sync'] = () => start(modules.sync());
module.exports['deps:sync'] = () => start(dependencies.sync());
module.exports['deps:extraneous'] = () => start(dependencies.extraneous());
module.exports['deps:unmanaged'] = () => start(dependencies.unmanaged());
module.exports['deps:latest'] = () => start(dependencies.latest());
module.exports['idea'] = () => start(idea());
module.exports['init'] = () => start(prepush());
module.exports['depcheck'] = () => start(depcheck({ignoreMatches: ['wnpm-ci']}));


module.exports.sync = () => start(
  dependencies.sync()
  /*modules.sync(),
   dependencies.unmanaged(),
   dependencies.latest(),
   dependencies.extraneous()*/
)

/* links, installs, builds all modules */
module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('bootstrap'),
  startModulesTasks.iter.forEach()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`yarn link ${module.dependencies.map(item => item.name).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('yarn --no-lockfile && yarn link'),
    startModulesTasks.module.exec(module)('yarn run build'),
    startModulesTasks.module.markBuilt(module, 'bootstrap')
  ))
)

/* run tests for changed modules */
module.exports.test = () => {
  //hack for travis timing out in 10 minutes due to inactivity, when in reality yoshi tests take looong time...;
  setInterval(() => process.stdout.write('.'), 1000 * 60 * 5).unref();

  return start(
    startModulesTasks.modules.load(),
    startModulesTasks.modules.removeUnchanged('test'),
    startModulesTasks.iter.forEach()(module => start(
      startModulesTasks.module.exec(module)('yarn run test'),
      startModulesTasks.module.markBuilt(module, 'test')
    ))
  )
}

/* run linter for changed modules */
module.exports.lint = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('lint'),
  startModulesTasks.iter.forEach()(module => start(
    startModulesTasks.module.exec(module)('yarn run lint'),
    startModulesTasks.module.markBuilt(module, 'lint')
  ))
)


/* unbuild all modules */
module.exports.unbuild = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.markUnbuilt(module, 'bootstrap'),
    startModulesTasks.module.markUnbuilt(module, 'test'),
    startModulesTasks.module.markUnbuilt(module, 'lint')
  ))
)

/* clean all modules */
module.exports.clean = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('rm -rf node_modules && rm -rf target')
    )
  )
)
