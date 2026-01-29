// ironboy 2025 -> autogenerate routes.tsx file from decentralized routes
// written in the form recommended by React Rapide
import fs from 'fs';
import path from 'path';

export default function (srcDir = path.join(import.meta.dirname, 'src')) {
  const filePaths = fs.readdirSync(srcDir, { recursive: true })
    .filter(x => x.endsWith('.tsx') || x.endsWith('.jsx'));
  const content = filePaths
    .map(filePath => ({ filePath, content: fs.readFileSync(path.join(srcDir, filePath), 'utf-8') }));
  const namesAndRoutes = content
    .filter(({ content }) => content.match(/\w{1,}\.route\s*=\s*\{/))
    .map(x => {
      let name = (x.content.match(/\w{1,}\.route\s*=\s*\{/) + '').split('.')[0].trim();
      return { name, route: x.filePath.replaceAll('\\', '/').replaceAll('//', '/') };
    });
  const generated = `import type {JSX} from 'react';\n` +
    `import{createElement} from 'react';\n// page components
${namesAndRoutes.map(({ name, route }) => `import ${name} from './${route}';`).join('\n')}

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
${namesAndRoutes.map(({ name }) => `  ${name}`).join(',\n')}
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
`.trim();
  fs.writeFileSync(path.join(srcDir, 'routes.ts'), generated, 'utf-8');
}