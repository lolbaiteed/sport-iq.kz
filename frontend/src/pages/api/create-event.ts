import type { APIRoute } from "astro";
import { strapiPostAuth } from '../../lib/strapi';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('jwt')?.value;
  if (!jwt) return new Response('Unauthorized', {status: 401});

  const form = await request.formData();
  const coachId = form.get('coachId');
  const title = form.get('title');
  const date = from.get('date');
  const location = form.get('location');

  if (!title || !coachId) {
    return new Response('Missing required fields', {status: 400});
  }

  const res = await strapiPostAuth('/api/events', {
    data: {
      title,
      date: date || null,
      location: location || null,
      status: 'draft',
      coaches: [Number(coachId)],
    }
  }, jwt);

  if (!res.data) {
    return new Response('Failed to create event', {status: 500});
  } 

  const disciplineId = form.get('disciplineId');
  return Response.redirect(
    new URL(`/dashboard?dicipline=${disciplineId}&coach=${coachId}`, request.url),
    303
  );
};
