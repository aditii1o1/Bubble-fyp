const LABEL_PATTERN = "(?:date\\s*of\\s*birth|dob|birth\\s*date)";
const DATE_CAPTURE_PATTERN =
  "(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{4})";
const ID_KEYWORD_REGEX =
  /\b(id|identity|passport|license|licence|national|citizen)\b/i;
const NAME_LABEL_REGEX =
  /\b(name|full\s*name|surname|given\s*names?|first\s*name|last\s*name|family\s*name)\b/i;
const NATIONALITY_OR_ADDRESS_REGEX =
  /\b(nationality|citizenship|country|address|addr|street|road|district|ward|city|state|province|municipality)\b/i;
const NON_NAME_LINE_REGEX =
  /\b(date|birth|dob|address|street|road|district|city|state|province|municipality|national|nationality|citizen|passport|license|licence|identity|card|id|number|issue|issued|expiry|expires|valid|sex|male|female|signature|authority|government|department|document|country)\b/i;

function normalizeOcrText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[|]/g, "/")
    .trim();
}

function getCompactTextLength(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim().length;
}

function getTextLines(text) {
  return normalizeOcrText(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildDate(year, month, day) {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedDay)
  ) {
    return null;
  }

  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  const isValid =
    date.getFullYear() === parsedYear &&
    date.getMonth() === parsedMonth - 1 &&
    date.getDate() === parsedDay;

  return isValid ? date : null;
}

function toIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isPlausibleDob(date, now = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  if (date > now) return false;
  return calculateAge(date, now) <= 120;
}

function parseDateCandidates(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return [];

  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(value)) {
    const [year, month, day] = value.split(/[/-]/);
    const date = buildDate(year, month, day);
    return date ? [date] : [];
  }

  if (!/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(value)) return [];

  const separator = value.includes("-") ? "-" : "/";
  const [first, second, year] = value.split(separator);
  const candidates = [];

  if (separator === "-") {
    const date = buildDate(year, second, first);
    return date ? [date] : [];
  }

  const firstValue = Number(first);
  const secondValue = Number(second);

  const dayFirst = buildDate(year, second, first);
  const monthFirst = buildDate(year, first, second);

  if (dayFirst && !candidates.some((item) => toIso(item) === toIso(dayFirst))) {
    candidates.push(dayFirst);
  }

  if (
    monthFirst &&
    !candidates.some((item) => toIso(item) === toIso(monthFirst)) &&
    (firstValue <= 12 || secondValue > 12)
  ) {
    candidates.push(monthFirst);
  }

  return candidates;
}

function rankCandidates(candidates) {
  return [...candidates].sort((left, right) => left.date - right.date);
}

function selectCandidateForMatch(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return null;
  if (candidates.length === 1) return candidates[0];

  // When OCR gives an ambiguous slash-formatted date like 04/05/2008,
  // bias toward the younger interpretation so we do not false-positive an age pass.
  return [...candidates].sort((left, right) => right - left)[0];
}

export function calculateAge(date, now = new Date()) {
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  const hasBirthdayPassed =
    monthDelta > 0 || (monthDelta === 0 && now.getDate() >= date.getDate());

  if (!hasBirthdayPassed) age -= 1;
  return age;
}

export function isAtLeast18(date, now = new Date()) {
  return calculateAge(date, now) >= 18;
}

export function formatDob(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function hasLikelyNameField(text) {
  if (NAME_LABEL_REGEX.test(text)) return true;

  return getTextLines(text).some((line) => {
    if (!line || /\d/.test(line)) return false;

    const normalizedLine = line
      .replace(/[^A-Za-z\s'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedLine || NON_NAME_LINE_REGEX.test(normalizedLine)) return false;

    const words = normalizedLine.split(" ");
    if (words.length < 2 || words.length > 4) return false;

    return words.every((word) => /^[A-Za-z][A-Za-z'-]{1,}$/.test(word));
  });
}

function hasLongNumberField(text) {
  const matches = String(text || "").match(/\b[\d-]{5,}\b/g) || [];

  if (
    matches.some((value) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 5) return false;
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) return false;
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) return false;
      return true;
    })
  ) {
    return true;
  }

  const spacedMatches = String(text || "").match(/(?:\d\s+){5,}\d/g) || [];
  return spacedMatches.some((value) => value.replace(/\D/g, "").length >= 6);
}

function hasDateField(text, dob) {
  if (dob) return true;
  return new RegExp(DATE_CAPTURE_PATTERN).test(String(text || ""));
}

export function extractDOB(text, now = new Date()) {
  const rawText = normalizeOcrText(text);

  if (!rawText) return null;

  const labeledCandidates = [];
  const allCandidates = [];
  const seen = new Set();

  const labeledRegex = new RegExp(
    `${LABEL_PATTERN}\\s*[:\\-]?\\s*${DATE_CAPTURE_PATTERN}`,
    "gi",
  );

  for (const match of rawText.matchAll(labeledRegex)) {
    const value = match[1];
    const date = selectCandidateForMatch(parseDateCandidates(value));
    if (!isPlausibleDob(date, now)) continue;
    const key = toIso(date);
    if (seen.has(`labeled:${key}`)) continue;
    seen.add(`labeled:${key}`);
    labeledCandidates.push({ date, raw: value, labeled: true });
  }

  const genericRegex = new RegExp(DATE_CAPTURE_PATTERN, "g");
  for (const match of rawText.matchAll(genericRegex)) {
    const value = match[1];
    const date = selectCandidateForMatch(parseDateCandidates(value));
    if (!isPlausibleDob(date, now)) continue;
    const key = toIso(date);
    if (seen.has(`all:${key}`)) continue;
    seen.add(`all:${key}`);
    allCandidates.push({ date, raw: value, labeled: false });
  }

  const ranked = rankCandidates(
    labeledCandidates.length ? labeledCandidates : allCandidates,
  );
  const best = ranked[0];

  if (!best) return null;

  return {
    date: best.date,
    iso: toIso(best.date),
    formatted: formatDob(best.date),
    age: calculateAge(best.date, now),
    raw: best.raw,
  };
}

export function validateScannedIdText(text, now = new Date()) {
  const normalizedText = normalizeOcrText(text);
  const textLength = getCompactTextLength(normalizedText);
  const dob = extractDOB(normalizedText, now);

  const fields = {
    name: hasLikelyNameField(normalizedText),
    date: hasDateField(normalizedText, dob),
    idNumber: hasLongNumberField(normalizedText),
    nationalityOrAddress: NATIONALITY_OR_ADDRESS_REGEX.test(normalizedText),
  };

  const fieldCount = Object.values(fields).filter(Boolean).length;

  if (!normalizedText) {
    return {
      isValid: false,
      code: "no_text",
      message: "No text was detected. Please scan the full ID card again.",
      dob,
      fields,
      fieldCount,
      textLength,
    };
  }

  if (textLength < 30) {
    return {
      isValid: false,
      code: "text_too_short",
      message: "This scan does not contain enough text. Please scan the full ID card.",
      dob,
      fields,
      fieldCount,
      textLength,
    };
  }

  if (!ID_KEYWORD_REGEX.test(normalizedText)) {
    return {
      isValid: false,
      code: "missing_id_keywords",
      message: "This does not look like a valid ID, please scan your ID card",
      dob,
      fields,
      fieldCount,
      textLength,
    };
  }

  if (fieldCount < 3) {
    return {
      isValid: false,
      code: "insufficient_fields",
      message:
        "We could not find enough ID details. Make sure the name, date, ID number, and nationality or address are visible.",
      dob,
      fields,
      fieldCount,
      textLength,
    };
  }

  if (!dob) {
    return {
      isValid: false,
      code: "dob_not_found",
      message:
        "We found ID text, but could not find a readable date of birth. Please scan your ID card again.",
      fields,
      fieldCount,
      textLength,
      dob: null,
    };
  }

  return {
    isValid: true,
    code: "ok",
    message: "",
    dob,
    fields,
    fieldCount,
    textLength,
  };
}
