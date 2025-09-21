# Journal

## 20250921

### Initialize Project with Bun

```bash
douyipu@translator-cli:~$ mkdir translator-cli
douyipu@translator-cli:~$ cd translator-cli/
douyipu@translator-cli:~/translator-cli$ bun init

✓ Select a project template: Blank

 + .gitignore
 + CLAUDE.md
 + index.ts
 + tsconfig.json (for editor autocomplete)
 + README.md

To get started, run:

    bun run index.ts

bun install v1.2.21 (7c45ed97)

+ @types/bun@1.2.22
+ typescript@5.9.2

7 packages installed [3.24s]

douyipu@translator-cli:~/translator-cli$ tree -L 1
.
├── CLAUDE.md
├── README.md
├── bun.lock
├── index.ts
├── node_modules
├── package.json
└── tsconfig.json

2 directories, 6 files

douyipu@translator-cli:~/translator-cli$ mkdir docs
douyipu@translator-cli:~/translator-cli$ touch mkdir/Journal.md
```
