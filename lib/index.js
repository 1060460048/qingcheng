require('./css/base.css');
require('./css/ui.css');
require('./css/animate.css');
require('./css/yue.css');
require('./css/pygments.css');

// site configuration
var zerqu = window.ZERQU || {};
if (zerqu.production) {
  require('./ga');
  if (zerqu.GA) {
    ga('create', zerqu.GA, 'auto');
  }
} else {
  ga = function() {};
}

var Vue = require('vue');
var page = require('page');

Object.defineProperty(Vue.prototype, '$site', {
  get: function() {
    return zerqu.site || {name: 'ZERQU'};
  }
});

// register filters
var filters = require('./filters');
Object.keys(filters).forEach(function(k) {
  Vue.filter(k, filters[k]);
});

var app = new Vue(require('./app.vue'));
app.message = require('./utils').messageFactory(app);
Vue.app = app;

// register api plugin
require('./api').register(app);


function parseQuery(qs) {
  var rv = {};
  qs.split('&').forEach(function(kv) {
    var pairs = kv.split('=');
    rv[pairs[0]] = pairs[1];
  });
  return rv;
}


function handle(view) {
  return function(ctx) {
    app.view = view;
    app.params = ctx.params;
    app.params.query = parseQuery(ctx.querystring);
  };
}

page('/', handle('home'));
page('/t/:topicId', handle('topic'));

page('/c/', handle('cafe-list'));
page('/c/:slug', handle('cafe'));

page('/u/', handle('user-list'));
page('/u/:username', handle('user'));

if (!zerqu.production) {
  page({hashbang: true});
} else {
  page();
}
