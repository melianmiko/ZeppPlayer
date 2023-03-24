DESTDIR=

all: lib app/index.browser.js

app/index.browser.js:
	npm run build

lib:
	mkdir -p lib

	# Fetch libraries that will be packaged into deb-file
	# (i know that this isn't a "Linux-way", but this is easier than
	# package all of them by myself)
	cd lib && pip install --target=. --no-deps -r ../requirements-pkg.txt

install:
	rm -rf ${DESTDIR}/opt/zeppplayer

	mkdir -p ${DESTDIR}/opt/zeppplayer
	cp -r app/ ${DESTDIR}/opt/zeppplayer/
	cp -r zp_server/ ${DESTDIR}/opt/zeppplayer/
	cp -r lib/* ${DESTDIR}/opt/zeppplayer/
	cp package.json ${DESTDIR}/opt/zeppplayer

	mkdir -p ${DESTDIR}/opt/zeppplayer/projects
	cp -r projects/demo/ ${DESTDIR}/opt/zeppplayer/projects

	mkdir -p ${DESTDIR}/usr/bin
	mkdir -p ${DESTDIR}/usr/share/applications
	cp docs/linux_entrypoint.py ${DESTDIR}/usr/bin/zeppplayer
	cp docs/zeppplayer.desktop ${DESTDIR}/usr/share/applications

	rm -rf ${DESTDIR}/opt/zeppplayer/bin
	rm -rf ${DESTDIR}/opt/zeppplayer/*.dist-info

uninstall:
	rm -rf ${DESTDIR}/opt/zeppplayer
	rm -f ${DESTDIR}/usr/bin/zeppplayer
	rm -f ${DESTDIR}/usr/share/applications/zepplayer.desktop
