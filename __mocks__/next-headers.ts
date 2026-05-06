export function cookies() {
  return Promise.resolve({
    getAll: () => [],
    set: () => {},
  });
}
