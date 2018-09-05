const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const util = require('util');
const readFile = util.promisify(fs.readFile);

class Analyzer {
    async setup() {
        this.browser = await puppeteer.launch();
        const page = await this.browser.newPage();
        await page.goto('https://testgutenberg.com');
        this.page = page    
    }

    async teardown() {
        this.browser.close();
    }

    async analyzeFile( path ) {
        const json = await readFile( path );
        if ( json == "" ) {
            return;
        }
        const post = await JSON.parse( json );
        const blocks = await this.analyze( post.content );
        return {
            blog: post.site_ID,
            post: post.ID,
            blocks: blocks,
        };
    }

    async analyze( content ) {
        if ( this.page === undefined ) {
            throw new Error( 'You need to call setup before analyze' );
        }

        const blockList = await this.page.evaluate( content => {
            const nameMap = (block) => block.name;
            var blockList = wp.blocks.parse(content).map(nameMap);
            if ( blockList.length == 1 && blockList[0] == 'core/freeform' ) {
                blockList = wp.blocks.rawHandler( {
                    HTML: content,
                     mode: 'BLOCKS'
                }).map( block => block.name )
            }
            return blockList;
        }, content);
        return blockList.reduce((list, block) => {
            list[block] = (list[block] || 0) + 1;
            return list
        },{});
    }
}

const files = process.argv.slice(2);
(async () => {
    const analyzer = new Analyzer();
    await analyzer.setup();
    const results = [];
    for ( const file of files ) {
        const result = await analyzer.analyzeFile(file);
        if ( result !== undefined ) {
            results.push( result );
        } 
    }
    const totalCount = results.length;
    console.log(`Sample size: ${totalCount}`);
    const blockCounts = results
        .reduce( (accum, post) => {
            Object.keys(post.blocks).forEach(key => {
                accum[key] = ( accum[key] || 0 ) + 1;
            });
            return accum;
        }, {});
    const blockRanking = Object.keys(blockCounts)
        .sort( (a,b) => blockCounts[b] - blockCounts[a])
        .map( key => {
            return {name: key, count: blockCounts[key], percentage: Math.round( 100 * blockCounts[key] / totalCount )};
        })
    
    blockRanking.forEach( ({name, count, percentage}) => {
        console.log(`${name} ${percentage}% (${count})`);
    });

    await analyzer.teardown();
})();