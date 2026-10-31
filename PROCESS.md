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