"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { JSX } from "react"

type FaqItem = {
  question: string
  answer: string | JSX.Element
  defaultOpen?: boolean
}

const faqItems: FaqItem[] = [
  {
    question: "¿Existe un valor mínimo para poder operar?",
    answer: (
      <div>
        <p>
          Si, esta cantidad tiene que sobrepasar un mínimo de 5$, ya sea 1 o entre varias, no se aceptan skins de menos
          de 1$.
        </p>
        <p className="mt-2">
          Se pone overprice a skins muy determinadas con pegatinas muy determinadas, las unicas cajas que compramos son
          Bravo/Guantes y Prisma 2 por el momento.
        </p>
        <p className="mt-2">Cuanto más cara sea la skin mejor cotización obtendrás.</p>
      </div>
    ),
  },
  {
    question: "¿De donde cogeis la referencia de los precios?",
    answer: (
      <p>
        Las referencias se obtienen de mercados como{" "}
        <a
          href="https://buff.163.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Buff163
        </a>{" "}
        y de{" "}
        <a
          href="https://csfloat.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Csfloat
        </a>
        , Pagamos entre el 80 y 90% de precio total en estos mercados.
      </p>
    ),
  },
  {
    question: "¿Qué métodos de pago teneis disponible?",
    answer: "Aceptamos transferencias bancarias, PayPal, y criptomonedas como métodos de pago.",
  },
  {
    question: "¿Skins como método de pago?",
    answer: "Compramos skins al 85% de precio de los mercados nombrados anteriormente.",
  },
  {
    question: "¿Puedo comprar cualquier Skin?",
    answer: "Disponemos de un amplio catálogo de skins. Contáctanos para consultar disponibilidad específica.",
  },
  {
    question: "¿Se admiten devoluciones?",
    answer: "NO SE ADMITEN DEVOLUCIONES (aceptado por el usuario en los terminos y condiciones al crearse la cuenta)",
    defaultOpen: true,
  },
]

export default function FaqSection() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    faqItems.reduce(
      (acc, item, index) => {
        acc[index] = !!item.defaultOpen
        return acc
      },
      {} as Record<number, boolean>,
    ),
  )

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <section id="faq" className="py-16 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-orange-500 text-xl mb-2">FAQ</h2>
          <h3 className="text-4xl font-bold text-white mb-4">Preguntas frecuentes</h3>
          <p className="text-xl text-gray-300">FAQ Tradeo (Venta / Compra / Intercambio)</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div key={index} className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left bg-gray-900/80 hover:bg-gray-800/80 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <span className="text-white font-medium">{item.question}</span>
                {openItems[index] ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {openItems[index] && (
                <div className="p-4 bg-gray-800/50">
                  <div className="text-gray-300">{item.answer}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
