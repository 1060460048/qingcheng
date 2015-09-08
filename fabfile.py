
import os
import glob
import hashlib
import datetime
from fabric.api import env, local

env.use_ssh_config = True
env.keepalive = 60


def hash_name(filename):
    now = datetime.datetime.now()

    with open(filename) as f:
        hsh = hashlib.md5(f.read()).hexdigest()[:6]

    name = '%s.%s' % (now.strftime('%Y%m%d'), hsh)
    return name + os.path.splitext(filename)[1]


def upload_qiniu(filename):
    name = hash_name(filename)
    local('qboxrsctl put -c python qingcheng/%s %s' % (name, filename))


def upload_assets():
    upload_js()
    upload_qiniu('dist/qingcheng.css')


def upload_js():
    filename = 'dist/qingcheng.js'
    name = hash_name(filename)
    with open(filename, 'r') as f:
        content = f.read()
        content = content.replace('qingcheng.js.map', name + '.map')

    with open(filename, 'w') as f:
        f.write(content)

    local('qboxrsctl put -c python qingcheng/%s %s' % (name, filename))
    local('qboxrsctl put -c python qingcheng/%s.map %s.map' % (name, filename))


def fonts():
    for name in glob.glob('dist/fonts/*'):
        key = name.replace('dist', 'qingcheng')
        local('qboxrsctl put -c python %s %s' % (key, name))
