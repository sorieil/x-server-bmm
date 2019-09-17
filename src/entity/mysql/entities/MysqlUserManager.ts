import { Base } from './MysqlBase';
import { Entity, Column, ManyToMany, OneToOne, ManyToOne, JoinColumn, JoinTable } from 'typeorm';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';
import { User } from './MysqlUser';
import { BusinessVender } from './MysqlBusinessVender';

/**
 * 관리자 페이지에서 추가한 담당자와 매칭을 하기 위해서는 담당자의 이름을 앱에서 입력을 한다면,
 * 담당자를 검색 해오고, 그 담당자의 정보와 유저와 매칭을 해야 하기 때문에 BusinessFieldValue
 * 값을 가져다가 여기에다가 매칭을 넣어준다.
 */
@Entity()
export default class UserManager extends Base {
    @ManyToOne(type => User, user => user.userManagers, { onDelete: 'CASCADE' })
    user: User;

    @ManyToMany(type => BusinessVenderFieldValue, businessVenderFieldValue => businessVenderFieldValue.userManagers)
    @JoinTable()
    businessVenderFieldValues: BusinessVenderFieldValue[];

    // 여기에서.... 밴더 별로 맴버를 가져와야 하기 때문에...
    @ManyToOne(type => BusinessVender)
    businessVender: BusinessVender;
}
