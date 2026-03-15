import qs from 'qs';

const STRAPI_URL = import.meta.env.STRAPI_URL as string;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN as string;

export interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  formats: {
    thmbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiImageFormat {
  url: string;
  width: string;
  height: string;
  size: number;
}

export interface StrapiVid {
  id: string;
  documentId: string;
  url: string;
}

export interface Discipline {
  id: number;
  documentId: string;
  name: string;
}

export interface Student {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatar?: StrapiImage;
  discipline?: Discipline;
}

export interface Coach {
  id: number;
  documentId: string;
  fristName: string;
  lastName: string
  middleName?: string;
  Desc?: string;
  avatar?: StrapiImage;
  discipline?: Discipline;
  students?: Student[];
  locale: string;
} 

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface Event {
  id: number;
  documentId: string;
  title: string;
  date?: string;
  location?: string;
  status: 'draft' | 'active' | 'completed';
  coaches?: Coach[];
}

export interface CheckIn {
  id: number;
  documentId: string;
  status: 'pending' | 'approved' | 'rejected';
  latitude?: number;
  longitude?: number;
  selfie?: StrapiImage;
  studentPhotos?: StrapiImage[];
  coach?: Coach;
  event?: Event;
  createdAt: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface LangSwitch {
  label: string;
  url: string;
}

export interface Global {
  Title?: string;
  PhoneNumber?: string;
  loginBtn?: string;
  LangSwitch?: LangSwitch[];
  FooterTitle: string;
  locale: string;
  FooterAddr: string;
  LogoHeader: StrapiImage[];
  FooterLogos: StrapiImage[];
}

export interface Login {
  username: string;
  password: string;
  loginBtn: string;
  title: string;
  BackToSite: string;
  locale: string;
  LangSwitch: LangSwitch[];
} 

export interface Home {
  HeroTitle: string;
  HeroDesc: string;
  Achivments: string;
  Medals: string;
  Sportsmens: string;
  Scolarship: string;
  OurPride: string;
  BtnCoach:string;
  BtnAth: string;
  locale: string;
  BackVid?: StrapiImage; 
}

//Public fetch
export async function strapiGet<T>(endpoint: string): Promise<StrapiResponse<T>> {
  try {
    const res = await fetch(`${STRAPI_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      }
    });
    if (!res.ok) throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`[strapi] GET ${endpoint} failed: `, err);
    return { data: [] as T, meta: {} };
  }
}

//Authenticated fetch
export async function strapiGetAuth<T>(endpoint: string, jwt: string): Promise<StrapiResponse<T>> {
  try {
    const res = await fetch(`${STRAPI_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!res.ok) throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`[strapi] AUTH GET ${endpoint} failed:`, err);
    return { data: [] as T, meta: {} };
  }
}

//Authenticated POST/PUT/DELETE
export async function strapiAuthMutate<T>(endpoint: string, jwt: string, method: 'POST'|'PUT'|'DELETE' = 'POST', body?: object): Promise<StrapiResponse<T>> {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return await res.json();
}

// Image helper
export function getImageUrl(image?: StrapiImage | null, format: keyof StrapiImage['formats'] = 'medium'): string | null {
  if (!image) return null;
  const url = image.formats?.[format]?.url ?? image.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

//Vid helper
export function getVidUrl(vid?: StrapiVid | null): string | null {
  if (!vid) return null;
  const url = vid?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

// Auth
export async function loginUser(identifier: string, password: string): Promise<{ jwt: string; user: StrapiUser }> {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Invalid credentials');
  return data;
}

export async function getMe(jwt: string): Promise<StrapiUser> {
  const res = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return await res.json();
}

// Coaches
export async function getCoaches(locale = 'en'): Promise<Coach[]> {
  const query = qs.stringify({
    populate: {
      avatar: { fields: ['url', 'formats'] },
      discipline: { fields: ['name'] },
    },
    locale,
  }, { encodeValuesOnly: true });

  const res = await strapiGet<Coach[]>(`/api/coaches?${query}`);
  return res.data ?? [];
}

export async function getMyCoachProfile(jwt: string, locale = 'en'): Promise<Coach | null> {
  const user = await getMe(jwt);
  console.log(jwt);

  const query = qs.stringify({
    filters: {
      users_permissions_user: { id: { $eq: user.id } }
    },
    populate: {
      avatar: { fields: ['url', 'formats'] },
      discipline: { fields: ['name'] },
      students: { fields: ['firstName', 'lastName', 'middleName'] },
    },
    locale,
  }, { encodeValuesOnly: true });

  console.log(query)

  const res = await strapiGetAuth<Coach[]>(`/api/coaches?${query}`, jwt);
  return res.data?.[0] ?? null;
}

// Global
export async function getGlobal(locale = 'en'): Promise<Global | null> {
  const query = qs.stringify({
    populate: { 
      LangSwitch: true,
      LogoHeader: { fields: ['url', 'formats'] },
      FooterLogos: { fields: ['url', 'formats'] },
    },
    locale,
  }, { encodeValuesOnly: true});
  const res = await strapiGet<Global>(`/api/header?${query}`);
  return res.data ?? null;
}

export async function getEvents(jwt: string): Promise<Event[]> {
  const query = qs.stringify({
    populate: { coaches: { fields: ['firstName', 'lastName'] } },
    sort: 'date:desc',
  }, { encodeValuesOnly: true });
  const res = await strapiGetAuth<Event[]>(`/api/events?${query}`, jwt);
  return res.data ?? [];
}

export async function getEventById(jwt: string, documentId: string): Promise<Event | null> {
  const query = qs.stringify({
    populate: {
      coaches: {
        populate: { discipline: { fields: ['name'] } }
      }
    },
  }, {encodeValuesOnly: true });
  const res = await strapiGetAuth<Event>(`/api/events/${documentId}?${query}`, jwt);
  return res.data ?? null;
}

//Check-Ins
export async function getCheckins(jwt: string, eventDocumentId: string): Promise<CheckIn[]> {
  const query = qs.stringify({
    filters: eventDocumentId ? { event: { documentId: {$eq: eventDocumentId } } } : undefined,
    populate: {
      coach: { fields: ['firstName', 'lastName'] },
      event: { fields: ['title'] },
      selfie: { fields: ['url'] },
      studentPhotos: { fields: ['url'] },
    },
    sort: 'createdAt:desc',
  }, { encodeValuesOnly: true });
  const res = await strapiGetAuth<CheckIn[]>(`/api/check-ins?${query}`, jwt);
  return res.data ?? [];
}

export async function getHome(locale = 'en'): Promise<Home> {
  const query = qs.stringify({
    locale,
    fields: [
      'HeroTitle',
      'HeroDesc',
      'Achivments',
      'Medals',
      'Sportsmens',
      'Scolarship',
      'OurPride',
      'BtnCoach',
      'BtnAth',
    ],
    populate: {
      BackVid: {
        fields: ['url', 'mime'] 
      },
    },
  }, { encodeValuesOnly: true});
  const res = await strapiGet<Home[]>(`/api/homes?${query}`);
  return res.data?.[0] ?? null;
}

export async function getLogin(locale = 'en'): Promise<Login> {
  const query = qs.stringify({
    locale,
    populate: {
      fields: ['username','password', 'loginBtn', 'BackToSite', 'title']
    }
  });
  const res = await strapiGet<Login>(`/api/login?${query}`);
  return res.data ?? null;
}
