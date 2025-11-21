import { AnimatedTitle, FadeUpCard } from "@/components/animations";
import { Section } from "@/components/section";

export const Dominamos = () => {
  return (
    <Section videoSrc="/videos/fondo-4.mp4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center xl:justify-start">
          <AnimatedTitle
            className="text-6xl md:text-7xl font-[var(--font-righteous)] text-[var(--verde)] leading-tight"
            delay={0.2}
          >
            <h2 className="flex flex-col uppercase font-bold text-4xl md:text-7xl">
              Dominamos
              <span className="text-[var(--blanco)]">Tecnologías</span>
            </h2>
          </AnimatedTitle>
        </div>
        <FadeUpCard className="p-8 text-center xl:text-left" delay={0.4}>
          <p className="text-xl md:text-2xl text-[var(--blanco)] font-[var(--font-now)] leading-relaxed italic">
            {
              '"Nuestro equipo se actualiza constantemente con las últimas tecnologías y tendencias. Así ofrecemos soluciones innovadoras y vanguardistas, creando soluciones robustas y escalables para cualquier necesidad."'
            }
          </p>
        </FadeUpCard>
      </div>
    </Section>
  );
};
