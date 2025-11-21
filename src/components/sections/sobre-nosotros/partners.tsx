
import { AnimatedTitle, FadeUpCard } from "@/components/animations";
import Image from "next/image";

export const Partners = () => {
  return (
    <div className="py-10 md:py-20 px-6 bg-[var(--negro)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedTitle className="text-4xl md:text-6xl font-bold text-[var(--verde)] uppercase mb-6">
            Partnerships
          </AnimatedTitle>
          <AnimatedTitle delay={0.2} className="text-xl md:text-2xl font-[var(--font-now)] text-[var(--gris-claro)] max-w-3xl mx-auto">
            Colaboraciones estratégicas que potencian nuestras soluciones
          </AnimatedTitle>
        </div>

        {/* Hannah x Odoo Partnership */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Partnership Description */}
          <FadeUpCard delay={0.3} className="space-y-8">
            <div>
              <AnimatedTitle delay={0.4} className="text-3xl font-bold text-[var(--verde-limon)] mb-4 text-center xl:text-left">
                Especialización en Soluciones ERP
              </AnimatedTitle>
              <FadeUpCard delay={0.6} className="text-lg text-center xl:text-left font-[var(--font-now)] text-[var(--blanco)] leading-relaxed mb-6">
                Como <span className="text-[var(--verde)]">Partner Oficial de Odoo</span>,
                Hannah Lab se especializa en implementar y personalizar soluciones ERP
                que transforman la gestión empresarial de nuestros clientes.
              </FadeUpCard>
              <FadeUpCard delay={0.8} className="text-lg text-center xl:text-left font-[var(--font-now)] text-[var(--gris-claro)] leading-relaxed">
                Combinamos nuestra experiencia en desarrollo de software con la potencia
                de Odoo para crear sistemas integrados que optimizan procesos, mejoran
                la productividad e impulsan el crecimiento empresarial.
              </FadeUpCard>
            </div>
          </FadeUpCard>

          {/* Right Column - Partnership Logos */}
          <FadeUpCard delay={0.5} className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              {/* Hannah Logo */}
              <FadeUpCard delay={0.7} className="flex items-center">
                <Image
                  width={240}
                  height={240}
                  src="/images/logos/hannah.png"
                  alt="Hannah Lab"
                  className="h-auto w-auto object-contain"
                />
              </FadeUpCard>

              {/* X Symbol */}
              <FadeUpCard delay={0.9} className="text-4xl md:text-6xl font-bold text-[var(--verde)]">
                ×
              </FadeUpCard>

              {/* Odoo Logo */}
              <FadeUpCard delay={1.1} className="flex items-center">
                  <Image
                    width={240}
                    height={240}
                    src="/images/logos/odoo.png"
                    alt="Odoo"
                    className="h-auto w-auto object-contain"
                  />
              </FadeUpCard>
            </div>
          </FadeUpCard>
        </div>
      </div>
    </div>
  );
};
