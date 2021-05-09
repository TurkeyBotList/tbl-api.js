# tbl-api.js
Turkey Bot List API Library.
# How to use
Example: 
```js
const TBL = require("@foxreistr/tbl-api.js");
const tbl = new TBL("TBL_TOKEN_HERE", client); // autoposts by default every 30 minutes if client is provided

// search for bots
(async () => {
    const bots = await tbl.search('turkey');
    console.log(bots);
})();

// fetch image embeds
const fs = require('fs');
(async () => {
    const embed = await tbl.embed('792986882215510067');
    fs.writeFileSync('image.png', embed);
})();

// fetch most 10 liked bots
(async () => {
    const mostLiked = await tbl.fetchMostLikedBots();
    console.log(mostLiked);
})();

// fetch most 10 recent bots
(async () => {
    const recentBots = await tbl.fetchLatestBots();
    console.log(recentBots);
})();
```
If you need any support, [join the support server.](https://discord.com/invite/HKUgsANsc2)