# cocos-mcp-server (personal fork)

**[📖 中文](README.md)**

> This repository is an **independently maintained fork kept to personal preferences**. It is modified, hardened, and iterated on to suit my own workflow, is **not guaranteed to track upstream**, does not accept feature requests, and comes with no warranty. For personal use only.

Upstream: cocos-mcp-server (by LiDaxian, Cocos store <https://store.cocos.com/app/detail/7941>). This repo is a personally-maintained fork of it.

## About this fork

The upstream project's marketing, demos, and changelog have been removed; only what I need is kept. See the commit history for the full set of changes.

An MCP server plugin for Cocos Creator 3.8+: load it as an editor extension, set a port and access token in its panel and start it, and it exposes a local HTTP MCP endpoint (default `http://127.0.0.1:3000/mcp`) that MCP clients use to drive the editor (scenes / nodes / components / prefabs / assets / build, etc.).

## Main changes vs upstream (security / protocol)

- **Anti DNS-rebinding**: require the `Host` header to resolve to loopback.
- **Origin allow-list + optional Bearer auth**: added an `authToken` setting and panel field; `allowedOrigins` is now actually enforced (no more unconditional `*`).
- **MCP protocol fixes**: notifications (`notifications/*`) no longer get a response, added `ping`, and `initialize` echoes the client's protocol version.
- **Fixed port-change restart race**: `stop()` waits for the server to fully close before restarting (avoids `EADDRINUSE`).
- **Conservative JSON "repair"**: removed the global quote/newline rewriting that could corrupt valid content.
- **Fixed `enableDebugLog` not persisting** when saving settings.

## License

The upstream project ships without a license. This fork is for personal use only; do not redistribute or use it commercially on that basis.
