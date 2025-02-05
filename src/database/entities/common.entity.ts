import {
  Column,
  CreateDateColumn,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CommonEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  create_by?: string;

  @Column()
  edit_by?: string;

  @Column({ type: 'int', default: 1, generated: 'increment' })
  version?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
