import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

export const alt = "Fiaxe | Voice AI Calling Agents That Sound Human";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const logoSrc = `data:image/jpeg;base64,${await readFile(
    join(process.cwd(), "assets/fiaxe-logo.jpeg"),
    "base64",
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0a0c",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <img src={logoSrc} width={220} height={220} />
        <div
          style={{
            color: "#f4f1ec",
            fontSize: "34px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Fiaxe: Voice AI Calling Agents That Sound Human
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}