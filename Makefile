build:
	NODE_PATH=${PWD}/bower_components ./node_modules/browserify/bin/cmd.js -e ./index.js -o ./dist/swipe-list.js -s SwipeList
	NODE_PATH=${PWD}/bower_components ./node_modules/browserify/bin/cmd.js -e ./jquery.swipe-list.js -o ./dist/jquery.swipe-list.js -s
	./node_modules/.bin/uglifyjs < ./dist/swipe-list.js > ./dist/swipe-list.min.js --comments license
	./node_modules/.bin/uglifyjs < ./dist/jquery.swipe-list.js > ./dist/jquery.swipe-list.min.js --comments license
	xpkg .


.PHONY: build
