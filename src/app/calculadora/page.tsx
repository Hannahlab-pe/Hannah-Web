import { Metadata } from "next";
import { CalculadoraROI } from "@/components/sections/calculadora/calculadora-roi";

export const metadata: Metadata = {
  title: "Calculadora ROI",
  description:
    "Descubre el costo real del trabajo manual en tu empresa y visualiza cuánto ahorrarías con automatización como partner de Hannah Lab.",
};

export default function CalculadoraPage() {
  return <CalculadoraROI />;
}
