import { Entity, PrimaryGeneratedColumn,Column, OneToMany, ManyToOne, JoinColumn} from "typeorm";
import {User} from '../../auth/entities/user.entity'
import { Booking } from "../../booking/entities/booking.entity";
import { PackageMedia } from "./package-media.entity";


@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string;

  @Column()
  destination: string;

  @Column('decimal', { precision: 10, scale: 2})
  price: number;

  @Column()
  duration: number;

  @Column('text')
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.packages, {
    onDelete: 'SET NULL'
  })
  @JoinColumn({name: 'userId'})
  user: User

  @OneToMany(() => Booking, (b) => b.package)
  bookings: Booking[]

  @OneToMany(() => PackageMedia,(p) => p.package)
  files: PackageMedia[]

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
  updatedAt: Date
}