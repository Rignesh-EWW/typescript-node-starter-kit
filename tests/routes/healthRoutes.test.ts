import { createTestServer, TestServer } from "../helpers/expressTestHelper";
import healthRoutes from "../../src/routes/health";

let server: TestServer;

beforeAll(() => {
  server = createTestServer(healthRoutes);
});

describe("Health Routes", () => {
  it("should return package name and version", async () => {
    const res = await server.request.get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: true,
      message: "Server is running",
      data: {
        name: "typescript-node-starter-kit",
        version: "1.0.0",
        uptime: expect.any(Number),
        timestamp: expect.any(Number),
      },
    });
  });
});
