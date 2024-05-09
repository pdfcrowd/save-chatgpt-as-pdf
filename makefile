help:
	cat makefile

build: check-version build-firefox build-chrome build-userscript-single-file
	true

check-version:
	@tools/check-version.sh

build-firefox: pre-firefox copyfiles
	rm -rf $(CURDIR)/save-gptchat-as-pdf-firefox.zip
	cp manifest_firefox.json /tmp/save-chatgpt-to-pdf/manifest.json
	cd /tmp/save-chatgpt-to-pdf/ && zip -r $(CURDIR)/save-gptchat-as-pdf-firefox.zip .

build-chrome: pre-chrome copyfiles
	rm -rf $(CURDIR)/save-gptchat-as-pdf-chrome.zip
	cp manifest_chrome.json /tmp/save-chatgpt-to-pdf/manifest.json
	cd /tmp/save-chatgpt-to-pdf/ && zip -r $(CURDIR)/save-gptchat-as-pdf-chrome.zip .

build-userscript-single-file: pre-userscript
	sed "/common.js placeholder/r common.js" userscript/save-chatgpt-as-pdf.user.js >  userscript/save-chatgpt-as-pdf.all.user.js
	sed -i '/^\/\/ @require/d' userscript/save-chatgpt-as-pdf.all.user.js

copyfiles:
	rm -rf /tmp/save-chatgpt-to-pdf/
	mkdir /tmp/save-chatgpt-to-pdf/
	rsync -q -av --exclude-from=exclude.txt . /tmp/save-chatgpt-to-pdf/

SEARCH_PATTERN = <a href=\"[^\"]*\" aria-label=\"Rate us?\"

pre-chrome:
	sed -i 's|$(SEARCH_PATTERN)|<a href="https://chromewebstore.google.com/detail/save-chatgpt-as-pdf/ccjfggejcoobknjolglgmfhoeneafhhm" aria-label="Rate us?"|' common.js
	ln -fs manifest_chrome.json manifest.json

pre-firefox:
	sed -i 's|$(SEARCH_PATTERN)|<a href="https://addons.mozilla.org/en-US/firefox/addon/save-chatgpt-as-pdf/" aria-label="Rate us?"|' common.js
	ln -fs manifest_firefox.json manifest.json

pre-userscript:
	sed -i 's|$(SEARCH_PATTERN)|<a href="https://greasyfork.org/en/scripts/484463-save-chatgpt-as-pdf/feedback#post-discussion" aria-label="Rate us?"|' common.js
