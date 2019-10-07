/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import 'reflect-metadata';
import {
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IoTJobsDataPlane } from 'aws-sdk';
export type StatusTypeRole = 'no' | 'yes';
export class Base {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({
  //     type: 'timestamp',
  //     nullable: false,
  //     readonly: true,
  //     transformer: {
  //         to: (value?: Date) => (!value ? value : value.toISOString()),
  //         from: (value?: number) => (!value ? value : new Date()),
  //     },
  // })
  @CreateDateColumn()
  createdAt: Date;

  // @Column({
  //     type: 'timestamp',
  //     nullable: true,
  //     transformer: {
  //         to: (value?: Date) => (!value ? value : value.toISOString()),
  //         from: (value?: number) => (!value ? value : new Date()),
  //     },
  // })
  @UpdateDateColumn()
  updatedAt?: Date;

  // @BeforeInsert()
  // updateDateCreation() {
  //     this.createdAt = new Date();
  // }

  // @BeforeUpdate()
  // updateDateUpdate() {
  //     this.updatedAt = new Date();
  // }
}
