SINGLE_FILE_JS = userscript/save-chatgpt-as-pdf.all.user.js

help:
	cat makefile

build: check-version build-firefox build-chrome build-userscript-single-file
	true

check-version:
	@tools/check-version.sh

build-firefox: copyfiles
	rm -rf $(CURDIR)/save-gptchat-as-pdf-firefox.zip
	cp manifest_firefox.json /tmp/save-chatgpt-to-pdf/manifest.json
	cd /tmp/save-chatgpt-to-pdf/ && zip -r $(CURDIR)/save-gptchat-as-pdf-firefox.zip .

build-chrome: copyfiles
	rm -rf $(CURDIR)/save-gptchat-as-pdf-chrome.zip
	cp manifest_chrome.json /tmp/save-chatgpt-to-pdf/manifest.json
	cd /tmp/save-chatgpt-to-pdf/ && zip -r $(CURDIR)/save-gptchat-as-pdf-chrome.zip .

build-userscript-single-file:
	sed "/shared.js placeholder/r shared.js" userscript/save-chatgpt-as-pdf.user.js >  $(SINGLE_FILE_JS)
	tail -n +3 common.js > /tmp/_common_js_
	sed -i "/common.js placeholder/r /tmp/_common_js_" $(SINGLE_FILE_JS)
	sed -i '/^\/\/ @require/d' $(SINGLE_FILE_JS)

copyfiles:
	rm -rf /tmp/save-chatgpt-to-pdf/
	mkdir /tmp/save-chatgpt-to-pdf/
	rsync -q -av --exclude-from=exclude.txt . /tmp/save-chatgpt-to-pdf/
