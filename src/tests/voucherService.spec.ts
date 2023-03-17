import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService, { VoucherCreateData } from "services/voucherService";

describe("voucherService test suite", () => {
  it("should create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {});

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {});

    await voucherService.createVoucher("aaa", 10);

    expect(voucherRepository.createVoucher).toBeCalled();
  });

  it("should not create duplicated voucher", () => {
    const voucher = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          code: voucher.code,
          discount: voucher.discount,
        };
      });

    const promise = voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );

    expect(promise).rejects.toEqual({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });

  it("should apply discount (voucher)", async () => {
    const voucher: VoucherCreateData = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const amount = 1000;
    const order = await voucherService.applyVoucher(voucher.code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(voucher.discount);
    expect(order.finalAmount).toBe(amount - amount * (voucher.discount / 100));
    expect(order.applied).toBe(true);
  });

  it("should not apply discount for values below 100", async () => {
    const voucher: VoucherCreateData = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });

    const amount = 99;
    const order = await voucherService.applyVoucher(voucher.code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(voucher.discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it("should not apply discount for used voucher", async () => {
    const voucher: VoucherCreateData = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: true,
        };
      });

    const amount = 1000;
    const order = await voucherService.applyVoucher(voucher.code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(voucher.discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it("should not apply discount for invalid voucher", () => {
    const voucher: VoucherCreateData = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return undefined;
      });

    const amount = 1000;
    const promise = voucherService.applyVoucher(voucher.code, amount);
    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  });
});
