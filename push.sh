#!/bin/sh
git status
git diff
git add .
git commit -m "$(date +'%Y-%m-%d %H:%M:%S')"
git push
notify-send -a GitHub "changes in $PWD pushed"
