#! /usr/bin/env node
const program = require('commander');
const pkg = require('../package.json');

const dopl = require('../lib/index');

let name;
program
  .version(pkg.version)
  .option(
    '-s, --src [dir]', 
    'sets source directory to use as a template'
  )
  .option(
    '-o, --output [dir]', 
    '(optional) sets output directory, defaults to process.cwd()'
  )
  .arguments('<name>').action(title => name = title)
  .parse(process.argv);


dopl({
  name,
  src: program.src,
  output: program.output
})
.then(() => {
  console.log(`${name} component created successfully!`);
});