export const Footer = () => {
  return (
    <footer className="bg-[var(--negro)] text-[var(--gris-claro)] relative overflow-hidden">
      <div className="relative z-10 mx-auto px-6 py-16">
        <div className="border-t border-[var(--gris-oscuro)] pt-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="relative">
                <div className="text-4xl md:text-9xl lg:text-[12rem] font-black text-[var(--gris-oscuro)] select-none pointer-events-none">
                  Hannah Lab
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end space-y-6">
              <div className="flex items-center space-x-6">
                <a
                  href="https://linkedin.com"
                  className="text-[var(--gris)] hover:text-[var(--verde)] transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  className="text-[var(--gris)] hover:text-[var(--verde)] transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.351-1.053-2.351-2.351s1.054-2.351 2.351-2.351 2.351 1.053 2.351 2.351-1.054 2.351-2.351 2.351zm7.718 0c-1.297 0-2.351-1.053-2.351-2.351s1.054-2.351 2.351-2.351 2.351 1.053 2.351 2.351-1.054 2.351-2.351 2.351z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  className="text-[var(--gris)] hover:text-[var(--verde)] transition-colors duration-200"
                  aria-label="Twitter/X"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>

              <div className="text-right text-sm space-y-2">
                <p className="text-[var(--gris)]">
                  UN SITIO DE{" "}
                  <a
                    href="#"
                    className="text-[var(--verde)] hover:text-[var(--verde-limon)] transition-colors duration-200"
                  >
                    HANNAH & TEAM
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--gris-oscuro)] text-center">
            <p className="text-[var(--gris)] text-sm">
              ©2025 HANNAH LAB S.A.C. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
