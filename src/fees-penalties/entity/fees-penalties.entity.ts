import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';


@Entity('fees_penalties')
export class FeesPenalties {
  @PrimaryGeneratedColumn('uuid', { name: 'feesPenaltyUuid' })
  feesPenaltyUuid: string;

  @Column({ name: 'category', type: 'varchar' })
  category: string;

  @Column({ name: 'borrowerUuid', type: 'uuid' })
  borrowerUuid: string;

  @Column({ name: 'bookCopyUuid', type: 'uuid' })
  bookCopyUuid: string;

  @Column({ name: 'paymentMethod', type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ name: 'daysDelayed', type: 'int', default: 1 })
  daysDelayed: string;

  @Column({ name: 'penaltyAmount', type: 'varchar', default: 0 })
  penaltyAmount: string;

  @Column({ name: 'paidAmount', type: 'varchar', default: 0 })
  paidAmount: string;

  @Column({ name: 'bookLogData', type: 'date' })
  bookLogData: Record<string, any>;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({
    name: 'receiptNumber',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  receiptNumber:string;

  @Column({ name: 'paidAt', nullable: true })
  paidAt: string;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  
  @Column({ name: 'instituteUuid', type:"uuid" })
  instituteUuid: string;

  @Column({ name: 'instituteName', type: 'text' })
  instituteName: string;
}
