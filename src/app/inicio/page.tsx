import { Metadata } from "next";
import { HeroNew } from "@/components/sections/inicio/hero-new";
import { ServicesGrid } from "@/components/sections/inicio/services-grid";
import { AboutCTA } from "@/components/sections/inicio/about-cta";
import { TechStack } from "@/components/sections/inicio/tech-stack";
import { Partnership } from "@/components/sections/inicio/partnership";
import Contacto from "@/components/sections/contacto/contacto";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Automatización inteligente, desarrollo de software y soluciones tecnológicas. Herramientas que usan herramientas para transformar tu negocio.",
};

export default function HomePage() {
  return (
    <>
      <HeroNew />
      <ServicesGrid />
      <AboutCTA />
      <TechStack />
      <Partnership />
      <Contacto />
    </>
  );
}
