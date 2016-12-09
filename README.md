# dopl

Use dopl to make a new directory based on a template directory.  Processes each file through mustache and provides filename template strings.


## Example

```js
const dopl = require('dopl');

dopl({
  src: 'templates/simple-thing',
  output: 'source/things', 
  data: {
    name: 'wow-a-thing'
    timestamp: +new Date()
  }
})
.then(() => {
  console.log(`wow-a-thing was created!`);
});
```


## Options

`src` –– directory to use as a template

`output` –– directory to output new copy 

`data` –– data to pass into mustache

`render` –– function with the form `(file, data) => String` for rendering files, if you'd like to replace mustache with another templating engine.


## Filename Interpolation

Filenames with `[$key]` included will be replaced with `name` option.

```
// config
dopl({
    output: 'dist',
    data: {
        name: 'mega'
    }
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
dopl --help
```

```
dopl --src templates/original --output source/directory/new-copy --data '{"name": "mega"}'
```


## License

MIT 2016 Evan Krambuhl