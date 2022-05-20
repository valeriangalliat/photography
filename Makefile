PHOTOS_FULL = $(shell find dist/photos/full -name '*.jpg')
PHOTOS_HD = $(PHOTOS_FULL:dist/photos/full/%=dist/photos/hd/%)
PHOTOS_SD = $(PHOTOS_FULL:dist/photos/full/%=dist/photos/sd/%)
PHOTOS_THUMB = $(PHOTOS_FULL:dist/photos/full/%=dist/photos/thumb/%)
PHOTOS_HTML = $(PHOTOS_FULL:dist/photos/full/%.jpg=dist/photos/%.html)

MD = $(shell find . -name '*.md' ! -path './node_modules/*' ! -path './dist/*' ! -path './README.md' | sed 's,^./,,')
HTML = $(MD:%.md=dist/%.html)

SCRIPTS = $(shell find js -name '*.js')

ICONS = dist/img/icons/403-instagram.svg dist/img/icons/407-twitter.svg dist/img/icons/414-youtube.svg dist/img/icons/433-github.svg dist/img/icons/452-soundcloud.svg dist/img/icons/219-heart.svg
ASSETS = dist/css/normalize.css dist/css/codejam-20220520.css dist/css/main-20220520.css dist/js/main-20211017.js $(ICONS)

build: dist $(PHOTOS_HD) $(PHOTOS_SD) $(PHOTOS_THUMB) $(PHOTOS_HTML) $(HTML) $(ASSETS)

watch:
	npm run watch

dist:
	git worktree add dist gh-pages

clean:
	# Purposedly not cleaning generated photos, do it manually if you really need.
	rm -f $(HTML) $(ASSETS)

clean-html:
	rm -f $(HTML)

clean-orphans:
	make orphans | xargs ./scripts/delete-photo

new:
	./scripts/new

rotate-css:
	./scripts/rotate css

rotate-codejam-css:
	./scripts/rotate css codejam

rotate-js:
	./scripts/rotate js

orphans: .photos .references
	@comm -23 .photos .references
	@rm .photos .references

missing: .photos .references
	@comm -13 .photos .references
	@rm .photos .references

.photos: $(PHOTOS_FULL)
	@printf '%s\n' $(^:dist/photos/full/%=%) | sort | uniq > $@

.references: $(HTML)
	@grep --no-filename -Eo '/photos/[^\.]*\.(jpg|html)' $^ | sed 's/\.html$$/.jpg/;s/.*\///' | sort | uniq > $@

dist/photos/hd/%.jpg: dist/photos/full/%.jpg
	convert $< -resize 1920x1080^ $@

dist/photos/sd/%.jpg: dist/photos/full/%.jpg
	convert $< -resize 960x540^ $@

dist/photos/thumb/%.jpg: dist/photos/full/%.jpg
	convert $< -resize 300x200^ -gravity center -extent 300x200 $@

dist/photos/%.html: cache/render-photo-pages-flag
	@# Avoid slowing down `make` by looking up for implicit targets.
	@echo $@

cache/render-photo-pages-flag: $(PHOTOS_HD) head.html foot.html
	touch $@
	./scripts/render-photo-pages

dist/%.html: %.md head.html foot.html | $(PHOTOS_HD) $(PHOTOS_THUMB)
	./scripts/render $< > $@

dist/css/normalize.css: node_modules/normalize.css/normalize.css
	cp $< $@

dist/css/codejam-20220520.css:
	curl \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/colors.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/base.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/footer.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/header.css \
		https://raw.githubusercontent.com/valeriangalliat/blog/master/css/components/nav.css \
		> $@

dist/css/main-20220520.css: css/main.css css/slide.css css/photo.css
	cat $^ > $@

dist/js/main-20211017.js: $(SCRIPTS)
	npm run build

dist/img/icons/%.svg: node_modules/icomoon-free-npm/SVG/%.svg
	cat $< | sed 's/<svg /<svg id="icon" /;s/fill="#000000"/style="fill: var(--color-fill)"/' > $@

dist/photos/thumb/P2680620-Pano-0.jpg: dist/photos/full/P2680620-Pano.jpg
	convert $< -resize 600x200^ -gravity center -extent 300x200-150+0 $@

dist/photos/thumb/P2680620-Pano-1.jpg: dist/photos/full/P2680620-Pano.jpg
	convert $< -resize 600x200^ -gravity center -extent 300x200+150+0 $@

dist/img/val-1.jpg: dist/photos/full/IMG_20181204_184340.jpg
	magick $< -resize 1280x -crop '1280x512+0+%[fx:45/100*(h-512)]' $@

dist/img/val-2.jpg: dist/photos/full/IMG_20190103_111123.jpg
	magick $< -resize 1280x -crop '1280x512+0+%[fx:10/100*(h-512)]' $@

dist/img/val-3.mp4: VID_20181121_141159.mp4
	ffmpeg -i $< -s 1280x540 -c:a copy $@

dist/img/val-3.jpg: VID_20181121_141159.mp4
	ffmpeg -v error -nostdin -accurate_seek -ss 00:00:01.933 -i $< -vf scale=iw*sar:ih -frames:v 1 -f image2 - \
		| magick - -resize 1280x $@

dist/img/val-4.jpg: dist/photos/full/242989947_902803300666398_4415379739264788769_n.jpg
	magick $< -resize 1280x -crop '1280x512+0+%[fx:40/100*(h-512)]' $@

dist/img/icons/instagram.png:
	curl 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png' | convert - -resize 16x $@

dist/img/icons/twitter.png:
	curl 'https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc7275.png' | convert - -resize 16x $@

dist/img/icons/gmail.png:
	curl 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' | convert 'ico:-[3]' -resize 16x $@

serve:
	cd dist && python3 -m http.server 8001

dev:
	make watch & make serve
