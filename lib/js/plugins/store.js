
const Store = {
    install (Vue, options) {

        const store = Vue.observable({
            config: null,
        })

        const actions = {
            setConfig(value) {
                store.config = value
            },
            getConfig() {
                return  store.config
            },

        }
        
        Vue.prototype.$config = actions
    }
}
