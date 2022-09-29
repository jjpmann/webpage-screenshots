
'use strict';

module.exports = function ( UrlList, options ) {

  // validate UrlList is array of URLS
  if ( ! Array.isArray(UrlList) ) {
    console.error('UrlList is not an array.');
    process.exit(1);
  } 
  for (const url of UrlList){
    if (typeof url !== 'object' || Object.getPrototypeOf( url ) !== URL.prototype) {
      console.error('All items must be of URL type.');
      process.exit(1);
    }
  }

  console.log('creating screenshots for ' + UrlList.length + ' pages.');
  // console.log( UrlList );

  const puppeteer = require('puppeteer');
  const sanitize = require("sanitize-filename");
  const fs = require('fs');

  let directory = './' + new Date().getTime();
  if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
  }

  let _options = {
    'executablePath': '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  };

  (async () => {
    const browser = await puppeteer.launch(_options);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1400,
        height: 900
    })

    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight - window.innerHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
    
    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    const waitTillHTMLRendered = async (page, timeout = 30000) => {
      const checkDurationMsecs = 1000;
      const maxChecks = timeout / checkDurationMsecs;
      let lastHTMLSize = 0;
      let checkCounts = 1;
      let countStableSizeIterations = 0;
      const minStableSizeIterations = 3;

      while(checkCounts++ <= maxChecks){
        let html = await page.content();
        let currentHTMLSize = html.length; 

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
          countStableSizeIterations++;
        else 
          countStableSizeIterations = 0; //reset the counter

        if(countStableSizeIterations >= minStableSizeIterations) {
          console.log("Page rendered fully..");
          break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitForTimeout(checkDurationMsecs);
      }  
    };

    for (var i = UrlList.length - 1; i >= 0; i--) {
      let url       = UrlList[i];
      let path      = sanitize(url.pathname) ? '-' + sanitize(url.pathname) : '';
      let search    = sanitize(url.search)   ? '-' + sanitize(url.search)   : '';
      let filename  = directory + '/' + ( sanitize(url.host) + path + search ).replace(/\./g, '-') + '.jpg';
      console.log( filename + ' - ' + url.toString() );
      // await page.goto(url);
      await page.goto(url, { waitUntil: 'networkidle2'} );
      // await page.goto(url, { waitUntil: 'domcontentloaded'} );
      // await autoScroll(page);
      // await wait(1500);
      // await page.goto(url, {'timeout': 10000, 'waitUntil':'load'});
      // await waitTillHTMLRendered(page)
      await page.screenshot({path: filename, fullPage: false });
    }
    
    await browser.close();
  })();
}

