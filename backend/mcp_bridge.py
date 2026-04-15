"""MCP client pool — spawns stdio subprocesses and forwards JSON-RPC calls.

One shared ClientSession per library, guarded by an asyncio.Lock so that
concurrent HTTP requests do not interleave on the same session.
"""
from __future__ import annotations

import asyncio
import logging
from contextlib import AsyncExitStack
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from mcp_servers import MCP_SERVERS

logger = logging.getLogger("mcp_bridge")


class MCPBridge:
    def __init__(self) -> None:
        self._sessions: dict[str, ClientSession] = {}
        self._locks: dict[str, asyncio.Lock] = {}
        self._stack = AsyncExitStack()
        self._init_lock = asyncio.Lock()

    async def _ensure_session(self, lib: str) -> ClientSession:
        if lib in self._sessions:
            return self._sessions[lib]

        if lib not in MCP_SERVERS:
            raise KeyError(f"No MCP server registered for library: {lib}")

        async with self._init_lock:
            if lib in self._sessions:
                return self._sessions[lib]

            cfg = MCP_SERVERS[lib]
            params = StdioServerParameters(
                command=cfg["command"],
                args=cfg.get("args", []),
                env=cfg.get("env"),
            )
            logger.info("Spawning MCP server for %s: %s %s", lib, cfg["command"], cfg.get("args", []))

            read, write = await self._stack.enter_async_context(stdio_client(params))
            session = await self._stack.enter_async_context(ClientSession(read, write))
            await session.initialize()

            self._sessions[lib] = session
            self._locks[lib] = asyncio.Lock()
            logger.info("MCP server ready: %s", lib)
            return session

    async def list_tools(self, lib: str) -> list[dict[str, Any]]:
        session = await self._ensure_session(lib)
        async with self._locks[lib]:
            result = await session.list_tools()
        return [
            {
                "name": t.name,
                "description": t.description or "",
                "input_schema": t.inputSchema,
            }
            for t in result.tools
        ]

    async def call_tool(
        self, lib: str, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        session = await self._ensure_session(lib)
        async with self._locks[lib]:
            result = await session.call_tool(tool_name, arguments)

        content = []
        for item in result.content:
            if hasattr(item, "text"):
                content.append({"type": "text", "text": item.text})
            elif hasattr(item, "data"):
                content.append({"type": "resource", "data": str(item.data)})
            else:
                content.append({"type": "unknown", "raw": str(item)})

        return {
            "content": content,
            "is_error": bool(getattr(result, "isError", False)),
        }

    async def close(self) -> None:
        logger.info("Closing all MCP sessions")
        await self._stack.aclose()
        self._sessions.clear()
        self._locks.clear()


bridge = MCPBridge()
