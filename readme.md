# MCP Server Notes

Visit offfical website for [Quck Start]("https://modelcontextprotocol.io/introduction")

- Mcp stands for Model Context Protocol
- Output and input format of MCP is `JSON`.

## 1. Installation

```js
npm i @modelcontextprotocol/sdk
npm i zod // validation
```

#### Running server diffrent mode

- Running Simple mode

  ```js
  node server.js
  ```

- Running inspect mode

  it will create a inspect website for you.

  ```js
  "server:inspect": "npm run server:build && set DANGEROUSLY_OMIT_AUTH=true && npx @modelcontextprotocol/inspector dist/server.js"

  npm run server:inspect
  ```

## 2.Initialize a basic server

```js
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// initialize server
const server = new McpServer({
  version: "1.0.0", // anyting not matter
  name: "MCP-Server-by-Avinash",
  title: "Avinash's AI MCP Server",
});
```

## 3. Starting a server

- Note: never add any console.log to server it may be give difficult to mcp client to responde or connect

```js
// create server and connect to standard input output like command line mode
async function main() {
  const transport = new StdioServerTransport();
  server.connect(transport); // connect to command line mode
  //   console.log("MCP Server is running...");
}

main();
```

- now,we just created a basic mcp server it dose nothing to do somthing with it we have `4 methods.`

  1. `Tools`
  2. `Resource`
  3. `Prompt`

## 5. Creating a Tool

#### Creating Tool for create User

```js
server.tool(
  "create-user",
  "This function will create a new user in the database.",
  {
    name: z.string(),
    email: z.string(),
    age: z.number(),
  },
  {
    title: "Create User",
    // hint to AI
    readOnlyHint: false,
    destructiveHint: false, // is it delete somthing or critical task so ai ask user to do want to do it
    idempotentHint: false, // idempotentHint indicates that an operation or API call can be safely executed multiple times with the same input, and the outcome will be the same as if it were executed only once. This means the operation is designed to prevent unintended side effects from repeated calls, such as duplicate data or state changes.
    openWorldHint: true, // its like you are taking info from internet like geting wether data or updating db to cloud
  },
  // parameters coems form mcp clint or ai
  async (params: { name: string, email: string, age: number }) => {
    try {
      // add user is function you have to make it
      const id = await addUser(params);

      // if user added succesfully
      return {
        content: [
          {
            type: "text",
            text: `User ${id} created successfully.`,
          },
        ],
      };
    } catch (error) {
      // if there is any error
      return {
        content: [
          {
            type: "text",
            text: "Failed to create user.",
          },
        ],
      };
    }
  }
);
```

- To check it manually visit [Manual](./src/test/manualTest.js)

## 6. Creating a [Resource](https://modelcontextprotocol.io/docs/concepts/resources)

- Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions. Resources are designed to be application-controlled, meaning that the client application can decide how and when they should be used.
- In simple word read only

## [Resource](https://modelcontextprotocol.io/docs/concepts/resources#resource-uris) URIs

- Resources are identified using URIs that follow this format:

```url
[protocol]://[host]/[path]
```

- example:

* `users://show/all`
* `file:///home/user/documents/report.pdf`
* `postgres://database/customers/schema`
* `screen://localhost/display1`

#### Direct resources

```js
{
  uri: string;           // Unique identifier for the resource
  name: string;          // Human-readable name
  description?: string;  // Optional description
  mimeType?: string;     // Optional MIME type
  size?: number;         // Optional size in bytes
}
```

#### Reading resources (return data)

```js
{
  contents: [
    {
      uri: string;        // The URI of the resource
      mimeType?: string;  // Optional MIME type

      // One of:
      text?: string;      // For text resources
      blob?: string;      // For binary resources (base64 encoded)
    }
  ]
}
```

- add resource to server

```js
server.resource(
  "users", // resource name called by ai
  "users://all", // uri
  {
    title: "Get Users",
    MimeType: "application/json",
    description: "This shows all users from the database.",
  },
  // uri comes from ai
  async (uri) => {
    // validate uri here
    // readuser is fuction you have to make
    const users = await readUsers();
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  }
);
```

#### Resource Template

- Resource: Get user details by ID.
- Returns a single user's information as JSON, or a not found message.

```js
server.resource(
  "user-details",
  new ResourceTemplate("users://{userID}/info", { list: undefined }),
  {
    title: "Get User",
    MimeType: "application/json",
    description: "Get user information by ID.",
  },
  async (uri, { userID }) => {
    // Accepts userID as string or string[]
    const id = Array.isArray(userID)
      ? parseInt(userID[0])
      : parseInt(userID as string);

    // find user
    const foundUser = await findUserById(id);
    if (!foundUser) {
      return {
        contents: [
          {
            uri: uri.href,
            type: "text",
            text: `User with ID ${userID} not found.`,
          },
        ],
      };
    }
    return {
      contents: [
        {
          uri: uri.href,
          type: "text",
          text: JSON.stringify(foundUser, null, 2),
        },
      ],
    };
  }
);
```

## 7. [Prompts in MCP](https://modelcontextprotocol.io/docs/concepts/prompts)

Create reusable prompt templates and workflows

Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.

```js
/**
 * Prompt: Generates a fake user prompt for a given name.
 * Useful for testing user creation flows or generating test data.
 */
server.prompt(
  "generate-fake-prompt-user",
  "Generates a fake user prompt for you.",
  { fakeName: z.string() },
  ({ fakeName }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Generate a fake user with name ${fakeName}. The user should have realistic email, name, age, and address.`,
        },
      },
    ],
  })
);
```
