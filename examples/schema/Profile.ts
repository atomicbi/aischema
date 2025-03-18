import { boolean, InferType, number, object, string } from 'yup'

export const ProfileSchema = object({
  entityUrn: string().required(),
  firstName: string().required(),
  lastName: string().required(),
  objectUrn: string().required(),
  numOfConnections: number().required(),
  numOfSharedConnections: number().optional(),
  headline: string().optional(),
  summary: string().optional(),
  pendingInvitation: boolean().required(),
  inmailRestriction: string().oneOf(['NO_RESTRICTION', 'DECLINE', 'DISABLED', 'UNSUBSCRIBE']).required(),
  degree: number().required(),
  pronoun: string().optional(),
  memberBadges: object({
    premium: boolean().required(),
    openLink: boolean().required(),
    jobSeeker: boolean().required()
  }).required(),
  flagshipProfileUrl: string().required(),
  location: string().optional(),
  latestTouchPointActivity: object({
    activityType: string().required(),
    performedAt: number().required()
  }).optional()
}).noUnknown().strict(true)

export type Profile = InferType<typeof ProfileSchema>
