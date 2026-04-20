import { toast } from "sonner";

export interface ContactFormData {
  nombre: string;
  email: string;
  mensaje: string;
  telefono?: string;
  empresa?: string;
  servicio?: string;
}

interface ContactFormResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const sendForm = async (
  data: ContactFormData
): Promise<ContactFormResponse> => {

  const API_URL = process.env.NEXT_PUBLIC_HW_API_URL;

  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    toast.success("Mensaje enviado correctamente");

    return {
      success: true,
      message: "Mensaje enviado correctamente",
      data: result,
    };
  } catch (error) {
    toast.error("Error al enviar el mensaje");

    return {
      success: false,
      message: "Error al enviar el mensaje",
    };
  }
};
