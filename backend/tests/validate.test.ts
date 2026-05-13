import { Request, Response, NextFunction } from "express";
import { validate, createRequestSchema, updateStatusSchema } from "../src/middleware/validate";

const mockReq = (body: object) => ({ body } as Request);
const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next: NextFunction = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe("validate middleware — createRequestSchema", () => {
  const mw = validate(createRequestSchema);

  it("passes a valid request body", () => {
    const req = mockReq({
      user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      start_date: "2026-06-01",
      end_date: "2026-06-05",
    });
    mw(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("rejects missing start_date", () => {
    const res = mockRes();
    mw(mockReq({ user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", end_date: "2026-06-05" }), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects end_date before start_date", () => {
    const res = mockRes();
    mw(
      mockReq({
        user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        start_date: "2026-06-10",
        end_date: "2026-06-01",
      }),
      res,
      next
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects an invalid UUID", () => {
    const res = mockRes();
    mw(mockReq({ user_id: "not-a-uuid", start_date: "2026-06-01", end_date: "2026-06-05" }), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validate middleware — updateStatusSchema", () => {
  const mw = validate(updateStatusSchema);

  it("passes Approved with no comment", () => {
    mw(mockReq({ status: "Approved" }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("passes Rejected with a comment", () => {
    mw(mockReq({ status: "Rejected", comments: "Overlap with team vacation" }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("rejects Rejected without a comment", () => {
    const res = mockRes();
    mw(mockReq({ status: "Rejected" }), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects Rejected with an empty comment", () => {
    const res = mockRes();
    mw(mockReq({ status: "Rejected", comments: "   " }), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects an invalid status value", () => {
    const res = mockRes();
    mw(mockReq({ status: "Maybe" }), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
