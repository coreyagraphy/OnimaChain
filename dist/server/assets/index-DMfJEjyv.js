import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from "react";
import { useLayoutEffect, memo, useState, useReducer, useEffect, useRef, useMemo, useImperativeHandle, use, createContext, useCallback } from "react";
import { j as useThree, a9 as useLoader, aa as CubeReflectionMapping, ab as EquirectangularReflectionMapping, ac as CubeTextureLoader, ad as extend, ae as Scene, af as WebGLCubeRenderTarget, H as HalfFloatType, m as useFrame, ag as createPortal, ah as applyProps, V as Vector3, t as DoubleSide, ai as UnsignedByteType, r as Vector2, aj as SRGBColorSpace, D as DepthTexture, ak as DepthStencilFormat, al as UnsignedInt248Type, F as FloatType, W as WebGLRenderTarget, k as LinearFilter, am as MeshNormalMaterial, n as Color, an as NearestFilter, ao as BasicDepthPacking, ap as Uniform, a4 as OrthographicCamera, aq as Mesh, ar as BackSide, as as ShaderMaterial, at as FrontSide, au as EventDispatcher, av as NoBlending, aw as LinearSRGBColorSpace, ax as NoColorSpace, ay as AlwaysDepth, a3 as PerspectiveCamera, az as Material, aA as Texture, B as BufferGeometry, aB as BufferAttribute, aC as REVISION, aD as Vector4, aE as NoToneMapping } from "./router-CxtrX1wR.js";
import { RGBELoader, EXRLoader, GroundProjectedEnv } from "three-stdlib";
import { HDRJPGLoader, GainMapLoader } from "@monogrid/gainmap-js";
import { jsx } from "react/jsx-runtime";
import "maath";
import "n8ao";
const presetsObj = {
  apartment: "lebombo_1k.hdr",
  city: "potsdamer_platz_1k.hdr",
  dawn: "kiara_1_dawn_1k.hdr",
  forest: "forest_slope_1k.hdr",
  lobby: "st_fagans_interior_1k.hdr",
  night: "dikhololo_night_1k.hdr",
  park: "rooitou_park_1k.hdr",
  studio: "studio_small_03_1k.hdr",
  sunset: "venice_sunset_1k.hdr",
  warehouse: "empty_warehouse_01_1k.hdr"
};
const CUBEMAP_ROOT = "https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/";
const isArray = (arr) => Array.isArray(arr);
const defaultFiles = ["/px.png", "/nx.png", "/py.png", "/ny.png", "/pz.png", "/nz.png"];
function useEnvironment({
  files = defaultFiles,
  path = "",
  preset = void 0,
  colorSpace = void 0,
  extensions
} = {}) {
  if (preset) {
    validatePreset(preset);
    files = presetsObj[preset];
    path = CUBEMAP_ROOT;
  }
  const multiFile = isArray(files);
  const {
    extension,
    isCubemap
  } = getExtension(files);
  const loader = getLoader(extension);
  if (!loader) throw new Error("useEnvironment: Unrecognized file extension: " + files);
  const gl = useThree((state) => state.gl);
  useLayoutEffect(() => {
    if (extension !== "webp" && extension !== "jpg" && extension !== "jpeg") return;
    function clearGainmapTexture() {
      useLoader.clear(loader, multiFile ? [files] : files);
    }
    gl.domElement.addEventListener("webglcontextlost", clearGainmapTexture, {
      once: true
    });
  }, [files, gl.domElement]);
  const loaderResult = useLoader(loader, multiFile ? [files] : files, (loader2) => {
    if (extension === "webp" || extension === "jpg" || extension === "jpeg") {
      loader2.setRenderer(gl);
    }
    loader2.setPath == null || loader2.setPath(path);
    if (extensions) extensions(loader2);
  });
  let texture = multiFile ? (
    // @ts-ignore
    loaderResult[0]
  ) : loaderResult;
  if (extension === "jpg" || extension === "jpeg" || extension === "webp") {
    var _renderTarget;
    texture = (_renderTarget = texture.renderTarget) == null ? void 0 : _renderTarget.texture;
  }
  texture.mapping = isCubemap ? CubeReflectionMapping : EquirectangularReflectionMapping;
  texture.colorSpace = colorSpace !== null && colorSpace !== void 0 ? colorSpace : isCubemap ? "srgb" : "srgb-linear";
  return texture;
}
const preloadDefaultOptions = {
  files: defaultFiles,
  path: "",
  preset: void 0,
  extensions: void 0
};
useEnvironment.preload = (preloadOptions) => {
  const options = {
    ...preloadDefaultOptions,
    ...preloadOptions
  };
  let {
    files,
    path = ""
  } = options;
  const {
    preset,
    extensions
  } = options;
  if (preset) {
    validatePreset(preset);
    files = presetsObj[preset];
    path = CUBEMAP_ROOT;
  }
  const {
    extension
  } = getExtension(files);
  if (extension === "webp" || extension === "jpg" || extension === "jpeg") {
    throw new Error("useEnvironment: Preloading gainmaps is not supported");
  }
  const loader = getLoader(extension);
  if (!loader) throw new Error("useEnvironment: Unrecognized file extension: " + files);
  useLoader.preload(loader, isArray(files) ? [files] : files, (loader2) => {
    loader2.setPath == null || loader2.setPath(path);
    if (extensions) extensions(loader2);
  });
};
const clearDefaultOptins = {
  files: defaultFiles,
  preset: void 0
};
useEnvironment.clear = (clearOptions) => {
  const options = {
    ...clearDefaultOptins,
    ...clearOptions
  };
  let {
    files
  } = options;
  const {
    preset
  } = options;
  if (preset) {
    validatePreset(preset);
    files = presetsObj[preset];
  }
  const {
    extension
  } = getExtension(files);
  const loader = getLoader(extension);
  if (!loader) throw new Error("useEnvironment: Unrecognized file extension: " + files);
  useLoader.clear(loader, isArray(files) ? [files] : files);
};
function validatePreset(preset) {
  if (!(preset in presetsObj)) throw new Error("Preset must be one of: " + Object.keys(presetsObj).join(", "));
}
function getExtension(files) {
  var _firstEntry$split$pop;
  const isCubemap = isArray(files) && files.length === 6;
  const isGainmap = isArray(files) && files.length === 3 && files.some((file) => file.endsWith("json"));
  const firstEntry = isArray(files) ? files[0] : files;
  const extension = isCubemap ? "cube" : isGainmap ? "webp" : firstEntry.startsWith("data:application/exr") ? "exr" : firstEntry.startsWith("data:application/hdr") ? "hdr" : firstEntry.startsWith("data:image/jpeg") ? "jpg" : (_firstEntry$split$pop = firstEntry.split(".").pop()) == null || (_firstEntry$split$pop = _firstEntry$split$pop.split("?")) == null || (_firstEntry$split$pop = _firstEntry$split$pop.shift()) == null ? void 0 : _firstEntry$split$pop.toLowerCase();
  return {
    extension,
    isCubemap,
    isGainmap
  };
}
function getLoader(extension) {
  const loader = extension === "cube" ? CubeTextureLoader : extension === "hdr" ? RGBELoader : extension === "exr" ? EXRLoader : extension === "jpg" || extension === "jpeg" ? HDRJPGLoader : extension === "webp" ? GainMapLoader : null;
  return loader;
}
const isRef = (obj) => obj.current && obj.current.isScene;
const resolveScene = (scene) => isRef(scene) ? scene.current : scene;
function setEnvProps(background, scene, defaultScene, texture, sceneProps = {}) {
  var _target$backgroundRot, _target$backgroundRot2, _target$environmentRo, _target$environmentRo2;
  sceneProps = {
    backgroundBlurriness: 0,
    backgroundIntensity: 1,
    backgroundRotation: [0, 0, 0],
    environmentIntensity: 1,
    environmentRotation: [0, 0, 0],
    ...sceneProps
  };
  const target = resolveScene(scene || defaultScene);
  const oldbg = target.background;
  const oldenv = target.environment;
  const oldSceneProps = {
    // @ts-ignore
    backgroundBlurriness: target.backgroundBlurriness,
    // @ts-ignore
    backgroundIntensity: target.backgroundIntensity,
    // @ts-ignore
    backgroundRotation: (_target$backgroundRot = (_target$backgroundRot2 = target.backgroundRotation) == null || _target$backgroundRot2.clone == null ? void 0 : _target$backgroundRot2.clone()) !== null && _target$backgroundRot !== void 0 ? _target$backgroundRot : [0, 0, 0],
    // @ts-ignore
    environmentIntensity: target.environmentIntensity,
    // @ts-ignore
    environmentRotation: (_target$environmentRo = (_target$environmentRo2 = target.environmentRotation) == null || _target$environmentRo2.clone == null ? void 0 : _target$environmentRo2.clone()) !== null && _target$environmentRo !== void 0 ? _target$environmentRo : [0, 0, 0]
  };
  if (background !== "only") target.environment = texture;
  if (background) target.background = texture;
  applyProps(target, sceneProps);
  return () => {
    if (background !== "only") target.environment = oldenv;
    if (background) target.background = oldbg;
    applyProps(target, oldSceneProps);
  };
}
function EnvironmentMap({
  scene,
  background = false,
  map,
  ...config
}) {
  const defaultScene = useThree((state) => state.scene);
  React.useLayoutEffect(() => {
    if (map) return setEnvProps(background, scene, defaultScene, map, config);
  });
  return null;
}
function EnvironmentCube({
  background = false,
  scene,
  blur,
  backgroundBlurriness,
  backgroundIntensity,
  backgroundRotation,
  environmentIntensity,
  environmentRotation,
  ...rest
}) {
  const texture = useEnvironment(rest);
  const defaultScene = useThree((state) => state.scene);
  React.useLayoutEffect(() => {
    return setEnvProps(background, scene, defaultScene, texture, {
      backgroundBlurriness: blur !== null && blur !== void 0 ? blur : backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation
    });
  });
  React.useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);
  return null;
}
function EnvironmentPortal({
  children,
  near = 0.1,
  far = 1e3,
  resolution = 256,
  frames = 1,
  map,
  background = false,
  blur,
  backgroundBlurriness,
  backgroundIntensity,
  backgroundRotation,
  environmentIntensity,
  environmentRotation,
  scene,
  files,
  path,
  preset = void 0,
  extensions
}) {
  const gl = useThree((state) => state.gl);
  const defaultScene = useThree((state) => state.scene);
  const camera = React.useRef(null);
  const [virtualScene] = React.useState(() => new Scene());
  const fbo = React.useMemo(() => {
    const fbo2 = new WebGLCubeRenderTarget(resolution);
    fbo2.texture.type = HalfFloatType;
    return fbo2;
  }, [resolution]);
  React.useEffect(() => {
    return () => {
      fbo.dispose();
    };
  }, [fbo]);
  React.useLayoutEffect(() => {
    if (frames === 1) {
      const autoClear = gl.autoClear;
      gl.autoClear = true;
      camera.current.update(gl, virtualScene);
      gl.autoClear = autoClear;
    }
    return setEnvProps(background, scene, defaultScene, fbo.texture, {
      backgroundBlurriness: blur !== null && blur !== void 0 ? blur : backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation
    });
  }, [children, virtualScene, fbo.texture, scene, defaultScene, background, frames, gl]);
  let count = 1;
  useFrame(() => {
    if (frames === Infinity || count < frames) {
      const autoClear = gl.autoClear;
      gl.autoClear = true;
      camera.current.update(gl, virtualScene);
      gl.autoClear = autoClear;
      count++;
    }
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, createPortal(/* @__PURE__ */ React.createElement(React.Fragment, null, children, /* @__PURE__ */ React.createElement("cubeCamera", {
    ref: camera,
    args: [near, far, fbo]
  }), files || preset ? /* @__PURE__ */ React.createElement(EnvironmentCube, {
    background: true,
    files,
    preset,
    path,
    extensions
  }) : map ? /* @__PURE__ */ React.createElement(EnvironmentMap, {
    background: true,
    map,
    extensions
  }) : null), virtualScene));
}
function EnvironmentGround(props) {
  var _props$ground, _props$ground2, _scale, _props$ground3;
  const textureDefault = useEnvironment(props);
  const texture = props.map || textureDefault;
  React.useMemo(() => extend({
    GroundProjectedEnvImpl: GroundProjectedEnv
  }), []);
  React.useEffect(() => {
    return () => {
      textureDefault.dispose();
    };
  }, [textureDefault]);
  const args = React.useMemo(() => [texture], [texture]);
  const height = (_props$ground = props.ground) == null ? void 0 : _props$ground.height;
  const radius = (_props$ground2 = props.ground) == null ? void 0 : _props$ground2.radius;
  const scale = (_scale = (_props$ground3 = props.ground) == null ? void 0 : _props$ground3.scale) !== null && _scale !== void 0 ? _scale : 1e3;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(EnvironmentMap, _extends({}, props, {
    map: texture
  })), /* @__PURE__ */ React.createElement("groundProjectedEnvImpl", {
    args,
    scale,
    height,
    radius
  }));
}
function Environment(props) {
  return props.ground ? /* @__PURE__ */ React.createElement(EnvironmentGround, props) : props.map ? /* @__PURE__ */ React.createElement(EnvironmentMap, props) : props.children ? /* @__PURE__ */ React.createElement(EnvironmentPortal, props) : /* @__PURE__ */ React.createElement(EnvironmentCube, props);
}
const Lightformer = /* @__PURE__ */ React.forwardRef(({
  light,
  args,
  map,
  toneMapped = false,
  color: color2 = "white",
  form: Form = "rect",
  intensity = 1,
  scale = 1,
  target = [0, 0, 0],
  children,
  ...props
}, forwardRef) => {
  const ref = React.useRef(null);
  React.useImperativeHandle(forwardRef, () => ref.current, []);
  React.useLayoutEffect(() => {
    if (!children && !props.material) {
      applyProps(ref.current.material, {
        color: color2
      });
      ref.current.material.color.multiplyScalar(intensity);
    }
  }, [color2, intensity, children, props.material]);
  React.useLayoutEffect(() => {
    if (!props.rotation) ref.current.quaternion.identity();
    if (target && !props.rotation) {
      "boolean" === typeof target ? ref.current.lookAt(0, 0, 0) : ref.current.lookAt(Array.isArray(target) ? new Vector3(...target) : target);
    }
  }, [target, props.rotation]);
  scale = Array.isArray(scale) && scale.length === 2 ? [scale[0], scale[1], 1] : scale;
  return /* @__PURE__ */ React.createElement("mesh", _extends({
    ref,
    scale
  }, props), Form === "circle" ? /* @__PURE__ */ React.createElement("ringGeometry", {
    args: args ? args : [0, 0.5, 64]
  }) : Form === "ring" ? /* @__PURE__ */ React.createElement("ringGeometry", {
    args: args ? args : [0.25, 0.5, 64]
  }) : Form === "rect" || Form === "plane" ? /* @__PURE__ */ React.createElement("planeGeometry", {
    args: args ? args : [1, 1]
  }) : Form === "box" ? /* @__PURE__ */ React.createElement("boxGeometry", {
    args: args ? args : [1, 1, 1]
  }) : /* @__PURE__ */ React.createElement(Form, {
    args
  }), children ? children : /* @__PURE__ */ React.createElement("meshBasicMaterial", {
    toneMapped,
    map,
    side: DoubleSide
  }), light && /* @__PURE__ */ React.createElement("pointLight", _extends({
    castShadow: true
  }, light)));
});
var fullscreenGeometry = /* @__PURE__ */ (() => {
  const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  return geometry;
})();
var Pass = class _Pass {
  /**
   * A shared fullscreen triangle.
   *
   * The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
   * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
   * @type {BufferGeometry}
   * @internal
   */
  static get fullscreenGeometry() {
    return fullscreenGeometry;
  }
  /**
   * Constructs a new pass.
   *
   * @param {String} [name] - The name of this pass. Does not have to be unique.
   * @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
   * @param {Camera} [camera] - A camera. Fullscreen effect passes don't require a camera.
   */
  constructor(name = "Pass", scene = new Scene(), camera = new OrthographicCamera()) {
    this.name = name;
    this.renderer = null;
    this.scene = scene;
    this.camera = camera;
    this.screen = null;
    this.rtt = true;
    this.needsSwap = true;
    this.needsDepthBlit = false;
    this.needsDepthTexture = false;
    this.enabled = true;
  }
  /**
   * Sets the render to screen flag.
   *
   * If this flag is changed, the fullscreen material will be updated as well.
   *
   * @type {Boolean}
   */
  get renderToScreen() {
    return !this.rtt;
  }
  set renderToScreen(value) {
    if (this.rtt === value) {
      const material = this.fullscreenMaterial;
      if (material !== null) {
        material.needsUpdate = true;
      }
      this.rtt = !value;
    }
  }
  /**
   * Sets the main scene.
   *
   * @type {Scene}
   */
  set mainScene(value) {
  }
  /**
   * Sets the main camera.
   *
   * @type {Camera}
   */
  set mainCamera(value) {
  }
  /**
   * Sets the renderer
   *
   * @deprecated
   * @param {WebGLRenderer} renderer - The renderer.
   */
  setRenderer(renderer) {
    this.renderer = renderer;
  }
  /**
   * Indicates whether this pass is enabled.
   *
   * @deprecated Use enabled instead.
   * @return {Boolean} Whether this pass is enabled.
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Enables or disables this pass.
   *
   * @deprecated Use enabled instead.
   * @param {Boolean} value - Whether the pass should be enabled.
   */
  setEnabled(value) {
    this.enabled = value;
  }
  /**
   * The fullscreen material.
   *
   * @type {Material}
   */
  get fullscreenMaterial() {
    return this.screen !== null ? this.screen.material : null;
  }
  set fullscreenMaterial(value) {
    let screen = this.screen;
    if (screen !== null) {
      screen.material = value;
    } else {
      screen = new Mesh(_Pass.fullscreenGeometry, value);
      screen.frustumCulled = false;
      if (this.scene === null) {
        this.scene = new Scene();
      }
      this.scene.add(screen);
      this.screen = screen;
    }
  }
  /**
   * Returns the current fullscreen material.
   *
   * @deprecated Use fullscreenMaterial instead.
   * @return {Material} The current fullscreen material, or null if there is none.
   */
  getFullscreenMaterial() {
    return this.fullscreenMaterial;
  }
  /**
   * Sets the fullscreen material.
   *
   * @deprecated Use fullscreenMaterial instead.
   * @protected
   * @param {Material} value - A fullscreen material.
   */
  setFullscreenMaterial(value) {
    this.fullscreenMaterial = value;
  }
  /**
   * Returns the current depth texture.
   *
   * @return {Texture} The current depth texture, or null if there is none.
   */
  getDepthTexture() {
    return null;
  }
  /**
   * Sets the depth texture.
   *
   * This method will be called automatically by the {@link EffectComposer}.
   * You may override this method if your pass relies on the depth information of a preceding {@link RenderPass}.
   *
   * @param {Texture} depthTexture - A depth texture.
   * @param {DepthPackingStrategy} [depthPacking=BasicDepthPacking] - The depth packing.
   */
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
  }
  /**
   * Renders this pass.
   *
   * This is an abstract method that must be overridden.
   *
   * @abstract
   * @throws {Error} An error is thrown if the method is not overridden.
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    throw new Error("Render method not implemented!");
  }
  /**
   * Sets the size.
   *
   * You may override this method if you want to be informed about the size of the backbuffer/canvas.
   * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
  }
  /**
   * Performs initialization tasks.
   *
   * This method is called when this pass is added to an {@link EffectComposer}.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
  }
  /**
   * Performs a shallow search for disposable properties and deletes them.
   *
   * The {@link EffectComposer} calls this method when it is being destroyed. You can use it independently to free
   * memory when you're certain that you don't need this pass anymore.
   */
  dispose() {
    for (const key of Object.keys(this)) {
      const property = this[key];
      const isDisposable = property instanceof WebGLRenderTarget || property instanceof Material || property instanceof Texture || property instanceof _Pass;
      if (isDisposable) {
        this[key].dispose();
      }
    }
    if (this.fullscreenMaterial !== null) {
      this.fullscreenMaterial.dispose();
    }
  }
};
var ClearMaskPass = class extends Pass {
  /**
   * Constructs a new clear mask pass.
   */
  constructor() {
    super("ClearMaskPass", null, null);
    this.needsSwap = false;
  }
  /**
   * Disables the global stencil test.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const stencil = renderer.state.buffers.stencil;
    stencil.setLocked(false);
    stencil.setTest(false);
  }
};
var copy_default = `#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`;
var common_default = `varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}`;
var CopyMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new copy material.
   */
  constructor() {
    super({
      name: "CopyMaterial",
      defines: {
        COLOR_SPACE_CONVERSION: "1",
        DEPTH_PACKING: "0",
        COLOR_WRITE: "1"
      },
      uniforms: {
        inputBuffer: new Uniform(null),
        depthBuffer: new Uniform(null),
        channelWeights: new Uniform(null),
        opacity: new Uniform(1)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: copy_default,
      vertexShader: common_default
    });
    this.depthFunc = AlwaysDepth;
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  get inputBuffer() {
    return this.uniforms.inputBuffer.value;
  }
  set inputBuffer(value) {
    const colorWrite = value !== null;
    if (this.colorWrite !== colorWrite) {
      if (colorWrite) {
        this.defines.COLOR_WRITE = true;
      } else {
        delete this.defines.COLOR_WRITE;
      }
      this.colorWrite = colorWrite;
      this.needsUpdate = true;
    }
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * A depth buffer.
   *
   * @type {Texture}
   */
  get depthBuffer() {
    return this.uniforms.depthBuffer.value;
  }
  set depthBuffer(value) {
    const depthWrite = value !== null;
    if (this.depthWrite !== depthWrite) {
      if (depthWrite) {
        this.defines.DEPTH_WRITE = true;
      } else {
        delete this.defines.DEPTH_WRITE;
      }
      this.depthTest = depthWrite;
      this.depthWrite = depthWrite;
      this.needsUpdate = true;
    }
    this.uniforms.depthBuffer.value = value;
  }
  /**
   * The depth packing strategy of the depth buffer.
   *
   * @type {DepthPackingStrategies}
   */
  set depthPacking(value) {
    this.defines.DEPTH_PACKING = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Indicates whether output color space conversion is enabled.
   *
   * @type {Boolean}
   */
  get colorSpaceConversion() {
    return this.defines.COLOR_SPACE_CONVERSION !== void 0;
  }
  set colorSpaceConversion(value) {
    if (this.colorSpaceConversion !== value) {
      if (value) {
        this.defines.COLOR_SPACE_CONVERSION = true;
      } else {
        delete this.defines.COLOR_SPACE_CONVERSION;
      }
      this.needsUpdate = true;
    }
  }
  /**
   * Color channel weights that modulate texels from the input buffer.
   *
   * Set to `null` to disable.
   *
   * @type {Vector4 | null}
   */
  get channelWeights() {
    return this.uniforms.channelWeights.value;
  }
  set channelWeights(value) {
    if (value !== null) {
      this.defines.USE_WEIGHTS = "1";
      this.uniforms.channelWeights.value = value;
    } else {
      delete this.defines.USE_WEIGHTS;
    }
    this.needsUpdate = true;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Number} value - The buffer.
   */
  setInputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Returns the opacity.
   *
   * @deprecated Use opacity instead.
   * @return {Number} The opacity.
   */
  getOpacity(value) {
    return this.uniforms.opacity.value;
  }
  /**
   * Sets the opacity.
   *
   * @deprecated Use opacity instead.
   * @param {Number} value - The opacity.
   */
  setOpacity(value) {
    this.uniforms.opacity.value = value;
  }
};
var CopyPass = class extends Pass {
  /**
   * Constructs a new save pass.
   *
   * @param {WebGLRenderTarget} [renderTarget] - A render target.
   * @param {Boolean} [autoResize=true] - Whether the render target size should be updated automatically.
   */
  constructor(renderTarget, autoResize = true) {
    super("CopyPass");
    this.fullscreenMaterial = new CopyMaterial();
    this.needsSwap = false;
    this.renderTarget = renderTarget;
    if (renderTarget === void 0) {
      this.renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      this.renderTarget.texture.name = "CopyPass.Target";
    }
    this.autoResize = autoResize;
  }
  /**
   * Enables or disables auto resizing of the render target.
   *
   * @deprecated Use autoResize instead.
   * @type {Boolean}
   */
  get resize() {
    return this.autoResize;
  }
  set resize(value) {
    this.autoResize = value;
  }
  /**
   * The output texture.
   *
   * @type {Texture}
   */
  get texture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the output texture.
   *
   * @deprecated Use texture instead.
   * @return {Texture} The texture.
   */
  getTexture() {
    return this.renderTarget.texture;
  }
  /**
   * Enables or disables auto resizing of the render target.
   *
   * @deprecated Use autoResize instead.
   * @param {Boolean} value - Whether the render target size should be updated automatically.
   */
  setAutoResizeEnabled(value) {
    this.autoResize = value;
  }
  /**
   * Saves the input buffer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    this.fullscreenMaterial.inputBuffer = inputBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
    renderer.render(this.scene, this.camera);
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    if (this.autoResize) {
      this.renderTarget.setSize(width, height);
    }
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - A renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    if (frameBufferType !== void 0) {
      this.renderTarget.texture.type = frameBufferType;
      if (frameBufferType !== UnsignedByteType) {
        this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
      } else if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
        this.renderTarget.texture.colorSpace = SRGBColorSpace;
      }
    }
  }
};
var color = /* @__PURE__ */ new Color();
var ClearPass = class extends Pass {
  /**
   * Constructs a new clear pass.
   *
   * @param {Boolean} [color=true] - Determines whether the color buffer should be cleared.
   * @param {Boolean} [depth=true] - Determines whether the depth buffer should be cleared.
   * @param {Boolean} [stencil=false] - Determines whether the stencil buffer should be cleared.
   */
  constructor(color2 = true, depth = true, stencil = false) {
    super("ClearPass", null, null);
    this.needsSwap = false;
    this.color = color2;
    this.depth = depth;
    this.stencil = stencil;
    this.overrideClearColor = null;
    this.overrideClearAlpha = -1;
  }
  /**
   * Sets the clear flags.
   *
   * @param {Boolean} color - Whether the color buffer should be cleared.
   * @param {Boolean} depth - Whether the depth buffer should be cleared.
   * @param {Boolean} stencil - Whether the stencil buffer should be cleared.
   */
  setClearFlags(color2, depth, stencil) {
    this.color = color2;
    this.depth = depth;
    this.stencil = stencil;
  }
  /**
   * Returns the override clear color. Default is null.
   *
   * @deprecated Use overrideClearColor instead.
   * @return {Color} The clear color.
   */
  getOverrideClearColor() {
    return this.overrideClearColor;
  }
  /**
   * Sets the override clear color.
   *
   * @deprecated Use overrideClearColor instead.
   * @param {Color} value - The clear color.
   */
  setOverrideClearColor(value) {
    this.overrideClearColor = value;
  }
  /**
   * Returns the override clear alpha. Default is -1.
   *
   * @deprecated Use overrideClearAlpha instead.
   * @return {Number} The clear alpha.
   */
  getOverrideClearAlpha() {
    return this.overrideClearAlpha;
  }
  /**
   * Sets the override clear alpha.
   *
   * @deprecated Use overrideClearAlpha instead.
   * @param {Number} value - The clear alpha.
   */
  setOverrideClearAlpha(value) {
    this.overrideClearAlpha = value;
  }
  /**
   * Clears the input buffer or the screen.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const overrideClearColor = this.overrideClearColor;
    const overrideClearAlpha = this.overrideClearAlpha;
    const clearAlpha = renderer.getClearAlpha();
    const hasOverrideClearColor = overrideClearColor !== null;
    const hasOverrideClearAlpha = overrideClearAlpha >= 0;
    if (hasOverrideClearColor) {
      renderer.getClearColor(color);
      renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ? overrideClearAlpha : clearAlpha);
    } else if (hasOverrideClearAlpha) {
      renderer.setClearAlpha(overrideClearAlpha);
    }
    renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
    renderer.clear(this.color, this.depth, this.stencil);
    if (hasOverrideClearColor) {
      renderer.setClearColor(color, clearAlpha);
    } else if (hasOverrideClearAlpha) {
      renderer.setClearAlpha(clearAlpha);
    }
  }
};
var MaskPass = class extends Pass {
  /**
   * Constructs a new mask pass.
   *
   * @param {Scene} scene - The scene to render.
   * @param {Camera} camera - The camera to use.
   */
  constructor(scene, camera) {
    super("MaskPass", scene, camera);
    this.needsSwap = false;
    this.clearPass = new ClearPass(false, false, true);
    this.inverse = false;
  }
  set mainScene(value) {
    this.scene = value;
  }
  set mainCamera(value) {
    this.camera = value;
  }
  /**
   * Indicates whether the mask should be inverted.
   *
   * @type {Boolean}
   */
  get inverted() {
    return this.inverse;
  }
  set inverted(value) {
    this.inverse = value;
  }
  /**
   * Indicates whether this pass should clear the stencil buffer.
   *
   * @type {Boolean}
   * @deprecated Use clearPass.enabled instead.
   */
  get clear() {
    return this.clearPass.enabled;
  }
  set clear(value) {
    this.clearPass.enabled = value;
  }
  /**
   * Returns the internal clear pass.
   *
   * @deprecated Use clearPass.enabled instead.
   * @return {ClearPass} The clear pass.
   */
  getClearPass() {
    return this.clearPass;
  }
  /**
   * Indicates whether the mask is inverted.
   *
   * @deprecated Use inverted instead.
   * @return {Boolean} Whether the mask is inverted.
   */
  isInverted() {
    return this.inverted;
  }
  /**
   * Enables or disable mask inversion.
   *
   * @deprecated Use inverted instead.
   * @param {Boolean} value - Whether the mask should be inverted.
   */
  setInverted(value) {
    this.inverted = value;
  }
  /**
   * Renders the effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const context = renderer.getContext();
    const buffers = renderer.state.buffers;
    const scene = this.scene;
    const camera = this.camera;
    const clearPass = this.clearPass;
    const writeValue = this.inverted ? 0 : 1;
    const clearValue = 1 - writeValue;
    buffers.color.setMask(false);
    buffers.depth.setMask(false);
    buffers.color.setLocked(true);
    buffers.depth.setLocked(true);
    buffers.stencil.setTest(true);
    buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295);
    buffers.stencil.setClear(clearValue);
    buffers.stencil.setLocked(true);
    if (this.clearPass.enabled) {
      if (this.renderToScreen) {
        clearPass.render(renderer, null);
      } else {
        clearPass.render(renderer, inputBuffer);
        clearPass.render(renderer, outputBuffer);
      }
    }
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    } else {
      renderer.setRenderTarget(inputBuffer);
      renderer.render(scene, camera);
      renderer.setRenderTarget(outputBuffer);
      renderer.render(scene, camera);
    }
    buffers.color.setLocked(false);
    buffers.depth.setLocked(false);
    buffers.stencil.setLocked(false);
    buffers.stencil.setFunc(context.EQUAL, 1, 4294967295);
    buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    buffers.stencil.setLocked(true);
  }
};
function getSafeSamples(renderer, samples) {
  const gl = renderer.getContext();
  if (samples <= 0 || typeof gl.renderbufferStorageMultisample !== "function") {
    return 0;
  }
  const maxSamples = gl.getParameter(gl.MAX_SAMPLES);
  const safeSamples = Math.min(samples, maxSamples);
  if (safeSamples <= 0) {
    return 0;
  }
  const previousRenderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
  const renderbuffer = gl.createRenderbuffer();
  try {
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, safeSamples, gl.RGBA8, 1, 1);
    return safeSamples;
  } catch (e) {
    return 0;
  } finally {
    gl.bindRenderbuffer(gl.RENDERBUFFER, previousRenderbuffer);
    gl.deleteRenderbuffer(renderbuffer);
  }
}
var MILLISECONDS_TO_SECONDS = 1 / 1e3;
var SECONDS_TO_MILLISECONDS = 1e3;
var Timer = class {
  /**
   * Constructs a new timer.
   */
  constructor() {
    this.startTime = performance.now();
    this.previousTime = 0;
    this.currentTime = 0;
    this._delta = 0;
    this._elapsed = 0;
    this._fixedDelta = 1e3 / 60;
    this.timescale = 1;
    this.useFixedDelta = false;
    this._autoReset = false;
  }
  /**
   * Enables or disables auto reset based on page visibility.
   *
   * If enabled, the timer will be reset when the page becomes visible. This effectively pauses the timer when the page
   * is hidden. Has no effect if the API is not supported.
   *
   * @type {Boolean}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
   */
  get autoReset() {
    return this._autoReset;
  }
  set autoReset(value) {
    if (typeof document !== "undefined" && document.hidden !== void 0) {
      if (value) {
        document.addEventListener("visibilitychange", this);
      } else {
        document.removeEventListener("visibilitychange", this);
      }
      this._autoReset = value;
    }
  }
  get delta() {
    return this._delta * MILLISECONDS_TO_SECONDS;
  }
  get fixedDelta() {
    return this._fixedDelta * MILLISECONDS_TO_SECONDS;
  }
  set fixedDelta(value) {
    this._fixedDelta = value * SECONDS_TO_MILLISECONDS;
  }
  get elapsed() {
    return this._elapsed * MILLISECONDS_TO_SECONDS;
  }
  /**
   * Updates this timer.
   *
   * @param {Boolean} [timestamp] - The current time in milliseconds.
   */
  update(timestamp) {
    if (this.useFixedDelta) {
      this._delta = this.fixedDelta;
    } else {
      this.previousTime = this.currentTime;
      this.currentTime = (timestamp !== void 0 ? timestamp : performance.now()) - this.startTime;
      this._delta = this.currentTime - this.previousTime;
    }
    this._delta *= this.timescale;
    this._elapsed += this._delta;
  }
  /**
   * Resets this timer.
   */
  reset() {
    this._delta = 0;
    this._elapsed = 0;
    this.currentTime = performance.now() - this.startTime;
  }
  getDelta() {
    return this.delta;
  }
  getElapsed() {
    return this.elapsed;
  }
  handleEvent(e) {
    if (!document.hidden) {
      this.currentTime = performance.now() - this.startTime;
    }
  }
  dispose() {
    this.autoReset = false;
  }
};
var EffectComposer$1 = class EffectComposer {
  /**
   * Constructs a new effect composer.
   *
   * @param {WebGLRenderer} renderer - The renderer that should be used.
   * @param {Object} [options] - The options.
   * @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
   * @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
   * @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
   * @param {TextureDataType} [options.frameBufferType=UnsignedByteType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
   */
  constructor(renderer = null, {
    depthBuffer = true,
    stencilBuffer = false,
    multisampling = 0,
    frameBufferType = UnsignedByteType
  } = {}) {
    this.renderer = null;
    this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);
    this.outputBuffer = this.inputBuffer.clone();
    this.copyPass = new CopyPass();
    this.depthRenderTarget = null;
    this.passes = [];
    this.timer = new Timer();
    this.autoRenderToScreen = true;
    this.setRenderer(renderer);
  }
  /**
   * A stable depth texture to be used by depth-aware passes.
   *
   * @type {DepthTexture}
   * @private
   */
  get stableDepthTexture() {
    return this.depthRenderTarget === null ? null : this.depthRenderTarget.depthTexture;
  }
  /**
   * The current amount of samples used for multisample anti-aliasing.
   *
   * @type {Number}
   */
  get multisampling() {
    return this.inputBuffer.samples;
  }
  /**
   * Sets the amount of MSAA samples.
   *
   * Requires WebGL 2. Set to zero to disable multisampling.
   *
   * @type {Number}
   */
  set multisampling(value) {
    const samples = this.renderer === null ? value : getSafeSamples(this.renderer, value);
    if (this.multisampling === samples) {
      return;
    }
    this.inputBuffer.samples = samples;
    this.outputBuffer.samples = samples;
    this.inputBuffer.dispose();
    this.outputBuffer.dispose();
  }
  /**
   * Returns the internal timer.
   *
   * @return {Timer} The timer.
   */
  getTimer() {
    return this.timer;
  }
  /**
   * Returns the renderer.
   *
   * @return {WebGLRenderer} The renderer.
   */
  getRenderer() {
    return this.renderer;
  }
  /**
   * Sets the renderer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   */
  setRenderer(renderer) {
    this.renderer = renderer;
    if (renderer !== null) {
      const size = renderer.getSize(new Vector2());
      const alpha = renderer.getContext().getContextAttributes().alpha;
      const frameBufferType = this.inputBuffer.texture.type;
      if (frameBufferType === UnsignedByteType && renderer.outputColorSpace === SRGBColorSpace) {
        this.inputBuffer.texture.colorSpace = SRGBColorSpace;
        this.outputBuffer.texture.colorSpace = SRGBColorSpace;
        this.inputBuffer.dispose();
        this.outputBuffer.dispose();
      }
      const samples = this.multisampling;
      this.multisampling = samples;
      renderer.autoClear = false;
      this.setSize(size.width, size.height);
      for (const pass of this.passes) {
        pass.initialize(renderer, alpha, frameBufferType);
      }
    }
  }
  /**
   * Replaces the current renderer with the given one.
   *
   * The auto clear mechanism of the provided renderer will be disabled. If the new render size differs from the
   * previous one, all passes will be updated.
   *
   * By default, the DOM element of the current renderer will automatically be removed from its parent node and the DOM
   * element of the new renderer will take its place.
   *
   * @deprecated Use setRenderer instead.
   * @param {WebGLRenderer} renderer - The new renderer.
   * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
   * @return {WebGLRenderer} The old renderer.
   */
  replaceRenderer(renderer, updateDOM = true) {
    const oldRenderer = this.renderer;
    const parent = oldRenderer.domElement.parentNode;
    this.setRenderer(renderer);
    if (updateDOM && parent !== null) {
      parent.removeChild(oldRenderer.domElement);
      parent.appendChild(renderer.domElement);
    }
    return oldRenderer;
  }
  /**
   * Creates a depth texture attachment that will be provided to all passes.
   *
   * To prevent errors or incorrect behavior when the same depth buffer is attached to the input and output buffers,
   * a separate stable depth target is created alongside the ping-pong buffers. All passes receive the stable target's
   * depth texture, which is never used as a render output and therefore cannot create a feedback loop.  The stable
   * texture is populated each frame via blitFramebuffer immediately before the first buffer swap.
   *
   * @private
   */
  createDepthTexture() {
    const inputDepthTexture = new DepthTexture();
    inputDepthTexture.name = "EffectComposer.InputDepth";
    if (this.inputBuffer.stencilBuffer) {
      inputDepthTexture.format = DepthStencilFormat;
      inputDepthTexture.type = UnsignedInt248Type;
    } else {
      inputDepthTexture.type = FloatType;
    }
    const outputDepthTexture = new DepthTexture();
    outputDepthTexture.format = inputDepthTexture.format;
    outputDepthTexture.type = inputDepthTexture.type;
    outputDepthTexture.name = "EffectComposer.OutputDepth";
    const stableDepthTexture = new DepthTexture();
    stableDepthTexture.format = inputDepthTexture.format;
    stableDepthTexture.type = inputDepthTexture.type;
    stableDepthTexture.name = "EffectComposer.StableDepth";
    this.inputBuffer.depthTexture = inputDepthTexture;
    this.outputBuffer.depthTexture = outputDepthTexture;
    this.inputBuffer.dispose();
    this.outputBuffer.dispose();
    const { width, height } = this.inputBuffer;
    this.depthRenderTarget = new WebGLRenderTarget(width, height, {
      depthBuffer: true,
      stencilBuffer: this.inputBuffer.stencilBuffer,
      depthTexture: stableDepthTexture
    });
  }
  /**
   * Copies the depth buffer from the src render target into the stable depth target.
   *
   * @private
   * @param {WebGLRenderTarget} renderTarget - The render target whose depth buffer should be copied.
   */
  blitDepthBuffer(renderTarget) {
    const renderer = this.renderer;
    const depthRenderTarget = this.depthRenderTarget;
    const props = renderer.properties;
    const gl = renderer.getContext();
    renderer.setRenderTarget(depthRenderTarget);
    const srcFBO = props.get(renderTarget).__webglFramebuffer;
    const dstFBO = props.get(depthRenderTarget).__webglFramebuffer;
    const blitMask = renderTarget.stencilBuffer ? gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT : gl.DEPTH_BUFFER_BIT;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFBO);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFBO);
    gl.blitFramebuffer(
      0,
      0,
      renderTarget.width,
      renderTarget.height,
      0,
      0,
      depthRenderTarget.width,
      depthRenderTarget.height,
      blitMask,
      gl.NEAREST
    );
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    renderer.setRenderTarget(null);
  }
  /**
   * Deletes the current depth texture.
   *
   * @private
   */
  deleteDepthTexture() {
    const stableDepthTexture = this.stableDepthTexture;
    for (const pass of this.passes) {
      if (pass.getDepthTexture() === stableDepthTexture) {
        pass.setDepthTexture(null);
      }
    }
    if (this.depthRenderTarget !== null) {
      this.depthRenderTarget.dispose();
      this.depthRenderTarget = null;
    }
    if (this.inputBuffer.depthTexture !== null) {
      this.inputBuffer.depthTexture.dispose();
      this.inputBuffer.depthTexture = null;
    }
    if (this.outputBuffer.depthTexture !== null) {
      this.outputBuffer.depthTexture.dispose();
      this.outputBuffer.depthTexture = null;
    }
  }
  /**
   * Creates a new render target.
   *
   * @private
   * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
   * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
   * @param {Number} type - The frame buffer type.
   * @param {Number} multisampling - The number of samples to use for antialiasing.
   * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
   */
  createBuffer(depthBuffer, stencilBuffer, type, multisampling) {
    const renderer = this.renderer;
    const size = renderer === null ? new Vector2() : renderer.getDrawingBufferSize(new Vector2());
    const renderTarget = new WebGLRenderTarget(size.width, size.height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      samples: multisampling,
      stencilBuffer,
      depthBuffer,
      type
    });
    if (type === UnsignedByteType && renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
      renderTarget.texture.colorSpace = SRGBColorSpace;
    }
    renderTarget.texture.name = "EffectComposer.Buffer";
    renderTarget.texture.generateMipmaps = false;
    return renderTarget;
  }
  /**
   * Can be used to change the main scene for all registered passes and effects.
   *
   * @param {Scene} scene - The scene.
   */
  setMainScene(scene) {
    for (const pass of this.passes) {
      pass.mainScene = scene;
    }
  }
  /**
   * Can be used to change the main camera for all registered passes and effects.
   *
   * @param {Camera} camera - The camera.
   */
  setMainCamera(camera) {
    for (const pass of this.passes) {
      pass.mainCamera = camera;
    }
  }
  /**
   * Adds a pass, optionally at a specific index.
   *
   * @param {Pass} pass - A new pass.
   * @param {Number} [index] - An index at which the pass should be inserted.
   */
  addPass(pass, index) {
    const passes = this.passes;
    const renderer = this.renderer;
    const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());
    const alpha = renderer.getContext().getContextAttributes().alpha;
    const frameBufferType = this.inputBuffer.texture.type;
    pass.renderer = renderer;
    pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
    pass.initialize(renderer, alpha, frameBufferType);
    if (this.autoRenderToScreen) {
      if (passes.length > 0) {
        passes[passes.length - 1].renderToScreen = false;
      }
      if (pass.renderToScreen) {
        this.autoRenderToScreen = false;
      }
    }
    if (index !== void 0) {
      passes.splice(index, 0, pass);
    } else {
      passes.push(pass);
    }
    if (this.autoRenderToScreen) {
      passes[passes.length - 1].renderToScreen = true;
    }
    if (pass.needsDepthTexture || this.depthRenderTarget !== null) {
      if (this.depthRenderTarget === null) {
        this.createDepthTexture();
        for (const existingPass of passes) {
          existingPass.setDepthTexture(this.stableDepthTexture);
        }
      } else {
        pass.setDepthTexture(this.stableDepthTexture);
      }
    }
  }
  /**
   * Removes a pass.
   *
   * @param {Pass} pass - The pass.
   */
  removePass(pass) {
    const passes = this.passes;
    const index = passes.indexOf(pass);
    const exists = index !== -1;
    const removed = exists && passes.splice(index, 1).length > 0;
    if (removed) {
      const stableDepthTexture = this.stableDepthTexture;
      if (stableDepthTexture !== null) {
        const reducer = (a, b) => a || b.needsDepthTexture;
        const depthTextureRequired = passes.reduce(reducer, false);
        if (!depthTextureRequired) {
          if (pass.getDepthTexture() === stableDepthTexture) {
            pass.setDepthTexture(null);
          }
          this.deleteDepthTexture();
        }
      }
      if (this.autoRenderToScreen) {
        if (index === passes.length) {
          pass.renderToScreen = false;
          if (passes.length > 0) {
            passes[passes.length - 1].renderToScreen = true;
          }
        }
      }
    }
  }
  /**
   * Removes all passes.
   */
  removeAllPasses() {
    const passes = this.passes;
    this.deleteDepthTexture();
    if (passes.length > 0) {
      if (this.autoRenderToScreen) {
        passes[passes.length - 1].renderToScreen = false;
      }
      this.passes = [];
    }
  }
  /**
   * Renders all enabled passes in the order in which they were added.
   *
   * @param {Number} [deltaTime] - The time since the last frame in seconds.
   */
  render(deltaTime) {
    const renderer = this.renderer;
    const copyPass = this.copyPass;
    let inputBuffer = this.inputBuffer;
    let outputBuffer = this.outputBuffer;
    let buffer;
    let stencilTest = false;
    if (deltaTime === void 0) {
      this.timer.update();
      deltaTime = this.timer.getDelta();
    }
    for (const pass of this.passes) {
      if (!pass.enabled) {
        continue;
      }
      pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
      if (pass.needsDepthBlit) {
        if (this.depthRenderTarget !== null) {
          this.blitDepthBuffer(inputBuffer);
        }
      }
      if (pass.needsSwap) {
        if (stencilTest) {
          copyPass.renderToScreen = pass.renderToScreen;
          const context = renderer.getContext();
          const stencil = renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
          copyPass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
          stencil.setFunc(context.EQUAL, 1, 4294967295);
        }
        buffer = inputBuffer;
        inputBuffer = outputBuffer;
        outputBuffer = buffer;
      }
      if (pass instanceof MaskPass) {
        stencilTest = true;
      } else if (pass instanceof ClearMaskPass) {
        stencilTest = false;
      }
    }
  }
  /**
   * Sets the size of the buffers, passes and the renderer.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   * @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
   */
  setSize(width, height, updateStyle) {
    const renderer = this.renderer;
    const currentSize = renderer.getSize(new Vector2());
    if (width === void 0 || height === void 0) {
      width = currentSize.width;
      height = currentSize.height;
    }
    if (currentSize.width !== width || currentSize.height !== height) {
      renderer.setSize(width, height, updateStyle);
    }
    const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());
    this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
    this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
    if (this.depthRenderTarget !== null) {
      this.depthRenderTarget.setSize(drawingBufferSize.width, drawingBufferSize.height);
    }
    for (const pass of this.passes) {
      pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
    }
  }
  /**
   * Resets this composer by deleting all passes and creating new buffers.
   */
  reset() {
    this.dispose();
    this.autoRenderToScreen = true;
  }
  /**
   * Disposes this composer and all passes.
   */
  dispose() {
    for (const pass of this.passes) {
      pass.dispose();
    }
    this.deleteDepthTexture();
    this.inputBuffer.dispose();
    this.outputBuffer.dispose();
    this.copyPass.dispose();
    this.timer.dispose();
    this.passes = [];
    Pass.fullscreenGeometry.dispose();
  }
};
var EffectAttribute = {
  NONE: 0,
  DEPTH: 1,
  CONVOLUTION: 2
};
var EffectShaderSection = {
  FRAGMENT_HEAD: "FRAGMENT_HEAD",
  FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
  FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
  VERTEX_HEAD: "VERTEX_HEAD",
  VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"
};
var EffectShaderData = class {
  /**
   * Constructs new shader data.
   */
  constructor() {
    this.shaderParts = /* @__PURE__ */ new Map([
      [EffectShaderSection.FRAGMENT_HEAD, null],
      [EffectShaderSection.FRAGMENT_MAIN_UV, null],
      [EffectShaderSection.FRAGMENT_MAIN_IMAGE, null],
      [EffectShaderSection.VERTEX_HEAD, null],
      [EffectShaderSection.VERTEX_MAIN_SUPPORT, null]
    ]);
    this.defines = /* @__PURE__ */ new Map();
    this.uniforms = /* @__PURE__ */ new Map();
    this.blendModes = /* @__PURE__ */ new Map();
    this.extensions = /* @__PURE__ */ new Set();
    this.attributes = EffectAttribute.NONE;
    this.varyings = /* @__PURE__ */ new Set();
    this.uvTransformation = false;
    this.readDepth = false;
    this.colorSpace = LinearSRGBColorSpace;
  }
};
var workaroundEnabled = false;
var OverrideMaterialManager = class {
  /**
   * Constructs a new override material manager.
   *
   * @param {Material} [material=null] - An override material.
   */
  constructor(material = null) {
    this.originalMaterials = /* @__PURE__ */ new Map();
    this.material = null;
    this.materials = null;
    this.materialsBackSide = null;
    this.materialsDoubleSide = null;
    this.materialsFlatShaded = null;
    this.materialsFlatShadedBackSide = null;
    this.materialsFlatShadedDoubleSide = null;
    this.setMaterial(material);
    this.meshCount = 0;
    this.replaceMaterial = (node) => {
      if (node.isMesh) {
        let materials;
        if (node.material.flatShading) {
          switch (node.material.side) {
            case DoubleSide:
              materials = this.materialsFlatShadedDoubleSide;
              break;
            case BackSide:
              materials = this.materialsFlatShadedBackSide;
              break;
            default:
              materials = this.materialsFlatShaded;
              break;
          }
        } else {
          switch (node.material.side) {
            case DoubleSide:
              materials = this.materialsDoubleSide;
              break;
            case BackSide:
              materials = this.materialsBackSide;
              break;
            default:
              materials = this.materials;
              break;
          }
        }
        this.originalMaterials.set(node, node.material);
        if (node.isSkinnedMesh) {
          node.material = materials[2];
        } else if (node.isInstancedMesh) {
          node.material = materials[1];
        } else {
          node.material = materials[0];
        }
        ++this.meshCount;
      }
    };
  }
  /**
   * Clones the given material.
   *
   * @private
   * @param {Material} material - The material.
   * @return {Material} The cloned material.
   */
  cloneMaterial(material) {
    if (!(material instanceof ShaderMaterial)) {
      return material.clone();
    }
    const uniforms = material.uniforms;
    const textureUniforms = /* @__PURE__ */ new Map();
    for (const key in uniforms) {
      const value = uniforms[key].value;
      if (value.isRenderTargetTexture) {
        uniforms[key].value = null;
        textureUniforms.set(key, value);
      }
    }
    const clone = material.clone();
    for (const entry of textureUniforms) {
      uniforms[entry[0]].value = entry[1];
      clone.uniforms[entry[0]].value = entry[1];
    }
    return clone;
  }
  /**
   * Sets the override material.
   *
   * @param {Material} material - The material.
   */
  setMaterial(material) {
    this.disposeMaterials();
    this.material = material;
    if (material !== null) {
      const materials = this.materials = [
        this.cloneMaterial(material),
        this.cloneMaterial(material),
        this.cloneMaterial(material)
      ];
      for (const m2 of materials) {
        m2.uniforms = Object.assign({}, material.uniforms);
        m2.side = FrontSide;
      }
      materials[2].skinning = true;
      this.materialsBackSide = materials.map((m2) => {
        const c2 = this.cloneMaterial(m2);
        c2.uniforms = Object.assign({}, material.uniforms);
        c2.side = BackSide;
        return c2;
      });
      this.materialsDoubleSide = materials.map((m2) => {
        const c2 = this.cloneMaterial(m2);
        c2.uniforms = Object.assign({}, material.uniforms);
        c2.side = DoubleSide;
        return c2;
      });
      this.materialsFlatShaded = materials.map((m2) => {
        const c2 = this.cloneMaterial(m2);
        c2.uniforms = Object.assign({}, material.uniforms);
        c2.flatShading = true;
        return c2;
      });
      this.materialsFlatShadedBackSide = materials.map((m2) => {
        const c2 = this.cloneMaterial(m2);
        c2.uniforms = Object.assign({}, material.uniforms);
        c2.flatShading = true;
        c2.side = BackSide;
        return c2;
      });
      this.materialsFlatShadedDoubleSide = materials.map((m2) => {
        const c2 = this.cloneMaterial(m2);
        c2.uniforms = Object.assign({}, material.uniforms);
        c2.flatShading = true;
        c2.side = DoubleSide;
        return c2;
      });
    }
  }
  /**
   * Renders the scene with the override material.
   *
   * @private
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Scene} scene - A scene.
   * @param {Camera} camera - A camera.
   */
  render(renderer, scene, camera) {
    const shadowMapEnabled = renderer.shadowMap.enabled;
    renderer.shadowMap.enabled = false;
    if (workaroundEnabled) {
      const originalMaterials = this.originalMaterials;
      this.meshCount = 0;
      scene.traverse(this.replaceMaterial);
      renderer.render(scene, camera);
      for (const entry of originalMaterials) {
        entry[0].material = entry[1];
      }
      if (this.meshCount !== originalMaterials.size) {
        originalMaterials.clear();
      }
    } else {
      const overrideMaterial = scene.overrideMaterial;
      scene.overrideMaterial = this.material;
      renderer.render(scene, camera);
      scene.overrideMaterial = overrideMaterial;
    }
    renderer.shadowMap.enabled = shadowMapEnabled;
  }
  /**
   * Deletes cloned override materials.
   *
   * @private
   */
  disposeMaterials() {
    if (this.material !== null) {
      const materials = this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);
      for (const m2 of materials) {
        m2.dispose();
      }
    }
  }
  /**
   * Performs cleanup tasks.
   */
  dispose() {
    this.originalMaterials.clear();
    this.disposeMaterials();
  }
  /**
   * Indicates whether the override material workaround is enabled.
   *
   * @type {Boolean}
   */
  static get workaroundEnabled() {
    return workaroundEnabled;
  }
  /**
   * Enables or disables the override material workaround globally.
   *
   * This only affects post processing passes and effects.
   *
   * @type {Boolean}
   */
  static set workaroundEnabled(value) {
    workaroundEnabled = value;
  }
};
var AUTO_SIZE = -1;
var Resolution = class extends EventDispatcher {
  /**
   * Constructs a new resolution.
   *
   * @param {Resizable} [resizable=null] - Deprecated. Use `addEventListener("change", listener)` instead.
   * @param {Number} [width=Resolution.AUTO_SIZE] - The preferred width.
   * @param {Number} [height=Resolution.AUTO_SIZE] - The preferred height.
   * @param {Number} [scale=1.0] - A resolution scale.
   */
  constructor(resizable = null, width = AUTO_SIZE, height = AUTO_SIZE, scale = 1) {
    super();
    if (resizable !== null) {
      this.addEventListener("change", () => resizable.setSize(this.baseSize.width, this.baseSize.height));
    }
    this.baseSize = new Vector2(1, 1);
    this.preferredSize = new Vector2(width, height);
    this.target = this.preferredSize;
    this.s = scale;
    this.effectiveSize = new Vector2();
    this.addEventListener("change", () => this.updateEffectiveSize());
    this.updateEffectiveSize();
  }
  /**
   * Calculates the effective size.
   *
   * @private
   */
  updateEffectiveSize() {
    const base = this.baseSize;
    const preferred = this.preferredSize;
    const effective = this.effectiveSize;
    const scale = this.scale;
    if (preferred.width !== AUTO_SIZE) {
      effective.width = preferred.width;
    } else if (preferred.height !== AUTO_SIZE) {
      effective.width = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));
    } else {
      effective.width = Math.round(base.width * scale);
    }
    if (preferred.height !== AUTO_SIZE) {
      effective.height = preferred.height;
    } else if (preferred.width !== AUTO_SIZE) {
      effective.height = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));
    } else {
      effective.height = Math.round(base.height * scale);
    }
  }
  /**
   * The effective width.
   *
   * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
   *
   * @type {Number}
   */
  get width() {
    return this.effectiveSize.width;
  }
  set width(value) {
    this.preferredWidth = value;
  }
  /**
   * The effective height.
   *
   * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
   *
   * @type {Number}
   */
  get height() {
    return this.effectiveSize.height;
  }
  set height(value) {
    this.preferredHeight = value;
  }
  /**
   * Returns the effective width.
   *
   * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
   *
   * @deprecated Use width instead.
   * @return {Number} The effective width.
   */
  getWidth() {
    return this.width;
  }
  /**
   * Returns the effective height.
   *
   * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
   *
   * @deprecated Use height instead.
   * @return {Number} The effective height.
   */
  getHeight() {
    return this.height;
  }
  /**
   * The resolution scale.
   *
   * @type {Number}
   */
  get scale() {
    return this.s;
  }
  set scale(value) {
    if (this.s !== value) {
      this.s = value;
      this.preferredSize.setScalar(AUTO_SIZE);
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Returns the current resolution scale.
   *
   * @deprecated Use scale instead.
   * @return {Number} The scale.
   */
  getScale() {
    return this.scale;
  }
  /**
   * Sets the resolution scale.
   *
   * Also sets the preferred resolution to {@link Resizer.AUTO_SIZE}.
   *
   * @deprecated Use scale instead.
   * @param {Number} value - The scale.
   */
  setScale(value) {
    this.scale = value;
  }
  /**
   * The base width.
   *
   * @type {Number}
   */
  get baseWidth() {
    return this.baseSize.width;
  }
  set baseWidth(value) {
    if (this.baseSize.width !== value) {
      this.baseSize.width = value;
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Returns the base width.
   *
   * @deprecated Use baseWidth instead.
   * @return {Number} The base width.
   */
  getBaseWidth() {
    return this.baseWidth;
  }
  /**
   * Sets the base width.
   *
   * @deprecated Use baseWidth instead.
   * @param {Number} value - The width.
   */
  setBaseWidth(value) {
    this.baseWidth = value;
  }
  /**
   * The base height.
   *
   * @type {Number}
   */
  get baseHeight() {
    return this.baseSize.height;
  }
  set baseHeight(value) {
    if (this.baseSize.height !== value) {
      this.baseSize.height = value;
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Returns the base height.
   *
   * @deprecated Use baseHeight instead.
   * @return {Number} The base height.
   */
  getBaseHeight() {
    return this.baseHeight;
  }
  /**
   * Sets the base height.
   *
   * @deprecated Use baseHeight instead.
   * @param {Number} value - The height.
   */
  setBaseHeight(value) {
    this.baseHeight = value;
  }
  /**
   * Sets the base size.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setBaseSize(width, height) {
    if (this.baseSize.width !== width || this.baseSize.height !== height) {
      this.baseSize.set(width, height);
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * The preferred width.
   *
   * @type {Number}
   */
  get preferredWidth() {
    return this.preferredSize.width;
  }
  set preferredWidth(value) {
    if (this.preferredSize.width !== value) {
      this.preferredSize.width = value;
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Returns the preferred width.
   *
   * @deprecated Use preferredWidth instead.
   * @return {Number} The preferred width.
   */
  getPreferredWidth() {
    return this.preferredWidth;
  }
  /**
   * Sets the preferred width.
   *
   * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based on the height and aspect ratio.
   *
   * @deprecated Use preferredWidth instead.
   * @param {Number} value - The width.
   */
  setPreferredWidth(value) {
    this.preferredWidth = value;
  }
  /**
   * The preferred height.
   *
   * @type {Number}
   */
  get preferredHeight() {
    return this.preferredSize.height;
  }
  set preferredHeight(value) {
    if (this.preferredSize.height !== value) {
      this.preferredSize.height = value;
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Returns the preferred height.
   *
   * @deprecated Use preferredHeight instead.
   * @return {Number} The preferred height.
   */
  getPreferredHeight() {
    return this.preferredHeight;
  }
  /**
   * Sets the preferred height.
   *
   * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based on the width and aspect ratio.
   *
   * @deprecated Use preferredHeight instead.
   * @param {Number} value - The height.
   */
  setPreferredHeight(value) {
    this.preferredHeight = value;
  }
  /**
   * Sets the preferred size.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setPreferredSize(width, height) {
    if (this.preferredSize.width !== width || this.preferredSize.height !== height) {
      this.preferredSize.set(width, height);
      this.dispatchEvent({ type: "change" });
    }
  }
  /**
   * Copies the given resolution.
   *
   * @param {Resolution} resolution - The resolution.
   */
  copy(resolution) {
    this.s = resolution.scale;
    this.baseSize.set(resolution.baseWidth, resolution.baseHeight);
    this.preferredSize.set(resolution.preferredWidth, resolution.preferredHeight);
    this.dispatchEvent({ type: "change" });
  }
  /**
   * An auto sizing constant.
   *
   * Can be used to automatically calculate the width or height based on the original aspect ratio.
   *
   * @type {Number}
   */
  static get AUTO_SIZE() {
    return AUTO_SIZE;
  }
};
var BlendFunction = {
  ADD: 0,
  ALPHA: 1,
  AVERAGE: 2,
  COLOR: 3,
  COLOR_BURN: 4,
  COLOR_DODGE: 5,
  DARKEN: 6,
  DIFFERENCE: 7,
  DIVIDE: 8,
  DST: 9,
  EXCLUSION: 10,
  HARD_LIGHT: 11,
  HARD_MIX: 12,
  HUE: 13,
  INVERT: 14,
  INVERT_RGB: 15,
  LIGHTEN: 16,
  LINEAR_BURN: 17,
  LINEAR_DODGE: 18,
  LINEAR_LIGHT: 19,
  LUMINOSITY: 20,
  MULTIPLY: 21,
  NEGATION: 22,
  NORMAL: 23,
  OVERLAY: 24,
  PIN_LIGHT: 25,
  REFLECT: 26,
  SATURATION: 27,
  SCREEN: 28,
  SOFT_LIGHT: 29,
  SRC: 30,
  SUBTRACT: 31,
  VIVID_LIGHT: 32
};
var add_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var alpha_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}`;
var average_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var color_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var color_burn_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var color_dodge_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var darken_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var difference_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var divide_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var exclusion_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var hard_light_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var hard_mix_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var hue_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var invert_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var invert_rgb_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var lighten_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var linear_burn_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var linear_dodge_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var linear_light_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var luminosity_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var multiply_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var negation_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var normal_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}`;
var overlay_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var pin_light_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var reflect_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var saturation_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var screen_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var soft_light_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var src_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}`;
var subtract_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var vivid_light_default = `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`;
var blendFunctions = /* @__PURE__ */ new Map([
  [BlendFunction.ADD, add_default],
  [BlendFunction.ALPHA, alpha_default],
  [BlendFunction.AVERAGE, average_default],
  [BlendFunction.COLOR, color_default],
  [BlendFunction.COLOR_BURN, color_burn_default],
  [BlendFunction.COLOR_DODGE, color_dodge_default],
  [BlendFunction.DARKEN, darken_default],
  [BlendFunction.DIFFERENCE, difference_default],
  [BlendFunction.DIVIDE, divide_default],
  [BlendFunction.DST, null],
  [BlendFunction.EXCLUSION, exclusion_default],
  [BlendFunction.HARD_LIGHT, hard_light_default],
  [BlendFunction.HARD_MIX, hard_mix_default],
  [BlendFunction.HUE, hue_default],
  [BlendFunction.INVERT, invert_default],
  [BlendFunction.INVERT_RGB, invert_rgb_default],
  [BlendFunction.LIGHTEN, lighten_default],
  [BlendFunction.LINEAR_BURN, linear_burn_default],
  [BlendFunction.LINEAR_DODGE, linear_dodge_default],
  [BlendFunction.LINEAR_LIGHT, linear_light_default],
  [BlendFunction.LUMINOSITY, luminosity_default],
  [BlendFunction.MULTIPLY, multiply_default],
  [BlendFunction.NEGATION, negation_default],
  [BlendFunction.NORMAL, normal_default],
  [BlendFunction.OVERLAY, overlay_default],
  [BlendFunction.PIN_LIGHT, pin_light_default],
  [BlendFunction.REFLECT, reflect_default],
  [BlendFunction.SATURATION, saturation_default],
  [BlendFunction.SCREEN, screen_default],
  [BlendFunction.SOFT_LIGHT, soft_light_default],
  [BlendFunction.SRC, src_default],
  [BlendFunction.SUBTRACT, subtract_default],
  [BlendFunction.VIVID_LIGHT, vivid_light_default]
]);
var BlendMode = class extends EventDispatcher {
  /**
   * Constructs a new blend mode.
   *
   * @param {BlendFunction} blendFunction - The blend function.
   * @param {Number} opacity - The opacity of the color that will be blended with the base color.
   */
  constructor(blendFunction, opacity = 1) {
    super();
    this._blendFunction = blendFunction;
    this.opacity = new Uniform(opacity);
  }
  /**
   * Returns the opacity.
   *
   * @return {Number} The opacity.
   */
  getOpacity() {
    return this.opacity.value;
  }
  /**
   * Sets the opacity.
   *
   * @param {Number} value - The opacity.
   */
  setOpacity(value) {
    this.opacity.value = value;
  }
  /**
   * The blend function.
   *
   * @type {BlendFunction}
   */
  get blendFunction() {
    return this._blendFunction;
  }
  set blendFunction(value) {
    this._blendFunction = value;
    this.dispatchEvent({ type: "change" });
  }
  /**
   * Returns the blend function.
   *
   * @deprecated Use blendFunction instead.
   * @return {BlendFunction} The blend function.
   */
  getBlendFunction() {
    return this.blendFunction;
  }
  /**
   * Sets the blend function.
   *
   * @deprecated Use blendFunction instead.
   * @param {BlendFunction} value - The blend function.
   */
  setBlendFunction(value) {
    this.blendFunction = value;
  }
  /**
   * Returns the blend function shader code.
   *
   * @return {String} The blend function shader code.
   */
  getShaderCode() {
    return blendFunctions.get(this.blendFunction);
  }
};
var Effect = class extends EventDispatcher {
  /**
   * Constructs a new effect.
   *
   * @param {String} name - The name of this effect. Doesn't have to be unique.
   * @param {String} fragmentShader - The fragment shader. This shader is required.
   * @param {Object} [options] - Additional options.
   * @param {EffectAttribute} [options.attributes=EffectAttribute.NONE] - The effect attributes that determine the execution priority and resource requirements.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
   * @param {Map<String, String>} [options.defines] - Custom preprocessor macro definitions. Keys are names and values are code.
   * @param {Map<String, Uniform>} [options.uniforms] - Custom shader uniforms. Keys are names and values are uniforms.
   * @param {Set<WebGLExtension>} [options.extensions] - WebGL extensions.
   * @param {String} [options.vertexShader=null] - The vertex shader. Most effects don't need one.
   */
  constructor(name, fragmentShader, {
    attributes = EffectAttribute.NONE,
    blendFunction = BlendFunction.NORMAL,
    defines = /* @__PURE__ */ new Map(),
    uniforms = /* @__PURE__ */ new Map(),
    extensions = null,
    vertexShader = null
  } = {}) {
    super();
    this.name = name;
    this.renderer = null;
    this.attributes = attributes;
    this.fragmentShader = fragmentShader;
    this.vertexShader = vertexShader;
    this.defines = defines;
    this.uniforms = uniforms;
    this.extensions = extensions;
    this.blendMode = new BlendMode(blendFunction);
    this.blendMode.addEventListener("change", (event) => this.setChanged());
    this._inputColorSpace = LinearSRGBColorSpace;
    this._outputColorSpace = NoColorSpace;
  }
  /**
   * The input color space.
   *
   * @type {ColorSpace}
   * @experimental
   */
  get inputColorSpace() {
    return this._inputColorSpace;
  }
  /**
   * @type {ColorSpace}
   * @protected
   * @experimental
   */
  set inputColorSpace(value) {
    this._inputColorSpace = value;
    this.setChanged();
  }
  /**
   * The output color space.
   *
   * Should only be changed if this effect converts the input colors to a different color space.
   *
   * @type {ColorSpace}
   * @experimental
   */
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  /**
   * @type {ColorSpace}
   * @protected
   * @experimental
   */
  set outputColorSpace(value) {
    this._outputColorSpace = value;
    this.setChanged();
  }
  /**
   * Sets the main scene.
   *
   * @type {Scene}
   */
  set mainScene(value) {
  }
  /**
   * Sets the main camera.
   *
   * @type {Camera}
   */
  set mainCamera(value) {
  }
  /**
   * Returns the name of this effect.
   *
   * @deprecated Use name instead.
   * @return {String} The name.
   */
  getName() {
    return this.name;
  }
  /**
   * Sets the renderer.
   *
   * @deprecated
   * @param {WebGLRenderer} renderer - The renderer.
   */
  setRenderer(renderer) {
    this.renderer = renderer;
  }
  /**
   * Returns the preprocessor macro definitions.
   *
   * @deprecated Use defines instead.
   * @return {Map<String, String>} The extensions.
   */
  getDefines() {
    return this.defines;
  }
  /**
   * Returns the uniforms of this effect.
   *
   * @deprecated Use uniforms instead.
   * @return {Map<String, Uniform>} The extensions.
   */
  getUniforms() {
    return this.uniforms;
  }
  /**
   * Returns the WebGL extensions that are required by this effect.
   *
   * @deprecated Use extensions instead.
   * @return {Set<WebGLExtension>} The extensions.
   */
  getExtensions() {
    return this.extensions;
  }
  /**
   * Returns the blend mode.
   *
   * The result of this effect will be blended with the result of the previous effect using this blend mode.
   *
   * @deprecated Use blendMode instead.
   * @return {BlendMode} The blend mode.
   */
  getBlendMode() {
    return this.blendMode;
  }
  /**
   * Returns the effect attributes.
   *
   * @return {EffectAttribute} The attributes.
   */
  getAttributes() {
    return this.attributes;
  }
  /**
   * Sets the effect attributes.
   *
   * Effects that have the same attributes will be executed in the order in which they were registered. Some attributes
   * imply a higher priority.
   *
   * @protected
   * @param {EffectAttribute} attributes - The attributes.
   */
  setAttributes(attributes) {
    this.attributes = attributes;
    this.setChanged();
  }
  /**
   * Returns the fragment shader.
   *
   * @return {String} The fragment shader.
   */
  getFragmentShader() {
    return this.fragmentShader;
  }
  /**
   * Sets the fragment shader.
   *
   * @protected
   * @param {String} fragmentShader - The fragment shader.
   */
  setFragmentShader(fragmentShader) {
    this.fragmentShader = fragmentShader;
    this.setChanged();
  }
  /**
   * Returns the vertex shader.
   *
   * @return {String} The vertex shader.
   */
  getVertexShader() {
    return this.vertexShader;
  }
  /**
   * Sets the vertex shader.
   *
   * @protected
   * @param {String} vertexShader - The vertex shader.
   */
  setVertexShader(vertexShader) {
    this.vertexShader = vertexShader;
    this.setChanged();
  }
  /**
   * Informs the associated {@link EffectPass} that this effect requires a shader recompilation.
   *
   * Should be called after changing macros or extensions and after adding/removing uniforms.
   *
   * @protected
   */
  setChanged() {
    this.dispatchEvent({ type: "change" });
  }
  /**
   * Sets the depth texture.
   *
   * You may override this method if your effect requires direct access to the depth texture that is bound to the
   * associated {@link EffectPass}.
   *
   * @param {Texture} depthTexture - A depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
   */
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
  }
  /**
   * Updates this effect by performing supporting operations.
   *
   * This method is called by the {@link EffectPass} right before the main fullscreen render operation, even if the
   * blend function is set to `SKIP`.
   *
   * You may override this method if you need to update custom uniforms or render additional off-screen textures.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   */
  update(renderer, inputBuffer, deltaTime) {
  }
  /**
   * Updates the size of this effect.
   *
   * You may override this method if you want to be informed about the size of the backbuffer/canvas.
   * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
  }
  /**
   * Performs initialization tasks.
   *
   * This method is called when the associated {@link EffectPass} is added to an {@link EffectComposer}.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   * @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
   */
  initialize(renderer, alpha, frameBufferType) {
  }
  /**
   * Performs a shallow search for properties that define a dispose method and deletes them.
   *
   * The {@link EffectComposer} calls this method when it is being destroyed.
   */
  dispose() {
    for (const key of Object.keys(this)) {
      const property = this[key];
      const isDisposable = property instanceof WebGLRenderTarget || property instanceof Material || property instanceof Texture || property instanceof Pass;
      if (isDisposable) {
        this[key].dispose();
      }
    }
  }
};
var KernelSize = {
  MEDIUM: 2,
  LARGE: 3
};
var convolution_kawase_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;
#include <colorspace_fragment>
}`;
var convolution_kawase_default2 = `uniform vec4 texelSize;uniform float kernel;uniform float scale;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize.xy*vec2(kernel)+texelSize.zw)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}`;
var kernelPresets = [
  new Float32Array([0, 0]),
  new Float32Array([0, 1, 1]),
  new Float32Array([0, 1, 1, 2]),
  new Float32Array([0, 1, 2, 2, 3]),
  new Float32Array([0, 1, 2, 3, 4, 4, 5]),
  new Float32Array([0, 1, 2, 3, 4, 5, 7, 8, 9, 10])
];
var KawaseBlurMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new convolution material.
   *
   * TODO Remove texelSize param.
   * @param {Vector4} [texelSize] - Deprecated.
   */
  constructor(texelSize = new Vector4()) {
    super({
      name: "KawaseBlurMaterial",
      uniforms: {
        inputBuffer: new Uniform(null),
        texelSize: new Uniform(new Vector4()),
        scale: new Uniform(1),
        kernel: new Uniform(0)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: convolution_kawase_default,
      vertexShader: convolution_kawase_default2
    });
    this.setTexelSize(texelSize.x, texelSize.y);
    this.kernelSize = KernelSize.MEDIUM;
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Texture} value - The input buffer.
   */
  setInputBuffer(value) {
    this.inputBuffer = value;
  }
  /**
   * The kernel sequence for the current kernel size.
   *
   * @type {Float32Array}
   */
  get kernelSequence() {
    return kernelPresets[this.kernelSize];
  }
  /**
   * The blur scale.
   *
   * @type {Number}
   */
  get scale() {
    return this.uniforms.scale.value;
  }
  set scale(value) {
    this.uniforms.scale.value = value;
  }
  /**
   * Returns the blur scale.
   *
   * @deprecated Use scale instead.
   * @return {Number} The scale.
   */
  getScale() {
    return this.uniforms.scale.value;
  }
  /**
   * Sets the blur scale.
   *
   * @deprecated Use scale instead.
   * @return {Number} value - The scale.
   */
  setScale(value) {
    this.uniforms.scale.value = value;
  }
  /**
   * Returns the kernel.
   *
   * @return {Float32Array} The kernel.
   * @deprecated Implementation detail, removed with no replacement.
   */
  getKernel() {
    return null;
  }
  /**
   * The current kernel.
   *
   * @type {Number}
   */
  get kernel() {
    return this.uniforms.kernel.value;
  }
  set kernel(value) {
    this.uniforms.kernel.value = value;
  }
  /**
   * Sets the current kernel.
   *
   * @deprecated Use kernel instead.
   * @param {Number} value - The kernel.
   */
  setKernel(value) {
    this.kernel = value;
  }
  /**
   * Sets the texel size.
   *
   * @deprecated Use setSize() instead.
   * @param {Number} x - The texel width.
   * @param {Number} y - The texel height.
   */
  setTexelSize(x, y) {
    this.uniforms.texelSize.value.set(x, y, x * 0.5, y * 0.5);
  }
  /**
   * Sets the size of this object.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const x = 1 / width, y = 1 / height;
    this.uniforms.texelSize.value.set(x, y, x * 0.5, y * 0.5);
  }
};
var KawaseBlurPass = class extends Pass {
  /**
   * Constructs a new Kawase blur pass.
   *
   * @param {Object} [options] - The options.
   * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
   * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
   */
  constructor({
    kernelSize = KernelSize.MEDIUM,
    resolutionScale = 0.5,
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionX = width,
    resolutionY = height
  } = {}) {
    super("KawaseBlurPass");
    this.renderTargetA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.renderTargetA.texture.name = "Blur.Target.A";
    this.renderTargetB = this.renderTargetA.clone();
    this.renderTargetB.texture.name = "Blur.Target.B";
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
    this._blurMaterial = new KawaseBlurMaterial();
    this._blurMaterial.kernelSize = kernelSize;
    this.copyMaterial = new CopyMaterial();
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * The blur material.
   *
   * @type {KawaseBlurMaterial}
   */
  get blurMaterial() {
    return this._blurMaterial;
  }
  /**
   * The blur material.
   *
   * @type {KawaseBlurMaterial}
   * @protected
   */
  set blurMaterial(value) {
    this._blurMaterial = value;
  }
  /**
   * Indicates whether dithering is enabled.
   *
   * @type {Boolean}
   * @deprecated Use copyMaterial.dithering instead.
   */
  get dithering() {
    return this.copyMaterial.dithering;
  }
  set dithering(value) {
    this.copyMaterial.dithering = value;
  }
  /**
   * The kernel size.
   *
   * @type {KernelSize}
   * @deprecated Use blurMaterial.kernelSize instead.
   */
  get kernelSize() {
    return this.blurMaterial.kernelSize;
  }
  set kernelSize(value) {
    this.blurMaterial.kernelSize = value;
  }
  /**
   * The current width of the internal render targets.
   *
   * @type {Number}
   * @deprecated Use resolution.width instead.
   */
  get width() {
    return this.resolution.width;
  }
  /**
   * Sets the render width.
   *
   * @type {Number}
   * @deprecated Use resolution.preferredWidth instead.
   */
  set width(value) {
    this.resolution.preferredWidth = value;
  }
  /**
   * The current height of the internal render targets.
   *
   * @type {Number}
   * @deprecated Use resolution.height instead.
   */
  get height() {
    return this.resolution.height;
  }
  /**
   * Sets the render height.
   *
   * @type {Number}
   * @deprecated Use resolution.preferredHeight instead.
   */
  set height(value) {
    this.resolution.preferredHeight = value;
  }
  /**
   * The current blur scale.
   *
   * @type {Number}
   * @deprecated Use blurMaterial.scale instead.
   */
  get scale() {
    return this.blurMaterial.scale;
  }
  set scale(value) {
    this.blurMaterial.scale = value;
  }
  /**
   * Returns the current blur scale.
   *
   * @deprecated Use blurMaterial.scale instead.
   * @return {Number} The scale.
   */
  getScale() {
    return this.blurMaterial.scale;
  }
  /**
   * Sets the blur scale.
   *
   * @deprecated Use blurMaterial.scale instead.
   * @param {Number} value - The scale.
   */
  setScale(value) {
    this.blurMaterial.scale = value;
  }
  /**
   * Returns the kernel size.
   *
   * @deprecated Use blurMaterial.kernelSize instead.
   * @return {KernelSize} The kernel size.
   */
  getKernelSize() {
    return this.kernelSize;
  }
  /**
   * Sets the kernel size.
   *
   * Larger kernels require more processing power but scale well with larger render resolutions.
   *
   * @deprecated Use blurMaterial.kernelSize instead.
   * @param {KernelSize} value - The kernel size.
   */
  setKernelSize(value) {
    this.kernelSize = value;
  }
  /**
   * Returns the current resolution scale.
   *
   * @return {Number} The resolution scale.
   * @deprecated Use resolution instead.
   */
  getResolutionScale() {
    return this.resolution.scale;
  }
  /**
   * Sets the resolution scale.
   *
   * @param {Number} scale - The new resolution scale.
   * @deprecated Use resolution instead.
   */
  setResolutionScale(scale) {
    this.resolution.scale = scale;
  }
  /**
   * Renders the blur.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const scene = this.scene;
    const camera = this.camera;
    const renderTargetA = this.renderTargetA;
    const renderTargetB = this.renderTargetB;
    const material = this.blurMaterial;
    const kernelSequence = material.kernelSequence;
    let previousBuffer = inputBuffer;
    this.fullscreenMaterial = material;
    for (let i = 0, l = kernelSequence.length; i < l; ++i) {
      const buffer = (i & 1) === 0 ? renderTargetA : renderTargetB;
      material.kernel = kernelSequence[i];
      material.inputBuffer = previousBuffer.texture;
      renderer.setRenderTarget(buffer);
      renderer.render(scene, camera);
      previousBuffer = buffer;
    }
    this.fullscreenMaterial = this.copyMaterial;
    this.copyMaterial.inputBuffer = previousBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
    renderer.render(scene, camera);
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    const w = resolution.width, h = resolution.height;
    this.renderTargetA.setSize(w, h);
    this.renderTargetB.setSize(w, h);
    this.blurMaterial.setSize(width, height);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    if (frameBufferType !== void 0) {
      this.renderTargetA.texture.type = frameBufferType;
      this.renderTargetB.texture.type = frameBufferType;
      if (frameBufferType !== UnsignedByteType) {
        this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
        this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
      } else if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
        this.renderTargetA.texture.colorSpace = SRGBColorSpace;
        this.renderTargetB.texture.colorSpace = SRGBColorSpace;
      }
    }
  }
  /**
   * An auto sizing flag.
   *
   * @type {Number}
   * @deprecated Use {@link Resolution.AUTO_SIZE} instead.
   */
  static get AUTO_SIZE() {
    return Resolution.AUTO_SIZE;
  }
};
var luminance_default = `#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);float mask=1.0;
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);mask=low*high;
#elif defined(THRESHOLD)
mask=smoothstep(threshold,threshold+smoothing,l);
#endif
#ifdef COLOR
gl_FragColor=texel*mask;
#else
gl_FragColor=vec4(l*mask);
#endif
}`;
var LuminanceMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new luminance material.
   *
   * @param {Boolean} [colorOutput=false] - Defines whether the shader should output colors scaled with their luminance value.
   * @param {Vector2} [luminanceRange] - If provided, the shader will mask out texels that aren't in the specified luminance range.
   */
  constructor(colorOutput = false, luminanceRange = null) {
    super({
      name: "LuminanceMaterial",
      defines: {
        THREE_REVISION: REVISION.replace(/\D+/g, "")
      },
      uniforms: {
        inputBuffer: new Uniform(null),
        threshold: new Uniform(0),
        smoothing: new Uniform(1),
        range: new Uniform(null)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: luminance_default,
      vertexShader: common_default
    });
    this.colorOutput = colorOutput;
    this.luminanceRange = luminanceRange;
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Texture} value - The input buffer.
   */
  setInputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * The luminance threshold.
   *
   * @type {Number}
   */
  get threshold() {
    return this.uniforms.threshold.value;
  }
  set threshold(value) {
    if (this.smoothing > 0 || value > 0) {
      this.defines.THRESHOLD = "1";
    } else {
      delete this.defines.THRESHOLD;
    }
    this.uniforms.threshold.value = value;
  }
  /**
   * Returns the luminance threshold.
   *
   * @deprecated Use threshold instead.
   * @return {Number} The threshold.
   */
  getThreshold() {
    return this.threshold;
  }
  /**
   * Sets the luminance threshold.
   *
   * @deprecated Use threshold instead.
   * @param {Number} value - The threshold.
   */
  setThreshold(value) {
    this.threshold = value;
  }
  /**
   * The luminance threshold smoothing.
   *
   * @type {Number}
   */
  get smoothing() {
    return this.uniforms.smoothing.value;
  }
  set smoothing(value) {
    if (this.threshold > 0 || value > 0) {
      this.defines.THRESHOLD = "1";
    } else {
      delete this.defines.THRESHOLD;
    }
    this.uniforms.smoothing.value = value;
  }
  /**
   * Returns the luminance threshold smoothing factor.
   *
   * @deprecated Use smoothing instead.
   * @return {Number} The smoothing factor.
   */
  getSmoothingFactor() {
    return this.smoothing;
  }
  /**
   * Sets the luminance threshold smoothing factor.
   *
   * @deprecated Use smoothing instead.
   * @param {Number} value - The smoothing factor.
   */
  setSmoothingFactor(value) {
    this.smoothing = value;
  }
  /**
   * Indicates whether the luminance threshold is enabled.
   *
   * @type {Boolean}
   * @deprecated Adjust the threshold or smoothing factor instead.
   */
  get useThreshold() {
    return this.threshold > 0 || this.smoothing > 0;
  }
  set useThreshold(value) {
  }
  /**
   * Indicates whether color output is enabled.
   *
   * @type {Boolean}
   */
  get colorOutput() {
    return this.defines.COLOR !== void 0;
  }
  set colorOutput(value) {
    if (value) {
      this.defines.COLOR = "1";
    } else {
      delete this.defines.COLOR;
    }
    this.needsUpdate = true;
  }
  /**
   * Indicates whether color output is enabled.
   *
   * @deprecated Use colorOutput instead.
   * @return {Boolean} Whether color output is enabled.
   */
  isColorOutputEnabled(value) {
    return this.colorOutput;
  }
  /**
   * Enables or disables color output.
   *
   * @deprecated Use colorOutput instead.
   * @param {Boolean} value - Whether color output should be enabled.
   */
  setColorOutputEnabled(value) {
    this.colorOutput = value;
  }
  /**
   * Indicates whether luminance masking is enabled.
   *
   * @type {Boolean}
   * @deprecated
   */
  get useRange() {
    return this.luminanceRange !== null;
  }
  set useRange(value) {
    this.luminanceRange = null;
  }
  /**
   * The luminance range. Set to null to disable.
   *
   * @type {Boolean}
   */
  get luminanceRange() {
    return this.uniforms.range.value;
  }
  set luminanceRange(value) {
    if (value !== null) {
      this.defines.RANGE = "1";
    } else {
      delete this.defines.RANGE;
    }
    this.uniforms.range.value = value;
    this.needsUpdate = true;
  }
  /**
   * Returns the current luminance range.
   *
   * @deprecated Use luminanceRange instead.
   * @return {Vector2} The luminance range.
   */
  getLuminanceRange() {
    return this.luminanceRange;
  }
  /**
   * Sets a luminance range. Set to null to disable.
   *
   * @deprecated Use luminanceRange instead.
   * @param {Vector2} value - The luminance range.
   */
  setLuminanceRange(value) {
    this.luminanceRange = value;
  }
};
var LuminancePass = class extends Pass {
  /**
   * Constructs a new luminance pass.
   *
   * @param {Object} [options] - The options. See {@link LuminanceMaterial} for additional options.
   * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
   * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
   */
  constructor({
    renderTarget,
    luminanceRange,
    colorOutput,
    resolutionScale = 1,
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionX = width,
    resolutionY = height
  } = {}) {
    super("LuminancePass");
    this.fullscreenMaterial = new LuminanceMaterial(colorOutput, luminanceRange);
    this.needsSwap = false;
    this.renderTarget = renderTarget;
    if (this.renderTarget === void 0) {
      this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
      this.renderTarget.texture.name = "LuminancePass.Target";
    }
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
  }
  /**
   * The luminance texture.
   *
   * @type {Texture}
   */
  get texture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the luminance texture.
   *
   * @deprecated Use texture instead.
   * @return {Texture} The texture.
   */
  getTexture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * Renders the luminance.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const material = this.fullscreenMaterial;
    material.inputBuffer = inputBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
    renderer.render(this.scene, this.camera);
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    this.renderTarget.setSize(resolution.width, resolution.height);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - A renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    if (frameBufferType !== void 0 && frameBufferType !== UnsignedByteType) {
      this.renderTarget.texture.type = frameBufferType;
      this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
    }
  }
};
var convolution_downsampling_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#define WEIGHT_INNER 0.125
#define WEIGHT_OUTER 0.05556
varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;float clampToBorder(const in vec2 uv){return float(uv.s>=0.0&&uv.s<=1.0&&uv.t>=0.0&&uv.t<=1.0);}void main(){vec4 c=vec4(0.0);vec4 w=WEIGHT_INNER*vec4(clampToBorder(vUv00),clampToBorder(vUv01),clampToBorder(vUv02),clampToBorder(vUv03));c+=w.x*texture2D(inputBuffer,vUv00);c+=w.y*texture2D(inputBuffer,vUv01);c+=w.z*texture2D(inputBuffer,vUv02);c+=w.w*texture2D(inputBuffer,vUv03);w=WEIGHT_OUTER*vec4(clampToBorder(vUv04),clampToBorder(vUv05),clampToBorder(vUv06),clampToBorder(vUv07));c+=w.x*texture2D(inputBuffer,vUv04);c+=w.y*texture2D(inputBuffer,vUv05);c+=w.z*texture2D(inputBuffer,vUv06);c+=w.w*texture2D(inputBuffer,vUv07);w=WEIGHT_OUTER*vec4(clampToBorder(vUv08),clampToBorder(vUv09),clampToBorder(vUv10),clampToBorder(vUv11));c+=w.x*texture2D(inputBuffer,vUv08);c+=w.y*texture2D(inputBuffer,vUv09);c+=w.z*texture2D(inputBuffer,vUv10);c+=w.w*texture2D(inputBuffer,vUv11);c+=WEIGHT_OUTER*texture2D(inputBuffer,vUv);gl_FragColor=c;
#include <colorspace_fragment>
}`;
var convolution_downsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;void main(){vUv=position.xy*0.5+0.5;vUv00=vUv+texelSize*vec2(-1.0,1.0);vUv01=vUv+texelSize*vec2(1.0,1.0);vUv02=vUv+texelSize*vec2(-1.0,-1.0);vUv03=vUv+texelSize*vec2(1.0,-1.0);vUv04=vUv+texelSize*vec2(-2.0,2.0);vUv05=vUv+texelSize*vec2(0.0,2.0);vUv06=vUv+texelSize*vec2(2.0,2.0);vUv07=vUv+texelSize*vec2(-2.0,0.0);vUv08=vUv+texelSize*vec2(2.0,0.0);vUv09=vUv+texelSize*vec2(-2.0,-2.0);vUv10=vUv+texelSize*vec2(0.0,-2.0);vUv11=vUv+texelSize*vec2(2.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}`;
var DownsamplingMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new downsampling material.
   */
  constructor() {
    super({
      name: "DownsamplingMaterial",
      uniforms: {
        inputBuffer: new Uniform(null),
        texelSize: new Uniform(new Vector2())
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: convolution_downsampling_default,
      vertexShader: convolution_downsampling_default2
    });
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the size of this object.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
};
var convolution_upsampling_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;uniform mediump sampler2D supportBuffer;
#else
uniform lowp sampler2D inputBuffer;uniform lowp sampler2D supportBuffer;
#endif
uniform float radius;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vec4 c=vec4(0.0);c+=texture2D(inputBuffer,vUv0)*0.0625;c+=texture2D(inputBuffer,vUv1)*0.125;c+=texture2D(inputBuffer,vUv2)*0.0625;c+=texture2D(inputBuffer,vUv3)*0.125;c+=texture2D(inputBuffer,vUv)*0.25;c+=texture2D(inputBuffer,vUv4)*0.125;c+=texture2D(inputBuffer,vUv5)*0.0625;c+=texture2D(inputBuffer,vUv6)*0.125;c+=texture2D(inputBuffer,vUv7)*0.0625;vec4 baseColor=texture2D(supportBuffer,vUv);gl_FragColor=mix(baseColor,c,radius);
#include <colorspace_fragment>
}`;
var convolution_upsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,1.0);vUv1=vUv+texelSize*vec2(0.0,1.0);vUv2=vUv+texelSize*vec2(1.0,1.0);vUv3=vUv+texelSize*vec2(-1.0,0.0);vUv4=vUv+texelSize*vec2(1.0,0.0);vUv5=vUv+texelSize*vec2(-1.0,-1.0);vUv6=vUv+texelSize*vec2(0.0,-1.0);vUv7=vUv+texelSize*vec2(1.0,-1.0);gl_Position=vec4(position.xy,1.0,1.0);}`;
var UpsamplingMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new upsampling material.
   */
  constructor() {
    super({
      name: "UpsamplingMaterial",
      uniforms: {
        inputBuffer: new Uniform(null),
        supportBuffer: new Uniform(null),
        texelSize: new Uniform(new Vector2()),
        radius: new Uniform(0.85)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: convolution_upsampling_default,
      vertexShader: convolution_upsampling_default2
    });
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * A support buffer.
   *
   * @type {Texture}
   */
  set supportBuffer(value) {
    this.uniforms.supportBuffer.value = value;
  }
  /**
   * The blur radius.
   *
   * @type {Number}
   */
  get radius() {
    return this.uniforms.radius.value;
  }
  set radius(value) {
    this.uniforms.radius.value = value;
  }
  /**
   * Sets the size of this object.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
};
var MipmapBlurPass = class extends Pass {
  /**
   * Constructs a new mipmap blur pass.
   *
   * @param {Object} [options] - The options.
   */
  constructor() {
    super("MipmapBlurPass");
    this.needsSwap = false;
    this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.renderTarget.texture.name = "Upsampling.Mipmap0";
    this.downsamplingMipmaps = [];
    this.upsamplingMipmaps = [];
    this.downsamplingMaterial = new DownsamplingMaterial();
    this.upsamplingMaterial = new UpsamplingMaterial();
    this.resolution = new Vector2();
  }
  /**
   * A texture that contains the blurred result.
   *
   * @type {Texture}
   */
  get texture() {
    return this.renderTarget.texture;
  }
  /**
   * The MIP levels. Default is 8.
   *
   * @type {Number}
   */
  get levels() {
    return this.downsamplingMipmaps.length;
  }
  set levels(value) {
    if (this.levels !== value) {
      const renderTarget = this.renderTarget;
      this.dispose();
      this.downsamplingMipmaps = [];
      this.upsamplingMipmaps = [];
      for (let i = 0; i < value; ++i) {
        const mipmap = renderTarget.clone();
        mipmap.texture.name = "Downsampling.Mipmap" + i;
        this.downsamplingMipmaps.push(mipmap);
      }
      this.upsamplingMipmaps.push(renderTarget);
      for (let i = 1, l = value - 1; i < l; ++i) {
        const mipmap = renderTarget.clone();
        mipmap.texture.name = "Upsampling.Mipmap" + i;
        this.upsamplingMipmaps.push(mipmap);
      }
      this.setSize(this.resolution.x, this.resolution.y);
    }
  }
  /**
   * The blur radius.
   *
   * @type {Number}
   */
  get radius() {
    return this.upsamplingMaterial.radius;
  }
  set radius(value) {
    this.upsamplingMaterial.radius = value;
  }
  /**
   * Renders the blur.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const { scene, camera } = this;
    const { downsamplingMaterial, upsamplingMaterial } = this;
    const { downsamplingMipmaps, upsamplingMipmaps } = this;
    let previousBuffer = inputBuffer;
    this.fullscreenMaterial = downsamplingMaterial;
    for (let i = 0, l = downsamplingMipmaps.length; i < l; ++i) {
      const mipmap = downsamplingMipmaps[i];
      downsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
      downsamplingMaterial.inputBuffer = previousBuffer.texture;
      renderer.setRenderTarget(mipmap);
      renderer.render(scene, camera);
      previousBuffer = mipmap;
    }
    this.fullscreenMaterial = upsamplingMaterial;
    for (let i = upsamplingMipmaps.length - 1; i >= 0; --i) {
      const mipmap = upsamplingMipmaps[i];
      upsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
      upsamplingMaterial.inputBuffer = previousBuffer.texture;
      upsamplingMaterial.supportBuffer = downsamplingMipmaps[i].texture;
      renderer.setRenderTarget(mipmap);
      renderer.render(scene, camera);
      previousBuffer = mipmap;
    }
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.set(width, height);
    let w = resolution.width, h = resolution.height;
    for (let i = 0, l = this.downsamplingMipmaps.length; i < l; ++i) {
      w = Math.round(w * 0.5);
      h = Math.round(h * 0.5);
      this.downsamplingMipmaps[i].setSize(w, h);
      if (i < this.upsamplingMipmaps.length) {
        this.upsamplingMipmaps[i].setSize(w, h);
      }
    }
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    if (frameBufferType !== void 0) {
      const mipmaps = this.downsamplingMipmaps.concat(this.upsamplingMipmaps);
      for (const mipmap of mipmaps) {
        mipmap.texture.type = frameBufferType;
      }
      if (frameBufferType !== UnsignedByteType) {
        this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
        this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
      } else if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
        for (const mipmap of mipmaps) {
          mipmap.texture.colorSpace = SRGBColorSpace;
        }
      }
    }
  }
  /**
   * Deletes internal render targets and textures.
   */
  dispose() {
    super.dispose();
    for (const mipmap of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) {
      mipmap.dispose();
    }
  }
};
var bloom_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv)*intensity;}`;
var BloomEffect = class extends Effect {
  /**
   * Constructs a new bloom effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
   * @param {Number} [options.luminanceThreshold=1.0] - The luminance threshold. Raise this value to mask out darker elements in the scene.
   * @param {Number} [options.luminanceSmoothing=0.03] - Controls the smoothness of the luminance threshold.
   * @param {Boolean} [options.mipmapBlur=true] - Enables or disables mipmap blur.
   * @param {Number} [options.intensity=1.0] - The bloom intensity.
   * @param {Number} [options.radius=0.85] - The blur radius. Only applies to mipmap blur.
   * @param {Number} [options.levels=8] - The amount of MIP levels. Only applies to mipmap blur.
   * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - Deprecated. Use mipmapBlur instead.
   * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use mipmapBlur instead.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
   */
  constructor({
    blendFunction = BlendFunction.SCREEN,
    luminanceThreshold = 1,
    luminanceSmoothing = 0.03,
    mipmapBlur = true,
    intensity = 1,
    radius = 0.85,
    levels = 8,
    kernelSize = KernelSize.LARGE,
    resolutionScale = 0.5,
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionX = width,
    resolutionY = height
  } = {}) {
    super("BloomEffect", bloom_default, {
      blendFunction,
      uniforms: /* @__PURE__ */ new Map([
        ["map", new Uniform(null)],
        ["intensity", new Uniform(intensity)]
      ])
    });
    this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.renderTarget.texture.name = "Bloom.Target";
    this.blurPass = new KawaseBlurPass({ kernelSize });
    this.luminancePass = new LuminancePass({ colorOutput: true });
    this.luminanceMaterial.threshold = luminanceThreshold;
    this.luminanceMaterial.smoothing = luminanceSmoothing;
    this.mipmapBlurPass = new MipmapBlurPass();
    this.mipmapBlurPass.enabled = mipmapBlur;
    this.mipmapBlurPass.radius = radius;
    this.mipmapBlurPass.levels = levels;
    this.uniforms.get("map").value = mipmapBlur ? this.mipmapBlurPass.texture : this.renderTarget.texture;
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
  }
  /**
   * A texture that contains the intermediate result of this effect.
   *
   * @type {Texture}
   */
  get texture() {
    return this.mipmapBlurPass.enabled ? this.mipmapBlurPass.texture : this.renderTarget.texture;
  }
  /**
   * Returns the generated bloom texture.
   *
   * @deprecated Use texture instead.
   * @return {Texture} The texture.
   */
  getTexture() {
    return this.texture;
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * Returns the blur pass.
   *
   * @deprecated
   * @return {KawaseBlurPass} The blur pass.
   */
  getBlurPass() {
    return this.blurPass;
  }
  /**
   * Returns the luminance pass.
   *
   * @deprecated Use luminancePass instead.
   * @return {LuminancePass} The luminance pass.
   */
  getLuminancePass() {
    return this.luminancePass;
  }
  /**
   * The luminance material.
   *
   * @type {LuminanceMaterial}
   */
  get luminanceMaterial() {
    return this.luminancePass.fullscreenMaterial;
  }
  /**
   * Returns the luminance material.
   *
   * @deprecated Use luminanceMaterial instead.
   * @return {LuminanceMaterial} The material.
   */
  getLuminanceMaterial() {
    return this.luminancePass.fullscreenMaterial;
  }
  /**
   * The current width of the internal render targets.
   *
   * @type {Number}
   * @deprecated
   */
  get width() {
    return this.resolution.width;
  }
  set width(value) {
    this.resolution.preferredWidth = value;
  }
  /**
   * The current height of the internal render targets.
   *
   * @type {Number}
   * @deprecated
   */
  get height() {
    return this.resolution.height;
  }
  set height(value) {
    this.resolution.preferredHeight = value;
  }
  /**
   * Indicates whether dithering is enabled.
   *
   * @type {Boolean}
   * @deprecated Use EffectPass.dithering instead.
   */
  get dithering() {
    return this.blurPass.dithering;
  }
  set dithering(value) {
    this.blurPass.dithering = value;
  }
  /**
   * The blur kernel size.
   *
   * @type {KernelSize}
   * @deprecated
   */
  get kernelSize() {
    return this.blurPass.kernelSize;
  }
  set kernelSize(value) {
    this.blurPass.kernelSize = value;
  }
  /**
   * @type {Number}
   * @deprecated
   */
  get distinction() {
    console.warn(this.name, "distinction was removed");
    return 1;
  }
  set distinction(value) {
    console.warn(this.name, "distinction was removed");
  }
  /**
   * The bloom intensity.
   *
   * @type {Number}
   */
  get intensity() {
    return this.uniforms.get("intensity").value;
  }
  set intensity(value) {
    this.uniforms.get("intensity").value = value;
  }
  /**
   * The bloom intensity.
   *
   * @deprecated Use intensity instead.
   * @return {Number} The intensity.
   */
  getIntensity() {
    return this.intensity;
  }
  /**
   * Sets the bloom intensity.
   *
   * @deprecated Use intensity instead.
   * @param {Number} value - The intensity.
   */
  setIntensity(value) {
    this.intensity = value;
  }
  /**
   * Returns the current resolution scale.
   *
   * @return {Number} The resolution scale.
   * @deprecated
   */
  getResolutionScale() {
    return this.resolution.scale;
  }
  /**
   * Sets the resolution scale.
   *
   * @param {Number} scale - The new resolution scale.
   * @deprecated
   */
  setResolutionScale(scale) {
    this.resolution.scale = scale;
  }
  /**
   * Updates this effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   */
  update(renderer, inputBuffer, deltaTime) {
    const renderTarget = this.renderTarget;
    const luminancePass = this.luminancePass;
    if (luminancePass.enabled) {
      luminancePass.render(renderer, inputBuffer);
      if (this.mipmapBlurPass.enabled) {
        this.mipmapBlurPass.render(renderer, luminancePass.renderTarget);
      } else {
        this.blurPass.render(renderer, luminancePass.renderTarget, renderTarget);
      }
    } else {
      if (this.mipmapBlurPass.enabled) {
        this.mipmapBlurPass.render(renderer, inputBuffer);
      } else {
        this.blurPass.render(renderer, inputBuffer, renderTarget);
      }
    }
  }
  /**
   * Updates the size of internal render targets.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    this.renderTarget.setSize(resolution.width, resolution.height);
    this.blurPass.resolution.copy(resolution);
    this.luminancePass.setSize(width, height);
    this.mipmapBlurPass.setSize(width, height);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    this.blurPass.initialize(renderer, alpha, frameBufferType);
    this.luminancePass.initialize(renderer, alpha, frameBufferType);
    this.mipmapBlurPass.initialize(renderer, alpha, frameBufferType);
    if (frameBufferType !== void 0) {
      this.renderTarget.texture.type = frameBufferType;
      if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
        this.renderTarget.texture.colorSpace = SRGBColorSpace;
      }
    }
  }
};
var ColorChannel = {
  RED: 0,
  GREEN: 1
};
var MaskFunction = {
  DISCARD: 0,
  MULTIPLY_RGB_SET_ALPHA: 2,
  MULTIPLY_RGB: 3
};
var convolution_bokeh_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if PASS == 1
uniform vec4 kernel64[32];
#else
uniform vec4 kernel16[8];
#endif
uniform lowp sampler2D cocBuffer;uniform vec2 texelSize;uniform float scale;varying vec2 vUv;void main(){
#ifdef FOREGROUND
vec2 cocNearFar=texture2D(cocBuffer,vUv).rg*scale;float coc=cocNearFar.x;
#else
float coc=texture2D(cocBuffer,vUv).g*scale;
#endif
if(coc==0.0){gl_FragColor=texture2D(inputBuffer,vUv);}else{
#ifdef FOREGROUND
vec2 step=texelSize*max(cocNearFar.x,cocNearFar.y);
#else
vec2 step=texelSize*coc;
#endif
#if PASS == 1
vec4 acc=vec4(0.0);for(int i=0;i<32;++i){vec4 kernel=kernel64[i];vec2 uv=step*kernel.xy+vUv;acc+=texture2D(inputBuffer,uv);uv=step*kernel.zw+vUv;acc+=texture2D(inputBuffer,uv);}gl_FragColor=acc/64.0;
#else
vec4 maxValue=texture2D(inputBuffer,vUv);for(int i=0;i<8;++i){vec4 kernel=kernel16[i];vec2 uv=step*kernel.xy+vUv;maxValue=max(texture2D(inputBuffer,uv),maxValue);uv=step*kernel.zw+vUv;maxValue=max(texture2D(inputBuffer,uv),maxValue);}gl_FragColor=maxValue;
#endif
}}`;
var BokehMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new bokeh material.
   *
   * @param {Boolean} [fill=false] - Enables or disables the bokeh highlight fill mode.
   * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
   */
  constructor(fill = false, foreground = false) {
    super({
      name: "BokehMaterial",
      defines: {
        PASS: fill ? "2" : "1"
      },
      uniforms: {
        inputBuffer: new Uniform(null),
        cocBuffer: new Uniform(null),
        texelSize: new Uniform(new Vector2()),
        kernel64: new Uniform(null),
        kernel16: new Uniform(null),
        scale: new Uniform(1)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: convolution_bokeh_default,
      vertexShader: common_default
    });
    if (foreground) {
      this.defines.FOREGROUND = "1";
    }
    this.generateKernel();
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Texture} value - The buffer.
   */
  setInputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * The circle of confusion buffer.
   *
   * @type {Texture}
   */
  set cocBuffer(value) {
    this.uniforms.cocBuffer.value = value;
  }
  /**
   * Sets the circle of confusion buffer.
   *
   * @deprecated Use cocBuffer instead.
   * @param {Texture} value - The buffer.
   */
  setCoCBuffer(value) {
    this.uniforms.cocBuffer.value = value;
  }
  /**
   * The blur scale.
   *
   * @type {Number}
   */
  get scale() {
    return this.uniforms.scale.value;
  }
  set scale(value) {
    this.uniforms.scale.value = value;
  }
  /**
   * Returns the blur scale.
   *
   * @deprecated Use scale instead.
   * @return {Number} The scale.
   */
  getScale(value) {
    return this.scale;
  }
  /**
   * Sets the blur scale.
   *
   * @deprecated Use scale instead.
   * @param {Number} value - The scale.
   */
  setScale(value) {
    this.scale = value;
  }
  /**
   * Generates the blur kernel.
   *
   * @private
   */
  generateKernel() {
    const GOLDEN_ANGLE = 2.39996323;
    const points64 = new Float64Array(128);
    const points16 = new Float64Array(32);
    let i64 = 0, i16 = 0;
    for (let i = 0, sqrt80 = Math.sqrt(80); i < 80; ++i) {
      const theta = i * GOLDEN_ANGLE;
      const r = Math.sqrt(i) / sqrt80;
      const u = r * Math.cos(theta), v4 = r * Math.sin(theta);
      if (i % 5 === 0) {
        points16[i16++] = u;
        points16[i16++] = v4;
      } else {
        points64[i64++] = u;
        points64[i64++] = v4;
      }
    }
    this.uniforms.kernel64.value = points64;
    this.uniforms.kernel16.value = points16;
  }
  /**
   * Sets the texel size.
   *
   * @deprecated Use setSize() instead.
   * @param {Number} x - The texel width.
   * @param {Number} y - The texel height.
   */
  setTexelSize(x, y) {
    this.uniforms.texelSize.value.set(x, y);
  }
  /**
   * Sets the size of this object.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
};
var circle_of_confusion_default = `#include <common>
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform mat4 projectionMatrix;uniform mat4 projectionMatrixInverse;uniform float cameraNear;uniform float cameraFar;uniform float focusDistance;uniform float focusRange;varying vec2 vUv;float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}
#ifdef PERSPECTIVE_CAMERA
#define getViewZ(depth) perspectiveDepthToViewZ(depth, cameraNear, cameraFar)
#else
#define getViewZ(depth) orthographicDepthToViewZ(depth, cameraNear, cameraFar)
#endif
vec3 getViewPosition(const in vec2 screenPosition,const in float depth,const in float viewZ){vec4 clipPosition=vec4(vec3(screenPosition,depth)*2.0-1.0,1.0);float clipW=projectionMatrix[2][3]*viewZ+projectionMatrix[3][3];clipPosition*=clipW;return(projectionMatrixInverse*clipPosition).xyz;}vec3 getViewPosition(const in vec2 screenPosition,const in float depth){return getViewPosition(screenPosition,depth,getViewZ(depth));}
#define getDistance(viewPosition) length(viewPosition)
void main(){float depth=readDepth(vUv);vec3 viewPosition=getViewPosition(vUv,depth);float distance=getDistance(viewPosition);float signedDistance=distance-focusDistance;float magnitude=smoothstep(0.0,focusRange,abs(signedDistance));gl_FragColor.rg=magnitude*vec2(step(signedDistance,0.0),step(0.0,signedDistance));}`;
var CircleOfConfusionMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new CoC material.
   *
   * @param {Camera} camera - A camera.
   */
  constructor(camera = null) {
    super({
      name: "CircleOfConfusionMaterial",
      defines: {
        DEPTH_PACKING: "0"
      },
      uniforms: {
        depthBuffer: new Uniform(null),
        projectionMatrix: new Uniform(null),
        projectionMatrixInverse: new Uniform(null),
        cameraNear: new Uniform(0.3),
        cameraFar: new Uniform(1e3),
        focusDistance: new Uniform(0),
        focusRange: new Uniform(0)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: circle_of_confusion_default,
      vertexShader: common_default
    });
    this.uniforms.focalLength = this.uniforms.focusRange;
    if (camera !== null) {
      this.copyCameraSettings(camera);
    }
  }
  /**
   * The depth buffer.
   *
   * @type {Texture}
   */
  set depthBuffer(value) {
    this.uniforms.depthBuffer.value = value;
  }
  /**
   * The depth packing strategy.
   *
   * @type {DepthPackingStrategies}
   */
  set depthPacking(value) {
    this.defines.DEPTH_PACKING = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Sets the depth buffer.
   *
   * @deprecated Use depthBuffer and depthPacking instead.
   * @param {Texture} buffer - The depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
   */
  setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {
    this.depthBuffer = buffer;
    this.depthPacking = depthPacking;
  }
  /**
   * The focus distance in world units.
   *
   * @type {Number}
   */
  get focusDistance() {
    return this.uniforms.focusDistance.value;
  }
  set focusDistance(value) {
    this.uniforms.focusDistance.value = value;
  }
  /**
   * The focus distance in world units.
   *
   * @deprecated Use focusDistance instead.
   * @type {Number}
   */
  get worldFocusDistance() {
    return this.focusDistance;
  }
  set worldFocusDistance(value) {
    this.focusDistance = value;
  }
  /**
   * Returns the focus distance.
   *
   * @deprecated Use focusDistance instead.
   * @return {Number} The focus distance.
   */
  getFocusDistance(value) {
    this.uniforms.focusDistance.value = value;
  }
  /**
   * Sets the focus distance.
   *
   * @deprecated Use focusDistance instead.
   * @param {Number} value - The focus distance.
   */
  setFocusDistance(value) {
    this.uniforms.focusDistance.value = value;
  }
  /**
   * The focal length.
   *
   * @deprecated Use focusRange instead.
   * @type {Number}
   */
  get focalLength() {
    return this.focusRange;
  }
  set focalLength(value) {
    this.focusRange = value;
  }
  /**
   * The focus range. Range: [0.0, 1.0].
   *
   * @type {Number}
   */
  get focusRange() {
    return this.uniforms.focusRange.value;
  }
  set focusRange(value) {
    this.uniforms.focusRange.value = value;
  }
  /**
   * The focus range in world units.
   *
   * @deprecated Use focusRange instead.
   * @type {Number}
   */
  get worldFocusRange() {
    return this.focusRange;
  }
  set worldFocusRange(value) {
    this.focusRange = value;
  }
  /**
   * Returns the focal length.
   *
   * @deprecated Use focusRange instead.
   * @return {Number} The focal length.
   */
  getFocalLength(value) {
    return this.focusRange;
  }
  /**
   * Sets the focal length.
   *
   * @deprecated Use focusRange instead.
   * @param {Number} value - The focal length.
   */
  setFocalLength(value) {
    this.focusRange = value;
  }
  /**
   * Copies the settings of the given camera.
   *
   * @deprecated Use copyCameraSettings instead.
   * @param {Camera} camera - A camera.
   */
  adoptCameraSettings(camera) {
    this.copyCameraSettings(camera);
  }
  /**
   * Copies the settings of the given camera.
   *
   * @param {Camera} camera - A camera.
   */
  copyCameraSettings(camera) {
    this.uniforms.projectionMatrix.value = camera.projectionMatrix;
    this.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
    this.uniforms.cameraNear.value = camera.near;
    this.uniforms.cameraFar.value = camera.far;
    const perspectiveCameraDefined = this.defines.PERSPECTIVE_CAMERA !== void 0;
    if (camera instanceof PerspectiveCamera) {
      if (!perspectiveCameraDefined) {
        this.defines.PERSPECTIVE_CAMERA = true;
        this.needsUpdate = true;
      }
    } else if (perspectiveCameraDefined) {
      delete this.defines.PERSPECTIVE_CAMERA;
      this.needsUpdate = true;
    }
  }
};
var mask_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef MASK_PRECISION_HIGH
uniform mediump sampler2D maskTexture;
#else
uniform lowp sampler2D maskTexture;
#endif
#if MASK_FUNCTION != 0
uniform float strength;
#endif
varying vec2 vUv;void main(){
#if COLOR_CHANNEL == 0
float mask=texture2D(maskTexture,vUv).r;
#elif COLOR_CHANNEL == 1
float mask=texture2D(maskTexture,vUv).g;
#elif COLOR_CHANNEL == 2
float mask=texture2D(maskTexture,vUv).b;
#else
float mask=texture2D(maskTexture,vUv).a;
#endif
#if MASK_FUNCTION == 0
#ifdef INVERTED
mask=(mask>0.0)?0.0:1.0;
#else
mask=(mask>0.0)?1.0:0.0;
#endif
#else
mask=clamp(mask*strength,0.0,1.0);
#ifdef INVERTED
mask=1.0-mask;
#endif
#endif
#if MASK_FUNCTION == 3
vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=vec4(mask*texel.rgb,texel.a);
#elif MASK_FUNCTION == 2
gl_FragColor=vec4(mask*texture2D(inputBuffer,vUv).rgb,mask);
#else
gl_FragColor=mask*texture2D(inputBuffer,vUv);
#endif
}`;
var MaskMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new mask material.
   *
   * @param {Texture} [maskTexture] - The mask texture.
   */
  constructor(maskTexture = null) {
    super({
      name: "MaskMaterial",
      uniforms: {
        maskTexture: new Uniform(maskTexture),
        inputBuffer: new Uniform(null),
        strength: new Uniform(1)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: mask_default,
      vertexShader: common_default
    });
    this.colorChannel = ColorChannel.RED;
    this.maskFunction = MaskFunction.DISCARD;
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Texture} value - The input buffer.
   */
  setInputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * The mask texture.
   *
   * @type {Texture}
   */
  set maskTexture(value) {
    this.uniforms.maskTexture.value = value;
    delete this.defines.MASK_PRECISION_HIGH;
    if (value.type !== UnsignedByteType) {
      this.defines.MASK_PRECISION_HIGH = "1";
    }
    this.needsUpdate = true;
  }
  /**
   * Sets the mask texture.
   *
   * @deprecated Use maskTexture instead.
   * @param {Texture} value - The texture.
   */
  setMaskTexture(value) {
    this.maskTexture = value;
  }
  /**
   * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
   *
   * @type {ColorChannel}
   */
  set colorChannel(value) {
    this.defines.COLOR_CHANNEL = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
   *
   * @deprecated Use colorChannel instead.
   * @param {ColorChannel} value - The channel.
   */
  setColorChannel(value) {
    this.colorChannel = value;
  }
  /**
   * The masking technique. Default is `MaskFunction.DISCARD`.
   *
   * @type {MaskFunction}
   */
  set maskFunction(value) {
    this.defines.MASK_FUNCTION = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Sets the masking technique. Default is `MaskFunction.DISCARD`.
   *
   * @deprecated Use maskFunction instead.
   * @param {MaskFunction} value - The function.
   */
  setMaskFunction(value) {
    this.maskFunction = value;
  }
  /**
   * Indicates whether the masking is inverted.
   *
   * @type {Boolean}
   */
  get inverted() {
    return this.defines.INVERTED !== void 0;
  }
  set inverted(value) {
    if (this.inverted && !value) {
      delete this.defines.INVERTED;
    } else if (value) {
      this.defines.INVERTED = "1";
    }
    this.needsUpdate = true;
  }
  /**
   * Indicates whether the masking is inverted.
   *
   * @deprecated Use inverted instead.
   * @return {Boolean} Whether the masking is inverted.
   */
  isInverted() {
    return this.inverted;
  }
  /**
   * Determines whether the masking should be inverted.
   *
   * @deprecated Use inverted instead.
   * @param {Boolean} value - Whether the masking should be inverted.
   */
  setInverted(value) {
    this.inverted = value;
  }
  /**
   * The current mask strength.
   *
   * Individual mask values will be clamped to [0.0, 1.0]. Has no effect when the mask function is set to `DISCARD`.
   *
   * @type {Number}
   */
  get strength() {
    return this.uniforms.strength.value;
  }
  set strength(value) {
    this.uniforms.strength.value = value;
  }
  /**
   * Returns the current mask strength.
   *
   * @deprecated Use strength instead.
   * @return {Number} The mask strength.
   */
  getStrength() {
    return this.strength;
  }
  /**
   * Sets the mask strength.
   *
   * Has no effect when the mask function is set to `DISCARD`.
   *
   * @deprecated Use strength instead.
   * @param {Number} value - The mask strength.
   */
  setStrength(value) {
    this.strength = value;
  }
};
var ShaderPass = class extends Pass {
  /**
   * Constructs a new shader pass.
   *
   * @param {ShaderMaterial} material - A shader material.
   * @param {String} [input="inputBuffer"] - The name of the input buffer uniform.
   */
  constructor(material, input = "inputBuffer") {
    super("ShaderPass");
    this.fullscreenMaterial = material;
    this.input = input;
  }
  /**
   * Sets the name of the input buffer uniform.
   *
   * @param {String} input - The name of the input buffer uniform.
   * @deprecated Use input instead.
   */
  setInput(input) {
    this.input = input;
  }
  /**
   * Renders the effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const uniforms = this.fullscreenMaterial.uniforms;
    if (inputBuffer !== null && uniforms !== void 0 && uniforms[this.input] !== void 0) {
      uniforms[this.input].value = inputBuffer.texture;
    }
    renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
    renderer.render(this.scene, this.camera);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - A renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    if (frameBufferType !== void 0 && frameBufferType !== UnsignedByteType) {
      this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
    }
  }
};
var depth_of_field_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D nearColorBuffer;uniform mediump sampler2D farColorBuffer;
#else
uniform lowp sampler2D nearColorBuffer;uniform lowp sampler2D farColorBuffer;
#endif
#if MASK_FUNCTION != 1 && MASK_FUNCTION != 2
uniform lowp sampler2D farCoCBuffer;
#endif
uniform lowp sampler2D nearCoCBuffer;uniform float scale;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 colorNear=texture2D(nearColorBuffer,uv);vec4 colorFar=texture2D(farColorBuffer,uv);
#if MASK_FUNCTION == 1 || MASK_FUNCTION == 2
vec2 cocNearFar=vec2(texture2D(nearCoCBuffer,uv).r,colorFar.a);cocNearFar.x=min(cocNearFar.x*scale,1.0);
#else
vec2 cocNearFar=vec2(texture2D(nearCoCBuffer,uv).r,texture2D(farCoCBuffer,uv).g);cocNearFar=min(cocNearFar*scale,1.0);colorFar.a*=cocNearFar.y;
#endif
vec4 result=inputColor*(1.0-cocNearFar.y)+colorFar;result=mix(result,colorNear,cocNearFar.x);outputColor=result;}`;
var v = /* @__PURE__ */ new Vector3();
var DepthOfFieldEffect = class extends Effect {
  /**
   * Constructs a new depth of field effect.
   *
   * @param {Camera} camera - The main camera.
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
   * @param {Number} [options.worldFocusDistance] - Deprecated. Use focusRange instead.
   * @param {Number} [options.worldFocusRange] - Deprecated. Use focusRange instead.
   * @param {Number} [options.focusDistance=3.0] - The focus distance in world units.
   * @param {Number} [options.focusRange=2.0] - The focus range in world units.
   * @param {Number} [options.focalLength] - Deprecated. Use focusRange instead.
   * @param {Number} [options.bokehScale=1.0] - The scale of the bokeh blur.
   * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
   */
  constructor(camera, {
    blendFunction,
    worldFocusDistance,
    worldFocusRange,
    focalLength,
    focusDistance = worldFocusDistance || 3,
    focusRange = worldFocusRange || focalLength || 2,
    bokehScale = 1,
    resolutionScale = 0.5,
    width,
    height,
    resolutionX = width || Resolution.AUTO_SIZE,
    resolutionY = height || Resolution.AUTO_SIZE
  } = {}) {
    super("DepthOfFieldEffect", depth_of_field_default, {
      blendFunction,
      attributes: EffectAttribute.DEPTH,
      uniforms: /* @__PURE__ */ new Map([
        ["nearColorBuffer", new Uniform(null)],
        ["farColorBuffer", new Uniform(null)],
        ["nearCoCBuffer", new Uniform(null)],
        ["farCoCBuffer", new Uniform(null)],
        ["scale", new Uniform(1)]
      ])
    });
    this.camera = camera;
    this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.renderTarget.texture.name = "DoF.Intermediate";
    this.renderTargetMasked = this.renderTarget.clone();
    this.renderTargetMasked.texture.name = "DoF.Masked.Far";
    this.renderTargetNear = this.renderTarget.clone();
    this.renderTargetNear.texture.name = "DoF.Bokeh.Near";
    this.uniforms.get("nearColorBuffer").value = this.renderTargetNear.texture;
    this.renderTargetFar = this.renderTarget.clone();
    this.renderTargetFar.texture.name = "DoF.Bokeh.Far";
    this.uniforms.get("farColorBuffer").value = this.renderTargetFar.texture;
    this.renderTargetCoC = this.renderTarget.clone();
    this.renderTargetCoC.texture.name = "DoF.CoC";
    this.uniforms.get("farCoCBuffer").value = this.renderTargetCoC.texture;
    this.renderTargetCoCBlurred = this.renderTargetCoC.clone();
    this.renderTargetCoCBlurred.texture.name = "DoF.CoC.Blurred";
    this.uniforms.get("nearCoCBuffer").value = this.renderTargetCoCBlurred.texture;
    this.cocPass = new ShaderPass(new CircleOfConfusionMaterial(camera));
    const cocMaterial = this.cocMaterial;
    cocMaterial.focusDistance = focusDistance;
    cocMaterial.focusRange = focusRange;
    this.blurPass = new KawaseBlurPass({ resolutionScale, resolutionX, resolutionY, kernelSize: KernelSize.MEDIUM });
    this.maskPass = new ShaderPass(new MaskMaterial(this.renderTargetCoC.texture));
    const maskMaterial = this.maskPass.fullscreenMaterial;
    maskMaterial.colorChannel = ColorChannel.GREEN;
    this.maskFunction = MaskFunction.MULTIPLY_RGB;
    this.bokehNearBasePass = new ShaderPass(new BokehMaterial(false, true));
    this.bokehNearBasePass.fullscreenMaterial.cocBuffer = this.renderTargetCoCBlurred.texture;
    this.bokehNearFillPass = new ShaderPass(new BokehMaterial(true, true));
    this.bokehNearFillPass.fullscreenMaterial.cocBuffer = this.renderTargetCoCBlurred.texture;
    this.bokehFarBasePass = new ShaderPass(new BokehMaterial(false, false));
    this.bokehFarBasePass.fullscreenMaterial.cocBuffer = this.renderTargetCoC.texture;
    this.bokehFarFillPass = new ShaderPass(new BokehMaterial(true, false));
    this.bokehFarFillPass.fullscreenMaterial.cocBuffer = this.renderTargetCoC.texture;
    this.target = null;
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
    this.bokehScale = bokehScale;
  }
  set mainCamera(value) {
    this.camera = value;
    this.cocMaterial.copyCameraSettings(value);
  }
  /**
   * The circle of confusion texture.
   *
   * @type {Texture}
   */
  get cocTexture() {
    return this.renderTargetCoC.texture;
  }
  /**
   * The mask function. Default is `MULTIPLY_RGB`.
   *
   * @type {MaskFunction}
   */
  get maskFunction() {
    return this.maskPass.fullscreenMaterial.maskFunction;
  }
  set maskFunction(value) {
    if (this.maskFunction !== value) {
      this.defines.set("MASK_FUNCTION", value.toFixed(0));
      this.maskPass.fullscreenMaterial.maskFunction = value;
      this.setChanged();
    }
  }
  /**
   * The circle of confusion material.
   *
   * @type {CircleOfConfusionMaterial}
   */
  get cocMaterial() {
    return this.cocPass.fullscreenMaterial;
  }
  /**
   * The circle of confusion material.
   *
   * @deprecated Use cocMaterial instead.
   * @type {CircleOfConfusionMaterial}
   */
  get circleOfConfusionMaterial() {
    return this.cocMaterial;
  }
  /**
   * Returns the circle of confusion material.
   *
   * @deprecated Use cocMaterial instead.
   * @return {CircleOfConfusionMaterial} The material.
   */
  getCircleOfConfusionMaterial() {
    return this.cocMaterial;
  }
  /**
   * Returns the pass that blurs the foreground CoC buffer to soften edges.
   *
   * @deprecated Use blurPass instead.
   * @return {KawaseBlurPass} The blur pass.
   */
  getBlurPass() {
    return this.blurPass;
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * The current bokeh scale.
   *
   * @type {Number}
   */
  get bokehScale() {
    return this.uniforms.get("scale").value;
  }
  set bokehScale(value) {
    this.bokehNearBasePass.fullscreenMaterial.scale = value;
    this.bokehNearFillPass.fullscreenMaterial.scale = value;
    this.bokehFarBasePass.fullscreenMaterial.scale = value;
    this.bokehFarFillPass.fullscreenMaterial.scale = value;
    this.maskPass.fullscreenMaterial.strength = value;
    this.uniforms.get("scale").value = value;
  }
  /**
   * Returns the current bokeh scale.
   *
   * @deprecated Use bokehScale instead.
   * @return {Number} The scale.
   */
  getBokehScale() {
    return this.bokehScale;
  }
  /**
   * Sets the bokeh scale.
   *
   * @deprecated Use bokehScale instead.
   * @param {Number} value - The scale.
   */
  setBokehScale(value) {
    this.bokehScale = value;
  }
  /**
   * Returns the current auto focus target.
   *
   * @deprecated Use target instead.
   * @return {Vector3} The target.
   */
  getTarget() {
    return this.target;
  }
  /**
   * Sets the auto focus target.
   *
   * @deprecated Use target instead.
   * @param {Vector3} value - The target.
   */
  setTarget(value) {
    this.target = value;
  }
  /**
   * Calculates the focus distance from the camera to the given position.
   *
   * @param {Vector3} target - The target.
   * @return {Number} The focus distance in world units.
   */
  calculateFocusDistance(target) {
    return this.camera.getWorldPosition(v).distanceTo(target);
  }
  /**
   * Sets the depth texture.
   *
   * @param {Texture} depthTexture - A depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
   */
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
    this.cocMaterial.depthBuffer = depthTexture;
    this.cocMaterial.depthPacking = depthPacking;
  }
  /**
   * Updates this effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   */
  update(renderer, inputBuffer, deltaTime) {
    const renderTarget = this.renderTarget;
    const renderTargetCoC = this.renderTargetCoC;
    const renderTargetCoCBlurred = this.renderTargetCoCBlurred;
    const renderTargetMasked = this.renderTargetMasked;
    if (this.target !== null) {
      const distance = this.calculateFocusDistance(this.target);
      this.cocMaterial.focusDistance = distance;
    }
    this.cocPass.render(renderer, null, renderTargetCoC);
    this.blurPass.render(renderer, renderTargetCoC, renderTargetCoCBlurred);
    this.maskPass.render(renderer, inputBuffer, renderTargetMasked);
    this.bokehFarBasePass.render(renderer, renderTargetMasked, renderTarget);
    this.bokehFarFillPass.render(renderer, renderTarget, this.renderTargetFar);
    this.bokehNearBasePass.render(renderer, inputBuffer, renderTarget);
    this.bokehNearFillPass.render(renderer, renderTarget, this.renderTargetNear);
  }
  /**
   * Updates the size of internal render targets.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    const w = resolution.width, h = resolution.height;
    this.cocPass.setSize(width, height);
    this.blurPass.setSize(width, height);
    this.maskPass.setSize(width, height);
    this.renderTargetFar.setSize(width, height);
    this.renderTargetCoC.setSize(width, height);
    this.renderTargetMasked.setSize(width, height);
    this.renderTarget.setSize(w, h);
    this.renderTargetNear.setSize(w, h);
    this.renderTargetCoCBlurred.setSize(w, h);
    this.bokehNearBasePass.fullscreenMaterial.setSize(width, height);
    this.bokehNearFillPass.fullscreenMaterial.setSize(width, height);
    this.bokehFarBasePass.fullscreenMaterial.setSize(width, height);
    this.bokehFarFillPass.fullscreenMaterial.setSize(width, height);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    this.cocPass.initialize(renderer, alpha, frameBufferType);
    this.maskPass.initialize(renderer, alpha, frameBufferType);
    this.bokehNearBasePass.initialize(renderer, alpha, frameBufferType);
    this.bokehNearFillPass.initialize(renderer, alpha, frameBufferType);
    this.bokehFarBasePass.initialize(renderer, alpha, frameBufferType);
    this.bokehFarFillPass.initialize(renderer, alpha, frameBufferType);
    this.blurPass.initialize(renderer, alpha, UnsignedByteType);
    if (renderer.capabilities.logarithmicDepthBuffer) {
      this.cocPass.fullscreenMaterial.defines.LOG_DEPTH = "1";
    }
    if (frameBufferType !== void 0) {
      this.renderTarget.texture.type = frameBufferType;
      this.renderTargetNear.texture.type = frameBufferType;
      this.renderTargetFar.texture.type = frameBufferType;
      this.renderTargetMasked.texture.type = frameBufferType;
      if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
        this.renderTarget.texture.colorSpace = SRGBColorSpace;
        this.renderTargetNear.texture.colorSpace = SRGBColorSpace;
        this.renderTargetFar.texture.colorSpace = SRGBColorSpace;
        this.renderTargetMasked.texture.colorSpace = SRGBColorSpace;
      }
    }
  }
};
var RenderPass = class extends Pass {
  /**
   * Constructs a new render pass.
   *
   * @param {Scene} scene - The scene to render.
   * @param {Camera} camera - The camera to use to render the scene.
   * @param {Material} [overrideMaterial=null] - An override material.
   */
  constructor(scene, camera, overrideMaterial = null) {
    super("RenderPass", scene, camera);
    this.needsSwap = false;
    this.needsDepthBlit = true;
    this.clearPass = new ClearPass();
    this.overrideMaterialManager = overrideMaterial === null ? null : new OverrideMaterialManager(overrideMaterial);
    this.ignoreBackground = false;
    this.skipShadowMapUpdate = false;
    this.selection = null;
  }
  set mainScene(value) {
    this.scene = value;
  }
  set mainCamera(value) {
    this.camera = value;
  }
  get renderToScreen() {
    return super.renderToScreen;
  }
  set renderToScreen(value) {
    super.renderToScreen = value;
    this.clearPass.renderToScreen = value;
  }
  /**
   * The current override material.
   *
   * @type {Material}
   */
  get overrideMaterial() {
    const manager = this.overrideMaterialManager;
    return manager !== null ? manager.material : null;
  }
  set overrideMaterial(value) {
    const manager = this.overrideMaterialManager;
    if (value !== null) {
      if (manager !== null) {
        manager.setMaterial(value);
      } else {
        this.overrideMaterialManager = new OverrideMaterialManager(value);
      }
    } else if (manager !== null) {
      manager.dispose();
      this.overrideMaterialManager = null;
    }
  }
  /**
   * Returns the current override material.
   *
   * @deprecated Use overrideMaterial instead.
   * @return {Material} The material.
   */
  getOverrideMaterial() {
    return this.overrideMaterial;
  }
  /**
   * Sets the override material.
   *
   * @deprecated Use overrideMaterial instead.
   * @return {Material} value - The material.
   */
  setOverrideMaterial(value) {
    this.overrideMaterial = value;
  }
  /**
   * Indicates whether the target buffer should be cleared before rendering.
   *
   * @type {Boolean}
   * @deprecated Use clearPass.enabled instead.
   */
  get clear() {
    return this.clearPass.enabled;
  }
  set clear(value) {
    this.clearPass.enabled = value;
  }
  /**
   * Returns the selection. Default is `null` (no restriction).
   *
   * @deprecated Use selection instead.
   * @return {Selection} The selection.
   */
  getSelection() {
    return this.selection;
  }
  /**
   * Sets the selection. Set to `null` to disable.
   *
   * @deprecated Use selection instead.
   * @param {Selection} value - The selection.
   */
  setSelection(value) {
    this.selection = value;
  }
  /**
   * Indicates whether the scene background is disabled.
   *
   * @deprecated Use ignoreBackground instead.
   * @return {Boolean} Whether the scene background is disabled.
   */
  isBackgroundDisabled() {
    return this.ignoreBackground;
  }
  /**
   * Enables or disables the scene background.
   *
   * @deprecated Use ignoreBackground instead.
   * @param {Boolean} value - Whether the scene background should be disabled.
   */
  setBackgroundDisabled(value) {
    this.ignoreBackground = value;
  }
  /**
   * Indicates whether the shadow map auto update is disabled.
   *
   * @deprecated Use skipShadowMapUpdate instead.
   * @return {Boolean} Whether the shadow map update is disabled.
   */
  isShadowMapDisabled() {
    return this.skipShadowMapUpdate;
  }
  /**
   * Enables or disables the shadow map auto update.
   *
   * @deprecated Use skipShadowMapUpdate instead.
   * @param {Boolean} value - Whether the shadow map auto update should be disabled.
   */
  setShadowMapDisabled(value) {
    this.skipShadowMapUpdate = value;
  }
  /**
   * Returns the clear pass.
   *
   * @deprecated Use clearPass.enabled instead.
   * @return {ClearPass} The clear pass.
   */
  getClearPass() {
    return this.clearPass;
  }
  /**
   * Renders the scene.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const scene = this.scene;
    const camera = this.camera;
    const selection = this.selection;
    const mask = camera.layers.mask;
    const background = scene.background;
    const shadowMapAutoUpdate = renderer.shadowMap.autoUpdate;
    const renderTarget = this.renderToScreen ? null : inputBuffer;
    if (selection !== null) {
      camera.layers.set(selection.getLayer());
    }
    if (this.skipShadowMapUpdate) {
      renderer.shadowMap.autoUpdate = false;
    }
    if (this.ignoreBackground || this.clearPass.overrideClearColor !== null) {
      scene.background = null;
    }
    if (this.clearPass.enabled) {
      this.clearPass.render(renderer, inputBuffer);
    }
    renderer.setRenderTarget(renderTarget);
    if (this.overrideMaterialManager !== null) {
      this.overrideMaterialManager.render(renderer, scene, camera);
    } else {
      renderer.render(scene, camera);
    }
    camera.layers.mask = mask;
    scene.background = background;
    renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;
  }
};
var VignetteTechnique = {
  DEFAULT: 0,
  ESKIL: 1
};
var noise_default = `void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 noise=vec3(rand(uv*(1.0+time)));
#ifdef PREMULTIPLY
outputColor=vec4(min(inputColor.rgb*noise,vec3(1.0)),inputColor.a);
#else
outputColor=vec4(noise,inputColor.a);
#endif
}`;
var NoiseEffect = class extends Effect {
  /**
   * Constructs a new noise effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
   * @param {Boolean} [options.premultiply=false] - Whether the noise should be multiplied with the input colors prior to blending.
   */
  constructor({ blendFunction = BlendFunction.SCREEN, premultiply = false } = {}) {
    super("NoiseEffect", noise_default, { blendFunction });
    this.premultiply = premultiply;
  }
  /**
   * Indicates whether noise will be multiplied with the input colors prior to blending.
   *
   * @type {Boolean}
   */
  get premultiply() {
    return this.defines.has("PREMULTIPLY");
  }
  set premultiply(value) {
    if (this.premultiply !== value) {
      if (value) {
        this.defines.set("PREMULTIPLY", "1");
      } else {
        this.defines.delete("PREMULTIPLY");
      }
      this.setChanged();
    }
  }
  /**
   * Indicates whether noise will be multiplied with the input colors prior to blending.
   *
   * @deprecated Use premultiply instead.
   * @return {Boolean} Whether noise is premultiplied.
   */
  isPremultiplied() {
    return this.premultiply;
  }
  /**
   * Controls whether noise should be multiplied with the input colors prior to blending.
   *
   * @deprecated Use premultiply instead.
   * @param {Boolean} value - Whether noise should be premultiplied.
   */
  setPremultiplied(value) {
    this.premultiply = value;
  }
};
var depth_downsampling_default = `#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
#ifdef DOWNSAMPLE_NORMALS
uniform lowp sampler2D normalBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}int findBestDepth(const in float samples[4]){float c=(samples[0]+samples[1]+samples[2]+samples[3])*0.25;float distances[4];distances[0]=abs(c-samples[0]);distances[1]=abs(c-samples[1]);distances[2]=abs(c-samples[2]);distances[3]=abs(c-samples[3]);float maxDistance=max(max(distances[0],distances[1]),max(distances[2],distances[3]));int remaining[3];int rejected[3];int i,j,k;for(i=0,j=0,k=0;i<4;++i){if(distances[i]<maxDistance){remaining[j++]=i;}else{rejected[k++]=i;}}for(;j<3;++j){remaining[j]=rejected[--k];}vec3 s=vec3(samples[remaining[0]],samples[remaining[1]],samples[remaining[2]]);c=(s.x+s.y+s.z)/3.0;distances[0]=abs(c-s.x);distances[1]=abs(c-s.y);distances[2]=abs(c-s.z);float minDistance=min(distances[0],min(distances[1],distances[2]));for(i=0;i<3;++i){if(distances[i]==minDistance){break;}}return remaining[i];}void main(){float d[4];d[0]=readDepth(vUv0);d[1]=readDepth(vUv1);d[2]=readDepth(vUv2);d[3]=readDepth(vUv3);int index=findBestDepth(d);
#ifdef DOWNSAMPLE_NORMALS
vec3 n[4];n[0]=texture2D(normalBuffer,vUv0).rgb;n[1]=texture2D(normalBuffer,vUv1).rgb;n[2]=texture2D(normalBuffer,vUv2).rgb;n[3]=texture2D(normalBuffer,vUv3).rgb;
#else
vec3 n[4];n[0]=vec3(0.0);n[1]=vec3(0.0);n[2]=vec3(0.0);n[3]=vec3(0.0);
#endif
gl_FragColor=vec4(n[index],d[index]);}`;
var depth_downsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=uv;vUv1=vec2(uv.x,uv.y+texelSize.y);vUv2=vec2(uv.x+texelSize.x,uv.y);vUv3=uv+texelSize;gl_Position=vec4(position.xy,1.0,1.0);}`;
var DepthDownsamplingMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new depth downsampling material.
   */
  constructor() {
    super({
      name: "DepthDownsamplingMaterial",
      defines: {
        DEPTH_PACKING: "0"
      },
      uniforms: {
        depthBuffer: new Uniform(null),
        normalBuffer: new Uniform(null),
        texelSize: new Uniform(new Vector2())
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      fragmentShader: depth_downsampling_default,
      vertexShader: depth_downsampling_default2
    });
  }
  /**
   * The depth buffer.
   *
   * @type {Texture}
   */
  set depthBuffer(value) {
    this.uniforms.depthBuffer.value = value;
  }
  /**
   * The depth packing strategy.
   *
   * @type {DepthPackingStrategies}
   */
  set depthPacking(value) {
    this.defines.DEPTH_PACKING = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Sets the depth buffer.
   *
   * @deprecated Use depthBuffer and depthPacking instead.
   * @param {Texture} buffer - The depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
   */
  setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {
    this.depthBuffer = buffer;
    this.depthPacking = depthPacking;
  }
  /**
   * The normal buffer.
   *
   * @type {Texture}
   */
  set normalBuffer(value) {
    this.uniforms.normalBuffer.value = value;
    if (value !== null) {
      this.defines.DOWNSAMPLE_NORMALS = "1";
    } else {
      delete this.defines.DOWNSAMPLE_NORMALS;
    }
    this.needsUpdate = true;
  }
  /**
   * Sets the normal buffer.
   *
   * @deprecated Use normalBuffer instead.
   * @param {Texture} value - The normal buffer.
   */
  setNormalBuffer(value) {
    this.normalBuffer = value;
  }
  /**
   * Sets the texel size.
   *
   * @deprecated Use setSize() instead.
   * @param {Number} x - The texel width.
   * @param {Number} y - The texel height.
   */
  setTexelSize(x, y) {
    this.uniforms.texelSize.value.set(x, y);
  }
  /**
   * Sets the size of this object.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
};
var DepthDownsamplingPass = class extends Pass {
  /**
   * Constructs a new depth downsampling pass.
   *
   * @param {Object} [options] - The options.
   * @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
   * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
   */
  constructor({
    normalBuffer = null,
    resolutionScale = 0.5,
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionX = width,
    resolutionY = height
  } = {}) {
    super("DepthDownsamplingPass");
    const material = new DepthDownsamplingMaterial();
    material.normalBuffer = normalBuffer;
    this.fullscreenMaterial = material;
    this.needsDepthTexture = true;
    this.needsSwap = false;
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      type: FloatType
    });
    this.renderTarget.texture.name = "DepthDownsamplingPass.Target";
    this.renderTarget.texture.generateMipmaps = false;
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
  }
  /**
   * The normal(RGB) + depth(A) texture.
   *
   * @type {Texture}
   */
  get texture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the normal(RGB) + depth(A) texture.
   *
   * @deprecated Use texture instead.
   * @return {Texture} The texture.
   */
  getTexture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * Sets the depth texture.
   *
   * @param {Texture} depthTexture - A depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
   */
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
    this.fullscreenMaterial.depthBuffer = depthTexture;
    this.fullscreenMaterial.depthPacking = depthPacking;
  }
  /**
   * Downsamples depth and scene normals.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
    renderer.render(this.scene, this.camera);
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    this.renderTarget.setSize(resolution.width, resolution.height);
    this.fullscreenMaterial.setSize(width, height);
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    const gl = renderer.getContext();
    const renderable = gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float");
    if (!renderable) {
      throw new Error("Rendering to float texture is not supported.");
    }
  }
};
var vignette_default = `uniform float offset;uniform float darkness;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){const vec2 center=vec2(0.5);vec3 color=inputColor.rgb;
#if VIGNETTE_TECHNIQUE == 0
float d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));
#else
vec2 coord=(uv-center)*vec2(offset);color=mix(color,vec3(1.0-darkness),dot(coord,coord));
#endif
outputColor=vec4(color,inputColor.a);}`;
var VignetteEffect = class extends Effect {
  /**
   * Constructs a new Vignette effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
   * @param {VignetteTechnique} [options.technique=VignetteTechnique.DEFAULT] - The Vignette technique.
   * @param {Boolean} [options.eskil=false] - Deprecated. Use technique instead.
   * @param {Number} [options.offset=0.5] - The Vignette offset.
   * @param {Number} [options.darkness=0.5] - The Vignette darkness.
   */
  constructor({
    blendFunction,
    eskil = false,
    technique = eskil ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT,
    offset = 0.5,
    darkness = 0.5
  } = {}) {
    super("VignetteEffect", vignette_default, {
      blendFunction,
      defines: /* @__PURE__ */ new Map([
        ["VIGNETTE_TECHNIQUE", technique.toFixed(0)]
      ]),
      uniforms: /* @__PURE__ */ new Map([
        ["offset", new Uniform(offset)],
        ["darkness", new Uniform(darkness)]
      ])
    });
  }
  /**
   * The Vignette technique.
   *
   * @type {VignetteTechnique}
   */
  get technique() {
    return Number(this.defines.get("VIGNETTE_TECHNIQUE"));
  }
  set technique(value) {
    if (this.technique !== value) {
      this.defines.set("VIGNETTE_TECHNIQUE", value.toFixed(0));
      this.setChanged();
    }
  }
  /**
   * Indicates whether Eskil's Vignette technique is enabled.
   *
   * @type {Boolean}
   * @deprecated Use technique instead.
   */
  get eskil() {
    return this.technique === VignetteTechnique.ESKIL;
  }
  /**
   * Indicates whether Eskil's Vignette technique is enabled.
   *
   * @type {Boolean}
   * @deprecated Use technique instead.
   */
  set eskil(value) {
    this.technique = value ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT;
  }
  /**
   * Returns the Vignette technique.
   *
   * @deprecated Use technique instead.
   * @return {VignetteTechnique} The technique.
   */
  getTechnique() {
    return this.technique;
  }
  /**
   * Sets the Vignette technique.
   *
   * @deprecated Use technique instead.
   * @param {VignetteTechnique} value - The technique.
   */
  setTechnique(value) {
    this.technique = value;
  }
  /**
   * The Vignette offset.
   *
   * @type {Number}
   */
  get offset() {
    return this.uniforms.get("offset").value;
  }
  set offset(value) {
    this.uniforms.get("offset").value = value;
  }
  /**
   * Returns the Vignette offset.
   *
   * @deprecated Use offset instead.
   * @return {Number} The offset.
   */
  getOffset() {
    return this.offset;
  }
  /**
   * Sets the Vignette offset.
   *
   * @deprecated Use offset instead.
   * @param {Number} value - The offset.
   */
  setOffset(value) {
    this.offset = value;
  }
  /**
   * The Vignette darkness.
   *
   * @type {Number}
   */
  get darkness() {
    return this.uniforms.get("darkness").value;
  }
  set darkness(value) {
    this.uniforms.get("darkness").value = value;
  }
  /**
   * Returns the Vignette darkness.
   *
   * @deprecated Use darkness instead.
   * @return {Number} The darkness.
   */
  getDarkness() {
    return this.darkness;
  }
  /**
   * Sets the Vignette darkness.
   *
   * @deprecated Use darkness instead.
   * @param {Number} value - The darkness.
   */
  setDarkness(value) {
    this.darkness = value;
  }
};
var effect_default = `#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`;
var effect_default2 = `uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}`;
var EffectMaterial = class extends ShaderMaterial {
  /**
   * Constructs a new effect material.
   *
   * @param {Map<String, String>} [shaderParts] - Deprecated. Use setShaderData instead.
   * @param {Map<String, String>} [defines] - Deprecated. Use setShaderData instead.
   * @param {Map<String, Uniform>} [uniforms] - Deprecated. Use setShaderData instead.
   * @param {Camera} [camera] - A camera.
   * @param {Boolean} [dithering=false] - Deprecated.
   */
  constructor(shaderParts, defines, uniforms, camera, dithering = false) {
    super({
      name: "EffectMaterial",
      defines: {
        THREE_REVISION: REVISION.replace(/\D+/g, ""),
        DEPTH_PACKING: "0",
        ENCODE_OUTPUT: "1"
      },
      uniforms: {
        inputBuffer: new Uniform(null),
        depthBuffer: new Uniform(null),
        resolution: new Uniform(new Vector2()),
        texelSize: new Uniform(new Vector2()),
        cameraNear: new Uniform(0.3),
        cameraFar: new Uniform(1e3),
        aspect: new Uniform(1),
        time: new Uniform(0)
      },
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      dithering
    });
    if (shaderParts) {
      this.setShaderParts(shaderParts);
    }
    if (defines) {
      this.setDefines(defines);
    }
    if (uniforms) {
      this.setUniforms(uniforms);
    }
    this.copyCameraSettings(camera);
  }
  /**
   * The input buffer.
   *
   * @type {Texture}
   */
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * Sets the input buffer.
   *
   * @deprecated Use inputBuffer instead.
   * @param {Texture} value - The input buffer.
   */
  setInputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  /**
   * The depth buffer.
   *
   * @type {Texture}
   */
  get depthBuffer() {
    return this.uniforms.depthBuffer.value;
  }
  set depthBuffer(value) {
    this.uniforms.depthBuffer.value = value;
  }
  /**
   * The depth packing strategy.
   *
   * @type {DepthPackingStrategies}
   */
  get depthPacking() {
    return Number(this.defines.DEPTH_PACKING);
  }
  set depthPacking(value) {
    this.defines.DEPTH_PACKING = value.toFixed(0);
    this.needsUpdate = true;
  }
  /**
   * Sets the depth buffer.
   *
   * @deprecated Use depthBuffer and depthPacking instead.
   * @param {Texture} buffer - The depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
   */
  setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {
    this.depthBuffer = buffer;
    this.depthPacking = depthPacking;
  }
  /**
   * Sets the shader data.
   *
   * @param {EffectShaderData} data - The shader data.
   * @return {EffectMaterial} This material.
   */
  setShaderData(data) {
    this.setShaderParts(data.shaderParts);
    this.setDefines(data.defines);
    this.setUniforms(data.uniforms);
    this.setExtensions(data.extensions);
  }
  /**
   * Sets the shader parts.
   *
   * @deprecated Use setShaderData instead.
   * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link EffectShaderSection}.
   * @return {EffectMaterial} This material.
   */
  setShaderParts(shaderParts) {
    this.fragmentShader = effect_default.replace(EffectShaderSection.FRAGMENT_HEAD, shaderParts.get(EffectShaderSection.FRAGMENT_HEAD) || "").replace(EffectShaderSection.FRAGMENT_MAIN_UV, shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV) || "").replace(EffectShaderSection.FRAGMENT_MAIN_IMAGE, shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE) || "");
    this.vertexShader = effect_default2.replace(EffectShaderSection.VERTEX_HEAD, shaderParts.get(EffectShaderSection.VERTEX_HEAD) || "").replace(EffectShaderSection.VERTEX_MAIN_SUPPORT, shaderParts.get(EffectShaderSection.VERTEX_MAIN_SUPPORT) || "");
    this.needsUpdate = true;
    return this;
  }
  /**
   * Sets the shader macros.
   *
   * @deprecated Use setShaderData instead.
   * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
   * @return {EffectMaterial} This material.
   */
  setDefines(defines) {
    for (const entry of defines.entries()) {
      this.defines[entry[0]] = entry[1];
    }
    this.needsUpdate = true;
    return this;
  }
  /**
   * Sets the shader uniforms.
   *
   * @deprecated Use setShaderData instead.
   * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
   * @return {EffectMaterial} This material.
   */
  setUniforms(uniforms) {
    for (const entry of uniforms.entries()) {
      this.uniforms[entry[0]] = entry[1];
    }
    return this;
  }
  /**
   * Sets the required shader extensions.
   *
   * @deprecated Use setShaderData instead.
   * @param {Set<WebGLExtension>} extensions - A collection of extensions.
   * @return {EffectMaterial} This material.
   */
  setExtensions(extensions) {
    this.extensions = {};
    for (const extension of extensions) {
      this.extensions[extension] = true;
    }
    return this;
  }
  /**
   * Indicates whether output encoding is enabled.
   *
   * @type {Boolean}
   */
  get encodeOutput() {
    return this.defines.ENCODE_OUTPUT !== void 0;
  }
  set encodeOutput(value) {
    if (this.encodeOutput !== value) {
      if (value) {
        this.defines.ENCODE_OUTPUT = "1";
      } else {
        delete this.defines.ENCODE_OUTPUT;
      }
      this.needsUpdate = true;
    }
  }
  /**
   * Indicates whether output encoding is enabled.
   *
   * @deprecated Use encodeOutput instead.
   * @return {Boolean} Whether output encoding is enabled.
   */
  isOutputEncodingEnabled(value) {
    return this.encodeOutput;
  }
  /**
   * Enables or disables output encoding.
   *
   * @deprecated Use encodeOutput instead.
   * @param {Boolean} value - Whether output encoding should be enabled.
   */
  setOutputEncodingEnabled(value) {
    this.encodeOutput = value;
  }
  /**
   * The time in seconds.
   *
   * @type {Number}
   */
  get time() {
    return this.uniforms.time.value;
  }
  set time(value) {
    this.uniforms.time.value = value;
  }
  /**
   * Sets the delta time.
   *
   * @deprecated Use time instead.
   * @param {Number} value - The delta time in seconds.
   */
  setDeltaTime(value) {
    this.uniforms.time.value += value;
  }
  /**
   * Copies the settings of the given camera.
   *
   * @deprecated Use copyCameraSettings instead.
   * @param {Camera} camera - A camera.
   */
  adoptCameraSettings(camera) {
    this.copyCameraSettings(camera);
  }
  /**
   * Copies the settings of the given camera.
   *
   * @param {Camera} camera - A camera.
   */
  copyCameraSettings(camera) {
    if (camera) {
      this.uniforms.cameraNear.value = camera.near;
      this.uniforms.cameraFar.value = camera.far;
      if (camera instanceof PerspectiveCamera) {
        this.defines.PERSPECTIVE_CAMERA = "1";
      } else {
        delete this.defines.PERSPECTIVE_CAMERA;
      }
      this.needsUpdate = true;
    }
  }
  /**
   * Sets the resolution.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const uniforms = this.uniforms;
    uniforms.resolution.value.set(width, height);
    uniforms.texelSize.value.set(1 / width, 1 / height);
    uniforms.aspect.value = width / height;
  }
  /**
   * An enumeration of shader code placeholders.
   *
   * @deprecated Use EffectShaderSection instead.
   * @type {Object}
   */
  static get Section() {
    return EffectShaderSection;
  }
};
function prefixSubstrings(prefix, substrings, strings) {
  for (const substring of substrings) {
    const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
    const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");
    for (const entry of strings.entries()) {
      if (entry[1] !== null) {
        strings.set(entry[0], entry[1].replace(regExp, prefixed));
      }
    }
  }
}
function integrateEffect(prefix, effect, data) {
  let fragmentShader = effect.getFragmentShader();
  let vertexShader = effect.getVertexShader();
  const mainImageExists = fragmentShader !== void 0 && /mainImage/.test(fragmentShader);
  const mainUvExists = fragmentShader !== void 0 && /mainUv/.test(fragmentShader);
  data.attributes |= effect.getAttributes();
  if (fragmentShader === void 0) {
    throw new Error(`Missing fragment shader (${effect.name})`);
  } else if (mainUvExists && (data.attributes & EffectAttribute.CONVOLUTION) !== 0) {
    throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);
  } else if (!mainImageExists && !mainUvExists) {
    throw new Error(`Could not find mainImage or mainUv function (${effect.name})`);
  } else {
    const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;
    const shaderParts = data.shaderParts;
    let fragmentHead = shaderParts.get(EffectShaderSection.FRAGMENT_HEAD) || "";
    let fragmentMainUv = shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV) || "";
    let fragmentMainImage = shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE) || "";
    let vertexHead = shaderParts.get(EffectShaderSection.VERTEX_HEAD) || "";
    let vertexMainSupport = shaderParts.get(EffectShaderSection.VERTEX_MAIN_SUPPORT) || "";
    const varyings = /* @__PURE__ */ new Set();
    const names = /* @__PURE__ */ new Set();
    if (mainUvExists) {
      fragmentMainUv += `	${prefix}MainUv(UV);
`;
      data.uvTransformation = true;
    }
    if (vertexShader !== null && /mainSupport/.test(vertexShader)) {
      const needsUv = /mainSupport *\([\w\s]*?uv\s*?\)/.test(vertexShader);
      vertexMainSupport += `	${prefix}MainSupport(`;
      vertexMainSupport += needsUv ? "vUv);\n" : ");\n";
      for (const m2 of vertexShader.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g)) {
        for (const n of m2[1].split(/\s*,\s*/)) {
          data.varyings.add(n);
          varyings.add(n);
          names.add(n);
        }
      }
      for (const m2 of vertexShader.matchAll(functionRegExp)) {
        names.add(m2[1]);
      }
    }
    for (const m2 of fragmentShader.matchAll(functionRegExp)) {
      names.add(m2[1]);
    }
    for (const d of effect.defines.keys()) {
      names.add(d.replace(/\([\w\s,]*\)/g, ""));
    }
    for (const u of effect.uniforms.keys()) {
      names.add(u);
    }
    names.delete("while");
    names.delete("for");
    names.delete("if");
    effect.uniforms.forEach((val, key) => data.uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
    effect.defines.forEach((val, key) => data.defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
    const shaders = /* @__PURE__ */ new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
    prefixSubstrings(prefix, names, data.defines);
    prefixSubstrings(prefix, names, shaders);
    fragmentShader = shaders.get("fragment");
    vertexShader = shaders.get("vertex");
    const blendMode = effect.blendMode;
    data.blendModes.set(blendMode.blendFunction, blendMode);
    if (mainImageExists) {
      if (effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) {
        fragmentMainImage += effect.inputColorSpace === SRGBColorSpace ? "color0 = sRGBTransferOETF(color0);\n	" : "color0 = sRGBToLinear(color0);\n	";
      }
      if (effect.outputColorSpace !== NoColorSpace) {
        data.colorSpace = effect.outputColorSpace;
      } else if (effect.inputColorSpace !== null) {
        data.colorSpace = effect.inputColorSpace;
      }
      const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
      fragmentMainImage += `${prefix}MainImage(color0, UV, `;
      if ((data.attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(fragmentShader)) {
        fragmentMainImage += "depth, ";
        data.readDepth = true;
      }
      fragmentMainImage += "color1);\n	";
      const blendOpacity = prefix + "BlendOpacity";
      data.uniforms.set(blendOpacity, blendMode.opacity);
      fragmentMainImage += `color0 = blend${blendMode.blendFunction}(color0, color1, ${blendOpacity});

	`;
      fragmentHead += `uniform float ${blendOpacity};

`;
    }
    fragmentHead += fragmentShader + "\n";
    if (vertexShader !== null) {
      vertexHead += vertexShader + "\n";
    }
    shaderParts.set(EffectShaderSection.FRAGMENT_HEAD, fragmentHead);
    shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_UV, fragmentMainUv);
    shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
    shaderParts.set(EffectShaderSection.VERTEX_HEAD, vertexHead);
    shaderParts.set(EffectShaderSection.VERTEX_MAIN_SUPPORT, vertexMainSupport);
    if (effect.extensions !== null) {
      for (const extension of effect.extensions) {
        data.extensions.add(extension);
      }
    }
  }
}
var EffectPass = class extends Pass {
  /**
   * Constructs a new effect pass.
   *
   * @param {Camera} camera - The main camera.
   * @param {...Effect} effects - The effects that will be rendered by this pass.
   */
  constructor(camera, ...effects) {
    super("EffectPass");
    this.fullscreenMaterial = new EffectMaterial(null, null, null, camera);
    this.listener = (event) => this.handleEvent(event);
    this.effects = [];
    this.setEffects(effects);
    this.skipRendering = false;
    this.minTime = 1;
    this.maxTime = Number.POSITIVE_INFINITY;
    this.timeScale = 1;
  }
  set mainScene(value) {
    for (const effect of this.effects) {
      effect.mainScene = value;
    }
  }
  set mainCamera(value) {
    this.fullscreenMaterial.copyCameraSettings(value);
    for (const effect of this.effects) {
      effect.mainCamera = value;
    }
  }
  /**
   * Indicates whether this pass encodes its output when rendering to screen.
   *
   * @type {Boolean}
   * @deprecated Use fullscreenMaterial.encodeOutput instead.
   */
  get encodeOutput() {
    return this.fullscreenMaterial.encodeOutput;
  }
  set encodeOutput(value) {
    this.fullscreenMaterial.encodeOutput = value;
  }
  /**
   * Indicates whether dithering is enabled.
   *
   * @type {Boolean}
   */
  get dithering() {
    return this.fullscreenMaterial.dithering;
  }
  set dithering(value) {
    const material = this.fullscreenMaterial;
    material.dithering = value;
    material.needsUpdate = true;
  }
  /**
   * Sets the effects.
   *
   * @param {Effect[]} effects - The effects.
   * @protected
   */
  setEffects(effects) {
    for (const effect of this.effects) {
      effect.removeEventListener("change", this.listener);
    }
    this.effects = effects.sort((a, b) => b.attributes - a.attributes);
    for (const effect of this.effects) {
      effect.addEventListener("change", this.listener);
    }
  }
  /**
   * Updates the compound shader material.
   *
   * @protected
   */
  updateMaterial() {
    const data = new EffectShaderData();
    let id = 0;
    for (const effect of this.effects) {
      if (effect.blendMode.blendFunction === BlendFunction.DST) {
        data.attributes |= effect.getAttributes() & EffectAttribute.DEPTH;
      } else if ((data.attributes & effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) {
        throw new Error(`Convolution effects cannot be merged (${effect.name})`);
      } else {
        integrateEffect("e" + id++, effect, data);
      }
    }
    let fragmentHead = data.shaderParts.get(EffectShaderSection.FRAGMENT_HEAD);
    let fragmentMainImage = data.shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE);
    let fragmentMainUv = data.shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV);
    const blendRegExp = /\bblend\b/g;
    for (const blendMode of data.blendModes.values()) {
      fragmentHead += blendMode.getShaderCode().replace(blendRegExp, `blend${blendMode.blendFunction}`) + "\n";
    }
    if ((data.attributes & EffectAttribute.DEPTH) !== 0) {
      if (data.readDepth) {
        fragmentMainImage = "float depth = readDepth(UV);\n\n	" + fragmentMainImage;
      }
      this.needsDepthTexture = this.getDepthTexture() === null;
    } else {
      this.needsDepthTexture = false;
    }
    if (data.colorSpace === SRGBColorSpace) {
      fragmentMainImage += "color0 = sRGBToLinear(color0);\n	";
    }
    if (data.uvTransformation) {
      fragmentMainUv = "vec2 transformedUv = vUv;\n" + fragmentMainUv;
      data.defines.set("UV", "transformedUv");
    } else {
      data.defines.set("UV", "vUv");
    }
    data.shaderParts.set(EffectShaderSection.FRAGMENT_HEAD, fragmentHead);
    data.shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
    data.shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_UV, fragmentMainUv);
    for (const [key, value] of data.shaderParts) {
      if (value !== null) {
        data.shaderParts.set(key, value.trim().replace(/^#/, "\n#"));
      }
    }
    this.skipRendering = id === 0;
    this.needsSwap = !this.skipRendering;
    this.fullscreenMaterial.setShaderData(data);
  }
  /**
   * Rebuilds the shader material.
   */
  recompile() {
    this.updateMaterial();
  }
  /**
   * Returns the current depth texture.
   *
   * @return {Texture} The current depth texture, or null if there is none.
   */
  getDepthTexture() {
    return this.fullscreenMaterial.depthBuffer;
  }
  /**
   * Sets the depth texture.
   *
   * @param {Texture} depthTexture - A depth texture.
   * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
   */
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
    this.fullscreenMaterial.depthBuffer = depthTexture;
    this.fullscreenMaterial.depthPacking = depthPacking;
    for (const effect of this.effects) {
      effect.setDepthTexture(depthTexture, depthPacking);
    }
  }
  /**
   * Renders the effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    for (const effect of this.effects) {
      effect.update(renderer, inputBuffer, deltaTime);
    }
    if (!this.skipRendering || this.renderToScreen) {
      const material = this.fullscreenMaterial;
      material.inputBuffer = inputBuffer.texture;
      material.time += deltaTime * this.timeScale;
      renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
      renderer.render(this.scene, this.camera);
    }
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    this.fullscreenMaterial.setSize(width, height);
    for (const effect of this.effects) {
      effect.setSize(width, height);
    }
  }
  /**
   * Performs initialization tasks.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
   * @param {Number} frameBufferType - The type of the main frame buffers.
   */
  initialize(renderer, alpha, frameBufferType) {
    this.renderer = renderer;
    for (const effect of this.effects) {
      effect.initialize(renderer, alpha, frameBufferType);
    }
    this.updateMaterial();
    if (frameBufferType !== void 0 && frameBufferType !== UnsignedByteType) {
      this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
    }
  }
  /**
   * Deletes disposable objects.
   */
  dispose() {
    super.dispose();
    for (const effect of this.effects) {
      effect.removeEventListener("change", this.listener);
      effect.dispose();
    }
  }
  /**
   * Handles events.
   *
   * @param {Event} event - An event.
   */
  handleEvent(event) {
    switch (event.type) {
      case "change":
        this.recompile();
        break;
    }
  }
};
var NormalPass = class extends Pass {
  /**
   * Constructs a new normal pass.
   *
   * @param {Scene} scene - The scene to render.
   * @param {Camera} camera - The camera to use to render the scene.
   * @param {Object} [options] - The options.
   * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
   * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
   * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
   * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
   * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
   */
  constructor(scene, camera, {
    renderTarget,
    resolutionScale = 1,
    width = Resolution.AUTO_SIZE,
    height = Resolution.AUTO_SIZE,
    resolutionX = width,
    resolutionY = height
  } = {}) {
    super("NormalPass");
    this.needsSwap = false;
    this.renderPass = new RenderPass(scene, camera, new MeshNormalMaterial());
    const renderPass = this.renderPass;
    renderPass.ignoreBackground = true;
    renderPass.skipShadowMapUpdate = true;
    const clearPass = renderPass.getClearPass();
    clearPass.overrideClearColor = new Color(7829503);
    clearPass.overrideClearAlpha = 1;
    this.renderTarget = renderTarget;
    if (this.renderTarget === void 0) {
      this.renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter
      });
      this.renderTarget.texture.name = "NormalPass.Target";
    }
    const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
    resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
  }
  set mainScene(value) {
    this.renderPass.mainScene = value;
  }
  set mainCamera(value) {
    this.renderPass.mainCamera = value;
  }
  /**
   * The normal texture.
   *
   * @type {Texture}
   */
  get texture() {
    return this.renderTarget.texture;
  }
  /**
   * The normal texture.
   *
   * @deprecated Use texture instead.
   * @return {Texture} The texture.
   */
  getTexture() {
    return this.renderTarget.texture;
  }
  /**
   * Returns the resolution settings.
   *
   * @deprecated Use resolution instead.
   * @return {Resolution} The resolution.
   */
  getResolution() {
    return this.resolution;
  }
  /**
   * Returns the current resolution scale.
   *
   * @return {Number} The resolution scale.
   * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
   */
  getResolutionScale() {
    return this.resolution.scale;
  }
  /**
   * Sets the resolution scale.
   *
   * @param {Number} scale - The new resolution scale.
   * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
   */
  setResolutionScale(scale) {
    this.resolution.scale = scale;
  }
  /**
   * Renders the scene normals.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
   */
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const renderTarget = this.renderToScreen ? null : this.renderTarget;
    this.renderPass.render(renderer, renderTarget, renderTarget);
  }
  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width, height) {
    const resolution = this.resolution;
    resolution.setBaseSize(width, height);
    this.renderTarget.setSize(resolution.width, resolution.height);
  }
};
var resolveRef = (ref) => typeof ref === "object" && ref != null && "current" in ref ? ref.current : ref;
function useMergeRefs(localRef, outerRef) {
  return useCallback((instance) => {
    localRef.current = instance;
    if (typeof outerRef !== "function") {
      if (outerRef) outerRef.current = instance;
      return;
    }
    const cleanup = outerRef(instance);
    if (typeof cleanup !== "function") return;
    return () => {
      localRef.current = null;
      cleanup();
    };
  }, [localRef, outerRef]);
}
function readGroupChildren(group, filter) {
  const groupInstance = group.__r3f;
  return groupInstance ? groupInstance.children.map((child) => child.object).filter(filter) : [];
}
function updateIfChanged(ref, next) {
  const previous = ref.current;
  if (next.length === previous.length && next.every((item, i) => item === previous[i])) return false;
  ref.current = next;
  return true;
}
var useDispose = (instance) => {
  useEffect(() => {
    return () => {
      instance?.dispose?.();
    };
  }, [instance]);
};
function readPierced(instance, key) {
  let target = instance;
  for (const part of key.split("-")) {
    if (target == null) return void 0;
    target = target[part];
  }
  return target;
}
function applyPierced(instance, key, value) {
  const parts = key.split("-");
  let target = instance;
  for (let idx = 0; idx < parts.length - 1; idx++) {
    if (target == null) return;
    target = target[parts[idx]];
  }
  if (target == null) return;
  target[parts[parts.length - 1]] = value;
}
function useLiveDefaults(instance, values, keys, get = readPierced, set = applyPierced) {
  const snapshotRef = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  useLayoutEffect(() => {
    const resolved = resolveRef(instance);
    if (!resolved) return;
    if (snapshotRef.current?.instance !== resolved) snapshotRef.current = {
      instance: resolved,
      defaults: /* @__PURE__ */ new Map(),
      applied: /* @__PURE__ */ new Map()
    };
    const { defaults, applied } = snapshotRef.current;
    let changed = false;
    for (const key of keys) {
      if (!defaults.has(key)) {
        const current = get(resolved, key);
        defaults.set(key, current);
        applied.set(key, current);
      }
      const next = values[key] !== void 0 ? values[key] : defaults.get(key);
      if (Object.is(applied.get(key), next)) continue;
      set(resolved, key, next);
      applied.set(key, next);
      changed = true;
    }
    if (changed) invalidate();
  });
}
var components$1 = /* @__PURE__ */ new WeakMap();
var i$1 = 0;
var BLEND_KEYS = ["blendMode-blendFunction", "blendMode-opacity-value"];
function createEffectComponent(effect) {
  return function EffectComponent({ blendFunction, opacity, ref, ...props }) {
    let Component = components$1.get(effect);
    if (!Component) {
      const key = `@react-three/postprocessing/${effect.name}-${i$1++}`;
      extend({ [key]: effect });
      components$1.set(effect, Component = key);
    }
    const camera = useThree((state) => state.camera);
    const localRef = useRef(null);
    const setRef = useMergeRefs(localRef, ref);
    useLiveDefaults(localRef, {
      "blendMode-blendFunction": blendFunction,
      "blendMode-opacity-value": opacity
    }, BLEND_KEYS);
    return /* @__PURE__ */ jsx(Component, {
      ref: setRef,
      camera,
      ...props
    });
  };
}
var EffectComposerContext = /* @__PURE__ */ createContext(null);
var isConvolution = (effect) => (effect.getAttributes() & 2) === 2;
function createRendererPropertyGuard(property) {
  const refs = /* @__PURE__ */ new WeakMap();
  return {
    acquire(gl, forcedValue) {
      const existing = refs.get(gl);
      if (existing) {
        existing.count++;
        existing.forcedValue = forcedValue;
      } else refs.set(gl, {
        count: 1,
        original: gl[property],
        forcedValue
      });
    },
    release(gl) {
      const entry = refs.get(gl);
      if (!entry) return;
      if (--entry.count <= 0) {
        if (gl[property] === entry.forcedValue) gl[property] = entry.original;
        refs.delete(gl);
      }
    }
  };
}
var autoClearGuard = /* @__PURE__ */ createRendererPropertyGuard("autoClear");
var toneMappingGuard = /* @__PURE__ */ createRendererPropertyGuard("toneMapping");
var glSize = /* @__PURE__ */ new Vector2();
var defaultRenderPass = (scene, camera) => new RenderPass(scene, camera);
var generatedPasses = /* @__PURE__ */ new WeakSet();
var groupPasses = /* @__PURE__ */ new WeakSet();
function disposePassWithoutEffects(pass) {
  if (pass instanceof EffectPass) pass.setEffects([]);
  Pass.prototype.dispose.call(pass);
}
function disposeGeneratedPass(pass) {
  if (!generatedPasses.has(pass)) return;
  disposePassWithoutEffects(pass);
}
function buildPasses(nodes, camera, mergeMode) {
  const passes = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node instanceof Effect) {
      const effects = [node];
      let hasConvolution = isConvolution(node);
      if (mergeMode !== "none") {
        let next;
        while ((next = nodes[i + 1]) instanceof Effect) {
          const nextIsConvolution = isConvolution(next);
          if (mergeMode === "auto" && hasConvolution && nextIsConvolution) break;
          effects.push(next);
          hasConvolution ||= nextIsConvolution;
          i++;
        }
      }
      const pass = new EffectPass(camera, ...effects);
      generatedPasses.add(pass);
      passes.push(pass);
    } else if (node instanceof Pass) passes.push(node);
  }
  return passes;
}
var EffectComposer2 = /* @__PURE__ */ memo(function EffectComposer3({ children, camera: _camera, scene: _scene, resolutionScale, enabled = true, renderPriority = 1, autoClear = true, autoRenderToScreen = true, depthBuffer, enableNormalPass, stencilBuffer, multisampling = 8, frameBufferType = HalfFloatType, renderPass = defaultRenderPass, mergeMode = "auto", ref }) {
  const { gl, scene: defaultScene, camera: defaultCamera } = useThree();
  const scene = _scene || defaultScene;
  const camera = _camera || defaultCamera;
  gl.getSize(glSize);
  const [composerState, setComposerState] = useState(null);
  const [, requestRebuild] = useReducer((c) => c + 1, 0);
  useEffect(() => {
    autoClearGuard.acquire(gl, false);
    const effectComposer = new EffectComposer$1(gl, {
      depthBuffer,
      stencilBuffer,
      multisampling,
      frameBufferType
    });
    effectComposer.autoRenderToScreen = autoRenderToScreen;
    effectComposer.addPass(renderPass(scene, camera));
    let normalPass = null;
    let downSamplingPass = null;
    if (enableNormalPass) {
      normalPass = new NormalPass(scene, camera);
      normalPass.enabled = false;
      effectComposer.addPass(normalPass);
      if (resolutionScale !== void 0) {
        downSamplingPass = new DepthDownsamplingPass({
          normalBuffer: normalPass.texture,
          resolutionScale
        });
        downSamplingPass.enabled = false;
        effectComposer.addPass(downSamplingPass);
      }
    }
    effectComposer.setSize(glSize.width, glSize.height);
    setComposerState({
      composer: effectComposer,
      normalPass,
      downSamplingPass
    });
    return () => {
      for (const pass of effectComposer.passes) disposeGeneratedPass(pass);
      effectComposer.dispose();
      autoClearGuard.release(gl);
    };
  }, [
    camera,
    gl,
    depthBuffer,
    stencilBuffer,
    multisampling,
    frameBufferType,
    autoRenderToScreen,
    renderPass,
    scene,
    enableNormalPass,
    resolutionScale
  ]);
  const appliedSizeRef = useRef({
    width: -1,
    height: -1
  });
  useFrame((_, delta) => {
    if (!enabled || !composerState) return;
    const { composer } = composerState;
    gl.getSize(glSize);
    if (glSize.width !== appliedSizeRef.current.width || glSize.height !== appliedSizeRef.current.height) {
      composer.setSize(glSize.width, glSize.height);
      appliedSizeRef.current.width = glSize.width;
      appliedSizeRef.current.height = glSize.height;
    }
    const currentAutoClear = gl.autoClear;
    gl.autoClear = autoClear;
    if (stencilBuffer && !autoClear) gl.clearStencil();
    composer.render(delta);
    gl.autoClear = currentAutoClear;
  }, enabled ? renderPriority : 0);
  const group = useRef(null);
  const nodesRef = useRef([]);
  const [nodesVersion, setNodesVersion] = useState(0);
  useLayoutEffect(() => {
    if (!composerState) return;
    const nodes = readGroupChildren(group.current, (object) => object instanceof Effect || object instanceof Pass);
    if (updateIfChanged(nodesRef, nodes)) setNodesVersion((v2) => v2 + 1);
  });
  useLayoutEffect(() => {
    if (!composerState) return;
    const { composer, normalPass, downSamplingPass } = composerState;
    const passes = buildPasses(nodesRef.current, camera, mergeMode);
    if (passes.some((pass) => groupPasses.has(pass))) {
      const trailingCopyPass = new CopyPass();
      generatedPasses.add(trailingCopyPass);
      passes.push(trailingCopyPass);
    }
    for (const pass of passes) composer.addPass(pass);
    if (passes.length) {
      if (normalPass) normalPass.enabled = true;
      if (downSamplingPass) downSamplingPass.enabled = true;
    }
    return () => {
      for (const pass of passes) {
        composer.removePass(pass);
        disposeGeneratedPass(pass);
      }
      if (normalPass) normalPass.enabled = false;
      if (downSamplingPass) downSamplingPass.enabled = false;
    };
  }, [
    composerState,
    nodesVersion,
    camera,
    mergeMode
  ]);
  useEffect(() => {
    toneMappingGuard.acquire(gl, NoToneMapping);
    gl.toneMapping = NoToneMapping;
    return () => {
      toneMappingGuard.release(gl);
    };
  }, [gl]);
  const state = useMemo(() => composerState ? {
    composer: composerState.composer,
    normalPass: composerState.normalPass,
    downSamplingPass: composerState.downSamplingPass,
    resolutionScale,
    camera,
    scene,
    requestRebuild,
    autoClear
  } : null, [
    composerState,
    resolutionScale,
    camera,
    scene,
    requestRebuild,
    autoClear
  ]);
  useImperativeHandle(ref, () => composerState?.composer, [composerState]);
  if (!state) return null;
  return /* @__PURE__ */ jsx(EffectComposerContext.Provider, {
    value: state,
    children: /* @__PURE__ */ jsx("group", {
      ref: group,
      children
    })
  });
});
var LIVE_KEYS$6 = [
  "blendMode-blendFunction",
  "bokehScale",
  "cocMaterial-focusDistance",
  "cocMaterial-focusRange",
  "depthTexture"
];
function get$2(effect, key) {
  if (key !== "depthTexture") return readPierced(effect, key);
  const texture = effect.cocMaterial.uniforms.depthBuffer.value;
  return texture ? { texture } : void 0;
}
function set$3(effect, key, value) {
  if (key === "depthTexture") {
    const dt = value;
    effect.setDepthTexture(dt?.texture, dt?.packing);
  } else applyPierced(effect, key, value);
}
function DepthOfField({ ref, blendFunction, worldFocusDistance, worldFocusRange, focusDistance, focusRange, focalLength, bokehScale, resolutionScale, resolutionX, resolutionY, width, height, target, depthTexture, ...props }) {
  const { camera } = use(EffectComposerContext);
  const autoFocus = target != null;
  const effect = useMemo(() => {
    const effect2 = new DepthOfFieldEffect(camera, {
      worldFocusDistance,
      worldFocusRange,
      focalLength,
      resolutionScale,
      resolutionX,
      resolutionY,
      width,
      height
    });
    if (autoFocus) effect2.target = new Vector3();
    effect2.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
    return effect2;
  }, [
    camera,
    worldFocusDistance,
    worldFocusRange,
    focalLength,
    resolutionScale,
    resolutionX,
    resolutionY,
    width,
    height,
    autoFocus
  ]);
  useLiveDefaults(effect, {
    "blendMode-blendFunction": blendFunction,
    bokehScale,
    "cocMaterial-focusDistance": focusDistance,
    "cocMaterial-focusRange": focusRange,
    depthTexture
  }, LIVE_KEYS$6, get$2, set$3);
  useDispose(effect);
  return /* @__PURE__ */ jsx("primitive", {
    ...props,
    object: effect,
    ref,
    target
  });
}
var BloomImpl = /* @__PURE__ */ createEffectComponent(BloomEffect);
function Bloom({ blendFunction = 0, luminanceThreshold, luminanceSmoothing, mipmapBlur, radius, levels, resolutionScale, resolutionX, resolutionY, ...liveProps }) {
  const args = useMemo(() => [{
    luminanceThreshold,
    luminanceSmoothing,
    mipmapBlur,
    radius,
    levels,
    resolutionScale,
    resolutionX,
    resolutionY
  }], [
    luminanceThreshold,
    luminanceSmoothing,
    mipmapBlur,
    radius,
    levels,
    resolutionScale,
    resolutionX,
    resolutionY
  ]);
  return /* @__PURE__ */ jsx(BloomImpl, {
    blendFunction,
    args,
    ...liveProps
  });
}
var NoiseImpl = /* @__PURE__ */ createEffectComponent(NoiseEffect);
function Noise({ blendFunction = 5, ...props }) {
  return /* @__PURE__ */ jsx(NoiseImpl, {
    blendFunction,
    ...props
  });
}
var Vignette = /* @__PURE__ */ createEffectComponent(VignetteEffect);
export {
  Bloom as B,
  DepthOfField as D,
  Environment as E,
  Lightformer as L,
  Noise as N,
  Vignette as V,
  EffectComposer2 as a,
  BlendFunction as b
};
