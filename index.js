const readline = require('readline');
const screenshots = require('./screenshots.js');

const stringIsAValidUrl = (s) => {
  try {
    let url = new URL(s);
    return url;
  } catch (err) {
    return false;
  }
};

let input = [];

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


console.log('Enter URLs each on new line. (Ctrl+C when done)')
rl.prompt();

rl.on('line', function (cmd) {

    input.push(cmd);
});

rl.on('close', function (cmd) {

    const urls = input.map(item=>stringIsAValidUrl(item)).filter(item=>item!=false);

    if ( urls ) {
      screenshots(urls);
    }

    // process.exit(0);
});

