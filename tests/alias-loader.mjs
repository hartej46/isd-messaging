import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

const loaderCode = `
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const srcRoot = ${JSON.stringify(new URL('../src/', import.meta.url).pathname)};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = path.join(srcRoot, specifier.slice(2));
    const withExt = target.endsWith('.js') ? target : target + '.js';
    return nextResolve(pathToFileURL(withExt).href, context);
  }
  return nextResolve(specifier, context);
}
`;

register(`data:text/javascript;base64,${Buffer.from(loaderCode).toString('base64')}`, pathToFileURL('./'));
