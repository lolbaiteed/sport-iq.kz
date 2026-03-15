// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const jwt = context.cookies.get('jwt')?.value;
  const role = context.cookies.get('user_role')?.value;
  const path = context.url.pathname;

  if (path.startsWith('/coach')) {
    if (!jwt) return context.redirect('/login');
    if (role !== 'authenticated') return context.redirect('/login');
  }

  if (path.startsWith('/moderator')) {
    if (!jwt) return context.redirect('/login');
    if (role !== 'moderator' && role !== 'administrator') {
      return context.redirect('/login');
    }
  }

  return next();
});
