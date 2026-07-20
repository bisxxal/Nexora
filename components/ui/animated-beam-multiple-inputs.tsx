"use client"

import React, { useEffect, useId, useRef, useState, type RefObject } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
    className?: string
    containerRef: RefObject<HTMLElement | null> // Container ref
    fromRef: RefObject<HTMLElement | null>
    toRef: RefObject<HTMLElement | null>
    curvature?: number
    reverse?: boolean
    pathColor?: string
    pathWidth?: number
    pathOpacity?: number
    gradientStartColor?: string
    gradientStopColor?: string
    delay?: number
    duration?: number
    repeat?: number
    repeatDelay?: number
    startXOffset?: number
    startYOffset?: number
    endXOffset?: number
    endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
    className,
    containerRef,
    fromRef,
    toRef,
    curvature = 0,
    reverse = false, // Include the reverse prop
    duration = 7,
    delay = 0,
    pathColor = "gray",
    pathWidth = 2,
    pathOpacity = 0.2,
    gradientStartColor = "#ffaa40",
    gradientStopColor = "#9c40ff",
    repeat = Infinity,
    repeatDelay = 0,
    startXOffset = 0,
    startYOffset = 0,
    endXOffset = 0,
    endYOffset = 0,
}) => {
    const id = useId()
    const [pathD, setPathD] = useState("")
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

    // Calculate the gradient coordinates based on the reverse prop
    const gradientCoordinates = reverse
        ? {
            x1: ["90%", "-10%"],
            x2: ["100%", "0%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
        }
        : {
            x1: ["10%", "110%"],
            x2: ["0%", "100%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
        }

    useEffect(() => {
        const updatePath = () => {
            if (containerRef.current && fromRef.current && toRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect()
                const rectA = fromRef.current.getBoundingClientRect()
                const rectB = toRef.current.getBoundingClientRect()

                const svgWidth = containerRect.width
                const svgHeight = containerRect.height
                setSvgDimensions({ width: svgWidth, height: svgHeight })

                const startX =
                    rectA.left - containerRect.left + rectA.width / 2 + startXOffset
                const startY =
                    rectA.top - containerRect.top + rectA.height / 2 + startYOffset
                const endX =
                    rectB.left - containerRect.left + rectB.width / 2 + endXOffset
                const endY =
                    rectB.top - containerRect.top + rectB.height / 2 + endYOffset

                const controlY = startY - curvature
                const d = `M ${startX},${startY} Q ${(startX + endX) / 2
                    },${controlY} ${endX},${endY}`
                setPathD(d)
            }
        }

        // Initialize ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            updatePath()
        })

        // Observe the container element
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        // Call the updatePath initially to set the initial path
        updatePath()

        // Clean up the observer on component unmount
        return () => {
            resizeObserver.disconnect()
        }
    }, [
        containerRef,
        fromRef,
        toRef,
        curvature,
        startXOffset,
        startYOffset,
        endXOffset,
        endYOffset,
    ])

    return (
        <svg
            fill="none"
            width={svgDimensions.width}
            height={svgDimensions.height}
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
                "pointer-events-none absolute top-0 left-0 transform-gpu stroke-2",
                className
            )}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        >
            <path
                d={pathD}
                stroke={pathColor}
                strokeWidth={pathWidth}
                strokeOpacity={pathOpacity}
                strokeLinecap="round"
            />
            <path
                d={pathD}
                strokeWidth={pathWidth}
                stroke={`url(#${id})`}
                strokeOpacity="1"
                strokeLinecap="round"
            />
            <defs>
                <motion.linearGradient
                    className="transform-gpu"
                    id={id}
                    gradientUnits={"userSpaceOnUse"}
                    initial={{
                        x1: "0%",
                        x2: "0%",
                        y1: "0%",
                        y2: "0%",
                    }}
                    animate={{
                        x1: gradientCoordinates.x1,
                        x2: gradientCoordinates.x2,
                        y1: gradientCoordinates.y1,
                        y2: gradientCoordinates.y2,
                    }}
                    transition={{
                        delay,
                        duration,
                        ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
                        repeat,
                        repeatDelay,
                    }}
                >
                    <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
                    <stop stopColor={gradientStartColor}></stop>
                    <stop offset="32.5%" stopColor={gradientStopColor}></stop>
                    <stop
                        offset="100%"
                        stopColor={gradientStopColor}
                        stopOpacity="0"
                    ></stop>
                </motion.linearGradient>
            </defs>
        </svg>
    )
}


const Circle = React.forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
    <div
        ref={ref}
        className={cn(
            "z-10 flex size-15 items-center justify-center rounded-full border-2 border-[#0000007b] bg-white p-1.5 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
            className
        )}
    >
        {children}
    </div>
))
Circle.displayName = "Circle"

export function AnimatedBeamMultipleOutputDemo({
    className,
}: {
    className?: string
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null)
    const div2Ref = useRef<HTMLDivElement>(null)
    const div3Ref = useRef<HTMLDivElement>(null)
    const div4Ref = useRef<HTMLDivElement>(null)
    const div5Ref = useRef<HTMLDivElement>(null)
    const div6Ref = useRef<HTMLDivElement>(null)
    const div7Ref = useRef<HTMLDivElement>(null)

    return (
        <div
            className={cn(
                "relative   flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg p-10",
                className
            )}
            ref={containerRef}
        >
            {/* Left column — source nodes */}
            <div className="flex flex-col justify-center gap-6">
                <Circle className="p-2.5" ref={div1Ref}> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1920px-PDF_file_icon.svg.png" alt="" /> </Circle>
                <Circle ref={div2Ref}> <img src="https://static.vecteezy.com/system/resources/thumbnails/022/692/016/small/3d-file-format-data-icon-illustration-png.png" alt="" /> </Circle>
                <Circle ref={div3Ref}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" alt="" /></Circle>
                <Circle ref={div4Ref}><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="" /></Circle>
                <Circle ref={div5Ref}><img src="https://static.vecteezy.com/system/resources/thumbnails/075/663/459/small/3d-website-global-icon-png.png" alt="" /></Circle>
            </div>

            {/* Centre — Nexora node */}
            <div className="flex flex-col items-center justify-center mx-16">
                <Circle ref={div6Ref} className="size-16">
                    ✦
                </Circle>
                <span className="mt-2 text-xs font-semibold text-muted-foreground">
                    Nexora
                </span>
            </div>

            {/* Right — output node */}
            <div className="flex flex-col justify-center">
                <Circle ref={div7Ref}>💡</Circle>
            </div>

            {/* Beams from sources → Nexora */}
            <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} />

            {/* Beam from Nexora → output */}
            <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} />
        </div>
    )
}
