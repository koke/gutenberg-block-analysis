#!/bin/sh

file=posts.csv

if [ ! -f $file ]
then
    echo "You need a data.csv file with pairs of blog and post ID"
    exit 1
fi

for post in $( cat $file )
do
    blog_id=$( echo $post | cut -d, -f1 )
    post_id=$( echo $post | cut -d, -f2 )
    filename="cache/$blog_id-$post_id.json"
    url="https://public-api.wordpress.com/rest/v1.1/sites/$blog_id/posts/$post_id"
    wget -nc -nv -O $filename $url
done