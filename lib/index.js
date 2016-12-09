const readFile = require('fs-readfile-promise');
const writeFile = require('fs-writefile-promise');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const Mustache = require('mustache');

module.exports = ({
  data = {},
  src,
  output = process.cwd(),
  render = (contents, data) => Mustache.render(contents.toString(), data)
}) => {
	if (src === undefined) throw new Error('`src` folder argument is not defined');

  return findFiles(src)
    .then(paths => {
    	const outputPath = path.resolve(output);

      return getFiles(paths)
        .then(renderFiles(paths, src, data, render))
        .then(makeDirectory(paths, src, data, outputPath))
        .then(writeFiles(outputPath))
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

function replaceTokens(targetPath, data) {
	return Object.keys(data) // replace [data.key] with data.value
		.reduce((pathStr, key) => {
			return pathStr
				.split('[' + key + ']')
				.join(data[key]);
		}, targetPath)
}

function makeDirectory(paths, src, data, output) {
  return files => {
    const dirs = 
      files
        .map((_, i) => replaceTokens(paths[i], data))
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
          const newDirectory = path.resolve(output, dir);
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

function renderFiles(paths, src, data, render) {
  return files => {
    return Promise.resolve(
      files.map((file, i) => ({
        path: replaceTokens(paths[i].substr(src.length + 1), data),
        contents: render(file, data)
      }))
    );
  };
}

function writeFiles(output) {
  return files => Promise.all(
    files.map(file => {
      const filePath = path.resolve(output, file.path);   
      console.log('writing file:', filePath);
      return writeFile(filePath, new Buffer(file.contents || ''));
    })
  );
}