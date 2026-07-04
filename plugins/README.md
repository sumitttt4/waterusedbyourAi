# Plugins

The plugins directory acts as a workspace glob. You can drop a new repository or folder here and it automatically becomes part of the build without extra configuration.

There are two kinds of plugins:

## 1. Provider and Grid Coefficient Packs

These register new AI providers or grid profiles so that any surface can run estimates for them. See plugins/provider-xai for a worked example. It registers on import:

```ts
import { registerProvider } from '@waterusedbyourai/core';
registerProvider({ id: 'xai', label: 'xAI Grok', defaultModel: 'grok', models: { /* ... */ } });
```

Importing the plugin once from a surface's entry point self-registers the coefficients.

## 2. New Surfaces

A surface is any package that consumes `@waterusedbyourai/core` and renders/reports the footprint. This can be a browser extension, a CLI hook, an API middleware, or a monitoring exporter. You can model new surfaces after the existing surfaces/browser-extension or surfaces/cli templates.

## Contract

Plugins interact only with the public exports of `@waterusedbyourai/core`:
- registerProvider
- registerGrid
- setDefaults
- estimate
- total
- approxTokens
- fromUsage
- detectModel
- format* utilities
