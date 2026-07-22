import type { ReactNode } from "react";

interface AlertaProps {
  tipo: "erro" | "sucesso";
  children: ReactNode;
}

export function Alerta({ tipo, children }: AlertaProps) {
  return <div className={`alerta alerta--${tipo}`}>{children}</div>;
}
