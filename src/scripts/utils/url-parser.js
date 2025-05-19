export function parseUrl(hash) {
  const [pathPart, queryPart] = hash.replace(/^#/, "").split("?");
  const params = {};
  if (queryPart) {
    queryPart.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      params[key] = decodeURIComponent(value);
    });
  }
  return { path: pathPart, params };
}