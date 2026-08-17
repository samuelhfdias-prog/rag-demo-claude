import { describe, expect, it } from "vitest";
import { chunkText } from "./chunker";

describe("chunkText", () => {
  it("remove espaços duplicados e retorna lista vazia para texto sem conteúdo", () => {
    expect(chunkText("   \n\t   ")).toEqual([]);
  });

  it("divide o texto respeitando tamanho e sobreposição", () => {
    expect(chunkText("abcdefghij", { tamanho: 4, sobreposicao: 1 })).toEqual([
      "abcd",
      "defg",
      "ghij",
    ]);
  });

  it("normaliza parâmetros inválidos sem travar o processamento", () => {
    expect(chunkText("abc", { tamanho: 0, sobreposicao: 99 })).toEqual(["a", "b", "c"]);
  });
});
