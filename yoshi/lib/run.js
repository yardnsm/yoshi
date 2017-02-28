'use strict';

const chalk = require('chalk');
const {watchMode} = require('./utils');

function format(time) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function delta(start) {
  const end = new Date();
  const time = end.getTime() - start.getTime();

  return [end, time];
}

module.exports = options => (...tasks) => {
  return Promise.all(tasks.map(task => {
    return task(options)
      .catch(error => {
        if (error) {
          console.log(error);
        }

        if (!watchMode()) {
          process.exit(1);
        }
      });
  }));
};

const log = module.exports.log = task => {
  return options => {
    const start = new Date();
    console.log(`[${format(start)}] ${chalk.black.bgGreen('Starting')} '${task.name}'...`);

    return task(options)
      .then(() => {
        const [end, time] = delta(start);
        console.log(`[${format(end)}] ${chalk.black.bgCyan('Finished')} '${task.name}' after ${time} ms`);
      })
      .catch(error => {
        const [end, time] = delta(start);
        console.log(`[${format(end)}] ${chalk.white.bgRed('Failed')} '${task.name}' after ${time} ms`);

        throw error;
      });
  };
};

module.exports.logIf = (task, condFn) => {
  return options => {
    const newTask = condFn(options) ? log(task) : task;
    return newTask(options);
  };
};

module.exports.logIfP = (task, condFnP) => {
  return options => {
    return condFnP(options)
      .then(cond => cond ? log(task) : task)
      .then(newTask => newTask(options));
  };
};
