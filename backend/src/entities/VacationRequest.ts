import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum RequestStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

@Entity("vacation_requests")
export class VacationRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ type: "enum", enum: RequestStatus, default: RequestStatus.Pending })
  status!: RequestStatus;

  @Column({ type: "text", nullable: true })
  comments!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.vacationRequests, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
