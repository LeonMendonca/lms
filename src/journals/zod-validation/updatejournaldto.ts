// import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

// export class UpdateJournalTitleDTO {
//     @IsString()
//     @IsOptional()
//     journalTitle?: string;

//     @IsString()
//     @IsOptional()
//     editorName?: string;

//     @IsString()
//     @IsOptional()
//     nameOfPublisher?: string;

//     @IsDateString()
//     @IsOptional()
//     subscriptionStartDate: string;

//     @IsDateString()
//     @IsOptional()
//     subscriptionEndDate: string;

//     @IsString()
//     @IsOptional()
//     placeOfPublication?: string;

//     @IsString()
//     @IsOptional()
//     issn?: string;

//     @IsString()
//     @IsOptional()
//     volumeNumber: string;

//     @IsString()
//     @IsOptional()
//     classificationNumber: string;

//     @IsInt()
//     @IsOptional()
//     totalCount?: number;

//     @IsInt()
//     @IsOptional()
//     availableCount?: number;

//     @IsOptional()
//     remarks?: string[];

//     @IsOptional()
//     titleImages?: string[];

//     @IsOptional()
//     titleAdditionalFields?: any;

//     @IsOptional()
//     titleDescription?: string;
// }

import { z } from "zod"

export const updateJournalSchema = z.object({
    journal_uuid: z.string().optional(),
    journal_title: z.string().min(10).optional(),
    editor_name: z.string().min(10).optional(),
    place_of_publication: z.string().optional(),
    issn: z.string().optional(),
    total_count: z.string().transform((val) => Number(val)).optional(),
    available_count: z.string().transform((val) => Number(val)).optional(),
    title_images: z.array(z.string()).optional(),
    title_additional_fields: z.record(z.any()).optional(),
    title_description: z.string().optional()
})


export type TUpdateJournalTitleDTO = z.infer<typeof updateJournalSchema>