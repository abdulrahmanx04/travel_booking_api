import { User } from "../../auth/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Package } from "../../package/entity/package.entity";

enum status {
    PENDING= 'pending',
    COMPLETED= 'completed',
    CANCELLED= 'cancelled'
}
@Entity('booking')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    customerName: string

    @Column()
    destination: string
    
    @Column()
    travelDate: Date

    @Column({type: 'int', default: 1})
    guestCount: number

    @Column({ 
        type: 'enum',
        enum: status,
        default: status.PENDING
    })
    status: string

    @Column('decimal', {precision: 10, scale: 2})
    price: number

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({name: 'userId'})
    user: User

    @Column()
    userId: string

    @ManyToOne(() => Package, (pkg) => pkg.bookings)
    @JoinColumn({name: 'packageId'})
    package: Package

    @Column()
    packageId: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date

}