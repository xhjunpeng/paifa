const START_TOKEN = '<!-- PAIFA_MANAGED_BLOCK_START';
const END_TOKEN = '<!-- PAIFA_MANAGED_BLOCK_END -->';
const START_PATTERN = /<!-- PAIFA_MANAGED_BLOCK_START version=([^\s]+) prefix=(empty|preserved|added) -->/g;

function count(text, token) {
  return text.split(token).length - 1;
}

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

function managedText(body, version, prefixMode) {
  const normalizedBody = body.trim();
  return `<!-- PAIFA_MANAGED_BLOCK_START version=${version} prefix=${prefixMode} -->\n${normalizedBody}\n${END_TOKEN}`;
}

export function inspectManagedBlock(text) {
  const source = String(text);
  const startCount = count(source, START_TOKEN);
  const endCount = count(source, END_TOKEN);

  if (startCount === 0 && endCount === 0) {
    return { count: 0 };
  }

  if (startCount !== endCount) {
    fail('MALFORMED_MANAGED_BLOCK', 'Start and end marker counts differ.');
  }

  if (startCount > 1) {
    fail('DUPLICATE_MANAGED_BLOCK', 'More than one managed block exists.');
  }

  START_PATTERN.lastIndex = 0;
  const startMatch = START_PATTERN.exec(source);
  if (!startMatch) {
    fail('MALFORMED_MANAGED_BLOCK', 'Start marker attributes are invalid.');
  }

  const startIndex = startMatch.index;
  const bodyStart = startIndex + startMatch[0].length + 1;
  const endIndex = source.indexOf(END_TOKEN, bodyStart);
  if (endIndex < bodyStart) {
    fail('MALFORMED_MANAGED_BLOCK', 'End marker is missing or precedes the body.');
  }

  const markerEnd = endIndex + END_TOKEN.length;
  return {
    count: 1,
    version: startMatch[1],
    prefixMode: startMatch[2],
    startIndex,
    endIndex: markerEnd,
    body: source.slice(bodyStart, endIndex).replace(/\n$/, ''),
  };
}

export function applyManagedBlock(text, body, version) {
  const source = String(text);
  const inspected = inspectManagedBlock(source);

  if (inspected.count === 1) {
    const replacement = managedText(body, version, inspected.prefixMode);
    const updated = `${source.slice(0, inspected.startIndex)}${replacement}${source.slice(inspected.endIndex)}`;
    return updated === source ? source : updated;
  }

  let prefixMode = 'empty';
  let separator = '';
  if (source.length > 0 && source.endsWith('\n')) {
    prefixMode = 'preserved';
  } else if (source.length > 0) {
    prefixMode = 'added';
    separator = '\n';
  }

  return `${source}${separator}${managedText(body, version, prefixMode)}\n`;
}

export function removeManagedBlock(text) {
  const source = String(text);
  const inspected = inspectManagedBlock(source);
  if (inspected.count === 0) return source;

  let startIndex = inspected.startIndex;
  if (inspected.prefixMode === 'added' && source[startIndex - 1] === '\n') {
    startIndex -= 1;
  }

  let endIndex = inspected.endIndex;
  if (source[endIndex] === '\n') {
    endIndex += 1;
  }

  return `${source.slice(0, startIndex)}${source.slice(endIndex)}`;
}
