/*
@author William J. Horn

documentation coming soon
*/

// objectMeetsCriteria(connection, [
//   {key: 'name', equals: 6, excludeUndefined: true},
//   {key: 'handler', equals: undefined, excludeUndefined: true}

// ])

// const objectMeetsCriteria = (object, criteria) => {
//   for (let i = 0; i < criteria.length; i++) {
//     const rule = criteria[i];
//     const passIfUndefined = rule.passIfUndefined !== false;
//     const isUndefined = rule.equals === undefined;
//     const objectValue = object[rule.key];
//     const isEqual = objectValue !== undefined && objectValue === rule.equals;

//     if (!(isEqual || (isUndefined && passIfUndefined))) {
//       return false;
//     }
    
//   }

//   return true;
// }

/*
  const object = { keyThree: 'string', keyOne: 8, food: 'tasty', keyOne: undefined, keyTwo: 6, [false]: null };

  objectMeetsCriteria(object, {
    keyOne: { value: undefined, inputRequired: false },
    [false]: { value: null },
  }, { 
    excludeUndefined: true |=> true,
    inputRequired: true |=> false
   });

   includeUndefined | default: false
    - (when true) if input value is undefined then include it in the search

   inputRequired | default: false
    - (when true) if input value is undefined then cancel search

*/

const objectMeetsCriteria = (object, criteria, globalOptions = {}) => {
  const objKeys = Object.keys(object);
  const inputKeys = Object.keys(criteria);
  const objLen = objKeys.length;
  const inputLen = inputKeys.length;

  if (objLen === 0 || inputLen === 0) return false;
  if (inputLen > objLen) return false;

  let matches = 0;
  let numUnd = 0;

  for (let i = 0; i < objLen; i++) {
    const objKey = objKeys[i];
    const objValue = object[objKey];
    const input = criteria[objKey];

    if (input) {
      const inputRequired = input.inputRequired || globalOptions.inputRequired;
      const includeUndefined = input.includeUndefined || globalOptions.includeUndefined;
      const inputUnd = input.value === undefined;

      if (inputUnd && inputRequired) return false;

      if (inputUnd && !includeUndefined) numUnd++;
        else if (input.value !== objValue) return false;

      matches++;

      if (numUnd === inputLen) return false;
        else if (matches === inputLen) return true;
    }
  }

  return false;
}

module.exports = objectMeetsCriteria;
