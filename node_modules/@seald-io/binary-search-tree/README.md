# Binary search trees for Node.js

This module is a fork
of [node-binary-search-tree](https://github.com/louischatriot/node-binary-search-tree)
written by Louis Chatriot for storing indexes
in [nedb](https://github.com/louischatriot/nedb).

Since the original maintainer doesn't support these packages anymore, we forked
them (here is [nedb](https://github.com/seald/nedb)) and maintain them for the
needs of [Seald](https://www.seald.io).

Two implementations of binary search
tree: [basic](http://en.wikipedia.org/wiki/Binary_search_tree)
and [AVL](http://en.wikipedia.org/wiki/AVL_tree) (a kind of self-balancing
binmary search tree).

## Installation and tests

Package name is `@seald-io/binary-search-tree`.

```bash
npm install @seald-io/binary-search-tree
```

If you want to run the tests, you'll have to clone the repository:

```bash
git clone https://github.com/seald/node-binary-search-tree
npm install
npm test
```

## Usage

The API mainly provides 3 functions: `insert`, `search` and `delete`. If you do
not create a unique-type binary search tree, you can store multiple pieces of
data for the same key. Doing so with a unique-type BST will result in an error
being thrown. Data is always returned as an array, and you can delete all data
relating to a given key, or just one piece of data.

Values inserted can be anything except `undefined`.

```javascript
const BinarySearchTree = require('binary-search-tree').BinarySearchTree
const AVLTree = require('binary-search-tree').AVLTree   // Same API as BinarySearchTree

// Creating a binary search tree
const bst = new BinarySearchTree()

// Inserting some data
bst.insert(15, 'some data for key 15')
bst.insert(12, 'something else')
bst.insert(18, 'hello')

// You can insert multiple pieces of data for the same key
// if your tree doesn't enforce a unique constraint
bst.insert(18, 'world')

// Retrieving data (always returned as an array of all data stored for this key)
bst.search(15)   // Equal to ['some data for key 15']
bst.search(18)   // Equal to ['hello', 'world']
bst.search(1)    // Equal to []

// Search between bounds with a MongoDB-like query
// Data is returned in key order
// Note the difference between $lt (less than) and $gte (less than OR EQUAL)
bst.betweenBounds({ $lt: 18, $gte: 12 })   // Equal to ['something else', 'some data for key 15']

// Deleting all the data relating to a key
bst.delete(15)   // bst.search(15) will now give []
bst.delete(18, 'world')   // bst.search(18) will now give ['hello']
```

There are three optional parameters you can pass the BST constructor, allowing
you to enforce a key-uniqueness constraint, use a custom function to compare
keys and use a custom function to check whether values are equal. These
parameters are all passed in an object.

### Uniqueness

```javascript
const bst = new BinarySearchTree({ unique: true });
bst.insert(10, 'hello');
bst.insert(10, 'world');   // Will throw an error
```

### Custom key comparison

```javascript
// Custom key comparison function
// It needs to return a negative number if a is less than b,
// a positive number if a is greater than b
// and 0 if they are equal
// If none is provided, the default one can compare numbers, dates and strings
// which are the most common usecases
const compareKeys = (a, b) => {
  if (a.age < b.age) return -1
  if (a.age > b.age) return 1

  return 0
}

// Now we can use objects with an 'age' property as keys
const bst = new BinarySearchTree({ compareKeys })
bst.insert({ age: 23 }, 'Mark')
bst.insert({ age: 47 }, 'Franck')
```

### Custom value checking

```javascript
// Custom value equality checking function used when we try to just delete one piece of data
// Returns true if a and b are considered the same, false otherwise
// The default function is able to compare numbers and strings
const checkValueEquality = (a, b) => a.length === b.length

var bst = new BinarySearchTree({ checkValueEquality })
bst.insert(10, 'hello')
bst.insert(10, 'world')
bst.insert(10, 'howdoyoudo')

bst.delete(10, 'abcde')
bst.search(10)   // Returns ['howdoyoudo']
```

## License

The package is released under the MIT License as the original package.

See LICENSE.md.
