import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import { sync } from 'vuex-router-sync';

sync(store, router);

router.beforeEach((to, from, next) => {
    document.title = to.meta.title;
    next();
})

const app = new Vue({
    router,
    store,
    ...App
}).$mount('#app');