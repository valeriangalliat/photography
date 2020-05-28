all: photos/thumb/P2680620-Pano-0.jpg photos/thumb/P2680620-Pano-1.jpg
	node_modules/.bin/photograph build

photos/thumb/P2680620-Pano-0.jpg: photos/full/P2680620-Pano.jpg
	convert $< -resize 600x200^ -gravity center -extent 300x200-150+0 $@

photos/thumb/P2680620-Pano-1.jpg: photos/full/P2680620-Pano.jpg
	convert $< -resize 600x200^ -gravity center -extent 300x200+150+0 $@

serve:
	python -m http.server
