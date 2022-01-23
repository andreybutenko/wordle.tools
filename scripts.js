const FILES_URL = '/words.b64.txt';

let wordList;

 /** Download and decompress word list */
function loadWordList() {
  fetch(FILES_URL)
    .then(response => response.text())
    .then(data => {
      wordList = atob(data).split(',')
      console.log(`Got word list with ${wordList.length} words`);
    });
}

/**
 * Get arrays of words which match the provided criteria
 * @param {string} matchStr Regex for matching
 * @param {string[]} includeList Array of characters which must be included
 * @param {string[]} excludeList Array of characters which must be excluded
 * @returns Array of matching words
 */
function getMatchingWords(matchStr, includeList, excludeList) {
  console.log('getMatchingWords', matchStr, includeList, excludeList);
  const matchRegex = new RegExp(matchStr);
  return wordList
    // filter to words which match the matchStr
    .filter(word => matchRegex.test(word))
    // filter to words that contain all in the includeList, if provided
    .filter(word => includeList.length === 0 || includeList.every(char => word.includes(char)))
    // filter to words where no character is in the excludeList  
    .filter(word => word.split('').every(char => !excludeList.includes(char)));
}

/** Return list of valid characters from input string */
function getPreparedInput(inputStr) {
  return inputStr
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('');
}

/** Submit a search and displays results */
function submitSearch() {
  // get inputs
  const matchInput = document.getElementById('matcher').value;
  const includeInput = document.getElementById('include').value;
  const excludeInput = document.getElementById('exclude').value;

  // get results
  const results = getMatchingWords(
    getPreparedInput(matchInput),
    getPreparedInput(includeInput),
    getPreparedInput(excludeInput)
  );

  // remove all previous results
  const output = document.getElementById('output');
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }

  // display results
  results.forEach(result => {
    const resultElement = document.createElement('span');
    resultElement.innerText = result;
    output.appendChild(resultElement);
  })
}

/** Set listeners */
function setupListeners() {
  document.getElementById('search').addEventListener('click', submitSearch);
}

document.addEventListener('DOMContentLoaded', () => {
  loadWordList();
  setupListeners();
});