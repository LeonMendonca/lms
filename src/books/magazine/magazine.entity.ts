import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';
@Entity('magazine_tables')
export class Magazine {
  @PrimaryGeneratedColumn('uuid', { name: 'magazine_id' })
  magazineId: string;

  @Column({ name: 'journal_name', type: 'varchar', length: 255 })
  journalName: string;
  @Column({ name: 'publisher_name', type: 'varchar', length: 255 })
  publisherName: string;
  @Column({ name: 'place_publisher', type: 'varchar', length: 255 })
  placePublisher: string;
  @Column({ name: 'editor_name', type: 'varchar', length: 255 })
  editorName: string;

  //subscription
  @Column({ name: 'sunscription_price', type: 'varchar', length: 255 })
  subscription_Price: string;
  @Column({ name: 'start_date', type: 'varchar', length: 255 })
  startDate: string;
  @Column({ name: 'end_date', type: 'varchar', length: 255 })
  endDate: string;

  @Column({ name: 'volume_no', type: 'varchar', length: 255 })
  volumeNo: string;
  @Column({ name: 'issue_no', type: 'varchar', length: 255 })
  issueNo: string;

  @Column({ name: 'frequency', type: 'varchar', length: 255 })
  frequency: string;
  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  item_Type: string;

  @Column({ name: 'issn', type: 'varchar', length: 255 })
  issn: string;
  @Column({ name: 'clarification_number', type: 'varchar', length: 255 })
  clarificationNumber: string;
  @Column({ name: 'vendor_name', type: 'varchar', length: 255 })
  vendorName: string;
  @Column({ name: 'library_name', type: 'varchar', length: 255 })
  libraryName: string;
}
