export function similaridadeDeCosseno(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) {
    return 0;
  }

  let produtoEscalar = 0;
  let normaA = 0;
  let normaB = 0;

  for (let i = 0; i < a.length; i++) {
    produtoEscalar += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }

  const denominador = Math.sqrt(normaA) * Math.sqrt(normaB);
  return denominador === 0 ? 0 : produtoEscalar / denominador;
}
