#! /usr/bin/env node
const program = require('commander');

const pkg = require('../package.json');
const dopl = require('../lib/index');

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
  .option(
    '-d, --data [json]', 
    '(optional) data to use in filename interpolation and templates',
    val => JSON.parse(val)
  )
  .parse(process.argv);

dopl({
  src: program.src,
  output: program.output,
  data: program.data
})
.then(() => {
  console.log(`${name} component created successfully!`);
});