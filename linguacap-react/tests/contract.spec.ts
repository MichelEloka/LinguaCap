import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// L'interface ne doit appeler que des opérations déclarées dans contracts/openapi.json.
// La passerelle vérifie l'autre sens dans ContractRoutesTest.

const appRoot = fileURLToPath(new URL('..', import.meta.url));
const contract = JSON.parse(readFileSync(join(appRoot, '..', 'contracts', 'openapi.json'), 'utf8')) as {
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: { Error: { required: string[] } } };
};

const methods = ['get', 'post', 'put'] as const;
const operations = Object.entries(contract.paths).flatMap(([template, item]) => methods
  .filter((method) => method in item)
  .map((method) => ({
    method: method.toUpperCase(),
    template,
    pattern: new RegExp('^' + template.replace(/\{[A-Za-z]+\}/g, '[^/?]+') + '(\\?.*)?$'),
  })));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function apiCalls() {
  const calls: { file: string; method: string; path: string }[] = [];
  const call = /requestApi(?:<[^()]*?>)?\(\s*(['`])((?:(?!\1).)*)\1/g;
  for (const file of sourceFiles(join(appRoot, 'src'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(call)) {
      const rest = source.slice(match.index + match[0].length);
      const next = rest.indexOf('requestApi');
      const options = rest.slice(0, next === -1 ? 400 : Math.min(next, 400));
      const method = /method:\s*'(POST|PUT)'/.exec(options)?.[1] ?? 'GET';
      const path = match[2].replace(/\$\{[^}]*\}/g, 'exemple');
      calls.push({ file: relative(appRoot, file), method, path });
    }
  }
  return calls;
}

test('l’interface n’appelle que des routes déclarées dans le contrat', () => {
  const calls = apiCalls();
  expect(calls.length, 'aucun appel requestApi détecté : le test ne lit plus le code').toBeGreaterThan(10);
  const undeclared = calls.filter(({ method, path }) =>
    !operations.some((operation) => operation.method === method && operation.pattern.test(path)));
  expect(undeclared, 'appels absents de contracts/openapi.json').toEqual([]);
});

test('le format d’erreur du contrat correspond à celui que lit l’interface', () => {
  expect(contract.components.schemas.Error.required).toEqual(['code', 'message']);
  const client = readFileSync(join(appRoot, 'src', 'integration', 'api.ts'), 'utf8');
  expect(client).toContain("'message' in details");
});
