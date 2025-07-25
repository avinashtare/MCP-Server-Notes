import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const mcpServer = new Client({
  name: "a-new-client",
  version: "1.0.0",
  title: "optional title",
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/server.js"],
  stderr: "ignore", // ignore any errors form server
});

const main = async () => {
  console.log("connecting to MCP...");
  await mcpServer.connect(transport);
  console.log("MCP Serve is running...");

  // Promise.all([
  //     mcpServer.listTools()
  // ])

  // loads
  const Tools = await mcpServer.listTools();
  const Resources = await mcpServer.listResources();
  const Prompts = await mcpServer.listPrompts();
  const ResourceTemplates = await mcpServer.listResourceTemplates();

  //   console.log(await mcpServer.callTool({ name: "show-users", arguments: {} }));
  // console.log(await mcpServer.readResource({ uri: "users://1/info" }));
  // console.log(
  //   await mcpServer.getPrompt({
  //     name: "generate-fake-prompt-user",
  //     arguments: { fakeName: "avinash" },
  //   })
  // );
};

main();
