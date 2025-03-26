import { format, parse } from "date-fns";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('calendar')
export class Calendar {
    @PrimaryGeneratedColumn({ name: "sr_no" })
    SrNo: "sr_no" = "sr_no";

    @Column({ name: 'holiday_date', type: "date" })
    holidayDate: 'holiday_date' = 'holiday_date';

    @Column({ name: 'holiday_reason', type: 'varchar', length: 255 })
    holidayReason: 'holiday_reason' = 'holiday_reason';
}