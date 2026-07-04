/**
 * @thirsty/api-wrapper — server-side footprint from an API response.
 *
 * When you own the API call you get EXACT token counts back, so this is the
 * most accurate way to attribute footprint per request/user/tenant.
 *
 * Works with Anthropic (`usage.input_tokens`) and OpenAI (`usage.prompt_tokens`)
 * response shapes out of the box.
 */
import { estimate, fromUsage, detectModel, type FootprintEstimate, type ApiUsage } from '@waterusedbyourai/core';

export interface LlmResponseLike {
  model?: string;
  usage?: ApiUsage | null;
}

/** Compute a footprint estimate directly from a provider response object. */
export function footprintForResponse(response: LlmResponseLike, gridId?: string): FootprintEstimate {
  const { inputTokens, outputTokens } = fromUsage(response.usage ?? {});
  // Carry BOTH provider and model — otherwise a non-default provider's model id
  // is looked up under the default provider and silently mis-resolves.
  const hit = response.model ? detectModel(response.model) : null;
  return estimate({
    inputTokens,
    outputTokens,
    providerId: hit?.providerId,
    modelId: hit?.modelId,
    gridId,
    exact: true,
  });
}

/**
 * Tiny accumulator for attributing footprint across many requests
 * (e.g. per API key or per tenant) inside a long-running server.
 */
export class FootprintMeter {
  private totals = { waterMl: 0, energyWh: 0, co2g: 0, requests: 0 };

  record(response: LlmResponseLike, gridId?: string): FootprintEstimate {
    const e = footprintForResponse(response, gridId);
    this.totals.waterMl += e.waterMl;
    this.totals.energyWh += e.energyWh;
    this.totals.co2g += e.co2g;
    this.totals.requests += 1;
    return e;
  }

  snapshot() {
    return { ...this.totals };
  }
}
