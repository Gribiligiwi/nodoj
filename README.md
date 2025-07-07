# Nodoj

![npm](https://img.shields.io/npm/v/nodoj)
![minified size](https://img.shields.io/bundlephobia/min/nodoj)
![license](https://img.shields.io/github/license/Gribiligiwi/nodoj)


*Nodoj* — meaning “nodes” in Esperanto — is a lightweight JavaScript library to create and manipulate DOM nodes declaratively, without boilerplate or dependencies. It gives you low-level control using simple object syntax and focuses on minimalism and efficiency.

## Features

- Create DOM nodes from object literals
- Insert nodes before, after, at start, or at end
- Replace or remove nodes
- Maintain key-based access to nodes
- Support for namespaced elements (SVG, MathML, custom)
- Optional comment and text nodes
- Designed for native JavaScript and zero dependencies

## Installation

Three interchangeable builds are provided:

- **`nodoj.dev.js`** (6.8 KB) — with error handling and inline documentation. Ideal for development.
- **`nodoj.js`** (3.6 KB) — with error handling, no inline docs. Good middle-ground.
- **`nodoj.min.js`** (**1.4 KB**) — minified and stripped for production use.

You can install Nodoj via npm:

```bash
npm install nodoj
```

Then import it in your module:

```javascript
import nodoj from 'nodoj'
// or: import nodoj from 'nodoj/dev'
// or: import nodoj from 'nodoj/min'
```

Or use it directly in the browser. In this case, remove the last line `export default nodoj` from the nodoj JS file:
```html
<script src="nodoj.js"></script>
```

Note: Nodoj is an ES module (ESM). It must be imported using `import`. CommonJS (`require`) is not supported.

## Usage

Each method receives a list of element objects (els) and a reference node (node), and returns the inserted or created DOM nodes.

```javascript
nodoj.before(els, node)   // insert before node
nodoj.start(els, node)    // insert at start of node
nodoj.end(els, node)      // insert at end of node
nodoj.after(els, node)    // insert after node
nodoj.replace(els, node)  // replace node
nodoj.temp(els)           // create nodes in memory (not inserted)
nodoj.remove(k)           // remove node with key k
nodoj.clean()             // cleanup orphaned keys
```

Each element is an object with a structure like this:

```javascript
{
  tag: 'div',         // optional (default: 'div')
  text: 'Hello',      // creates a text node
  comment: 'Note',    // creates a comment node
  svg: true,          // use SVG namespace
  math: true,         // use MathML namespace
  ns: '...',          // custom namespace URI
  k: 'header',        // store reference in nodoj.k.header
  children: [ ... ],  // recursive child elements
  className: 'bold',  // standard DOM properties
  on_click: fn,       // event listeners
  data_pos: 2,        // data attributes
  _aria_label: 'ok'   // custom attributes (with "_")
}
```

## Key mapping

Nodoj stores keyed nodes in nodoj.k for later access:

```javascript
nodoj.start([
  {tag: 'div', k: 'main', textContent: 'Hello'}
], document.body)

nodoj.k.main.innerHTML += ' <b>World</b>'
```

Keys are just direct references. There's no automatic update or reactivity.

## Example (Todo list)

```javascript
import nodoj from 'nodoj'

let tasks = []

const bt = (textContent, on_click) => ({
  tag: 'button', textContent, on_click
})

const addTask = txt => {
  if (!txt || txt.trim() === '') return
  txt = txt.trim()
  tasks.push(txt)
  const pos = tasks.length - 1
  nodoj.end([
    {k: `task_${pos}`, tag: 'li', children: [
      bt('Edit', () => {
        let newTxt = prompt('Edit task', txt)
        if (!newTxt || newTxt.trim() === '') return
        newTxt = newTxt.trim()
        tasks[pos] = newTxt
        nodoj.k[`taskName_${pos}`].textContent = newTxt
      }),
      {text: ' '},
      bt('Remove', () => {
        tasks.splice(pos, 1)
        nodoj.remove(`task_${pos}`)
      }),
      {text: ' — '},
      {k: `taskName_${pos}`, text: txt},
    ]}
  ], nodoj.k.todoList)
}

nodoj.start([
  {k: 'todoList', tag: 'ul'},
  bt('New task…', () => {
    addTask(prompt('Add task'))
  })
], document.getElementById('app'))

const initTasks = ['Eat 🍭', 'Play 🛷', 'Sleep 🧸']
for (const task of initTasks) addTask(task)
```

## Conditional Elements

You can include `null` in the `els` array to enable conditional rendering:

```javascript
const show = true
nodoj.start([
  show ? {text: 'Visible'} : null
], document.body)
```

## Beyond DOM insertion

Nodoj is not a framework. It does not manage state, reactivity, components or routing. You are free to structure your application however you want, using native JavaScript.

### Component example

```javascript
const Component = el => nodoj.start([
  {tag: 'h2', textContent: 'Hello from component'}
], el)
Component(document.body)
```

### Routing example

```javascript
const app = document.getElementById('app')
const route = page => {
  app.innerHTML = ''
  nodoj.start([{textContent: page}], document.body)
}
route('Home')
```

### Manage state example

```javascript
let value = 0
const setContent = () => nodoj.k.count.textContent = `${value} clic(s)`
nodoj.start([
    {k: 'count'},
    {tag: 'button', textContent: '+', on_click: () => {
        value ++
        setContent()
    }}
], document.body)
setContent()
```

## Philosophy

Nodoj gives you control of the DOM without overhead. No virtual DOM, no reactivity, no abstraction layers — just straightforward node generation. It embraces declarative syntax but remains close to the native DOM.

## Licence

MIT — see [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

This project is open source and free to use, modify, and distribute under the terms of the MIT license.

Please keep the name "Nodoj" when referring to the library and consider linking back to its homepage or this repository when sharing or discussing it.

## Author

Created by Silène, Gribiligiwi Studio.
