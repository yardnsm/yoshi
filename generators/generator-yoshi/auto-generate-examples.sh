#!/bin/bash

clone_into_dir="cloned-project"
generated_examples_dir="generated-examples"

git clone $GIT_REMOTE_URL $clone_into_dir

rm -rf $clone_into_dir/examples/auto-generated
mv $generated_examples_dir $clone_into_dir/examples/auto-generated

cd $clone_into_dir

git add examples/auto-generated
git commit -m "updating auto-generated examples"
git push --set-upstream origin master
