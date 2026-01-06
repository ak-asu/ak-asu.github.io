/**
 * Shared utility functions for date and period formatting
 */

/**
 * Format a date period from start to end
 * Works with both string dates (ISO format) and year numbers
 */
export function formatPeriod(
  start: string | number,
  end: string | number,
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Handle year-based format (EducationSection)
  if (typeof start === "number" && typeof end === "number") {
    const currentYear = new Date().getFullYear();
    const isOngoing = end >= currentYear;
    return `${months[7]} ${start} - ${isOngoing ? "Present" : `${months[4]} ${end}`}`;
  }

  // Handle date string format (WorkSection)
  if (typeof start === "string" && typeof end === "string") {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.toLocaleString("en-US", { month: "short" });
    const startYear = startDate.getFullYear();
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const endYear = endDate.getFullYear();

    const isPresent = new Date(end) > new Date();
    return `${startMonth} ${startYear} - ${isPresent ? "Present" : `${endMonth} ${endYear}`}`;
  }

  return "";
}

/**
 * Check if a date represents a currently active period
 */
export function isCurrentlyActive(endDate: string | number): boolean {
  if (typeof endDate === "number") {
    return endDate >= new Date().getFullYear();
  }
  return new Date(endDate) > new Date();
}
