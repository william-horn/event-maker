
const Errors = {};

Errors.messages = {
  invalidType: 'Invalid type: \'$(0)\' expected, got \'$(1)\'',
}

for (key in Errors.messages) {
  const message = Errors.messages[key];

  Errors[key.charAt(0).toUpperCase() + key.slice(1)] = (...args) => {
    const err = message.replace(/\$\((.*?)\)/g, (_, index) => [...args][index]);
    console.log(err);
  }
}


module.exports = Errors;
