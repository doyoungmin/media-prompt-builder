/* 파비콘·홈 화면/PC 설치용 Web App Manifest 계약을 검증한다. */
import { readFileSync } from "node:fs";

let failed = false;
function check(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    failed = true;
  }
}

const pages = [
  { html: "index.html", manifest: "/manifest.webmanifest", id: "/", start: "/" },
  { html: "image/index.html", manifest: "/manifests/image.webmanifest", id: "/image/", start: "/image/" },
  { html: "t2v/index.html", manifest: "/manifests/t2v.webmanifest", id: "/t2v/", start: "/t2v/" },
  { html: "i2v/index.html", manifest: "/manifests/i2v.webmanifest", id: "/i2v/", start: "/i2v/" },
];

for (const page of pages) {
  const html = readFileSync(page.html, "utf8");
  check(html.includes('href="/logo-pb.svg"'), `${page.html}: 공통 SVG 파비콘 없음`);
  check(html.includes('href="/app-icons/favicon-32.png"'), `${page.html}: PNG 파비콘 없음`);
  check(html.includes('href="/app-icons/apple-touch-icon.png"'), `${page.html}: Apple 홈 화면 아이콘 없음`);
  check(html.includes(`rel="manifest" href="${page.manifest}"`), `${page.html}: manifest 링크가 다름`);
  check(html.includes('name="theme-color" content="#06070A"'), `${page.html}: theme-color 없음`);
  check(html.includes('name="apple-mobile-web-app-capable" content="yes"'), `${page.html}: iOS standalone 설정 없음`);

  const manifest = JSON.parse(readFileSync(`public${page.manifest}`, "utf8"));
  check(manifest.id === page.id, `${page.manifest}: id가 다름`);
  check(manifest.start_url === page.start, `${page.manifest}: start_url이 다름`);
  check(manifest.scope === "/", `${page.manifest}: scope가 다름`);
  check(manifest.display === "standalone", `${page.manifest}: standalone이 아님`);
  check(manifest.theme_color === "#06070A", `${page.manifest}: theme_color가 다름`);
  const icon = (size, purpose) => manifest.icons?.some(item =>
    item.sizes === `${size}x${size}` && item.type === "image/png" && item.purpose === purpose);
  check(icon(192, "any"), `${page.manifest}: 192px 일반 아이콘 없음`);
  check(icon(512, "any"), `${page.manifest}: 512px 일반 아이콘 없음`);
  check(icon(512, "maskable"), `${page.manifest}: 512px maskable 아이콘 없음`);
}

function pngInfo(path) {
  const buf = readFileSync(path);
  check(buf.subarray(1, 4).toString("ascii") === "PNG", `${path}: PNG 형식이 아님`);
  return [buf.readUInt32BE(16), buf.readUInt32BE(20), buf[25]];
}
for (const [path, size, opaque] of [
  ["public/app-icons/favicon-32.png", 32, false],
  ["public/app-icons/apple-touch-icon.png", 180, true],
  ["public/app-icons/app-icon-192.png", 192, false],
  ["public/app-icons/app-icon-512.png", 512, false],
  ["public/app-icons/app-icon-maskable-512.png", 512, true],
]) {
  const [width, height, colorType] = pngInfo(path);
  check(width === size && height === size, `${path}: ${size}x${size}가 아님 (${width}x${height})`);
  if (opaque) check(![4, 6].includes(colorType), `${path}: 투명 채널이 남아 있음`);
}

const svg = readFileSync("public/logo-pb.svg", "utf8").toLowerCase();
for (const token of ["<script", "onload=", "onclick=", "javascript:", "<foreignobject", 'href="http', 'xlink:href="http']) {
  check(!svg.includes(token), `logo-pb.svg: 위험한 SVG 토큰 ${token}`);
}

if (failed) process.exit(1);
console.log("PWA 아이콘·manifest 검수 통과");
