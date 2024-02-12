const Sequencer = require('@jest/test-sequencer').default;

class SortByAlpha extends Sequencer {
  sort(tests) {
    const copyTests = [...tests];
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
  }
}

module.exports = SortByAlpha;
