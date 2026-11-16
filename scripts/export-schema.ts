import { writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { courseSchema } from '../src/lib/content.ts'
await writeFile(new URL('../docs/course.schema.json', import.meta.url), JSON.stringify(z.toJSONSchema(courseSchema), null, 2) + '\n')
console.log('docs/course.schema.json を生成しました')
