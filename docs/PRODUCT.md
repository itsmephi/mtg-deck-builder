# Project Brew — Product

<!-- 
  Owned by: Claude.ai / Phi
  Updated when: the answer to "what is this app" changes
  Not updated for: features, polish, version bumps
  Last updated: v1.20.0 (foundation reset)
-->

## What it is

A visual-first Magic: The Gathering deck builder, designed for a 13-year-old named Thurgood and anyone like him: younger players, casual players, and people new to the hobby who find tools like Moxfield and Archidekt too busy and too dense.

Project Brew treats deck building as a creative act. Choosing the right cards matters. Choosing the right *art* for those cards matters too. The app exists to make both feel good.

## Who it's for

**The user is Thurgood.** A 13-year-old who's deep into MTG, building decks daily, advancing fast, and visual by nature. He discovers cards on EDHrec, MTG Goldfish, and TCGplayer. He brings them into Project Brew to organize, refine, and eventually buy.

If other people find Project Brew useful — Thurgood's friends, other kids in the same chrome-tabs trap, casual players who want something simpler — that's a win. We'll listen to their feedback. But we design for Thurgood first. Compromising the experience to serve a broader audience is not the trade we make.

## What problem it solves

Before Project Brew, Thurgood built decks in dozens of Chrome tabs — one per card, scattered across TCGplayer and EDHrec, kept open until he was ready to buy. The existing tools (Moxfield, Archidekt) were too cluttered, too feature-heavy, and not built for someone like him.

Project Brew is the place where decks live. It replaces the tabs. It does not try to replace the discovery sites — those are good at what they do, and Thurgood is happy to use them. Project Brew's job is everything *after* the discovery: capturing the card, organizing the deck, choosing the art, reconciling against what he owns, and buying the gap.

## The core loop

1. **Capture.** Discover cards externally (EDHrec, MTG Goldfish, TCGplayer, friends, paper) and bring them into Project Brew with as little friction as possible — drag a URL, paste a list, search by name.
2. **Build.** Organize cards into decks. Light-touch format awareness (Freeform, Standard, Commander) catches problems without getting in the way. Choose the art you want for each card.
3. **Reconcile.** Mark what you own from your paper collection. See the gap.
4. **Purchase.** Buy the missing cards on TCGplayer or Card Kingdom in one click.

A fifth loop, **Brew**, is in development: contextual suggestions based on the deck you're building. Cards that fit the strategy, cards similar to ones you've already added, cards from the same theme. This is *brewing as creative exploration*, not "be EDHrec." It uses your deck as the input, not other people's decklists.

## What makes it different

- **Art swap as a first-class creative act.** Other tools treat art as metadata. Project Brew treats it as part of the decision. Swapped art persists in the deck and flows through to purchase.
- **Made by an artist for an artist.** Visual, uncluttered, generous with whitespace. Most MTG tools are built by engineers and look like spreadsheets. Project Brew doesn't.
- **Capture-friendly, not capture-hostile.** Drag a TCGplayer URL into the app and the card lands in your deck. Paste a decklist from anywhere. The web is where cards are found; the app meets you there.
- **Light-touch format intelligence.** Knows what's legal, knows about commanders and partners and color identity, but never blocks you. Warnings, not walls.
- **Built for one kid, shared with everyone.** No accounts required to try. No paywall. No ads. Buy Me a Coffee is the entire business model.

## What it's not

- **Not Moxfield or Archidekt.** Not trying to be the deck-sharing social platform for competitive players.
- **Not EDHrec or MTG Goldfish.** Not trying to recreate discovery features built on millions of public decklists. We integrate with those tools; we don't replace them.
- **Not a tournament rules engine.** The simulator is for testing opening hands and getting a feel for the deck, not for adjudicating tournament-grade play.
- **Not a marketplace.** We link out to TCGplayer and Card Kingdom for purchases. We don't take a cut.
- **Not a business.** No revenue plans, no growth targets, no engagement metrics. Made because we wanted to make it.

## North Star

Make something Thurgood loves using every day. Share it with anyone who finds it useful — especially other kids drowning in Chrome tabs the way he was. If it brightens someone else's deck-building afternoon, that's the win.

## Design Principles

1. **Visual first.** The card and its art are the unit of attention. Everything else is in service of that.
2. **Capture should feel like grabbing.** Bringing a card from the web into a deck should be effortless — the lower the friction, the more the app feels like an extension of how you already work.
3. **Decks are creative objects.** Building a deck isn't data entry. It's a creative act. The app should feel that way to use.
4. **Help, don't lecture.** Format rules, color identity, copy limits — surface them as gentle warnings, never as walls.
5. **Generous, not greedy.** No dark patterns, no upsells, no engagement traps. The app respects the user's time and attention.
6. **Ship for the user we have.** Thurgood is the user. Decisions get made by asking "does this make Thurgood's afternoon better?"

## Where it's heading

Public access (free, optional accounts for sync), mobile-responsive design that actually works on iPad, contextual brewing suggestions, and Supabase-backed cloud sync. Beyond that — we don't know yet. We'll keep listening to Thurgood, and to anyone else who shows up.
