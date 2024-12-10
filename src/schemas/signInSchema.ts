import { z } from 'zod'

export const signInSchema = z.object({
    //idenitfier can be either email or username
  identifier: z.string(),
  password: z.string(),
});
