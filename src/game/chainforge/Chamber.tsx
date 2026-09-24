import { useEffect, useRef } from 'react'
import { Engine } from '@babylonjs/core/Engines/engine'
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Plane } from '@babylonjs/core/Maths/math.plane'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate'
import {
  PhysicsShapeType,
  PhysicsMotionType,
  PhysicsActivationControl,
} from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin'
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin'
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent'
import '@babylonjs/core/Culling/ray'
import HavokPhysics from '@babylonjs/havok'
import wasmUrl from '@babylonjs/havok/lib/esm/HavokPhysics.wasm?url'
import { PIECES, slotPosition, startPosition } from './levels'
import type { GameSession } from './session'

let havok: ReturnType<typeof HavokPhysics> | undefined
export default function Chamber({
  session,
  onReady,
  onFailure,
}: {
  session: GameSession
  onReady: (backend: string) => void
  onFailure: (reason: string) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false,
      engine: Engine | WebGPUEngine | undefined,
      scene: Scene | undefined,
      cleanup = () => {}
    async function mount() {
      const el = canvas.current!
      let backend = 'WebGL2'
      try {
        try {
          if (await WebGPUEngine.IsSupportedAsync) {
            let gpu: WebGPUEngine | undefined
            try {
              gpu = new WebGPUEngine(el, { antialias: true })
              await gpu.initAsync({ jsPath: '', wasmPath: '' }, { jsPath: '', wasmPath: '' })
              engine = gpu
              backend = 'WebGPU'
            } catch {
              gpu?.dispose()
            }
          }
        } catch {
          /* Detection, construction and initialization all fall back to WebGL2. */
        }
        if (!engine) {
          const gl = new Engine(el, true, { preserveDrawingBuffer: false, stencil: true })
          if (gl.webGLVersion < 2) {
            gl.dispose()
            throw new Error('WebGL2 unavailable')
          }
          engine = gl
        }
        if (cancelled) {
          engine.dispose()
          return
        }
        const physics = await (havok ??= HavokPhysics({ locateFile: () => wasmUrl }))
        if (cancelled) {
          engine.dispose()
          return
        }
        const world = (scene = new Scene(engine))
        world.clearColor = new Color4(0.022, 0.025, 0.033, 1)
        const plugin = new HavokPlugin(true, physics)
        world.enablePhysics(Vector3.Zero(), plugin)
        world.getPhysicsEngine()!.setSubTimeStep(1000 / 60)
        const camera = new ArcRotateCamera('camera', -Math.PI / 2, 0.66, 13, Vector3.Zero(), world)
        camera.lowerRadiusLimit = 10
        camera.upperRadiusLimit = 18
        new HemisphericLight('key', new Vector3(-1, 3, -2), world).intensity = 1.3
        function material(name: string, color: string, glow = 0) {
          const m = new StandardMaterial(name, world)
          m.diffuseColor = Color3.FromHexString(color)
          m.emissiveColor = m.diffuseColor.scale(glow)
          m.specularColor = new Color3(0.4, 0.4, 0.4)
          return m
        }
        const orange = material('electric-orange', '#ff762e', 0.6),
          yellow = material('electric-yellow', '#edff59', 0.8),
          metal = material('chamber', '#222836'),
          quiet = material('empty-slot', '#525969')
        for (let i = -4; i <= 4; i++) {
          const line = MeshBuilder.CreateLines(
            'grid-' + i,
            { points: [new Vector3(i, -0.125, -3.6), new Vector3(i, -0.125, 3.6)] },
            world,
          )
          line.color = new Color3(0.17, 0.23, 0.28)
        }
        const floor = MeshBuilder.CreateBox('floor', { width: 10, height: 0.16, depth: 8 }, world)
        floor.position.y = -0.22
        floor.material = metal
        for (const [x, z, w, d] of [
          [-4.85, 0, 0.2, 8],
          [4.85, 0, 0.2, 8],
          [0, -3.85, 10, 0.2],
          [0, 3.85, 10, 0.2],
        ]) {
          const wall = MeshBuilder.CreateBox(
            'boundary',
            { width: w, height: 0.65, depth: d },
            world,
          )
          wall.position.set(x, 0.3, z)
          wall.material = orange
          new PhysicsAggregate(wall, PhysicsShapeType.BOX, { mass: 0, restitution: 0.3 }, world)
        }
        const slots = session.level.target.map((code, i) => {
          const [x, z] = slotPosition(i, session.level.target.length)
          const ring = MeshBuilder.CreateTorus(
            'slot-' + i,
            { diameter: 0.8, thickness: 0.065, tessellation: 32 },
            world,
          )
          ring.position.set(x, 0.08, z)
          ring.material = i === 0 ? yellow : quiet
          return ring
        })
        const pieces = session.level.target.map((code, i) => {
          const spec = PIECES[code],
            mesh = MeshBuilder.CreateCylinder(
              'piece-' + i,
              { diameter: 0.68, height: 0.38, tessellation: spec.sides },
              world,
            ),
            [x, z] = startPosition(i, session.level.target.length)
          mesh.position.set(x, 0.35, z)
          mesh.material = material('piece-material-' + i, spec.color, 0.22)
          mesh.metadata = { piece: i }
          const label = MeshBuilder.CreateGround('label-' + i, { width: 0.5, height: 0.5 }, world)
          label.parent = mesh
          label.position.y = 0.205
          label.isPickable = false
          const texture = new DynamicTexture('letter-' + i, 128, world, false)
          texture.drawText(code, null, 95, 'bold 100px sans-serif', '#080b10', spec.color, true)
          const ink = new StandardMaterial('ink-' + i, world)
          ink.diffuseTexture = texture
          ink.emissiveColor = Color3.White()
          label.material = ink
          const body = new PhysicsAggregate(
            mesh,
            PhysicsShapeType.SPHERE,
            { mass: 1, radius: 0.28, restitution: 0.15, friction: 0.4 },
            world,
          )
          plugin.setActivationControl(body.body, PhysicsActivationControl.ALWAYS_ACTIVE)
          body.body.setLinearDamping(0.75)
          return { mesh, body }
        })
        const gates = Array.from(
          { length: session.level.doubleGate ? 2 : session.level.gate ? 1 : 0 },
          (_, i) => {
            const mesh = MeshBuilder.CreateBox(
              'shutter-' + i,
              { width: 3.6, height: 0.65, depth: 0.25 },
              world,
            )
            mesh.position.set(0, 0.35, i === 0 ? 0 : -0.85)
            mesh.material = orange
            const body = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, world)
            body.body.setMotionType(PhysicsMotionType.ANIMATED)
            return { mesh, body }
          },
        )
        const tether = MeshBuilder.CreateLines(
          'capture-tether',
          { points: Array.from({ length: 12 }, () => Vector3.Zero()), updatable: true },
          world,
        )
        tether.color = Color3.FromHexString('#edff59')
        tether.isPickable = false
        const marker = MeshBuilder.CreateTorus(
          'aim',
          { diameter: 0.5, thickness: 0.025, tessellation: 32 },
          world,
        )
        marker.material = yellow
        marker.isPickable = false
        let aim = new Vector3(),
          waypoints: Vector3[] = [],
          elapsed = 0,
          publish = 0,
          collisionAt = -2
        for (const piece of pieces) {
          piece.body.body.setCollisionCallbackEnabled(true)
          piece.body.body.getCollisionObservable().add(() => {
            if (session.state.phase === 'playing' && elapsed - collisionAt > 0.6) {
              collisionAt = elapsed
              session.update({ collisions: session.state.collisions + 1 })
            }
          })
        }
        function resetPiece(i: number) {
          const p = pieces[i],
            [x, z] = startPosition(i, pieces.length)
          p.body.body.setMotionType(PhysicsMotionType.DYNAMIC)
          p.body.body.disablePreStep = false
          p.mesh.position.set(x, 0.35, z)
          p.body.body.setLinearVelocity(Vector3.Zero())
          p.body.body.setAngularVelocity(Vector3.Zero())
        }
        const instrument = {
          capture(id: number) {
            aim.copyFrom(pieces[id].mesh.position)
            waypoints = []
          },
          release() {
            waypoints = []
          },
          move(x: number, z: number) {
            if (session.state.phase !== 'playing' || session.state.held === null) return
            waypoints = []
            aim.x = Math.max(-4.35, Math.min(4.35, aim.x + x))
            aim.z = Math.max(-3.4, Math.min(3.4, aim.z + z))
          },
          guide() {
            if (session.state.phase !== 'playing' || session.state.held === null) return
            const pos = pieces[session.state.held].mesh.position,
              [x, z] = session.target()
            const side = pos.x < 0 ? -4.1 : 4.1
            waypoints = gates.length
              ? [
                  new Vector3(pos.x, 0.35, 0.62),
                  new Vector3(side, 0.35, 0.62),
                  new Vector3(side, 0.35, -1.75),
                  new Vector3(x, 0.35, -1.75),
                  new Vector3(x, 0.35, z),
                ]
              : [new Vector3(x, 0.35, z)]
            session.update({
              message:
                'Guide is pulling the piece along a clear route. When it settles in the glowing ring, press Dock.',
            })
          },
          dock() {
            if (session.state.held === null) return
            const id = session.state.held,
              p = pieces[id],
              [x, z] = session.target(),
              target = new Vector3(x, 0.35, z)
            if (
              session.dock(
                session.level.target[id],
                Vector3.Distance(p.mesh.position, target),
                p.body.body.getLinearVelocity().length(),
              )
            ) {
              p.body.body.setLinearVelocity(Vector3.Zero())
              p.body.body.setMotionType(PhysicsMotionType.STATIC)
              p.body.body.disablePreStep = false
              p.mesh.position.copyFrom(target)
              waypoints = []
            }
          },
          undo(id: number) {
            waypoints = []
            resetPiece(id)
          },
          restart() {
            waypoints = []
            elapsed = 0
            pieces.forEach((_, i) => resetPiece(i))
          },
          recenter() {
            camera.alpha = -Math.PI / 2
            camera.beta = 0.66
            camera.radius = 13
          },
        }
        session.instrument = instrument
        world.onBeforePhysicsObservable.add(() => {
          const s = session.state
          if (s.phase !== 'playing') return
          const dt = 1 / 60
          elapsed += dt
          gates.forEach((g, i) =>
            g.body.body.setTargetTransform(
              new Vector3(Math.sin(elapsed * 0.8 + i * 2) * 1.1, 0.35, i === 0 ? 0 : -0.85),
              Quaternion.Identity(),
            ),
          )
          pieces.forEach((p, i) => {
            if (s.docked.includes(i)) return
            const v = p.body.body.getLinearVelocity()
            p.body.body.setLinearVelocity(new Vector3(v.x, 0, v.z))
            p.mesh.position.y = 0.35
            if (i === s.held) {
              if (waypoints.length) {
                aim.copyFrom(waypoints[0])
                if (Vector3.Distance(p.mesh.position, aim) < 0.22) waypoints.shift()
              }
              const force = aim
                .subtract(p.mesh.position)
                .scale(16)
                .subtract(v.scale(s.braking ? 16 : 7))
              p.body.body.setLinearVelocity(v.add(force.scale(dt)))
              p.body.body.setAngularVelocity(Vector3.Zero())
            }
          })
          publish += dt
          if (publish > 0.1) {
            publish = 0
            session.update({ elapsed })
          }
        })
        const plane = new Plane(0, 1, 0, -0.35)
        function pointer(e: PointerEvent) {
          if (session.state.phase !== 'playing') return
          const rect = el.getBoundingClientRect(),
            x = ((e.clientX - rect.left) * engine!.getRenderWidth()) / rect.width,
            y = ((e.clientY - rect.top) * engine!.getRenderHeight()) / rect.height
          if (e.type === 'pointerdown') {
            el.focus()
            el.setPointerCapture(e.pointerId)
            const hit = world.pick(x, y, (m) => m.metadata?.piece !== undefined)
            if (hit?.pickedMesh) {
              session.select(hit.pickedMesh.metadata.piece)
              return
            }
          }
          if (session.state.held !== null && (e.buttons || e.type === 'pointerdown')) {
            const ray = world.createPickingRay(x, y, null, camera),
              distance = ray.intersectsPlane(plane)
            if (distance !== null) {
              const p = ray.origin.add(ray.direction.scale(distance))
              aim.set(
                Math.max(-4.35, Math.min(4.35, p.x)),
                0.35,
                Math.max(-3.4, Math.min(3.4, p.z)),
              )
              waypoints = []
            }
          }
        }
        function key(e: KeyboardEvent) {
          if (e.target !== el) return
          const directions: Record<string, [number, number]> = {
            ArrowLeft: [-0.35, 0],
            a: [-0.35, 0],
            ArrowRight: [0.35, 0],
            d: [0.35, 0],
            ArrowUp: [0, 0.35],
            w: [0, 0.35],
            ArrowDown: [0, -0.35],
            s: [0, -0.35],
          }
          if (directions[e.key]) {
            e.preventDefault()
            instrument.move(...directions[e.key])
          } else if (e.key === ' ') {
            e.preventDefault()
            session.state.held === null
              ? session.capture()
              : session.update({ braking: !session.state.braking })
          } else if (e.key === 'Enter') {
            e.preventDefault()
            instrument.dock()
          } else if (e.key === 'Escape') {
            session.pause()
          }
        }
        el.addEventListener('pointerdown', pointer)
        el.addEventListener('pointermove', pointer)
        el.addEventListener('keydown', key)
        const observer = new ResizeObserver(() => {
          engine?.resize()
          camera.radius = el.clientWidth < 650 ? 17 : 13
        })
        observer.observe(el)
        function visibility() {
          if (document.hidden && session.state.phase === 'playing') session.pause()
        }
        document.addEventListener('visibilitychange', visibility)
        const frames: number[] = []
        let previous = performance.now()
        engine.runRenderLoop(() => {
          if (cancelled) return
          const now = performance.now()
          if (!document.hidden) {
            frames.push(now - previous)
            if (frames.length > 1200) frames.shift()
          }
          previous = now
          world.physicsEnabled = session.state.phase === 'playing' && !document.hidden
          marker.isVisible = session.state.held !== null
          tether.isVisible = marker.isVisible
          if (session.state.held !== null) {
            const origin = pieces[session.state.held].mesh.position
            MeshBuilder.CreateLines(
              'capture-tether',
              {
                points: Array.from({ length: 12 }, (_, i) => {
                  const t = i / 11
                  return Vector3.Lerp(origin, aim, t).add(
                    new Vector3(0, Math.sin(t * Math.PI) * 0.35, 0),
                  )
                }),
                instance: tether,
              },
              world,
            )
          }
          marker.position.set(aim.x, 0.07, aim.z)
          slots.forEach(
            (slot, i) =>
              (slot.material =
                i === session.state.docked.length
                  ? yellow
                  : i < session.state.docked.length
                    ? orange
                    : quiet),
          )
          world.render()
        })
        // Read-only measurements used by the local verification harness, never gameplay controls.
        const diagnostics = () => ({
          backend,
          elapsed,
          aim: { x: aim.x, z: aim.z },
          waypoints: waypoints.length,
          frames: [...frames],
          pieces: pieces.map((p) => ({
            x: p.mesh.position.x,
            z: p.mesh.position.z,
            v: p.body.body.getLinearVelocity().asArray(),
          })),
          held: session.state.held,
          phase: session.state.phase,
        })
        ;(window as any).__chainforgeDiagnostics = diagnostics
        cleanup = () => {
          session.instrument = null
          observer.disconnect()
          document.removeEventListener('visibilitychange', visibility)
          el.removeEventListener('pointerdown', pointer)
          el.removeEventListener('pointermove', pointer)
          el.removeEventListener('keydown', key)
          if ((window as any).__chainforgeDiagnostics === diagnostics)
            delete (window as any).__chainforgeDiagnostics
        }
        onReady(backend)
      } catch (error) {
        if (!cancelled)
          onFailure(error instanceof Error ? error.message : '3D initialization failed')
        scene?.dispose()
        engine?.dispose()
      }
    }
    void mount()
    return () => {
      cancelled = true
      cleanup()
      scene?.dispose()
      engine?.dispose()
    }
  }, [session])
  return (
    <canvas
      ref={canvas}
      className="chainforge-canvas"
      tabIndex={0}
      aria-label="Chainforge 3D chamber. Select a piece using the buttons below. Space captures or brakes, arrow keys move, Enter docks, Escape pauses."
    />
  )
}
