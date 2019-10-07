class MyVue {
    constructor (options) {
        this.$options = options

        this.$data = options.data
        this.observe(this.$data)

        new Compile(options.el, this)

        if (options.created) {
            options.created.call(this)
        }
    }

    observe (obj) {
        if (!obj || typeof obj !== 'object') {
            return
        }
        Object.keys(obj).forEach(key => {
            this.difineReactive(obj, key, obj[key])
            this.proxyData(key)
        })
    }
    
    difineReactive (obj, key, val) {
        // 递归解决数据对象嵌套
        this.observe(val)

        const dep = new Dep()

        // 数据劫持，监听值的改变，在需要改变的地方跟着改变
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target)
                return val
            },
            set(newVal) {
                if (newVal === val) return
                val = newVal
                // console.log(`${key}更新了: ${val}`)
                dep.notify()
            }
        })
    }

    proxyData (key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key]
            },
            set(newVal) {
                this.$data[key] = newVal
            }
        })
    }
}

// 管理watcher
class Dep {
    constructor() {
        this.deps = []
    }

    addDep(dep) {
        this.deps.push(dep)
    }

    notify() {
        this.deps.forEach(dep => dep.update())
    }
}

class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm
        this.key = key
        this.cb = cb

        Dep.target = this
        this.vm[this.key]
        Dep.target = null
    }

    update() {
        this.cb.call(this.vm, this.vm[this.key])
    }
}