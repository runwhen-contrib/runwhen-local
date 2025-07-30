# write-yaml-file

> Stringify and write YAML to a file atomically

Creates directories for you as needed.

## Installation

```
<pnpm|yarn|npm> add write-yaml-file
```

## Usage

```js
const writeYamlFile = require('write-yaml-file')

writeYamlFile('foo.yaml', {foo: true}).then(() => {
  console.log('done')
})
```

## API

### `writeYamlFile(filepath, data, [options])`

Returns a promise.

### `writeYamlFile.sync(filepath, data, [options])`

#### `options`

Same options that can be passed in to [js-yaml](https://www.npmjs.com/package/js-yaml#safedump-object---options-)

##### mode

Type: `number`
Default `438` *(0666 in octal)*

[Mode](https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation) used when writing the file.

## Related

- [load-yaml-file](https://github.com/LinusU/load-yaml-file) - Read and parse a YAML file

## License

[MIT](LICENSE) © [Zoltan Kochan](https://www.kochan.io)
