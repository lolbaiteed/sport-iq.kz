import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

const STRAPI_URL = import.meta.env.STRAPI_URL;

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      identifier: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
    }),
    handler: async ({ identifier, password }, context) => {
      // Step 1 — Login to Strapi
      const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new ActionError({code: 'UNAUTHORIZED', message: data.error?.message || 'Invalid credentials'});
      }

      if (!data.jwt) {
        throw new ActionError({code : 'UNAUTHORIZED', message: data.error?.message || 'Invalid credentials'});
      }

      // Step 2 — Get user role
      const userRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
        headers: { Authorization: `Bearer ${data.jwt}` },
      });
      const user = await userRes.json();
      const role = user.role?.name?.toLowerCase();

      // Step 3 — Check role is allowed
      if (role !== 'moderator' && role !== 'administrator' && role !== 'authenticated') {
        throw new Error('Access denied.');
      }

      // Step 4 — Set httpOnly cookie
      context.cookies.set('jwt', data.jwt, {
        httpOnly: true,
        secure: import.meta.env.PROD, // only secure in production
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Step 5 — Save role in separate cookie (readable by server only)
      context.cookies.set('user_role', role, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return { role };
    },
  }),

  logout: defineAction({
    handler: async (_, context) => {
      context.cookies.delete('jwt', { path: '/' });
      context.cookies.delete('user_role', { path: '/' });
      return { success: true };
    },
  }),
};
