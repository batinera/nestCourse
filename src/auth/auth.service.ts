import { ForbiddenException, Injectable, UseInterceptors } from "@nestjs/common";
import { AuthDto } from "src/dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    // signup logic
    async signup(dto: AuthDto) {
        // generate the password hash
        const hash = await argon.hash(dto.password)

        // save the new user in the db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    firstName: true,
                    lastName: true
                }
            })
            // return the saved user
            return user
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken')
                }
            }
        }
    }

    //signin logic
    async signin(dto: AuthDto) {

        // find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            },
        })

        // if user does not exist throw exception
        if (!user) throw new ForbiddenException('User not exists, check the email')

        // compare password

        const pwMatches = argon.verify(user.hash, dto.password)

        // if password incorrect throw exception
        if (!pwMatches) throw new ForbiddenException('Credentials incorrect')

        // send back the user
        delete user.hash
        return user
    }

}