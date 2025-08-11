import {
  createAuthTestServer,
  AuthTestServer,
} from "@tests/helpers/expressAuthTestHelper";
import exportRoutes from "@/routes/admin/importExport";
import * as userRepo from "@/repositories/user.repository";
import * as exportJobs from "@/jobs/export.jobs";
import XLSX from "xlsx";

jest.mock("@/repositories/user.repository");
jest.mock("@/jobs/export.jobs");

let server: AuthTestServer;

beforeAll(() => {
  server = createAuthTestServer(exportRoutes, true, "/api/admin/user", "admin");
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Admin Export Routes", () => {
  describe("GET /api/admin/user/export/users/:type", () => {
    it("should export users in csv", async () => {
      (userRepo.getAllUsersForExport as jest.Mock).mockResolvedValueOnce([]);
      const res = await server.request.get("/api/admin/user/export/users/csv");
      expect(res.status).toBe(200);
    });

    it("should export users in xlsx", async () => {
      (userRepo.getAllUsersForExport as jest.Mock).mockResolvedValueOnce([]);
      const res = await server.request.get("/api/admin/user/export/users/xlsx");
      expect(res.status).toBe(200);
    });

    it("should return 400 for unsupported type", async () => {
      const res = await server.request.get("/api/admin/user/export/users/pdf");
      expect(res.status).toBe(400);
    });

    it("should handle server errors", async () => {
      (userRepo.getAllUsersForExport as jest.Mock).mockRejectedValueOnce(
        new Error("fail")
      );
      const res = await server.request.get("/api/admin/user/export/users/csv");
      expect(res.status).toBe(500);
    });
  });
});
