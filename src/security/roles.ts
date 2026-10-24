/** Papéis de acesso internos; a autorização efetiva deve ser aplicada por RLS no banco. */
export const INTERNAL_ROLES = ["diretoria", "supervisao_nacional", "consultor"] as const;
export type InternalRole = (typeof INTERNAL_ROLES)[number];

export type InternalProfile = {
  user_id: string;
  role: InternalRole;
  active: boolean;
};

export type UnitAssignment = {
  unit_id: number;
  consultant_user_id: string;
  assigned_at: string;
  ended_at: string | null;
};

export function mayAccessUnit(
  profile: InternalProfile | null,
  unitId: number,
  assignments: UnitAssignment[],
): boolean {
  if (!profile?.active) return false;
  if (profile.role === "diretoria" || profile.role === "supervisao_nacional") return true;
  return assignments.some(
    (assignment) =>
      assignment.unit_id === unitId &&
      assignment.consultant_user_id === profile.user_id &&
      assignment.ended_at === null,
  );
}
