"use client";
import { useState, useEffect } from "react";

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Función para determinar si un link está activo
  const [activeSection, setActiveSection] = useState("inicio");

  // Función para scroll suave a secciones
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // Toggle mobile menu with closing animation
  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      // Si está abierto, iniciar animación de cierre
      setIsClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsClosing(false);
      }, 300); // Duración de la animación de salida
    } else {
      // Si está cerrado, abrirlo directamente
      setIsMobileMenuOpen(true);
      setIsClosing(false);
    }
  };

  // Función para cerrar el menú con animación desde botones/links
  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsClosing(false);
      }, 300);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full py-4 px-6 transition-all duration-500 z-50 ${
        isScrolled ? "navbar-blur" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          {/* <h1 className="text-2xl font-bold text-[var(--blanco)]">
                        <span className="text-[var(--verde)]">Hannah</span> Lab
                    </h1> */}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("inicio")}
            className={`transition-colors duration-300 relative group ${
              activeSection === "inicio"
                ? "text-[var(--verde-limon)]"
                : "text-[var(--blanco)] hover:text-[var(--verde-limon)]"
            }`}
          >
            Inicio
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde-limon)] transition-all duration-300 ${
              activeSection === "inicio" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </button>
          <button
            onClick={() => scrollToSection("nosotros")}
            className={`transition-colors duration-300 relative group ${
              activeSection === "nosotros"
                ? "text-[var(--verde-limon)]"
                : "text-[var(--blanco)] hover:text-[var(--verde-limon)]"
            }`}
          >
            Nosotros
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde-limon)] transition-all duration-300 ${
              activeSection === "nosotros" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className={`transition-colors duration-300 relative group ${
              activeSection === "contacto"
                ? "text-[var(--verde-limon)]"
                : "text-[var(--blanco)] hover:text-[var(--verde-limon)]"
            }`}
          >
            Contacto
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde-limon)] transition-all duration-300 ${
              activeSection === "contacto" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </button>
          {/* <button
            className="px-4 py-2 rounded transition-all duration-300 bg-[var(--verde)] text-[var(--negro)] hover:bg-[var(--verde-limon)]"
            onClick={() => router.push("/portafolio")}
          >
            Portafolio
          </button> */}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-[var(--blanco)] focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {(isMobileMenuOpen || isClosing) && (
        <>
          {/* Overlay con animación */}
          <div
            className={`fixed inset-0 bg-black/70 z-40 md:hidden ${
              isClosing ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={toggleMobileMenu}
          ></div>

          {/* Mobile Menu Panel con animación reversa */}
          <div
            className={`fixed top-0 left-0 right-0 w-full h-auto bg-white z-50 md:hidden ${
              isClosing ? "animate-slide-up" : "animate-slide-down"
            }`}
          >
            {/* Header del menú */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">MENÚ</h3>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links con animación escalonada */}
            <div className="flex flex-col p-6 space-y-6">
              <button
                onClick={() => {
                  scrollToSection("inicio");
                  closeMobileMenu();
                }}
                className={`border-b border-gray-200 text-xl font-medium relative group transition-colors duration-300 py-2 text-left ${
                  activeSection === "inicio" 
                    ? "text-[var(--verde)]" 
                    : "text-gray-800"
                } ${
                  isClosing ? "animate-fade-out-down" : "animate-fade-in-up"
                }`}
                style={{ animationDelay: isClosing ? "0s" : "0.1s" }}
              >
                Inicio
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde)] transition-all duration-300 ${
                  activeSection === "inicio" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </button>
              <button
                onClick={() => {
                  scrollToSection("nosotros");
                  closeMobileMenu();
                }}
                className={`border-b border-gray-200 text-xl font-medium relative group transition-colors duration-300 py-2 text-left ${
                  activeSection === "nosotros" 
                    ? "text-[var(--verde)]" 
                    : "text-gray-800"
                } ${
                  isClosing ? "animate-fade-out-down" : "animate-fade-in-up"
                }`}
                style={{ animationDelay: isClosing ? "0.1s" : "0.3s" }}
              >
                Nosotros
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde)] transition-all duration-300 ${
                  activeSection === "nosotros" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </button>
              <button
                onClick={() => {
                  scrollToSection("contacto");
                  closeMobileMenu();
                }}
                className={`text-xl font-medium relative group transition-colors duration-300 py-2 text-left ${
                  activeSection === "contacto" 
                    ? "text-[var(--verde)]" 
                    : "text-gray-800"
                } ${
                  isClosing ? "animate-fade-out-down" : "animate-fade-in-up"
                }`}
                style={{ animationDelay: isClosing ? "0.15s" : "0.4s" }}
              >
                Contacto
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--verde)] transition-all duration-300 ${
                  activeSection === "contacto" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </button>

              {/* Action Buttons con animación */}
              <div
                className={`pt-6 space-y-4 ${
                  isClosing ? "animate-fade-out-down" : "animate-fade-in-up"
                }`}
                style={{ animationDelay: isClosing ? "0.2s" : "0.5s" }}
              >
                {/* <button
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-[var(--verde)] text-white hover:bg-[var(--verde-limon)]"
                  onClick={() => {
                    router.push("/portafolio");
                    closeMobileMenu();
                  }}
                >
                  Ver Portafolio
                </button> */}
                <button
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[var(--verde)] hover:text-[var(--verde)] transition-all duration-300"
                  onClick={() => {
                    scrollToSection("contacto");
                    closeMobileMenu();
                  }}
                >
                  Contáctanos
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
