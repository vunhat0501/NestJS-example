import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService,
        private config: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        // generate password hash
        const hash = await argon.hash(dto.password);

        // save the new user in the db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            }); 
    
            // return the save user
            return this.signToken(user.id, user.email);
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken'
                    );
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // find email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        // if user doesn't exist, throw exception
        if (!user) 
            throw new ForbiddenException(
                'Credentials incorrect'
            );

        // compare password
        const pwMatches = await argon.verify(
            user.hash, 
            dto.password
        )
        // if password incorrect, throw exception
        if (!pwMatches)
            throw new ForbiddenException(
                'Credentials incorrect'
            );

        // send back the user
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId: number, 
        email: string
    ): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(
            payload,
            {
                secret,
                expiresIn: '1h'
            },
        );

        return {
            access_token: token
        }
    }
}