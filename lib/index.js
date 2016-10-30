const readFile = require('fs-readfile-promise');
const writeFile = require('fs-writefile-promise');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const Mustache = require('mustache');


module.exports = ({
  name,
  data = {},
  src,
  output,
  render = (file, data) => Mustache.render(file.toString(), data)
}) => {
  Object.assign(data, { name });

  // define the output path to cwd if undefined
  if (output === undefined) {
    output = process.cwd();
  // if the output is not absolute resolve to cwd
  } else if (output.substr(0, 1) !== '/') {
    output = path.join(process.cwd(), output);
  }

  return findFiles(src)
    .then(paths => {
      return getFiles(paths)
        .then(makeDirectory(paths, src, output, name))
        .then(renderFiles(paths, data, name, src, render))
        .then(writeFiles(output, name))
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function findFiles(src) {
  return new Promise((resolve, reject) => {
    glob(path.join(src, '**/*'), { nodir: true }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

function getFiles(paths) {
  return Promise.all(
    paths.map(path => readFile(path))
  );
}

function makeDirectory(paths, src, output, name) {
  return files => {
    const dirs = 
      files
        .map((_, i) => paths[i].replace(/\[name\]/g, name))
        .map(p => path.dirname(p))
        .map(p => p.substr(src.length + 1))

    const makeDirs = 
      dirs
        .reduce((list, p) => {
          if (list.indexOf(p) === -1) {
            list.push(p);
          }
          return list;
        }, [])

    return Promise.all(
      makeDirs.map(dir => {
        return new Promise((resolve, reject) => {
          const newDirectory = path.resolve(output, name, dir);
          mkdirp(newDirectory, err => {
            if (err) reject(err);
            else resolve(files)
          })

          console.log('creating directory:', newDirectory)
        });
      })
    ).then(paths => Promise.resolve(files))
  };
}

function renderFiles(paths, data, name, src, render) {
  return files => {
    return Promise.resolve(
      files.map((file, i) => ({
        path: paths[i]
          .substr(src.length + 1)
          .replace(/\[name\]/g, name),
        contents: render(file, data)
      }))
    );
  };
}

function writeFiles(output, name) {
  return files => Promise.all(
    files.map(file => {
      const filePath = path.resolve(output, `${name}/${file.path}`);   
      console.log('writing file:', filePath);
      return writeFile(filePath, new Buffer(file.contents || ''));
    })
  );
}