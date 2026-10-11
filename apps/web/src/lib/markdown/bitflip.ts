import { z } from 'zod';

/** Data contract for the bitflip-curve figure: accuracy vs. number of flipped bits. */
export const bitflipDataSchema = z.object({
  title: z.string().max(200).optional(),
  xLabel: z.string().max(80).optional(),
  yLabel: z.string().max(80).optional(),
  series: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        points: z
          .array(z.tuple([z.number().finite().min(0), z.number().finite()]))
          .min(1)
          .max(2000),
      }),
    )
    .min(1)
    .max(8),
});

export type BitflipData = z.infer<typeof bitflipDataSchema>;
