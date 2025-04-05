import z from "zod"

export const getInstituteUUID = z.string().uuid().array()

export type TGetInstituteUuidDTO = z.infer<typeof getInstituteUUID>;