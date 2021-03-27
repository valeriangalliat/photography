NM = $(shell if [ -d "$(PROGDIR)/node_modules" ]; then echo "$(PROGDIR)/node_modules"; else echo "$(PROGDIR)/.."; fi)
PHOTOS_FULL = $(shell find photos/full -name '*.jpg')
PHOTOS_HD = $(PHOTOS_FULL:photos/full/%=photos/hd/%)
PHOTOS_THUMB = $(PHOTOS_FULL:photos/full/%=photos/thumb/%)
PHOTOS_HTML = $(PHOTOS_FULL:photos/full/%.jpg=photos/%.html)
MD = $(shell find . -name '*.md' ! -path './node_modules/*' ! -path './photos/*' ! -path ./README.md -printf '%P\n')
HTML = $(MD:%.md=%.html)
ASSETS = css/normalize.css css/codejam.css css/main.css js/main.js

build: $(PHOTOS_HD) $(PHOTOS_THUMB) $(PHOTOS_HTML) $(HTML) $(ASSETS)

orphans: .photos .references
	@comm -23 .photos .references
	@rm .photos .references

missing: .photos .references
	@comm -13 .photos .references
	@rm .photos .references

.photos: $(PHOTOS_FULL)
	@printf '%s\n' $(^:photos/full/%=%) | sort | uniq > $@

.references: $(MD)
	@grep --no-filename -o '[^/]*\.jpg' $^ | sort | uniq > $@

photos/hd/%.jpg: photos/full/%.jpg
	convert $< -resize 1920x1080^ $@

photos/thumb/%.jpg: photos/full/%.jpg
	convert $< -resize 300x200^ -gravity center -extent 300x200 $@

photos/%.html: photos/full/%.jpg
	$(PROGDIR)/genphotopage $< > $@

%.html: %.md | $(PHOTOS_HD) $(PHOTOS_THUMB)
	$(PROGDIR)/render $< > $@

css/normalize.css: $(NM)/normalize.css/normalize.css
	cp $< $@

css/codejam.css:
	curl \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/base.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/footer.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/home.css \
		| sed 's/^body {$$/.markdown-body {/' > $@

css/main.css: $(PROGDIR)/main.css
	cp $< $@

js/main.js: $(PROGDIR)/main.js
	cp $< $@
