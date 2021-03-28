# 📷 Photography

> Photography portfolio.

## Installation

```sh
# pacman -S imagemagick
# apt install imagemagick
# brew install imagemagick
npm install
```

## Build

```sh
make -j8
```

## Add a new trip

```sh
make new
```

Give it a title, slug and date, drop your photos in the directory that
opens, and let the script generate the Markdown file for you and update
the `index.md`.

## Markdown editing shortcuts

If in a Markdown file you want to quickly reference photos by their
name, you can write the following:

```md
hd P0000001
ahd P0000002 /foo
athumb P0000003 /foo
```

Then run it through `./md`, for example in Vim, type:

```
:%!./md
```

It will turn the previous input into:

```md
[![P0000001](/photos/hd/P0000001.jpg)](/photos/P0000001.md)
[![P0000002](/photos/hd/P0000002.jpg)](/foo)
[![P0000003](/photos/thumb/P0000003.jpg)](/foo)
```

## Find missing pictures

```sh
make missing
```

This will list the pictures that are referenced from your Markdown files
but not present in the `dist/photos` directory.

You can add the missing photos into the `dist/photos/full` directory.

## Find orphans

Sometimes, you might import photos that you don't refer to in any
Markdown file, and they end up being orphaned and taking space for
nothing. You can identify them by doing:

```sh
make orphans
```
