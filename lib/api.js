
var Vue = require('vue');
Vue.use(require('vue-resource'));


var TRY_CURRENT_USER_KEY = 'zq:try:me';
var CURRENT_USER_KEY = 'zq:user';


exports.register = function(app) {
  Vue.http.options.error = function(resp, status) {
    if (status === 401) {
      cleanUser();
      if (!sessionStorage[TRY_CURRENT_USER_KEY]) return;
    }

    if (resp.error_description) {
      var type = 'error';
      if (status === 429) {
        type = 'warn';
      }
      app.message.show(type, resp.error_description);
    } else if (status >= 500) {
      app.message.show('error', 'There is a server error.');
    }
  };

  // load currentUser
  var currentUser = sessionStorage[CURRENT_USER_KEY];
  if (currentUser) {
    try {
      currentUser = JSON.parse(currentUser);
    } catch(e) {
      delete sessionStorage[CURRENT_USER_KEY];
      currentUser = {};
    }
    app.currentUser = currentUser;
  } else {
    if (sessionStorage[TRY_CURRENT_USER_KEY]) return;

    exports.user.profile('me').error(function() {
      sessionStorage[TRY_CURRENT_USER_KEY] = '1';
    });
  }
};

exports.cafe = {
  list: function(cb) {
    Vue.http.get('/api/cafes', cb);
  },
  
  profile: function(slug, cb) {
    var url = '/api/cafes/' + slug;
    Vue.http.get(url, cb);
  },

  topics: function(slug, page, cb) {
    var url = '/api/cafes/' + slug + '/topics';
    if (page) {
      url += '?page=' + page;
    }
    Vue.http.get(url, cb);
  },

  newTopic: function(slug, payload, cb) {
    var url = '/api/cafes/' + slug + '/topics';
    Vue.http.post(url, payload, cb);
  },

  users: function(slug, page, cb) {
    var url = '/api/cafes/' + slug + '/users';
    if (page) {
      url += '?page=' + page;
    }
    Vue.http.get(url, cb);
  },

  join: function(slug, cb) {
    var url = '/api/cafes/' + slug + '/users';
    Vue.http.post(url, cb);
  },

  leave: function(slug, cb) {
    var url = '/api/cafes/' + slug + '/users';
    Vue.http.delete(url, cb);
  },
};


exports.timeline = function(cursor, cb) {
  var url = '/api/topics/timeline';
  var query = [];
  if (cursor) {
    query.push('cursor=' + cursor);
  }
  if (query.length) {
    url += '?' + query.join('&');
  }
  Vue.http.get(url, cb);
};

exports.topic = {
  url: function(tid) {
    return '/api/topics/' + tid;
  },
  view: function(tid, cb) {
    Vue.http.get(this.url(tid), cb);
  },
  read: function(tid, percent, cb) {
    var url = this.url(tid) + '/read';
    Vue.http.post(url, {percent: percent}, cb);
  },
  like: function(tid, cb) {
    Vue.http.post(this.url(tid) + '/likes', cb);
  },
  unlike: function(td, cb) {
    Vue.http.delete(this.url(tid) + '/likes', cb);
  },
  comments: function(tid, cursor, cb) {
    var url = this.url(tid) + '/comments';
    if (cursor) {
      url += '?cursor=' + cursor;
    }
    Vue.http.get(url, cb);
  }
};

exports.comment = {
  url: function(comment) {
    return '/api/topics/' + comment.topic_id + '/comments/' + comment.id;
  },
  create: function(tid, payload, cb) {
    var url = '/api/topics/' + tid + '/comments';
    Vue.http.post(url, payload, cb);
  },
  delete: function(comment, cb) {
    Vue.http.delete(this.url(comment), cb);
  },
  flag: function(comment, cb) {
    var url = this.url(comment) + '/flag';
    Vue.http.post(url, cb);
  }
}

exports.user = {
  login: function(data, cb) {
    delete sessionStorage[TRY_CURRENT_USER_KEY];

    if (data.permanent) {
      data.permanent = 'yes';
    } else {
      delete data.permanent;
    }
    return Vue.http.post('/session', data, function(user) {
      trackUser(user);
      cb && cb(user);
    });
  },

  logout: function(cb) {
    cleanUser();
    return Vue.http.delete('/session', cb);
  },

  profile: function(uid, cb) {
    var url = '/api/users/' + uid;

    if (uid === 'me') {
      return Vue.http.get(url, function(user) {
        trackUser(user);
        cb && cb(user);
      });
    } else {
      return Vue.http.get(url, cb);
    }
  }
};

function trackUser(user) {
  Vue.app.currentUser = user;
  sessionStorage[CURRENT_USER_KEY] = JSON.stringify(user);
}

function cleanUser() {
  Vue.app.currentUser = {};
  delete sessionStorage[CURRENT_USER_KEY];
}
