'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z)
  const mountainRadius = 15
  if (distFromCenter < mountainRadius) {
    const t = 1 - distFromCenter / mountainRadius
    return t * t * 20
  }
  return 0
}

function getBlockColor(height: number, y: number): string {
  if (y >= height - 1 && height > 15) return '#f0f0f0' // snow
  if (y >= height - 1 && height > 8) return '#8B8B8B' // stone
  if (y >= height - 1) return '#4a7c3f' // grass
  if (y > height - 3) return '#8B6914' // dirt
  return '#808080' // stone
}

export default function VoxelTerrain() {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const normals: number[] = []
    const color = new THREE.Color()

    const step = 2
    for (let x = -30; x <= 30; x += step) {
      for (let z = -30; z <= 30; z += step) {
        const height = getTerrainHeight(x, z)
        const maxY = Math.max(0, Math.floor(height))

        for (let y = 0; y <= maxY; y += step) {
          const isTop = y >= maxY - step
          if (!isTop && y > 0) continue // only render top blocks and ground

          const bx = x
          const by = y
          const bz = z
          const s = step / 2

          color.set(getBlockColor(maxY, y))
          const r = color.r
          const g = color.g
          const b = color.b

          // Top face
          if (isTop) {
            positions.push(
              bx - s, by + s, bz - s,
              bx + s, by + s, bz - s,
              bx + s, by + s, bz + s,
              bx - s, by + s, bz - s,
              bx + s, by + s, bz + s,
              bx - s, by + s, bz + s
            )
            for (let i = 0; i < 6; i++) {
              colors.push(r, g, b)
              normals.push(0, 1, 0)
            }
          }

          // Side faces only if visible
          if (isTop && maxY > 0) {
            // Front
            positions.push(
              bx - s, by - s, bz + s,
              bx + s, by - s, bz + s,
              bx + s, by + s, bz + s,
              bx - s, by - s, bz + s,
              bx + s, by + s, bz + s,
              bx - s, by + s, bz + s
            )
            const sideColor = new THREE.Color(getBlockColor(maxY, y - 1))
            for (let i = 0; i < 6; i++) {
              colors.push(sideColor.r * 0.8, sideColor.g * 0.8, sideColor.b * 0.8)
              normals.push(0, 0, 1)
            }

            // Back
            positions.push(
              bx + s, by - s, bz - s,
              bx - s, by - s, bz - s,
              bx - s, by + s, bz - s,
              bx + s, by - s, bz - s,
              bx - s, by + s, bz - s,
              bx + s, by + s, bz - s
            )
            for (let i = 0; i < 6; i++) {
              colors.push(sideColor.r * 0.7, sideColor.g * 0.7, sideColor.b * 0.7)
              normals.push(0, 0, -1)
            }

            // Left
            positions.push(
              bx - s, by - s, bz - s,
              bx - s, by - s, bz + s,
              bx - s, by + s, bz + s,
              bx - s, by - s, bz - s,
              bx - s, by + s, bz + s,
              bx - s, by + s, bz - s
            )
            for (let i = 0; i < 6; i++) {
              colors.push(sideColor.r * 0.75, sideColor.g * 0.75, sideColor.b * 0.75)
              normals.push(-1, 0, 0)
            }

            // Right
            positions.push(
              bx + s, by - s, bz + s,
              bx + s, by - s, bz - s,
              bx + s, by + s, bz - s,
              bx + s, by - s, bz + s,
              bx + s, by + s, bz - s,
              bx + s, by + s, bz + s
            )
            for (let i = 0; i < 6; i++) {
              colors.push(sideColor.r * 0.85, sideColor.g * 0.85, sideColor.b * 0.85)
              normals.push(1, 0, 0)
            }
          }
        }
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    return geom
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}
