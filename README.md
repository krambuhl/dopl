# dopl

Use dopl to make a new directory based on a template directory.  Processes each file through mustache and provides filename template strings.


## Example

```js
const dopl = require('dopl');

dopl({
  name: 'heading',
  src: 'templates/simple-component',
  output: 'source', 
  data: {
    timestamp: +new Date()
  }
})
.then(() => {
  console.log(`${name} created!`);
});
```


## Options

`name` –– name of new directory

`src` –– directory to use as a template

`output` –– directory to output copy

`data` –– data to pass into mustache

`render` –– function with the form `fn(file, data)` for rendering files, if you'd like to replace mustache with another templating engine.


## Filename Interpolation

Filenames with `[name]` included will be replaced with `name` option.

```
// config
dopl({
    name: 'mega',
    output: 'dist'
})

// input file
[name].html
assets/[name].css

// output file
dist/mega.html
dist/assets/mega.css
```


## Install

```npm
npm install dopl
```


## CLI

```npm
npm install dopl -g
```

```
dopl --src templates/original --output source/directory new-copy
```


## License

MIT 2016 Evan Krambuhl