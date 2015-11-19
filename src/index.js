require('../lib/css/base.css');
require('../lib/css/ui.css');

import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import filters from '../lib/filters';

// site configuration
var zerqu = window.ZERQU || {};
if (process.env.NODE_ENV === 'production') {
  require('../lib/ga');
} else {
  window.ga = function() {};
  Vue.config.debug = true;
}

Object.defineProperty(Vue.prototype, '$site', {
  get: function() {
    return zerqu.site || {name: 'ZERQU'};
  }
});

// register filters
Object.keys(filters).forEach(function(k) {
  Vue.filter(k, filters[k]);
});

Vue.use(VueRouter);

var router = new VueRouter({
  hashbang: false,
  history: true,
  saveScrollPosition: true
});

require('../lib/routers')(router);

router.start(App, '#app');
require('../lib/api').register(router.app);
