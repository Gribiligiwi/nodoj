/**
 * Nodoj library for simplified DOM manipulation in JavaScript.
 * @namespace nodoj
 */
const nodoj = {
	/**
	 * Stores references to created elements by their unique keys.
	 * @type {Object<string, {el: Object, dom: Node}>}
	 */
	k: {},

	/**
	 * Inserts `els` at the beginning of the `node`.
	 * @param {Array<Object>} els - Elements to insert.
	 * @param {Node} node - Target DOM node.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.start([
	 * 	{tag: 'p', textContent: 'Hello.'},
	 * 	{tag: 'hr'}
	 * ], document.body)
	 * // res is [p, hr]
	 */
	start: (els, node) => {
		try {
			return nodoj.core(els, node, node.firstChild)
		} catch (error) {
			console.error(`nodoj ⭢ start(${JSON.stringify(els)}, ${node})`, error)
		}
	},

	/**
	 * Inserts `els` at the end of the `node`.
	 * @param {Array<Object>} els - Elements to insert.
	 * @param {Node} node - Target DOM node.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.end([
	 * 	{tag: 'p', textContent: 'Hello.'},
	 * 	{tag: 'hr'}
	 * ], document.body)
	 * // res is [p, hr]
	 */
	end: (els, node) => {
		try {
			return nodoj.core(els, node)
		} catch (error) {
			console.error(`nodoj ⭢ end(${JSON.stringify(els)}, ${node})`, error)
		}
	},

	/**
	 * Inserts `els` before the given `node`.
	 * @param {Array<Object>} els - Elements to insert.
	 * @param {Node} node - DOM node before which elements will be inserted.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.before([
	 * 	{tag: 'p', textContent: 'Hello.'},
	 * 	{tag: 'hr'}
	 * ], nodoj.k.test.dom)
	 * // res is [p, hr]
	 */
	before: (els, node) => {
		try {
			return nodoj.core(els, node.parentNode, node)
		} catch (error) {
			console.error(`nodoj ⭢ before(${JSON.stringify(els)}, ${node})`, error)
		}
	},

	/**
	 * Inserts `els` after the given `node`.
	 * @param {Array<Object>} els - Elements to insert.
	 * @param {Node} node - DOM node after which elements will be inserted.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.after([
	 * 	{tag: 'p', textContent: 'Hello.'},
	 * 	{tag: 'hr'}
	 * ], nodoj.k.test.dom)
	 * // res is [p, hr]
	 */
	after: (els, node) => {
		try {
			return nodoj.core(els, node.parentNode, node.nextSibling)
		} catch (error) {
			console.error(`nodoj ⭢ after(${JSON.stringify(els)}, ${node})`, error)
		}
	},

	/**
	 * Replaces `node` with the elements in `els`.
	 * @param {Array<Object>} els - Elements to insert.
	 * @param {Node} node - Node to be replaced.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.replace([
	 * 	{tag: 'button', on_click: action}
	 * ], nodoj.k.test.dom)
	 * // res is [button]
	 */
	replace: (els, node) => {
		if (node === document.body) {
			console.warn(
				`nodoj ⭢ replace(${JSON.stringify(els)}, ${node})`,
				`Replacing <body> will remove the <body> element itself. This can be unsafe.`
			)
		}
		try {
			return nodoj.core(els, node.parentNode, node, true)
		} catch (error) {
			console.error(`nodoj ⭢ replace(${JSON.stringify(els)}, ${node})`, error)
		}
	},

	/**
	 * Creates DOM nodes from `els` without inserting them into the live DOM.
	 * @param {Array<Object>} els - Elements to build.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @example
	 * const res = nodoj.temp([
	 * 	{tag: 'ol', children: [
	 * 		{tag: 'li', textContent: 'ok'}
	 * 	]}
	 * ])
	 * // res is [ol]
	 */
	temp: els => {
		try {
			return nodoj.core(els, document.createElement('div'), null, false)
		} catch (error) {
			console.error(`nodoj ⭢ temp(${JSON.stringify(els)})`, error)
		}
	},

	/**
	 * Removes a node from the DOM by key, and updates `nodoj.k`.
	 * @param {string} k - Key of the node to remove.
	 * @returns {Node|null} Removed node or null if not found.
	 * @example
	 * nodoj.start([
	 * 	{k: 'demo', text: 'Example'}
	 * ], document.body)
	 * const res = nodoj.remove('demo')
	 * // res is a text node
	 */
	remove: k => {
		try {
			const node = nodoj.k[k]
			if (!node) return null
			node.remove()
			nodoj.clean()
			return node
		} catch (error) {
			console.error(`nodoj ⭢ remove(${k})`, error)
			return null
		}
	},

	/**
	 * INTERNAL: Recursively builds DOM elements from structured data.
	 * @param {Array<Object>} els - Elements to build.
	 * @param {Node} [parent=null] - Parent node for insertion.
	 * @param {Node} [ref=null] - Reference node for insertion.
	 * @param {boolean} [replace=false] - Whether to replace the reference node.
	 * @param {boolean} [child=false] - Whether this is a nested call for children.
	 * @returns {Array<Node>} Created DOM nodes.
	 * @private
	 */
	core: (els, parent=null, ref=null, replace=false, child=false) => {
		if (!Array.isArray(els)) {
			console.warn(`nodoj warning: expected an array for 'els', got:`, els)
			els = []
		}
		const fragment = document.createDocumentFragment()
		const createdNodes = []
		for (const el of els) {
			if (!el) continue
			if (typeof el !== 'object') {
				console.warn(`nodoj warning: expected objects in 'els'. Ignored:`, el)
				continue
			}
			const newNode = el.text
				? document.createTextNode(el.text)
				: el.comment
					? document.createComment(el.comment)
					: el.svg
						? document.createElementNS('http://www.w3.org/2000/svg', el.tag || 'svg')
						: el.math
							? document.createElementNS('http://www.w3.org/1998/Math/MathML', el.tag || 'math')
							: el.ns
								? document.createElementNS(el.ns, el.tag)
								: document.createElement(el.tag || 'div')
			createdNodes.push(newNode)
			fragment.appendChild(newNode)
			if (el.k) nodoj.k[el.k] = newNode
			if (el.children) newNode.appendChild(nodoj.core(el.children, newNode, null, false, true))
			for (const key in el) {
				if (!['k', 'children', 'tag', 'comment', 'text', 'svg', 'math', 'ns'].includes(key)) {
					if (key === 'style' && typeof el.style === 'object') {
						Object.assign(newNode.style, el.style)
						continue
					}
					const splited = key.split('_')
					if (splited.length === 2) {
						if (splited[0] === 'on') {
							newNode.addEventListener(splited[1], el[key], false)
						} else if (splited[0] === 'data') {
							newNode.dataset[splited[1]] = el[key]
						} else if (splited[0] === '') {
							newNode.setAttribute(splited[1], el[key])
						} else newNode[key] = el[key]
					} else newNode[key] = el[key]
				}
			}
		}
		if (child) return fragment
		replace && ref
			? parent.replaceChild(fragment, ref)
			: parent.insertBefore(fragment, ref || null)
		if (replace) nodoj.clean()
		return createdNodes
	},

	/**
	 * Removes all keys from `nodoj.k` whose nodes are no longer in the DOM.
	 * This is automatically triggered by `nodoj.remove(...)` and `nodoj.replace(...)`.
	 */
	clean: () => {
		for (const key in nodoj.k) {
			if (!document.documentElement.contains(nodoj.k[key])) delete nodoj.k[key]
		}
	}
}
export default nodoj