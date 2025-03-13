import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEnumValues<T extends Record<string, unknown>>(e: T): T[keyof T][] {
  return Object.values(e) as T[keyof T][]
}
