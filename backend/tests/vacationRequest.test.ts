import { Request, Response } from "express";
import * as ctrl from "../src/controllers/vacationRequestController";
import { AppDataSource } from "../src/database/dataSource";
import { VacationRequest, RequestStatus } from "../src/entities/VacationRequest";

jest.mock("../src/database/dataSource", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe("VacationRequestController", () => {
  describe("create", () => {
    it("saves a new request and returns 201", async () => {
      const body = {
        user_id: "abc-123",
        start_date: "2026-06-01",
        end_date: "2026-06-05",
        reason: "Holiday",
      };
      const saved = { id: "req-1", ...body, status: RequestStatus.Pending };
      mockRepo.create.mockReturnValue(saved);
      mockRepo.save.mockResolvedValue(saved);

      const req = { body } as Request;
      const res = mockRes();

      await ctrl.create(req, res, next);

      expect(mockRepo.create).toHaveBeenCalledWith({
        user_id: "abc-123",
        start_date: "2026-06-01",
        end_date: "2026-06-05",
        reason: "Holiday",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(saved);
    });

    it("calls next on repository error", async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockRejectedValue(new Error("DB error"));

      await ctrl.create({ body: {} } as Request, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("findByUser", () => {
    it("returns requests for a given userId", async () => {
      const requests = [{ id: "r1", user_id: "u1" }];
      mockRepo.find.mockResolvedValue(requests);

      const req = { query: { userId: "u1" } } as unknown as Request;
      const res = mockRes();

      await ctrl.findByUser(req, res, next);

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: "u1" } })
      );
      expect(res.json).toHaveBeenCalledWith(requests);
    });
  });

  describe("updateStatus", () => {
    it("approves a pending request", async () => {
      const existing = { id: "r1", status: RequestStatus.Pending, comments: null };
      const updated = { ...existing, status: RequestStatus.Approved };
      mockRepo.findOne.mockResolvedValue(existing);
      mockRepo.save.mockResolvedValue(updated);

      const req = {
        params: { id: "r1" },
        body: { status: "Approved", comments: null },
      } as unknown as Request;
      const res = mockRes();

      await ctrl.updateStatus(req, res, next);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("returns 404 when request not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const req = { params: { id: "ghost" }, body: { status: "Approved" } } as unknown as Request;
      const res = mockRes();

      await ctrl.updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 409 when request is already resolved", async () => {
      mockRepo.findOne.mockResolvedValue({ id: "r1", status: RequestStatus.Approved });

      const req = { params: { id: "r1" }, body: { status: "Rejected", comments: "Late" } } as unknown as Request;
      const res = mockRes();

      await ctrl.updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
