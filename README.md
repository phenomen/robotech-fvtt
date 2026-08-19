# Robotech RPG for Foundry VTT

![](https://img.shields.io/badge/Foundry-v14-green)

[Robotech RPG](https://strangemachinegames.com/robotechrpg/) by Strange Machine Games for [Foundry VTT](https://foundryvtt.com/).

## Installation

Look for `Robotech RPG` in the Foundry system browser or copy-paste a manifest URL directly:

```
https://github.com/phenomen/robotech-fvtt/releases/download/release/system.json
```

## Development

Install dependencies:

```bash
bun install
```

Build the system into `dist/`:

```bash
bun run build
```

### Foundry API Types

Type checking resolves the Foundry API from the real client. Copy `client/` and `common/` out of your Foundry install directory into a `foundry` folder at the root:

```
foundry/
  client/
  common/
```
