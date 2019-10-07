class Compile{
    constructor(el, vm) {
        this.$el = document.querySelector(el)

        this.$vm = vm

        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el)
            this.compile(this.$fragment)
            this.$el.appendChild(this.$fragment)
        }
    }

    node2Fragment (el) {
        const frag = document.createDocumentFragment()
        let child
        while (child = el.firstChild) {
            frag.appendChild(child)
        }
        return frag 
    }

    compile(el) {
        const childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            if(this.isElment(node)) {
                // console.log('元素'+ node.nodeName)
                const nodeAttrs = node.attributes
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name
                    const exp = attr.value
                    if (this.isDirective(attrName)) {
                        const dir = attrName.substring(2)
                        this[dir] && this[dir](node, this.$vm, exp)
                    } else if (this.isEvent(attrName)) {
                        const dir = attrName.substring(1)
                        this.eventHandle(node, this.$vm, exp, dir)
                    }
                })
            } else if (this.isInterpolation(node)) {
                // console.log('文本'+ node.textContent)
                // const data = node.textContent.replace('{{', '').replace('}}', '')
                // node.textContent = this.$vm.$data[data]
                this.compileText(node)
            }

            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    compileText (node) {
        // node.textContent = this.$vm.$data[RegExp.$1]
        this.update(node, this.$vm, RegExp.$1, 'text')
    }

    update (node, vm, exp, dir) {
        const updaterFn = this[dir+'Updater']
        updaterFn && updaterFn(node, vm[exp])
        new Watcher(vm, exp, function(value) {
            updaterFn && updaterFn(node, value)
        })
    }

    html (node, vm, exp) {
        this.update(node, vm, exp, 'html')
    }

    htmlUpdater (node, value) {
        node.innerHTML = value
    }

    model (node, vm, exp) {
        this.update(node, vm, exp, 'model')

        node.addEventListener('input', e => {
            vm[exp] = e.target.value
        })
    }

    modelUpdater (node, value) {
        node.value = value
    }

    text (node, vm, exp) {
        this.update(node, vm, exp, 'text')
    }

    textUpdater (node, value) {
        node.textContent = value
    }

    eventHandle (node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp]
        if (dir && fn) {
            node.addEventListener(dir, fn.bind(vm))
        }
    }

    isDirective (attr) {
        return attr.indexOf('k-') === 0
    }

    isEvent (attr) {
        return attr.indexOf('@') === 0
    }

    isElment (node) {
        return node.nodeType === 1
    }

    isInterpolation (node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}