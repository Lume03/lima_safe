'use server';

/**
 * @fileOverview Adjusts risk weights based on recent news and public safety incidents.
 *
 * - adjustRiskWeights - Adjusts risk weights in the path calculation based on recent news.
 * - AdjustRiskWeightsInput - The input type for the adjustRiskWeights function.
 * - AdjustRiskWeightsOutput - The return type for the adjustRiskWeights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustRiskWeightsInputSchema = z.object({
  distanceWeight: z
    .number()
    .describe('The current weight for distance in the path calculation.'),
  safetyWeight: z
    .number()
    .describe('The current weight for safety in the path calculation.'),
});
export type AdjustRiskWeightsInput = z.infer<typeof AdjustRiskWeightsInputSchema>;

const AdjustRiskWeightsOutputSchema = z.object({
  adjustedDistanceWeight: z
    .number()
    .describe('The adjusted weight for distance in the path calculation.'),
  adjustedSafetyWeight: z
    .number()
    .describe('The adjusted weight for safety in the path calculation.'),
  reason: z
    .string()
    .describe('The reason for adjusting the distance and safety weights.'),
});
export type AdjustRiskWeightsOutput = z.infer<typeof AdjustRiskWeightsOutputSchema>;

export async function adjustRiskWeights(input: AdjustRiskWeightsInput): Promise<AdjustRiskWeightsOutput> {
  return adjustRiskWeightsFlow(input);
}

const analyzeNewsTool = ai.defineTool({
  name: 'analyzeNews',
  description: 'Analyzes recent news and public safety incidents related to Lima districts.',
  inputSchema: z.object({
    districts: z.array(z.string()).describe('List of Lima districts to analyze news for.'),
  }),
  outputSchema: z.string().describe('Summary of recent news and incidents affecting district safety.'),
}, async (input) => {
  // TODO: Implement the logic to fetch and analyze news data.
  // This is a placeholder; replace with actual implementation.
  console.log('Analyzing news for districts:', input.districts);
  return `Simulated news analysis: Increased incidents reported in ${input.districts.join(', ')}.`;
});

const adjustRiskWeightsPrompt = ai.definePrompt({
  name: 'adjustRiskWeightsPrompt',
  input: {schema: AdjustRiskWeightsInputSchema},
  output: {schema: AdjustRiskWeightsOutputSchema},
  tools: [analyzeNewsTool],
  prompt: `You are an AI assistant that helps adjust the weights for distance and safety in a path calculation algorithm. 

You will be provided the current weights for distance and safety.

Distance Weight: {{{distanceWeight}}}
Safety Weight: {{{safetyWeight}}}

You have access to a tool called analyzeNews which allows you to analyze recent news and public safety incidents related to Lima districts.

Based on the news analysis, determine whether the distance and safety weights should be adjusted. If there are increased incidents reported, increase the safety weight and decrease the distance weight. If there are no significant incidents, keep the weights as they are or make minor adjustments.

Return the adjusted weights and the reason for the adjustment.
`,
});

const adjustRiskWeightsFlow = ai.defineFlow(
  {
    name: 'adjustRiskWeightsFlow',
    inputSchema: AdjustRiskWeightsInputSchema,
    outputSchema: AdjustRiskWeightsOutputSchema,
  },
  async input => {
    // Mock list of districts, replace with actual list from the application state.
    const districts = ["Miraflores", "San Isidro", "Barranco"];

    const newsAnalysis = await analyzeNewsTool({
      districts: districts
    });

    const {output} = await adjustRiskWeightsPrompt({
      ...input,
      newsAnalysis: newsAnalysis,
    });
    return output!;
  }
);
