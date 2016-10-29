#! /usr/bin/env node
const program = require('commander');
const pkg = require('../package.json');
const readFile = require('fs-readfile-promise');
const writeFile = require('fs-writefile-promise');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const Mustache = require('mustache');

let name = 'generic-component';

// dopl product-description --template ./templates/new-component --output
program
  .version(pkg.version)
  .option(
    '-t, --template [folder]', 
    'Define which template to build the component from',
    path.resolve(__dirname, '../templates/tag')
  )
  .option('-o, --output [folder]', 'Define path to output component')
  .arguments('<name>').action(title => name = title)
  .parse(process.argv);

if (program.output === undefined) {
  program.output = process.cwd();
} else if (program.output.substr(0, 1) !== '/') {
  program.output = path.join(process.cwd(), program.output);
}

findFiles(program.template)
  .then(paths => {
    getFiles(paths)
      .then(renderPages(paths))
      .then(createDirectory)
      .then(outputComponent)
      .then(() => console.log(`${name} component created successfully!`));
  });

function createDirectory(data) {
  return new Promise((resolve, reject) => {
    const cpath = path.resolve(program.output, name);
    mkdirp(cpath, err => {
      if (err) reject(err);
      else resolve(data)
    })
  });
}

function outputComponent(data) {
  return Promise.all(
    data.map(d => {
      const filePath = path.resolve(program.output, `${name}/${d.path}`);
      console.log('writing file: ' + filePath);
      return writeFile(filePath, new Buffer(d.content));
    })
  );
}

function renderPages(paths) {
  return files => Promise.resolve(files.map((file, i) => {
    const componentName = 
      name
        .split('-')
        .map(part => part.substr(0, 1).toUpperCase() + part.substr(1))
        .join('');

    const path = paths[i]
      .substr(program.template.length + 1)
      .replace('[name]', name);

    const content = Mustache.render(file.toString(), {
      name,
      componentName
    });

    return {
      path,
      content
    };
  }));
}

function findFiles(dir) {
  return new Promise((resolve, reject) => {
    glob(path.join(dir, '*'), (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

function getFiles(paths) {
  return Promise.all(paths.map(path => readFile(path)));
}
