const startRegex = /[\s#]/;
const endRegex = /[\r\n]/;
const MAX = 256;

export function getTitle(text: string) {
  let start: number | null = null;
  let end: number | null = null;
  for (let index = 0; index < text.length && index < MAX; index++) {
    const c = text[index];
    if (start == null && !startRegex.test(c)) {
      start = index;
    } else if (start != null && endRegex.test(c)) {
      end = index;
      break;
    }
  }
  if (start === null) {
    start = 0;
  }
  if (end === null) {
    end = text.length < MAX ? text.length : MAX;
  }
  return text.substring(start, end);
}
