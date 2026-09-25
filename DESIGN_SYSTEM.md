# Shared interface design

The main website, studio library, Solera player and frame gallery share one foundation:

`public/shared/solera-foundation.css`

Load it before page styles in every document. Iframes are separate documents and must load it explicitly. The main Next layout loads it once for its routes.

## Ownership

- Foundation owns named local fonts, semantic palette, focus, control radius and minimum target size.
- Application styles own layout, breakpoints, typography scale and component states.
- Media uses one `style.css`; do not add another corrective theme layer.
- Solera retains its active stylesheet order: player, polish, expanded, cover, theme. Responsive layout measurements and reviewed portrait framing must be preserved.
- Main-site effects remain local to the cinematic entry. Global body rules must not lock scrolling or make all page text a scene accent.

## Roles

| Role | Token |
| --- | --- |
| Page background | `--solera-bg` |
| Cinematic void | `--solera-bg-cinema` |
| Normal and raised panels | `--solera-surface`, `--solera-surface-raised` |
| Primary and secondary text | `--solera-text`, `--solera-text-muted` |
| Borders | `--solera-border` |
| Selected and primary action accent | `--solera-gold` |
| Focus and interactive cues | `--solera-mana` |
| Cinematic effects | `--solera-cinema-accent` |
| Titles | `--solera-font-display` |
| Short labels and terminal text | `--solera-font-label` |
| Reading text and forms | `--solera-font-body` |

Use semantic names. Do not reintroduce `--ink`, `--green`, or another alias whose meaning varies between applications.

## Deliberate exceptions

Cinematic effects and supplied art can contain other colors. Cream portrait backing used with multiply blending is part of the artwork treatment, not an interface panel. Do not recolor supplied media or change reviewed crops to match a UI token.

## Verification

Check main entry, studio library, frame gallery, game title/selection/settings/dialogue, media Originals/Explore/detail/player, checkout and creator forms at desktop and mobile sizes. Include a narrow viewport and short landscape. Verify focus, dark native controls, no clipping, and no unresolved foundation variables.

## Death & Desire

The media platform uses a separate light, WEBTOON-inspired reader interface, per the latest product direction. Its own public/media-preview/style.css defines --dd-* semantic tokens. Do not load the Solera foundation into this iframe or apply fantasy display fonts to the media app. Its two category tabs are Originals and Explore. The earlier shared dark treatment was rejected for this platform.
