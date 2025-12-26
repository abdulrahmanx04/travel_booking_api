import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FilterOperator, paginate, PaginateQuery } from "nestjs-paginate";
import { User } from "src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { AdminUpdateUserDto } from "./admin-users.dto";

@Injectable()
export class AdminUserService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async getAll(query: PaginateQuery) {
        const queryBuilder= this.userRepository.createQueryBuilder('user')
            .select([
                'user.id',
                'user.name',
                'user.role',
                'user.email',
                'user.avatar',
                'user.createdAt',
            ])
            
        const users= await paginate(query,queryBuilder,{
            sortableColumns: ['createdAt','role','name'],
            searchableColumns: ['name','email'],
            filterableColumns: {
                isVerified: [FilterOperator.EQ],
                name: [FilterOperator.CONTAINS],
                role: [FilterOperator.EQ],
            },
            defaultLimit: 10,
            maxLimit: 100,
            defaultSortBy: [['createdAt', 'DESC']]
        })    
        return {
            success: true,
            data: users.data,
            meta: users.meta            
        }
    }

    async getOne(id: string) {
        const user= await this.userRepository.findOneOrFail({
            where: {
                id
            },
            relations: ['bookings']
        })

        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
                bookings: user.bookings
            }
        }

    }
    async updateOne(id: string, dto: AdminUpdateUserDto) {
        if(!Object.values(dto).some(value => value !== undefined && value !== null)) {
            throw new BadRequestException('Nothing to update')
        }

        const user= await this.userRepository.findOneOrFail({
            where: {
                id
            },
            relations: ['bookings']
        })

        this.userRepository.merge(user,dto)

        await this.userRepository.save(user)
        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
                bookings: user.bookings
            }
        }
    }

    


}