# Project Development Process & Critical Reflection

## 1. Initial Concept & Creative Vision

* **Inspiration & Premise**:
  The core vision behind this project was to disrupt the flat, static "click-to-reveal" paradigm typical of conventional web tarot applications. The objective was to create a multisensory 3D web experience marrying **early-2000s digital nostalgia (Y2K / PS1 low-poly aesthetics)** with **healing, ritualistic micro-interactions**.
* **Narrative & Character Universe**:
  Built upon the dual-feline archetype—**Red Devil Cat** (instinct, boldness, intuition) and **Cyan Angel Cat** (sanctuary, rational calmness, inner clarity). The classic Major Arcana cards from the Rider-Waite tarot (The Fool, The Magician, The Lovers, The Moon) were re-contextualized into pixelated fables, offering users a tranquil digital sanctuary to decompress from modern anxiety.
* **Initial Technical Scope**:
  To engineer a responsive 3D accordion fan spread using Three.js, augmented by a hardware-inspired low-resolution pipeline (buffer downsampling + CRT scanlines) evoking retro cathode-ray monitors.

---

## 2. Iterative Design & Technical Evolution

Throughout the solo development cycle, multiple design refinements and engineering refactors were implemented:

### A. Visual Hierarchy & Spatial Layout
* **Mitigating Element Overlap**: In earlier iterations, the bottom reading interpretation panel partially occluded the lower rim of the centered 3D card. To ensure the feline illustration remained unobstructed, the active card and perspective camera were shifted upward along the vertical axis (`y: 0.8`), while the neon text container was positioned lower, ensuring a clear visual separation between 3D assets and typographical readings.
* **Low-Poly Shading Pipeline**: Cards leverage `MeshLambertMaterial` with `flatShading: true` alongside `NearestFilter` texture interpolation. This preserves crisp, retro-style pixelated card boundaries without smoothing artifacts during 3D rotations.

### B. Multisensory Sound Architecture
* **Dual-Track Audio Refactoring**: Progressing from basic placeholder tones, the audio system was expanded into a layered architecture:
  1. An external atmospheric background track (`assets/bgm.m4a`) delivering a continuous ambient synthwave soundscape;
  2. Programmatic 8-bit procedural sound synthesis via the native `Web Audio API`, producing low-latency tactile feedback clicks (880 Hz to 1760 Hz pitch sweep) and arpeggiated modal chords (C5-E5-G5-C6) upon card reveal.
* **Modern Autoplay Compliance**: A retro `♫ BGM: OFF/ON` toggle is pinned in the upper-right corner, ensuring smooth `AudioContext.resume()` initialization triggered exclusively by deliberate user gestures.

---

## 3. Human-AI Collaborative Workflow

Throughout the end-to-end development of this project, I integrated a multi-tool AI pipeline comprising **Midjourney**, **Workbuddy AI**, and **ChatGPT / Gemini**. This setup established an iterative workflow centered on "human-AI synergy guided entirely by individual aesthetic judgment and engineering agency":

### A. Division of Tools & Practical Usage
1. **Midjourney v6**: Handled conceptual visual asset generation and cross-card stylistic cohesion. By utilizing standardized prompt syntaxes (Low-poly, PS1 graphics, flat shading, nostalgic 2000s web render), image references, and seed weight controls, I generated the four Major Arcana feline illustrations as well as the pixel-heart card back.
2. **Workbuddy AI**: Served as an embedded pair-programming assistant directly within the IDE workflow. It aided in continuous code refactoring, Three.js 3D viewport spatial adjustments, and diagnosing Git workflow conflicts (such as oversized file history rejections).
3. **ChatGPT / Gemini**: Utilized as algorithmic and technical thought partners. They assisted in formulating the radial mathematics for the Three.js accordion card spread (polar coordinates and radian offsets), tuning parameter envelopes for the Web Audio oscillators, structuring usability testing protocols, and polishing technical documentation standards.

### B. Adopted Recommendation
* **Recommendation**: During performance optimization, the AI assistants recommended **avoiding heavy post-processing CSS filters to simulate pixelation**, advocating instead for a "physical downsampled render buffer"—clamping the WebGL renderer's internal resolution to a fixed low resolution (`LOW_RES_WIDTH = 380px`) and upscaling it via CSS `image-rendering: pixelated`.
* **Impact**: This approach dramatically reduced GPU overhead while authentically recreating the raw, hardware-level jagged granularity characteristic of original PlayStation 1 graphics.

### C. Modified / Rejected Recommendation
* **Recommendation**: The AI tools initially proposed importing external 3D mesh formats (`.gltf` / `.obj` rigged low-poly feline models) into the viewport alongside rigid-body physics simulations for card drops and complex character animations.
* **Rationale for Modification / Rejection**:
  1. **Payload & Performance**: Loading external asset meshes would introduce noticeable network latency and initial load friction, compromising the lightweight, instant-launch nature of a web experience.
  2. **Stylistic Cohesion**: Overly intricate 3D spatial dynamics threatened to distract from the meditative intimacy intrinsic to flat tarot card divination. I dismissed the heavy rigid-body simulation in favor of procedural Three.js `PlaneGeometry` rotations driven by smooth linear interpolation (`Lerp`), preserving optimal runtime performance and reinforcing the tactical nostalgia of physical digital cards.
  
  ---

## 4. User Testing & Feedback Loop

During mid-stage development, I conducted qualitative walkthrough evaluations with three users (an interaction design peer and a tarot enthusiast):

* **User Insight 1: Touch Inertia Overshoot**
  * *Feedback*: On high-refresh mobile displays, lateral drag gestures moved the card arc excessively fast, occasionally pushing the fan out of view.
  * *Iteration*: Integrated drag damping friction and viewport clamping boundaries, ensuring the fan spread remains comfortably visible across all input velocities.
* **User Insight 2: Interaction Flow Dead-End**
  * *Feedback*: Evaluators reported momentary confusion after completing an interpretation, lacking an obvious way to initiate another draw without refreshing the browser.
  * *Iteration*: Added an animated `RESET` button beneath the interpretation panel, complete with an arpeggiated shuffle sound effect and card flip-back transition to close the loop.

---

## 5. Contributors & Development History

### A. Sole Contributor
* **ZHOU Xuantong (Sole Contributor & Developer)**:
  * Complete, independent ownership of the project: concept formulation, narrative worldbuilding, Three.js 3D interactive graphics implementation, procedural audio and BGM synthesis, user interface design, user testing, deployment, and technical documentation.

### B. Commit History Milestones
Project evolution was maintained via incremental, traceable version control commits:
1. `feat: add initial project structure and basic 3D card layout` — Core Three.js scene setup, perspective camera, and lighting.
2. `feat: enhance UI style with Y2K retro cyberpunk aesthetics` — CRT scanline overlay, pixel borders, and neon visual styling.
3. `feat: adjust card positions and accordion fan spread algorithm` — Implementation of radial arc positioning and pointer-drag lerp physics.
4. `feat: reposition reading panel below cards to prevent overlapping` — Spatial layout refactor separating 3D cards from dynamic typography.
5. `feat: add retro sound effects via Web Audio API & BGM integration` — Native Web Audio synthesizer integration and audio management.
6. `docs: add detailed interaction and design concept documentation` — Bilingual specification documents and UX rationale.
7. `docs: add screenshots and compressed demo video` — Video payload compression and multi-step walkthrough visual documentation.

---

## 6. Acknowledgements & References

This project adheres to academic integrity and open-source standards. Borrowed libraries, reference algorithms, and media assets are declared below:

### A. Libraries & Frameworks
* **Three.js (r128)**: WebGL 3D rendering pipeline and spatial matrix math (Licensed under the MIT License).
* **Web Audio API**: Native browser interface utilized for runtime sound synthesis without external audio files.

### B. Media & Visual Assets
* **Card Face & Back Textures (`assets/*.jpg`)**:
  * Visual concepts generated using Midjourney, followed by manual downsampling, color grading, and texture packaging in Photoshop to achieve low-fidelity pixel fidelity.
* **Background Soundtrack (`assets/bgm.m4a`)**:
  * Ambient synthwave track used under Creative Commons (CC BY 4.0) licensing for non-commercial educational demonstrations.

### C. Algorithmic References
* The radial accordion spread was adapted from parametric arc calculations in computer graphics literature (Archimedean Arc Distribution).
* Pointer movement smoothing utilizes standard linear interpolation (`Lerp: Current += (Target - Current) * Factor`).