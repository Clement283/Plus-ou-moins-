// Lookups on a course's recognised errors, shared by question building and checking.
import type { ErrorFamily } from '../events';
import type { CourseDef, ErrorDef } from './types';

export const errorOf = (course: CourseDef, id: string | null | undefined): ErrorDef | undefined =>
  course.errors.find((e) => e.id === id);

/** The sign error of the course (marked 🔴 in doc 06): its first error of the « signe » family. */
export const signError = (course: CourseDef): ErrorDef | undefined => course.errors.find((e) => e.family === 'signe');

/** Family of a recorded error: the course's own, otherwise « autre » (relecture, ordre-etapes, autre). */
export const familyOf = (course: CourseDef, errorType: string): ErrorFamily => errorOf(course, errorType)?.family ?? 'autre';
