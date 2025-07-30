## Description

Strip or extract comments, strings or both from source code.

## Install

```shell
npm install strip-comments-strings
```

## Usage

```javascript
const {parseString, stripStrings, stripComments, clearStrings} = require("strip-comments-strings");
```
or
---

```javascript
import {parseString, stripStrings, stripComments, clearStrings} from "strip-comments-strings"
```
<br/><br/>
---
### Examples

<br/><br/>
---

#### Clearing strings

📝 running-code.js ↴
```javascript
let str = fs.readFileSync("./example.js", "utf-8");
let result = clearStrings(str);
console.log(result)
```

Before ↴ (example.js)
```text   
    let c1 = "Ho you \" How are \" the you?";
    let c2 = "dfgdfd dfgdfgd \" '*";
    let c3 = "Okay okay";

    let c4 = `sfdgfdf d d  dd 
    \` ${c2}
    le = "abd pdfdp \" ;lfgfdlgkd"`;
};
```

After ↴
```text
    let c1 = "";
    let c2 = "";
    let c3 = "";

    let c4 = ``;
};
```

<br/><br/>
---
#### Stripping strings

📝 running-code.js ↴
```javascript
let str = fs.readFileSync("./example.js", "utf-8");
let result = stripStrings(str);
console.log(result)
```

Before ↴ (example.js)
```text
    let c1 = "Ho you \" How are \" the you?";
    let c2 = "dfgdfd dfgdfgd \" '*";
    let c3 = "Okay okay";

    let c4 = `sfdgfdf d d  dd 
    \` ${c2}
    le = "abd pdfdp \" ;lfgfdlgkd"`;
};
```

After ↴
```text
    let c1 = ;
    let c2 = ;
    let c3 = ;

    let c4 = ;

};
```

<br/><br/>
---
#### Stripping comments

📝 running-code.js ↴
```javascript
let str = fs.readFileSync("./example.js", "utf-8");
let result = stripComments(str);
console.log(result)
```

Before (example.js) ↴
```text
//abcdefghij
const bb = `
    // Hi
    /** Copy **/
    const chalk004 = require("chalk-cjs");
    
    const chalk005 = require("chalk-cjs");
`
/**
 * @class SomeClass
 */
```

After ↴
```text
const bb = `
    // Hi
    /** Copy **/
    const chalk004 = require("chalk-cjs");

    const chalk005 = require("chalk-cjs");
`
```

<br/><br/>
---
#### Replacing comments from source via callback

📝 running-code.js ↴
```javascript
let str = fs.readFileSync(path.join(__dirname, "./example.js"), "utf-8");

const stripMyComments = (str) =>
{
    let counter = 0
    str = stripComments(str, function (info)
    {
        return `(${counter++})`
    });

    return str
}

console.log(str)
```

Before ↴
```shell
/** // **/
/** 1 **/
//aaaa
/** 2 **/
//bbbbb
//ccccc
///////////
/** 3 **/
/** 4 **/
/** 5 **/
""
aa
"attenti\"on"
bb
ccc
'warni\\'
'ng\''
ddd
eeee`info`
eeee
fffff
"silence"
fffff
gggggg
'noise'
gggggg
hhhhhhh`visibility`
hhhhhhh
"aaa"
"aaa"
"aaa"
```

After ↴
```shell
(9)
(8)
(7)(6)
(5)(4)(3)(2)
(1)
(0)
""
aa
"attenti\"on"
bb
ccc
'warni\\'
'ng\''
ddd
eeee`info`
eeee
fffff
"silence"
fffff
gggggg
'noise'
gggggg
hhhhhhh`visibility`
hhhhhhh
"aaa"
"aaa"
"aaa"
```

---
<br/><br/>

<br/><br/>
---
#### Replacing strings from source via callbacks

```javascript
    let str = fs.readFileSync("./example.js", "utf-8");

str = stripStrings(str, function (info)
{
    return "!!"
}, {includeDelimiter: true});

```

Before (example.js) ↴
```text
"What"
'Time'
`is it?`
```

```text
!!
!!
!!
```
---
<br/><br/>

#### Strip comments and strings

```javascript
// ...
str = stripComments(str);
str = stripStrings(str)
// ...
```

It is best to always start by removing comments then strings.

---
<br/><br/>

#### Parsing source

```javascript
const found = parseString(str);
console.log( found );
```

```shell
{
  text: '',
  strings: [
    { content: '', index: 107, indexEnd: 107, item: [Object] },
    {
      content: 'attenti\\"on',
      index: 115,
      indexEnd: 126,
      item: [Object]
    },
    { content: 'warni\\\\', index: 139, indexEnd: 146, item: [Object] },
    { content: "ng\\'", index: 150, indexEnd: 154, item: [Object] },
    { content: 'info', index: 167, indexEnd: 171, item: [Object] },
    { content: 'silence', index: 188, indexEnd: 195, item: [Object] },
    { content: 'noise', index: 214, indexEnd: 219, item: [Object] },
    {
      content: 'visibility',
      index: 238,
      indexEnd: 248,
      item: [Object]
    },
    { content: 'aaa', index: 261, indexEnd: 264, item: [Object] },
    { content: 'aaa', index: 268, indexEnd: 271, item: [Object] },
    { content: 'aaa', index: 275, indexEnd: 278, item: [Object] }
  ],
  comments: [
    {
      type: 'commentBlock',
      content: '/** // **/',
      index: 0,
      indexEnd: 10
    },
    {
      type: 'commentBlock',
      content: '/** 1 **/',
      index: 12,
      indexEnd: 21
    },
    {
      type: 'commentLine',
      content: '//aaaa\r\n',
      index: 23,
      indexEnd: 31
    },
    {
      type: 'commentBlock',
      content: '/** 2 **/',
      index: 31,
      indexEnd: 40
    },
    {
      type: 'commentLine',
      content: '//bbbbb\r\n',
      index: 42,
      indexEnd: 51
    },
    {
      type: 'commentLine',
      content: '//ccccc\r\n',
      index: 51,
      indexEnd: 60
    },
    {
      type: 'commentLine',
      content: '///////////\r\n',
      index: 60,
      indexEnd: 73
    },
    {
      type: 'commentBlock',
      content: '/** 3 **/',
      index: 73,
      indexEnd: 82
    },
    {
      type: 'commentBlock',
      content: '/** 4 **/',
      index: 84,
      indexEnd: 93
    },
    {
      type: 'commentBlock',
      content: '/** 5 **/',
      index: 95,
      indexEnd: 104
    }
  ]
}

```