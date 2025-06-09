
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
    .describe('El peso actual para la distancia (alfa) en el cálculo de la ruta. Valor entre 0 y 1.'),
  safetyWeight: z
    .number()
    .describe('El peso actual para la seguridad (beta) en el cálculo de la ruta. Valor entre 0 y 1.'),
  allDistrictNames: z
    .array(z.string())
    .describe('Una lista de todos los nombres de distritos disponibles en Lima para contexto al analizar noticias.'),
});
export type AdjustRiskWeightsInput = z.infer<typeof AdjustRiskWeightsInputSchema>;

const AdjustRiskWeightsOutputSchema = z.object({
  adjustedDistanceWeight: z
    .number()
    .describe('El peso ajustado sugerido por la IA para la distancia (alfa). Debe estar entre 0 y 1.'),
  adjustedSafetyWeight: z
    .number()
    .describe('El peso ajustado sugerido por la IA para la seguridad (beta). Debe estar entre 0 y 1. La suma de adjustedDistanceWeight y adjustedSafetyWeight DEBE ser 1.0.'),
  reason: z
    .string()
    .describe('La razón para ajustar los pesos de distancia y seguridad, basada en el análisis de noticias.'),
});
export type AdjustRiskWeightsOutput = z.infer<typeof AdjustRiskWeightsOutputSchema>;

export async function adjustRiskWeights(input: AdjustRiskWeightsInput): Promise<AdjustRiskWeightsOutput> {
  return adjustRiskWeightsFlow(input);
}

const analyzeNewsTool = ai.defineTool({
  name: 'analyzeNews',
  description: 'Analiza noticias recientes e incidentes de seguridad pública relacionados con una lista dada de distritos de Lima. Usa esta herramienta para entender las condiciones actuales de seguridad.',
  inputSchema: z.object({
    districts: z.array(z.string()).describe('Lista de nombres de distritos de Lima para analizar noticias. Puede ser un subconjunto de todos los distritos si solo algunos específicos son relevantes.'),
  }),
  outputSchema: z.string().describe('Un resumen de noticias recientes e incidentes de seguridad pública que afectan la seguridad de los distritos proporcionados. Menciona qué distritos tienen riesgo aumentado o disminuido si se encuentran eventos notables.'),
}, async (input) => {
  // This is a placeholder. In a real application, this would fetch and analyze news data.
  // For now, it simulates finding some news.
  if (input.districts.length === 0) {
    return "No se proporcionaron distritos para el análisis de noticias.";
  }
  const highRiskDistricts = ["Lima Centro", "La Victoria", "Callao", "San Juan de Lurigancho"]; // Example
  const relevantDistrictsWithNews = input.districts.filter(d => highRiskDistricts.includes(d));

  if (relevantDistrictsWithNews.length > 0) {
    return `Análisis de noticias simulado: Se han reportado recientemente incidentes de seguridad pública incrementados en ${relevantDistrictsWithNews.join(', ')}. Considera aumentar el peso de seguridad. Otros distritos analizados reportan actividad normal.`;
  }
  return `Análisis de noticias simulado: No se han reportado incidentes mayores de seguridad pública recientemente en los distritos analizados: ${input.districts.join(', ')}. Los pesos de seguridad actuales parecen apropiados o podrían necesitar solo ajustes menores.`;
});

const adjustRiskWeightsPrompt = ai.definePrompt({
  name: 'adjustRiskWeightsPrompt',
  input: {schema: AdjustRiskWeightsInputSchema},
  output: {schema: AdjustRiskWeightsOutputSchema},
  tools: [analyzeNewsTool],
  prompt: `Eres un asistente de IA que ayuda a ajustar los pesos para la distancia (alfa) y la seguridad (beta) en un algoritmo de cálculo de rutas para Lima, Perú.
La suma de alfa y beta SIEMPRE DEBE ser 1.0.

Pesos actuales:
Peso de Distancia (alfa): {{{distanceWeight}}}
Peso de Seguridad (beta): {{{safetyWeight}}}

Tienes acceso a una herramienta llamada 'analyzeNews' que puedes usar para analizar noticias recientes e incidentes de seguridad pública para los distritos de Lima.
Una lista de todos los nombres de distritos disponibles para contexto es: {{#each allDistrictNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
Puedes pasar una lista de nombres de distritos específicos (p. ej., solo el origen y destino si se conocen, o un conjunto más amplio) a la herramienta 'analyzeNews'.

Basado en tu análisis de noticias recientes (usando la herramienta 'analyzeNews'):
- Si las noticias sugieren un riesgo incrementado en áreas relevantes, generalmente deberías AUMENTAR el safetyWeight (beta) y DISMINUIR el distanceWeight (alfa).
- Si las noticias sugieren una mejora en la seguridad o ningún incidente negativo significativo, podrías disminuir ligeramente el safetyWeight o mantener los pesos estables.
- La magnitud del ajuste debe ser sensata. Cambios drásticos requieren una justificación significativa de las noticias.

Tu objetivo principal es recomendar nuevos pesos alfa y beta.
Críticamente, asegúrate de que 'adjustedDistanceWeight' (nuevo alfa) y 'adjustedSafetyWeight' (nuevo beta) en tu salida sumen exactamente 1.0. Por ejemplo, si decides que la seguridad es más importante, podrías devolver 0.3 para distancia y 0.7 para seguridad.

Proporciona una 'razón' clara para tu recomendación, haciendo referencia a los hallazgos de noticias (simuladas).
Si decides no cambiar los pesos, devuelve los pesos originales e indica que no se necesita ningún cambio basado en las noticias actuales.
`,
});

const adjustRiskWeightsFlow = ai.defineFlow(
  {
    name: 'adjustRiskWeightsFlow',
    inputSchema: AdjustRiskWeightsInputSchema,
    outputSchema: AdjustRiskWeightsOutputSchema,
  },
  async (input) => {
    const {output} = await adjustRiskWeightsPrompt(input);
    
    if (output) {
        let { adjustedDistanceWeight, adjustedSafetyWeight } = output;
        const sum = adjustedDistanceWeight + adjustedSafetyWeight;
        if (Math.abs(sum - 1.0) > 0.001 && sum !== 0) { 
            adjustedDistanceWeight = adjustedDistanceWeight / sum;
            adjustedSafetyWeight = 1.0 - adjustedDistanceWeight; 
            output.reason += " (Pesos de salida normalizados por el sistema para sumar 1.0).";
        } else if (sum === 0) { 
            adjustedDistanceWeight = 0.5;
            adjustedSafetyWeight = 0.5;
            output.reason = "La IA devolvió pesos cero inválidos, se usó 0.5/0.5 por defecto. Razón original: " + output.reason;
        }
        output.adjustedDistanceWeight = Math.max(0, Math.min(1, adjustedDistanceWeight));
        output.adjustedSafetyWeight = 1.0 - output.adjustedDistanceWeight;


    }
    return output!;
  }
);
