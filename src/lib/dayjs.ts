import originalDayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

originalDayjs.extend(customParseFormat);

/**
 * The standard date formats we might encounter.
 */
export const APP_DATE_FORMATS = [
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "DD/MM/YY",
  "DD-MM-YY",
  "DDMMYYYY",
];

/**
 * A wrapper around dayjs that defaults to common app formats for strings.
 */
const dayjs = ((date, format, locale, strict) => {
  if (typeof date === "string" && !format) {
    // Sanitize if there are any instances of other formats
    const sanitized = date.replace(/[.-]/g, "/");
    return originalDayjs(sanitized, APP_DATE_FORMATS, locale, strict);
  }
  return originalDayjs(date, format, locale, strict);
}) as typeof originalDayjs;

// Copy all static properties and methods from original dayjs to our wrapper
Object.assign(dayjs, originalDayjs);

export default dayjs;
