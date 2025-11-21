import { Section } from "@/components/section";
import { AnimatedTitle, FadeUpCard, StaggeredList } from "@/components/animations";

export const Hannah = () => {
  return (
    <>
      <div id="nosotros"></div>
      <Section className="bg-[(--negro)] text-[(--blanco)]">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedTitle className="text-5xl md:text-7xl mt-20 font-bold text-[var(--verde)] uppercase mb-6">
            Hannah <span className="text-[var(--blanco)]">Lab</span>
          </AnimatedTitle>
          <AnimatedTitle delay={0.3} className="text-xl md:text-2xl font-[var(--font-now)] text-[var(--gris-claro)] max-w-3xl mx-auto">
            Innovación tecnológica que transforma ideas en realidades digitales
          </AnimatedTitle>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Company Description */}
          <FadeUpCard delay={0.2} className="space-y-8">
            <div>
              <AnimatedTitle delay={0.4} className="text-3xl font-bold text-[var(--verde-limon)] text-center xl:text-left mb-4">
                Quiénes Somos
              </AnimatedTitle>
              <FadeUpCard delay={0.6} className="text-lg text-center xl:text-left font-[var(--font-now)] text-[var(--blanco)] leading-relaxed mb-6">
                Hannah Lab es una empresa especializada en <span className="text-[var(--verde)]">desarrollo de software</span>
                <span className="text-[var(--verde)]"> y automatizaciones inteligentes</span> de alta calidad.
              </FadeUpCard>
              <FadeUpCard delay={0.8} className="text-lg text-center xl:text-left font-[var(--font-now)] text-[var(--gris-claro)] leading-relaxed">
                Nos dedicamos a crear soluciones tecnológicas innovadoras que optimizan procesos,
                mejoran la eficiencia y potencian el crecimiento de nuestros clientes a través de
                herramientas modernas y metodologías actuales.
              </FadeUpCard>
            </div>
          </FadeUpCard>

          {/* Right Column - Key Stats */}
          <StaggeredList className="grid grid-cols-2 gap-6" staggerDelay={0.1}>
            <div className="bg-[var(--gris-oscuro)] p-6 rounded-lg border border-[var(--verde)] hover:border-[var(--verde-limon)] transition-colors">
              <div className="text-3xl font-[var(--font-righteous)] text-[var(--verde)] mb-2">+AI</div>
              <div className="text-sm font-[var(--font-now)] text-[var(--gris-claro)]">Soluciones inteligentes</div>
            </div>
            <div className="bg-[var(--gris-oscuro)] p-6 rounded-lg border border-[var(--verde)] hover:border-[var(--verde-limon)] transition-colors">
              <div className="text-3xl font-[var(--font-righteous)] text-[var(--verde)] mb-2">24/7</div>
              <div className="text-sm font-[var(--font-now)] text-[var(--gris-claro)]">Soporte Técnico</div>
            </div>
            <div className="bg-[var(--gris-oscuro)] p-6 rounded-lg border border-[var(--verde)] hover:border-[var(--verde-limon)] transition-colors">
              <div className="text-3xl font-[var(--font-righteous)] text-[var(--verde)] mb-2">↑</div>
              <div className="text-sm font-[var(--font-now)] text-[var(--gris-claro)]">Innovación que impulsa negocios</div>
            </div>
            <div className="bg-[var(--gris-oscuro)] p-6 rounded-lg border border-[var(--verde)] hover:border-[var(--verde-limon)] transition-colors">
              <div className="text-3xl font-[var(--font-righteous)] text-[var(--verde)] mb-2">∞</div>
              <div className="text-sm font-[var(--font-now)] text-[var(--gris-claro)]">Posibilidades</div>
            </div>
          </StaggeredList>
        </div>

        {/* Mission Statement */}
        <FadeUpCard delay={0.8} className="mt-16 text-center bg-gradient-to-r from-[var(--gris-oscuro)] to-[var(--negro)] p-8 rounded-xl border border-[var(--verde)]">
          <AnimatedTitle delay={1.0} className="text-2xl md:text-3xl font-[var(--font-righteous)] text-[var(--verde-limon)] mb-4">
            {'"Herramientas que usan herramientas para transformar tu negocio"'}
          </AnimatedTitle>
          <FadeUpCard delay={1.2} className="text-lg font-[var(--font-now)] text-[var(--gris-claro)] max-w-4xl mx-auto">
            En Hannah Lab creemos en el poder de la tecnología para simplificar lo complejo.
            Desarrollamos soluciones que no solo resuelven problemas actuales, sino que anticipan
            las necesidades futuras de nuestros clientes.
          </FadeUpCard>
        </FadeUpCard>
      </Section>
    </>
  );
};
