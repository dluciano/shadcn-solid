#!/usr/bin/env node

// src/utils/get-package-manager.ts
import { promises as fs } from "fs";
import path from "path";
async function fileExists(path4) {
  try {
    await fs.access(path4);
    return true;
  } catch {
    return false;
  }
}
async function getPackageManager(targetDir) {
  const [yarnLock, npmLock, pnpmLock] = await Promise.all([
    fileExists(path.resolve(targetDir, "yarn.lock")),
    fileExists(path.resolve(targetDir, "package-lock.json")),
    fileExists(path.resolve(targetDir, "pnpm-lock.yaml"))
  ]);
  if (yarnLock) {
    return "yarn";
  }
  if (pnpmLock) {
    return "pnpm";
  }
  if (npmLock) {
    return "npm";
  }
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) {
    return "npm";
  }
  if (userAgent.startsWith("yarn")) {
    return "yarn";
  }
  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }
  return "npm";
}

// src/utils/logger.ts
import chalk from "chalk";
var logger = {
  error(...args) {
    console.log(chalk.red(...args));
  },
  warn(...args) {
    console.log(chalk.yellow(...args));
  },
  info(...args) {
    console.log(chalk.cyan(...args));
  },
  success(...args) {
    console.log(chalk.green(...args));
  },
  break() {
    console.log("");
  }
};

// src/utils/handle-error.ts
function handleError(error) {
  if (typeof error === "string") {
    logger.error(error);
    process.exit(1);
  }
  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }
  logger.error("Something went wrong. Please try again.");
  process.exit(1);
}

// src/utils/templates.ts
var UNO_CONFIG_WITH_VARIABLES = `import {
    defineConfig,
    presetIcons,
    presetUno,
    presetWebFonts,
    transformerDirectives,
    transformerVariantGroup,
} from "unocss"
import type { Theme } from "unocss/preset-uno"

export default defineConfig<Theme>({
    presets: [
        presetUno(),
        presetWebFonts({
            fonts: {
                sans: {
                    name: "Inter",
                    italic: false,
                    provider: "google",
                    weights: [400, 500, 600, 700],
                },
            },
        }),
        presetIcons({
            extraProperties: {
                width: "1rem",
                height: "1rem",
            },
        }),
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            maxWidth: {
                "2xl": "1400px",
            },
        },
        colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
            },
            card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
            },
        },
        borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
        },
        animation: {
            keyframes: {
                "accordion-down":
                    "{ from { height: 0 } to { height: var(--kb-accordion-content-height) }}",
                "accordion-up":
                    "{ from { height: var(--kb-accordion-content-height) } to { height: 0 }}",
                "collapsible-down":
                    "{ from { height: 0 } to { height: var(--kb-collapsible-content-height) }}",
                "collapsible-up":
                    "{ from { height: var(--kb-collapsible-content-height) } to { height: 0 }}",
                "content-show":
                    "{ from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) }}",
                "content-hide":
                    "{ from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.96) }}",
                "slide-in":
                    "{ from { transform: translateY(calc(100% + var(--viewport-padding))) } to { transform: translateY(0) }}",
                "slide-out":
                    "{ from { transform: translateY(var(--kb-toast-swipe-end-y)) } to { transform: translateY(calc(100% + var(--viewport-padding))) }}",
            },
            durations: {
                "accordion-down": "200ms",
                "accordion-up": "200ms",
                "collapsible-down": "200ms",
                "collapsible-up": "200ms",
                "content-show": "200ms",
                "content-hide": "200ms",
                "slide-out-left": "200ms",
                "slide-in-left": "300ms",
                "slide-out-right": "200ms",
                "slide-in-right": "300ms",
                "slide-out-down": "200ms",
                "slide-in-down": "300ms",
                "slide-out-up": "200ms",
                "slide-in-up": "300ms",
                "fade-in": "100ms",
                "fade-out": "100ms",
                "slide-in": "150ms",
                "slide-out": "100ms",
            },
            timingFns: {
                "accordion-down": "ease-out",
                "accordion-up": "ease-out",
                "collapsible-down": "ease-out",
                "collapsible-up": "ease-out",
                "content-show": "ease-out",
                "content-hide": "ease-in",
                "slide-out-left": "ease-out",
                "slide-in-left": "ease-in",
                "slide-out-right": "ease-out",
                "slide-in-right": "ease-in",
                "slide-out-down": "ease-out",
                "slide-in-down": "ease-in",
                "slide-out-up": "ease-out",
                "slide-in-up": "ease-in",
                "fade-in": "ease-in",
                "fade-out": "ease-out",
                "slide-in": "cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-out": "ease-out",
            },
            counts: {
                "content-hide": "forwards",
            },
        },
    },
})`;
var CSS = `:root {
    --background: 0, 0%, 100%;
    --foreground: 240, 10%, 3.9%;

    --muted: 240, 4.8%, 95.9%;
    --muted-foreground: 240, 3.8%, 46.1%;

    --popover: 0, 0%, 100%;
    --popover-foreground: 240, 10%, 3.9%;

    --card: 0, 0%, 100%;
    --card-foreground: 240, 10%, 3.9%;

    --border: 240, 5.9%, 90%;
    --input: 240, 5.9%, 90%;

    --primary: 240, 5.9%, 10%;
    --primary-foreground: 0, 0%, 98%;

    --secondary: 240, 4.8%, 95.9%;
    --secondary-foreground: 240, 5.9%, 10%;

    --accent: 240, 4.8%, 95.9%;

    --destructive: 0, 84.2%, 60.2%;
    --destructive-foreground: 0, 0%, 98%;

    --ring: 240, 5%, 64.9%;

    --radius: 0.5rem;

    --viewport-padding: 16px;
}

[data-kb-theme="dark"] {
    --background: 240, 10%, 3.9%;
    --foreground: 0, 0%, 98%;

    --muted: 240, 3.7%, 15.9%;
    --muted-foreground: 240, 5%, 64.9%;

    --popover: 240, 10%, 3.9%;
    --popover-foreground: 0, 0%, 98%;

    --card: 240, 10%, 3.9%;
    --card-foreground: 0, 0%, 98%;

    --border: 240, 3.7%, 15.9%;
    --input: 240, 3.7%, 15.9%;

    --primary: 0, 0%, 98%;
    --primary-foreground: 240, 5.9%, 10%;

    --secondary: 240, 3.7%, 15.9%;
    --secondary-foreground: 0, 0%, 98%;

    --accent: 240, 3.7%, 15.9%;

    --destructive: 0, 62.8%, 30.6%;
    --destructive-foreground: 0, 85.7%, 97.3%;

    --ring: 240, 3.7%, 15.9%;
}

* {
    @apply border-border;
}

body {
    font-feature-settings: "rlig" 1, "calt" 1;
}`;

// src/commands/init.ts
import chalk2 from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import { existsSync, promises as fs2 } from "fs";
import ora from "ora";
import path2 from "path";
import * as z from "zod";
var PROJECT_DEPENDENCIES = [
  "class-variance-authority",
  "@iconify-json/lucide"
];
var initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean()
});
var init = new Command().name("init").description("initialize your project and install dependencies").option(
  "-c, --cwd <cwd>",
  "the working directory. defaults to the current directory.",
  process.cwd()
).action(async (opts) => {
  try {
    const options = initOptionsSchema.parse(opts);
    const cwd = path2.resolve(options.cwd);
    if (!existsSync(cwd)) {
      logger.error(
        `The path ${cwd} does not exist. Please try again.`
      );
      process.exit(1);
    }
    await runInit(cwd);
    logger.info("");
    logger.info(
      `${chalk2.green("Success!")} Project initialization completed.`
    );
    logger.info("");
  } catch (error) {
    handleError(error);
  }
});
async function runInit(cwd) {
  const spinner = ora(`Initializing project...`)?.start();
  await fs2.writeFile(
    "uno.config.ts",
    UNO_CONFIG_WITH_VARIABLES,
    "utf8"
  );
  await fs2.writeFile("src/styles/global.css", CSS, "utf8");
  spinner?.succeed();
  const dependenciesSpinner = ora(`Installing dependencies...`)?.start();
  const packageManager = await getPackageManager(cwd);
  await execa(
    packageManager,
    [packageManager === "npm" ? "install" : "add", ...PROJECT_DEPENDENCIES],
    {
      cwd
    }
  );
  dependenciesSpinner?.succeed();
}

// src/index.ts
import { Command as Command2 } from "commander";

// src/utils/get-package-info.ts
import path3 from "path";
import fs3 from "fs-extra";
function getPackageInfo() {
  const packageJsonPath = path3.join("package.json");
  return fs3.readJSONSync(packageJsonPath);
}

// src/index.ts
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
async function main() {
  const packageInfo = getPackageInfo();
  const program = new Command2().name("shadcn-solid").description("add components and dependencies to your project").version(
    packageInfo.version || "1.0.0",
    "-v, --version",
    "display the version number"
  );
  program.addCommand(init);
  program.parse();
}
main();
//# sourceMappingURL=index.js.map