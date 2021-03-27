# Photograph

> Trivial tools to make a GitHub based photography portfolio.

For an example, [photography.codejam.info](https://photography.codejam.info/)
is built with this tool.

## Installation

```sh
# pacman -S imagemagick
# apt install imagemagick
# brew install imagemagick coreutils
npm install -g valeriangalliat/photograph
```

## Usage

### Init

In a new directory, run the following to create the base template:

```sh
photograph init
```

It will generate the following structure:

```
.
├── index.md
└── photos
    ├── full
    ├── hd
    └── thumb
```

### Markdown

Edit `index.md` with Vim, and run the following to render the image
shortcuts:

```
:%!photograph md
```

For example, it renders the following:

```md
hd P0000001
ahd P0000002 /foo
athumb P0000003 /foo
```

Into:

```md
[![P0000001](/photos/hd/P0000001.jpg)](/photos/P0000001.md)
[![P0000002](/photos/hd/P0000002.jpg)](/foo)
[![P0000003](/photos/thumb/P0000003.jpg)](/foo)
```

An alternative is to use `photograph new` which will generate the
Markdown text from a directory of images:

```sh
photograph new
```

```
Title: ⛄️ Rawdon
Path (e.g. 2019/2019-07-20-foo): 2019/2019-02-23-rawdon
Put all the photos you want to add in this directory, then press enter...
```

After adding photos to the directory that opens, it outputs:

```
### [⛄️ Rawdon](/2019/2019-02-23-rawdon.md)

[![P2600938](/photos/thumb/P2600938.jpg)](/2019/2019-02-23-rawdon.md)
[![P2600956](/photos/thumb/P2600956.jpg)](/2019/2019-02-23-rawdon.md)
[![P2600962](/photos/thumb/P2600962.jpg)](/2019/2019-02-23-rawdon.md)
[![P2600971](/photos/thumb/P2600971.jpg)](/2019/2019-02-23-rawdon.md)
[![P2600976](/photos/thumb/P2600976.jpg)](/2019/2019-02-23-rawdon.md)
[![P2600984](/photos/thumb/P2600984.jpg)](/2019/2019-02-23-rawdon.md)

# ⛄️ Rawdon

[![P2600938](/photos/hd/P2600938.jpg)](/photos/P2600938.md)
[![P2600956](/photos/hd/P2600956.jpg)](/photos/P2600956.md)
[![P2600962](/photos/hd/P2600962.jpg)](/photos/P2600962.md)
[![P2600971](/photos/hd/P2600971.jpg)](/photos/P2600971.md)
[![P2600976](/photos/hd/P2600976.jpg)](/photos/P2600976.md)
[![P2600984](/photos/hd/P2600984.jpg)](/photos/P2600984.md)
```

You can then use the first part in the `index.md` and keep only the
photos you want for cover thumbs, and copy the second part in
`/2019/2019-02-23-rawdon.md`.

### Missing

The base template references a number of nonexistent photos. The
following will print the list of missing photos:

```sh
photograph missing
```

You can add the missing photos into the `photos/full` directory.

### Orphans

Sometimes, you end up adding photos that you don't refer to in any
Markdown file, so they end up being orphan and taking space for nothing.
You can identify them by doing:

```sh
photograph orphans
```

If you want to remove them, including the `hd` and `thub` variants as
well as the HTML file for the photo in question if they exist, do:

```sh
photograph orphans rm
```

It will prompt for each file to remove.

### Build

Once the photos are present, you can build the other resolution variants
as well as the individual photo pages with Exif metadata:

```sh
photograph build
```

Your repository is now ready and you can commit and push it!
