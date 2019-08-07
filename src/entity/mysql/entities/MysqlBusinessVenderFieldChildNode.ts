import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BusinessVenderField } from './MysqlBusinessVenderField';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';

@Entity()
export class BusinessVenderFieldChildNode extends Base {
    @Column('varchar')
    text: string;

    @Column('tinyint', { default: 0 })
    sort: number;

    @ManyToOne(type => BusinessVenderField, businessVenderField => businessVenderField.businessVenderFieldChildNodes, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    businessVenderField: BusinessVenderField;

    /**
     * field의 타입이 셀렉트 박스 일경우 여러 자식 데이터를 가질 수 있는데 그 데이터를 기준으로 벤더의 카테고리를 결정하기 때문에
     * 이 테이블과 연결이 필요하다.
     * @type {BusinessVenderFieldValue[]}
     * @memberof businessVenderFieldValues
     */
    @OneToMany(type => BusinessVenderFieldValue, businessVenderFieldValue => businessVenderFieldValue.idx)
    businessVenderFieldValues: BusinessVenderFieldValue[];
}
