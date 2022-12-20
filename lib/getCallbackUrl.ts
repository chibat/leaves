const CALL_BACK_PATH = "/callback";
export function getCallbackUrl(requestUrl: string) {
  console.log(`${requestUrl} requestUrl`);
  const url = new URL(requestUrl);
  return (url.hostname === "localhost" ? "http" : "https") + "://" + url.host + CALL_BACK_PATH;
}
