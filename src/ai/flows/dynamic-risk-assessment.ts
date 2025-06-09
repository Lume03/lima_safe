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
    .describe('The current weight for distance (alpha) in the path calculation. Value between 0 and 1.'),
  safetyWeight: z
    .number()
    .describe('The current weight for safety (beta) in the path calculation. Value between 0 and 1.'),
  allDistrictNames: z
    .array(z.string())
    .describe('A list of all available district names in Lima for context when analyzing news.'),
});
export type AdjustRiskWeightsInput = z.infer<typeof AdjustRiskWeightsInputSchema>;

const AdjustRiskWeightsOutputSchema = z.object({
  adjustedDistanceWeight: z
    .number()
    .describe('The AI-suggested adjusted weight for distance (alpha). Must be between 0 and 1.'),
  adjustedSafetyWeight: z
    .number()
    .describe('The AI-suggested adjusted weight for safety (beta). Must be between 0 and 1. The sum of adjustedDistanceWeight and adjustedSafetyWeight MUST be 1.0.'),
  reason: z
    .string()
    .describe('The reason for adjusting the distance and safety weights, based on news analysis.'),
});
export type AdjustRiskWeightsOutput = z.infer<typeof AdjustRiskWeightsOutputSchema>;

export async function adjustRiskWeights(input: AdjustRiskWeightsInput): Promise<AdjustRiskWeightsOutput> {
  return adjustRiskWeightsFlow(input);
}

const analyzeNewsTool = ai.defineTool({
  name: 'analyzeNews',
  description: 'Analyzes recent news and public safety incidents related to a given list of Lima districts. Use this tool to understand current safety conditions.',
  inputSchema: z.object({
    districts: z.array(z.string()).describe('List of Lima district names to analyze news for. Can be a subset of all districts if only specific ones are relevant.'),
  }),
  outputSchema: z.string().describe('A summary of recent news and public safety incidents affecting the safety of the provided districts. Mentions which districts have increased or decreased risk if notable events are found.'),
}, async (input) => {
  // This is a placeholder. In a real application, this would fetch and analyze news data.
  // For now, it simulates finding some news.
  if (input.districts.length === 0) {
    return "No districts provided for news analysis.";
  }
  const highRiskDistricts = ["Lima Centro", "La Victoria"]; // Example
  const relevantDistrictsWithNews = input.districts.filter(d => highRiskDistricts.includes(d));

  if (relevantDistrictsWithNews.length > 0) {
    return `Simulated news analysis: Increased public safety incidents recently reported in ${relevantDistrictsWithNews.join(', ')}. Consider increasing safety weight. Other analyzed districts report normal activity.`;
  }
  return `Simulated news analysis: No major public safety incidents reported recently in the analyzed districts: ${input.districts.join(', ')}. Current safety weights seem appropriate or may only need minor adjustments.`;
});

const adjustRiskWeightsPrompt = ai.definePrompt({
  name: 'adjustRiskWeightsPrompt',
  input: {schema: AdjustRiskWeightsInputSchema},
  output: {schema: AdjustRiskWeightsOutputSchema},
  tools: [analyzeNewsTool],
  prompt: `You are an AI assistant that helps adjust the weights for distance (alpha) and safety (beta) in a path calculation algorithm for routes in Lima, Peru.
The sum of alpha and beta MUST always be 1.0.

Current weights:
Distance Weight (alpha): {{{distanceWeight}}}
Safety Weight (beta): {{{safetyWeight}}}

You have access to a tool called 'analyzeNews' which you can use to analyze recent news and public safety incidents for Lima districts.
A list of all available district names for context is: {{#each allDistrictNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
You can pass a list of specific district names (e.g., just the origin and destination if they are known, or a broader set) to the 'analyzeNews' tool.

Based on your analysis of recent news (using the 'analyzeNews' tool):
- If news suggests increased risk in relevant areas, you should generally INCREASE the safetyWeight (beta) and DECREASE the distanceWeight (alpha).
- If news suggests improved safety or no significant negative incidents, you might slightly decrease safetyWeight or keep weights stable.
- The magnitude of adjustment should be sensible. Drastic changes require significant justification from the news.

Your primary goal is to recommend new alpha and beta weights.
Critically, ensure that the 'adjustedDistanceWeight' (new alpha) and 'adjustedSafetyWeight' (new beta) in your output sum to exactly 1.0. For example, if you decide safety is more important, you might return 0.3 for distance and 0.7 for safety.

Provide a clear 'reason' for your recommendation, referencing the (simulated) news findings.
If you decide not to change the weights, return the original weights and state that no change is needed based on the current news.
`,
});

const adjustRiskWeightsFlow = ai.defineFlow(
  {
    name: 'adjustRiskWeightsFlow',
    inputSchema: AdjustRiskWeightsInputSchema,
    outputSchema: AdjustRiskWeightsOutputSchema,
  },
  async (input) => {
    // The LLM will decide if and how to use the analyzeNewsTool based on the prompt.
    // We pass allDistrictNames in the input to the prompt, so the LLM is aware of them.
    const {output} = await adjustRiskWeightsPrompt(input);
    
    // Basic validation or normalization of AI output, though the prompt strongly guides it.
    if (output) {
        let { adjustedDistanceWeight, adjustedSafetyWeight } = output;
        const sum = adjustedDistanceWeight + adjustedSafetyWeight;
        if (Math.abs(sum - 1.0) > 0.001 && sum !== 0) { // Tolerance for floating point, avoid division by zero
            adjustedDistanceWeight = adjustedDistanceWeight / sum;
            adjustedSafetyWeight = 1.0 - adjustedDistanceWeight; // Ensure sum is exactly 1
            output.reason += " (Output weights normalized to sum to 1.0 by system)."
        } else if (sum === 0) { // Handle case where AI returns 0 for both
            adjustedDistanceWeight = 0.5;
            adjustedSafetyWeight = 0.5;
            output.reason = "AI returned invalid zero weights, defaulted to 0.5/0.5. Original reason: " + output.reason;
        }
         // Clamp values just in case
        output.adjustedDistanceWeight = Math.max(0, Math.min(1, adjustedDistanceWeight));
        output.adjustedSafetyWeight = Math.max(0, Math.min(1, adjustedSafetyWeight));
        // Final ensure sum is 1 by re-deriving one from the other
        output.adjustedSafetyWeight = 1.0 - output.adjustedDistanceWeight;


    }
    return output!;
  }
);
