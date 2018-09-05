# Gutenberg block analysis

This is a tool I built to analyze a sample of WordPress.com posts for the most common types of content.

## Usage

First, you need a CSV file named `posts.csv` with a blog ID and post ID in each row.
I didn't include the list in the repository for privacy reasons, but you can easily generate one with curl and [jq](https://stedolan.github.io/jq/):

```
SITE=koke.me; curl -s https://public-api.wordpress.com/rest/v1.1/sites/$SITE/posts | jq '.posts[] | [.site_ID, .ID] | @csv'
```

Then you need to install dependencies with `yarn install` or `npm install`.

Then run `./fetch.sh` to get the posts metadata. This will store a bunch of JSON files in `cache`.

Once that's done, run `node . cache/*` and it will show a report like this:

```
Sample size: 1578
core/paragraph 88% (1385)
core/image 62% (974)
core/heading 13% (205)
core/list 8% (123)
core/quote 7% (115)
core/separator 5% (81)
core/embed 4% (61)
core/table 0% (7)
core/preformatted 0% (3)
core/shortcode 0% (1)
core/freeform 0% (1)
```