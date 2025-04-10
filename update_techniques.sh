#!/bin/bash

# Define attribute mappings based on attribute mentioned in the technique
sed -i 's/attribute: "strength",/attribute: "strength", attributeScaling: "strength",/g' client/src/pages/martial-techniques.tsx
sed -i 's/attribute: "agility",/attribute: "agility", attributeScaling: "agility",/g' client/src/pages/martial-techniques.tsx
sed -i 's/attribute: "endurance",/attribute: "endurance", attributeScaling: "endurance",/g' client/src/pages/martial-techniques.tsx
sed -i 's/attribute: "intelligence",/attribute: "intelligence", attributeScaling: "intelligence",/g' client/src/pages/martial-techniques.tsx
sed -i 's/attribute: "perception",/attribute: "perception", attributeScaling: "perception",/g' client/src/pages/martial-techniques.tsx

# Add type based on damage and effect
sed -i '/damage: 0,/,/cooldown:/s/cooldown: \([0-9]*\),/cooldown: \1, type: "utility",/g' client/src/pages/martial-techniques.tsx
sed -i '/effect: { type: .defense.,/,/attribute:/s/attribute:/type: "defense", attribute:/g' client/src/pages/martial-techniques.tsx
sed -i '/effect: { type: .health.,/,/attribute:/s/attribute:/type: "utility", attribute:/g' client/src/pages/martial-techniques.tsx
sed -i '/effect: { type: .lifesteal.,/,/attribute:/s/attribute:/type: "attack", attribute:/g' client/src/pages/martial-techniques.tsx
sed -i '/effect: { type: .poison.,/,/attribute:/s/attribute:/type: "attack", attribute:/g' client/src/pages/martial-techniques.tsx
sed -i '/damage: \([1-9][0-9]*\),/,/cooldown:/s/cooldown: \([0-9]*\),\n    \(effect\|attribute\)/cooldown: \1, type: "attack",\n    \2/g' client/src/pages/martial-techniques.tsx

# Add maxLevel based on tier
sed -i 's/tier: 1,/tier: 1, maxLevel: 10,/g' client/src/pages/martial-techniques.tsx
sed -i 's/tier: 2,/tier: 2, maxLevel: 15,/g' client/src/pages/martial-techniques.tsx
sed -i 's/tier: 3,/tier: 3, maxLevel: 20,/g' client/src/pages/martial-techniques.tsx
sed -i 's/tier: 4,/tier: 4, maxLevel: 25,/g' client/src/pages/martial-techniques.tsx
sed -i 's/tier: 5,/tier: 5, maxLevel: 30,/g' client/src/pages/martial-techniques.tsx
