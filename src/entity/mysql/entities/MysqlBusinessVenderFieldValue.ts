import { BusinessVenderFieldChildNode } from './MysqlBusinessVenderFieldChildNode';
import { BusinessVenderField } from './MysqlBusinessVenderField';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { BusinessVender } from './MysqlBusinessVender';
import { Code } from './MysqlCode';
import UserManager from './MysqlUserManager';

@Entity()
export class BusinessVenderFieldValue extends Base {
    @ManyToOne(type => BusinessVender, businessVender => businessVender.businessVenderFieldValues, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    businessVender: BusinessVender;

    /**
     * 필드의 타입을 조인으로 가져오고 있는데 이 방법이 부적절하다면, 이 필드를 활용할 수도 있다.
     * 하지만 데이터 마이그레이션 작업이 필요 하다.
     * @type {Code}
     * @memberof BusinessVenderFieldValue
     */
    @ManyToOne(type => Code, code => code.businessVenderFieldValues)
    code: Code;

    @ManyToOne(type => BusinessVenderField, businessVenderField => businessVenderField.businessVenderFieldValues, {
        nullable: false,
    })
    businessVenderField: BusinessVenderField;

    @Column('varchar', { nullable: true })
    text: string;

    @Column('text', { nullable: true })
    textarea: string;

    @ManyToOne(
        type => BusinessVenderFieldChildNode,
        businessVenderFieldChildNode => businessVenderFieldChildNode.businessVenderFieldValues,
        { nullable: true },
    )
    idx: BusinessVenderFieldChildNode;

    // 모바일에서 입력하는 매니저가 있는데 회원정보와 일치를 시켜주러면, 맵핑해주는 컴럼이 필요하다.
    // 실제로 테이블에 영향을 주진 않는다, 별도의 브릿지 테이블로 관리된다.
    @ManyToMany(type => UserManager, userManger => userManger.businessVenderFieldValues, { onDelete: 'CASCADE' })
    userManagers: UserManager[];
}
