# Tripp - 3D Web Game

A 3D web-based game built with Next.js, Three.js, and React Three Fiber. Players control an agent named Tripp who battles a boss in a 3D environment, with vending machine interactions and progression mechanics.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript 5.x
- **3D Engine**: Three.js 0.179.1
- **React 3D**: React Three Fiber 9.3.0 + Drei 10.7.4
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4.1.12
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint 9.x with Next.js config
- **Blockchain**: Wagmi 2.16.8 + Viem for Web3 integration

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main game page with Canvas
│
├── components/            # 3D and UI components
│   ├── hud/              # UI overlay components
│   │   ├── hud.tsx       # Main HUD interface
│   │   └── button-connect.tsx
│   ├── agent.tsx         # Player character
│   ├── boss-v2.tsx       # Boss enemy
│   ├── floor.tsx         # Game floor/ground
│   ├── attack-effects.tsx # Visual effects
│   ├── footsteps.tsx     # Audio/visual footsteps
│   ├── seven-eleven.tsx  # 7-Eleven store model
│   ├── vending-machine.tsx # Vending machine
│   └── providers.tsx     # React providers wrapper
│
├── stores/               # Zustand state management
│   └── floor.ts         # Main game state store
│
├── config/              # Configuration files
│   └── game.ts         # Game constants and settings
│
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities (cn helper)
│
├── styles/             # Global styles
│   └── globals.css     # Tailwind + custom CSS
│
└── public/            # Static assets
    └── elements/      # UI element images
```

## 🎮 Game Features

### Core Gameplay
- **3D Movement**: Click-to-move character control
- **Combat System**: Turn-based combat with boss enemy
- **Health System**: Player HP (3 max) vs Boss HP (10 max)
- **Mission Progression**: 4-step mission system
- **Score System**: 0-3 point scoring based on actions

### Interactive Elements
- **Boss Combat**: Attack sequences with visual effects
- **Vending Machine**: Buy Coke for health restoration and damage buff
- **Camera Effects**: Shake effects on combat hits
- **Emote System**: Character expressions (cry, perfection, cool)
- **Win Condition**: Defeat boss to get promo code

### UI/UX Features
- **HUD Interface**: Health bars, attack button, score display
- **Modals**: Onboarding, win screen, shop interface
- **Visual Effects**: Attack animations, particle effects
- **Responsive Design**: Full viewport 3D canvas

## 🛠 Development

### Prerequisites
- Node.js (latest LTS)
- Bun (package manager)

### Installation
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

### Development Features
- **Hot Reload**: Turbopack for fast development
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Path Aliases**: `@/` points to project root

## 🎯 Game State Management

The game uses Zustand for centralized state management with the following key states:

### Combat State
- Player HP, damage, and status
- Boss HP, damage, and animations
- Attack sequences and effects

### UI State  
- Modal visibility (onboarding, win, shop)
- Button states (attack, buy coke)
- Emote displays

### Progression State
- Mission steps (0-3)
- Score tracking (0-3)
- Boss defeat status
- One-time action flags

### Camera & Effects
- Camera shake triggers and parameters
- Visual effect states
- Animation control

## 🎨 Visual Assets

- Custom UI elements in `/public/elements/`
- 3D models loaded via components
- Particle effects and shaders
- Responsive design elements

## 🚀 Deployment

The project is configured for deployment with:
- Next.js static export capability
- Optimized build with Turbopack
- TypeScript compilation
- Asset optimization

## 🔧 Configuration

Key configuration files:
- `config/game.ts` - Game constants, positions, and settings
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript settings
- `eslint.config.mjs` - Linting rules
- `tailwind.config.ts` - Styling configuration

## 🎮 Controls

- **Click to Move**: Click on the floor to move the character
- **Attack Button**: Click when near boss to attack
- **Buy Coke**: Interact with vending machine when nearby
- **UI Interactions**: Various modal and button interactions

## 📋 Mission Flow

1. **Find Grub** - Locate and hit the boss once
2. **Get a Coke** - Purchase from the vending machine  
3. **Hit Grub** - Defeat the boss with enhanced damage
4. **Mission Complete** - Receive win code and celebration

The game combines 3D exploration, combat mechanics, and progression systems in a web-based environment with modern React and Three.js technologies.
