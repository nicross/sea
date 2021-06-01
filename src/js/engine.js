const engine = syngen

// Cryptographically insecure yet performant
// TODO: Investigate chance of collisions with Math.random()
// TODO: Revisit when UUID is W3C spec (https://wicg.github.io/uuid)
engine.utility.uuid = () => {
  // SEE: https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
