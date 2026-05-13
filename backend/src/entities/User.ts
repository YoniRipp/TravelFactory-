import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { VacationRequest } from "./VacationRequest";

export enum UserRole {
  Requester = "Requester",
  Validator = "Validator",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "enum", enum: UserRole })
  role!: UserRole;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => VacationRequest, (req) => req.user)
  vacationRequests!: VacationRequest[];
}
