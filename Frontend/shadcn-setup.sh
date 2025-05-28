#!/bin/bash

npx shadcn@latest init <<EOF
react 
.
new-york
slate
yes
no
@/components
@/lib/utils
no
Y
EOF

npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add checkbox
npx shadcn@latest add sheet
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add skeleton
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add label