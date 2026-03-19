import type { APIRoute } from 'astro';
import { strapiPostAuth } from '../../lib/strapi';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('jwt')?.value;
  if (!jwt) return new Response('Unauthorized', { status: 401 });

  const form = await request.formData();
  const eventId = form.get('eventId') as string;
  const coachId = form.get('coachId') as string;
  const disciplineId = form.get('disciplineId') as string;
  const studentIds = form.getAll('studentIds') as string[];

  if (!eventId || studentIds.length === 0) {
    return new Response('Missing required fields', { status: 400 });
  }

  // create a CheckIn for each selected student
  await Promise.all(studentIds.map(studentDocumentId =>
    strapiPostAuth('/api/check-ins', {
      data: {
        state: 'pending',
        event: eventId,
        coach: coachId,
        student: studentDocumentId,
      }
    }, jwt)
  ));

  return Response.redirect(
    new URL(`/dashboard?discipline=${disciplineId}&coach=${coachId}`, request.url),
    303
  );
};
