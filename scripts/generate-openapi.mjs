import { createSwaggerSpec } from 'next-swagger-doc';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const spec = createSwaggerSpec({
  apiFolder: 'src/app/api',
  definition: { openapi: '3.0.0', info: { title: 'Cruise API', version: '0.1.0' } },
});

const outDir = path.join(process.cwd(), 'public');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'openapi.json'), JSON.stringify(spec, null, 2));
console.log('OpenAPI written to /public/openapi.json');

