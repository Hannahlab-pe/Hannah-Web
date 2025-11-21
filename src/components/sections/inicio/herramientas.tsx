import { AnimatedTitle, FadeUpCard } from "@/components/animations";
import { Section } from "@/components/section";

export const Herramientas = () => {
  return (
    <Section videoSrc="/videos/fondo-2.mp4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center xl:justify-start">
          <AnimatedTitle
            className="text-6xl md:text-7xl font-[var(--font-righteous)] text-[var(--verde)] leading-tight"
            delay={0.2}
          >
            <h2 className="flex flex-col uppercase font-bold text-4xl md:text-7xl text-center xl:text-left">
              Herramientas
              <span className="text-[var(--blanco)]">Que usan heraramientas</span>
            </h2>
          </AnimatedTitle>
        </div>
        <FadeUpCard className="p-8 text-center xl:text-left" delay={0.4}>
          <p className="text-xl md:text-2xl text-[var(--blanco)] font-[var(--font-now)] leading-relaxed italic">
            {
              '"Creamos automatizaciones inteligentes que ahorran tiempo, reducen errores y aumentan la eficiencia, sin necesidad de cambiar tu ecosistema actual."'
            }
          </p>
        </FadeUpCard>
      </div>
    </Section>
  );
};
