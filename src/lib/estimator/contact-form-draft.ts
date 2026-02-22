import type { EstimatorFormValues } from "@/lib/validation/estimator-contact";

const STORAGE_KEY = "kolss-estimator-contact-draft";

const DEFAULT_VALUES: EstimatorFormValues = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  country: "",
  comment: "",
  consent: false,
};

function safeParse(raw: string | null): Partial<EstimatorFormValues> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return null;
    const out: Partial<EstimatorFormValues> = {};
    if (typeof parsed.fullName === "string") out.fullName = parsed.fullName;
    if (typeof parsed.phone === "string") out.phone = parsed.phone;
    if (typeof parsed.email === "string") out.email = parsed.email;
    if (typeof parsed.city === "string") out.city = parsed.city;
    if (typeof parsed.country === "string") out.country = parsed.country;
    if (typeof parsed.comment === "string") out.comment = parsed.comment;
    if (typeof parsed.consent === "boolean") out.consent = parsed.consent;
    return out;
  } catch {
    return null;
  }
}

export function getContactFormDraft(): EstimatorFormValues | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const partial = safeParse(raw);
  if (!partial || Object.keys(partial).length === 0) return null;
  return { ...DEFAULT_VALUES, ...partial };
}

export function setContactFormDraft(data: EstimatorFormValues): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearContactFormDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
