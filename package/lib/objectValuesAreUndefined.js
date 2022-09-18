
const objectValuesAreUndefined = object => {
  for (key in object) {
    if (object[key] !== undefined) return false;
  }
  return true;
}

module.exports = objectValuesAreUndefined;

