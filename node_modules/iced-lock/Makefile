default: build
all: build

ICED=node_modules/.bin/iced
BUILD_STAMP=build-stamp
TEST_STAMP=test-stamp


index.js: index.iced
	$(ICED) -I browserify -c -o `dirname $@` $<

$(BUILD_STAMP): \
	index.js
	date > $@

clean:
	rm index.js

build: $(BUILD_STAMP)

setup:
	npm install -d

test:
	iced test/run.iced

coverage:
	./node_modules/.bin/istanbul cover $(ICED) test/run.iced

memtest:
	$(ICED) --compile --print test/memtest.iced | node --expose-gc

.PHONY: test setup coverage

