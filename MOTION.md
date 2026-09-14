# Apple-Inspired Motion Master

**A cross-platform motion specification for Codex and product teams**  
Version 1.0 | Research checked September 12, 2026  
Suggested repository filename: `MOTION.md`

This is an implementation reference for websites, web apps, mobile apps, and desktop software. It combines Apple's public motion guidance with original, practical recipes for building responsive interfaces. It is not Apple's internal design specification, a frame-by-frame audit of every Apple product, or a promise that a single animation preset fits every platform.

The objective is not to put animation everywhere. It is to make actions feel immediate, objects feel connected, and transitions feel deliberate. A restrained productivity app and an immersive music player should not move in the same way.

## Evidence and authority

| Label | Meaning | How to use it |
|---|---|---|
| **APPLE** | A principle or capability documented by Apple | Follow the linked source and the target platform's current behavior |
| **OBSERVED** | A visible state in an inspected reference | Use its hierarchy, geometry, and relationship between elements, not an invented duration |
| **RECIPE** | An original implementation recommendation in this document | Treat values as starting points, then test in the actual product |
| **MEASURE** | A detail that needs a device recording or performance trace | Do not describe it as verified until measured |

**All numerical motion tokens, gesture thresholds, timing ranges, and budgets below are RECIPE values unless explicitly attributed otherwise. They are not claimed to be Apple's private constants.** Spring implementations differ between frameworks. A screenshot cannot establish easing, velocity, animation duration, or the rendering technique used between states.

The research includes Apple Human Interface Guidelines, developer documentation, WWDC session transcripts and accompanying code, current web and framework documentation, accessibility standards, and inspected Mobbin previews. It does not include controlled frame-by-frame measurements of Apple applications. Newer and beta APIs are optional references, not minimum requirements. Verify deployment targets and installed package versions before implementing them.

<a id="navigation"></a>
## Reading map

| Need | Start here |
|---|---|
| Give Codex its instructions | [Operating contract](#contract), [adoption prompt](#codex) |
| Set the feel of a product | [Profiles](#profiles), [tokens](#tokens), [motion grammar](#grammar) |
| Find a specific interaction | [120-pattern catalog](#catalog) |
| Build a player like Apple Music | [Media system](#media), patterns P061–P072 |
| Build fluid navigation and sheets | [Shared elements](#shared), [interactive sheets](#sheets) |
| Add current Apple material behavior | [Liquid Glass](#glass) |
| Build a marketing website | [Editorial and scroll motion](#websites) |
| Handle loading and live data | [Async state](#async), patterns P049–P060 |
| Choose an implementation approach | [Platform adapters](#platforms), [reference code](#code) |
| Make it accessible and fast | [Accessibility](#accessibility), [performance](#performance) |
| Review a finished implementation | [Tests](#tests), [quality gates](#quality) |
| Verify a claim or inspect a reference | [Research ledger](#research), [sources](#sources) |

<a id="contract"></a>
## 1. Operating contract for Codex

Read this section before changing an interface. Read the relevant recipes and platform section before writing motion code. Read the accessibility and testing sections before considering the implementation finished.

### Order of priority

1. Correct application state, user control, and accessibility.
2. Immediate response and readable content.
3. Continuity between related states.
4. Consistency within the product and its platform.
5. Visual richness that survives the first four requirements.

These priorities resolve conflicts. A beautiful transition that loses keyboard focus, blocks a second click, hides an error, or delays a real result is a failed transition.

### Non-negotiable implementation rules

- Keep input handling independent of animation completion. Never wait for a visual flourish before saving, navigating, canceling, or accepting the next legitimate action.
- Use native controls and native navigation where they already provide the correct behavior. Do not replace them merely to demonstrate custom animation code.
- Give each animated property one owner. Do not let CSS, a gesture handler, a layout library, and a timeline all write `transform` on the same element.
- Retarget from the current displayed state. Do not restart from an obsolete starting position after an interruption.
- Preserve stable object identity. A selected photo remains the same photo when it becomes a viewer. A playing track remains the same track when its player expands.
- Treat reduced motion as a distinct presentation mode, not a global speed-up. Remove nonessential travel, zoom, parallax, oscillation, and ambient movement.
- Preserve normal scrolling, browser history, keyboard operation, and platform window behavior.
- Render useful content without waiting for animation code or JavaScript hydration. Do not ship an invisible page that depends on a reveal observer to become readable.
- Respect the existing `DESIGN.md`, design tokens, component library, and framework. Resolve conflicts explicitly. This document does not authorize a visual redesign or a stack rewrite.
- Do not add continuous motion to a utility interface by default. Media and editorial treatments are explicit exceptions with their own controls and performance checks.
- Add no new animation dependency when the existing stack or CSS can handle the interaction cleanly.
- Keep original source links in project documentation. Do not claim an approximation is a verified reproduction of Apple's implementation.

### Required output when implementing

Create a small inventory of the interactions actually used by the product. For each one, record the recipe ID, state changes, animation owner, input methods, reduced-motion behavior, cancellation behavior, and tests. Implement shared tokens before adding local exceptions. Report what was tested on a real runtime and what remains unverified.

<a id="apple-basis"></a>
## 2. What the Apple research establishes

### Motion should answer an interaction

**APPLE.** Apple's motion guidance favors purposeful, brief motion that respects accessibility and input method. Its fluid-interface teaching emphasizes responsiveness, interruption, and coherent spatial relationships. The practical implication is to make a second action work while the first transition is still moving, rather than locking the interface until it settles. [A01] [A02]

### Springs are not synonymous with bounce

**APPLE.** Apple's spring teaching distinguishes the spring's response from visible oscillation. A spring can approach its destination without bouncing. It also explains why preserving velocity matters when a moving object receives a new target. Use this distinction when deciding whether a control needs a physical response or only a short color change. [A03]

### Identity is more important than a generic page effect

**APPLE.** Apple's zoom-transition material connects a source view with its destination and discusses interactive navigation. Its framework guidance also separates state changes from the animated presentation of those changes. For a custom implementation, preserve the object and its location rather than applying the same slide to every screen. [A04] [A06] [A07]

### New material behavior is not just a blur filter

**APPLE.** Liquid Glass is described through optical and interactive behavior, including adaptation to context. Apple also supplies native containers and identity mechanisms for related glass elements. On the web, a translucent panel can borrow the hierarchy and restraint, but it should not be presented as the same rendering system. [A08] [A09] [A10] [A11]

### Complex media effects can be composed from simpler parts

**APPLE.** A WWDC26 graphics session builds a music-inspired podcast experience from artwork, shader effects, time, and a synchronized transcript. This is a documented example of a construction method, not disclosure of Apple Music's production renderer. Its usefulness is the separation of background rendering, playback state, and foreground text. [A18]

### Newer material does not replace the fundamentals

**APPLE.** WWDC26 design material continues to emphasize intentionality, consistency, agency, and craft. New framework sessions add capabilities, but a newer API is not a reason to make a routine action more elaborate. Read the actual availability annotations before using current or beta features. [A15] [A16] [A17]

<a id="profiles"></a>
## 3. Product profiles and motion policy

Choose one default profile for the application. Individual surfaces can opt into a different profile when their purpose changes. An application does not need a single maximum level of visual activity everywhere.

| Profile | Appropriate contexts | Default behavior | Exceptions requiring a reason |
|---|---|---|---|
| **Utility** | Finance tools, dashboards, forms, settings, dense tables, developer tools | Immediate state feedback, subtle color transitions, quiet layout changes, no ambient motion | Shared-object expansion when it improves orientation |
| **Standard app** | Task managers, calendars, content browsers, personal tools | Utility behavior plus spatial navigation, sheets, small object continuity | One focal flourish for a meaningful event |
| **Media** | Now Playing, photo viewers, listening or viewing experiences | Persistent media identity, artwork transitions, optional subdued atmosphere | Slow background movement only on an explicitly immersive surface |
| **Editorial** | Product stories, launch pages, visual explainers | Controlled section choreography and a limited number of scroll-linked demonstrations | Pinned storytelling or 3D when it communicates the product |

### Three effective motion modes

**Full** allows the chosen profile's motion. **Reduced** removes nonessential spatial movement and substitutes direct changes or short opacity changes. **Off** removes discretionary animation, including fades and decorative loops. Essential real-time content can still update without an added transition.

The default application setting is **Follow system**. The user can choose **Reduced** or **Off**. An application-level setting must not silently defeat a system request for reduced motion. A product that offers more complex preference controls must make the consequences explicit and keep an accessible conservative default.

### Profile does not override input method

Touch can support direct manipulation of an object. A mouse needs precise targets and quiet hover feedback. Keyboard navigation needs immediate, visible focus. A stylus interaction should preserve drawing precision. A television focus system should use its platform conventions. Do not scale a desktop table cell because a touch-first card can respond to a finger. Apple's guidance and pointer sessions distinguish these contexts. [A01] [A25] [A26]

### Quiet defaults

The initial state is visible and still. Hover changes the affordance, not the page layout. A button acknowledges pressure without leaping toward the pointer. Repeated tasks use the shortest useful transition. Existing content stays present during refresh. Full-page fades are not the default route treatment.

### Selecting an exception

Before adding an expressive effect, finish this sentence: “This motion helps the user understand ______.” Acceptable answers name an object, action, change, or relationship. “It looks premium” does not identify an interaction requirement.

<a id="grammar"></a>
## 4. Motion grammar

### Causes and ownership

Every motion has a cause: input, state change, navigation, ongoing media, or a deliberately requested story. Match its start to that cause. A button should respond to contact, while a success indicator should respond to confirmed success. Those are different events and can occur far apart.

For each surface, distinguish the logical state from its presentation. `open = false` is a state decision. A panel that is still visually exiting is a temporary rendering condition. The exit layer must not continue accepting actions as though it were open.

### Four motion families

| Family | What controls progress | Suitable examples | Wrong substitution |
|---|---|---|---|
| **Discrete** | A state change starts a bounded transition | Toggle, menu reveal, status replacement | Repeating it forever to attract attention |
| **Continuous interaction** | Current input directly determines the pose | Drag, scrub, resize, pinch | Easing behind the finger while dragging |
| **Settling** | A physical or timed response resolves the released pose | Sheet detent, snap, return from a canceled drag | Restarting from the pose before the drag |
| **Ambient or time-driven** | A clock, playback time, or deliberate story timeline | Media atmosphere, visualizer, product demonstration | Running it on every background panel |

### Spatial relationships

Use the actual source as the origin of a related expansion. Use a navigation direction only when it describes hierarchy. Do not send a dialog toward a random corner because it looks energetic. Distinguish forward and backward navigation when the information structure supports that distinction.

A modal changes the current interaction context. A tooltip does not. A tab changes a peer destination. A disclosure reveals detail within the same context. These relationships deserve different treatments.

### Continuity at interruption

Position continuity means the object does not jump. Velocity continuity means it does not abruptly lose its current movement when redirected. Both matter for dragged or spring-driven objects. A short opacity fade generally does not need a full physical model.

When the user reverses an action, choose the new destination immediately. Capture the current pose and, where supported, its velocity. Do not queue the reversal behind a full completion. Keep the destination state correct even when the rendering engine cannot preserve every motion detail.

### Distance, size, and visual weight

Use small travel for a small control. Use measured geometry for a true expansion. A full-screen card transition is not a 12-pixel tooltip transition with a longer duration. Large surfaces need more careful coordination because they move more of the visual field.

For a broad panel, prefer a quiet shape and readable content over a large overshoot. For text, preserve size and legibility wherever possible. Do not apply a container scale that makes paragraphs stretch during a routine layout change.

### Entering and leaving

An entrance establishes an object. An exit removes it without withholding the next task. Related objects can reverse their path when returning to their source. Unrelated status messages usually need only a fade. Do not assume every exit must be the exact mathematical reverse of its entrance.

Background, container, artwork, and controls do not need to start at exactly the same instant. They do need to feel like one event. Prefer overlap over a long chain of dependent steps.

### One focal event at a time

Choose the primary moving object. Supporting surfaces should either remain stable or reinforce that object's transition. Avoid combining a card zoom, full-screen blur change, title slide, staggered grid, bouncing icon, and camera parallax in the same ordinary navigation event.

<a id="tokens"></a>
## 5. Original motion tokens

These presets are designed to be a restrained starting point for cross-platform work. They are not copied Apple values. Keep them centralized and change the token before adjusting twenty components individually.

### Duration tokens

| Token | Milliseconds | Intended role |
|---|---:|---|
| `instant` | 0 | Focus visibility, direct manipulation, explicit Off mode |
| `contact` | 70 | Small pressure acknowledgment |
| `quick` | 120 | Hover, small tint change, reduced-mode fade |
| `feedback` | 180 | Icon replacement, small state feedback |
| `settle` | 240 | Menu, compact disclosure, local layout change |
| `surface` | 320 | Panel, sheet, moderate spatial transition |
| `spatial` | 420 | Related object expansion when it needs more travel |
| `cinematic` | 600 | Rare editorial or media change, not routine controls |

Duration is a target for a timed transition, not a demand to make every effect last that long. In a physical spring, use settling behavior and response quality rather than forcing a fixed completion time. Do not use a long token to compensate for a slow network request.

### Easing tokens

| Token | CSS curve | Use |
|---|---|---|
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | Quiet UI changes with a clear arrival |
| `arrive` | `cubic-bezier(0.22, 1, 0.36, 1)` | A surface arriving at rest |
| `depart` | `cubic-bezier(0.4, 0, 1, 1)` | A short removal with a known destination |
| `symmetric` | `cubic-bezier(0.4, 0, 0.2, 1)` | A bounded change where both endpoints matter |
| `linear` | `linear` | Progress tied to real quantities or constant-speed clocks |

There is no universal “Apple easing.” A curve describes progress over a chosen time. It does not preserve gesture velocity just because its shape resembles a spring.

### Physical spring presets

The following values use a common mass, stiffness, and damping model. Use them directly only in an engine that uses those parameters with compatible units. Translate the behavior, not the raw numbers, for other engines.

| Preset | Mass | Stiffness | Damping | Intended response |
|---|---:|---:|---:|---|
| `control` | 1 | 500 | 46 | Tight, effectively non-bouncy small control |
| `surface` | 1 | 320 | 36 | Controlled panel settling |
| `spatial` | 1 | 220 | 30 | Gentle large-object arrival without deliberate bounce |
| `expressive` | 1 | 300 | 27 | Optional mild overshoot for a small focal object |

For the ideal mass-spring-damper model, damping ratio is `damping / (2 * sqrt(stiffness * mass))`. A ratio at or above one does not produce oscillation from rest. A large initial velocity can still carry an object past its target, so “non-bouncy preset” is not permission to ignore release velocity or bounds.

Apple's spring APIs and Motion's transition APIs offer different ways to specify responses. In Motion, physical springs can incorporate current velocity, while its duration-and-bounce form does not provide the same velocity-based behavior. Do not mix these parameterizations or assume equal-looking duration values mean equal motion. [A03] [W03]

### Distance, scale, and choreography

| Quantity | Default recipe |
|---|---|
| Small positional cue | 2–4 CSS pixels, only when it explains state |
| Menu or popover entrance | 4–8 pixels from its anchor |
| Local panel or disclosure travel | 8–12 pixels, when not driven by true layout |
| Editorial reveal | At most 24 pixels by default |
| Press scale for a small visual child | `0.98`, optional |
| Hover scale | None by default |
| Large dialog or panel scale | None by default |
| Stagger within one short editorial group | 25–40 milliseconds, capped total delay of 120 milliseconds |
| Repeated list or table row stagger | None |
| Shared-object travel | Actual measured source and destination geometry |
| Reduced-mode opacity transition | 0–120 milliseconds |

CSS pixels, native points, and Android density-independent pixels are not interchangeable implementation units. Use the platform's logical units and validate on its real screen. The purpose of the table is to constrain visual amplitude, not to impose the same physical size on every device.

### Timing rules that prevent sluggishness

Start the visible response in the first eligible rendering update. The `contact` token controls the response's short transition, not a waiting period before the response begins. Start real work immediately. Reveal a loading indicator only when it helps, but never hold back a completed result to make a spinner finish a cycle.

Use exit durations at or below the corresponding entrance duration unless a return-to-source relationship requires more time. Let secondary content overlap the main transition rather than making the user wait through several consecutive animations.

<a id="state"></a>
## 6. State, interruption, and gesture contracts

### Separate state machines

A media application can be `playing` while its player is `collapsed`, `opening`, `expanded`, or `closing`. A save operation can be `pending` while a panel is `closing`. Keep these state machines separate. A visual transition must not restart playback or cancel a save unless the user action explicitly requires that behavior.

A useful surface machine is:

```text
closed -> opening -> open -> closing -> closed
             |        |         |
             +--------+---------+--> retarget from current pose

Any state -> disposed
A pointer-driven surface may enter dragging from an eligible visible state.
Dragging -> settle-open | settle-closed | settle-to-detent
Pointer cancellation -> settle to the last valid committed destination
```

Do not infer business state from an animation's current progress. Keep the intended destination explicit.

### Interruption policy

| Event | Required response |
|---|---|
| Open during closing | Reverse or retarget from the current visible pose |
| Close during opening | Accept immediately and move toward closed |
| Target changes repeatedly | Keep the newest valid target, not a queue of obsolete transitions |
| Source disappears | Use a safe fade or direct replacement rather than flying to a stale rectangle |
| Component unmounts | Stop its animation, release listeners, and remove temporary layers |
| Preference changes to Reduced or Off | Stop prohibited motion immediately and resolve to a valid pose |
| Window becomes hidden | Suspend discretionary loops and keep logical time separate |
| Resize changes geometry | Remeasure or finish into the valid new layout, never keep stale bounds |
| Network result arrives after cancellation | Ignore it unless the operation's explicit recovery policy permits it |

### Direct manipulation

During a drag, the object's pose follows the input rather than a timed easing curve. Store motion values outside framework render loops where the chosen engine permits it. On release, pass the current pose and velocity to the settle phase. Do not apply a second smoothing layer on top of already-smoothed input.

Preserve normal scrolling unless the gesture clearly belongs to the custom control. Decide axis ownership before taking over a gesture. A horizontal slider inside a vertical page should not make the entire page stop scrolling after a tiny diagonal movement.

Use pointer capture where appropriate and handle `pointercancel`, lost capture, window blur, and a second pointer. Set touch behavior for the specific gesture surface, not for the whole document. These are design requirements for the implementation, not justification for blocking platform navigation gestures.

### Transform ownership

Separate wrapper roles when necessary:

```text
semantic target and layout box
  -> layout-transition wrapper
     -> gesture-position wrapper
        -> press-feedback visual
           -> content
```

This is a conceptual ownership model, not a command to add four wrappers to every button. Use fewer elements when one owner can safely compose the effects. Keep accessibility semantics on the real target and keep decorative wrappers out of the reading order.

<a id="catalog"></a>
## 7. Catalog of 120 interaction patterns

Every pattern below is a **RECIPE**. The catalog translates researched principles into a reusable design system. It is not a claim that Apple implements each named pattern with these values.

Notation: **Motion** specifies the normal presentation. **Control** describes interruption, state, or input handling. **Reduced** is the alternative when nonessential spatial motion is disabled. Off mode resolves discretionary effects directly. Durations are milliseconds unless stated otherwise.

### Pattern lookup

| Family | Range | Common starting points |
|---|---|---|
| Controls | P001–P012 | [Pressure](#p001), [hover](#p002), [focus](#p003), [slider](#p010) |
| Feedback and forms | P013–P024 | [Pending](#p014), [success](#p015), [failure](#p016), [toast](#p019) |
| Navigation | P025–P036 | [Card expansion](#p029), [sheet](#p030), [dialog](#p031), [search](#p034) |
| Layout and gestures | P037–P048 | [Reordering](#p039), [resize](#p042), [zoom](#p045), [dismiss](#p047) |
| Loading and live content | P049–P060 | [Skeleton](#p051), [progress](#p052), [streaming](#p059), [chat](#p060) |
| Media | P061–P072 | [Player expansion](#p061), [background](#p064), [lyrics](#p068), [waveform](#p071) |
| Desktop and data | P073–P084 | [Window resize](#p074), [tables](#p079), [charts](#p080), [save state](#p083) |
| Websites | P085–P096 | [Hero](#p085), [sticky story](#p087), [routes](#p092), [theme](#p094) |
| Complex surfaces | P097–P108 | [Calendar](#p097), [map](#p098), [onboarding](#p104), [mixed input](#p108) |
| Accessibility and system | P109–P120 | [Reduced motion](#p109), [viewport](#p112), [spatial hover](#p118), [print](#p120) |

### Controls and local affordances

<a id="p001"></a>
#### P001. Button pressure

**Trigger and state:** Contact changes a button from rest to pressed, then release or cancellation returns it to rest. **Motion:** Change the surface tint over `contact`. Optionally scale only its inner visual to `0.98` for a small, touch-oriented control. Use `control` spring or `quick` to release. **Control:** Keep the actual hit box fixed, support keyboard activation, and restore immediately after pointer cancellation. Action execution follows the button's normal activation semantics. **Reduced:** Tint feedback without scale. Never bounce every button or shrink its clickable region.

<a id="p002"></a>
#### P002. Pointer hover

**Trigger and state:** A hover-capable pointer enters an interactive target. **Motion:** Change background, border, or icon emphasis over `quick`. A thumbnail may reveal an existing action overlay without moving the thumbnail. **Control:** Restrict hover styling to appropriate input capability. Leaving midway reverses from the current presentation. Do not move the target away from the pointer. **Reduced:** The same color feedback or a direct state change. Never make essential information or the only action available exclusively on hover.

<a id="p003"></a>
#### P003. Keyboard focus

**Trigger and state:** Keyboard focus moves to a control. **Motion:** Show the focus indicator immediately. An existing selection indicator may settle independently, but the user must not wait to locate focus. **Control:** Keep focus visible through scrolling, transitions, and disabled-state changes. Focus is not selection, hover, or activation. **Reduced:** Immediate focus indication. Do not animate the focus ring through intermediate controls or hide it until a decorative entrance completes.

<a id="p004"></a>
#### P004. Toggle switch

**Trigger and state:** The checked state changes. **Motion:** Prefer the native control. For a justified custom control, move the thumb within a fixed track over `feedback` or with `control` spring while its color changes. **Control:** A second activation retargets immediately. Keep the checked state and accessible value authoritative even while the thumb is moving. **Reduced:** Direct thumb position and color update. Do not use the toggle animation to imply that a server-side preference has already been saved.

<a id="p005"></a>
#### P005. Checkbox and radio selection

**Trigger and state:** An item becomes selected or unselected. **Motion:** Use a short opacity or symbol replacement over `quick` to `feedback`. A tiny checkmark draw is optional when it remains legible. **Control:** Radio groups preserve their keyboard navigation and only one selected value. Rapid selection should not replay an entire introduction sequence. **Reduced:** Direct selected state. Do not scale the whole label or send a ripple across the surrounding form.

<a id="p006"></a>
#### P006. Segmented control

**Trigger and state:** Selection moves between peer options. **Motion:** Move one selection background to the actual chosen segment with `control` spring or `feedback`. Keep labels fixed. **Control:** Retarget directly across multiple segments and account for variable label widths. Keyboard behavior must match the chosen control semantics. **Reduced:** Move the highlight directly or crossfade it briefly. Do not horizontally slide the entire page merely because a segment changed.

<a id="p007"></a>
#### P007. Menu button and menu reveal

**Trigger and state:** The menu opens from its invoker. **Motion:** Reveal an anchored surface with a 4–8-pixel offset and opacity over `feedback` to `settle`. Use the correct anchor edge. **Control:** Keep placement inside the available viewport, handle Escape, and let the menu primitive manage focus. Reverse a close during opening. **Reduced:** Opacity only or direct reveal. The menu should not grow from a distant screen corner or require every item to appear in sequence.

<a id="p008"></a>
#### P008. Tooltip

**Trigger and state:** A nonessential explanatory label is requested by hover or focus. **Motion:** After the product's intentional discovery delay, use a small opacity change over `quick`. Delay and animation duration are separate settings. **Control:** Dismiss on the appropriate input change and avoid leaving an orphan tooltip during scrolling. Keep interactive content in a suitable popover, not a tooltip. **Reduced:** Direct appearance. Do not use tooltip delay for essential error text or hide control labels behind tooltips.

<a id="p009"></a>
#### P009. Disclosure and accordion

**Trigger and state:** A region expands within the current context. **Motion:** Prefer a measured, local layout transition over `settle` with a simple chevron rotation. Keep body text at its final font size. **Control:** Rapid toggles retarget. Hidden content must not remain keyboard-reachable. Remeasure when content or font size changes. **Reduced:** Direct layout update and chevron state. Avoid a huge `max-height` hack that causes uneven timing or a scaled paragraph that looks squeezed.

<a id="p010"></a>
#### P010. Slider

**Trigger and state:** The user drags, clicks, or adjusts a value with the keyboard. **Motion:** During direct manipulation, thumb position follows the actual value without easing. A programmatic noninteractive change may use `quick`. **Control:** Keep the track's geometry stable, clamp values, support steps, and expose the current value accessibly. A released thumb may snap to a discrete value without overshoot. **Reduced:** Direct position updates. Do not smooth the user's input so much that the control trails their hand.

<a id="p011"></a>
#### P011. Text input and floating label

**Trigger and state:** Focus or content changes the field's presentation. **Motion:** Change border or tint over `quick`. A floating label can move between two deliberate positions over `feedback` if the design genuinely needs it. **Control:** Do not animate the typed text, caret, selection, or input width on every keystroke. Preserve composition input and autofill. **Reduced:** Direct label placement and focus styling. Avoid shifting the field when a label becomes active.

<a id="p012"></a>
#### P012. Combobox and suggestions

**Trigger and state:** Typing or an explicit action reveals suggestions. **Motion:** Reveal the suggestion surface over `quick` to `feedback`. Update results without a fresh entrance for every keystroke. **Control:** Keep active-option identity stable when possible, handle stale responses, and preserve keyboard navigation. Close cleanly if the field loses its relevant context. **Reduced:** Direct results update. Do not animate options into different positions while the user is about to select one.

### Feedback, forms, and completion

<a id="p013"></a>
#### P013. Inline validation

**Trigger and state:** A field receives a confirmed validation result. **Motion:** Add concise text with a local opacity change over `quick`, with controlled layout expansion when needed. **Control:** Validate at an appropriate moment rather than punishing every incomplete keystroke. Keep the message associated with the field and preserve the user's input. **Reduced:** Direct message. Do not shake the entire form or replace the explanation with a red pulse.

<a id="p014"></a>
#### P014. Pending submission

**Trigger and state:** A real request starts. **Motion:** Keep the button's footprint stable and replace its label or supporting icon with a pending state. A delayed spinner appearance can avoid flashing on very fast requests. **Control:** Prevent duplicate non-idempotent submissions logically, not by waiting for an animation. Let relevant cancellation work. **Reduced:** Static pending label and truthful status updates. Do not delay the request, hide its completion, or show an endless disabled button after failure.

<a id="p015"></a>
#### P015. Confirmed success

**Trigger and state:** The operation actually succeeds. **Motion:** Replace the pending indicator with a check or status over `feedback`. A one-time small symbol effect is optional for a meaningful milestone. **Control:** Keep the success state readable without trapping the user on it. Record completion in data before any animation callback. **Reduced:** Direct success text and icon. Do not play confetti for every save, copy, or checkbox.

<a id="p016"></a>
#### P016. Failure feedback

**Trigger and state:** An operation fails or a requested action is unavailable. **Motion:** Use a stable error message and a brief state replacement. Reserve a tiny local attention cue for exceptional cases, not as the primary explanation. **Control:** Preserve recoverable data, offer retry when valid, and distinguish cancellation from failure. **Reduced:** Static error state. Never leave a success check visible while the actual operation has failed.

<a id="p017"></a>
#### P017. Warning or destructive confirmation

**Trigger and state:** A consequential action needs confirmation. **Motion:** Present an appropriate dialog or anchored confirmation using the surface's normal motion. **Control:** Make the action labels explicit, use deliberate focus management, and permit a clear cancel path. The warning itself does not need a shaking icon. **Reduced:** Direct dialog or short opacity reveal. Do not visually minimize the consequence with a playful spring or disappearing explanation.

<a id="p018"></a>
#### P018. Delete and undo

**Trigger and state:** A reversible item removal is accepted. **Motion:** Remove the item with a short opacity change and quiet neighboring layout adjustment. **Control:** Preserve its data and identity for the undo period. Undo restores a valid position without replaying a long entrance. Explain when a deletion is not reversible. **Reduced:** Direct removal and restoration. Do not fly the item toward a trash icon that is not actually visible or delay deletion until a decorative collapse finishes.

<a id="p019"></a>
#### P019. Toast or status banner

**Trigger and state:** A nonmodal event needs acknowledgment. **Motion:** Use opacity and, only when useful, a small edge-related offset over `feedback`. **Control:** Avoid stacking a wall of messages. Keep essential information available elsewhere. Pause or extend dismissal when interaction requires it, and do not steal focus. **Reduced:** Opacity only or direct state. Do not announce every animation frame to assistive technology.

<a id="p020"></a>
#### P020. Badge and unread count

**Trigger and state:** A count or attention state changes. **Motion:** Replace the value directly or with a short local crossfade. A single small emphasis is optional for the first meaningful new event. **Control:** Coalesce rapid updates and preserve the actual numeric value. **Reduced:** Direct change. Never keep a badge pulsing indefinitely or enlarge the entire navigation item every time a background event arrives.

<a id="p021"></a>
#### P021. Icon state replacement

**Trigger and state:** One semantic state becomes another, such as play to pause or bookmark to saved. **Motion:** Use a supported symbol replacement or a simple crossfade over `feedback`. **Control:** Keep the control's location, accessible name, and hit target consistent with its current action. Retarget rapid changes. **Reduced:** Direct replacement or opacity only. Do not morph unrelated shapes with a path interpolation that twists through illegible intermediate forms.

<a id="p022"></a>
#### P022. Copy confirmation

**Trigger and state:** Clipboard writing succeeds. **Motion:** Replace the copy icon or show a compact confirmation over `quick`. **Control:** Confirm success only after the clipboard operation resolves. Handle permission failures. Keep a repeat action usable. **Reduced:** Direct “Copied” status. Do not show success merely because the user clicked, and do not move the button while the pointer remains over it.

<a id="p023"></a>
#### P023. File drop target

**Trigger and state:** An eligible drag enters a valid drop region. **Motion:** Change border and surface emphasis over `quick`. **Control:** Use nested drag-enter bookkeeping or equivalent logic to avoid flicker across child elements. Distinguish acceptable files from invalid types and preserve a file-picker alternative. **Reduced:** Direct highlight. Do not animate the entire window or treat a hover over the target as a completed upload.

<a id="p024"></a>
#### P024. Conditional form fields

**Trigger and state:** A choice makes additional fields relevant. **Motion:** Reveal the new group with a compact local layout transition over `settle`, not a cascade of individual inputs. **Control:** Preserve existing values according to the form's explicit rules. Move focus only when the interaction calls for it, not automatically on every reveal. **Reduced:** Direct layout update. Do not leave hidden required fields that block submission without an explanation.

### Navigation and presentation

<a id="p025"></a>
#### P025. Hierarchical navigation

**Trigger and state:** The user enters a deeper destination. **Motion:** Prefer native navigation. On a custom web app, choose a consistent restrained spatial transition or direct route change that matches the hierarchy. **Control:** History, scroll restoration, focus, and title changes remain correct. Repeated navigation never queues obsolete pages. **Reduced:** Direct change or short opacity replacement. Do not invent a full-screen horizontal slide for every website link.

<a id="p026"></a>
#### P026. Interactive back navigation

**Trigger and state:** The user begins a platform-supported return gesture. **Motion:** Let the native transition track the gesture. A custom implementation must preserve both the current and previous destination while progress is interactive. **Control:** Cancellation returns to the current route without corrupting history. Completion occurs once. **Reduced:** Preserve navigation capability without unnecessary zoom or travel. Do not capture an operating-system edge gesture just to provide a less capable imitation.

<a id="p027"></a>
#### P027. Tab switching

**Trigger and state:** The selected peer destination changes. **Motion:** Move or replace the selection indicator. Change the content directly or with a short contextual fade. **Control:** Preserve each tab's relevant state and scroll position. Distinguish tab activation from merely focusing a tab when the chosen keyboard model requires it. **Reduced:** Direct selection and content. Avoid sliding unrelated destinations through every intermediate tab.

<a id="p028"></a>
#### P028. Sidebar expansion and collapse

**Trigger and state:** A navigation rail changes width or presence. **Motion:** Use a contained `settle` to `surface` layout transition if the workspace benefits. Keep text unscaled and align the content's new layout deliberately. **Control:** Handle window resizing and keyboard focus in disappearing controls. **Reduced:** Direct reflow. Do not animate a large data table's every cell while the sidebar changes.

<a id="p029"></a>
#### P029. Card-to-detail expansion

**Trigger and state:** A selected object becomes a detail surface. **Motion:** Connect actual source and destination bounds, with container and media continuity over `surface` to `spatial`. Reveal new text separately instead of stretching it. **Control:** Use stable identity, handle scrolling and missing sources, and allow reversal. **Reduced:** Direct navigation or opacity replacement. Do not animate a duplicate interactive copy of the card above the real destination.

<a id="p030"></a>
#### P030. Sheet presentation

**Trigger and state:** A task-specific surface appears above the current context. **Motion:** Prefer the platform sheet. A custom sheet arrives from its relevant edge with a quiet `surface` response and coordinated backdrop. **Control:** Define detents, dismissal permissions, nested scroll behavior, focus, and Escape before implementing the animation. **Reduced:** Direct surface or short opacity change. Do not assume every bottom panel is modal or every sheet can be dismissed without data loss.

<a id="p031"></a>
#### P031. Modal dialog

**Trigger and state:** Interaction is temporarily restricted to a dialog. **Motion:** Use opacity over `feedback`, optionally with a very small offset when the product benefits. Keep large-scale zoom out of the default. **Control:** Make the background noninteractive, manage focus, provide an appropriate close path, and restore focus after dismissal. **Reduced:** Direct or opacity-only reveal. A visual backdrop alone does not make a dialog accessible or modal.

<a id="p032"></a>
#### P032. Anchored popover

**Trigger and state:** Related content opens beside a control. **Motion:** Reveal toward available space from the invoker over `feedback`. **Control:** Reposition after viewport changes, keep its relationship visible, and choose modal or nonmodal semantics intentionally. Closing must not leave a invisible pointer-blocking surface. **Reduced:** Direct or opacity-only reveal. Do not stretch a popover across the page when a compact anchored surface communicates the relationship.

<a id="p033"></a>
#### P033. Context menu

**Trigger and state:** A platform-recognized contextual action requests commands. **Motion:** Prefer native or established accessible menu behavior. A custom menu gets the same anchored treatment as P007. **Control:** Support a keyboard route and avoid conflicts with text selection, long-press behavior, or browser context menus without a clear reason. **Reduced:** Direct menu. Do not infer that every long press should lift, blur, and enlarge the underlying content.

<a id="p034"></a>
#### P034. Expanding search

**Trigger and state:** A compact search affordance becomes an active search area. **Motion:** Connect the container's geometry over `settle` and establish a stable field before showing results. **Control:** Focus the input appropriately, handle the virtual keyboard, and cancel without discarding useful context unintentionally. **Reduced:** Direct field placement. Do not scale live input text or let decorative geometry changes break caret placement.

<a id="p035"></a>
#### P035. Command palette

**Trigger and state:** A shortcut or explicit command opens global search and actions. **Motion:** Use a stable dialog-sized surface with a short opacity reveal. **Control:** Focus the query input, make Escape predictable, restore the invoker or logical fallback, and update results without row entrances on each keystroke. **Reduced:** Direct presentation. A palette used repeatedly should not play an elaborate opening every time.

<a id="p036"></a>
#### P036. Authentication and system presentations

**Trigger and state:** The application requests a platform-owned permission, authentication flow, share surface, or payment interface. **Motion:** Let the system own its presentation. Limit custom motion to the surrounding application's transition into the request state. **Control:** Handle cancellation and returning focus without assuming success. **Reduced:** Respect the system's behavior. Do not imitate a security or payment success animation to suggest an action the operating system has not confirmed.

### Layout and gestures

<a id="p037"></a>
#### P037. List insertion

**Trigger and state:** A new item enters a stable list. **Motion:** Add it at the correct position with a brief local fade and optional quiet layout adjustment. **Control:** Preserve the user's scroll anchor, focused item, and selection. Coalesce batches instead of animating hundreds of additions. **Reduced:** Direct insertion with a stable viewport. Do not push a reading user downward every time a background feed update arrives.

<a id="p038"></a>
#### P038. List removal

**Trigger and state:** An item leaves the visible collection. **Motion:** Fade the item briefly and resolve adjacent layout over `settle` when the list is small enough. **Control:** Move focus to a logical surviving target if the removed item held focus. Avoid broad animation in virtualized lists. **Reduced:** Direct removal. Do not keep the exiting row keyboard-accessible or leave a ghost row that can still submit actions.

<a id="p039"></a>
#### P039. Drag reordering

**Trigger and state:** An item is picked up and moved to another position. **Motion:** The dragged representation follows input directly. Neighboring items settle around a clear insertion target. **Control:** Preserve identity and provide move-up, move-down, or equivalent keyboard controls. Support cancellation back to the committed order. **Reduced:** Keep necessary direct manipulation, remove decorative lift and spring overshoot. Never commit a reorder solely because an animation finished.

<a id="p040"></a>
#### P040. Filtering and sorting

**Trigger and state:** The visible collection changes by a deliberate criterion. **Motion:** Prefer direct updates in dense data. For a small visual collection, animate retained objects to their new positions with a short layout transition. **Control:** Keep sort criteria visible and preserve item identity. Avoid animating hundreds of virtualized rows. **Reduced:** Direct result state. Do not use a generic stagger that makes the result look like a completely new collection.

<a id="p041"></a>
#### P041. List-to-grid transition

**Trigger and state:** The user changes presentation density. **Motion:** Match a limited set of visible items between layouts, with position changes over `surface`. Treat crop and text layout as separate decisions. **Control:** Preserve the selected item and its approximate viewport location. **Reduced:** Direct layout replacement. Do not scale an entire list into a grid and distort every label.

<a id="p042"></a>
#### P042. Resizable panel

**Trigger and state:** A divider is dragged or adjusted through another input. **Motion:** Width follows the input without easing. On release, snap only when the product has meaningful sizes. **Control:** Enforce minimum sizes, keep the drag handle usable, and provide keyboard adjustments. **Reduced:** Same direct manipulation without decorative snap motion. Never use a spring to lag behind the divider while someone is trying to align content precisely.

<a id="p043"></a>
#### P043. Pull to refresh

**Trigger and state:** A supported downward gesture requests new content. **Motion:** Prefer native behavior. A custom affordance can reveal progress as the gesture crosses a clear threshold, then settle into a compact pending state. **Control:** Refresh only once per accepted gesture, preserve content, and handle failure. Provide a non-gesture alternative. **Reduced:** Keep the function with restrained or static feedback. Do not turn normal page scrolling into an unexpected refresh animation.

<a id="p044"></a>
#### P044. Snapping carousel

**Trigger and state:** A user scrolls or selects another item. **Motion:** Prefer native scrolling and scroll snap where suitable. A button-driven transition moves to the chosen item without affecting the page's vertical scroll. **Control:** Support keyboard access, readable position information, and interruption. **Reduced:** Direct item change or user-controlled native scrolling. Do not auto-advance a reading surface or use a wheel interceptor that traps the user.

<a id="p045"></a>
#### P045. Pinch and image zoom

**Trigger and state:** A viewer receives zoom input. **Motion:** Scale around the interaction's focal point, with panning bounds that respect the current zoom level. **Control:** Support accessible zoom controls and avoid stealing the browser's page zoom. Recompute bounds on resize or orientation change. **Reduced:** Necessary user-directed zoom remains available, while decorative entry zoom disappears. Do not jump the image's center when a second pointer joins.

<a id="p046"></a>
#### P046. Swipe actions

**Trigger and state:** A row is deliberately swiped to expose related commands. **Motion:** Move the row directly with the gesture, then settle to a valid open or closed state. **Control:** Distinguish horizontal intent from vertical scrolling, define destructive thresholds carefully, and expose the same actions through a visible or keyboard-accessible menu. **Reduced:** Remove elastic decoration, retain functionality. Do not delete from a small accidental diagonal drag.

<a id="p047"></a>
#### P047. Drag to dismiss

**Trigger and state:** An eligible viewer or sheet is pulled toward dismissal. **Motion:** Follow the drag directly, optionally coordinate backdrop opacity, then settle according to position and release velocity. **Control:** Support cancel, close button, Escape where appropriate, and a fallback when the source is no longer visible. **Reduced:** Keep a direct close path and simplify spatial effects. Do not connect the gesture to dismissal of unsaved work without an explicit policy.

<a id="p048"></a>
#### P048. Elastic boundary feedback

**Trigger and state:** A custom direct-manipulation object reaches a genuine bound. **Motion:** Apply a small, increasing resistance outside the bound, then settle back. **Control:** Use the platform's native behavior where available. Keep the logical value clamped even when the visual representation has resistance. **Reduced:** Clamp directly or use minimal resistance. Do not add rubber-banding to ordinary mouse hover or decorate every scrollbar with custom physics.

### Loading, asynchronous work, and live content

<a id="p049"></a>
#### P049. First useful load

**Trigger and state:** A destination is opened before its data is available. **Motion:** Render the stable shell and any useful content immediately. Reserve media dimensions and reveal completed regions with a short fade only when needed. **Control:** Separate missing data from missing animation code. Provide failure and retry states. **Reduced:** Direct content appearance. Do not use a full-screen logo animation as a compulsory waiting room for an otherwise ready interface.

<a id="p050"></a>
#### P050. Indeterminate activity

**Trigger and state:** Work is ongoing but its completion fraction is unknown. **Motion:** Use a standard compact activity indicator. An original default is to reveal it after 150 milliseconds if the task is still pending, without delaying the task itself. **Control:** Stop it on success, failure, or cancellation, even midway through a cycle. **Reduced:** Use a static pending symbol and explanatory text when ongoing rotation is unnecessary. Do not invent a percentage to make uncertainty look precise.

<a id="p051"></a>
#### P051. Skeleton placeholder

**Trigger and state:** A familiar content structure is temporarily unavailable. **Motion:** Use static neutral placeholders matching the expected layout. A subtle shared pulse is optional in full mode, not the default. **Control:** Reserve realistic space, avoid presenting placeholders as actual content, and replace them when data arrives. **Reduced:** Static placeholders. Do not shimmer an entire page indefinitely, imply a structure that is not known, or leave the real page invisible while an entrance sequence runs.

<a id="p052"></a>
#### P052. Determinate progress

**Trigger and state:** The application has a meaningful completed fraction. **Motion:** Update a stable track according to real progress. Brief interpolation can soften coarse updates but must not overshoot the confirmed value. **Control:** Distinguish queued, processing, verifying, complete, failed, and canceled states. Announce meaningful milestones rather than every visual increment. **Reduced:** Direct track updates and a numeric or textual status. Do not show 100 percent while a required final step is still incomplete.

<a id="p053"></a>
#### P053. Load more and pagination

**Trigger and state:** More content is requested. **Motion:** Keep existing content stable and use a local pending indicator near the request. Add results without replaying the entrance of the whole collection. **Control:** Preserve the user's position and prevent duplicate page requests. Keep an accessible way to reach newly added content. **Reduced:** Direct insertion. Do not move a “Load more” button so abruptly that a second click hits an unrelated item.

<a id="p054"></a>
#### P054. Refresh with existing content

**Trigger and state:** An already useful view refreshes. **Motion:** Retain current content with a small status indicator. Update changed regions quietly after the result arrives. **Control:** Mark stale data when that distinction matters, and preserve selection and scroll anchors. **Reduced:** Direct updates. Do not replace the entire view with skeletons every time the user returns to the tab.

<a id="p055"></a>
#### P055. Offline and reconnection

**Trigger and state:** Connectivity changes affect the user's task. **Motion:** Reveal a stable, nonintrusive status where it matters. Use a short state replacement when connection returns. **Control:** Explain queued versus completed changes and avoid repeated banners during a flapping connection. **Reduced:** Direct status. Do not display a permanently optimistic spinner or animate a reconnecting icon as though work is definitely progressing.

<a id="p056"></a>
#### P056. Optimistic update and rollback

**Trigger and state:** An eligible action is reflected locally before remote confirmation. **Motion:** Show the tentative result using the normal state transition. If the action fails, restore the previous valid state with a short, understandable correction. **Control:** Track request identity, expose pending status when consequential, and preserve a clear recovery path. **Reduced:** Direct tentative and corrected states. Do not use optimism for irreversible or high-consequence outcomes without an appropriate product decision.

<a id="p057"></a>
#### P057. Image decode and replacement

**Trigger and state:** An image becomes decoded and ready to display. **Motion:** Crossfade it into reserved bounds over `feedback`, or replace directly when already cached. **Control:** Keep aspect ratio stable, cancel stale source updates, and avoid showing a broken-image flash during an artwork swap. **Reduced:** Direct replacement or a short fade. Do not animate from a zero-sized image after layout has already settled.

<a id="p058"></a>
#### P058. Timeout, retry, and cancellation

**Trigger and state:** An operation reaches a real failure, timeout, or user-canceled state. **Motion:** Replace activity with clear terminal feedback. **Control:** Cancellation stops relevant work when possible and invalidates obsolete results. Retry creates a new attempt rather than resurrecting an old animation. **Reduced:** Direct terminal state. Do not treat an aborted request as a frightening error or leave a spinner alive because its component did not receive a completion callback.

<a id="p059"></a>
#### P059. Streaming text

**Trigger and state:** Text arrives incrementally from a real source. **Motion:** Render coherent chunks as they arrive. Avoid adding a second character-by-character typewriter delay. **Control:** Preserve selection and reading position, handle replacement or correction, and provide a real stop control when supported. **Reduced:** The same incremental content with no decorative reveal. Do not let a blinking cursor imply ongoing generation after the stream has ended.

<a id="p060"></a>
#### P060. Chat and log following

**Trigger and state:** New messages or log lines arrive. **Motion:** Follow the latest content only while the user is already following the end. Use quiet scrolling for explicit “Jump to latest” actions. **Control:** Stop automatic following when the user scrolls away or selects earlier text. Show a stable new-content indicator. **Reduced:** Direct repositioning only on explicit request, with no forced animated scrolling. Do not pull someone away from a message they are reading.

### Media, music, and recording

<a id="p061"></a>
#### P061. Mini-player expansion

**Trigger and state:** A compact player becomes an immersive player. **Motion:** Connect the compact surface and artwork to their expanded bounds over `surface` to `spatial`. Establish new controls with overlapping opacity, not a long sequence. **Control:** Keep one playback engine and one authoritative media state. Permit closing during opening. **Reduced:** Direct or opacity-based presentation with the same track and progress. Do not restart audio, reset progress, or create two simultaneously interactive players.

<a id="p062"></a>
#### P062. Expanded player collapse

**Trigger and state:** The immersive player returns to a compact form. **Motion:** Reverse the meaningful artwork and container relationship when the compact source is available. Let unrelated detail fade away. **Control:** Keep playback running and use a safe fallback if the compact target has moved or vanished. **Reduced:** Direct compact presentation. Do not fly artwork to a remembered position from before the user resized the window.

<a id="p063"></a>
#### P063. Track and artwork change

**Trigger and state:** Playback changes to another item. **Motion:** Crossfade artwork within fixed bounds over `surface` or use a short direction cue only for explicit next or previous navigation. Update title and actions coherently. **Control:** Distinguish user navigation, automatic next track, and metadata correction. Decode the incoming image before committing the visual replacement. **Reduced:** Direct artwork and metadata or a short fade. Do not slide a track sideways merely because its title metadata was corrected.

<a id="p064"></a>
#### P064. Artwork-derived color change

**Trigger and state:** A new media item supplies a different background palette. **Motion:** Crossfade between two prepared backgrounds over 400–600 milliseconds. Keep text contrast protected by a stable scrim or sufficient surface opacity. **Control:** Compute or fetch the palette once per asset, handle unavailable artwork, and cancel stale results. **Reduced:** Direct background update or a restrained opacity change. Do not animate a full-screen blur radius or claim that a palette gradient is Apple's actual rendering method.

<a id="p065"></a>
#### P065. Optional ambient media background

**Trigger and state:** An explicitly immersive surface enables atmosphere. **Motion:** Use one subdued, low-detail, slow-moving background layer. A starting loop of 18–30 seconds is an original tuning choice, not an Apple measurement. **Control:** Provide a pause or disable route, stop offscreen, and separate the layer from readable content. **Reduced:** A static prepared background. Off also stops the loop. Do not put this effect on library pages, tables, settings, or every card.

<a id="p066"></a>
#### P066. Play and pause control

**Trigger and state:** Playback state changes or an input requests a change. **Motion:** Use a brief semantic icon replacement. Button pressure follows P001. **Control:** Distinguish requested playback from actual playback, buffering, interruption, and failure. Keep the accessible action label correct. **Reduced:** Direct icon state. Do not animate a pause icon simply because play was clicked when the media engine has not begun playback.

<a id="p067"></a>
#### P067. Media scrubbing

**Trigger and state:** The user seeks within available media. **Motion:** The thumb and preview follow the scrub directly. A programmatic jump can update directly or briefly interpolate the track. **Control:** Freeze automatic thumb updates while the user owns the gesture, then reconcile with the accepted playback position. Show unavailable ranges honestly. **Reduced:** Same direct control. Do not let the playback clock fight the dragging thumb or announce the position on every rendered frame.

<a id="p068"></a>
#### P068. Synchronized lyrics or transcript

**Trigger and state:** The actual media timestamp enters another text segment. **Motion:** Emphasize the current line while keeping the text layout readable. Follow the current line only while follow mode is active. **Control:** Use real timestamps, support manual reading, and expose an explicit return-to-current action. **Reduced:** Static emphasis and no forced smooth travel. Do not invent word timings, animate every glyph, or pull the user back while they are selecting text.

<a id="p069"></a>
#### P069. Queue reveal and reordering

**Trigger and state:** The user opens or edits the upcoming media queue. **Motion:** Reveal the queue as a related panel using `settle` to `surface`. Reordering follows P039. **Control:** Preserve playback and distinguish the currently playing item from upcoming items. Handle remote queue changes without moving a target under an active drag. **Reduced:** Direct panel and order changes. Do not animate the entire player into a new theme because the queue was opened.

<a id="p070"></a>
#### P070. Volume and output route

**Trigger and state:** The user changes volume or playback destination. **Motion:** Volume follows direct input. A route menu uses the normal anchored presentation. **Control:** Reflect device capabilities, waiting states, and connection failures. Keep system-owned route interfaces native where available. **Reduced:** Direct values and route state. Do not imply a speaker has connected before the system confirms it or fake haptics through an unrelated animation.

<a id="p071"></a>
#### P071. Recording and waveform

**Trigger and state:** Recording begins, receives real audio, pauses, or ends. **Motion:** Derive waveform or level movement from actual audio measurements with bounded smoothing. Keep the elapsed time and recording state clear. **Control:** Stop the animation when recording stops, preserve captured data, and handle permission denial. **Reduced:** Static recording state plus useful numeric or textual level information where needed. Do not use a random waveform to suggest that audio is being captured.

<a id="p072"></a>
#### P072. Fullscreen and picture-in-picture

**Trigger and state:** A media surface enters or leaves a platform-owned viewing mode. **Motion:** Use native fullscreen or picture-in-picture behavior. Coordinate surrounding controls without animating a second fake window. **Control:** Preserve playback, handle denied requests, and reconcile when the user exits through the system. **Reduced:** Respect the platform. Do not assume the application owns the system window's movement or can force a seamless custom transition across process boundaries.

### Desktop, documents, and data

<a id="p073"></a>
#### P073. Application window opening and closing

**Trigger and state:** The operating system creates, shows, hides, or closes a window. **Motion:** Let the system own the external window behavior. Render a stable client area rather than adding another full-window fade. **Control:** Preserve focus, saved state, and close-confirmation logic. **Reduced:** Respect system preferences and simplify internal effects. Do not imitate a macOS window animation inside Windows software or animate the application as though it controls the desktop compositor.

<a id="p074"></a>
#### P074. Responsive window resizing

**Trigger and state:** The window or viewport changes size. **Motion:** Reflow to valid bounds. Animate a deliberate programmatic layout change only when it does not fight active resizing. **Control:** Avoid a spring on every resize event, maintain minimum usable dimensions, and remeasure shared-element geometry. **Reduced:** Direct reflow. Do not allow charts, split panes, and title bars to trail behind the actual window edge.

<a id="p075"></a>
#### P075. Active and inactive window appearance

**Trigger and state:** The application gains or loses relevant window focus. **Motion:** Use platform-appropriate subdued emphasis changes. **Control:** Do not confuse inactive appearance with disabled controls or lost application data. Pause discretionary loops when the window is not visible. **Reduced:** Direct appearance. Avoid a large brightness flash whenever the user switches applications.

<a id="p076"></a>
#### P076. Tray or menu-bar popover

**Trigger and state:** A system-tray or menu-bar item opens a compact panel. **Motion:** Anchor the client surface to its real origin when the platform permits it, using a short reveal. **Control:** Handle screen edges, multiple displays, scaling, dismissal, and keyboard focus. **Reduced:** Direct or opacity-only presentation. Do not hard-code a launch point based on one monitor's coordinates.

<a id="p077"></a>
#### P077. Inspector panel

**Trigger and state:** Contextual properties become visible for a selected object. **Motion:** Reveal the inspector over `settle`, then update its fields directly as selection changes. **Control:** Preserve focus during edits and do not animate stale information after selection has changed. **Reduced:** Direct panel and content state. Avoid sliding the inspector closed and open for every object the user selects.

<a id="p078"></a>
#### P078. Tree and folder expansion

**Trigger and state:** A branch opens or closes. **Motion:** Rotate its disclosure affordance and use a short local layout transition only for manageable content. **Control:** Keep tree keyboard semantics, selection, and focus coherent when ancestors collapse. **Reduced:** Direct branch state. Do not stagger every file or animate a large directory into view one row at a time.

<a id="p079"></a>
#### P079. Table sorting and live rows

**Trigger and state:** Sort order or values change in a dense table. **Motion:** Update the sort indicator and data directly by default. A restrained cell emphasis can identify an important changed value. **Control:** Preserve row identity and selection, freeze unstable reordering during interaction when appropriate, and keep real values visible. **Reduced:** Direct update. Do not make an investment, monitoring, or operations table continuously reshuffle under the pointer.

<a id="p080"></a>
#### P080. Chart changes

**Trigger and state:** A chart changes series, range, or filters. **Motion:** Interpolate only when data identity and scale continuity make the transition truthful. Otherwise use a short crossfade or direct redraw. **Control:** Keep axis changes explicit and ensure tooltips reflect actual data, not temporary interpolated values. **Reduced:** Direct chart state. Do not animate from zero on every render, invent intermediate data, or hide an axis change inside a dramatic morph.

<a id="p081"></a>
#### P081. Crosshair and chart inspection

**Trigger and state:** A pointer or keyboard moves through plotted data. **Motion:** Track inspection directly without decorative easing. **Control:** Snap only according to the chart's explicit sampling rule and keep tooltip placement stable. Provide a keyboard-accessible alternative. **Reduced:** Same direct inspection. Do not make a tooltip float slowly behind the point the user is trying to inspect.

<a id="p082"></a>
#### P082. Numeric value updates

**Trigger and state:** A displayed number changes. **Motion:** Prefer direct updates for exact working data. A short digit transition is optional for a summary statistic when the final value remains unambiguous. **Control:** Preserve decimal alignment and sign, coalesce rapid updates, and announce only meaningful changes. **Reduced:** Direct value. Never count through invented intermediate prices, balances, or measurements as though those were actual observations.

<a id="p083"></a>
#### P083. Save and synchronization status

**Trigger and state:** A document becomes edited, saving, saved, conflicted, or offline. **Motion:** Use a compact stable status region with brief symbol or text replacement. **Control:** Tie each label to the actual persistence state and distinguish local save from remote synchronization. **Reduced:** Direct status. Do not use a reassuring check for a file that only exists in unsent memory.

<a id="p084"></a>
#### P084. Document and workspace switching

**Trigger and state:** The user selects another document, project, or workspace. **Motion:** Keep persistent application chrome stable and change the working region directly or with a short contextual transition. **Control:** Preserve per-document state and handle unsaved changes independently of visual transitions. **Reduced:** Direct switch. Do not reanimate the entire application shell whenever the user changes a tab.

### Websites and editorial motion

<a id="p085"></a>
#### P085. Hero introduction

**Trigger and state:** A deliberately designed landing page becomes ready. **Motion:** Render the headline and primary action immediately. An optional supporting visual can fade in or move at most 24 pixels over 400–600 milliseconds. **Control:** Keep server-rendered content visible, avoid replay on every back navigation, and do not delay the main action. **Reduced:** Static final composition. Do not hide the whole hero until fonts, video, and an animation library have all loaded.

<a id="p086"></a>
#### P086. Section reveal

**Trigger and state:** A meaningful section enters view for the first time. **Motion:** Use one restrained group reveal, not an entrance for every line. A short opacity change plus small travel is enough. **Control:** Default to visible content, enhance only eligible offscreen elements, and avoid repeated replay during minor scrolling. **Reduced:** Static content. Do not make a long page feel like a series of waiting rooms.

<a id="p087"></a>
#### P087. Sticky product narrative

**Trigger and state:** Scrolling moves through a finite explanatory sequence. **Motion:** Keep one visual region sticky while the narrative advances through meaningful states. **Control:** Preserve normal scroll input, keep all text accessible, provide a compact mobile treatment, and release the sticky section predictably. **Reduced:** Static panels or a user-controlled gallery. Do not pin the page for several screens to show an effect that communicates no new information.

<a id="p088"></a>
#### P088. Product image or frame scrubbing

**Trigger and state:** Scroll position or a control selects a product-view state. **Motion:** Map the input directly to a bounded sequence. **Control:** Load a sensible subset of assets, show a good still before they are ready, and avoid decoding a huge sequence on initial page load. **Reduced:** A still image or explicit next and previous controls. Do not interpolate the scroll with so much inertia that the product continues moving after the user stops.

<a id="p089"></a>
#### P089. Optional parallax

**Trigger and state:** A specific visual story benefits from shallow depth. **Motion:** Move a nonessential background layer through a small, bounded range. Keep text and controls fixed. **Control:** Limit use to an approved editorial region and remove it on constrained layouts or poor performance. **Reduced:** No parallax. Do not apply pointer-follow tilt or scroll depth to every card.

<a id="p090"></a>
#### P090. Website content carousel

**Trigger and state:** A user requests another testimonial, product, or media item. **Motion:** Use native scrolling or a simple controlled transition. **Control:** Provide clear navigation and a nonmoving reading state. Avoid automatic advancement, especially for text. **Reduced:** Direct item changes. Do not treat an autoplay carousel as the default way to make a website feel active.

<a id="p091"></a>
#### P091. Mega menu

**Trigger and state:** A navigation category reveals its related content. **Motion:** Reveal the shared menu surface once, then update categories without closing and reopening the entire panel. **Control:** Make pointer travel forgiving, support keyboard access, and avoid accidental closure while crossing small gaps. **Reduced:** Direct content state. Do not stagger every navigation link or blur the whole website to exaggerate a routine menu.

<a id="p092"></a>
#### P092. Website route transition

**Trigger and state:** A real page or route changes. **Motion:** Default to immediate navigation. Use a shared-element or short regional transition only when it clarifies continuity. **Control:** Keep history, focus, URL, loading, and errors correct without animation support. Feature-detect the chosen transition API. **Reduced:** Direct navigation. Do not make ordinary links wait for a full-page fade-out before starting their request.

<a id="p093"></a>
#### P093. Anchor navigation

**Trigger and state:** The user chooses an in-page destination. **Motion:** A brief native smooth scroll is optional in full mode. **Control:** Respect sticky-header offsets, maintain a meaningful focus destination, and allow user input to interrupt. **Reduced:** Direct scroll. Do not apply smooth scrolling to all programmatic movements, emergency feedback, or accessibility focus repair.

<a id="p094"></a>
#### P094. Theme change

**Trigger and state:** The user selects light or dark appearance, or the system appearance changes. **Motion:** Prefer a direct theme update or short coordinated color transition. **Control:** Keep text contrast valid throughout and avoid simultaneous old-theme and new-theme duplicate interactive content. **Reduced:** Direct theme. Do not use a full-screen expanding circle, bright flash, or dramatic inversion as a universal theme-switch effect.

<a id="p095"></a>
#### P095. Pricing or plan comparison toggle

**Trigger and state:** Billing period, currency, or plan detail changes. **Motion:** Move the selected control and replace affected values directly or with a short fade. **Control:** Keep units, billing terms, and totals explicit. Preserve card heights where practical. **Reduced:** Direct values. Do not count through invented prices or obscure a material term change with a distracting animation.

<a id="p096"></a>
#### P096. Checkout or multi-step form

**Trigger and state:** A completed step advances to the next valid step. **Motion:** Use a restrained directional or opacity transition within the form region. **Control:** Move focus to the new step heading or appropriate field, retain previous inputs, and keep validation separate from navigation. **Reduced:** Direct step change. Do not advance because a progress animation completed or celebrate a payment before confirmation.

### Complex application surfaces

<a id="p097"></a>
#### P097. Calendar navigation and event movement

**Trigger and state:** The user changes date range or moves an event. **Motion:** Use directional continuity for explicit previous or next navigation. Dragged events follow input directly. **Control:** Preserve time-zone correctness, display the actual new time, handle overlaps, and offer keyboard alternatives. **Reduced:** Direct date changes and restrained event manipulation. Do not let a visual snap silently change the scheduled time without clear feedback.

<a id="p098"></a>
#### P098. Map camera and place information

**Trigger and state:** The user selects a place or changes map focus. **Motion:** Prefer the map framework's camera and sheet behavior. Coordinate camera movement with the information surface so the selected place remains visible. **Control:** Let manual panning interrupt automatic camera movement. Avoid repeated recentering. **Reduced:** Direct camera repositioning where appropriate and a stable sheet. Do not force a long flyover before showing useful place information.

<a id="p099"></a>
#### P099. Weather and environmental effects

**Trigger and state:** A weather or environmental visualization reflects actual data. **Motion:** Keep any atmosphere in a separate optional visual region. Content values remain stable and readable. **Control:** Avoid continuous precipitation effects in utility views and stop offscreen rendering. **Reduced:** Static illustration and real measurements. Do not use decorative weather as a substitute for the forecast or let particles obscure controls.

<a id="p100"></a>
#### P100. Activity rings and goal progress

**Trigger and state:** Real progress changes toward a defined goal. **Motion:** Update the ring according to actual data. A one-time completion emphasis can be used for a genuinely meaningful event. **Control:** Preserve the numeric result and do not replay the entire day's progress whenever the view opens. **Reduced:** Direct ring and value. Do not celebrate automatically recorded fluctuations as repeated new achievements.

<a id="p101"></a>
#### P101. Card stack and wallet-like selection

**Trigger and state:** A user selects one item from a layered stack. **Motion:** Separate the selected card from its neighbors with measured geometry and limited overlap. **Control:** Keep labels readable, provide non-gesture selection, and preserve the selected object's identity. **Reduced:** Direct selection or a simple list. Do not imply support for a system wallet or payment action merely by reproducing its visual language.

<a id="p102"></a>
#### P102. Editorial card to full story

**Trigger and state:** A story card opens its full article. **Motion:** Connect a prominent image and container to the article, then reveal readable body content. **Control:** Keep the browser URL, back behavior, focus, and reading position correct. **Reduced:** Direct article navigation. Do not stretch a short card title into a paragraph or force a long transition before the article can be read.

<a id="p103"></a>
#### P103. Camera capture feedback

**Trigger and state:** A real capture succeeds or a capture request is pending. **Motion:** Use native capture feedback where possible. A small preview update can acknowledge the saved image. **Control:** Distinguish shutter request, capture completion, and saving. Handle denied permissions and unavailable cameras. **Reduced:** Static capture status and preview. Avoid large full-screen flashes or a fake shutter response when no image was captured.

<a id="p104"></a>
#### P104. Onboarding and feature teaching

**Trigger and state:** A user encounters a new task or explicitly opens a tutorial. **Motion:** Demonstrate one interaction at a time with a bounded replayable example. **Control:** Make skipping and manual progression available. Do not block the actual application behind a long sequence. **Reduced:** Static steps with clear labels. Do not assume motion alone can teach a gesture or communicate a required instruction.

<a id="p105"></a>
#### P105. Notification grouping

**Trigger and state:** Related events are grouped, expanded, or cleared. **Motion:** Use a compact stack expansion and local removal when the product owns the notification surface. **Control:** Preserve unread state and avoid moving items during attempted selection. Leave operating-system notifications to the system. **Reduced:** Direct grouping. Do not imitate system banners inside the app in a way that confuses origin or authority.

<a id="p106"></a>
#### P106. Call and connection states

**Trigger and state:** A call or live session moves between requesting, connecting, active, reconnecting, and ended. **Motion:** Keep the main action area stable and replace status clearly. Any level visualization must reflect real input. **Control:** Make disconnect available, handle permissions, and distinguish muted from disconnected. **Reduced:** Static status and essential real-time data. Do not use a cheerful success animation to mask an uncertain connection.

<a id="p107"></a>
#### P107. Dragging files across application boundaries

**Trigger and state:** A platform drag enters or leaves the application. **Motion:** Use system drag representations and highlight valid destinations within the app. **Control:** Respect accepted formats, copy versus move semantics, cancellation, and drop failure. **Reduced:** Static destination emphasis. Do not add a second decorative file ghost that competes with the operating system's drag image.

<a id="p108"></a>
#### P108. Switching input methods

**Trigger and state:** A user moves between touch, mouse, keyboard, pen, or controller. **Motion:** Preserve the current state and adapt affordances quietly. **Control:** Do not reset selection or reopen surfaces just because the input method changes. Keep keyboard focus visible when keyboard use resumes. **Reduced:** Direct adaptation. Do not infer that a device with a touchscreen should permanently use touch-only hover and gesture behavior.

### System changes, accessibility, and less common platforms

<a id="p109"></a>
#### P109. Live reduced-motion change

**Trigger and state:** The effective preference changes while the app is open. **Motion:** Stop prohibited loops and resolve active decorative transitions to a valid final state. **Control:** Keep logical state, focus, playback, and requests intact. Apply the policy to CSS, JavaScript, canvas, video decoration, and third-party components. **Reduced:** The policy is now active immediately. Do not wait for reload or let an already-running background continue indefinitely.

<a id="p110"></a>
#### P110. Reduced transparency

**Trigger and state:** A system or app preference requests less transparency. **Motion:** Replace translucent surfaces with readable opaque or more solid variants. **Control:** Keep layering, borders, and active states distinguishable without backdrop sampling. Treat transparency preference separately from motion preference. **Reduced:** No spatial flourish during the change. Do not assume a reduced-motion setting alone covers material readability.

<a id="p111"></a>
#### P111. Increased contrast and forced colors

**Trigger and state:** The environment requests stronger contrast or supplies forced colors. **Motion:** Preserve state changes using borders, labels, and other compatible affordances. **Control:** Ensure focus and selection remain visible when shadows or background imagery are absent. **Reduced:** Direct changes. Do not rely on a subtle animated shadow as the only sign that a control is selected.

<a id="p112"></a>
#### P112. Virtual keyboard and orientation changes

**Trigger and state:** The visible viewport changes because of a keyboard, rotation, or system overlay. **Motion:** Reflow into the available space without adding an independent competing camera-like animation. **Control:** Keep the active field and relevant action visible, update safe areas, and remeasure sheets. **Reduced:** Direct reflow. Do not treat every viewport-height change as a request to restart the whole page entrance.

<a id="p113"></a>
#### P113. Returning from background

**Trigger and state:** The app or tab becomes visible again. **Motion:** Resume only the effects still relevant to the current state. Resolve stale transitions directly and restart optional atmosphere from a coherent phase rather than replaying its entire missed history. **Control:** Refresh actual data and media time independently. **Reduced:** No decorative catch-up. Do not execute thousands of queued animation steps after the user returns.

<a id="p114"></a>
#### P114. Navigation during another transition

**Trigger and state:** A new destination is requested before the current transition finishes. **Motion:** Cancel or retarget the obsolete visual work and show the newest valid destination. **Control:** Keep history and route data authoritative, clear temporary snapshots, and avoid duplicate focus moves. **Reduced:** Direct navigation. Never force the user to watch the completion of a page they have already left.

<a id="p115"></a>
#### P115. Empty and no-results states

**Trigger and state:** A view legitimately contains no items or no matches. **Motion:** Use a stable explanation and useful next action. A one-time compact illustration entrance is optional in a consumer surface. **Control:** Distinguish empty, loading, filtered-empty, denied, and failed. **Reduced:** Static content. Do not loop an illustration forever or make the user wait to learn that there are no results.

<a id="p116"></a>
#### P116. Localization and right-to-left layout

**Trigger and state:** Language, text length, or reading direction changes. **Motion:** Recompute anchors and dimensions. Mirror directional relationships when they are tied to interface direction, not when they represent a fixed physical or media meaning. **Control:** Preserve focus and handle long labels and translated status text. **Reduced:** Direct layout. Do not blindly mirror a media timeline or use fixed offsets that only fit English.

<a id="p117"></a>
#### P117. Television focus

**Trigger and state:** A remote or controller moves focus through a television interface. **Motion:** Prefer the platform focus system and its supported emphasis. **Control:** Keep focus paths predictable, account for viewing distance, and distinguish focus from selection. **Reduced:** Use the platform's reduced-motion behavior and stable emphasis. Do not transplant mouse-hover timing into a focus-driven interface or custom-animate every object independently of the focus engine.

<a id="p118"></a>
#### P118. Spatial hover and gaze

**Trigger and state:** A spatial platform supplies a privacy-preserving hover or focus effect. **Motion:** Use native effects and keep important labels spatially stable. **Control:** Do not infer raw gaze coordinates or trigger business actions from looking. Require an intentional selection mechanism. **Reduced:** Stable highlight with restrained spatial change. Do not make peripheral panels oscillate or move an entire workspace toward the viewer for routine focus.

<a id="p119"></a>
#### P119. Watch and glanceable surfaces

**Trigger and state:** A short interaction changes a compact, glance-oriented view. **Motion:** Use native navigation and brief state feedback. **Control:** Keep the key value visible, minimize waiting, and stop discretionary loops when the surface is not active. **Reduced:** Direct state. Do not use a long cinematic reveal for information the user checks for a second.

<a id="p120"></a>
#### P120. Print, static capture, and export

**Trigger and state:** The interface is printed, exported, or captured for a deterministic visual test. **Motion:** Resolve content to its stable final presentation. **Control:** Keep charts and statuses truthful, avoid exporting skeletons or partially transformed text, and ensure animation layers do not duplicate content. **Reduced:** Static by definition. Do not make essential content absent from print because an intersection-triggered reveal never ran.

<a id="shared"></a>
## 8. Shared-object transitions that survive real use

Relevant recipes: P026, P029, P041, P061, P062, P101, P102.

**APPLE basis:** Apple's transition guidance supports a relationship between a source object and a destination. Its zoom-transition session discusses interactive behavior and stable source identification. The following geometry and lifecycle design is an original cross-platform implementation approach, not a reconstruction of a private Apple component. [A06] [A07]

### Decompose the transition

Treat the container, primary image, existing label, new detail, and background as separate visual responsibilities. The image can retain identity while new controls appear. Text does not need to stretch simply because the image changes size.

| Layer | During expansion | At the destination |
|---|---|---|
| Source container | Supplies origin geometry | Becomes hidden or remains as a nonduplicated source location |
| Primary image | Preserves crop intentionally while moving toward destination | Resolves to the destination's real image |
| Existing short label | Remains fixed-size where practical, or briefly crossfades | Replaced by the destination label if layout differs |
| New body text and controls | Appears late enough to avoid distortion, with overlapping opacity | Fully interactive in the real destination |
| Backdrop | Establishes the destination's context without visual noise | Uses the correct modal or nonmodal semantics |

### Geometry contract

Read source bounds from the currently displayed element, not a cached initial layout. Decide whether measurements are relative to the viewport, a scroll container, or a window. Do not mix coordinate systems. Account for scroll position, clipping, transforms, safe areas, and the destination's actual layout.

For a basic FLIP transition, measure **First**, apply the destination layout and measure **Last**, **Invert** the visual difference, then **Play** toward the untransformed destination. This is a construction technique, not a requirement to animate all layout changes. Motion's layout system provides related layout and shared-identity mechanisms, including support for scroll and fixed-layout contexts. Use its documented options when it is the project's chosen engine. [W02]

```text
sourceRect = current measured source rectangle
finalRect  = measured destination rectangle after its valid layout exists

initial translation = sourceRect.origin - finalRect.origin
initial scale       = sourceRect.size / finalRect.size
final translation   = 0
final scale         = 1
```

That simple calculation does not solve crop, borders, nested transforms, or accessibility by itself. An image with `cover` in a square tile and `contain` in a wide viewer needs an explicit crop strategy. Prefer a clipping wrapper with an image that preserves its aspect ratio. Crossfade between crop modes when a continuous crop would be distracting or technically fragile.

### Lifecycle

Prepare the destination's layout before starting the meaningful transformation. Decode required imagery or provide a stable fallback. Keep one semantic destination, even when a temporary visual snapshot is needed. Mark decorative copies as hidden from assistive technology and noninteractive.

At the handoff, replace the temporary visual with the actual destination without a visible opacity seam. Do not leave the destination waiting for a fixed timeout that can drift from the real animation. Use the animation system's lifecycle for visual cleanup, with cancellation handling, while keeping route state and business actions independent.

For an accessible modal, establish the modal interaction boundary immediately through the chosen primitive. Coordinate visual proxies with that boundary rather than delaying focus management until a long morph finishes. Avoid focusing an invisible offscreen duplicate. For a nonmodal route, apply the product's route-focus policy to the real destination.

### Interruption and return

If the user closes at 30 percent, use the currently rendered pose as the return start. If the original object is still visible, remeasure it. If its list has scrolled, decide whether a quiet return to the current source is sensible. If the source is absent, use a short fade or direct dismissal. Never animate to a zero-sized or disconnected rectangle.

A source ID must identify the data object, not its array index. Recycled list cells must not become accidental transition targets. On a desktop with multiple documents, namespace identities by surface or route so the same object ID in two windows does not collide.

### Acceptance criteria

The selected object remains recognizable. Text remains readable. The user can reverse the transition. A resize does not send the object offscreen. Reduced mode remains coherent. Removing the source during transition does not crash or create a ghost. The final layout is correct with animation disabled.

<a id="sheets"></a>
## 9. Interactive sheets, panels, and detents

Relevant recipes: P030, P042, P043, P047, P098.

Use a native sheet when available and suitable. Custom sheets are deceptively complex because the animation, scroll view, keyboard, focus model, and dismissal policy must agree.

### Declare the model first

Define the permitted states as actual detents, such as compact, medium, and expanded. A detent is a valid resting position, not an arbitrary percentage copied from a screenshot. Compute its position from the available viewport, safe areas, content, and keyboard state.

```text
state:
  closed
  resting(detentId)
  dragging(startDetentId, currentPosition)
  settling(destinationDetentId)
  dismissing

inputs:
  open, close, chooseDetent, pointerMove, release, cancel,
  viewportChanged, contentChanged, preferenceChanged
```

The close permission belongs to the task. A sheet containing unsaved work may need confirmation. A map's place panel may be nonmodal. Do not decide these semantics based only on the fact that the surface comes from the bottom.

### Gesture ownership

An original starting rule is to establish intent after roughly 6–10 logical pixels of deliberate movement, then resolve the intended axis. This is a tuning candidate, not a native system constant. Exclude text selection, interactive sliders, and other nested gestures from sheet dragging unless explicitly designed otherwise.

When a scrollable sheet is expanded, upward gestures should normally scroll its content. Downward dragging can transfer to the sheet only when the inner content is at the appropriate boundary and the platform allows a clean handoff. Prefer the native solution over a JavaScript patch that toggles document scroll ownership mid-gesture.

Do not lock page scrolling for a nonmodal panel without a deliberate reason. A truly modal sheet must prevent background interaction and manage focus. Do not approximate modality with only `overflow: hidden`.

### Drag phase

Map pointer displacement directly to the sheet position. Use resistance only outside valid bounds. Keep the logical detent unchanged until release. Read the current presentation if the user catches a settling sheet. Do not reset the drag origin to the previous detent.

Keep the handle and close affordance stable and usable. Do not add a trailing spring to the finger-driven phase. If backdrop opacity changes during drag, derive it from normalized progress and clamp it to the designed range.

### Release phase

An original projection heuristic is:

```text
projectedPosition = currentPosition + releaseVelocity * 0.18 seconds
candidateDetent   = nearest permitted detent to projectedPosition
```

This is a simple starting heuristic, not a universal physics model. It needs velocity clamping, boundary checks, and tests with different input devices. A short flick and a slow long drag should both produce understandable results. Do not make an extremely noisy velocity sample dismiss the sheet accidentally.

Settle from the current position using the selected spring, including velocity when the engine supports it. For a destructive or data-losing dismissal, gesture completion cannot bypass the task's confirmation policy.

### Cancellation, resize, and keyboard

On pointer cancellation, return to the last valid committed state unless the platform convention says otherwise. On resize or keyboard appearance, recompute detents and resolve to a valid visible state. Avoid continuing toward a detent based on a viewport height that no longer exists.

Expose buttons or equivalent commands for closing and changing state when dragging is not available. A custom sheet that works only through a precise drag is not finished.

### Reduced mode

Present and dismiss with a direct state change or short opacity transition. Keep the ability to choose detents, but avoid unnecessary animated travel between them. User-directed direct manipulation can remain functional without added elastic decoration.

<a id="media"></a>
## 10. Apple Music-inspired media motion

Relevant recipes: P061–P072. This is the strongest candidate for an expressive surface in an otherwise restrained application.

### What was actually observed

**OBSERVED:** The inspected [expanded music player](https://mobbin.com/screens/d89d38cd-f756-41e2-9558-9234a1b64dca) has prominent artwork, a subdued colored background, playback controls, a progress track, and a top dismissal handle. The inspected [spoken-media player](https://mobbin.com/screens/5170ed5a-011c-4b63-80d2-c53f6bcfa9bf) uses different transport controls appropriate to its content. The [playback flow](https://mobbin.com/flows/3d221445-187d-4d5a-b903-10bd2d57726c) includes a lyrics-focused state with emphasized current text and subdued surrounding text.

Those previews establish visible states. They do not establish that a particular background is moving, its speed, how it is generated, or the precise mini-player transition. The recommendations below are original implementations of the broader relationship.

### Keep the library quiet

Use neutral, readable list and browsing surfaces. Keep the compact player persistent and recognizable. Reserve an immersive artwork treatment for the expanded media surface. This contrast gives the player a distinct purpose without making the entire application look like an animated wallpaper.

### One media engine, multiple presentations

```text
Media engine
  current item, playback state, current time, buffered range, volume, output
          |
          +--> compact presentation
          +--> expanded presentation
          +--> lyrics or transcript presentation
          +--> system media controls, where supported

Presentation state
  collapsed, opening, expanded, dragging, closing
```

The presentation state never owns whether the audio engine exists. Opening and closing the player does not recreate the player object or reset its clock. An output-route change does not remount the interface. Newer Apple Now Playing material can inform native system integration, but it is optional and availability-sensitive. [A19]

### Expansion choreography

Use the actual compact player as the origin when it exists. Match the artwork between layouts. Move the container toward the expanded bounds, then let title details and the control group become readable through overlapping opacity. Do not make the user wait for artwork, title, slider, and each button to arrive one after another.

An original full-mode starting specification is a `spatial` response for geometry, a 120–180-millisecond opacity reveal for new controls, and a 320–420-millisecond backdrop establishment. These are concurrent components of one event, not durations to add together.

For a large desktop window, the expanded player can be a panel rather than a full-screen takeover. Preserve the same object relationship while adapting geometry to the workspace.

### Three background tiers

| Tier | Construction | Recommended use |
|---|---|---|
| **Static atmosphere** | Prepared artwork-derived palette or softened image plus a stable readability layer | Default media treatment |
| **Crossfading atmosphere** | Two prepared backgrounds with a short opacity handoff when the item changes | Polished default when performance permits |
| **Animated atmosphere** | One low-detail shader or slowly transformed prepared texture, with a static fallback | Explicit immersive mode only |

Do not equate a background tier with a claim about Apple's internal implementation. Apple's WWDC26 example demonstrates a softened artwork layer, noise-based shader distortion, a time driver, and a synchronized transcript as separate building blocks. Its sample is a useful native reference, not an instruction to duplicate its exact parameters on the web. [A18]

### Practical web background pipeline

Decode the artwork once. Obtain a small palette from a permitted image source or use a deterministic fallback. Cross-origin canvas restrictions can prevent reading image pixels, so the product needs an asset delivery plan rather than assuming every remote image can be sampled. [W17]

Build two to four large, low-detail color regions with muted saturation and a stable scrim. Keep the text and controls in a separate layer. A prepared bitmap or static gradient is often enough. To add atmosphere, move the prepared layer slowly within clipped bounds instead of animating the blur radius of the entire screen.

Cache results by asset identity. Dispose of obsolete textures. Do not continuously recalculate colors while a song is playing. Limit rendering resolution based on the visual need and measured performance, not automatically on maximum device pixel ratio. Provide an opaque fallback when transparency or contrast preferences require it.

Animated atmosphere is off under Reduced and Off. It pauses when hidden or offscreen. Provide a visible setting or control that stops it during use. Keep a static poster that is equally readable.

### Lyrics and transcript detail

Derive active-line identity from actual timestamps. Keep line boxes stable. Emphasize the current line through weight, color, or opacity without making all neighboring lines repeatedly resize. Reserve blur for nonessential visual treatment only when readability and accessibility have been checked. A simple muted color is often more robust.

Separate **follow playback** from **manual reading**. Manual scrolling or text selection suspends automatic following. A clear return-to-current control resumes it. A track seek resolves directly to the correct line, without playing every skipped line's transition.

Do not infer word timings from line timestamps. A word-by-word effect needs word-level timing data. When none exists, use line-level emphasis. Keep a static readable transcript available and avoid making a screen reader announce every visual emphasis change.

### Scrubbing detail

There are two clocks during scrubbing: actual playback time and the user's preview time. The preview owns the thumb during the gesture. On commit, request the seek and reconcile to the accepted media position. On cancel, restore the actual time. On live or partially buffered media, show only meaningful available ranges.

A visualizer should use real audio data. A paused player should not display a waveform that suggests active capture or playback. An ambient decorative background can continue only if explicitly designed as atmosphere rather than a signal of audio activity, and its pause control still applies.

<a id="glass"></a>
## 11. Liquid Glass, material changes, and optical restraint

### Documented capability versus approximation

**APPLE:** Native Liquid Glass behavior includes more than transparency. Apple's sessions describe interactive and contextual material behavior, while SwiftUI documentation supplies APIs for custom glass surfaces and coordinated groups. Standard controls can provide much of the behavior without a custom renderer. [A08] [A10] [A11] [A12]

**RECIPE:** A cross-platform recreation should borrow the separation between content and controls, coherent grouping, and restrained interaction. It should not promise native refraction by adding `backdrop-filter: blur(...)`.

### Native Apple implementation policy

Prefer system bars, controls, sheets, and navigation before custom material. For genuinely custom related controls, investigate the current `glassEffect`, `GlassEffectContainer`, and identity APIs in the installed SDK. Use documented containers to coordinate related elements rather than layering independently sampled translucent panels.

Check availability at the declaration and deployment target. Do not paste a newly demonstrated modifier into every platform target. Newer SwiftUI sessions discuss expanded behavior across platforms, but preview demonstrations are not evidence that every API is available on the user's shipping runtime. [A11] [A16]

### Cross-platform visual approximation

Keep the content layer solid and readable. Apply a limited translucent treatment to a small number of navigation or control surfaces. Give each surface an adequate fallback fill, a subtle edge, and enough contrast to remain visible over arbitrary content. Do not make every card and table row transparent.

On press, adjust local emphasis rather than generating a large light sweep. On hover, use a quiet surface change. When two related controls combine into a group, animate their geometry as a shared arrangement, but let text and icons remain stable.

Avoid continuous blur changes, nested full-screen backdrop filters, cursor-driven refraction over dense content, and large lensing effects on every click. If an optical effect requires an expensive custom shader to be convincing, reserve it for a purpose-built visual surface and keep a static fallback.

### Material modes

| Context | Recommended treatment |
|---|---|
| Normal utility content | Solid or nearly solid surfaces |
| Floating control group | Restrained translucent surface where legibility remains reliable |
| Reduced transparency | Opaque or substantially more solid surface |
| Increased contrast | Stronger boundaries and unambiguous selected states |
| Reduced motion | No elastic morph or decorative optical movement |
| Low performance or remote session | Static material without expensive dynamic sampling |

A material change should not make the foreground lose contrast halfway through a transition. Test it over bright photographs, dark photographs, high-frequency patterns, and scrolling content, not only over the designer's ideal background.

<a id="async"></a>
## 12. Loading and asynchronous state as a motion system

Relevant recipes: P014–P016, P049–P060, P083.

**APPLE basis:** Apple's progress guidance distinguishes known from unknown progress, encourages accurate status, keeps indicators in consistent locations, and discusses cancellation. The recipes below extend those principles into a cross-platform application state model. [A30]

### The operation model

```text
idle
  -> pending
       -> success
       -> failure
       -> canceled
       -> timed-out

pending may also expose:
  queued, working, waiting-for-user, verifying, retrying
```

These states are not interchangeable illustrations of “loading.” Waiting for permission is not active processing. A queued upload is not a completed upload. Verifying a file can be a required stage after its byte transfer is complete.

### Appearance timing versus work timing

Start the operation immediately. An original 150-millisecond indicator delay can prevent a spinner from flashing for a very fast task. That delay affects only the indicator's appearance. If the operation completes first, show the result immediately.

Do not add a minimum display time that hides a completed result. A spinner can disappear halfway through its rotation. A progress bar can resolve into its terminal state without finishing an ornamental loop. Smoothness is not a reason to misrepresent whether the application is ready.

### Request identity

Every replaceable request needs an identity or equivalent cancellation mechanism. If search request A starts, then B starts and finishes, a late result from A must not replace B. Aborting a request is helpful but does not replace identity checks because some operations cannot be fully canceled.

Keep optimistic changes reversible where appropriate. Separate the visible proposed state from the acknowledged state when the consequence matters. On failure, provide a recovery path and preserve the user's work.

### Progress interpolation

A determinate bar can interpolate from its last displayed value to a newly confirmed value. It must not outrun actual confirmed progress. If the denominator changes or the operation enters a new stage, explain that stage rather than manufacturing smooth numerical certainty.

For coarse progress updates, use a stable numeric label and a restrained track transition. Do not announce every interpolated frame. Do not substitute a random incremental percentage while waiting for the server.

### Skeleton decision

Use a skeleton only when the expected structure is known and it helps preserve layout. Use a compact indicator for a small action. Keep existing content for refresh. Use an explicit waiting message when the next step belongs to another person or service. Use an error state when the operation has failed.

A skeleton is not a universal loading animation. For a dense data table whose column widths are unknown, a fabricated shimmering table can be more confusing than a stable shell and useful status.

### Streaming and continuous updates

Streaming text should arrive at the source's pace without an added typewriter animation. Live tables and dashboards should coalesce updates at an appropriate product cadence. A counter that updates too rapidly to read does not become useful by adding a digit spring.

Pause automatic viewport following when the user is reading older content. Keep a count or marker for unseen updates. A static view with a precise update indicator is often more usable than a continuously rearranging layout.

<a id="symbols"></a>
## 13. Symbols, haptics, and sound

### Semantic symbol effects

**APPLE:** Apple's Symbols framework distinguishes effects that are bounded, ongoing, transitional, or tied to content replacement. SF Symbols sessions introduce families such as replacement, pulse, movement, and drawing effects. Select them according to meaning rather than treating the symbol library as a catalog of decorations. [A20] [A21] [A22] [A23] [A24]

| Intent | Suitable recipe | Avoid |
|---|---|---|
| Change action, such as play to pause | Semantic replacement or short crossfade | Repeated bounce on every state update |
| Confirm a discrete successful action | One short check or replacement | Permanent pulsing success |
| Indicate real ongoing activity | Native progress affordance or restrained supported ongoing effect | A random moving symbol unrelated to the operation |
| Explain a drawing or path construction | A one-time draw effect | Drawing all navigation icons on every page load |
| Attract attention to a genuinely new capability | One bounded emphasis with a stable final state | Endless wiggle |
| Remove a no-longer-relevant object | Short disappear or direct removal | An elaborate explosion |

Do not assume SF Symbols artwork can be exported and used anywhere. Check the asset's license and platform restrictions. On non-Apple targets, use an appropriately licensed icon set and apply equivalent semantic motion where it is technically sound. Do not force path morphing between unrelated SVG structures.

### Haptics

Apple's haptic guidance emphasizes consistent meanings, causal relationships, and complementary feedback. A haptic should reinforce the actual event, not replace its visible state. [A29]

Use native selection, impact, and notification mechanisms only for their intended contexts and on supported hardware. Trigger a selection haptic when a meaningful discrete selection changes, not on every pixel of a drag. Trigger success feedback only after success. Avoid repeating it when a view remounts.

Expose appropriate controls and respect system settings. Do not assume a web vibration API provides the same hardware behavior as a native haptic. In a desktop application without suitable hardware, visual feedback is sufficient. Do not simulate “tactile” quality with a violent screen shake.

### Sound

Keep routine application interactions quiet by default. Sound can reinforce media, recording, or a deliberate notification, but it must have a clear purpose and an appropriate control. It must not be the only indication of success or failure. Do not make a web hover trigger audio, and do not claim precise audiovisual synchronization without measuring the actual runtime.

<a id="websites"></a>
## 14. Website and scroll choreography

Relevant recipes: P085–P096.

This section is an original editorial motion system. It is not a frame-measured reproduction of every Apple marketing page. Its purpose is to make a website feel deliberately composed without sacrificing ordinary browsing.

### Keep the document real

The page must remain a useful document with the animation engine removed. Headings, body text, links, navigation, and essential product information must be present in the normal reading order. Do not put the only copy of an explanation inside a canvas or video.

Render the final static composition first. Enhance only the regions that benefit. A disabled script, failed font request, missing asset, or reduced-motion preference must not leave the page blank.

### Choose one relationship per sequence

A product demonstration can show a device opening, a component becoming visible, or an interface changing states. Each change should correspond to a piece of the story. A sequence that rotates a product for three screens without explaining anything new is not automatically useful.

Use a small number of deliberate scenes. Keep text stable while a visual demonstrates the current point. Do not combine animated paragraph layout with continuous camera movement and a pinning transition at the same moment.

### Scroll-linked versus scroll-triggered

A scroll-linked sequence derives progress from scroll position. Reversing the scroll reverses the sequence. A scroll-triggered entrance starts a bounded animation when a region reaches a threshold. These are different mechanisms and should not be mixed accidentally.

Native CSS scroll-driven features are available in current browser development, including recent Safari work. Support still depends on the feature and target browser, so detect the actual capability instead of repeating old blanket support claims. Keep a static fallback. [W09] [W10] [W11]

For an explanatory scrub, map progress directly to the relevant state. Excessive smoothing makes the content keep moving after the user stops. A little visual softening may suit an illustration, but a scrubbed technical demonstration should remain controlled.

### Pinning rules

A pinned region must have a finite, understandable length. Its surrounding layout must reserve the correct space. It must release predictably in both directions. Do not capture wheel or touch events to force the visitor through a story.

On small screens, use a shorter sticky treatment or a normal sequence of static sections. Do not simply shrink a desktop pinned scene until the text and controls become unusable. Under Reduced, replace large spatial sequences with static key states or explicit user-controlled steps.

### Asset and runtime rules

Show a good poster before video, 3D, or image sequences are ready. Load assets according to need. Avoid hundreds of high-resolution frames at initial load. Decode and cache deliberately, and dispose of abandoned resources.

Use one animation owner for the scene. GSAP with ScrollTrigger can suit complex timeline coordination, while CSS or the existing UI motion library is enough for smaller interactions. GSAP's media-query facilities support conditional setup and cleanup, which is useful for responsive and reduced-motion variants. [W05]

Do not add a second timeline library just because an effect appeared in a reference. Choose the simplest engine that can provide correct input behavior, cleanup, and accessibility in the current project.

### Theme and light changes

Large brightness changes affect the whole visual field. Keep text readable through a theme change and prefer direct or short coordinated color updates. Avoid radial wipes and hard flashes as default flourishes. An explicit editorial transition between lighting conditions needs a static alternative and careful contrast review.

### High-impact, low-noise combination

A strong default website can use a static visible hero, one supporting visual entrance, quiet navigation hover, a small number of one-time section reveals, and one genuinely explanatory scroll sequence. It does not need parallax on every card, a fake cursor, an animated gradient behind every section, or a full-page transition on every link.

<a id="platforms"></a>
## 15. Platform adapters and engine selection

A portable motion specification describes behavior. It does not require identical rendering code, operating-system effects, or input physics on every device.

### Native Apple applications

Prefer SwiftUI, UIKit, or AppKit's existing control and presentation behavior. Use custom animation for genuinely custom relationships. SwiftUI provides state-driven animation, transitions, and more advanced sequencing tools. Its animation and keyframe sessions are useful when a simple state transition is no longer sufficient. [A04] [A05]

For source-connected navigation, investigate the current `matchedTransitionSource` and `navigationTransition` APIs. Do not blindly copy older beta-session spellings into current code. Use stable data IDs rather than positions in a collection. For a custom spring, select the framework's intended parameterization and inspect how it handles interruption. [A06] [A07]

Keep Reduce Motion connected to the view's presentation choices. Use system materials and controls before adding custom blur and shape effects. Native accessibility, input handling, and presentation adaptation are part of the value of those components, not incidental conveniences.

For AppKit or UIKit applications adopting newer visual components, use incremental integration where the platform supports it. A motion improvement does not require rewriting the whole application in another UI framework. [A17]

### React web applications

For an existing Motion-based project, use the installed package's documented import path and version. Modern Motion documentation uses `motion/react`, but an older project may intentionally use a different package. Do not change dependencies as an incidental part of adding a hover effect. [W01]

Use CSS for simple color and opacity state changes. Use the existing motion engine for shared layout, gestures, or interruptible physical transitions that genuinely benefit from it. Keep high-frequency motion values out of ordinary React state updates when the library provides an appropriate mechanism.

Motion's layout features include shared identity and options for relevant scroll or fixed contexts. Use them deliberately and test text distortion, clipping, and nested transforms. Its reduced-motion configuration does not remove every possible effect, so custom loops, opacity choices, and nonlibrary animation still need policy handling. [W02] [W04]

Avoid wrapping every component in an animated wrapper. Avoid animating `initial` states by default for content that is already visible at first render. Keep server output and hydrated output consistent.

### Plain web applications and other JavaScript frameworks

Use CSS transitions for small state changes and the Web Animations API for bounded animations that need explicit lifecycle control. Handle cancellation promises and clean up abandoned animations. Browser animation APIs provide capabilities, but the application still owns focus, logical state, and disposal. [W13] [W14]

A CSS transition can reverse smoothly enough for many color or opacity changes. Do not build a custom physics engine for a tooltip. Conversely, do not claim a restarted fixed-duration tween preserves a dragged object's velocity.

### View Transitions API

The browser View Transitions API provides a snapshot-based mechanism for transitions between states or pages. Its current documentation includes different scopes and modes, so support and lifecycle details must be checked against the actual target browser. It is not automatically a substitute for a live, continuously interactive drag. [W07] [W08]

Use it as progressive enhancement. The state update must still happen when the feature is absent or the transition is skipped. Keep transition names unique within the relevant scope, handle readiness failures, and make cancellation nonfatal. Do not use stale blanket claims that all implementations have exactly the same interruption or concurrency limitations.

For reduced motion, use a direct update or a permitted opacity treatment. Do not retain a large automatic zoom just because the transition is browser-managed.

### Electron and Tauri

Treat client-area motion as web motion and external window motion as platform-owned. Test the actual bundled engine or system WebView rather than assuming it behaves exactly like the developer's browser.

Electron documents system animation settings, including reduced-motion preference and guidance about rich animations. Bridge only the required settings through the application's established secure architecture. Do not give the renderer broad system access merely to read a motion preference. [P01]

For Tauri or another WebView shell, verify the host framework's current platform support and available preference bridge during implementation. This guide does not assume a universal cross-platform API name. Test reduced motion, transparency, multiple monitors, scaling, minimize and restore, and remote sessions in the built application.

### Windows native applications

Preserve Windows input, focus, window, and control conventions. Microsoft's composition guidance includes adapting to animation settings and advanced-effect capabilities. Translate this document's intent through the framework's supported animations instead of recreating a different operating system's shell behavior. [P02]

A utility application can feel polished with stable layout, precise hover, readable focus, and restrained panels. It does not need a macOS-style dock animation inside its client area.

### Android and Flutter

Compose documents both spring-based and duration-based animation, including differences in interruption behavior. Map the intended spring response into Compose's damping-ratio and stiffness model rather than copying a different library's raw parameters. [P03]

Flutter exposes a `MediaQuery` animation-disable preference accessor. Connect the effective preference to the application's actual effects and retain the framework's native navigation and controls where appropriate. Verify individual widget behavior instead of assuming a single preference call disables every custom animation. [P04]

### Television, watch, and spatial software

Use platform focus and navigation systems for television and glance-oriented interfaces. These are not mouse-hover applications with a larger or smaller screen. Keep interaction feedback proportional to the task and the platform's viewing context.

Apple's spatial hover guidance describes privacy-preserving system behavior. Looking is not a general-purpose app event for initiating actions or network requests. Use native hover mechanisms and keep key labels anchored. Its spatial-motion guidance also stresses comfort and stable reference frames. [A26] [A27] [A28]

Treat a spatial simulator as incomplete evidence for physical comfort. Large field-of-view motion, head-relative content, and peripheral animation need actual device testing. This document does not provide a complete immersive-environment or game-camera specification.

### Engine choice table

| Requirement | First choice | Escalate only when necessary |
|---|---|---|
| Button hover, tint, small opacity | Native state styling or CSS | Existing motion library for a justified shared behavior |
| Platform navigation or sheet | Native framework | Custom presentation with explicit gesture and accessibility ownership |
| Small web layout transition | Existing UI motion library | Measured custom FLIP for a special case |
| Simple bounded custom animation | CSS or Web Animations API | Timeline engine for real orchestration |
| React shared-object interaction | Existing Motion setup | A specialized implementation after measuring limitations |
| Complex editorial scroll sequence | Native scroll-driven features or existing GSAP setup | Custom rendering only for the explanatory visual |
| Continuous media background | Static preparation first | One bounded shader or texture system with fallback |
| Operating-system window animation | Operating system | Do not replace it inside the app |

<a id="accessibility"></a>
## 16. Accessibility is part of the motion specification

### Standards to distinguish

WCAG 2.3.3, **Animation from Interactions**, is Level AAA and addresses disabling nonessential interaction-triggered motion. WCAG 2.2.2, **Pause, Stop, Hide**, is Level A and covers specified automatically moving, blinking, scrolling, and updating content. WCAG 2.3.1, **Three Flashes or Below Threshold**, is Level A and concerns flashing risk. These are different requirements. Do not treat passing one as satisfying the others. [X01] [X02] [X03]

For moving, blinking, or scrolling content, the five-second condition in 2.2.2 has specific qualifiers. Its auto-updating provision is separate. Do not use “under five seconds” as a blanket exemption for every kind of distracting or automatically changing content. A conservative product policy is to avoid decorative flashing entirely and provide controls for discretionary continuous motion. [X02] [X03]

### Reduced motion is not reduced meaning

Keep the selected state, operation status, location, and result equally understandable. Replace a zoom with direct presentation. Replace a traveling object with a brief opacity handoff when useful. Replace ambient movement with a good still image. Preserve direct manipulation that the user intentionally controls without adding decorative elasticity.

Do not shorten every animation to a tiny nonzero duration and call the work complete. That approach can leave spatial effects, scrolling, canvas loops, or repeated brightness changes intact. It can also create fragile logic when the application has incorrectly tied state to animation events.

### Coverage matrix

| Effect | Full mode | Reduced mode | Off mode |
|---|---|---|---|
| Button pressure | Tint, optional small visual scale | Tint only | Direct pressed style |
| Focus ring | Immediate | Immediate | Immediate |
| Shared-object zoom | Measured geometry continuity | Direct or opacity replacement | Direct destination |
| Sheet entrance | Restrained spatial motion | Direct or opacity-only | Direct state |
| Reordering | Direct drag, quiet settle | Direct drag, minimal settle | Direct manipulation and final state |
| Smooth anchor scroll | Optional and interruptible | Direct scroll | Direct scroll |
| Ambient background | Explicitly enabled and pausable | Static | Static |
| Skeleton | Static by default, optional subtle pulse | Static | Static |
| Indeterminate status | Native or restrained indicator | Static status when motion is nonessential | Static status |
| Live media or waveform | Actual data | Essential data with restrained presentation | Actual data without decorative interpolation |
| Chart replacement | Truthful interpolation when useful | Direct chart | Direct chart |
| Symbol flourish | One bounded effect | Direct symbol | Direct symbol |

### Read the preference before starting expensive motion

On the web, `prefers-reduced-motion` is the relevant media feature. Listen for changes during the session. Do not wait for a reload to stop a decorative loop. Other preferences, including contrast and transparency, need their own handling and fallbacks rather than being conflated with motion. [W06]

When server rendering cannot know the preference, render a stable readable state that does not require an entrance to become visible. Enable optional behavior after the client has determined the effective policy.

### Keyboard and focus

Focus must remain visible while an interface changes. Never hide a focused element inside an exiting layer without moving focus appropriately. Never set an ancestor of the active control to accessibility-hidden and assume the control will remain usable.

For a modal, use an established native or accessible primitive. The modal pattern includes focus management and a return path, not just a backdrop and `role="dialog"`. Restore focus to the invoker when valid, or to a logical fallback if it no longer exists. Keep Escape and close controls consistent with the task. [X04]

Do not make a hover animation the only way to reveal a button. Do not require a drag to reorder or dismiss without an alternative. Keep target boxes stable even when their inner visual changes.

### Screen readers and live content

Keep one semantic representation of a shared object during a transition. Hide decorative snapshots from assistive technology. Do not let an exiting visual clone duplicate the destination's controls in the reading order.

Announce an important operation state once, not at every intermediate opacity, progress, or number interpolation. Keep live regions concise and avoid repeatedly interrupting reading. A streaming answer or log should not cause the screen reader to restart from the top on every update.

### Text, zoom, and direction

Test large text, browser zoom, long translations, and right-to-left layouts. Remeasure animated geometry after these changes. Avoid fixed-height panels that clip enlarged text and do not use transform scaling to simulate a smaller font.

Direction should follow the meaning of the action. Interface navigation can mirror with layout direction. A chronological or media operation may need a different rule. State the rule rather than automatically negating every horizontal offset.

### Continuous motion and user agency

A pause or stop mechanism must actually stop the relevant motion. Stopping a carousel's timer while its animated background continues is not sufficient for the background. A setting hidden in an unrelated account screen may not be a practical control for an intrusive current effect.

Keep the paused presentation useful. Do not hide the content, remove functionality, or punish the user with a degraded layout when they request less movement.

<a id="performance"></a>
## 17. Performance and resource discipline

### Frame time is a shared budget

A 60 Hz display presents a new frame roughly every 16.7 milliseconds. At 120 Hz, the interval is roughly 8.3 milliseconds. Those intervals are the entire frame opportunity, not a JavaScript budget reserved for your animation. Layout, paint, compositing, application work, and the platform all compete for time.

Aim for a stable experience on the actual target device. A high average frame rate can hide frequent visible hitches. Inspect traces around input, image decode, layout changes, and transitions rather than relying only on a desktop screen recording.

Web performance guidance generally favors animating transform and opacity over properties that repeatedly trigger layout or paint. That is a useful starting point, not a guarantee that any transformed layer or opacity stack is free. Apple's hitch-analysis material likewise treats smoothness as a measurable rendering problem. [W15] [A31]

### Original performance gates

| Area | Gate to check |
|---|---|
| Input | No intentional debounce before press acknowledgment or direct manipulation |
| Main thread | No avoidable long synchronous task introduced by the motion feature |
| Layout | No repeated read-write-read loops across many elements in one frame |
| Idle | No discretionary animation loop when the relevant surface is hidden or disabled |
| Memory | Temporary snapshots, textures, listeners, and animation objects are released |
| Reduced mode | Expensive effects are not merely invisible while still running |
| Low-end behavior | Static or simpler fallback remains polished and functional |
| Repetition | Opening and closing the same surface many times does not degrade performance |
| Startup | Motion code does not block useful content or the primary action |

The web's INP metric evaluates interaction responsiveness, with 200 milliseconds or less at the 75th percentile used as the “good” threshold in its guidance. This is not an acceptable intentional delay for a button animation or a per-frame budget. Use it as one page-level signal alongside targeted traces. [W16]

### Expensive patterns to investigate

Full-screen backdrop blur over moving content, large changing shadows, animated filters, large masks, dozens of independent compositing layers, high-resolution animated canvases, and repeated layout measurement can become expensive. Measure the actual implementation rather than assuming every instance is equally costly.

Batch layout reads before writes. Prepare image dimensions and fonts before geometry-sensitive transitions when feasible. Avoid decoding a large image on the first frame of a shared-object animation. Do not attach permanent `will-change` to every card.

### Layer budget

Use a temporary layer only when it improves the measured transition. Remove it after use. A hundred promoted cards can cost more memory than the effect is worth. A blurred full-screen layer at high device pixel ratio can be substantially larger than its CSS dimensions suggest.

Keep media atmosphere at the resolution and detail it needs, not the maximum possible. Precompute low-frequency imagery when it gives the same visible result. Prefer a static background over a complex effect that stutters.

### Clock and frame independence

Use elapsed time rather than “move two pixels per frame.” A frame-count-based animation runs at different speeds on different displays. Bound the behavior after a long background pause so resuming does not integrate an enormous stale time step.

For a spring, use the platform engine or a stable integrator with tested units. For a background shader, pass a deliberate phase or elapsed time and define what happens on pause and resume. For a waveform, distinguish sample time from display time.

### Degradation order

First remove decorative layers that do not explain anything. Then simplify optical effects, reduce the scope of layout animation, and reduce rendering resolution where appropriate. Prefer a static result to a visibly struggling animation.

Do not silently make a direct manipulation update less often while keeping an elaborate background running. Input and essential state feedback have priority over atmosphere.


<a id="code"></a>
## 18. Implementation reference code

The following helpers are original code. They establish policy, units, interruption behavior, and request ownership. They are not a complete animation library or a drop-in replacement for native sheets and dialogs.

The three TypeScript modules below were checked with TypeScript 5.8.3 under strict mode. The pure policy, spring, and asynchronous-task behavior passed 12 Node tests. The browser-specific code was type-checked, not executed in a browser. The CSS and platform integration still require testing in the target application. These checks do not establish visual fidelity to Apple.

### 18.1 Central tokens, policy, spring math, and latest-request ownership

Save as `motion-core.ts`. Durations in this module are milliseconds. Convert explicitly for APIs that use seconds. Motion's standalone spring generator has its own documented units, so do not apply a blanket seconds conversion to every function named spring. [W03] [W12]

The exact critical-spring helper is useful for reasoning, tests, or a carefully scoped custom renderer. Prefer an established platform engine for normal UI. It assumes ordinary finite UI magnitudes and a fixed target over the sampled interval. It is not an arbitrary-precision solver for extreme numerical inputs.

```ts
export type MotionPreference = "system" | "reduced" | "off"
export type MotionMode = "full" | "reduced" | "off"

export const motionTokens = {
  durationMs: {
    instant: 0,
    contact: 70,
    quick: 120,
    feedback: 180,
    settle: 240,
    surface: 320,
    spatial: 420,
    cinematic: 600,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    arrive: "cubic-bezier(0.22, 1, 0.36, 1)",
    depart: "cubic-bezier(0.4, 0, 1, 1)",
    symmetric: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
  },
  spring: {
    control: { mass: 1, stiffness: 500, damping: 46 },
    surface: { mass: 1, stiffness: 320, damping: 36 },
    spatial: { mass: 1, stiffness: 220, damping: 30 },
    expressive: { mass: 1, stiffness: 300, damping: 27 },
  },
} as const

export function parseMotionPreference(value: unknown): MotionPreference {
  return value === "reduced" || value === "off" ? value : "system"
}

export function resolveMotionMode(
  preference: MotionPreference,
  systemRequestsReduction: boolean,
): MotionMode {
  if (preference === "off") return "off"
  if (preference === "reduced" || systemRequestsReduction) return "reduced"
  return "full"
}

export function millisecondsToSeconds(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError("Duration must be a finite, nonnegative number")
  }
  return milliseconds / 1000
}

export interface SpringPose {
  position: number
  velocity: number
}

/**
 * Exact solution for one critically damped scalar spring with a fixed target.
 * timeSeconds is elapsed time since the current target was selected.
 * velocity is position units per second. omega is inverse seconds.
 * Retarget by supplying the CURRENT position and velocity with timeSeconds = 0.
 * This is a math helper, not a DOM animation engine or gesture implementation.
 */
export function sampleCriticalSpring(
  initial: SpringPose,
  target: number,
  omega: number,
  timeSeconds: number,
): SpringPose {
  const values = [initial.position, initial.velocity, target, omega, timeSeconds]
  if (!values.every(Number.isFinite) || omega <= 0 || timeSeconds < 0) {
    throw new RangeError("Invalid spring input")
  }
  const displacement = initial.position - target
  const coefficient = initial.velocity + omega * displacement
  const decay = Math.exp(-omega * timeSeconds)
  return {
    position: target + (displacement + coefficient * timeSeconds) * decay,
    velocity: (initial.velocity - omega * coefficient * timeSeconds) * decay,
  }
}

export type TaskState<T> =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; value: T }
  | { status: "failure"; error: unknown }
  | { status: "canceled" }

/**
 * Owns one replaceable read-like task, such as search or preview generation.
 * Do not use this to silently discard required writes or payment operations.
 * The observer must not throw. Create and dispose the runner with its owner.
 */
export class LatestTask<T> {
  private generation = 0
  private controller: AbortController | undefined
  private disposed = false
  private currentState: TaskState<T> = { status: "idle" }

  constructor(private readonly onState: (state: TaskState<T>) => void) {}

  get state(): TaskState<T> {
    return this.currentState
  }

  private publish(state: TaskState<T>): void {
    this.currentState = state
    this.onState(state)
  }

  async run(task: (signal: AbortSignal) => Promise<T>): Promise<void> {
    if (this.disposed) throw new Error("LatestTask has been disposed")
    const generation = ++this.generation
    this.controller?.abort()
    const controller = new AbortController()
    this.controller = controller
    this.publish({ status: "pending" })

    try {
      const value = await task(controller.signal)
      if (this.disposed || generation !== this.generation) return
      this.controller = undefined
      this.publish({ status: "success", value })
    } catch (error: unknown) {
      if (this.disposed || generation !== this.generation) return
      this.controller = undefined
      if (controller.signal.aborted) {
        this.publish({ status: "canceled" })
      } else {
        this.publish({ status: "failure", error })
      }
    }
  }

  cancel(): void {
    if (this.disposed || !this.controller) return
    ++this.generation
    this.controller.abort()
    this.controller = undefined
    this.publish({ status: "canceled" })
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    ++this.generation
    this.controller?.abort()
    this.controller = undefined
  }
}
```

`LatestTask` is for replaceable work such as search. A new query makes an old query irrelevant. A bank transfer, file write, or payment is not interchangeable with a search request. Give consequential writes their own transaction and recovery model.

### 18.2 Interruptible browser opacity channel

Save as `opacity-channel.ts` beside `motion-core.ts`. This helper reads the current displayed opacity before canceling an obsolete transition. It keeps the newest destination as the underlying style, so cancellation does not restore an old visual state. Its promise result is for visual cleanup and diagnostics, not permission to commit business data. Browser animation cancellation can reject the completion promise, which is why cancellation is handled explicitly. [W13] [W14]

```ts
import { motionTokens, type MotionMode } from "./motion-core"

export type OpacityOutcome = "finished" | "canceled" | "applied"

type ActiveOpacity = {
  animation: Animation
  destination: number
}

/**
 * A browser-only owner for opacity on a limited set of HTML elements.
 * It preserves displayed opacity at interruption, not physical velocity.
 * Do not also animate opacity on these elements through CSS or another engine.
 * The caller owns visibility, focus, pointer behavior, and accessibility.
 */
export class OpacityChannel {
  private readonly active = new Map<HTMLElement, ActiveOpacity>()
  private disposed = false

  set(
    element: HTMLElement,
    destination: number,
    durationMs: number,
    mode: MotionMode,
  ): Promise<OpacityOutcome> {
    if (this.disposed) throw new Error("OpacityChannel has been disposed")
    if (
      !Number.isFinite(destination) || destination < 0 || destination > 1 ||
      !Number.isFinite(durationMs) || durationMs < 0
    ) {
      throw new RangeError("Invalid opacity or duration")
    }

    // Read the presentation before canceling the previous animation.
    const measured = Number.parseFloat(getComputedStyle(element).opacity)
    const current = Number.isFinite(measured) ? measured : 1
    const previous = this.active.get(element)
    this.active.delete(element)
    previous?.animation.cancel()

    // The underlying style is always the newest destination.
    element.style.opacity = String(destination)
    const effectiveDuration = mode === "off"
      ? 0
      : mode === "reduced"
        ? Math.min(durationMs, motionTokens.durationMs.quick)
        : durationMs

    if (
      effectiveDuration === 0 || current === destination ||
      !element.isConnected || typeof element.animate !== "function"
    ) {
      return Promise.resolve("applied")
    }

    let animation: Animation
    try {
      animation = element.animate(
        [{ opacity: current }, { opacity: destination }],
        {
          duration: effectiveDuration,
          easing: motionTokens.easing.standard,
          fill: "none",
        },
      )
    } catch {
      // Progressive enhancement: the destination style already exists.
      return Promise.resolve("applied")
    }

    this.active.set(element, { animation, destination })
    const cleanup = (): void => {
      if (this.active.get(element)?.animation === animation) {
        this.active.delete(element)
      }
    }

    return animation.finished.then(
      (): OpacityOutcome => {
        cleanup()
        return "finished"
      },
      (error: unknown): OpacityOutcome => {
        cleanup()
        if (error instanceof DOMException && error.name === "AbortError") {
          return "canceled"
        }
        throw error
      },
    )
  }

  /** Resolve active opacity transitions when policy changes or the owner hides. */
  settleAll(): void {
    for (const [element, { animation, destination }] of this.active) {
      element.style.opacity = String(destination)
      animation.cancel()
    }
    this.active.clear()
  }

  dispose(): void {
    if (this.disposed) return
    this.settleAll()
    this.disposed = true
  }
}
```

Opacity zero does not itself remove an element from keyboard navigation or pointer targeting. The owning component must separately manage hidden content, modal semantics, focus, and accessibility. Do not use this helper to build a dialog by merely fading an arbitrary `div`.

### 18.3 Live preference installation

Save as `motion-policy.ts`. Install it on the client with `document.documentElement` or the intended application root. Keep server-rendered content stable and visible before installation. Call `refresh()` after changing the application's own stored preference. Dispose it with its owner.

```ts
import {
  resolveMotionMode,
  type MotionMode,
  type MotionPreference,
} from "./motion-core"

/** Install on the client. Render a stable, readable state before installation. */
export function installMotionPolicy(
  root: HTMLElement,
  readPreference: () => MotionPreference,
  onPolicyChange: (mode: MotionMode) => void,
): { refresh: () => void; dispose: () => void } {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  let current: MotionMode | undefined
  let disposed = false

  const refresh = (): void => {
    if (disposed) return
    const next = resolveMotionMode(readPreference(), query.matches)
    root.dataset.motionMode = next
    if (next === current) return
    current = next
    // Stop or reconfigure JS, canvas, and third-party effects in this callback.
    onPolicyChange(next)
  }

  query.addEventListener("change", refresh)
  refresh()
  return {
    // Call after the application's own setting changes.
    refresh,
    dispose: (): void => {
      disposed = true
      query.removeEventListener("change", refresh)
    },
  }
}
```

In `onPolicyChange`, settle active spatial transitions, stop prohibited canvas or shader loops, reconfigure the existing library, and update any third-party effects. Merely changing the root attribute does not stop JavaScript work. A component should use the latest policy when a new interaction begins.

### 18.4 CSS control baseline

Save as `motion.css` or merge into the project's token layer. This is intentionally limited to motion and state feedback. Use the existing design system for target size, typography, spacing, borders, and colors. The inner visual can scale while the real button and its hit box stay fixed.

```css
:root {
  --motion-contact: 70ms;
  --motion-quick: 120ms;
  --motion-feedback: 180ms;
  --motion-settle: 240ms;
  --motion-surface: 320ms;
  --motion-spatial: 420ms;
  --motion-cinematic: 600ms;
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);
}

/* The surrounding design system supplies colors, size, type, and shape. */
.motion-control {
  background-color: var(--control-background, transparent);
  transition:
    background-color var(--motion-quick) var(--motion-ease),
    color var(--motion-quick) var(--motion-ease),
    border-color var(--motion-quick) var(--motion-ease);
}

.motion-control__visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transition: transform var(--motion-quick) var(--motion-ease);
}

.motion-control:focus-visible {
  outline: 2px solid var(--focus-color, currentColor);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .motion-control:not(:disabled):hover {
    background-color: var(--control-background-hover, transparent);
  }
}

.motion-control:not(:disabled):active {
  background-color: var(--control-background-pressed, transparent);
}

/* Optional inner pressure treatment. The semantic button never scales. */
.motion-control[data-press-scale="true"]:not(:disabled):active
  > .motion-control__visual {
  transform: scale(0.98);
  transition-duration: var(--motion-contact);
}

/* Covers application preferences without relying only on the OS query. */
:where([data-motion-mode="reduced"], [data-motion-mode="off"])
  .motion-control > .motion-control__visual {
  transform: none !important;
  transition: none;
}

[data-motion-mode="off"] .motion-control {
  transition: none;
}

:where([data-motion-mode="reduced"], [data-motion-mode="off"])
  [data-motion-layer="ambient"] {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .motion-control > .motion-control__visual {
    transform: none !important;
    transition: none;
  }
  [data-motion-layer="ambient"] {
    display: none;
  }
}

@media print {
  [data-motion-layer="ambient"],
  [data-motion-layer="decorative"] {
    display: none;
  }
}
```

Example semantic markup:

```html
<button class="motion-control" data-press-scale="true" type="button">
  <span class="motion-control__visual">Save changes</span>
</button>
```

The operating-system query and the application attribute both suppress the optional scale. An ambient visual should always have a useful static background beneath it. Hiding the visual layer does not stop its JavaScript renderer, so also stop that renderer through the policy callback.

### 18.5 Framework translation rules

| Source intention | SwiftUI | Motion for React | CSS or Web Animations API |
|---|---|---|---|
| Non-bouncy physical settle | A supported spring with no deliberate bounce | Physical spring using compatible stiffness, damping, and mass | A timed curve is only an approximation unless a proper sampled spring is supplied |
| Related object identity | Supported matched-source and navigation APIs | Stable `layoutId` and an appropriate shared layout context | Measured geometry or a supported View Transition |
| Position-only layout change | Use a layout and animation design that preserves content geometry | Consider position-only layout animation for text-heavy items | Separate moving wrapper from readable content |
| Immediate state | Update without an added animation transaction | Direct state or zero-duration permitted transition | Apply the final style directly |
| Reduced motion | Read the relevant environment or platform preference | Library setting plus explicit handling of custom effects | Media query plus live JavaScript policy |
| Ongoing atmosphere | Explicit time-driven renderer with lifecycle control | A separate controlled renderer, not ordinary component rerenders | One managed loop or prepared texture with a static fallback |

This table identifies API families, not complete component implementations. Confirm exact APIs in the installed versions. Animation defaults, availability, and unit conventions are not guaranteed to match across columns. [A03] [A07] [W02] [W03] [W04] [W07]

### 18.6 Reusable component motion specification

Write a compact specification like this before implementing a complex surface. Replace the illustrative IDs and values with the product's actual decisions.

```yaml
id: media.player.expand
recipe_ids: [P061, P062, P064]
evidence:
  documented_basis: [A02, A06]
  observed_states: [M02, M04]
  parameters: original_recipe_not_apple_measurements
profile: media
trigger:
  action: activate_compact_player
  requires: valid_current_media_item
state:
  logical_owner: media_session
  presentation_owner: player_surface
  from: collapsed
  to: expanded
  playback_effect: none
geometry:
  origin: currently_measured_compact_player
  destination: expanded_player_layout
  identity: stable_media_item_id
  text_scaling: forbidden
motion:
  geometry: spatial_spring_preset
  new_controls_opacity_ms: 180
  backdrop_opacity_ms: 320
  overlap: concurrent_not_serial
  hit_targets: stable_semantic_targets
interruption:
  close_during_open: retarget_from_current_pose
  missing_source_on_return: short_fade_or_direct_close
  viewport_change: remeasure_and_resolve_valid_destination
accessibility:
  presentation_semantics: defined_by_platform_primitive
  focus: real_destination_not_visual_clone
  reduced: opacity_or_direct_without_zoom
  off: direct
  decorative_duplicates: hidden_and_noninteractive
lifecycle:
  hidden: pause_discretionary_rendering
  unmount: stop_animations_and_release_temporary_layers
  playback_engine: never_remounted_by_presentation
checks:
  - open_close_open_during_motion
  - source_removed_before_close
  - resize_while_opening
  - reduced_motion_changed_live
  - keyboard_open_and_close
  - playback_time_unchanged_by_presentation
```

Keep this specification next to the component or in a project motion inventory. The point is to make the behavior reviewable before it becomes scattered event handlers.

<a id="tests"></a>
## 19. Motion testing and measurement

### Test correctness before visual similarity

A final screenshot does not prove the interaction works. Test the path between states, the interruption paths, and the states reached after a failure. Disable animation and verify that the application still performs every task correctly.

### Required interaction matrix

| Scenario | What to check |
|---|---|
| Open, close, open rapidly | Latest intent wins, no queued obsolete entrance |
| Reverse near 20, 50, and 80 percent progress | No jump to the original pose or locked input |
| Hold and cancel a press | Pressed style clears and the action follows normal activation semantics |
| Drag, reverse direction, then release | Position follows input and settling starts at the release pose |
| Pointer cancellation or lost capture | Valid final state, no permanently grabbed control |
| Scroll while an anchored surface is open | Placement and dismissal remain coherent |
| Resize during shared-object movement | New valid geometry, no offscreen destination |
| Source object disappears | Safe fallback rather than invalid geometry |
| Two matching object IDs in different contexts | No cross-window or cross-route identity collision |
| Reduce Motion changes live | Prohibited active effects stop without losing state |
| Off mode | No discretionary transitions, loops, or invisible animation work |
| Keyboard-only navigation | Focus is visible and no control requires hover or drag |
| Touch on a hybrid device | No sticky hover and no stolen page scroll |
| Large text and browser zoom | No clipped labels, inaccessible controls, or stale bounds |
| Right-to-left and long translations | Correct anchors, direction, and layout |
| Slow network | Truthful pending state without a blocked interface |
| Out-of-order responses | Old data cannot replace the newest accepted result |
| Offline and reconnecting | No perpetual spinner or false success |
| Background for several minutes | No catch-up animation storm on return |
| Repeated mounting and unmounting | No listener, texture, timer, or layer leak |
| Image or font fails | Useful fallback without invisible content |
| Print or deterministic capture | Complete stable output without visual clones |

### Geometry checks

Record the target's bounding box before, during, and after pressure feedback. Its semantic hit box should not change simply because its inner visual scales. Inspect text during layout changes at intermediate frames, not just at endpoints.

For a shared-object transition, verify source and destination identity, crop, clipping, corner treatment, focus, and temporary-layer cleanup. Test returning after the source list has scrolled. Test a destination with a different image aspect ratio.

For a sheet, test nested scrolling, keyboard appearance, each detent, fling behavior, cancel, close button, and a source that has no room for the original layout.

### Functional automation versus visual tests

Use deterministic data and controllable request completion for functional tests. Wait for a state or accessibility condition rather than an arbitrary sleep. A test that waits 500 milliseconds and sees the final screen can miss an input lock, a duplicate action, or a discarded response.

Create dedicated motion-lab fixtures for the product's major components. Expose test-only state inspection or use stable user-facing semantics so rapid transitions can be tested without guessing at implementation timing. Do not add production business behavior solely to make a visual test easier.

Visual tests can use deterministic final states with animations disabled. Separate tests should exercise full-mode intermediate behavior and real pointer input. A stable final screenshot is not a substitute for those interaction tests.

### Performance capture

Record the actual device, operating system, application or browser version, display refresh rate, power condition, and relevant accessibility settings. Capture the interaction with representative content, not just an empty demo.

Inspect frame-time spikes, long tasks, layout and paint work, memory growth, and work performed while hidden. Repeat the interaction enough times to detect resource accumulation. Test a lower-powered device and a realistic production build.

### Measuring an Apple reference correctly

To replace a RECIPE value with a MEASURED reference, obtain a lawful real-time recording of the exact Apple application and version. Record the device, input method, content, display refresh rate, recording frame rate, and accessibility settings. Do not use a slowed presentation demo as though it were normal playback.

Identify the first visible response, the main perceptual arrival, and the final settling tail separately. Measure the source and destination geometry and track several intermediate positions. Repeat the interaction, including interruption, rather than inferring a spring from a single opening.

A screen recording can show visible motion but does not by itself measure end-to-end touch latency. A genuine latency measurement needs a synchronized input reference. Recording frame rate can also hide display behavior. State these limits with the result.

Store the measurement as a versioned reference, not a timeless Apple constant. Recheck it when the relevant application or operating system changes.

### Verification performed for this file

The embedded TypeScript modules passed strict type checking. Twelve automated tests covered preference resolution, fallback parsing, unit conversion, initial spring conditions, non-oscillatory approach from rest, retargeting continuity, invalid input rejection, latest-request ownership, cancellation, failure separation, disposal, and reuse after cancellation.

Those tests verify the described helper behavior. They do not verify browser rendering, native SDK compilation, hardware haptics, accessibility-tool behavior, or visual equivalence to Apple's applications. These remain target-application checks.

<a id="quality"></a>
## 20. Review gates and anti-patterns

### Hard failures

Reject an implementation that loses user data, blocks a legitimate interruption, misstates an operation result, hides focus, requires motion to reveal essential information, or ignores a live reduced-motion change. Do not trade these failures against a high visual score.

### Review scorecard

This is an original review tool, not an Apple standard. Score each area from zero to five. A high score requires observed behavior, not a claim that the code “should” work.

| Area | A strong result |
|---|---|
| Responsiveness | Input receives immediate feedback and work is not delayed by presentation |
| Continuity | Related objects retain identity and interruptions begin at the displayed pose |
| Restraint | Motion has a clear purpose and repeated tasks remain efficient |
| Accessibility | Full, Reduced, and Off are usable, with correct focus and alternatives |
| State truth | Pending, success, failure, cancellation, and stale data are distinct |
| Performance | Representative devices stay responsive and resources are released |
| Platform fit | Input, navigation, windows, and preferences respect the host environment |
| Consistency | Similar interactions use shared tokens and exceptions are documented |

A score is useful only after all hard failures are resolved. Keep screenshots or recordings and test evidence for important judgments.

### Common problems and better replacements

| Problem | Replacement |
|---|---|
| Every card rises and tilts on hover | Quiet tint or border feedback, with movement only for a justified object |
| Every button uses a bouncy spring | Short pressure feedback with a stable hit box |
| Every page starts invisible | Stable initial content with optional progressive enhancement |
| Every row appears in a stagger | Immediate collection with a small, bounded group transition only when useful |
| Full-screen animated blur on route change | Stable background or one restrained opacity layer |
| A fake percentage while waiting | Truthful indeterminate or stage-based status |
| Success shown on click | Success shown on confirmed completion |
| Smooth scrolling everywhere | Native scrolling and deliberate, interruptible explicit scroll actions |
| A modal made only from opacity and a backdrop | An established modal primitive with focus and interaction boundaries |
| Repeated `setTimeout` chains | State-driven orchestration and animation lifecycle cleanup |
| Animation completion commits business data | Business state owns the result, presentation follows it |
| Multiple libraries write one transform | One owner or clearly separated wrappers |
| Physics values copied between engines | Equivalent response tuned in the target engine |
| A canvas background runs while hidden | Explicit pause and disposal with a static fallback |
| All Apple-looking surfaces use glass | Content-first hierarchy with limited material surfaces |
| A huge theme-switch wipe | Direct theme state or a short readable color change |
| Text scales during routine layout changes | Position-only movement or separate content crossfade |
| An old request's animation reveals old data | Request identity and last-valid-result ownership |
| Reduced motion merely means faster | Remove nonessential spatial effects and loops |
| A polished demo is called production-ready | Representative data, input, failure, accessibility, and device testing |

<a id="codex"></a>
## 21. Codex adoption workflow

### Repository placement

Place this file at the repository root as `MOTION.md`, or keep its descriptive filename and explicitly reference that path. A file's existence does not guarantee that a coding agent will read it. Add a short instruction to the repository's existing agent guidance rather than relying on an assumed automatic behavior.

Suggested addition to an existing `AGENTS.md`:

```md
For interface changes, read MOTION.md before implementing motion.
Follow its operating contract, applicable recipe IDs, accessibility policy,
and testing requirements. Preserve the existing design system and stack.
Do not apply all recipes or add motion where it does not improve the task.
```

### Ready-to-use implementation prompt

```text
Read MOTION.md and the repository's existing design and agent instructions.
Inspect the current interface, component system, dependencies, and supported
platforms before changing anything.

Use MOTION.md as the motion reference, not as permission to redesign the app.
Preserve functionality, data handling, accessibility, and the existing stack.

Identify the interactions this product actually contains. Choose the smallest
useful subset of recipe IDs. Use the Utility or Standard app profile by default.
Use the Media profile only for an explicitly immersive media surface. Use the
Editorial profile only for a deliberate website storytelling section.

Create a compact motion inventory with the trigger, source and destination,
state owner, animation owner, timing or spring preset, input methods,
interruption behavior, reduced-motion alternative, and tests for each selected
interaction. Separate documented Apple behavior from original tuning values.

Implement centralized tokens and a live Full, Reduced, and Off policy first.
Prefer native controls and existing components. Use CSS for simple effects and
the existing animation library where it adds clear value. Do not add multiple
libraries to control the same properties.

Keep hit targets and text readable. Preserve object identity through related
transitions. Allow repeated input and reversal. Keep requests and business state
independent of animation completion. Do not fabricate progress or success.

Build one representative interaction first, inspect it, then apply the shared
pattern consistently. For complex visual sequences, prepare a static fallback
before the animated version. Do not add continuous backgrounds, hover lifting,
row staggering, or full-page fades by default.

Run the project's relevant checks. Test keyboard and touch behavior, live
reduced-motion changes, rapid open-close-open input, cancellation, resize,
slow and out-of-order requests, and unmount cleanup. Test the actual supported
browser or application runtime where available.

Report the files changed, recipe IDs used, tests actually run, and anything
that remains unverified. Do not claim Apple-exact motion or production readiness
without evidence. Complete the implementation rather than stopping at a plan,
unless I explicitly requested planning only.
```

### Implementation order

Start with pressed, hover, focus, disabled, pending, success, and error states. Then handle navigation, sheets, shared-object transitions, and layout. Add media atmosphere or editorial choreography only after the core interactions behave correctly under interruption and reduced motion.

Use a small motion-lab page or native preview collection to compare related components. Adjust the shared token when a family feels too slow or too elastic. Do not fix systemic inconsistency by adding a different duration to every component.

### Change control

Record a reason for each local exception. A new token should represent a repeated need, not one designer's favorite animation. Revisit complex motion after major layout, framework, or platform changes. Keep the static version first-class.

<a id="research"></a>
## 22. Research ledger and confidence boundaries

### What was reviewed

The research used Apple's public design guidance, animation and interaction sessions, framework documentation, current WWDC26 material, primary platform and animation-library documentation, web accessibility standards, and Mobbin screen and flow previews. References are listed below with their role in the specification.

Apple session transcripts and accompanying code were reviewed as documentary evidence. This is not a claim that every video was watched in real time, that its frames were measured, or that its demonstrations reproduce shipping behavior on every supported device.

The available Mobbin tools returned static screen images and evenly spaced flow previews. Those images were inspected. They provide evidence about visible layouts and state relationships, not continuous animation playback. No duration or spring constant in this file was extracted from a Mobbin screenshot.

### Mobbin observations used

| Reference | What the inspected images establish | What they do not establish |
|---|---|---|
| [Music library and songs flow][M01] | Neutral browsing surfaces and a compact persistent player | Exact opening path or tab-bar animation timing |
| [Music playback and lyrics flow][M02] | A transition in product state from browsing to an immersive lyrics presentation | Continuous playback of the transition or precise lyric movement |
| [Expanded live-player screen][M03] | Large artwork, subdued background, and content-specific transport state | Background animation technique or speed |
| [Expanded music-player screen][M04] | Artwork, metadata, progress, transport, and a dismissal affordance | Exact mini-player morph or shader implementation |
| [Expanded spoken-media screen][M05] | Transport controls adapted to a spoken-media context | The timing of control replacement |
| [Photos detail flow][M06] | A grid item and a larger detail view with persistent image identity | Measured zoom, gesture velocity, or dismissal physics |
| [Photos view-options flow][M07] | Menus and a change in visible grid density | A recorded pinch gesture or a measured layout transition |
| [Maps place-detail flow][M08] | A map context and a foreground place-information surface | Detent thresholds or camera easing |

### Important uncertainties

Apple's public sources do not provide a single complete, cross-product table of all internal motion constants. This file therefore does not label its proposed timings as Apple measurements. Current product behavior may vary by operating-system version, application release, input device, content, and accessibility settings.

A newer session or beta documentation page is evidence of a demonstrated or documented capability, not proof of availability in every shipping SDK. Check the actual declaration and runtime before using it.

The website recipes, data-tool recipes, and many cross-platform adaptations are original recommendations. They are not presented as direct observations of equivalent Apple product screens. The reference deliberately covers contexts beyond the specific applications inspected.

### How to extend the file without weakening it

Add a new pattern when it represents a genuinely different interaction or failure mode. Include its static state, trigger, ownership, cancellation, accessibility alternative, and verification. Link a source when making a factual platform claim. Mark proposed values as recipes and measured values with their device and version context.

Do not convert an attractive screenshot into an invented animation specification. Do not remove an accessibility alternative because a reference video does not show one. Do not substitute an effect's popularity for a clear reason to use it.

<a id="sources"></a>
## 23. Annotated sources

All entries were consulted or inspected for this research on September 12, 2026. These are linked reference materials, not bundled copies of copyrighted source pages or visual assets. The source descriptions identify their use, not a claim that every example or subpage was exhaustively audited.

### Apple design, animation, and framework sources

| ID | Source | Role in this guide |
|---|---|---|
| A01 | [Human Interface Guidelines: Motion][A01] | Purpose, restraint, accessibility, input adaptation, and cancellation |
| A02 | [Designing Fluid Interfaces, WWDC18][A02] | Responsive interaction, interruption, gesture-driven continuity |
| A03 | [Animate with springs, WWDC23][A03] | Spring response, damping, velocity, and the difference between springs and bounce |
| A04 | [Explore SwiftUI animation, WWDC23][A04] | State-driven animation and framework architecture |
| A05 | [Wind your way through advanced animations in SwiftUI, WWDC23][A05] | Phase and keyframe tools for genuinely sequenced behavior |
| A06 | [Enhance your UI animations and transitions, WWDC24][A06] | Source-connected and interactive zoom transitions |
| A07 | [SwiftUI navigationTransition documentation][A07] | Current navigation-transition API reference |
| A08 | [Meet Liquid Glass, WWDC25][A08] | Native material behavior and contextual adaptation |
| A09 | [Get to know the new design system, WWDC25][A09] | Content hierarchy, controls, and related surface behavior |
| A10 | [Build a SwiftUI app with the new design, WWDC25][A10] | Standard components and custom glass coordination |
| A11 | [Applying Liquid Glass to custom views][A11] | Custom material APIs and grouped identity mechanisms |
| A12 | [Build a UIKit app with the new design, WWDC25][A12] | UIKit bars, presentations, and adoption guidance |
| A13 | [What's new in UIKit, WWDC25][A13] | Framework-level changes relevant to native transitions |
| A14 | [What's new in SwiftUI, WWDC25][A14] | Platform-adaptive UI and window-related behavior |
| A15 | [Principles of great design, WWDC26][A15] | Current design framing around intentionality, agency, and craft |
| A16 | [What's new in SwiftUI, WWDC26][A16] | Newer capabilities, with availability verification required |
| A17 | [Use SwiftUI with AppKit and UIKit, WWDC26][A17] | Incremental framework adoption rather than unnecessary rewrites |
| A18 | [Compose advanced graphics effects with SwiftUI, WWDC26][A18] | Artwork, shaders, time-driven visuals, and synchronized transcripts |
| A19 | [Meet Now Playing, WWDC26][A19] | Newer native media integration reference |
| A20 | [Symbols framework documentation][A20] | Effect categories and semantic animation capabilities |
| A21 | [What's new in SF Symbols 5, WWDC23][A21] | Foundational symbol-animation families |
| A22 | [Create animated symbols, WWDC23][A22] | Symbol structure and animation preparation |
| A23 | [What's new in SF Symbols 6, WWDC24][A23] | Additional movement and replacement effects |
| A24 | [What's new in SF Symbols 7, WWDC25][A24] | Drawing and replacement-related capabilities |
| A25 | [Design for the iPadOS pointer, WWDC20][A25] | Pointer-specific interaction rather than generic mouse animation |
| A26 | [Design hover interactions for visionOS, WWDC25][A26] | Privacy-preserving spatial hover and stable interaction targets |
| A27 | [Design considerations for vision and motion, WWDC23][A27] | Spatial comfort and motion-related design constraints |
| A28 | [Principles of spatial design, WWDC23][A28] | Platform context for spatial interfaces |
| A29 | [Human Interface Guidelines: Playing haptics][A29] | Causal, consistent, complementary haptic feedback |
| A30 | [Human Interface Guidelines: Progress indicators][A30] | Truthful progress, consistent placement, and cancellation |
| A31 | [Explore UI animation hitches and the render loop][A31] | Native rendering-performance analysis |
| A32 | [SF Symbols overview][A32] | Current symbol ecosystem and links to platform resources |

### Web and animation-engine sources

| ID | Source | Role in this guide |
|---|---|---|
| W01 | [Motion: React animation][W01] | Current React animation API family |
| W02 | [Motion: Layout animations][W02] | Layout identity, position changes, and context handling |
| W03 | [Motion: Transitions][W03] | Physical versus duration-based springs and transition parameters |
| W04 | [Motion: Accessibility][W04] | Library reduced-motion configuration and its boundaries |
| W05 | [GSAP: matchMedia][W05] | Responsive and preference-aware timeline setup and cleanup |
| W06 | [MDN: prefers-reduced-motion][W06] | Browser motion preference media feature |
| W07 | [MDN: View Transition API][W07] | Browser transition capabilities and scope |
| W08 | [MDN: Using the View Transition API][W08] | Lifecycle, names, snapshots, and progressive enhancement |
| W09 | [WebKit features in Safari 26.4][W09] | Recent native scroll-animation implementation context |
| W10 | [WebKit: Announcing Interop 2026][W10] | Current cross-browser capability work |
| W11 | [WebKit: A cheatsheet of animation ranges][W11] | Scroll-driven range concepts |
| W12 | [Motion: spring][W12] | Standalone spring generator and API-specific units |
| W13 | [MDN: Animation.cancel()][W13] | Cancellation and completion-promise behavior |
| W14 | [MDN: Element.animate()][W14] | Web Animations API entry point |
| W15 | [web.dev: High-performance CSS animations][W15] | Rendering-cost considerations |
| W16 | [web.dev: Interaction to Next Paint][W16] | Interaction responsiveness measurement |
| W17 | [MDN: Use cross-origin images in a canvas][W17] | Image sampling restrictions for artwork-derived backgrounds |

### Accessibility and additional platforms

| ID | Source | Role in this guide |
|---|---|---|
| X01 | [WCAG 2.3.3: Animation from Interactions][X01] | Nonessential interaction-triggered motion, Level AAA |
| X02 | [WCAG 2.2.2: Pause, Stop, Hide][X02] | Relevant moving and auto-updating content requirements, Level A |
| X03 | [WCAG 2.3.1: Three Flashes or Below Threshold][X03] | Flashing-content requirements, Level A |
| X04 | [ARIA Authoring Practices: Modal dialog][X04] | Modal focus and interaction behavior |
| P01 | [Electron: systemPreferences][P01] | System animation preferences and reduced-motion information |
| P02 | [Microsoft: Composition tailoring for WinUI apps][P02] | Adapting Windows composition to preferences and capabilities |
| P03 | [Android: Customize animations][P03] | Compose spring, duration, and interruption behavior |
| P04 | [Flutter: MediaQuery.disableAnimationsOf][P04] | Accessing the platform animation-disable preference |

### Mobbin visual references

| ID | Source | Inspected material |
|---|---|---|
| M01 | [Apple Music: Songs flow][M01] | Two visible browsing states |
| M02 | [Apple Music: Playing a song flow][M02] | Selected previews from a five-screen flow |
| M03 | [Apple Music: Expanded live player][M03] | One complete player screenshot |
| M04 | [Apple Music: Expanded music player][M04] | One complete player screenshot |
| M05 | [Apple Music: Expanded spoken-media player][M05] | One complete player screenshot |
| M06 | [Apple Photos: Photo detail flow][M06] | Three visible states |
| M07 | [Apple Photos: View options and grid density][M07] | Three visible states, not a continuous pinch recording |
| M08 | [Apple Maps: Place detail flow][M08] | Selected previews from an eight-screen flow |

[A01]: <https://developer.apple.com/design/human-interface-guidelines/motion>
[A02]: <https://developer.apple.com/videos/play/wwdc2018/803/>
[A03]: <https://developer.apple.com/videos/play/wwdc2023/10158/>
[A04]: <https://developer.apple.com/videos/play/wwdc2023/10156/>
[A05]: <https://developer.apple.com/videos/play/wwdc2023/10157/>
[A06]: <https://developer.apple.com/videos/play/wwdc2024/10145/>
[A07]: <https://developer.apple.com/documentation/swiftui/view/navigationtransition(_:)>
[A08]: <https://developer.apple.com/videos/play/wwdc2025/219/>
[A09]: <https://developer.apple.com/videos/play/wwdc2025/356/>
[A10]: <https://developer.apple.com/videos/play/wwdc2025/323/>
[A11]: <https://developer.apple.com/documentation/SwiftUI/Applying-Liquid-Glass-to-custom-views>
[A12]: <https://developer.apple.com/videos/play/wwdc2025/284/>
[A13]: <https://developer.apple.com/videos/play/wwdc2025/243/>
[A14]: <https://developer.apple.com/videos/play/wwdc2025/256/>
[A15]: <https://developer.apple.com/videos/play/wwdc2026/250/>
[A16]: <https://developer.apple.com/videos/play/wwdc2026/269/>
[A17]: <https://developer.apple.com/videos/play/wwdc2026/272/>
[A18]: <https://developer.apple.com/videos/play/wwdc2026/322/>
[A19]: <https://developer.apple.com/videos/play/wwdc2026/312/>
[A20]: <https://developer.apple.com/documentation/symbols/>
[A21]: <https://developer.apple.com/videos/play/wwdc2023/10197/>
[A22]: <https://developer.apple.com/videos/play/wwdc2023/10257/>
[A23]: <https://developer.apple.com/videos/play/wwdc2024/10188/>
[A24]: <https://developer.apple.com/videos/play/wwdc2025/337/>
[A25]: <https://developer.apple.com/videos/play/wwdc2020/10640/>
[A26]: <https://developer.apple.com/videos/play/wwdc2025/303/>
[A27]: <https://developer.apple.com/videos/play/wwdc2023/10078/>
[A28]: <https://developer.apple.com/videos/play/wwdc2023/10076/>
[A29]: <https://developer.apple.com/design/human-interface-guidelines/playing-haptics>
[A30]: <https://developer.apple.com/design/human-interface-guidelines/progress-indicators>
[A31]: <https://developer.apple.com/videos/play/tech-talks/10855/>
[A32]: <https://developer.apple.com/sf-symbols/>
[W01]: <https://motion.dev/docs/react-animation>
[W02]: <https://motion.dev/docs/react-layout-animations>
[W03]: <https://motion.dev/docs/react-transitions>
[W04]: <https://motion.dev/docs/react-accessibility>
[W05]: <https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/>
[W06]: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion>
[W07]: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API>
[W08]: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using>
[W09]: <https://webkit.org/blog/17862/webkit-features-for-safari-26-4/>
[W10]: <https://webkit.org/blog/17818/announcing-interop-2026/>
[W11]: <https://webkit.org/blog/17184/so-many-ranges-so-little-time-a-cheatsheet-of-animation-ranges-for-your-next-scroll-driven-animation/>
[W12]: <https://motion.dev/docs/spring>
[W13]: <https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel>
[W14]: <https://developer.mozilla.org/en-US/docs/Web/API/Element/animate>
[W15]: <https://web.dev/articles/animations-guide>
[W16]: <https://web.dev/articles/inp>
[W17]: <https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image>
[X01]: <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>
[X02]: <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>
[X03]: <https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html>
[X04]: <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>
[P01]: <https://www.electronjs.org/docs/latest/api/system-preferences>
[P02]: <https://learn.microsoft.com/en-us/windows/apps/develop/composition/composition-tailoring>
[P03]: <https://developer.android.com/develop/ui/compose/animation/customize>
[P04]: <https://api.flutter.dev/flutter/widgets/MediaQuery/disableAnimationsOf.html>
[M01]: <https://mobbin.com/flows/7b8321fd-e964-41a4-875f-45a41bf1e79a>
[M02]: <https://mobbin.com/flows/3d221445-187d-4d5a-b903-10bd2d57726c>
[M03]: <https://mobbin.com/screens/7dffdd20-1c22-4248-af23-0baeed61bb76>
[M04]: <https://mobbin.com/screens/d89d38cd-f756-41e2-9558-9234a1b64dca>
[M05]: <https://mobbin.com/screens/5170ed5a-011c-4b63-80d2-c53f6bcfa9bf>
[M06]: <https://mobbin.com/flows/e70414a5-02a5-46ed-8e56-1d4b277e446f>
[M07]: <https://mobbin.com/flows/1dbf59e9-f687-4387-9207-f3b4ac9a5c68>
[M08]: <https://mobbin.com/flows/e7be5181-7495-4241-80d1-5af54c618dd7>
