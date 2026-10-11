import type { APIRoute } from "astro";
import { handleLegacyEndpoint } from "../../legacy-endpoints.ts";

const dispatch: APIRoute = ({ request }) => handleLegacyEndpoint(request);

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
export const OPTIONS = dispatch;
