copy:
	@mkdir -p build/fonts
	@cp fonts/* build/fonts/
	@cp icon.css build/

build: copy
	@node_modules/.bin/webpack --optimize-minimize

dist:
	@mkdir -p dist/fonts
	@node_modules/.bin/webpack --optimize-minimize
	@cat icon.css build/style.css | cleancss -o dist/qingcheng.css
	@cp fonts/* dist/fonts/
	@uglifyjs build/build.js -m -o dist/qingcheng.js

upload: dist
	@fab upload_assets
	@fab upload_js -H pythonchina-web-0

.PHONY: build copy dist
