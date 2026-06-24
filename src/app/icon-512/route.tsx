import { brandIcon } from "@/lib/brandIcon";

export const runtime = "edge";

export function GET() {
  return brandIcon(512);
}
