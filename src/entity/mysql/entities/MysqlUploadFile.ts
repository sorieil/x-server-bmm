import { Base } from './MysqlBase';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Admin } from './MysqlAdmin';

@Entity()
export class UploadFile extends Base {
  @Column('varchar')
  fileName: string;

  @Column('varchar')
  originalFileName: string;
  @Column('int')
  fileSize: number;
  @Column('int')
  width: number;
  @Column('int')
  height: number;

  @Column('varchar')
  extensionType: string;

  @ManyToOne(type => Admin, admin => admin.uploadFiles, { onDelete: 'CASCADE' })
  @JoinColumn()
  admin: Admin;
}
