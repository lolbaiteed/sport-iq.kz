/**
 * Strapi API Helper
 * Centralizes all API calls to your Strapi backend.
 * Set STRAPI_URL and STRAPI_TOKEN in your .env file.
 */

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
};

import qs from 'qs';

/**
 * Generic fetch wrapper for Strapi
 * @param {string} endpoint - e.g. '/api/articles?populate=*'
 */
export async function strapiGetPub(endpoint) {
  try {
    const res = await fetch(`${STRAPI_URL}${endpoint}`, { headers });
    if (!res.ok) throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`[strapi] Failed to fetch ${endpoint}:`, err.message);
    return { data: [], meta: {} };
  }
}

export async function strapiGetAuth(endpoint, jwt) {
  try {
    const res = await fetch(`${STRAPI_URL}${endpoint}`, { 
      headers: {'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      }
    });
    if (!res.ok) throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`[strapi] Failed to fetch ${endpoint}:`, err.message);
    return { data: [], meta: {} };
  }
}

/** Fetch all articles (with cover image populated) */
export async function getArticles() {
  const res = await strapiGetPub('/api/articles?populate=cover&sort=publishedAt:desc');
  return res.data ?? [];
}

/** Fetch a single article by slug */
export async function getArticleBySlug(slug) {
  const res = await strapiGetPub(`/api/articles?filters[slug][$eq]=${slug}&populate=*`);
  return res.data?.[0] ?? null;
}

/** Fetch all pages */
export async function getPages() {
  const res = await strapiGetPub('/api/pages?populate=*');
  return res.data ?? [];
}

/** Fetch global site settings (if you have a "Global" single type in Strapi) */
export async function getGlobal(locale = 'en') {
  const res = await strapiGetPub(`/api/header?populate=*&locale=${locale}`);
  return res.data ?? null;
}

/** Fetch home data */
export async function getHome(locale = 'en') {
  const res = await strapiGetPub(`/api/homes?populate=*&locale=${locale}`);
  return res.data?.[0] ?? null;
}

/** Helper: get full image URL from a Strapi image object */
export function getStrapiImageUrl(image) {
  if (!image?.data?.attributes?.url) return null;
  const url = image.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

export async function getCoaches(locale ='en') {
  const res = await strapiGetPub(`/api/coaches?populate=*&locale=${locale}`);
  return res.data ?? null;
}

export async function getCoachProfile(jwt) {
  const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  const user = await userRes.json();

  const query = qs.stringify({
    filters: {
      users_permissions_user: {
        id: { $eq: user.id }
      }
    },
    populate: {
      avatar: {
        fields: ['url', 'formats']
      },
      discipline: {
        fields: ['name']
      },
      students: {
        fields: ['firstName', 'lastName', 'middleName']
      }
    },
    locale: 'en'
  }, {encodeValuesOnly: true});

  const res = await strapiGetAuth(`/api/coaches?${query}`, jwt);

  const { data } = await res.json();
  return data?.[0] ?? null;
}

export async function getLogin(locale ='en') {
  const query = qs.stringify({
    fields: [
      'loginBtn',
      'username',
      'password',
      'title',
      'BackToSite'
    ],
    populate: {
      langswitch: true,
    },
    locale, 
  }, {encodeValuesOnly: true});
  const res = await strapiGetPub(`/api/login?${query}`);
  return res.data ?? null
}
