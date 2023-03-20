import voucherRepository from 'repositories/voucherRepository';
import voucherService from 'services/voucherService';

describe("quando criar um voucher", () => {
  const voucher = {
    code: 'abc123',
    discount: 50
  };

  const createdVoucher = {
    id: 1,
    code: 'abc123',
    discount: 50,
    used: false
  };

  it("deve criar com sucesso", async () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce((): any => {
        return undefined;
      });

    jest
      .spyOn(voucherRepository, 'createVoucher')
      .mockImplementationOnce((): any => { });

    await voucherService.createVoucher(voucher.code, voucher.discount);

    expect(voucherRepository.createVoucher).toBeCalled();
  });

  it("o código do voucher deve ser único", () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce((): any => {
        return createdVoucher;
      });

    const promise = voucherService.createVoucher(voucher.code, voucher.discount);
    expect(promise).rejects.toEqual({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });
});

describe("quando utilizar um voucher", () => {
  const voucher = {
    id: 1,
    code: 'abc123',
    discount: 50,
  };

  it("o voucher deve existir", () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce(() => {
        return undefined;
      });

    const amount = 200;

    const promise = voucherService.applyVoucher(voucher.code, amount);

    expect(promise).rejects.toEqual({
      type: "conflict",
      message: "Voucher does not exist.",
    });
  });

  it("ele não pode ter sido utilizado anteriormente", async () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce((): any => {
        return {
          ...voucher,
          used: true
        };
      });

    const amount = 200;

    const result = await voucherService.applyVoucher(voucher.code, amount);

    expect(result).toBeDefined();
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.applied).toBe(false);
    expect(result.finalAmount).toBe(amount);
  });

  it("não deve ser aplicado em compras com valores abaixo de 100", async () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce((): any => {
        return {
          ...voucher,
          used: false
        };
      });

    const amount = 99;

    const result = await voucherService.applyVoucher(voucher.code, amount);

    expect(result).toBeDefined();
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.applied).toBe(false);
    expect(result.finalAmount).toBe(amount);
  });

  it("ao utilizar, responder com dados da compra e confirmação do uso", async () => {
    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockImplementationOnce((): any => {
        return {
          ...voucher,
          used: false
        };
      });

    jest
      .spyOn(voucherRepository, 'useVoucher')
      .mockImplementationOnce((): any => { });

    const amount = 200;

    const result = await voucherService.applyVoucher(voucher.code, amount);

    expect(result).toBeDefined();
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.applied).toBe(true);
    expect(result.finalAmount).toBe(amount - (amount * (voucher.discount / 100)));
    expect(voucherRepository.useVoucher).toBeCalled();
  });
});
