const nodoj = {
	k: {},
	start: (els, node) => {
		try {
			return nodoj.core(els, node, node.firstChild)
		} catch (error) {
			console.error(`nodoj ⭢ start(${JSON.stringify(els)}, ${node})`, error)
		}
	},
	end: (els, node) => {
		try {
			return nodoj.core(els, node)
		} catch (error) {
			console.error(`nodoj ⭢ end(${JSON.stringify(els)}, ${node})`, error)
		}
	},
	before: (els, node) => {
		try {
			return nodoj.core(els, node.parentNode, node)
		} catch (error) {
			console.error(`nodoj ⭢ before(${JSON.stringify(els)}, ${node})`, error)
		}
	},
	after: (els, node) => {
		try {
			return nodoj.core(els, node.parentNode, node.nextSibling)
		} catch (error) {
			console.error(`nodoj ⭢ after(${JSON.stringify(els)}, ${node})`, error)
		}
	},
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
	temp: els => {
		try {
			return nodoj.core(els, document.createElement('div'), null, false)
		} catch (error) {
			console.error(`nodoj ⭢ temp(${JSON.stringify(els)})`, error)
		}
	},
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
	clean: () => {
		for (const key in nodoj.k) {
			if (!document.documentElement.contains(nodoj.k[key])) delete nodoj.k[key]
		}
	}
}
export default nodoj