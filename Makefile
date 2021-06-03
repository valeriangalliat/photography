PHOTOS_FULL = $(shell find dist/photos/full -name '*.jpg')
PHOTOS_HD = $(PHOTOS_FULL:dist/photos/full/%=dist/photos/hd/%)
PHOTOS_THUMB = $(PHOTOS_FULL:dist/photos/full/%=dist/photos/thumb/%)
PHOTOS_HTML = $(PHOTOS_FULL:dist/photos/full/%.jpg=dist/photos/%.html)
MD = $(shell find . -name '*.md' ! -path './node_modules/*' ! -path './dist/*' ! -path './README.md' | sed 's,^./,,')
HTML = $(MD:%.md=dist/%.html)
ICONS = dist/img/icons/403-instagram.svg dist/img/icons/407-twitter.svg dist/img/icons/414-youtube.svg dist/img/icons/433-github.svg dist/img/icons/452-soundcloud.svg dist/img/icons/458-linkedin.svg
ASSETS = dist/css/normalize.css dist/css/codejam.css dist/css/main.css dist/js/main.js $(ICONS)

build: dist $(PHOTOS_HD) $(PHOTOS_THUMB) $(PHOTOS_HTML) $(HTML) $(ASSETS)

dist:
	git worktree add dist gh-pages

clean:
	# Purposedly not cleaning generated photos, do it manually if you really need.
	rm -f $(HTML) $(ASSETS)

clean-html:
	rm -f $(HTML)

.PHONY: new
new:
	./new

orphans: .photos .references
	@comm -23 .photos .references
	@rm .photos .references

missing: .photos .references
	@comm -13 .photos .references
	@rm .photos .references

.photos: $(PHOTOS_FULL)
	@printf '%s\n' $(^:dist/photos/full/%=%) | sort | uniq > $@

.references: $(MD)
	@grep --no-filename -o '[^/]*\.jpg' $^ | sort | uniq > $@

dist/photos/hd/%.jpg: dist/photos/full/%.jpg
	convert $< -resize 1920x1080^ $@

dist/photos/thumb/%.jpg: dist/photos/full/%.jpg
	convert $< -resize 300x200^ -gravity center -extent 300x200 $@

dist/photos/%.html: dist/photos/full/%.jpg head.html foot.html
	./genphotopage $< > $@

dist/%.html: %.md head.html foot.html | $(PHOTOS_HD) $(PHOTOS_THUMB)
	./render $< > $@

dist/css/normalize.css: node_modules/normalize.css/normalize.css
	cp $< $@

dist/css/codejam.css:
	curl \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/base.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/footer.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/header.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/nav.css \
		| sed 's/^\.content {$$/.markdown-body {/' > $@

dist/css/main.css: css/main.css
	cp $< $@

dist/js/main.js: js/main.js
	cp $< $@

dist/img/icons/%.svg: node_modules/icomoon-free-npm/SVG/%.svg
	cat $< | sed 's/<svg /<svg id="icon" /;s/fill="#000000"/style="fill: var(--color-fill)"/' > $@

dist/img/val-1.jpg: dist/photos/full/IMG_20181204_184340.jpg
	@# Offset is 45% of full height (1440) minus final height (768) to
	@# mimic browser's background position behaviour.
	convert $< -resize 1920x768^ -extent 1920x768+0+302.4 $@

dist/img/val-2.jpg: dist/photos/full/IMG_20190103_111123.jpg
	@# Offset is 10% of full height (1440) minus final height (768) to
	@# mimic browser's background position behaviour.
	convert $< -resize 1920x768^ -extent 1920x768+0+67.2 $@

dist/img/val-3.mp4: dist/img/VID_20181121_141159.mp4
	ffmpeg -i $< -s 960x540 -c:a copy $@

dist/img/val-3.jpg: dist/img/VID_20181121_141159.mp4
	ffmpeg -v error -nostdin -accurate_seek -ss 00:00:01.933 -i $< -vf scale=iw*sar:ih -frames:v 1 $@

serve:
	cd dist && python3 -m http.server 8001
