<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const NODE_COUNT = 60
    const CONNECTION_RADIUS = 160
    const PACKET_SPEED = 0.03
    const MOUSE_INFLUENCE_RADIUS = 250

    interface Point {
        x: number
        y: number
        vx: number
        vy: number
        radius: number
        role: 'worker' | 'manager'
    }

    interface Packet {
        from: Point
        to: Point
        progress: number
        color: string
    }

    let points: Point[] = []
    let packets: Packet[] = []
    const mouse = { x: -1000, y: -1000 }

    const init = () => {
        points = []
        for (let i = 0; i < NODE_COUNT; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 2,
                role: Math.random() > 0.85 ? 'manager' : 'worker'
            })
        }
    }

    let animationId = 0

    const draw = () => {
        ctx.clearRect(0, 0, width, height)

        // Draw nodes
        points.forEach(point => {
            point.x += point.vx
            point.y += point.vy

            if (point.x < 0 || point.x > width) point.vx *= -1
            if (point.y < 0 || point.y > height) point.vy *= -1

            const dx = mouse.x - point.x
            const dy = mouse.y - point.y
            const dist = Math.hypot(dx, dy)

            if (dist < MOUSE_INFLUENCE_RADIUS) {
                const force = (MOUSE_INFLUENCE_RADIUS - dist) / MOUSE_INFLUENCE_RADIUS
                point.x -= (dx / dist) * force
                point.y -= (dy / dist) * force
            }

            ctx.beginPath()
            ctx.arc(
                point.x,
                point.y,
                point.role === 'manager' ? 4.5 : 2.5,
                0,
                Math.PI * 2
            )

            if (dist < 120) {
                ctx.fillStyle = '#6366F1'
                ctx.shadowColor = 'rgba(99,102,241,0.5)'
                ctx.shadowBlur = 12
            } else {
                ctx.fillStyle = point.role === 'manager' ? '#64748B' : '#94A3B8'
                ctx.shadowBlur = 0
            }

            ctx.fill()
            ctx.shadowBlur = 0
        })

        // Connections + packets
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const p1 = points[i]
                const p2 = points[j]

                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
                if (dist < CONNECTION_RADIUS) {
                    ctx.beginPath()
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.strokeStyle = `rgba(148,163,184,${(1 - dist / CONNECTION_RADIUS) * 0.35})`
                    ctx.lineWidth = 1
                    ctx.stroke()

                    const isNearMouse =
                        Math.hypot(mouse.x - p1.x, mouse.y - p1.y) < 150 ||
                        Math.hypot(mouse.x - p2.x, mouse.y - p2.y) < 150

                    if (Math.random() < (isNearMouse ? 0.04 : 0.002)) {
                        packets.push({
                            from: p1,
                            to: p2,
                            progress: 0,
                            color: isNearMouse ? '#818CF8' : '#CBD5E1'
                        })
                    }
                }
            }
        }

        packets.forEach((p, i) => {
            p.progress += PACKET_SPEED
            if (p.progress >= 1) {
                packets.splice(i, 1)
                return
            }

            const x = p.from.x + (p.to.x - p.from.x) * p.progress
            const y = p.from.y + (p.to.y - p.from.y) * p.progress

            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = p.color
            ctx.fill()
        })

        animationId = requestAnimationFrame(draw)
    }

    const resize = () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
        init()
    }

    const mouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX
        mouse.y = e.clientY
    }

    const mouseLeave = () => {
        mouse.x = -1000
        mouse.y = -1000
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseleave', mouseLeave)

    init()
    draw()

    onUnmounted(() => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', resize)
        window.removeEventListener('mousemove', mouseMove)
        window.removeEventListener('mouseleave', mouseLeave)
    })
})
</script>

<template>
    <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-0" />
</template>
