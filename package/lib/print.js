
const Console = {};

const opts = {
  reset: '[0m',
  bright: '[1m',

}

for (key in opts) {
  opts[key] = '\x1b' + opts[key];
}

const print = (color, message, reset) => {
  console.log(opts[color] + message + (!reset ? opts.reset : ''))
}

Console.error = message => {
  print('red', message);
}

module.exports = Console;
