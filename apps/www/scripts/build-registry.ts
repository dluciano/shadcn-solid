import { registry } from "@/registry";
import { colorMapping, colors } from "@/registry/colors";
import { frameworks } from "@/registry/framework";
import { registrySchema } from "@/registry/schema";
import template from "lodash.template";
import fs from "node:fs";
import { basename, join } from "node:path";
import { rimraf } from "rimraf";

const REGISTRY_PATH = join(process.cwd(), "public/registry");

const result = registrySchema.safeParse(registry);

if (!result.success) {
  console.error(result.error);
  process.exit(1);
}

// ----------------------------------------------------------------------------
// Build __registry__/index.js.
// ----------------------------------------------------------------------------
let index = `// This file is autogenerated by scripts/build-registry.ts
// Do not edit this file directly.
import { lazy } from "solid-js"

export const Index = {
`;

for (const framework of frameworks) {
  index += `  "${framework.name}": {`;

  // Build style index.
  for (const item of result.data) {
    if (item.type === "components:example" && framework.name === "unocss") {
      break;
    }

    const resolveFiles = item.files.map(file =>
      framework.name === "unocss"
        ? `../../packages/${framework.name}/${file}`
        : `registry/${framework.name}/${file}`
    );

    const type = item.type.split(":")[1];
    index += `
    "${item.name}": {
      name: "${item.name}",
      type: "${item.type}",
      registryDependencies: ${JSON.stringify(item.registryDependencies)},
      component: lazy(() => ${framework.name === "unocss" ? `import("@repo/${framework.name}/${type}/${item.name}"))` : `import("@/registry/${framework.name}/${type}/${item.name}"))`},
      files: [${resolveFiles.map(file => `"${file}"`)}],
    },`;
  }

  index += `
  },`;
}

index += `
}
`;

// Write style index.
rimraf.sync(join(process.cwd(), "src/__registry__/index.js"));
fs.writeFileSync(join(process.cwd(), "src/__registry__/index.js"), index);

// ----------------------------------------------------------------------------
// Build registry/frameworks/[framework]/[name].json.
// ----------------------------------------------------------------------------
for (const framework of frameworks) {
  const targetPath = join(REGISTRY_PATH, "frameworks", framework.name);

  // Create directory if it doesn't exist.
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  for (const item of result.data) {
    if (item.type !== "components:ui") {
      continue;
    }

    const files = item.files?.map(file => {
      if (framework.name === "unocss") {
        const content = fs.readFileSync(
          join(process.cwd(), "../../packages", framework.name, file),
          "utf8"
        );

        return {
          name: basename(file),
          content
        };
      }

      const content = fs.readFileSync(
        join(process.cwd(), "src/registry", framework.name, file),
        "utf8"
      );

      return {
        name: basename(file),
        content
      };
    });

    const payload = {
      ...item,
      files
    };

    fs.writeFileSync(
      join(targetPath, `${item.name}.json`),
      JSON.stringify(payload, null, 2),
      "utf8"
    );
  }
}

// ----------------------------------------------------------------------------
// Build registry/frameworks/index.json.
// ----------------------------------------------------------------------------
const stylesJson = JSON.stringify(frameworks, null, 2);
fs.writeFileSync(join(REGISTRY_PATH, "frameworks/index.json"), stylesJson, "utf8");

// ----------------------------------------------------------------------------
// Build registry/index.json.
// ----------------------------------------------------------------------------
const names = result.data.filter(item => item.type === "components:ui");
const registryJson = JSON.stringify(names, null, 2);
rimraf.sync(join(REGISTRY_PATH, "index.json"));
fs.writeFileSync(join(REGISTRY_PATH, "index.json"), registryJson, "utf8");

// ----------------------------------------------------------------------------
// Build registry/colors/index.json.
// ----------------------------------------------------------------------------
const colorsTargetPath = join(REGISTRY_PATH, "colors");
rimraf.sync(colorsTargetPath);
if (!fs.existsSync(colorsTargetPath)) {
  fs.mkdirSync(colorsTargetPath, { recursive: true });
}

const colorsData: Record<string, any> = {};
for (const [color, value] of Object.entries(colors)) {
  if (typeof value === "string") {
    colorsData[color] = value;
    continue;
  }

  if (Array.isArray(value)) {
    colorsData[color] = value.map(item => ({
      ...item,
      rgbChannel: item.rgb.replace(/^rgb\((\d+),(\d+),(\d+)\)$/, "$1 $2 $3"),
      hslChannel: item.hsl.replace(/^hsl\(([\d.]+),([\d.]+%),([\d.]+%)\)$/, "$1 $2 $3")
    }));
    continue;
  }

  if (typeof value === "object") {
    colorsData[color] = {
      ...value,
      rgbChannel: value.rgb.replace(/^rgb\((\d+),(\d+),(\d+)\)$/, "$1 $2 $3"),
      hslChannel: value.hsl.replace(/^hsl\(([\d.]+),([\d.]+%),([\d.]+%)\)$/, "$1 $2 $3")
    };
  }
}

fs.writeFileSync(join(colorsTargetPath, "index.json"), JSON.stringify(colorsData, null, 2), "utf8");

// ----------------------------------------------------------------------------
// Build registry/colors/[framework]/[base].json.
// ----------------------------------------------------------------------------
const TAILWIND_BASE_STYLES = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const TAILWIND_BASE_STYLES_WITH_VARIABLES = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: <%- colors.light["background"] %>;
    --foreground: <%- colors.light["foreground"] %>;

    --card: <%- colors.light["card"] %>;
    --card-foreground: <%- colors.light["card-foreground"] %>;

    --popover: <%- colors.light["popover"] %>;
    --popover-foreground: <%- colors.light["popover-foreground"] %>;

    --primary: <%- colors.light["primary"] %>;
    --primary-foreground: <%- colors.light["primary-foreground"] %>;

    --secondary: <%- colors.light["secondary"] %>;
    --secondary-foreground: <%- colors.light["secondary-foreground"] %>;

    --muted: <%- colors.light["muted"] %>;
    --muted-foreground: <%- colors.light["muted-foreground"] %>;

    --accent: <%- colors.light["accent"] %>;
    --accent-foreground: <%- colors.light["accent-foreground"] %>;

    --destructive: <%- colors.light["destructive"] %>;
    --destructive-foreground: <%- colors.light["destructive-foreground"] %>;

    --border: <%- colors.light["border"] %>;
    --input: <%- colors.light["input"] %>;
    --ring: <%- colors.light["ring"] %>;

    --radius: 0.5rem;
  }

  [data-kb-theme="dark"] {
    --background: <%- colors.dark["background"] %>;
    --foreground: <%- colors.dark["foreground"] %>;

    --card: <%- colors.dark["card"] %>;
    --card-foreground: <%- colors.dark["card-foreground"] %>;

    --popover: <%- colors.dark["popover"] %>;
    --popover-foreground: <%- colors.dark["popover-foreground"] %>;

    --primary: <%- colors.dark["primary"] %>;
    --primary-foreground: <%- colors.dark["primary-foreground"] %>;

    --secondary: <%- colors.dark["secondary"] %>;
    --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;

    --muted: <%- colors.dark["muted"] %>;
    --muted-foreground: <%- colors.dark["muted-foreground"] %>;

    --accent: <%- colors.dark["accent"] %>;
    --accent-foreground: <%- colors.dark["accent-foreground"] %>;

    --destructive: <%- colors.dark["destructive"] %>;
    --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;

    --border: <%- colors.dark["border"] %>;
    --input: <%- colors.dark["input"] %>;
    --ring: <%- colors.dark["ring"] %>;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

const UNO_BASE_STYLES_WITH_VARIABLES = `:root {
  --background: <%- colors.light["background"] %>;
  --foreground: <%- colors.light["foreground"] %>;

  --card: <%- colors.light["card"] %>;
  --card-foreground: <%- colors.light["card-foreground"] %>;

  --popover: <%- colors.light["popover"] %>;
  --popover-foreground: <%- colors.light["popover-foreground"] %>;

  --primary: <%- colors.light["primary"] %>;
  --primary-foreground: <%- colors.light["primary-foreground"] %>;

  --secondary: <%- colors.light["secondary"] %>;
  --secondary-foreground: <%- colors.light["secondary-foreground"] %>;

  --muted: <%- colors.light["muted"] %>;
  --muted-foreground: <%- colors.light["muted-foreground"] %>;

  --accent: <%- colors.light["accent"] %>;
  --accent-foreground: <%- colors.light["accent-foreground"] %>;

  --destructive: <%- colors.light["destructive"] %>;
  --destructive-foreground: <%- colors.light["destructive-foreground"] %>;

  --border: <%- colors.light["border"] %>;
  --input: <%- colors.light["input"] %>;
  --ring: <%- colors.light["ring"] %>;

  --radius: 0.5rem;
}

[data-kb-theme="dark"] {
  --background: <%- colors.dark["background"] %>;
  --foreground: <%- colors.dark["foreground"] %>;

  --card: <%- colors.dark["card"] %>;
  --card-foreground: <%- colors.dark["card-foreground"] %>;

  --popover: <%- colors.dark["popover"] %>;
  --popover-foreground: <%- colors.dark["popover-foreground"] %>;

  --primary: <%- colors.dark["primary"] %>;
  --primary-foreground: <%- colors.dark["primary-foreground"] %>;

  --secondary: <%- colors.dark["secondary"] %>;
  --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;

  --muted: <%- colors.dark["muted"] %>;
  --muted-foreground: <%- colors.dark["muted-foreground"] %>;

  --accent: <%- colors.dark["accent"] %>;
  --accent-foreground: <%- colors.dark["accent-foreground"] %>;

  --destructive: <%- colors.dark["destructive"] %>;
  --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;

  --border: <%- colors.dark["border"] %>;
  --input: <%- colors.dark["input"] %>;
  --ring: <%- colors.dark["ring"] %>;
}


* {
  @apply border-border;
}
body {
  @apply bg-background text-foreground;
}`;

for (const baseColor of ["slate", "gray", "zinc", "neutral", "stone"]) {
  const base: Record<string, any> = {
    inlineColors: {},
    cssVars: {}
  };
  for (const [mode, values] of Object.entries(colorMapping)) {
    base.inlineColors[mode] = {};
    base.cssVars[mode] = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "string") {
        const resolvedColor = value.replace(/{{base}}-/g, `${baseColor}-`);
        base.inlineColors[mode][key] = resolvedColor;

        const [resolvedBase, scale] = resolvedColor.split("-");
        const color = scale
          ? colorsData[resolvedBase].find((item: any) => item.scale === Number.parseInt(scale))
          : colorsData[resolvedBase];
        if (color) {
          base.cssVars[mode][key] = color.hslChannel;
        }
      }
    }
  }

  for (const framework of frameworks) {
    const frameworkColorPath = join(REGISTRY_PATH, "colors", framework.name);
    if (!fs.existsSync(frameworkColorPath)) {
      fs.mkdirSync(frameworkColorPath, { recursive: true });
    }
    // Build css vars.
    if (framework.name === "unocss") {
      base.inlineColorsTemplate = undefined;
      base.cssVarsTemplate = template(UNO_BASE_STYLES_WITH_VARIABLES)({
        colors: base.cssVars
      });
    } else {
      base.inlineColorsTemplate = template(TAILWIND_BASE_STYLES)({});
      base.cssVarsTemplate = template(TAILWIND_BASE_STYLES_WITH_VARIABLES)({
        colors: base.cssVars
      });
    }

    fs.writeFileSync(
      join(REGISTRY_PATH, `colors/${framework.name}/${baseColor}.json`),
      JSON.stringify(base, null, 2),
      "utf8"
    );
  }
}

console.log("✅ Done!");
