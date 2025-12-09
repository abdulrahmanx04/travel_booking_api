import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Package } from "./package.entity";


@Entity('PackageMedia')
export class PackageMedia {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    fileUrl: string

    @Column()
    fileType: string

    @Column()
    public_id: string

    @ManyToOne(() => Package, (p) => p.files, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'packageId'})
    package: Package

    @Column()
    packageId: string

}