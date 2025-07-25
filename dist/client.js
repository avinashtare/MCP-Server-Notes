"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const mcpServer = new index_js_1.Client({
    name: "a-new-client",
    version: "1.0.0",
    title: "optional title",
});
const transport = new stdio_js_1.StdioClientTransport({
    command: "node",
    args: ["../dist/server.js"],
    stderr: "ignore", // ignore any errors form server
});
const main = async () => {
    await mcpServer.connect(transport);
    // Promise.all([
    //     mcpServer.listTools()
    // ])
    //   console.log(await mcpServer.listTools());
};
main();
