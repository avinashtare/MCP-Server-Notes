const { spawn } = require('child_process');

const mcp = spawn('node', ['../../dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2025-03-26", // add anyting
        capabilities: {
            // roots: {
            //     listChanged: true
            // },
            // sampling: {}
        },
        clientInfo: {
            name: "ChatGptClint", // anything
            version: "1.0.0" // anyting
        }
    }
}

/*
// run his for initMessage
mcp.stdin.write(JSON.stringify(initMessage) + '\n');

return serve version name title etc
output 
{"result":{"protocolVersion":"2025-03-26","capabilities":{"prompts":{"listChanged":true},"completions":{},"resources":{"listChanged":true},"tools":{"listChanged":true}},"serverInfo":{"version":"1.0.0","name":"MCP-Server-by-Avinash","title":"Avinash's AI MCP Server"}},"jsonrpc":"2.0","id":1}
*/

const pingServer = {
    jsonrpc: "2.0",
    id: 1,
    method: "ping",
    params: {
        protocolVersion: "2025-03-26", // add anyting
        capabilities: {
        },
        clientInfo: {
            name: "ChatGptClint", // anything
            version: "1.0.0" // anyting
        }
    }
}
/*
// run his for initMessage
mcp.stdin.write(JSON.stringify(pingServer) + '\n');

// if server is running return empty {} object
OUTPUT:
{"result":{},"jsonrpc":"2.0","id":1}
*/

// list all tools
const ListTools = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {
        protocolVersion: "2025-03-26", // add anyting
        capabilities: {
        },
        clientInfo: {
            name: "ChatGptClint", // anything
            version: "1.0.0" // anyting
        }
    }
}
/*
// run his for ListTools
mcp.stdin.write(JSON.stringify(ListTools) + '\n');

// return all about tools info like what accept what data nedded how many tools there 
OUTPUT:
{"result":{"tools":[{"name":"show-users","description":"this will show all the users","inputSchema":{"type":"object","properties":{},"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"},"annotations":{"title":"Get Userrs","readOnlyHint":true,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true}},{"name":"create-user","description":"This function will create a new user in the database.","inputSchema":{"type":"object","properties":{"name":{"type":"string"},"email":{"type":"string"},"age":{"type":"number"}},"required":["name","email","age"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"},"annotations":{"title":"Create User","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true}}]},"jsonrpc":"2.0","id":1}
*/


const CallTool = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        protocolVersion: "2025-03-26", // add anyting
        name: "create-user", // tool name
        arguments:
        {
            name: "avinash", email: "avinash5@@gmail.com", age: 19 // args
        },
        capabilities: {
        },
        clientInfo: {
            name: "ChatGptClint", // anything
            version: "1.0.0" // anyting
        }
    }
}
/*
// run his for CallTool
mcp.stdin.write(JSON.stringify(CallTool) + '\n');

// it tools to create user
OUTPUT:
{"result":{"content":[{"type":"text","text":"User 15 created successfully."}]},"jsonrpc":"2.0","id":1}
*/


// ------------------------------------ For MORE Visit https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle  ------------------------------------ 

// calling mcp
// mcp.stdin.write(JSON.stringify(CallTool) + '\n');

mcp.stdout.on('data', (data) => {
    console.log(`OUTPUT:\n${data.toString()}`);
});

mcp.stderr.on('data', (data) => {
    console.error(`ERROR:\n${data.toString()}`);
});

mcp.on('close', (code) => {
    console.log(`MCP server exited with code ${code}`);
});
