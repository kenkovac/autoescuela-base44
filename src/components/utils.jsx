export function createPageUrl(pageName) {
  if (!pageName) {
    return "/";
  }
  const [base, params] = pageName.split('?');
  const path = `/${base}`;
  return params ? `${path}?${params}` : path;
}