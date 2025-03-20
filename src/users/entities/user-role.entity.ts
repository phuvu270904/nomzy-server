import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('users_roles')
export class UserRoleEntity {
  @Column()
  userId: number;

  @Column()
  roleId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;
}
