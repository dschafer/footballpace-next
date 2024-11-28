import { ImageResponse } from "next/og";

async function loadInterFont(weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
  const css = await (await fetch(url)).text();
  const resource = /src: url\((.+)\) format\('(opentype|truetype)'\)/.exec(css);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export function imageMetadata(subtitle?: string) {
  return [
    {
      contentType: "image/png",
      size: { width: 1200, height: 630 },
      id: "id",
      alt: subtitle ? `${subtitle} | Football Pace` : subtitle,
    },
  ];
}

const titleWeight = 600;
const subtitleWeight = 400;

export async function genOpenGraphImage(
  subtitle?: string,
): Promise<ImageResponse> {
  const inter = await loadInterFont(subtitleWeight);
  const interBold = await loadInterFont(titleWeight);
  let subComponent = null;
  if (subtitle) {
    subComponent = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          height: 64,
          paddingTop: 50,
        }}
      >
        {subtitle}
      </div>
    );
  }
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="128"
      height="128"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M3 9h3v6h-3z" />
      <path d="M18 9h3v6h-3z" />
      <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
      <path d="M12 5l0 14" />
    </svg>
  );
  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(to right, #ccb3d0, #f7f7f7, #64a277)`,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontWeight: subtitleWeight,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 128,
            height: 128,
            borderBottomColor: "black",
            borderBottomWidth: subComponent ? "10px" : 0,
            fontWeight: titleWeight,
          }}
        >
          Football Pace <span style={{ paddingLeft: "1rem" }}></span>
          {icon}
        </div>
        {subComponent}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: inter,
          weight: subtitleWeight,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: titleWeight,
          style: "normal",
        },
      ],
      emoji: "openmoji",
    },
  );
}
