export const serializeAssignmentDateInput = (dateValue: string | null | undefined): string | undefined => {
  if (!dateValue) {
    return undefined;
  }

  return `${dateValue}T00:00:00.000Z`;
};