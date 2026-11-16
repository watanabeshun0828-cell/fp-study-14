export const grades = ['3', '2', '1'] as const
export type Grade = typeof grades[number]
export const gradeLabel = (grade: Grade) => `FP${grade}級`
