import { describe, expect, it } from "vitest";
import { similaridadeDeCosseno } from "./similaridade";

describe("similaridadeDeCosseno", () => {
  it("retorna 1 para vetores iguais", () => {
    expect(similaridadeDeCosseno([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("retorna 0 quando algum vetor não possui magnitude", () => {
    expect(similaridadeDeCosseno([0, 0], [1, 2])).toBe(0);
  });

  it("retorna 0 para vetores incompatíveis", () => {
    expect(similaridadeDeCosseno([1, 2], [1])).toBe(0);
  });
});
