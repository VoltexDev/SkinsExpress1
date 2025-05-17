"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const skins = [
  {
    id: 1,
    name: "AWP Dragon Lore",
    image: "/dragonlore.webp",
    alt: "AWP Dragon Lore Skin",
  },
  {
    id: 2,
    name: "USP-S Silencer",
    image: "/usp-silencer.png",
    alt: "USP-S Silencer Skin",
  },
  {
    id: 3,
    name: "M4A4 Howl",
    image: "/howl.webp",
    alt: "M4A4 Howl Skin",
  },
]

export default function SkinSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % skins.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.8,
      }
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        rotate: { repeat: Number.POSITIVE_INFINITY, repeatDelay: 5, duration: 0.5 },
      },
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.8,
      }
    },
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute w-full h-full flex justify-center items-center"
        >
          <div className="relative w-full h-full">
            <Image
              src={skins[currentIndex].image || "/placeholder.svg"}
              alt={skins[currentIndex].alt}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
