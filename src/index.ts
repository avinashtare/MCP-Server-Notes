// =====================================
// MCP Server Entry Point (Production)
// =====================================
// This file contains all server setup, tool/resource registration, and user data logic.
// User file operations are implemented as reusable functions below.
// Each section is clearly commented for maintainability and onboarding.

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import z from "zod";

import fs from "fs/promises";
import path from "path";

// =============================
// User Data Types & File Helpers
// =============================

/**
 * User interface for type safety and clarity.
 */
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Path to the users data file
const USERS_FILE = path.join(__dirname, "../fake_db/users.json");

/**
 * Reads all users from the users.json file.
 */
async function readUsers(): Promise<User[]> {
  const data = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(data) as User[];
}

/**
 * Writes the given users array to the users.json file.
 */
async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/**
 * Finds a user by ID. Returns undefined if not found.
 */
async function findUserById(id: number): Promise<User | undefined> {
  const users = await readUsers();
  return users.find((u) => u.id === id);
}

/**
 * Adds a new user and returns the new user's ID.
 */
async function addUser(newUser: Omit<User, "id">): Promise<number> {
  const users = await readUsers();
  const id = users.length + 1;
  users.push({ ...newUser, id });
  await writeUsers(users);
  return id;
}

// =============================
// MCP Server Setup & Registration
// =============================
const server = new McpServer({
  version: "1.0.0",
  name: "MCP-Server-by-Avinash",
  title: "Avinash's AI MCP Server",
});
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

/**
 * Resource: Get user details by ID.
 * Returns a single user's information as JSON, or a not found message.
 */
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

/**
 * Resource: Get all users.
 * Returns the full list of users as JSON.
 */
server.resource(
  "users",
  "users://all",
  {
    title: "Get Users",
    MimeType: "application/json",
    description: "This shows all users from the database.",
  },
  async (uri) => {
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

/**
 * Tool: Create a new user.
 * Adds a user to the database and returns the new user's ID.
 */
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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params: { name: string; email: string; age: number }) => {
    try {
      const id = await addUser(params);
      return {
        content: [
          {
            type: "text",
            text: `User ${id} created successfully.`,
          },
        ],
      };
    } catch (error) {
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

// =============================
// Main entry point: starts the MCP server
// =============================
/**
 * All server setup is done above; this just starts the transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  server.connect(transport);
  //   console.log("MCP Server is running...");
}

main();
