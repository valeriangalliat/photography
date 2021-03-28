#!/usr/bin/sed -E -f
#
# Generate Markdown links. Pipe your Markdown file to this script to
# transform links, e.g. `:%!bin/linkmd` in Vim.
#
#     thumb foo
#     athumb foo bar
#     hd foo
#     ahd foo bar
#
# Will be transformed in:
#
#     [![foo](/photos/thumb/foo.jpg)](/photos/foo.md)
#     [![foo](/photos/thumb/foo.jpg)](bar)
#     [![foo](/photos/hd/foo.jpg)](/photos/foo.md)
#     [![foo](/photos/hd/foo.jpg)](bar)
#

s,^thumb (.*),[![\1](/photos/thumb/\1.jpg)](/photos/\1.md),
s,^athumb ([^ ]*) (.*),[![\1](/photos/thumb/\1.jpg)](\2),
s,^hd (.*),[![\1](/photos/hd/\1.jpg)](/photos/\1.md),
s,^ahd ([^ ]*) (.*),[![\1](/photos/hd/\1.jpg)](\2),
