import { createTestServer, TestServer } from "../helpers/expressTestHelper";
import healthRoutes from "../../src/routes/health";
import { packageInfo } from "../../src/config/package.config";

let server: TestServer;

beforeAll(() => {
  server = createTestServer(healthRoutes);
});

describe("Health Routes", () => {
  it("should return uptime, package name, and version", async () => {
    const res = await server.request.get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toBe("Server is running");
    expect(res.body.data.name).toBe(packageInfo.name);
    expect(res.body.data.version).toBe(packageInfo.version);
    expect(typeof res.body.data.uptime).toBe("number");
    expect(typeof res.body.data.timestamp).toBe("number");
  });
});
