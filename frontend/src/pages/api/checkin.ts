import type { APIRoute } from 'astro';
import { getMyCoachProfile, strapiAuthMutate } from '../../lib/strapi';

const STRAPI_URL = import.meta.env.STRAPI_URL as string;

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('jwt')?.value;
  if (!jwt) return new Response('Unauthorized', { status: 401 });

  const coach = await getMyCoachProfile(jwt);
  if (!coach) return new Response('Coach not found', { status: 404 });

  const form = await request.formData();
  const eventDocumentId = form.get('eventDocumentId') as string;
  const latitude = parseFloat(form.get('latitude') as string);
  const longitude = parseFloat(form.get('longitude') as string);
  const selfieFile = form.get('selfie') as File;
  const studentPhotoFiles = form.getAll('studentPhotos') as File[];

  if (!eventDocumentId || !selfieFile) {
    return new Response('Missing required fields', { status: 400 });
  }

  // 1. Upload selfie to Strapi media library
  const selfieForm = new FormData();
  selfieForm.append('files', selfieFile, 'selfie.jpg');

  const selfieUploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: selfieForm,
  });

  if (!selfieUploadRes.ok) {
    return new Response('Failed to upload selfie', { status: 500 });
  }

  const [uploadedSelfie] = await selfieUploadRes.json();

  // 2. Upload student photos if any
  let uploadedStudentPhotoIds: number[] = [];

  if (studentPhotoFiles.length > 0) {
    const studentForm = new FormData();
    studentPhotoFiles.forEach((file, i) => {
      studentForm.append('files', file, `student-${i}.jpg`);
    });

    const studentUploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: studentForm,
    });

    if (studentUploadRes.ok) {
      const uploaded = await studentUploadRes.json();
      uploadedStudentPhotoIds = uploaded.map((f: { id: number }) => f.id);
    }
  }

  // 3. Create CheckIn entry
  const checkin = await strapiAuthMutate(
    '/api/check-ins',
    jwt,
    'POST',
    {
      data: {
        status: 'pending',
        latitude,
        longitude,
        event: eventDocumentId,
        coach: coach.documentId,
        selfie: uploadedSelfie.id,
        ...(uploadedStudentPhotoIds.length > 0 ? { studentPhotos: uploadedStudentPhotoIds } : {}),
      }
    }
  );

  if (!checkin.data) {
    return new Response('Failed to create check-in', { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
