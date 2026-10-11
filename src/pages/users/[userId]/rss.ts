import type { APIRoute } from "astro";
import { handleLegacyEndpoint } from "../../../legacy-endpoints.ts";

export const GET: APIRoute = ({ request }) => handleLegacyEndpoint(request);
