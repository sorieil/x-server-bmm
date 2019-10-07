import { Base } from './MysqlBase';
import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Code } from './MysqlCode';

@Entity()
export class BusinessCategory extends Base {
  @Column('varchar')
  name: string;
  @ManyToOne(type => Code, code => code)
  @JoinColumn()
  code: Code;
}
