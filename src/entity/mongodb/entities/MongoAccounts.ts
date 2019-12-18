/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
    Entity,
    ObjectID,
    ObjectIdColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export class EventList {
    @Column('ObjectID')
    eventId: ObjectID | string;
    @Column('string')
    name: string;
    @CreateDateColumn('date')
    joinDt: Date;

    @UpdateDateColumn('date')
    accessDt: Date;
    @Column('string')
    pushToken: string;

    @Column('string')
    mobileType: string;

    @Column('boolean')
    isPushOn: boolean;
    @Column('int', { default: 0 })
    point: number;
    constructor(
        eventId: ObjectID,
        name: string,
        pushToken: string,
        mobileType: string,
        isPushOn: boolean,
        point: number,
    ) {
        this.eventId = eventId;
        this.name = name;
        this.pushToken = pushToken;
        this.mobileType = mobileType;
        this.isPushOn = isPushOn;
        this.point = point;
    }
}

export class Profile {
    @Column('string')
    profileImg: string;

    constructor(profileImg: string) {
        this.profileImg = profileImg;
    }
}

export class Permission {
    @Column('string')
    permissionName: string;

    @Column('boolean')
    isChecked: boolean;

    constructor(permissionName: string, isChecked: boolean) {
        this.permissionName = permissionName;
        this.isChecked = isChecked;
    }
}

@Entity()
export class Accounts {
    @ObjectIdColumn()
    id: ObjectID;

    @Column('array')
    block: string[];

    @Column('array')
    group: string[];

    @CreateDateColumn('date')
    createDt: Date;

    @Column('string')
    phone: string;

    @Column('string')
    password: string;

    @Column('string')
    name: string;

    @Column(type => EventList)
    eventList: EventList[];

    @Column(type => Profile)
    profiles: Profile;

    @Column('string')
    myQRCode: string;

    @Column('boolean')
    isDupPhoneNum: boolean;
    @Column('boolean')
    emailVerified: boolean;
    @Column('boolean')
    isInactive: boolean;
    @Column('boolean')
    isWithdrawal: boolean;
    @Column(type => Permission)
    permission: Permission[];

    @Column('string')
    email: string;
}
