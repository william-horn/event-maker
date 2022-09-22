/*
@author William J. Horn

Better version of schemaArgs function. Still in beta
~ Will

const foo = (...args) => {
  const [first, second, third, fourth] = schemaArgs([
    { type: { string: true }, got: { boolean: val => val } },
    { type: { string: s => s.toUpperCase() } },
    { type: { number: true, function: true }, got: { string: got => got.toUpperCase() }},
    { type: { number: true, boolean: true }, required: true },
  ], ...args);

  console.log(first, second, third, fourth);
}

current version has a time complexity of O(n^2) as data size decreases.
*/

const _function = 'function';

// todo: look into bitwise operators for type checking
const getType = (arg, lookup, index) => {
  let argType = lookup[index];

  if (!argType) {
    const primArgType = typeof arg;

    argType = Array.isArray(arg) ? 'array' 
      : (primArgType === 'object' && arg._customType)
        || primArgType;

    lookup[index] = argType;
  }

  return argType;
}

const schemaArgs = (model, ...args) => {
  const result = [];
  const typePositions = {};
  const typeCache = [];
  const argList = [...args];
  const assignedIndices = [];

  const modelLen = model.length;
  const argsLen = argList.length;

  for (let i = 0; i < modelLen; i++) {
    const modelRow = model[i];
    const expectedTypes = modelRow.type;
    const alts = modelRow.got;
    const arg1 = argList[i];
    const type1 = getType(arg1, typeCache, i);

    let startIndex = Infinity;
    let found = false;

    // get smallest type starting position 
    for (let type in expectedTypes) {
      const typeIndex = typePositions[type] || 0;
      if (typeIndex < startIndex) {
        startIndex = typeIndex;
      }
    }

    // search arg list for match
    for (startIndex; startIndex < argsLen; startIndex++) {
      let arg2 = argList[startIndex];
      const type2 = getType(arg2, typeCache, startIndex);
      const mode = expectedTypes[type2];
      const modeType = typeof mode;

      if (!assignedIndices[startIndex]) {
        if (modeType === _function) {
          arg2 = mode(arg2);
        } else if (mode !== true) {
          continue;
        }

        found = true;
        result[i] = arg2;
        assignedIndices[startIndex] = true;
        typePositions[type2] = startIndex + 1;

        break;
      }
    }

    if (found) continue;

    if (modelRow.required) {
      throw new Error(`Argument #${i + 1} missing (expected <${Object.keys(expectedTypes).join('|')}>, got <${type1}>)`);

    } else if (alts && alts.hasOwnProperty(type1)) {
      console.log(startIndex, argsLen, alts, found);
      let final = alts[type1];
      if (typeof final === _function) {
        final = final(arg1);
      }
      result[i] = final;

    } else if (modelRow.hasOwnProperty('else')) {
      result[i] = modelRow.else;
    }
  }

  return result;
}

module.exports = schemaArgs;