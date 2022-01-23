const FILES_URL = '/words.b64.txt';
const MAX_RESULTS = 200;
const OUTPUT_SCROLL_THRESHOLD = 0.8;

let wordList;

 /** Download and decompress word list */
function loadWordList() {
  fetch(FILES_URL)
    .then(response => response.text())
    .then(data => {
      wordList = atob(data).split(',')
      console.log(`Got word list with ${wordList.length} words`);
    })
    .catch(error => {
      console.error(error);
      displayError('There was a problem loading the word dictionary. Please refresh the page to try again.');
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
  // update footer float after redraw
  setTimeout(updateFooterFloat, 1);

  if (!wordList) {
    displayError('We are still loading the word dictionary, please try searching again');
    return;
  }

  // get inputs
  const matchInput = document.getElementById('matcher').value;
  const includeInput = document.getElementById('include').value;
  const excludeInput = document.getElementById('exclude').value;

  // get results
  let results = getMatchingWords(
    getPreparedInput(matchInput),
    getPreparedInput(includeInput),
    getPreparedInput(excludeInput)
  );

  // remove all previous results
  const output = document.getElementById('output');
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }

  // limit number of results to display if necessary
  let lengthError;
  if (results.length > MAX_RESULTS) {
    lengthError = `Excluded ${results.length - MAX_RESULTS} additional results.`;
    const interval = Math.round(results.length / MAX_RESULTS);
    results = results.filter((_, index) => index % interval == 0);
  }

  // display results
  results.slice(0, MAX_RESULTS).forEach(result => {
    const resultElement = document.createElement('span');
    resultElement.innerText = result;
    output.appendChild(resultElement);
  });

  // display length error if necessary
  if (lengthError) {
    displayError(lengthError, true);
  }

  // scroll to output section if it is low enough on screen
  const outputTopPos = output.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;
  if (outputTopPos >= windowHeight * OUTPUT_SCROLL_THRESHOLD) {
    output.scrollIntoView({ 'behavior': 'smooth' });
  }
}

/** Displays an error message to the user */
function displayError(message, keepPreviousOutput) {
  // remove all previous output
  const output = document.getElementById('output');
  if (!keepPreviousOutput) {
    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }
  }

  // display error
  const errorElement = document.createElement('span');
  errorElement.classList.add('error')
  errorElement.innerText = message;
  output.appendChild(errorElement);
}

/** Update the footer's floating state depending on whether it would block page content */
function updateFooterFloat() {
  const footer = document.getElementById('footer');
  const footerMarker = document.getElementById('footer-marker');

  const windowHeight = window.innerHeight;
  const footerHeight = footer.getBoundingClientRect().height + 0.1 * windowHeight;
  const footerMarkerPosition = footerMarker.getBoundingClientRect().top;

  if (footerMarkerPosition + footerHeight > windowHeight) {
    footer.classList.remove('floating');
  }
  else {
    footer.classList.add('floating');
  }
}

/** Set listeners */
function setupListeners() {
  document.getElementById('search').addEventListener('click', submitSearch);
  window.addEventListener('resize', updateFooterFloat);
}

document.addEventListener('DOMContentLoaded', () => {
  loadWordList();
  setupListeners();
  updateFooterFloat();
});
