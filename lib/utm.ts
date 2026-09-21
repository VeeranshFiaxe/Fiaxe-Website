// Campaign parameters from the current URL, attached to form submissions.
export function utmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  return Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""]));
}
